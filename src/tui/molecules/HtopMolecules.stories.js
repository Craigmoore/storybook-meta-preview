import { tuiStory } from '../story.js';
import {
  HC,
  drawCpuGrid, drawMemoryPanel, drawTaskSummary,
  drawProcessList, generateProcesses,
} from '../htopComponents.js';

export default { title: 'TUI/Molecules/Htop' };

const range = (min, max, step = 1) => ({ control: { type: 'range', min, max, step } });

// ── CPU Grid ──────────────────────────────────────────────────────────────────

export const CpuGrid = {
  args: { cols: 170, rows: 12, cpuCount: 8, seed: 42 },
  argTypes: {
    cols:     { control: 'number' },
    rows:     { control: 'number' },
    cpuCount: range(2, 32, 2),
    seed:     range(0, 999),
  },
  render: ({ cols, rows, cpuCount, seed }) => {
    let s = seed >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s >>> 0) / 0xffffffff; };
    const cpus = Array.from({ length: cpuCount }, (_, i) => {
      const user = rand() * 80;
      const sys  = rand() * 20;
      const nice = rand() * 5;
      const io   = rand() * 8;
      return { label: String(i + 1), breakdown: { user, sys, nice, io } };
    });
    return tuiStory({ cols, rows }, (grid) => {
      drawCpuGrid(grid, 0, 0, cols, cpus);
    });
  },
};

// ── Memory Panel ──────────────────────────────────────────────────────────────

export const MemoryPanel = {
  args: {
    cols: 170, rows: 8,
    memUsedGB: 5.67, memBuffersGB: 1.2, memCachedGB: 3.1, memTotalGB: 15.5,
    swapUsedGB: 0.5, swapTotalGB: 8.0,
  },
  argTypes: {
    cols:         { control: 'number' }, rows:       { control: 'number' },
    memUsedGB:    range(0, 64, 0.1),    memTotalGB:   range(1, 256, 0.5),
    memBuffersGB: range(0, 8, 0.1),     memCachedGB:  range(0, 32, 0.1),
    swapUsedGB:   range(0, 32, 0.1),    swapTotalGB:  range(0, 64, 0.5),
  },
  render: ({ cols, rows, memUsedGB, memBuffersGB, memCachedGB, memTotalGB, swapUsedGB, swapTotalGB }) => {
    const GB = 1073741824;
    const mem  = { used: memUsedGB * GB, buffers: memBuffersGB * GB, cached: memCachedGB * GB, total: memTotalGB * GB };
    const swap = { used: swapUsedGB * GB, buffers: 0, cached: 0, total: swapTotalGB * GB };
    return tuiStory({ cols, rows }, (grid) => {
      drawMemoryPanel(grid, 0, Math.floor(rows / 2) - 1, cols, mem, swap);
    });
  },
};

// ── Task Summary ──────────────────────────────────────────────────────────────

export const TaskSummary = {
  args: {
    cols: 170, rows: 6,
    tasks: 312, threads: 892, running: 1,
    load1: 2.45, load5: 1.89, load15: 1.54,
    uptime: '3 days, 04:23:17',
  },
  argTypes: {
    cols:    { control: 'number' }, rows:    { control: 'number' },
    tasks:   { control: 'number' }, threads: { control: 'number' },
    running: range(0, 8),
    load1:   range(0, 32, 0.01),   load5:   range(0, 32, 0.01),
    load15:  range(0, 32, 0.01),
    uptime:  { control: 'text' },
  },
  render: ({ cols, rows, tasks, threads, running, load1, load5, load15, uptime }) =>
    tuiStory({ cols, rows }, (grid) => {
      drawTaskSummary(grid, 0, Math.floor(rows / 2), {
        tasks, threads, running,
        loadAvg: [load1, load5, load15],
        uptime,
      });
    }),
};

// ── Process Table ─────────────────────────────────────────────────────────────

export const ProcessTable = {
  args: { cols: 170, rows: 20, seed: 42, count: 18, sortKey: 'cpu' },
  argTypes: {
    cols:    { control: 'number' },
    rows:    { control: 'number' },
    seed:    range(0, 999),
    count:   range(5, 50),
    sortKey: { control: { type: 'select', options: ['cpu', 'mem', 'pid', 'time', 'user'] } },
  },
  render: ({ cols, rows, seed, count, sortKey }) => {
    const procs = generateProcesses(count, seed);
    return tuiStory({ cols, rows }, (grid) => {
      drawProcessList(grid, 0, 0, cols, rows, procs, sortKey, 0);
    });
  },
};
