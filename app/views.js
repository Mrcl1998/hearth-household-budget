// Hearth Budget — views: six pages, one hash router, every control wired to
// the store. Nothing here is a mock: add, edit, delete and toggle all save.

import {
  CURRENT_MONTH, colorFor, fmt, fmtSigned, loadStore, monthName, monthShort,
  saveStore, spentByCategory, totalIncome, totalPlanned, totalSavedThisMonth,
  totalSpent, uid,
} from './data.js';
import { drawDonut, drawMonthBars } from './charts.js';

let store = loadStore();
let toastTimer = null;
let txFilter = 'Semua';
let reportMonth = CURRENT_MONTH;

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function rerender() {
  saveStore(store);
  render();
}

function statCard(label, value, sub, cls = '') {
  return `<div class="card stat ${cls}"><div class="label">${label}</div><div class="value money">${value}</div><div class="sub">${sub}</div></div>`;
}

function monthSpentExclSavings(month) {
  return totalSpent(store, month) - totalSavedThisMonth(store, month);
}

// ---------- Dashboard ----------
function viewDashboard() {
  const income = totalIncome(store);
  const spent = monthSpentExclSavings(CURRENT_MONTH);
  const saved = totalSavedThisMonth(store, CURRENT_MONTH);
  const left = income - spent - saved;
  const rate = income > 0 ? Math.round(((saved + left) / income) * 100) : 0;
  const byCat = spentByCategory(store);
  const slices = store.plan
    .filter((c) => c.name !== 'Tabungan' && (byCat[c.name] ?? 0) > 0)
    .map((c) => ({ value: byCat[c.name], color: colorFor(c.name) }));
  const unpaid = store.bills.filter((b) => !b.paid).sort((a, b) => a.dueDay - b.dueDay);
  const recent = [...store.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const goalsDone = store.goals.reduce((s, g) => s + g.saved, 0);
  const goalsTarget = store.goals.reduce((s, g) => s + g.target, 0);

  return `
  <h1>Dasbor — ${esc(monthName(CURRENT_MONTH))}</h1>
  <p class="lede">Ringkasan uang keluarga Hartono bulan ini. Semua angka di bawah ini hidup: ubah anggaran di Perencana, tambah transaksi, dan dasbor ini ikut berubah.</p>
  <div class="grid grid-4">
    ${statCard('Pemasukan', fmt(income), '3 sumber pemasukan', 'accent')}
    ${statCard('Sudah dibelanjakan', fmt(spent), `${fmt(totalPlanned(store) - store.plan.find((c) => c.name === 'Tabungan').planned)} dianggarkan`)}
    ${statCard('Ditabung bulan ini', fmt(saved), `Target tabungan ${fmt(2500000)}`)}
    ${statCard('Sisa untuk dihabiskan', fmt(left), `${rate}% pemasukan belum terpakai`)}
  </div>
  <div class="grid grid-2 mt">
    <section class="card">
      <h2>Ke mana uang pergi</h2>
      <canvas class="chart" id="donut" aria-label="Diagram pengeluaran per kategori"></canvas>
      <ul class="legend">
        ${slices.map((s, i) => {
          const cat = store.plan.filter((c) => c.name !== 'Tabungan' && (byCat[c.name] ?? 0) > 0)[i];
          return `<li><span><span class="cat-dot" style="background:${s.color}"></span>${esc(cat.name)}</span><span class="lg-amt money">${fmt(s.value)}</span></li>`;
        }).join('')}
      </ul>
    </section>
    <section class="card">
      <h2>Anggaran vs realisasi</h2>
      ${store.plan.map((c) => {
        const real = c.name === 'Tabungan' ? saved : (byCat[c.name] ?? 0);
        const pct = c.planned > 0 ? Math.min(100, Math.round((real / c.planned) * 100)) : 0;
        const over = real > c.planned;
        return `<div class="bar-row"><span class="bar-name">${esc(c.name)}</span>
          <span class="bar-track"><span class="bar-fill ${over ? 'over' : pct > 85 ? 'warn' : ''}" style="display:block;width:${pct}%"></span></span>
          <span class="bar-amt"><strong class="money">${fmt(real)}</strong> / ${fmt(c.planned)}</span></div>`;
      }).join('')}
      <p class="small muted" style="margin:12px 0 0">Total dianggarkan <strong class="money">${fmt(totalPlanned(store))}</strong> dari pemasukan <strong class="money">${fmt(income)}</strong>.</p>
    </section>
  </div>
  <div class="grid grid-2 mt">
    <section class="card">
      <h2>Tagihan yang belum dibayar</h2>
      ${unpaid.length === 0 ? '<p class="empty">Semua tagihan bulan ini sudah lunas. 🎉</p>' : unpaid.map((b) => `
        <div class="bill-row"><div class="bill-info"><strong>${esc(b.name)}</strong><span>Jatuh tempo tanggal ${b.dueDay} ${esc(monthName(CURRENT_MONTH))}</span></div>
        <span class="bill-amt money">${fmt(b.amount)}</span>
        <button class="btn btn-small" data-pay-bill="${b.id}">Tandai lunas</button></div>`).join('')}
      <p class="small muted" style="margin:12px 0 0"><a href="#/bills">Lihat semua tagihan →</a></p>
    </section>
    <section class="card">
      <h2>Transaksi terakhir</h2>
      <table><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="num">Jumlah</th></tr></thead><tbody>
      ${recent.map((tx) => `<tr><td>${esc(tx.date.slice(5))}</td><td>${esc(tx.desc)} <span class="muted small">· ${esc(tx.cat)}</span></td><td class="num money ${tx.amount >= 0 ? 'pos' : ''}">${fmtSigned(tx.amount)}</td></tr>`).join('')}
      </tbody></table>
      <p class="small muted" style="margin:12px 0 0"><a href="#/transactions">Lihat semua transaksi →</a></p>
    </section>
  </div>
  <div class="grid mt">
    <section class="card">
      <h2>Tabungan &amp; tujuan — ${fmt(goalsDone)} dari ${fmt(goalsTarget)} terkumpul</h2>
      <div class="bar-track"><span class="bar-fill" style="display:block;width:${goalsTarget > 0 ? Math.round((goalsDone / goalsTarget) * 100) : 0}%"></span></div>
      <p class="small muted" style="margin:10px 0 0">${store.goals.length} tujuan aktif. <a href="#/goals">Kelola tujuan tabungan →</a></p>
    </section>
  </div>`;
}

function afterDashboard() {
  const income = totalIncome(store);
  const spent = monthSpentExclSavings(CURRENT_MONTH);
  const byCat = spentByCategory(store);
  const slices = store.plan
    .filter((c) => c.name !== 'Tabungan' && (byCat[c.name] ?? 0) > 0)
    .map((c) => ({ value: byCat[c.name], color: colorFor(c.name) }));
  slices.totalLabel = fmt(spent);
  slices.totalSub = 'dibelanjakan';
  const canvas = document.getElementById('donut');
  if (canvas) drawDonut(canvas, slices);
  document.querySelectorAll('[data-pay-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bill = store.bills.find((b) => b.id === btn.dataset.payBill);
      if (bill) { bill.paid = true; toast(`${bill.name} ditandai lunas.`); rerender(); }
    });
  });
  void income;
}

// ---------- Planner ----------
function viewPlanner() {
  const income = totalIncome(store);
  const planned = totalPlanned(store);
  const byCat = spentByCategory(store);
  return `
  <h1>Perencana Anggaran</h1>
  <p class="lede">Atur pemasukan dan anggaran tiap kategori untuk ${esc(monthName(CURRENT_MONTH))}. Ketik angka baru lalu tekan Enter atau klik di luar kolom — total di bawah langsung berubah dan tersimpan.</p>
  <div class="grid grid-3">
    ${statCard('Pemasukan', fmt(income), 'per bulan')}
    ${statCard('Total dianggarkan', fmt(planned), `${planned <= income ? 'masih sisa ' + fmt(income - planned) : 'melebihi pemasukan ' + fmt(planned - income)}`, planned > income ? '' : 'accent')}
    ${statCard('Belum dianggarkan', fmt(income - planned), planned > income ? 'Anggaran melebihi pemasukan!' : 'Ruang gerak bulan ini')}
  </div>
  <div class="grid grid-2 mt">
    <section class="card">
      <h2>Pemasukan</h2>
      <table><thead><tr><th>Sumber</th><th class="num">Per bulan</th><th></th></tr></thead><tbody>
      ${store.income.map((inc) => `<tr><td>${esc(inc.name)}</td>
        <td class="num"><input class="edit-amount" type="number" min="0" step="50000" value="${inc.amount}" data-income="${inc.id}" aria-label="Jumlah ${esc(inc.name)}"></td>
        <td class="row-actions"><button class="icon-btn" data-del-income="${inc.id}" title="Hapus sumber" aria-label="Hapus ${esc(inc.name)}">✕</button></td></tr>`).join('')}
      </tbody></table>
      <form class="inline-form mt" id="add-income">
        <div class="field grow"><label for="inc-name">Sumber baru</label><input id="inc-name" required maxlength="60" placeholder="cth. Jualan online"></div>
        <div class="field"><label for="inc-amount">Jumlah / bulan</label><input id="inc-amount" type="number" min="0" step="50000" required placeholder="500000"></div>
        <button class="btn" type="submit">Tambah pemasukan</button>
      </form>
    </section>
    <section class="card">
      <h2>Anggaran belanja</h2>
      <table><thead><tr><th>Kategori</th><th class="num">Dianggarkan</th><th class="num hide-m">Terpakai</th><th></th></tr></thead><tbody>
      ${store.plan.map((c) => `<tr><td><span class="cat-dot" style="background:${colorFor(c.name)}"></span>${esc(c.name)}</td>
        <td class="num"><input class="edit-amount" type="number" min="0" step="50000" value="${c.planned}" data-plan="${c.id}" aria-label="Anggaran ${esc(c.name)}"></td>
        <td class="num hide-m money">${fmt(c.name === 'Tabungan' ? totalSavedThisMonth(store) : (byCat[c.name] ?? 0))}</td>
        <td class="row-actions"><button class="icon-btn" data-del-cat="${c.id}" title="Hapus kategori" aria-label="Hapus ${esc(c.name)}">✕</button></td></tr>`).join('')}
      </tbody></table>
      <form class="inline-form mt" id="add-cat">
        <div class="field grow"><label for="cat-name">Kategori baru</label><input id="cat-name" required maxlength="40" placeholder="cth. Langganan"></div>
        <div class="field"><label for="cat-amount">Anggaran / bulan</label><input id="cat-amount" type="number" min="0" step="50000" required placeholder="200000"></div>
        <button class="btn" type="submit">Tambah kategori</button>
      </form>
      <p class="small muted" style="margin:12px 0 0">Menghapus kategori tidak menghapus transaksinya — transaksi lama tetap tercatat.</p>
    </section>
  </div>`;
}

function afterPlanner() {
  document.querySelectorAll('[data-income]').forEach((input) => {
    input.addEventListener('change', () => {
      const row = store.income.find((i) => i.id === input.dataset.income);
      if (row) { row.amount = Math.max(0, Math.round(Number(input.value) || 0)); toast('Pemasukan diperbarui.'); rerender(); }
    });
  });
  document.querySelectorAll('[data-plan]').forEach((input) => {
    input.addEventListener('change', () => {
      const row = store.plan.find((c) => c.id === input.dataset.plan);
      if (row) { row.planned = Math.max(0, Math.round(Number(input.value) || 0)); toast(`Anggaran ${row.name} diperbarui.`); rerender(); }
    });
  });
  document.querySelectorAll('[data-del-income]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.income = store.income.filter((i) => i.id !== btn.dataset.delIncome);
      toast('Sumber pemasukan dihapus.'); rerender();
    });
  });
  document.querySelectorAll('[data-del-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.plan = store.plan.filter((c) => c.id !== btn.dataset.delCat);
      toast('Kategori dihapus.'); rerender();
    });
  });
  document.getElementById('add-income')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('inc-name').value.trim();
    const amount = Math.max(0, Math.round(Number(document.getElementById('inc-amount').value) || 0));
    if (!name || amount <= 0) return;
    store.income.push({ id: uid('inc'), name, amount });
    toast('Pemasukan baru ditambahkan.'); rerender();
  });
  document.getElementById('add-cat')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const planned = Math.max(0, Math.round(Number(document.getElementById('cat-amount').value) || 0));
    if (!name) return;
    if (store.plan.some((c) => c.name.toLowerCase() === name.toLowerCase())) { toast('Kategori itu sudah ada.'); return; }
    store.plan.push({ id: uid('cat'), name, planned });
    toast('Kategori baru ditambahkan.'); rerender();
  });
}

// ---------- Transactions ----------
function viewTransactions() {
  const cats = ['Semua', 'Pemasukan', ...store.plan.map((c) => c.name)];
  const list = [...store.transactions]
    .filter((tx) => txFilter === 'Semua' || tx.cat === txFilter)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const inSum = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outSum = list.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);
  return `
  <h1>Transaksi — ${esc(monthName(CURRENT_MONTH))}</h1>
  <p class="lede">Semua uang masuk dan keluar bulan ini. Tambah transaksi baru di bawah, saring per kategori, atau hapus yang salah catat.</p>
  <section class="card">
    <h2>Tambah transaksi</h2>
    <form class="inline-form" id="add-tx">
      <div class="field"><label for="tx-date">Tanggal</label><input id="tx-date" type="date" value="2026-11-26" required></div>
      <div class="field grow"><label for="tx-desc">Keterangan</label><input id="tx-desc" required maxlength="80" placeholder="cth. Belanja mingguan pasar"></div>
      <div class="field"><label for="tx-cat">Kategori</label><select id="tx-cat">
        ${store.plan.map((c) => `<option>${esc(c.name)}</option>`).join('')}
      </select></div>
      <div class="field"><label for="tx-kind">Jenis</label><select id="tx-kind"><option value="out">Pengeluaran</option><option value="in">Pemasukan</option></select></div>
      <div class="field"><label for="tx-amount">Jumlah (Rp)</label><input id="tx-amount" type="number" min="1" step="1000" required placeholder="150000"></div>
      <button class="btn" type="submit">Simpan transaksi</button>
    </form>
  </section>
  <section class="card mt">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
      <h2 style="margin:0">Daftar transaksi <span class="muted small">(${list.length} baris)</span></h2>
      <div class="field" style="min-width:200px"><label for="tx-filter">Saring kategori</label>
        <select id="tx-filter">${cats.map((c) => `<option ${c === txFilter ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>
      </div>
    </div>
    <p class="small" style="margin:10px 0 0">Masuk <strong class="pos money">${fmt(inSum)}</strong> · Keluar <strong class="neg money">${fmt(outSum)}</strong> · Selisih <strong class="money">${fmt(inSum - outSum)}</strong></p>
    <div style="overflow-x:auto">
    <table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th></th></tr></thead><tbody>
    ${list.length === 0 ? '<tr><td colspan="5"><p class="empty">Tidak ada transaksi pada kategori ini.</p></td></tr>' : list.map((tx) => `<tr>
      <td>${esc(tx.date)}</td><td>${esc(tx.desc)}</td><td>${esc(tx.cat)}</td>
      <td class="num money ${tx.amount >= 0 ? 'pos' : ''}">${fmtSigned(tx.amount)}</td>
      <td class="row-actions"><button class="icon-btn" data-del-tx="${tx.id}" title="Hapus transaksi" aria-label="Hapus ${esc(tx.desc)}">✕</button></td></tr>`).join('')}
    </tbody></table></div>
  </section>`;
}

function afterTransactions() {
  document.getElementById('tx-filter')?.addEventListener('change', (e) => {
    txFilter = e.target.value;
    render();
  });
  document.getElementById('add-tx')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('tx-desc').value.trim();
    const amount = Math.round(Number(document.getElementById('tx-amount').value) || 0);
    if (!desc || amount <= 0) return;
    const kind = document.getElementById('tx-kind').value;
    const cat = kind === 'in' ? 'Pemasukan' : document.getElementById('tx-cat').value;
    store.transactions.push({
      id: uid('tx'),
      date: document.getElementById('tx-date').value || CURRENT_MONTH + '-26',
      desc,
      cat,
      amount: kind === 'in' ? amount : -amount,
    });
    toast('Transaksi disimpan.'); rerender();
  });
  document.querySelectorAll('[data-del-tx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.transactions = store.transactions.filter((t) => t.id !== btn.dataset.delTx);
      toast('Transaksi dihapus.'); rerender();
    });
  });
}

// ---------- Goals ----------
function viewGoals() {
  const totalSaved = store.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = store.goals.reduce((s, g) => s + g.target, 0);
  return `
  <h1>Tabungan &amp; Tujuan</h1>
  <p class="lede">Tiap rupiah punya tujuan. Tambah dana ke tujuan mana pun, atau buat tujuan baru — progresnya langsung terhitung.</p>
  <div class="grid grid-3">
    ${statCard('Total terkumpul', fmt(totalSaved), `${store.goals.length} tujuan aktif`, 'accent')}
    ${statCard('Total target', fmt(totalTarget), 'semua tujuan')}
    ${statCard('Masih kurang', fmt(Math.max(0, totalTarget - totalSaved)), `${totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% tercapai`)}
  </div>
  <div class="grid grid-2 mt">
    ${store.goals.map((g) => {
      const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
      const done = g.saved >= g.target;
      return `<section class="card goal">
        <div class="goal-head"><strong>${esc(g.name)}</strong><span class="pill ${done ? 'pill-green' : 'pill-amber'}">${done ? 'Tercapai' : pct + '% tercapai'}</span></div>
        <p class="muted small" style="margin:0">${esc(g.note ?? '')}</p>
        <div class="bar-track"><span class="bar-fill" style="display:block;width:${pct}%"></span></div>
        <div class="goal-figs"><span>Terkumpul <strong class="money">${fmt(g.saved)}</strong></span><span>Target <strong class="money">${fmt(g.target)}</strong></span><span>Kurang <strong class="money">${fmt(Math.max(0, g.target - g.saved))}</strong></span></div>
        <div class="goal-actions">
          <input type="number" min="1000" step="50000" placeholder="Jumlah (Rp)" id="add-${g.id}" aria-label="Tambah dana ke ${esc(g.name)}">
          <button class="btn btn-terra" data-add-funds="${g.id}">Tambah dana</button>
          <button class="btn-ghost btn-small" data-del-goal="${g.id}">Hapus</button>
        </div>
      </section>`;
    }).join('')}
  </div>
  <section class="card mt">
    <h2>Buat tujuan baru</h2>
    <form class="inline-form" id="add-goal">
      <div class="field grow"><label for="goal-name">Nama tujuan</label><input id="goal-name" required maxlength="60" placeholder="cth. DP rumah"></div>
      <div class="field"><label for="goal-target">Target (Rp)</label><input id="goal-target" type="number" min="1000" step="100000" required placeholder="10000000"></div>
      <div class="field grow"><label for="goal-note">Catatan (opsional)</label><input id="goal-note" maxlength="100" placeholder="cth. Target akhir tahun depan"></div>
      <button class="btn" type="submit">Buat tujuan</button>
    </form>
  </section>`;
}

function afterGoals() {
  document.querySelectorAll('[data-add-funds]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById('add-' + btn.dataset.addFunds);
      const amount = Math.round(Number(input?.value) || 0);
      const goal = store.goals.find((g) => g.id === btn.dataset.addFunds);
      if (!goal || amount <= 0) { toast('Masukkan jumlah dana dulu.'); return; }
      goal.saved += amount;
      store.transactions.push({ id: uid('tx'), date: CURRENT_MONTH + '-26', desc: `Tabungan: ${goal.name}`, cat: 'Tabungan', amount: -amount });
      toast(`${fmt(amount)} ditambahkan ke ${goal.name}.`); rerender();
    });
  });
  document.querySelectorAll('[data-del-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.goals = store.goals.filter((g) => g.id !== btn.dataset.delGoal);
      toast('Tujuan dihapus.'); rerender();
    });
  });
  document.getElementById('add-goal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = Math.round(Number(document.getElementById('goal-target').value) || 0);
    if (!name || target <= 0) return;
    store.goals.push({ id: uid('goal'), name, target, saved: 0, note: document.getElementById('goal-note').value.trim() });
    toast('Tujuan baru dibuat.'); rerender();
  });
}

// ---------- Bills ----------
function viewBills() {
  const unpaid = store.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const paidTotal = store.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const sorted = [...store.bills].sort((a, b) => a.dueDay - b.dueDay);
  return `
  <h1>Tagihan Rutin</h1>
  <p class="lede">Tagihan yang datang tiap bulan, lengkap dengan tanggal jatuh tempo. Tandai lunas begitu dibayar — tidak ada lagi tagihan yang terlewat.</p>
  <div class="grid grid-3">
    ${statCard('Belum dibayar', fmt(unpaidTotal), `${unpaid.length} dari ${store.bills.length} tagihan`, unpaid.length ? '' : 'accent')}
    ${statCard('Sudah dibayar', fmt(paidTotal), `${store.bills.length - unpaid.length} tagihan lunas`)}
    ${statCard('Total tagihan / bulan', fmt(unpaidTotal + paidTotal), 'semua tagihan rutin')}
  </div>
  <section class="card mt">
    <h2>Semua tagihan — ${esc(monthName(CURRENT_MONTH))}</h2>
    ${sorted.map((b) => `
      <div class="bill-row">
        <span class="pill ${b.paid ? 'pill-green' : 'pill-red'}">${b.paid ? 'Lunas' : 'Belum dibayar'}</span>
        <div class="bill-info"><strong>${esc(b.name)}</strong><span>Jatuh tempo tiap tanggal ${b.dueDay}</span></div>
        <span class="bill-amt money">${fmt(b.amount)}</span>
        <button class="btn ${b.paid ? 'btn-ghost' : ''} btn-small" data-toggle-bill="${b.id}">${b.paid ? 'Batalkan lunas' : 'Tandai lunas'}</button>
        <button class="icon-btn" data-del-bill="${b.id}" title="Hapus tagihan" aria-label="Hapus ${esc(b.name)}">✕</button>
      </div>`).join('')}
  </section>
  <section class="card mt">
    <h2>Tambah tagihan</h2>
    <form class="inline-form" id="add-bill">
      <div class="field grow"><label for="bill-name">Nama tagihan</label><input id="bill-name" required maxlength="60" placeholder="cth. Langganan air galon"></div>
      <div class="field"><label for="bill-amount">Jumlah / bulan</label><input id="bill-amount" type="number" min="1000" step="10000" required placeholder="100000"></div>
      <div class="field"><label for="bill-day">Jatuh tempo (tanggal)</label><input id="bill-day" type="number" min="1" max="28" required value="15"></div>
      <button class="btn" type="submit">Tambah tagihan</button>
    </form>
  </section>`;
}

function afterBills() {
  document.querySelectorAll('[data-toggle-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bill = store.bills.find((b) => b.id === btn.dataset.toggleBill);
      if (bill) { bill.paid = !bill.paid; toast(bill.paid ? `${bill.name} ditandai lunas.` : `${bill.name} dikembalikan ke belum dibayar.`); rerender(); }
    });
  });
  document.querySelectorAll('[data-del-bill]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.bills = store.bills.filter((b) => b.id !== btn.dataset.delBill);
      toast('Tagihan dihapus.'); rerender();
    });
  });
  document.getElementById('add-bill')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('bill-name').value.trim();
    const amount = Math.round(Number(document.getElementById('bill-amount').value) || 0);
    const dueDay = Math.min(28, Math.max(1, Math.round(Number(document.getElementById('bill-day').value) || 15)));
    if (!name || amount <= 0) return;
    store.bills.push({ id: uid('bill'), name, amount, dueDay, paid: false });
    toast('Tagihan baru ditambahkan.'); rerender();
  });
}

// ---------- Monthly report ----------
function liveHistory() {
  return store.history.map((h) => {
    if (h.month !== CURRENT_MONTH) return h;
    return { month: h.month, income: totalIncome(store), spent: totalSpent(store, CURRENT_MONTH) };
  });
}

function viewMonth() {
  const hist = liveHistory();
  const idx = hist.findIndex((h) => h.month === reportMonth);
  const cur = hist[idx] ?? hist[hist.length - 1];
  const byCat = spentByCategory(store, cur.month);
  const spent = cur.month === CURRENT_MONTH ? totalSpent(store, CURRENT_MONTH) : cur.spent;
  const saved = cur.month === CURRENT_MONTH ? totalSavedThisMonth(store) : 0;
  const rows = store.plan
    .map((c) => ({ name: c.name, planned: c.planned, real: c.name === 'Tabungan' ? saved : (byCat[c.name] ?? 0) }))
    .sort((a, b) => b.real - a.real);
  const prev = idx > 0 ? hist[idx - 1] : null;
  const next = idx < hist.length - 1 ? hist[idx + 1] : null;
  return `
  <h1>Laporan Bulanan</h1>
  <p class="lede">Enam bulan terakhir dalam satu pandangan: pemasukan melawan pengeluaran, dan rincian tiap kategori untuk bulan yang dipilih.</p>
  <div class="month-nav">
    <button class="btn-ghost" id="month-prev" ${prev ? '' : 'disabled'}>← ${prev ? esc(monthShort(prev.month)) : '—'}</button>
    <strong>${esc(monthName(cur.month))}</strong>
    <button class="btn-ghost" id="month-next" ${next ? '' : 'disabled'}>${next ? esc(monthShort(next.month)) : '—'} →</button>
  </div>
  <div class="grid grid-3 mt">
    ${statCard('Pemasukan', fmt(cur.income), esc(monthName(cur.month)), 'accent')}
    ${statCard('Pengeluaran', fmt(spent), cur.month === CURRENT_MONTH ? 'termasuk tabungan ' + fmt(saved) : 'bulan tersebut')}
    ${statCard('Selisih', fmt(cur.income - spent), cur.income - spent >= 0 ? 'surplus — masuk tabungan' : 'defisit — perlu dipangkas', cur.income - spent >= 0 ? '' : '')}
  </div>
  <section class="card mt">
    <h2>Enam bulan terakhir</h2>
    <div class="chart-wrap"><canvas class="chart" id="month-bars"></canvas></div>
    <p class="small muted" style="margin:10px 0 0">Pengeluaran November dihitung langsung dari transaksi yang tercatat — tambah transaksi dan grafik ini ikut berubah.</p>
  </section>
  <section class="card mt">
    <h2>Rincian ${esc(monthName(cur.month))}</h2>
    ${rows.length === 0 ? '<p class="empty">Belum ada pengeluaran tercatat bulan ini.</p>' : rows.map((r) => {
      const pct = r.planned > 0 ? Math.min(100, Math.round((r.real / r.planned) * 100)) : 0;
      return `<div class="bar-row"><span class="bar-name">${esc(r.name)}</span>
        <span class="bar-track"><span class="bar-fill ${r.real > r.planned ? 'over' : ''}" style="display:block;width:${pct}%"></span></span>
        <span class="bar-amt"><strong class="money">${fmt(r.real)}</strong> / ${fmt(r.planned)}</span></div>`;
    }).join('')}
  </section>`;
}

function afterMonth() {
  const hist = liveHistory();
  drawMonthBars(document.getElementById('month-bars'), hist.map((h) => ({ label: monthShort(h.month), income: h.income, spent: h.month === CURRENT_MONTH ? totalSpent(store, CURRENT_MONTH) : h.spent })));
  const idx = hist.findIndex((h) => h.month === reportMonth);
  document.getElementById('month-prev')?.addEventListener('click', () => {
    if (idx > 0) { reportMonth = hist[idx - 1].month; render(); }
  });
  document.getElementById('month-next')?.addEventListener('click', () => {
    if (idx < hist.length - 1) { reportMonth = hist[idx + 1].month; render(); }
  });
}

// ---------- Router ----------
const ROUTES = {
  dashboard: { render: viewDashboard, after: afterDashboard },
  planner: { render: viewPlanner, after: afterPlanner },
  transactions: { render: viewTransactions, after: afterTransactions },
  goals: { render: viewGoals, after: afterGoals },
  bills: { render: viewBills, after: afterBills },
  month: { render: viewMonth, after: afterMonth },
};

export function render() {
  const hash = (location.hash || '#/').replace(/^#\//, '');
  const key = ROUTES[hash] ? hash : 'dashboard';
  const view = document.getElementById('view');
  view.innerHTML = ROUTES[key].render();
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
  const monthEl = document.getElementById('household-month');
  if (monthEl) monthEl.textContent = monthName(CURRENT_MONTH);
  ROUTES[key].after();
  window.scrollTo(0, 0);
}
