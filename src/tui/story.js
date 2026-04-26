import * as ROT from 'rot-js';

export class Grid {
  constructor(cols, rows) {
    this.cols   = cols;
    this.rows   = rows;
    this._cells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ char: ' ', fg: '#ffffff', bg: '#000000' })),
    );
  }

  put(col, row, char, fg = '#ffffff', bg = '#000000') {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this._cells[row][col] = { char, fg, bg };
    }
  }

  fill(col, row, width, height, char, fg = '#ffffff', bg = '#000000') {
    for (let y = row; y < row + height; y++) {
      for (let x = col; x < col + width; x++) {
        this.put(x, y, char, fg, bg);
      }
    }
  }

  text(col, row, str, fg = '#ffffff', bg = '#000000') {
    for (let i = 0; i < str.length; i++) {
      this.put(col + i, row, str[i], fg, bg);
    }
  }

  clear() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this._cells[y][x] = { char: ' ', fg: '#ffffff', bg: '#000000' };
      }
    }
  }

  get(col, row) {
    return this._cells[row]?.[col] ?? { char: ' ', fg: '#ffffff', bg: '#000000' };
  }

  toJSON() {
    return { cols: this.cols, rows: this.rows, cells: this._cells };
  }
}

let display = null;

export function tuiStory({ cols, rows }, renderFn) {
  // Dispose previous display
  if (display) {
    const prev = display.getContainer();
    if (prev?.parentNode) prev.parentNode.removeChild(prev);
    display = null;
  }

  const grid = new Grid(cols, rows);
  renderFn(grid);

  window.__metaPreviewTUI = grid.toJSON();

  display = new ROT.Display({
    width:      cols,
    height:     rows,
    fontSize:   14,
    fontFamily: 'Terminus, "Terminus (TTF)", monospace',
    bg:         '#000000',
    fg:         '#ffffff',
    spacing:    1,
  });

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid.get(x, y);
      display.draw(x, y, cell.char, cell.fg, cell.bg);
    }
  }

  return display.getContainer();
}
