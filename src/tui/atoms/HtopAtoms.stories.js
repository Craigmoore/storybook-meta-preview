import { tuiStory } from '../story.js';
import {
  HC,
  drawCpuBar, drawMemBar, drawProcessRow, drawProcessHeader,
  fmtBytes,
} from '../htopComponents.js';

export default { title: 'TUI/Atoms/Htop' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ── CPU Bar ───────────────────────────────────────────────────────────────────

export const CpuBar = {
  args: {
    cols: 120, rows: 8,
    barWidth: 100,
    user: 45, sys: 12, nice: 0, io: 3,
  },
  argTypes: {
    cols:     { control: 'number' },
    rows:     { control: 'number' },
    barWidth: range(30, 170),
    user:     range(0, 100),
    sys:      range(0, 100),
    nice:     range(0, 100),
    io:       range(0, 100),
  },
  render: ({ cols, rows, barWidth, user, sys, nice, io }) =>
    tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor(rows / 2);
      drawCpuBar(grid, 2, y, barWidth, '1', { user, sys, nice, io });

      // Legend
      const ly = y + 2;
      grid.put(2, ly, '|', HC.BAR_USER, HC.BG); grid.text(4, ly, 'user', HC.DIM, HC.BG);
      grid.put(12, ly, '|', HC.BAR_SYS,  HC.BG); grid.text(14, ly, 'kernel', HC.DIM, HC.BG);
      grid.put(24, ly, '|', HC.BAR_NICE, HC.BG); grid.text(26, ly, 'nice', HC.DIM, HC.BG);
      grid.put(34, ly, '|', HC.BAR_IO,   HC.BG); grid.text(36, ly, 'iowait', HC.DIM, HC.BG);
    }),
};

// ── Memory Bar ────────────────────────────────────────────────────────────────

export const MemBar = {
  args: {
    cols: 120, rows: 8,
    barWidth: 100,
    memUsedGB: 5.67, memBuffersGB: 1.2, memCachedGB: 3.1, memTotalGB: 15.5,
  },
  argTypes: {
    cols:         { control: 'number' },
    rows:         { control: 'number' },
    barWidth:     range(30, 170),
    memUsedGB:    range(0, 64, 0.1),
    memBuffersGB: range(0, 8, 0.1),
    memCachedGB:  range(0, 16, 0.1),
    memTotalGB:   range(1, 128, 0.5),
  },
  render: ({ cols, rows, barWidth, memUsedGB, memBuffersGB, memCachedGB, memTotalGB }) => {
    const GB = 1073741824;
    return tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor(rows / 2) - 1;
      drawMemBar(grid, 2, y, barWidth, 'Mem', {
        used:    memUsedGB    * GB,
        buffers: memBuffersGB * GB,
        cached:  memCachedGB  * GB,
      }, memTotalGB * GB);

      // Legend
      const ly = y + 2;
      grid.put(2, ly, '|', HC.MEM_USED,  HC.BG); grid.text(4, ly, 'used', HC.DIM, HC.BG);
      grid.put(12, ly, '|', HC.MEM_BUF,  HC.BG); grid.text(14, ly, 'buffers', HC.DIM, HC.BG);
      grid.put(25, ly, '|', HC.MEM_CACHE, HC.BG); grid.text(27, ly, 'cache', HC.DIM, HC.BG);
    });
  },
};

// ── Process Row ───────────────────────────────────────────────────────────────

export const ProcessRow = {
  args: {
    cols: 170, rows: 8,
    pid: 22451, user: 'shoseki',
    pri: 20, ni: 0,
    virtGB: 4.4, resGB: 1.2, shrMB: 234,
    s: 'S', cpu: 45.2, mem: 7.7,
    cmd: '/usr/lib/chromium/chromium --type=renderer --enable-crashpad',
    selected: false,
  },
  argTypes: {
    cols:     { control: 'number' },
    rows:     { control: 'number' },
    pid:      { control: 'number' },
    user:     { control: 'text'   },
    pri:      range(-20, 39),
    ni:       range(-20, 19),
    virtGB:   range(0, 32, 0.1),
    resGB:    range(0, 32, 0.01),
    shrMB:    range(0, 2048),
    s:        { control: { type: 'select', options: ['R','S','D','Z','T'] } },
    cpu:      range(0, 100, 0.1),
    mem:      range(0, 100, 0.1),
    cmd:      { control: 'text' },
    selected: { control: 'boolean' },
  },
  render: ({ cols, rows, pid, user, pri, ni, virtGB, resGB, shrMB, s, cpu, mem, cmd, selected }) => {
    const GB = 1073741824, MB = 1048576;
    return tuiStory({ cols, rows }, (grid) => {
      const y = Math.floor(rows / 2);
      drawProcessHeader(grid, 0, y - 1, cols, 'cpu');
      drawProcessRow(grid, 0, y, cols, {
        pid, user, pri, ni,
        virt: fmtBytes(virtGB * GB),
        res:  fmtBytes(resGB  * GB),
        shr:  fmtBytes(shrMB  * MB),
        s, cpu, mem, time: ' 4:12.34', cmd,
      }, selected);
    });
  },
};
