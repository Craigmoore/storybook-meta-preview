import { tuiStory } from '../story.js';

export default { title: 'TUI/Organisms/Shell' };

const BG     = '#000000';
const FG     = '#aaaaaa';
const DIM    = '#555555';
const WHITE  = '#ffffff';
const GREEN  = '#55ff55';
const BLUE   = '#6688ff';
const CYAN   = '#44cccc';
const RED    = '#ff5555';
const YELLOW = '#ffcc44';
const BORDER = '#444444';

// Write coloured segments to a grid row, clipped at maxX
function seg(grid, gx, gy, maxX, parts) {
  let cx = gx;
  for (const [t, fg, bg = BG] of parts) {
    for (let i = 0; i < t.length && cx < maxX; i++, cx++) {
      grid.put(cx, gy, t[i], fg, bg);
    }
    if (cx >= maxX) break;
  }
}

export const TmuxLayout = {
  args:     { cols: 170, rows: 47 },
  argTypes: { cols: { control: 'number' }, rows: { control: 'number' } },
  render: ({ cols, rows }) => tuiStory({ cols, rows }, (grid) => {
    const sRow = rows - 1;                   // status bar row
    const pH   = rows - 1;                   // pane area height (rows 0..pH-1)
    const dC   = Math.floor(cols * 0.54);    // vertical divider column
    const hD   = Math.floor(pH   * 0.52);    // horizontal divider row

    const lW  = dC;           // left pane: cols 0..dC-1
    const rX  = dC + 1;       // right panes start column
    const rW  = cols - rX;    // right pane width
    const tH  = hD;           // top-right pane height: rows 0..tH-1
    const bY  = hD + 1;       // bottom-right pane start row
    const bH  = pH - hD - 1;  // bottom-right pane height

    grid.fill(0, 0, cols, rows, ' ', FG, BG);

    // ── Left pane: bash shell ─────────────────────────────────────────────────

    const bashLines = [
      [[ ['user', GREEN], ['@debian', GREEN], [':', FG], ['~', BLUE], ['$ ', FG], ['ls -la', WHITE] ]],
      [[ ['total 64', FG] ]],
      [[ ['drwxr-xr-x  9 user user  4096 ', DIM], ['Apr 26 14:30 ', DIM], ['.', BLUE] ]],
      [[ ['drwxr-xr-x 18 user user  4096 ', DIM], ['Apr 15 09:22 ', DIM], ['..', BLUE] ]],
      [[ ['-rw-r--r--  1 user user   220 ', DIM], ['Apr 15 09:22 ', DIM], ['.bash_logout', FG] ]],
      [[ ['-rw-r--r--  1 user user  3526 ', DIM], ['Apr 15 09:22 ', DIM], ['.bashrc', FG] ]],
      [[ ['-rw-r--r--  1 user user   807 ', DIM], ['Apr 15 09:22 ', DIM], ['.profile', FG] ]],
      [[ ['drwxr-xr-x  4 user user  4096 ', DIM], ['Apr 20 14:12 ', DIM], ['dev', BLUE] ]],
      [[ ['drwxr-xr-x  2 user user  4096 ', DIM], ['Apr 20 11:15 ', DIM], ['Documents', BLUE] ]],
      [[ ['drwxr-xr-x  2 user user  4096 ', DIM], ['Apr 20 11:15 ', DIM], ['Downloads', BLUE] ]],
      [[ ['drwxr-xr-x  2 user user  4096 ', DIM], ['Apr 15 09:22 ', DIM], ['Music', BLUE] ]],
      [[ ['drwxr-xr-x  2 user user  4096 ', DIM], ['Apr 15 09:22 ', DIM], ['Pictures', BLUE] ]],
      [[ ['drwxr-xr-x  2 user user  4096 ', DIM], ['Apr 15 09:22 ', DIM], ['Videos', BLUE] ]],
      [[]],
      [[ ['user', GREEN], ['@debian', GREEN], [':', FG], ['~/dev/storybook-meta-preview', BLUE], ['$ ', FG], ['node src/relay.js', WHITE] ]],
      [[ ['Relay (HTTP) → ', DIM], ['http://localhost:3340', CYAN] ]],
      [[ ['  Meta Preview → ', DIM], ['http://localhost:3340/meta-preview-tui.html', CYAN] ]],
      [[]],
      [[ ['user', GREEN], ['@debian', GREEN], [':', FG], ['~/dev/storybook-meta-preview', BLUE], ['$ ', FG], ['█', GREEN] ]],
    ];

    for (let y = 0; y < bashLines.length && y < pH; y++) {
      if (bashLines[y][0].length) seg(grid, 0, y, lW, bashLines[y][0]);
    }

    // ── Top-right pane: vim ───────────────────────────────────────────────────

    const KW  = '#ff6e67';  // keyword
    const STR = '#5af78e';  // string / path
    const CMT = '#43a5d5';  // comment
    const CLS = '#f4f99d';  // class/type name
    const NUM = '#ffb86c';  // number

    const codeLines = [
      [[ [' 1 ', DIM], ['import ', KW], ['* as ', FG], ['ROT ', CLS], ['from ', KW], ["'rot-js'", STR], [';', FG] ]],
      [[ [' 2 ', DIM] ]],
      [[ [' 3 ', DIM], ['export ', KW], ['class ', KW], ['Grid ', CLS], ['{', FG] ]],
      [[ [' 4 ', DIM], ['  constructor', FG], ['(cols, rows) {', FG] ]],
      [[ [' 5 ', DIM], ['    this', KW], ['.cols   = cols;', FG] ]],
      [[ [' 6 ', DIM], ['    this', KW], ['.rows   = rows;', FG] ]],
      [[ [' 7 ', DIM], ['    this', KW], ['._cells = ', FG], ['Array', CLS], ['.from({ length: rows }, () =>', FG] ]],
      [[ [' 8 ', DIM], ['      Array', CLS], ['.from({ length: cols }, () =>', FG] ]],
      [[ [' 9 ', DIM], ['        ({ char: ', FG], ["' '", STR], [', fg: ', FG], ["'#fff'", STR], [', bg: ', FG], ["'#000'", STR], [' }),', FG] ]],
      [[ ['10 ', DIM], ['      ),', FG] ]],
      [[ ['11 ', DIM], ['    );', FG] ]],
      [[ ['12 ', DIM], ['  }', FG] ]],
      [[ ['13 ', DIM] ]],
      [[ ['14 ', DIM], ['  put', FG], ['(col, row, char, fg, bg) {', FG] ]],
      [[ ['15 ', DIM], ['    if (col >= ', FG], ['0', NUM], [' && col < this.cols &&', FG] ]],
      [[ ['16 ', DIM], ['        row >= ', FG], ['0', NUM], [' && row < this.rows)', FG] ]],
      [[ ['17 ', DIM], ['      this', KW], ['._cells[row][col] = { char, fg, bg };', FG] ]],
      [[ ['18 ', DIM], ['  }', FG] ]],
      [[ ['19 ', DIM] ]],
    ];

    // Code rows
    for (let y = 0; y < codeLines.length && y < tH - 1; y++) {
      if (codeLines[y][0].length) seg(grid, rX, y, rX + rW, codeLines[y][0]);
    }
    // Tilde lines for empty buffer rows
    for (let y = codeLines.length; y < tH - 1; y++) {
      grid.put(rX, y, '~', DIM, BG);
    }
    // Vim status line
    if (tH - 1 >= 0 && tH - 1 < pH) {
      const vsRow = tH - 1;
      grid.fill(rX, vsRow, rW, 1, ' ', BG, '#5f5f87');
      seg(grid, rX, vsRow, rX + rW, [
        [' NORMAL ', WHITE, '#5f5f87'],
        ['  story.js', WHITE, '#5f5f87'],
        ['                     ', FG, '#5f5f87'],
        ['74,1      Top ', DIM, '#5f5f87'],
      ]);
    }

    // ── Bottom-right pane: git status ─────────────────────────────────────────

    const gitLines = [
      [[ ['user', GREEN], ['@debian', GREEN], [':', FG], ['~/dev/storybook-meta-preview', BLUE], ['$ ', FG], ['git status', WHITE] ]],
      [[ ['On branch ', FG], ['v1', GREEN] ]],
      [[ ['Changes not staged for commit:', RED] ]],
      [[ ['  (use ', DIM], ['"git add <file>..."', FG], [' to update)', DIM] ]],
      [[]],
      [[ ['        ', FG], ['modified:   ', YELLOW], ['public/meta-preview-tui.html', FG] ]],
      [[ ['        ', FG], ['modified:   ', YELLOW], ['src/tui/ansi.js', FG] ]],
      [[ ['        ', FG], ['modified:   ', YELLOW], ['src/tui/organisms/Layouts.stories.js', FG] ]],
      [[]],
      [[ ['no changes added to commit ', DIM], ['(use "git add")', DIM] ]],
      [[]],
      [[ ['user', GREEN], ['@debian', GREEN], [':', FG], ['~/dev/storybook-meta-preview', BLUE], ['$ ', FG], ['█', GREEN] ]],
    ];

    for (let y = 0; y < gitLines.length && y < bH; y++) {
      if (gitLines[y][0] && gitLines[y][0].length) seg(grid, rX, bY + y, rX + rW, gitLines[y][0]);
    }

    // ── Pane dividers ─────────────────────────────────────────────────────────

    for (let y = 0; y < pH; y++) {
      grid.put(dC, y, y === hD ? '┼' : '│', BORDER, BG); // ┼ : │
    }
    for (let x = rX; x < cols; x++) {
      grid.put(x, hD, '─', BORDER, BG); // ─
    }

    // ── Status bar ────────────────────────────────────────────────────────────

    const SGN  = '#008800';  // session/inactive green
    const AGN  = '#00cc00';  // active window green
    const SBG  = '#1c1c1c';  // status bar background

    grid.fill(0, sRow, cols, 1, ' ', FG, SBG);

    seg(grid, 0, sRow, cols, [
      ['[', SGN, SBG], ['dev', GREEN, SBG], [']', SGN, SBG],
      ['  ', FG, SBG],
      [' 0', DIM, SBG], [':', DIM, SBG], ['bash', FG, SBG], ['*', AGN, SBG],
      ['   1', DIM, SBG], [':', DIM, SBG], ['vim ', FG, SBG],
      ['   2', DIM, SBG], [':', DIM, SBG], ['git ', FG, SBG],
    ]);

    const rStatus = 'debian   14:32  26-Apr-26 ';
    grid.text(cols - rStatus.length, sRow, rStatus, SGN, SBG);
  }),
};
