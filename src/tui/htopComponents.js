// Shared drawing primitives for htop-style system monitor layouts.

export const HC = {
  BG:        '#000000',
  FG:        '#c0c0c0',
  DIM:       '#606060',
  WHITE:     '#ffffff',
  HDRBG:     '#005f00',   // dark green header
  HDRFG:     '#ffffff',
  BAR_USER:  '#00aa00',   // user space
  BAR_SYS:   '#aa0000',   // kernel
  BAR_NICE:  '#0000aa',   // nice
  BAR_IO:    '#aaaa00',   // iowait
  MEM_USED:  '#0000cc',   // used memory
  MEM_BUF:   '#004444',   // buffers
  MEM_CACHE: '#886600',   // cache
  SWAP_USED: '#880088',   // swap
  SEL_BG:    '#000088',   // selected row
  GREEN:     '#00aa00',
  YELLOW:    '#aaaa00',
  RED:       '#aa0000',
  CYAN:      '#00aaaa',
  MAGENTA:   '#aa00aa',
  BLUE:      '#4488ff',
  SEP:       '#333333',
};

export function fmtBytes(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + 'G';
  if (bytes >= 1048576)    return Math.round(bytes / 1048576) + 'M';
  if (bytes >= 1024)       return Math.round(bytes / 1024) + 'K';
  return String(bytes);
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

// Single CPU bar — totalW is the full display width including label and brackets
// breakdown = { user, sys, nice, io } percentages (0–100, sum ≤ 100)
export function drawCpuBar(grid, x, y, totalW, label, breakdown) {
  const labelPart = label.padStart(3) + ' ';
  const barW = totalW - labelPart.length - 2;

  grid.text(x, y, labelPart, HC.CYAN, HC.BG);
  grid.put(x + labelPart.length, y, '[', HC.DIM, HC.BG);

  const { user = 0, sys = 0, nice = 0, io = 0 } = breakdown;
  const total = Math.min(100, user + sys + nice + io);

  const userC  = Math.round(user  / 100 * barW);
  const sysC   = Math.min(Math.round(sys   / 100 * barW), barW - userC);
  const niceC  = Math.min(Math.round(nice  / 100 * barW), barW - userC - sysC);
  const ioC    = Math.min(Math.round(io    / 100 * barW), barW - userC - sysC - niceC);
  const filled = userC + sysC + niceC + ioC;

  let bx = x + labelPart.length + 1;
  for (let i = 0; i < userC;  i++) grid.put(bx++, y, '|', HC.BAR_USER, HC.BG);
  for (let i = 0; i < sysC;   i++) grid.put(bx++, y, '|', HC.BAR_SYS,  HC.BG);
  for (let i = 0; i < niceC;  i++) grid.put(bx++, y, '|', HC.BAR_NICE, HC.BG);
  for (let i = 0; i < ioC;    i++) grid.put(bx++, y, '|', HC.BAR_IO,   HC.BG);
  for (let i = filled; i < barW; i++) grid.put(bx++, y, ' ', HC.BG, HC.BG);

  grid.put(x + labelPart.length + 1 + barW, y, ']', HC.DIM, HC.BG);

  const pctStr = total.toFixed(1) + '%';
  grid.text(x + labelPart.length + 1 + barW - pctStr.length, y, pctStr, HC.WHITE, HC.BG);
}

// Memory / swap bar
// breakdown = { used, buffers, cached } in bytes; total in bytes
export function drawMemBar(grid, x, y, totalW, label, breakdown, total) {
  const labelPart = label.padEnd(4);
  const barW = totalW - labelPart.length - 2;

  grid.text(x, y, labelPart, HC.CYAN, HC.BG);
  grid.put(x + labelPart.length, y, '[', HC.DIM, HC.BG);

  const { used = 0, buffers = 0, cached = 0 } = breakdown;
  const isSwap  = label.trim() === 'Swp';
  const usedC   = Math.round(used    / total * barW);
  const bufC    = Math.min(Math.round(buffers / total * barW), barW - usedC);
  const cacheC  = Math.min(Math.round(cached  / total * barW), barW - usedC - bufC);
  const filled  = usedC + bufC + cacheC;

  let bx = x + labelPart.length + 1;
  for (let i = 0; i < usedC;  i++) grid.put(bx++, y, '|', isSwap ? HC.SWAP_USED : HC.MEM_USED, HC.BG);
  for (let i = 0; i < bufC;   i++) grid.put(bx++, y, '|', HC.MEM_BUF,   HC.BG);
  for (let i = 0; i < cacheC; i++) grid.put(bx++, y, '|', HC.MEM_CACHE, HC.BG);
  for (let i = filled; i < barW; i++) grid.put(bx++, y, ' ', HC.BG, HC.BG);

  grid.put(x + labelPart.length + 1 + barW, y, ']', HC.DIM, HC.BG);

  const memStr = fmtBytes(used + buffers + cached) + '/' + fmtBytes(total);
  grid.text(x + labelPart.length + 1 + barW - memStr.length, y, memStr, HC.WHITE, HC.BG);
}

// Process column definitions (shared between header and rows)
export const PROC_COLS = [
  { key: 'pid',  label: 'PID',     w: 6,  align: 'r' },
  { key: 'user', label: 'USER',    w: 9,  align: 'l' },
  { key: 'pri',  label: 'PRI',     w: 3,  align: 'r' },
  { key: 'ni',   label: 'NI',      w: 3,  align: 'r' },
  { key: 'virt', label: 'VIRT',    w: 6,  align: 'r' },
  { key: 'res',  label: 'RES',     w: 6,  align: 'r' },
  { key: 'shr',  label: 'SHR',     w: 6,  align: 'r' },
  { key: 's',    label: 'S',       w: 1,  align: 'l' },
  { key: 'cpu',  label: 'CPU%',    w: 5,  align: 'r' },
  { key: 'mem',  label: 'MEM%',    w: 5,  align: 'r' },
  { key: 'time', label: 'TIME+',   w: 9,  align: 'r' },
  { key: 'cmd',  label: 'Command', w: -1, align: 'l' },
];

// Column header row — sortKey highlights the active sort column
export function drawProcessHeader(grid, x, y, totalW, sortKey) {
  grid.fill(x, y, totalW, 1, ' ', HC.HDRFG, HC.HDRBG);
  let cx = x;
  for (const col of PROC_COLS) {
    const w       = col.w === -1 ? totalW - (cx - x) : col.w;
    const isSort  = col.key === sortKey;
    const fg      = isSort ? HC.BG     : HC.HDRFG;
    const bg      = isSort ? '#ffaa00' : HC.HDRBG;
    const label   = col.align === 'r' ? col.label.padStart(w) : col.label.padEnd(w);
    grid.text(cx, y, label.substring(0, w), fg, bg);
    cx += w + 1;
    if (cx >= x + totalW) break;
  }
}

// Single process row
// proc = { pid, user, pri, ni, virt, res, shr, s, cpu, mem, time, cmd, kernel? }
export function drawProcessRow(grid, x, y, totalW, proc, selected) {
  const rowBg = selected ? HC.SEL_BG : HC.BG;
  grid.fill(x, y, totalW, 1, ' ', HC.FG, rowBg);

  const cpuFg = proc.cpu > 70 ? HC.RED : proc.cpu > 40 ? HC.YELLOW : HC.GREEN;
  const cmdFg = proc.kernel   ? HC.BLUE : HC.FG;

  let cx = x;
  const put = (val, w, align, fg = HC.FG) => {
    const s      = String(val);
    const padded = align === 'r' ? s.padStart(w) : s.padEnd(w);
    grid.text(cx, y, padded.substring(0, w), fg, rowBg);
    cx += w + 1;
  };

  put(proc.pid,              6, 'r');
  put(proc.user,             9, 'l', HC.GREEN);
  put(proc.pri,              3, 'r', proc.pri < 0  ? HC.RED    : HC.FG);
  put(proc.ni,               3, 'r', proc.ni !== 0 ? HC.YELLOW : HC.FG);
  put(proc.virt,             6, 'r');
  put(proc.res,              6, 'r');
  put(proc.shr,              6, 'r', HC.DIM);
  put(proc.s,                1, 'l', proc.s === 'R' ? HC.GREEN : HC.DIM);
  put(proc.cpu.toFixed(1),   5, 'r', cpuFg);
  put(proc.mem.toFixed(1),   5, 'r');
  put(proc.time,             9, 'r', HC.DIM);
  const cmdW = Math.max(0, totalW - (cx - x));
  grid.text(cx, y, proc.cmd.substring(0, cmdW), cmdFg, rowBg);
}

// ── Molecules ─────────────────────────────────────────────────────────────────

// All CPUs in a 2-column grid — cpus = [{ label, breakdown }]
export function drawCpuGrid(grid, x, y, totalW, cpus) {
  const halfW = Math.floor((totalW - 4) / 2);
  const colB  = x + halfW + 4;
  const left  = cpus.filter((_, i) => i % 2 === 0);
  const right = cpus.filter((_, i) => i % 2 === 1);
  for (let r = 0; r < Math.max(left.length, right.length); r++) {
    if (left[r])  drawCpuBar(grid, x,    y + r, halfW, left[r].label,  left[r].breakdown);
    if (right[r]) drawCpuBar(grid, colB, y + r, halfW, right[r].label, right[r].breakdown);
  }
}

// Mem + Swap panel — each is { used, buffers, cached, total } in bytes
export function drawMemoryPanel(grid, x, y, totalW, mem, swap) {
  drawMemBar(grid, x, y,     totalW, 'Mem', mem,  mem.total);
  drawMemBar(grid, x, y + 1, totalW, 'Swp', swap, swap.total);
}

// Task summary line
export function drawTaskSummary(grid, x, y, { tasks, threads, running, loadAvg, uptime }) {
  const la = loadAvg.map(l => l.toFixed(2)).join(' ');
  let cx = x;
  const put = (t, fg) => { grid.text(cx, y, t, fg, HC.BG); cx += t.length; };
  put('Tasks: ', HC.CYAN);
  put(String(tasks), HC.WHITE);
  put(', ' + threads + ' thr', HC.DIM);
  put(', ', HC.DIM);
  put(String(running) + ' running', HC.GREEN);
  put('   Load average: ', HC.CYAN);
  put(la, HC.WHITE);
  put('   Uptime: ', HC.CYAN);
  put(uptime, HC.WHITE);
}

// Process list with sticky header
export function drawProcessList(grid, x, y, totalW, h, processes, sortKey, selectedIdx = 0) {
  drawProcessHeader(grid, x, y, totalW, sortKey);
  for (let i = 0; i < h - 1 && i < processes.length; i++) {
    drawProcessRow(grid, x, y + 1 + i, totalW, processes[i], i === selectedIdx);
  }
}

// ── Process data generator ────────────────────────────────────────────────────

const USERS = ['root', 'shoseki', 'www-data', 'systemd+', 'messagebus', 'syslog', 'postgres'];
const CMDS  = [
  '/usr/lib/chromium/chromium --type=renderer --enable-crashpad --disable-features=SpareRendererForSitePerProcess',
  '/usr/bin/node /home/shoseki/.nvm/versions/node/v20.11.0/bin/storybook dev -c .storybook-tui -p 6009',
  '/usr/bin/Xorg :0 -seat seat0 -auth /var/run/lightdm/root/:0 -nolisten tcp vt7 -novtswitch',
  'sshd: shoseki@pts/0',
  '/usr/lib/systemd/systemd --user',
  'nginx: worker process',
  '/usr/bin/postgres -D /var/lib/postgresql/14/main -c config_file=/etc/postgresql/14/main/postgresql.conf',
  '/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock',
  '/usr/bin/python3 /usr/lib/update-notifier/update-motd-updates-available',
  'bash',
  '/usr/bin/vim src/tui/bloombergComponents.js',
  '/usr/sbin/NetworkManager --no-daemon',
  '/usr/lib/bluetooth/bluetoothd',
  '/usr/bin/pulseaudio --start --log-target=syslog',
  'java -server -Xms512m -Xmx2g -jar /opt/elasticsearch/lib/elasticsearch-8.12.jar',
  '/usr/bin/redis-server 127.0.0.1:6379',
  'htop',
  'top -b -d 5',
  '/usr/bin/tmux new-session -s dev',
];

export function generateProcesses(count, seed) {
  let s = seed >>> 0;
  const rand = (max = 1) => { s = (s * 1664525 + 1013904223) >>> 0; return (s >>> 0) / 0xffffffff * max; };

  return Array.from({ length: count }, (_, idx) => {
    const isKernel = rand() < 0.12;
    const cpu  = isKernel ? 0 : rand() * 95;
    const mem  = isKernel ? 0 : rand() * 18;
    const virt = isKernel ? 0 : rand() * 6 * 1073741824;
    const res  = isKernel ? 0 : virt * (0.05 + rand() * 0.3);
    const shr  = isKernel ? 0 : res  * rand() * 0.4;
    const mins = Math.floor(rand(1440));
    const secs = rand(60);
    const cs   = rand(100);
    const pid  = 1000 + Math.floor(rand(40000));

    const cmd = isKernel
      ? `[kworker/${Math.floor(rand(8))}:${Math.floor(rand(4))}-${['events','mm_percpu_wq','rcu_gp'][Math.floor(rand(3))]}]`
      : CMDS[Math.floor(rand(CMDS.length))];

    return {
      pid,
      user:   isKernel ? 'root' : USERS[Math.floor(rand(USERS.length))],
      pri:    isKernel ? -20 : Math.floor(rand(30)) - 5,
      ni:     isKernel ? 0   : Math.floor(rand(10)) % 3 === 0 ? Math.floor(rand(19)) + 1 : 0,
      virt:   isKernel ? '0' : fmtBytes(virt),
      res:    isKernel ? '0' : fmtBytes(res),
      shr:    isKernel ? '0' : fmtBytes(shr),
      s:      isKernel ? 'S' : ['S','S','S','R','D','Z'][Math.floor(rand(6))],
      cpu:    parseFloat(cpu.toFixed(1)),
      mem:    parseFloat(mem.toFixed(1)),
      time:   `${String(mins).padStart(4)}:${String(Math.floor(secs)).padStart(2,'0')}.${String(Math.floor(cs)).padStart(2,'0')}`,
      cmd,
      kernel: isKernel,
    };
  }).sort((a, b) => b.cpu - a.cpu);
}
