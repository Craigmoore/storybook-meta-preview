// Standalone Tetris for Altspace — deliberately NOT part of the generic
// meta-preview-altspace-inject.js pipeline. That script rebuilds a panel
// from a single relay-pushed snapshot per Storybook story selection, which
// can't drive a continuously-animating, keyboard-controlled game. This file
// instead builds the whole board with the live BS API and runs its own game
// loop directly in-world — no relay, no WebSocket, no Storybook involved.
// Game rules mirror src/altspace-ui/organisms/Tetris.stories.js exactly;
// only the element-construction and redraw strategy differ, tailored to the
// real (higher-latency) BS bridge instead of the free DOM used by the mock.
//
// Usage:
//   <script position="0 1.5 2" rotation="0 0 0" scale="1 1 1"
//           src="https://YOUR_DEV_IP:33430/meta-preview-altspace-tetris-inject.js"></script>
//
// Optional attributes (all numeric, all have defaults matching the
// Storybook story): cols, rows, cellsize, dropms, startlevel.
//
// Controls: buttons on the panel's right-hand sidebar (Rotate left/right,
// Drop, Restart — real UIButton, so these work regardless of the key-press
// mapping below), plus BS scene-level "key-press" events for movement. The
// exact BS.KeyCode string values are UNVERIFIED against a real client (no
// live Altspace access from where this was written) — every action below
// matches several plausible spellings defensively, and every key-press is
// logged to the console as `[tetris] key-press: <value>`. If keyboard
// controls don't respond, check that log for the real value and tell me so
// the KEY_MAP below can be corrected.
//   Left/Right - move   Down - soft drop   Up - rotate right
//   Space - hard drop   P - pause   R - restart

(function () {
  const tag = document.currentScript;

  function parseVec3(attr, dx, dy, dz) {
    const parts = (tag.getAttribute(attr) || '').trim().split(/\s+/).map(Number);
    return {
      x: isNaN(parts[0]) ? dx : parts[0],
      y: isNaN(parts[1]) ? dy : parts[1],
      z: isNaN(parts[2]) ? dz : parts[2],
    };
  }
  function parseIntAttr(name, dflt) {
    const v = parseInt(tag.getAttribute(name), 10);
    return Number.isFinite(v) ? v : dflt;
  }

  const position = parseVec3('position', 0, 1.5, 2);
  const rotation = parseVec3('rotation', 0, 0, 0);
  const scale    = parseVec3('scale', 1, 1, 1);

  const COLS         = parseIntAttr('cols', 10);
  const ROWS         = parseIntAttr('rows', 18);
  const CELL         = parseIntAttr('cellsize', 16);
  const DROP_MS      = parseIntAttr('dropms', 500);
  const START_LEVEL  = parseIntAttr('startlevel', 1);
  const GAP          = 1;
  const NEXT_SIZE     = 4;
  const EMPTY_COLOR  = '#181b26';
  const LINE_SCORES  = [0, 100, 300, 500, 800];
  const BASE_TICK_MS = 50;

  // ─── Piece definitions — identical to the Storybook story ────────────────

  const PIECE_DEFS = {
    I: { color: '#22d3ee', grid: ['....', '####', '....', '....'] },
    O: { color: '#fbbf24', grid: ['##', '##'] },
    T: { color: '#a855f7', grid: ['.#.', '###', '...'] },
    S: { color: '#4ade80', grid: ['.##', '##.', '...'] },
    Z: { color: '#f87171', grid: ['##.', '.##', '...'] },
    J: { color: '#60a5fa', grid: ['#..', '###', '...'] },
    L: { color: '#fb923c', grid: ['..#', '###', '...'] },
  };

  function toCoords(grid) {
    const coords = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === '#') coords.push([r, c]);
      }
    }
    return coords;
  }

  function rotateGridCW(grid) {
    const n = grid.length;
    const out = Array.from({ length: n }, () => new Array(n).fill('.'));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) out[c][n - 1 - r] = grid[r][c];
    }
    return out.map((row) => row.join(''));
  }

  const SHAPES = {};
  for (const [type, def] of Object.entries(PIECE_DEFS)) {
    const rotations = [];
    let grid = def.grid;
    for (let i = 0; i < 4; i++) {
      rotations.push(toCoords(grid));
      grid = rotateGridCW(grid);
    }
    SHAPES[type] = { color: def.color, size: def.grid.length, rotations };
  }

  // ─── Style sanitisation — same rules as meta-preview-altspace-inject.js ──

  function sanitizeStyles(styles) {
    if (!styles) return {};
    const out = {};
    for (let [k, v] of Object.entries(styles)) {
      if (k === 'gap' || k === 'rowGap' || k === 'columnGap') continue;
      if (k === 'padding' || k === 'margin' || k === 'border') continue;
      if (k === 'wordSpacing') continue;
      if (k.startsWith('unity')) continue;
      out[k] = v;
    }
    return out;
  }

  async function createRoot(panel, styles) {
    const el = panel.CreateVisualElement();
    await el.Async();
    el.SetStyles(sanitizeStyles(styles));
    return el;
  }
  async function createVisualElement(panel, parent, styles) {
    const el = panel.CreateVisualElement(parent);
    await el.Async();
    el.SetStyles(sanitizeStyles(styles));
    return el;
  }
  async function createLabel(panel, parent, styles, text) {
    const el = panel.CreateLabel(undefined, parent);
    await el.Async();
    if (text !== undefined) el.text = text;
    el.SetStyles(sanitizeStyles(styles));
    return el;
  }
  // No explicit width on buttons — flex-stretch fills the sidebar column
  // correctly; UIButton's content-box sizing means an explicit width here
  // would overflow (see docs/setup-bantervr-ui.md's UIButton quirk).
  async function createButton(panel, parent, styles, text, onClick) {
    const el = panel.CreateButton(parent);
    await el.Async();
    if (text !== undefined) el.text = text;
    el.SetStyles(sanitizeStyles(styles));
    el.OnClick(onClick);
    return el;
  }

  async function buildGame(BS, scene) {
    const boardWidth   = COLS * (CELL + GAP);
    const boardHeight   = ROWS * (CELL + GAP);
    const sidebarWidth = Math.max(NEXT_SIZE * (CELL + GAP), 88);
    const contentWidth  = boardWidth + 10 + sidebarWidth;
    const panelWidth    = Math.max(contentWidth + 60, 260);
    // Sidebar can be taller than the board at small rows/cellsize (6 buttons
    // + next-piece preview), so panel height has to fit whichever is taller.
    const SIDEBAR_BUTTON_COUNT = 6;
    const SIDEBAR_BUTTON_BLOCK = 36; // 30px button height + 6px marginBottom
    const sidebarContentHeight = 19 + NEXT_SIZE * (CELL + GAP) + 10 + SIDEBAR_BUTTON_COUNT * SIDEBAR_BUTTON_BLOCK;
    const panelHeight = Math.max(boardHeight, sidebarContentHeight) + 140;

    const obj = new BS.GameObject({
      name:             'Tetris',
      localPosition:    new BS.Vector3(position.x, position.y, position.z),
      localEulerAngles: new BS.Vector3(rotation.x, rotation.y, rotation.z),
      localScale:       new BS.Vector3(scale.x, scale.y, scale.z),
    });

    console.log('[tetris] building board…');
    const panel = await obj.AddComponent(new BS.BanterUI(new BS.Vector2(panelWidth, panelHeight), false));

    const root = await createRoot(panel, {
      width: '100%', height: '100%', backgroundColor: '#10121c',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '10px', paddingRight: '10px', paddingBottom: '10px', paddingLeft: '10px',
    });

    await createLabel(panel, root, {
      fontSize: '18px', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0)', marginBottom: '6px',
    }, 'TETRIS');

    const statsRow = await createVisualElement(panel, root, {
      display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
      width: `${contentWidth}px`, marginBottom: '8px',
    });
    const statLabelStyle = { fontSize: '12px', color: '#9ca3af', backgroundColor: 'rgba(0,0,0,0)' };
    const scoreLabel = await createLabel(panel, statsRow, statLabelStyle, 'Score: 0');
    const linesLabel = await createLabel(panel, statsRow, statLabelStyle, 'Lines: 0');
    const levelLabel = await createLabel(panel, statsRow, statLabelStyle, `Level: ${START_LEVEL}`);

    const mainRow = await createVisualElement(panel, root, { display: 'flex', flexDirection: 'row' });

    const boardEl = await createVisualElement(panel, mainRow, {
      display: 'flex', flexDirection: 'column', width: `${boardWidth}px`, backgroundColor: '#0b0d14',
      paddingTop: '4px', paddingRight: '4px', paddingBottom: '4px', paddingLeft: '4px',
      marginRight: '10px',
    });

    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      const rowEl = await createVisualElement(panel, boardEl, { display: 'flex', flexDirection: 'row' });
      const rowCells = [];
      for (let c = 0; c < COLS; c++) {
        const cell = await createVisualElement(panel, rowEl, {
          width: `${CELL}px`, height: `${CELL}px`, backgroundColor: EMPTY_COLOR,
          marginRight: `${GAP}px`, marginBottom: `${GAP}px`,
        });
        rowCells.push(cell);
      }
      cells.push(rowCells);
    }

    // ─── Right-hand sidebar: next-piece preview + control buttons ─────────

    const sidebar = await createVisualElement(panel, mainRow, {
      display: 'flex', flexDirection: 'column', width: `${sidebarWidth}px`,
    });

    await createLabel(panel, sidebar, {
      fontSize: '11px', color: '#9ca3af', backgroundColor: 'rgba(0,0,0,0)', marginBottom: '4px',
    }, 'NEXT');

    const nextPreviewEl = await createVisualElement(panel, sidebar, {
      display: 'flex', flexDirection: 'column',
      width: `${NEXT_SIZE * (CELL + GAP)}px`, backgroundColor: '#0b0d14', marginBottom: '10px',
    });
    const nextCells = [];
    for (let r = 0; r < NEXT_SIZE; r++) {
      const rowEl = await createVisualElement(panel, nextPreviewEl, { display: 'flex', flexDirection: 'row' });
      const rowCells = [];
      for (let c = 0; c < NEXT_SIZE; c++) {
        const cell = await createVisualElement(panel, rowEl, {
          width: `${CELL}px`, height: `${CELL}px`, backgroundColor: EMPTY_COLOR,
          marginRight: `${GAP}px`, marginBottom: `${GAP}px`,
        });
        rowCells.push(cell);
      }
      nextCells.push(rowCells);
    }

    const buttonStyle = { fontSize: '11px', color: '#ffffff', height: '30px', marginBottom: '6px' };
    await createButton(panel, sidebar, buttonStyle, '← Left',    () => onAction('left'));
    await createButton(panel, sidebar, buttonStyle, '→ Right',   () => onAction('right'));
    await createButton(panel, sidebar, buttonStyle, '⟲ Rotate',  () => onAction('rotateLeft'));
    await createButton(panel, sidebar, buttonStyle, '⟳ Rotate',  () => onAction('rotateRight'));
    await createButton(panel, sidebar, buttonStyle, '⬇ Drop',    () => onAction('harddrop'));
    await createButton(panel, sidebar, buttonStyle, '↺ Restart', () => onAction('restart'));

    const statusLabel = await createLabel(
      panel, root, { fontSize: '13px', color: '#fbbf24', backgroundColor: 'rgba(0,0,0,0)', marginBottom: '4px' }, ''
    );
    await createLabel(
      panel, root, { fontSize: '9px', color: '#6b7280', backgroundColor: 'rgba(0,0,0,0)' },
      'move / soft-drop with keyboard, or use the buttons'
    );
    console.log('[tetris] ready');

    // ─── Game state + rules — identical to the Storybook story ────────────

    let board, piece, nextType, score, lines, level, dropInterval, paused, gameOver;
    let prevPieceCells = [];

    function emptyBoard() {
      return Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
    }

    function pickRandomType() {
      const types = Object.keys(SHAPES);
      return types[Math.floor(Math.random() * types.length)];
    }

    function canPlaceAt(rot, row, col) {
      for (const [r, c] of SHAPES[piece.type].rotations[rot]) {
        const br = row + r, bc = col + c;
        if (bc < 0 || bc >= COLS || br >= ROWS) return false;
        if (br >= 0 && board[br][bc]) return false;
      }
      return true;
    }

    function spawnPiece() {
      const type = nextType || pickRandomType();
      nextType   = pickRandomType();
      const size = SHAPES[type].size;
      piece = { type, rot: 0, row: 0, col: Math.floor((COLS - size) / 2) };
      if (!canPlaceAt(piece.rot, piece.row, piece.col)) gameOver = true;
      redrawNextPreview();
    }

    function tryMove(dRow, dCol) {
      if (canPlaceAt(piece.rot, piece.row + dRow, piece.col + dCol)) {
        piece.row += dRow;
        piece.col += dCol;
        redrawPiece();
        return true;
      }
      return false;
    }

    function tryRotate(dir) {
      const newRot = (piece.rot + dir + 4) % 4;
      for (const kick of [0, -1, 1, -2, 2]) {
        if (canPlaceAt(newRot, piece.row, piece.col + kick)) {
          piece.rot = newRot;
          piece.col += kick;
          redrawPiece();
          return;
        }
      }
    }

    function clearLines() {
      let cleared = 0;
      board = board.filter((row) => {
        const full = row.every((cell) => cell);
        if (full) cleared++;
        return !full;
      });
      while (board.length < ROWS) board.unshift(new Array(COLS).fill(null));

      if (cleared > 0) {
        score += LINE_SCORES[cleared] * level;
        lines += cleared;
        const newLevel = Math.floor(lines / 10) + START_LEVEL;
        if (newLevel > level) {
          level = newLevel;
          dropInterval = Math.max(120, DROP_MS - (level - 1) * 40);
        }
      }
    }

    function lockPiece() {
      for (const [r, c] of SHAPES[piece.type].rotations[piece.rot]) {
        const br = piece.row + r, bc = piece.col + c;
        if (br >= 0) board[br][bc] = SHAPES[piece.type].color;
      }
      clearLines();
      spawnPiece();
      redrawBoardFull();
      updateLabels();
    }

    function softDrop() {
      if (tryMove(1, 0)) { score += 1; updateLabels(); }
      else lockPiece();
    }

    function hardDrop() {
      let dist = 0;
      while (tryMove(1, 0)) dist++;
      score += dist * 2;
      lockPiece();
    }

    function tick() {
      if (!tryMove(1, 0)) lockPiece();
    }

    // Only touches the ~4-8 cells that actually changed (old + new piece
    // position), instead of rewriting all COLS*ROWS cells on every move —
    // each SetStyle call round-trips over the JS<->Unity bridge, which is
    // far more expensive than a DOM mutation, so this matters here in a way
    // it doesn't in the Storybook mock.
    function redrawPiece() {
      for (const [r, c] of prevPieceCells) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          cells[r][c].SetStyle('backgroundColor', board[r][c] || EMPTY_COLOR);
        }
      }
      prevPieceCells = [];
      if (gameOver) return;
      for (const [dr, dc] of SHAPES[piece.type].rotations[piece.rot]) {
        const br = piece.row + dr, bc = piece.col + dc;
        if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
          cells[br][bc].SetStyle('backgroundColor', SHAPES[piece.type].color);
          prevPieceCells.push([br, bc]);
        }
      }
    }

    // Used after locking/line-clears, where many board cells change at once.
    function redrawBoardFull() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          cells[r][c].SetStyle('backgroundColor', board[r][c] || EMPTY_COLOR);
        }
      }
      prevPieceCells = [];
      redrawPiece();
    }

    function redrawNextPreview() {
      const def    = SHAPES[nextType];
      const offset = Math.floor((NEXT_SIZE - def.size) / 2);
      const filled = new Set(def.rotations[0].map(([r, c]) => `${r + offset},${c + offset}`));
      for (let r = 0; r < NEXT_SIZE; r++) {
        for (let c = 0; c < NEXT_SIZE; c++) {
          nextCells[r][c].SetStyle('backgroundColor', filled.has(`${r},${c}`) ? def.color : EMPTY_COLOR);
        }
      }
    }

    function updateLabels() {
      scoreLabel.text = `Score: ${score}`;
      linesLabel.text = `Lines: ${lines}`;
      levelLabel.text = `Level: ${level}`;
      statusLabel.text = gameOver ? 'GAME OVER - press Restart' : paused ? 'PAUSED' : '';
    }

    function restart() {
      board        = emptyBoard();
      nextType     = undefined;
      score        = 0;
      lines        = 0;
      level        = START_LEVEL;
      dropInterval = Math.max(120, DROP_MS - (level - 1) * 40);
      paused       = false;
      gameOver     = false;
      spawnPiece();
      redrawBoardFull();
      updateLabels();
    }

    // ─── Input (buttons + scene key-press share this) + game loop ─────────

    const KEY_MAP = {
      left:        ['LeftArrow', 'ArrowLeft', 'Left'],
      right:       ['RightArrow', 'ArrowRight', 'Right'],
      down:        ['DownArrow', 'ArrowDown', 'Down'],
      rotateRight: ['UpArrow', 'ArrowUp', 'Up'],
      harddrop:    ['Space', ' '],
      pause:       ['P', 'p'],
      restart:     ['R', 'r'],
    };

    function onAction(action) {
      if (gameOver) { if (action === 'restart') restart(); return; }
      if (action === 'pause')   { paused = !paused; updateLabels(); return; }
      if (action === 'restart') { restart(); return; }
      if (paused) return;
      switch (action) {
        case 'left':        tryMove(0, -1); break;
        case 'right':       tryMove(0, 1);  break;
        case 'down':        softDrop();     break;
        case 'rotateLeft':  tryRotate(-1);  break;
        case 'rotateRight': tryRotate(1);   break;
        case 'harddrop':    hardDrop();     break;
      }
    }

    scene.On('key-press', (e) => {
      const key = e.detail && e.detail.key;
      console.log('[tetris] key-press:', key);
      for (const [action, names] of Object.entries(KEY_MAP)) {
        if (names.includes(key)) { onAction(action); return; }
      }
    });

    restart();

    let acc = 0;
    setInterval(() => {
      if (paused || gameOver) return;
      acc += BASE_TICK_MS;
      if (acc >= dropInterval) { acc = 0; tick(); }
    }, BASE_TICK_MS);
  }

  window.addEventListener('bs-loaded', function () {
    const scene = BS.BanterScene.GetInstance();
    scene.On('unity-loaded', () => {
      buildGame(BS, scene).catch((err) => console.error('[tetris] build failed:', err));
    });
  });
})();
