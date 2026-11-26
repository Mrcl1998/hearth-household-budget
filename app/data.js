// Hearth Budget — data: the household's figures, stored in the browser.
// One store object in localStorage under "hearth-budget-v1". Every edit the
// site offers writes straight back through save(), so a reload keeps it.

export const STORE_KEY = 'hearth-budget-v1';
export const CURRENT_MONTH = '2026-11';

export const CATEGORY_COLORS = {
  'Belanja dapur': '#2e7d4f',
  'Listrik & air': '#e0a100',
  'Transport': '#2f5d7a',
  'Sekolah anak': '#7a4a9e',
  'Makan di luar': '#c96f3f',
  'Kesehatan': '#a63a2e',
  'Hiburan': '#4a7a5c',
  'Rumah & pakaian': '#8a6d3b',
  'Tabungan': '#1f5138',
  'Lain-lain': '#8a8f8a',
};

const SEED = {
  household: 'Keluarga Hartono',
  month: CURRENT_MONTH,
  income: [
    { id: 'inc-1', name: 'Gaji Andi (ayah)', amount: 9500000 },
    { id: 'inc-2', name: 'Gaji Sari (ibu)', amount: 4200000 },
    { id: 'inc-3', name: 'Freelance desain Sari', amount: 1800000 },
  ],
  plan: [
    { id: 'cat-1', name: 'Belanja dapur', planned: 3200000 },
    { id: 'cat-2', name: 'Listrik & air', planned: 850000 },
    { id: 'cat-3', name: 'Transport', planned: 1200000 },
    { id: 'cat-4', name: 'Sekolah anak', planned: 1500000 },
    { id: 'cat-5', name: 'Makan di luar', planned: 900000 },
    { id: 'cat-6', name: 'Kesehatan', planned: 600000 },
    { id: 'cat-7', name: 'Hiburan', planned: 550000 },
    { id: 'cat-8', name: 'Rumah & pakaian', planned: 700000 },
    { id: 'cat-9', name: 'Tabungan', planned: 2500000 },
    { id: 'cat-10', name: 'Lain-lain', planned: 500000 },
  ],
  transactions: [
    { id: 'tx-01', date: '2026-11-01', desc: 'Gaji Andi masuk', cat: 'Pemasukan', amount: 9500000 },
    { id: 'tx-02', date: '2026-11-01', desc: 'Internet rumah', cat: 'Lain-lain', amount: -350000 },
    { id: 'tx-03', date: '2026-11-02', desc: 'Belanja mingguan pasar', cat: 'Belanja dapur', amount: -412000 },
    { id: 'tx-04', date: '2026-11-03', desc: 'Gaji Sari masuk', cat: 'Pemasukan', amount: 4200000 },
    { id: 'tx-05', date: '2026-11-04', desc: 'Bensin motor', cat: 'Transport', amount: -52000 },
    { id: 'tx-06', date: '2026-11-05', desc: 'SPP sekolah Dimas', cat: 'Sekolah anak', amount: -1500000 },
    { id: 'tx-07', date: '2026-11-06', desc: 'Belanja supermarket', cat: 'Belanja dapur', amount: -638000 },
    { id: 'tx-08', date: '2026-11-08', desc: 'Makan malam keluarga', cat: 'Makan di luar', amount: -285000 },
    { id: 'tx-09', date: '2026-11-09', desc: 'Token listrik 200k', cat: 'Listrik & air', amount: -200000 },
    { id: 'tx-10', date: '2026-11-10', desc: 'Les piano Kirana', cat: 'Sekolah anak', amount: -350000 },
    { id: 'tx-11', date: '2026-11-12', desc: 'Freelance desain Sari', cat: 'Pemasukan', amount: 1800000 },
    { id: 'tx-12', date: '2026-11-13', desc: 'Belanja mingguan pasar', cat: 'Belanja dapur', amount: -389000 },
    { id: 'tx-13', date: '2026-11-14', desc: 'Kontrol gigi Dimas', cat: 'Kesehatan', amount: -275000 },
    { id: 'tx-14', date: '2026-11-15', desc: 'Langganan streaming', cat: 'Hiburan', amount: -120000 },
    { id: 'tx-15', date: '2026-11-17', desc: 'Bensin mobil', cat: 'Transport', amount: -300000 },
    { id: 'tx-16', date: '2026-11-18', desc: 'Belanja supermarket', cat: 'Belanja dapur', amount: -524000 },
    { id: 'tx-17', date: '2026-11-19', desc: 'Seragam sekolah Kirana', cat: 'Rumah & pakaian', amount: -310000 },
    { id: 'tx-18', date: '2026-11-20', desc: 'Pindah ke tabungan', cat: 'Tabungan', amount: -2500000 },
    { id: 'tx-19', date: '2026-11-21', desc: 'Makan siang akhir pekan', cat: 'Makan di luar', amount: -198000 },
    { id: 'tx-20', date: '2026-11-22', desc: 'Obat & vitamin', cat: 'Kesehatan', amount: -142000 },
    { id: 'tx-21', date: '2026-11-23', desc: 'Belanja mingguan pasar', cat: 'Belanja dapur', amount: -441000 },
    { id: 'tx-22', date: '2026-11-24', desc: 'Buku & alat tulis', cat: 'Sekolah anak', amount: -185000 },
    { id: 'tx-23', date: '2026-11-25', desc: 'Cuci mobil & parkir', cat: 'Transport', amount: -95000 },
  ],
  goals: [
    { id: 'goal-1', name: 'Dana darurat keluarga', target: 30000000, saved: 18750000, note: 'Enam bulan pengeluaran pokok.' },
    { id: 'goal-2', name: 'Liburan ke Yogyakarta', target: 8000000, saved: 5200000, note: 'Tiket kereta + 3 malam, libur sekolah Juni.' },
    { id: 'goal-3', name: 'Laptop baru untuk Sari', target: 12000000, saved: 3600000, note: 'Untuk kerja freelance dari rumah.' },
    { id: 'goal-4', name: 'Renovasi dapur', target: 15000000, saved: 1250000, note: 'Ganti kompor dan meja dapur.' },
  ],
  bills: [
    { id: 'bill-1', name: 'Listrik PLN', amount: 620000, dueDay: 10, paid: true },
    { id: 'bill-2', name: 'Air PDAM', amount: 180000, dueDay: 15, paid: true },
    { id: 'bill-3', name: 'Internet rumah', amount: 350000, dueDay: 1, paid: true },
    { id: 'bill-4', name: 'SPP sekolah Dimas & Kirana', amount: 1500000, dueDay: 5, paid: true },
    { id: 'bill-5', name: 'Iuran RT & keamanan', amount: 150000, dueDay: 5, paid: false },
    { id: 'bill-6', name: 'Langganan streaming', amount: 120000, dueDay: 20, paid: false },
    { id: 'bill-7', name: 'Asuransi kesehatan', amount: 750000, dueDay: 28, paid: false },
  ],
  history: [
    { month: '2026-06', income: 14800000, spent: 11850000 },
    { month: '2026-07', income: 15500000, spent: 12600000 },
    { month: '2026-08', income: 15200000, spent: 11400000 },
    { month: '2026-09', income: 15500000, spent: 12900000 },
    { month: '2026-10', income: 15500000, spent: 12100000 },
    { month: '2026-11', income: 15500000, spent: 0 },
  ],
};

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.plan) && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch { /* corrupted storage: fall through to the seed */ }
  const fresh = structuredClone(SEED);
  saveStore(fresh);
  return fresh;
}

export function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function resetStore() {
  localStorage.removeItem(STORE_KEY);
  return loadStore();
}

export function fmt(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function fmtSigned(n) {
  return (n < 0 ? '−' : '') + fmt(Math.abs(n));
}

export function monthName(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function monthShort(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short' });
}

export function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
}

export function totalIncome(store) {
  return store.income.reduce((s, i) => s + i.amount, 0);
}

export function totalPlanned(store) {
  return store.plan.reduce((s, c) => s + c.planned, 0);
}

export function spentByCategory(store, month = CURRENT_MONTH) {
  const out = {};
  for (const tx of store.transactions) {
    if (!tx.date.startsWith(month) || tx.amount >= 0 || tx.cat === 'Tabungan') continue;
    out[tx.cat] = (out[tx.cat] ?? 0) + -tx.amount;
  }
  return out;
}

export function totalSpent(store, month = CURRENT_MONTH) {
  return store.transactions
    .filter((tx) => tx.date.startsWith(month) && tx.amount < 0)
    .reduce((s, tx) => s + -tx.amount, 0);
}

export function totalSavedThisMonth(store, month = CURRENT_MONTH) {
  return store.transactions
    .filter((tx) => tx.date.startsWith(month) && tx.cat === 'Tabungan' && tx.amount < 0)
    .reduce((s, tx) => s + -tx.amount, 0);
}

export function colorFor(cat) {
  return CATEGORY_COLORS[cat] ?? '#8a8f8a';
}
