import { altspaceUiStory } from '../story.js';
import { makeLabel, makeButton } from '../atoms/components.js';
import { makeGrid } from '../molecules/components.js';

export default { title: 'Altspace-UI/Organisms/BlockDrop' };

const range  = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

const NEXT_SIZE = 4;

// ─── Piece geometry ──────────────────────────────────────────────────────────
// Each piece is authored as its 0°-rotation grid; the other three rotations
// are derived by rotating the grid 90° clockwise, so there's no hand-typed
// coordinate table to get wrong. Colour is deliberately NOT baked in here —
// it's a per-render Storybook control (see argTypes below), so the shape
// table only needs to be built once at module load.

const PIECE_GRIDS = {
  I: ['....', '####', '....', '....'],
  O: ['##', '##'],
  T: ['.#.', '###', '...'],
  S: ['.##', '##.', '...'],
  Z: ['##.', '.##', '...'],
  J: ['#..', '###', '...'],
  L: ['..#', '###', '...'],
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

const SHAPE_ROTATIONS = {};
for (const [type, grid0] of Object.entries(PIECE_GRIDS)) {
  const rotations = [];
  let grid = grid0;
  for (let i = 0; i < 4; i++) {
    rotations.push(toCoords(grid));
    grid = rotateGridCW(grid);
  }
  SHAPE_ROTATIONS[type] = { size: grid0.length, rotations };
}

const LINE_SCORES = [0, 100, 300, 500, 800];

// Colour-to-shape defaults deliberately do NOT match the well-known
// falling-block genre's official shape-to-colour assignment (I=cyan,
// O=yellow, T=purple, S=green, Z=red, J=blue, L=orange) — every shape below
// defaults to a different one of the same seven hues, to stay clear of that
// trade dress. All of them, plus the
// empty-cell colour, are exposed as controls so the whole palette is
// genuinely configurable, not just hard-coded past this default.
const DEFAULT_COLORS = {
  I: '#fb923c', O: '#a855f7', T: '#22d3ee', S: '#60a5fa',
  Z: '#4ade80', J: '#f87171', L: '#fbbf24',
};

// ─── Block Drop (playable) ───────────────────────────────────────────────────

export const BlockDrop = {
  args: {
    cellSize: 16, gap: 2, dropIntervalMs: 500, cols: 10, rows: 18, startLevel: 1,
    emptyColor: '#181b26',
    colorI: DEFAULT_COLORS.I, colorO: DEFAULT_COLORS.O, colorT: DEFAULT_COLORS.T,
    colorS: DEFAULT_COLORS.S, colorZ: DEFAULT_COLORS.Z, colorJ: DEFAULT_COLORS.J,
    colorL: DEFAULT_COLORS.L,
  },
  argTypes: {
    cellSize:       range(10, 24, 1),
    // Default bumped from a hardcoded 1px: on a world-space Altspace panel,
    // a 1px gap can round to 0 or 1 physical pixel inconsistently per cell
    // (confirmed live in-world — some cells showed a gap, some didn't, with
    // identical code, never reproducible in the browser mock). 2px is far
    // enough from that rounding boundary to render consistently; exposed as
    // a control rather than just bumping the constant, since it's genuinely
    // something worth tuning per cellSize/panel scale.
    gap:            range(1, 6, 1),
    dropIntervalMs: range(150, 1000, 50),
    cols:           range(6, 14, 1),
    rows:           range(10, 24, 1),
    startLevel:     range(1, 10, 1),
    emptyColor:     { control: 'color' },
    colorI:         { control: 'color' },
    colorO:         { control: 'color' },
    colorT:         { control: 'color' },
    colorS:         { control: 'color' },
    colorZ:         { control: 'color' },
    colorJ:         { control: 'color' },
    colorL:         { control: 'color' },
  },
  // Every arg change causes Storybook to call this render() again from
  // scratch, so any control change (board size, speed, or any of the eight
  // colours) naturally resets the game with the new values applied — there's
  // no separate "apply settings" step, changing a control IS the reset.
  render: ({
    cellSize, gap, dropIntervalMs, cols, rows, startLevel, emptyColor,
    colorI, colorO, colorT, colorS, colorZ, colorJ, colorL,
  }) => altspaceUiStory((scene, BS) => {
    const COLS = cols;
    const ROWS = rows;
    const EMPTY_COLOR = emptyColor;

    const pieceColors = { I: colorI, O: colorO, T: colorT, S: colorS, Z: colorZ, J: colorJ, L: colorL };
    const SHAPES = {};
    for (const [type, shape] of Object.entries(SHAPE_ROTATIONS)) {
      SHAPES[type] = { ...shape, color: pieceColors[type] };
    }

    // A BanterUIPanel's resolution is fixed at construction and can never
    // resize to fit content afterward, so every label that contributes to
    // the height budget below gets an explicit height (applied to the
    // actual element further down) rather than being left to auto-size from
    // its font — auto-sized labels are a guess Unity might measure
    // differently, and any mismatch under a tight budget shows up as
    // visible squishing (confirmed live in-world twice: once on a label
    // that changed from empty to populated, once on the next-piece preview
    // simply from the sidebar's total being a few px tighter than assumed).
    // Naming these once and reusing them in both the budget math and the
    // elements themselves means they can't drift apart again.
    const TITLE_HEIGHT       = 24;
    const STATS_HEIGHT       = 16;
    const NEXT_LABEL_HEIGHT  = 14;
    const STATUS_HEIGHT      = 16;
    const HINT_HEIGHT        = 12;
    const BUTTON_HEIGHT      = 30;

    const boardWidth   = COLS * (cellSize + gap);
    const boardHeight   = ROWS * (cellSize + gap);
    const sidebarWidth = Math.max(NEXT_SIZE * (cellSize + gap), 88);
    const contentWidth  = boardWidth + 10 + sidebarWidth;
    const panelWidth    = Math.max(contentWidth + 60, 260);
    // Sidebar can be taller than the board at small rows/cellSize (6 buttons
    // + next-piece preview), so panel height has to fit whichever is taller.
    const SIDEBAR_BUTTON_COUNT = 6;
    const SIDEBAR_BUTTON_BLOCK = BUTTON_HEIGHT + 6; // + marginBottom
    const sidebarContentHeight =
      NEXT_LABEL_HEIGHT + 4 + NEXT_SIZE * (cellSize + gap) + 10 + SIDEBAR_BUTTON_COUNT * SIDEBAR_BUTTON_BLOCK;
    const chromeHeight =
      20 /* root padding */ + TITLE_HEIGHT + 6 + STATS_HEIGHT + 8 + 8 /* boardEl padding */
      + STATUS_HEIGHT + 4 + HINT_HEIGHT
      + 20 /* safety margin for anything still not accounted for exactly */;
    const panelHeight = Math.max(boardHeight, sidebarContentHeight) + chromeHeight;

    const obj       = new BS.GameObject({ name: 'BlockDrop' });
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

    const title = makeLabel(BS, 'BLOCK DROP', { fontSize: 18, color: '#ffffff' });
    title.style.height       = `${TITLE_HEIGHT}px`;
    title.style.marginBottom = '6px';
    panel.root.AppendChild(title);

    const statsRow = new BS.UIVisualElement();
    statsRow.style.display        = 'flex';
    statsRow.style.flexDirection  = 'row';
    statsRow.style.justifyContent = 'space-between';
    statsRow.style.width          = `${contentWidth}px`;
    statsRow.style.marginBottom   = '8px';
    panel.root.AppendChild(statsRow);

    const statLabelStyle = { fontSize: 12, color: '#9ca3af' };
    const scoreLabel = makeLabel(BS, 'Score: 0', statLabelStyle);
    const linesLabel = makeLabel(BS, 'Lines: 0', statLabelStyle);
    const levelLabel = makeLabel(BS, `Level: ${startLevel}`, statLabelStyle);
    for (const l of [scoreLabel, linesLabel, levelLabel]) l.style.height = `${STATS_HEIGHT}px`;
    statsRow.AppendChild(scoreLabel);
    statsRow.AppendChild(linesLabel);
    statsRow.AppendChild(levelLabel);

    const mainRow = new BS.UIVisualElement();
    mainRow.style.display       = 'flex';
    mainRow.style.flexDirection = 'row';
    panel.root.AppendChild(mainRow);

    // ─── Board — Molecules/Grid, framed with a background/padding wrapper ──

    const boardEl = new BS.UIVisualElement();
    boardEl.style.display         = 'flex';
    boardEl.style.flexDirection   = 'column';
    boardEl.style.backgroundColor = '#0b0d14';
    boardEl.style.paddingTop      = '4px';
    boardEl.style.paddingRight    = '4px';
    boardEl.style.paddingBottom   = '4px';
    boardEl.style.paddingLeft     = '4px';
    boardEl.style.marginRight     = '10px';
    mainRow.AppendChild(boardEl);

    const { el: boardGridEl, cells } = makeGrid(BS, {
      rows: ROWS, cols: COLS, cellSize, gap, getColor: () => EMPTY_COLOR,
    });
    boardEl.AppendChild(boardGridEl);

    // ─── Right-hand sidebar: next-piece preview (Molecules/Grid) + buttons ─

    const sidebar = new BS.UIVisualElement();
    sidebar.style.display       = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.width         = `${sidebarWidth}px`;
    mainRow.AppendChild(sidebar);

    const nextLabel = makeLabel(BS, 'NEXT', { fontSize: 11, color: '#9ca3af' });
    nextLabel.style.height       = `${NEXT_LABEL_HEIGHT}px`;
    nextLabel.style.marginBottom = '4px';
    sidebar.AppendChild(nextLabel);

    // Explicit height, not just left to size from its child grid — flex
    // items shrink under space pressure by default, and this was the
    // element observed absorbing that squeeze in-world (see the height
    // budget comment above `boardWidth` for why the budget can be tight).
    const nextPreviewWrapper = new BS.UIVisualElement();
    nextPreviewWrapper.style.height          = `${NEXT_SIZE * (cellSize + gap)}px`;
    nextPreviewWrapper.style.backgroundColor = '#0b0d14';
    nextPreviewWrapper.style.marginBottom    = '10px';
    sidebar.AppendChild(nextPreviewWrapper);

    const { el: nextGridEl, cells: nextCells } = makeGrid(BS, {
      rows: NEXT_SIZE, cols: NEXT_SIZE, cellSize, gap, getColor: () => EMPTY_COLOR,
    });
    nextPreviewWrapper.AppendChild(nextGridEl);

    // No explicit width on buttons — flex-stretch fills the sidebar column
    // correctly; UIButton's content-box sizing means an explicit width here
    // would overflow (see docs/setup-bantervr-ui.md's UIButton quirk).
    function addSidebarButton(label, action) {
      const btn = makeButton(BS, label, () => onAction(action), { fontSize: 11 });
      btn.style.height       = `${BUTTON_HEIGHT}px`;
      btn.style.marginBottom = '6px';
      sidebar.AppendChild(btn);
      return btn;
    }
    addSidebarButton('← Left',    'left');
    addSidebarButton('→ Right',   'right');
    addSidebarButton('↺ Rotate', 'rotateLeft');
    addSidebarButton('↻ Rotate', 'rotateRight');
    addSidebarButton('⬇ Drop',   'harddrop');
    addSidebarButton('Restart',  'restart');

    // Explicit height (not just left to intrinsic content sizing) — this
    // label starts empty and only gets text later via updateLabels(), and a
    // panel's resolution is fixed at construction time. If the label's real
    // layout height differs between "empty" and "has text", the panel was
    // sized for the wrong one and everything else gets squeezed to
    // compensate once GAME OVER/PAUSED text appears. A fixed height makes
    // its footprint constant regardless of content.
    const statusLabel = makeLabel(BS, '', { fontSize: 13, color: '#fbbf24' });
    statusLabel.style.height       = `${STATUS_HEIGHT}px`;
    statusLabel.style.marginBottom = '4px';
    panel.root.AppendChild(statusLabel);

    const hintLabel = makeLabel(BS, '←→ move  ↓ soft-drop  ↑ rotate  — or use the buttons →', { fontSize: 9, color: '#6b7280' });
    hintLabel.style.height = `${HINT_HEIGHT}px`;
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
  }, { skipGenericInject: true }),
  // skipGenericInject: BlockDrop has its own dedicated in-world script
  // (meta-preview-altspace-blockdrop-inject.js) with its own spawn/despawn
  // lifecycle. Without this, selecting this story would ALSO make the
  // generic meta-preview-altspace-inject.js build a second, non-interactive
  // static snapshot alongside the real, playable one — confirmed live
  // in-world (two panels, one active, one not). See story.js.
};
