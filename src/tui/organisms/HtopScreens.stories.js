import { tuiStory } from '../story.js';
import {
  HC,
  drawCpuGrid, drawMemoryPanel, drawTaskSummary,
  drawProcessList, generateProcesses,
} from '../htopComponents.js';

export default { title: 'TUI/Organisms/Htop' };

// ── htop — System Monitor ─────────────────────────────────────────────────────

export const SystemMonitor = {
  name: 'System Monitor',
  args: {
    cols: 170, rows: 47,
    seed: 42,
    cpuCount: 8,
    memUsedGB: 5.67, memBuffersGB: 1.2, memCachedGB: 3.1, memTotalGB: 15.5,
    swapUsedGB: 0.51, swapTotalGB: 8.0,
    tasks: 312, threads: 892, running: 1,
    load1: 2.45, load5: 1.89, load15: 1.54,
    sortKey: 'cpu',
  },
  argTypes: {
    cols:         { control: 'number' },
    rows:         { control: 'number' },
    seed:         { control: { type: 'range', min: 0, max: 999 } },
    cpuCount:     { control: { type: 'range', min: 2, max: 32, step: 2 } },
    memUsedGB:    { control: { type: 'range', min: 0, max: 64,  step: 0.1 } },
    memBuffersGB: { control: { type: 'range', min: 0, max: 8,   step: 0.1 } },
    memCachedGB:  { control: { type: 'range', min: 0, max: 32,  step: 0.1 } },
    memTotalGB:   { control: { type: 'range', min: 1, max: 256, step: 0.5 } },
    swapUsedGB:   { control: { type: 'range', min: 0, max: 32,  step: 0.1 } },
    swapTotalGB:  { control: { type: 'range', min: 0, max: 64,  step: 0.5 } },
    tasks:        { control: 'number' },
    threads:      { control: 'number' },
    running:      { control: { type: 'range', min: 0, max: 16 } },
    load1:        { control: { type: 'range', min: 0, max: 32, step: 0.01 } },
    load5:        { control: { type: 'range', min: 0, max: 32, step: 0.01 } },
    load15:       { control: { type: 'range', min: 0, max: 32, step: 0.01 } },
    sortKey:      { control: { type: 'select', options: ['cpu','mem','pid','time','user','virt','res'] } },
  },
  render: ({
    cols, rows, seed, cpuCount,
    memUsedGB, memBuffersGB, memCachedGB, memTotalGB,
    swapUsedGB, swapTotalGB,
    tasks, threads, running, load1, load5, load15,
    sortKey,
  }) => {
    const GB = 1073741824;

    // Generate CPU load values from seed
    let s = seed >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s >>> 0) / 0xffffffff; };
    const cpus = Array.from({ length: cpuCount }, (_, i) => {
      const user = rand() * 80;
      const sys  = rand() * 20;
      const nice = rand() * 3;
      const io   = rand() * 6;
      return { label: String(i + 1), breakdown: { user, sys, nice, io } };
    });

    const mem  = { used: memUsedGB * GB, buffers: memBuffersGB * GB, cached: memCachedGB * GB, total: memTotalGB * GB };
    const swap = { used: swapUsedGB * GB, buffers: 0, cached: 0, total: swapTotalGB * GB };

    const cpuRows    = Math.ceil(cpuCount / 2);
    const headerRows = cpuRows + 2 + 1 + 1; // CPUs + mem + swap + summary + blank
    const listStart  = headerRows;
    const listH      = rows - listStart;
    const processes  = generateProcesses(listH - 1, seed);

    return tuiStory({ cols, rows }, (grid) => {
      // ── CPU grid ──
      drawCpuGrid(grid, 0, 0, cols, cpus);

      // ── Mem + Swap ──
      drawMemoryPanel(grid, 0, cpuRows, cols, mem, swap);

      // ── Task summary ──
      drawTaskSummary(grid, 0, cpuRows + 2, {
        tasks, threads, running,
        loadAvg: [load1, load5, load15],
        uptime: '3 days, 04:23:17',
      });

      // ── Blank separator row ──
      grid.fill(0, cpuRows + 3, cols, 1, ' ', HC.BG, HC.BG);

      // ── Process list ──
      drawProcessList(grid, 0, listStart, cols, listH, processes, sortKey, 0);
    });
  },
};
