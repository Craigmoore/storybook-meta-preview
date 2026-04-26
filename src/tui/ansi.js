function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function gridToAnsi({ cols, rows, cells }) {
  // Disable auto-wrap so rows never spill onto the next line
  let out = '\x1b[?7l';
  for (let y = 0; y < rows; y++) {
    out += `\x1b[${y + 1};1H`; // absolute row position, column 1
    for (let x = 0; x < cols; x++) {
      const { char, fg, bg } = cells[y][x];
      const [fr, fg2, fb]  = hexToRgb(fg);
      const [br, bg2, bb]  = hexToRgb(bg);
      out += `\x1b[38;2;${fr};${fg2};${fb}m`;
      out += `\x1b[48;2;${br};${bg2};${bb}m`;
      out += char;
    }
  }
  out += '\x1b[0m';  // reset colours
  out += '\x1b[?7h'; // re-enable auto-wrap
  return out;
}
