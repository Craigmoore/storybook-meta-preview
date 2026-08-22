import { altspaceUiStory } from '../story.js';

export default { title: 'Altspace-UI/Organisms/Tetris' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

const GAP = 1;
const NEXT_SIZE = 4;

// ─── Piece definitions ──────────────────────────────────────────────────────
// Each piece is authored as its 0°-rotation grid; the other three rotations
// are derived by rotating the grid 90° clockwise, so there's no hand-typed
// coordinate table to get wrong.

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

const EMPTY_COLOR = '#181b26';
const LINE_SCORES  = [0, 100, 300, 500, 800];

// ─── Tetris (playable) ──────────────────────────────────────────────────────

export const Tetris = {
  args: { cellSize: 16, dropIntervalMs: 500, cols: 10, rows: 18, startLevel: 1 },
  argTypes: {
    cellSize:       range(10, 24, 1),
    dropIntervalMs: range(150, 1000, 50),
    cols:           range(6, 14, 1),
    rows:           range(10, 24, 1),
    startLevel:     range(1, 10, 1),
  },
  // Every arg change causes Storybook to call this render() again from
  // scratch, so any control change (cols/rows/cellSize/dropIntervalMs/
  // startLevel) naturally resets the game with the new values applied —
  // there's no separate "apply settings" step, changing a control IS the reset.
  render: ({ cellSize, dropIntervalMs, cols, rows, startLevel }) => altspaceUiStory((scene, BS) => {
    const COLS = cols;
    const ROWS = rows;
    const boardWidth   = COLS * (cellSize + GAP);
    const boardHeight   = ROWS * (cellSize + GAP);
    const sidebarWidth = Math.max(NEXT_SIZE * (cellSize + GAP), 88);
    const contentWidth  = boardWidth + 10 + sidebarWidth;
    const panelWidth    = Math.max(contentWidth + 60, 260);
    // Sidebar can be taller than the board at small rows/cellSize (6 buttons
    // + next-piece preview), so panel height has to fit whichever is taller.
    const SIDEBAR_BUTTON_COUNT = 6;
    const SIDEBAR_BUTTON_BLOCK = 36; // 30px button height + 6px marginBottom
    const sidebarContentHeight = 19 + NEXT_SIZE * (cellSize + GAP) + 10 + SIDEBAR_BUTTON_COUNT * SIDEBAR_BUTTON_BLOCK;
    const panelHeight = Math.max(boardHeight, sidebarContentHeight) + 140;

    const obj       = new BS.GameObject({ name: 'Tetris' });
    const wrapperEl = obj._el;
    const panel     = obj.AddComponent(new BS.BanterUIPanel({ resolution: new BS.Vector2(panelWidth, panelHeight) }));

    panel.root.style.backgroundColor = '#10121c';
    panel.root.style.display         = 'flex';
    panel.root.style.flexDirection   = 'column';
    panel.root.style.alignItems      = 'center';
    panel.root.style.paddingTop      = '10px';
    panel.root.style.paddingRight    = '10px';
    panel.root.style.paddingBottom   = '10px';
    panel.root.style.paddingLeft     = '10px';

    const title = new BS.UILabel();
    title.SetProperty(BS.PN.text, 'TETRIS');
    title.style.fontSize        = '18px';
    title.style.color           = '#ffffff';
    title.style.backgroundColor = 'rgba(0,0,0,0)';
    title.style.marginBottom    = '6px';
    panel.root.AppendChild(title);

    const statsRow = new BS.UIVisualElement();
    statsRow.style.display        = 'flex';
    statsRow.style.flexDirection  = 'row';
    statsRow.style.justifyContent = 'space-between';
    statsRow.style.width          = `${contentWidth}px`;
    statsRow.style.marginBottom   = '8px';
    panel.root.AppendChild(statsRow);

    function makeStatLabel() {
      const l = new BS.UILabel();
      l.style.fontSize        = '12px';
      l.style.color           = '#9ca3af';
      l.style.backgroundColor = 'rgba(0,0,0,0)';
      statsRow.AppendChild(l);
      return l;
    }
    const scoreLabel = makeStatLabel();
    const linesLabel = makeStatLabel();
    const levelLabel = makeStatLabel();

    const mainRow = new BS.UIVisualElement();
    mainRow.style.display       = 'flex';
    mainRow.style.flexDirection = 'row';
    panel.root.AppendChild(mainRow);

    const boardEl = new BS.UIVisualElement();
    boardEl.style.display         = 'flex';
    boardEl.style.flexDirection   = 'column';
    boardEl.style.width           = `${boardWidth}px`;
    boardEl.style.backgroundColor = '#0b0d14';
    boardEl.style.paddingTop      = '4px';
    boardEl.style.paddingRight    = '4px';
    boardEl.style.paddingBottom   = '4px';
    boardEl.style.paddingLeft     = '4px';
    boardEl.style.marginRight     = '10px';
    mainRow.AppendChild(boardEl);

    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      const rowEl = new BS.UIVisualElement();
      rowEl.style.display       = 'flex';
      rowEl.style.flexDirection = 'row';
      boardEl.AppendChild(rowEl);

      const rowCells = [];
      for (let c = 0; c < COLS; c++) {
        const cell = new BS.UIVisualElement();
        cell.style.width           = `${cellSize}px`;
        cell.style.height          = `${cellSize}px`;
        cell.style.backgroundColor = EMPTY_COLOR;
        cell.style.marginRight     = `${GAP}px`;
        cell.style.marginBottom    = `${GAP}px`;
        rowEl.AppendChild(cell);
        rowCells.push(cell);
      }
      cells.push(rowCells);
    }

    // ─── Right-hand sidebar: next-piece preview + control buttons ──────────

    const sidebar = new BS.UIVisualElement();
    sidebar.style.display       = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.width         = `${sidebarWidth}px`;
    mainRow.AppendChild(sidebar);

    const nextLabel = new BS.UILabel();
    nextLabel.SetProperty(BS.PN.text, 'NEXT');
    nextLabel.style.fontSize        = '11px';
    nextLabel.style.color           = '#9ca3af';
    nextLabel.style.backgroundColor = 'rgba(0,0,0,0)';
    nextLabel.style.marginBottom    = '4px';
    sidebar.AppendChild(nextLabel);

    const nextPreviewEl = new BS.UIVisualElement();
    nextPreviewEl.style.display         = 'flex';
    nextPreviewEl.style.flexDirection   = 'column';
    nextPreviewEl.style.width           = `${NEXT_SIZE * (cellSize + GAP)}px`;
    nextPreviewEl.style.backgroundColor = '#0b0d14';
    nextPreviewEl.style.marginBottom    = '10px';
    sidebar.AppendChild(nextPreviewEl);

    const nextCells = [];
    for (let r = 0; r < NEXT_SIZE; r++) {
      const rowEl = new BS.UIVisualElement();
      rowEl.style.display       = 'flex';
      rowEl.style.flexDirection = 'row';
      nextPreviewEl.AppendChild(rowEl);

      const rowCells = [];
      for (let c = 0; c < NEXT_SIZE; c++) {
        const cell = new BS.UIVisualElement();
        cell.style.width           = `${cellSize}px`;
        cell.style.height          = `${cellSize}px`;
        cell.style.backgroundColor = EMPTY_COLOR;
        cell.style.marginRight     = `${GAP}px`;
        cell.style.marginBottom    = `${GAP}px`;
        rowEl.AppendChild(cell);
        rowCells.push(cell);
      }
      nextCells.push(rowCells);
    }

    // No explicit width on buttons — flex-stretch fills the sidebar column
    // correctly; UIButton's content-box sizing means an explicit width here
    // would overflow (see docs/setup-bantervr-ui.md's UIButton quirk).
    function makeSidebarButton(label, action) {
      const btn = new BS.UIButton();
      btn.SetProperty(BS.PN.text, label);
      btn.style.fontSize      = '11px';
      btn.style.color         = '#ffffff';
      btn.style.height        = '30px';
      btn.style.marginBottom  = '6px';
      btn.OnClick(() => onAction(action));
      sidebar.AppendChild(btn);
      return btn;
    }
    makeSidebarButton('← Left',   'left');
    makeSidebarButton('→ Right',  'right');
    makeSidebarButton('⟲ Rotate', 'rotateLeft');
    makeSidebarButton('⟳ Rotate', 'rotateRight');
    makeSidebarButton('⬇ Drop',   'harddrop');
    makeSidebarButton('↺ Restart', 'restart');

    const statusLabel = new BS.UILabel();
    statusLabel.style.fontSize        = '13px';
    statusLabel.style.color           = '#fbbf24';
    statusLabel.style.backgroundColor = 'rgba(0,0,0,0)';
    statusLabel.style.marginBottom    = '4px';
    panel.root.AppendChild(statusLabel);

    const hintLabel = new BS.UILabel();
    hintLabel.SetProperty(BS.PN.text, '←→ move  ↓ soft-drop  ↑ rotate  — or use the buttons →');
    hintLabel.style.fontSize        = '9px';
    hintLabel.style.color           = '#6b7280';
    hintLabel.style.backgroundColor = 'rgba(0,0,0,0)';
    panel.root.AppendChild(hintLabel);

    // ─── Game state ────────────────────────────────────────────────────────

    let board, piece, nextType, score, lines, level, dropInterval, paused, gameOver;

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
        redraw();
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
          redraw();
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
        const newLevel = Math.floor(lines / 10) + startLevel;
        if (newLevel > level) {
          level = newLevel;
          dropInterval = Math.max(120, dropIntervalMs - (level - 1) * 40);
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
      redraw();
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

    function redraw() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          cells[r][c].style.backgroundColor = board[r][c] || EMPTY_COLOR;
        }
      }
      if (!gameOver) {
        for (const [r, c] of SHAPES[piece.type].rotations[piece.rot]) {
          const br = piece.row + r, bc = piece.col + c;
          if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
            cells[br][bc].style.backgroundColor = SHAPES[piece.type].color;
          }
        }
      }
    }

    function redrawNextPreview() {
      for (let r = 0; r < NEXT_SIZE; r++) {
        for (let c = 0; c < NEXT_SIZE; c++) nextCells[r][c].style.backgroundColor = EMPTY_COLOR;
      }
      const def    = SHAPES[nextType];
      const offset = Math.floor((NEXT_SIZE - def.size) / 2);
      for (const [r, c] of def.rotations[0]) {
        const rr = r + offset, cc = c + offset;
        if (rr >= 0 && rr < NEXT_SIZE && cc >= 0 && cc < NEXT_SIZE) {
          nextCells[rr][cc].style.backgroundColor = def.color;
        }
      }
    }

    function updateLabels() {
      scoreLabel.SetProperty(BS.PN.text, `Score: ${score}`);
      linesLabel.SetProperty(BS.PN.text, `Lines: ${lines}`);
      levelLabel.SetProperty(BS.PN.text, `Level: ${level}`);
      statusLabel.SetProperty(
        BS.PN.text,
        gameOver ? 'GAME OVER — press R to restart' : paused ? 'PAUSED' : ''
      );
    }

    function restart() {
      board        = emptyBoard();
      nextType     = undefined;
      score        = 0;
      lines        = 0;
      level        = startLevel;
      dropInterval = Math.max(120, dropIntervalMs - (level - 1) * 40);
      paused       = false;
      gameOver     = false;
      spawnPiece();
      redraw();
      updateLabels();
    }

    // ─── Input (keyboard + buttons share this) + game loop ────────────────

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

    const KEY_ACTIONS = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down',
      ArrowUp: 'rotateRight', x: 'rotateRight', X: 'rotateRight',
      z: 'rotateLeft', Z: 'rotateLeft',
      ' ': 'harddrop',
      p: 'pause', P: 'pause',
      r: 'restart', R: 'restart',
    };

    function onKeyDown(e) {
      if (!document.body.contains(wrapperEl)) {
        window.removeEventListener('keydown', onKeyDown);
        return;
      }
      const action = KEY_ACTIONS[e.key];
      if (!action) return;
      if (action === 'harddrop') e.preventDefault();
      onAction(action);
    }
    window.addEventListener('keydown', onKeyDown);

    let lastTime = 0, acc = 0;
    function loop(t) {
      if (!document.body.contains(wrapperEl)) {
        window.removeEventListener('keydown', onKeyDown);
        return;
      }
      if (lastTime && !paused && !gameOver) {
        acc += t - lastTime;
        if (acc >= dropInterval) { acc = 0; tick(); }
      }
      lastTime = t;
      requestAnimationFrame(loop);
    }

    restart();
    requestAnimationFrame(loop);

    return obj;
  }),
};
