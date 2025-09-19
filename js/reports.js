document.addEventListener('DOMContentLoaded', () => {
  // ===== DATA (contoh) =====
  const reports = [
  {
    id: 'r-1001', userId: 'u-101', userEmail: 'alex.j@example.com',
    rating: 4, reviewText: "PDF kadang miring. Excel aman.",
    createdAt: '2025-09-18T09:24:00+07:00', updatedAt: '2025-09-18T09:26:12+07:00',
    tokenCost: 0.0138,
    files: [
      { name: 'Financial_Report_Q3.xlsx', url: '#', type: 'excel', generatedAt: '2025-09-18T09:24:00+07:00', durationMs: 2400 },
      { name: 'Invoice_Summary_Sept.pdf', url: '#', type: 'pdf',   generatedAt: '2025-09-18T09:26:12+07:00', durationMs: 3900 },
    ],
    activityLog: [
      { ts: '2025-09-18T09:20:31+07:00', action: 'login',           detail: 'Login via email' },
      { ts: '2025-09-18T09:22:05+07:00', action: 'upload',          detail: 'Upload bank_statement_sep.csv (1.2 MB)' },
      // start & end generate (OK)
      { ts: '2025-09-18T09:24:02+07:00', action: 'generate_report', detail: 'Financial_Report_Q3.xlsx (start)' },
      { ts: '2025-09-18T09:26:15+07:00', action: 'generate_report', detail: 'Invoice_Summary_Sept.pdf (end)' },
      { ts: '2025-09-18T09:28:40+07:00', action: 'download',        detail: 'Invoice_Summary_Sept.pdf' }
    ]
  },
  {
    id: 'r-1002', userId: 'u-102', userEmail: 'samantha.b@example.com',
    rating: 1, reviewText: "Excel berantakan, banyak kolom merged.",
    createdAt: '2025-09-17T14:03:20+07:00', updatedAt: '2025-09-17T21:37:56+07:00',
    tokenCost: 0.0154,
    files: [
      { name: 'Sales_Data_Export.xlsx', url: '#', type: 'excel', generatedAt: '2025-09-17T14:03:20+07:00', durationMs: 1800 }
    ],
    activityLog: [
      { ts: '2025-09-17T13:58:11+07:00', action: 'login',           detail: 'Login via Google' },
      { ts: '2025-09-17T14:01:07+07:00', action: 'mapping',         detail: 'Map 12 columns → 7 fields' },
      // tambahkan end agar punya window > 0
      { ts: '2025-09-17T14:03:21+07:00', action: 'generate_report', detail: 'Sales_Data_Export.xlsx (start)' },
      { ts: '2025-09-17T14:04:50+07:00', action: 'generate_report', detail: 'Sales_Data_Export.xlsx (end)' },
      { ts: '2025-09-17T14:05:02+07:00', action: 'report_preview',  detail: 'Preview table merged unexpectedly' }
    ]
  },
  {
    id: 'r-1003', userId: 'u-103', userEmail: 'charles.d@example.com',
    rating: 5, reviewText: "Mantap! PDF rapi dan profesional.",
    createdAt: '2025-09-16T10:11:45+07:00', updatedAt: '2025-09-16T10:11:46+07:00',
    tokenCost: 0.0120,
    files: [
      { name: 'Annual_Performance_Review.pdf', url: '#', type: 'pdf', generatedAt: '2025-09-16T10:11:45+07:00', durationMs: 3200 }
    ],
    activityLog: [
      { ts: '2025-09-16T10:04:00+07:00', action: 'login',           detail: 'Login via email' },
      { ts: '2025-09-16T10:08:13+07:00', action: 'configure',       detail: 'Custom footer & brand color' },
      // sebelumnya cuma 1 event → 0; sekarang start & end (±16 detik)
      { ts: '2025-09-16T10:11:30+07:00', action: 'generate_report', detail: 'Annual_Performance_Review.pdf (start)' },
      { ts: '2025-09-16T10:11:46+07:00', action: 'generate_report', detail: 'Annual_Performance_Review.pdf (end)' },
      { ts: '2025-09-16T10:13:10+07:00', action: 'share',           detail: 'Share link to CFO' }
    ]
  },
  {
    id: 'r-1004', userId: 'u-102', userEmail: 'samantha.b@example.com',
    rating: 0, reviewText: "",
    createdAt: '2025-09-13T11:44:18+07:00', updatedAt: '2025-09-13T11:45:12+07:00',
    tokenCost: 2.1744,
    files: [],
    activityLog: [
      { ts: '2025-09-13T11:41:02+07:00', action: 'login',                  detail: 'Login via email' },
      { ts: '2025-09-13T11:44:18+07:00', action: 'upload',                 detail: 'huge_ledger.xlsx (5.1 MB)' },
      // tambah start + failed (window ±37 dtk)
      { ts: '2025-09-13T11:44:35+07:00', action: 'generate_report',        detail: 'huge_ledger.xlsx (start)' },
      { ts: '2025-09-13T11:45:12+07:00', action: 'generate_report_failed', detail: 'Timeout after 30s' }
    ]
  },
];


  // ===== NORMALISASI COST: tidak boleh 0 =====
  const MIN_COST = 0.0100;
  const normalizeTokenCosts = (rows) => {
    rows.forEach(r => {
      const current = Number(r.tokenCost || 0);
      if (current <= 0) {
        const perFile = (r.files?.length || 0) * 0.001; // contoh variasi kecil
        r.tokenCost = +(MIN_COST + perFile).toFixed(4);
      }
    });
  };
  normalizeTokenCosts(reports);

  // ===== DOM =====
  const tbody = document.getElementById('reports-tbody');
  const searchInput = document.getElementById('report-search');
  const filterBtn = document.getElementById('filter-menu-button');
  const filterPanel = document.getElementById('filter-panel');
  const filterCountBadge = document.getElementById('filter-count-badge');

  const ratingSelect = document.getElementById('filter-rating');
  const reviewSelect = document.getElementById('filter-review');
  const dateFrom = document.getElementById('date-from');
  const dateTo = document.getElementById('date-to');
  const timeMin = document.getElementById('time-min');
  const timeMax = document.getElementById('time-max');
  const costMin = document.getElementById('cost-min');
  const costMax = document.getElementById('cost-max');
  const sortBy = document.getElementById('sort-by');

  const applyBtn = document.getElementById('apply-filters');
  const clearBtn = document.getElementById('clear-filters');
  const chips = document.getElementById('filter-chips');

  const modalRoot = document.getElementById('report-detail-modal');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  const pageStats = document.getElementById('page-stats');

  // summary cards
  const avgRatingValue = document.getElementById('avg-rating-value');
  const avgRatingStars = document.getElementById('avg-rating-stars');
  const avgCostValue = document.getElementById('avg-cost-value');
  const avgTimeValue = document.getElementById('avg-time-value');
  const totalReportsValue = document.getElementById('total-reports-value');


  // ===== UTILS =====
  const esc = (t) => (t ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const fmtDate = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
  const money = (n) => `$${(Number(n || 0)).toFixed(4)}`;
  const stars = (r, size='w-4 h-4') => {
    if (!r || r<=0) return '<span class="text-gray-400 text-sm">-</span>';
    let s='<div class="flex">';
    for (let i=1;i<=5;i++){
      s += `<svg class="${size} ${i<=r?'text-yellow-400':'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    s+='</div>'; return s;
  };

  // Hitung lama proses generate report (menit, 1 desimal)
  const computeReportMinutes = (r) => {
    const gens = (r.activityLog || []).filter(ev =>
      ev.action === 'generate_report' || ev.action === 'generate_report_failed'
    );
    if (gens.length > 0) {
      const start = new Date(Math.min(...gens.map(ev => +new Date(ev.ts))));
      const end   = new Date(Math.max(...gens.map(ev => +new Date(ev.ts))));
      const min = Math.max(0, (end - start) / 60000);
      if (min > 0 && min < 0.1) return 0.1;
      return Number(min.toFixed(1));
    }
    const files = r.files || [];
    if (files.length > 0) {
      const min = files.reduce((s,f) => s + (Number(f.durationMs)||0), 0) / 60000;
      if (min > 0 && min < 0.1) return 0.1;
      return Number(min.toFixed(1));
    }
    const min = Math.max(0, (new Date(r.updatedAt) - new Date(r.createdAt)) / 60000);
    if (min > 0 && min < 0.1) return 0.1;
    return Number(min.toFixed(1));
  };

  const labelAction = (a) => ({
    login:'Login', upload:'Upload', mapping:'Mapping Columns', configure:'Customize Settings',
    generate_report:'Generate Report', generate_report_failed:'Report Failed',
    report_preview:'Preview Report', download:'Download', share:'Share Link'
  })[a] || a;

  const pillClass = (a) => {
    if (a.includes('failed')) return 'bg-red-100 text-red-700';
    if (a.includes('generate_report')) return 'bg-sky-100 text-sky-700';
    if (a==='upload' || a==='mapping') return 'bg-amber-100 text-amber-700';
    if (a==='login') return 'bg-gray-100 text-gray-700';
    return 'bg-green-100 text-green-700';
  };

  // ===== FILTER PANEL TOGGLE =====
  const toggleFilterPanel = (force) => {
    const hidden = filterPanel.classList.contains('hidden');
    const show = force === true || (force === undefined && hidden);
    if (show) {
      filterPanel.classList.remove('hidden');
      requestAnimationFrame(() => {
        filterPanel.classList.remove('opacity-0','scale-95');
      });
    } else {
      filterPanel.classList.add('opacity-0','scale-95');
      setTimeout(()=>filterPanel.classList.add('hidden'),150);
    }
  };
  filterBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleFilterPanel(); });
  document.addEventListener('click', (e)=>{ if (!filterPanel.contains(e.target) && !filterBtn.contains(e.target)) toggleFilterPanel(false); });

  // ===== TABLE RENDER =====
  const PAGE_SIZE = 10;
  let curPage = 1;
  let filtered = reports.slice();

  const renderTable = () => {
    const total = filtered.length;
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
    curPage = Math.min(curPage, maxPage);
    const start = (curPage-1)*PAGE_SIZE;
    const pageItems = filtered.slice(start, start+PAGE_SIZE);

    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-gray-500">No reports found.</td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map((r,idx) => {
        const mins = computeReportMinutes(r);
        const zebra = (idx % 2 === 0) ? 'bg-white' : 'bg-gray-50/60';
        return `
          <tr class="${zebra} hover:bg-sky-50 transition-colors">
            <td class="p-3 text-gray-800">${esc(r.userEmail)}</td>
            <td class="p-3 text-gray-700">${fmtDate(r.createdAt)}</td>
            <td class="p-3 text-gray-700">${fmtDate(r.updatedAt)}</td>
            <td class="p-3 text-gray-700">${mins}</td>
            <td class="p-3">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-sm ${r.tokenCost>0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}">
                ${money(r.tokenCost)}
              </span>
            </td>
            <td class="p-3">${stars(r.rating)}</td>
            <td class="p-3 text-gray-700">${r.reviewText?.trim() ? esc(r.reviewText) : '<span class="text-gray-400">-</span>'}</td>
            <td class="p-3">
              <button class="open-detail px-2.5 py-1.5 rounded-md border bg-white hover:bg-gray-50 text-sm"
                      data-id="${r.id}">
                View
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    pageInfo.textContent = `Page ${curPage} / ${maxPage}`;
    pageStats.textContent = total ? `${start+1}–${Math.min(start+PAGE_SIZE,total)} of ${total}` : '0 of 0';
    prevBtn.disabled = curPage<=1; nextBtn.disabled = curPage>=maxPage;

    updateSummaryCards(filtered);
  };

  const updateSummaryCards = (rows) => {
    const n = rows.length;
    totalReportsValue.textContent = n.toString();

    const rated = rows.filter(r=>r.rating && r.rating>0);
    const avgR = rated.length ? (rated.reduce((s,r)=>s+r.rating,0)/rated.length) : 0;
    avgRatingValue.textContent = avgR.toFixed(1);
    avgRatingStars.innerHTML = stars(Math.round(avgR),'w-5 h-5');

    const avgC = n ? (rows.reduce((s,r)=>s+(r.tokenCost||0),0)/n) : 0;
    avgCostValue.textContent = money(avgC);

    const avgT = n ? (rows.reduce((s,r)=>s+computeReportMinutes(r),0)/n) : 0;
    avgTimeValue.textContent = avgT.toFixed(1);
  };

  // ===== FILTERS =====
  const buildChips = (st) => {
    chips.innerHTML = '';
    let count = 0;
    const add = (label, clearFn) => {
      count++;
      const el = document.createElement('button');
      el.className = 'text-xs bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full hover:bg-gray-300';
      el.innerHTML = `${label} ✕`;
      el.addEventListener('click', clearFn);
      chips.appendChild(el);
    };

    if (st.search) add(`Search: ${st.search}`, ()=>{ searchInput.value=''; applyFilters(); });
    if (st.rating!=='all') add(`Rating: ${st.rating==='none'?'No Rating':st.rating+'★'}`, ()=>{ ratingSelect.value='all'; applyFilters(); });
    if (st.review!=='all') add(`Review: ${st.review==='has'?'Has':'No'}`, ()=>{ reviewSelect.value='all'; applyFilters(); });
    if (st.dateFrom) add(`From: ${st.dateFrom}`, ()=>{ dateFrom.value=''; applyFilters(); });
    if (st.dateTo) add(`To: ${st.dateTo}`, ()=>{ dateTo.value=''; applyFilters(); });
    if (st.timeMin!=null) add(`Gen Time ≥ ${st.timeMin}m`, ()=>{ timeMin.value=''; applyFilters(); });
    if (st.timeMax!=null) add(`Gen Time ≤ ${st.timeMax}m`, ()=>{ timeMax.value=''; applyFilters(); });
    if (st.costMin!=null) add(`Cost ≥ $${st.costMin}`, ()=>{ costMin.value=''; applyFilters(); });
    if (st.costMax!=null) add(`Cost ≤ $${st.costMax}`, ()=>{ costMax.value=''; applyFilters(); });

    if (count>0) {
      filterCountBadge.textContent = String(count);
      filterCountBadge.classList.remove('hidden');
    } else {
      filterCountBadge.classList.add('hidden');
    }
  };

  const parseNum = (v) => v==='' ? null : Number(v);
  const getFilterState = () => ({
    search: (searchInput.value||'').trim().toLowerCase(),
    rating: ratingSelect.value,
    review: reviewSelect.value,
    dateFrom: dateFrom.value || null,
    dateTo: dateTo.value || null,
    timeMin: parseNum(timeMin.value),
    timeMax: parseNum(timeMax.value),
    costMin: parseNum(costMin.value),
    costMax: parseNum(costMax.value),
    sortBy:  sortBy.value
  });

  const applyFilters = () => {
    const st = getFilterState();

    filtered = reports.filter(r => {
      if (st.search && !r.userEmail.toLowerCase().includes(st.search)) return false;

      if (st.rating === 'none') { if (r.rating && r.rating>0) return false; }
      else if (st.rating !== 'all') { if (Number(st.rating)!==Number(r.rating)) return false; }

      const hasReview = !!(r.reviewText && r.reviewText.trim());
      if (st.review === 'has' && !hasReview) return false;
      if (st.review === 'none' && hasReview) return false;

      if (st.dateFrom) {
        const start = new Date(`${st.dateFrom}T00:00:00`);
        if (new Date(r.createdAt) < start) return false;
      }
      if (st.dateTo) {
        const end = new Date(`${st.dateTo}T23:59:59`);
        if (new Date(r.createdAt) > end) return false;
      }

      const m = computeReportMinutes(r);
      if (st.timeMin!=null && m < st.timeMin) return false;
      if (st.timeMax!=null && m > st.timeMax) return false;

      const c = r.tokenCost || 0;
      if (st.costMin!=null && c < st.costMin) return false;
      if (st.costMax!=null && c > st.costMax) return false;

      return true;
    });

    // sorting
    filtered.sort((a,b) => {
      switch (st.sortBy) {
        case 'oldest':     return new Date(a.createdAt) - new Date(b.createdAt);
        case 'cost_desc':  return (b.tokenCost||0) - (a.tokenCost||0);
        case 'cost_asc':   return (a.tokenCost||0) - (b.tokenCost||0);
        case 'time_desc':  return computeReportMinutes(b) - computeReportMinutes(a);
        case 'time_asc':   return computeReportMinutes(a) - computeReportMinutes(b);
        case 'rating_desc':return (b.rating||0) - (a.rating||0);
        case 'rating_asc': return (a.rating||0) - (b.rating||0);
        case 'newest':
        default:           return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    curPage = 1;
    buildChips(st);
    renderTable();
    toggleFilterPanel(false);
  };

  clearBtn.addEventListener('click', () => {
    [dateFrom, dateTo, timeMin, timeMax, costMin, costMax].forEach(i => i.value = '');
    ratingSelect.value = 'all';
    reviewSelect.value = 'all';
    sortBy.value = 'newest';
    applyFilters();
  });

  applyBtn.addEventListener('click', applyFilters);

  // quick apply on search enter
  searchInput.addEventListener('keyup', (e)=>{ if(e.key==='Enter') applyFilters(); });

  // ===== MODAL DETAIL =====
  // GANTI seluruh fungsi openDetailModal jadi ini:
const openDetailModal = (repId) => {
  const r = reports.find(x => x.id === repId);
  if (!r) return;

  const esc = (t) => (t ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const fmtDate = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
  const stars = (rating) => {
    if (!rating || rating <= 0) return '<span class="text-gray-400 text-sm">-</span>';
    let s = '<div class="flex">';
    for (let i=1;i<=5;i++){
      s += `<svg class="w-5 h-5 ${i<=rating?'text-yellow-400':'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    s+='</div>'; return s;
  };

  const files = (r.files || []).map(f => {
    const color = f.type==='excel' ? 'text-green-600' : 'text-red-600';
    return `
      <a href="${f.url}" target="_blank" class="group flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 transition">
        <svg class="w-4 h-4 ${color}" viewBox="0 0 20 20" fill="currentColor"><rect x="3" y="3" width="14" height="14" rx="2"/></svg>
        <div class="min-w-0">
          <div class="truncate text-sm font-medium text-sky-700 group-hover:underline">${esc(f.name)}</div>
          <div class="text-xs text-gray-500 mt-0.5">
            Generated: <span class="font-medium">${fmtDate(f.generatedAt)}</span>
            ${f.durationMs!=null ? `<span class="mx-1.5 text-gray-400">•</span>Duration: <span class="font-medium">${(Math.round(f.durationMs/100)/10)}s</span>` : ''}
          </div>
        </div>
      </a>`;
  }).join('');

  const modalHTML = `
    <div class="modal-backdrop absolute inset-0 flex items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl">
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900">Report Details</h3>
          <button class="close-modal text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3">
          <!-- LEFT: Review only -->
          <section class="lg:col-span-2 p-6 lg:p-7">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[15px] font-bold text-gray-900">${esc(r.userEmail)}</div>
                <div class="text-sm text-gray-500">Created ${fmtDate(r.createdAt)}</div>
              </div>
              <div>${stars(r.rating)}</div>
            </div>

            <div class="mt-4">
              <h4 class="text-sm font-semibold text-gray-900 mb-2">Review</h4>
              <p class="text-[15px] leading-relaxed text-gray-800">
                ${r.reviewText?.trim() ? esc(r.reviewText) : '<span class="text-gray-400">No review</span>'}
              </p>
            </div>
          </section>

          <!-- RIGHT: Generated Reports -->
          <aside class="p-6 lg:p-7 bg-gray-50 border-l">
            <h4 class="text-sm font-semibold text-gray-900 mb-3.5">Generated Reports</h4>
            <div class="space-y-2.5">${files || '<p class="text-sm text-gray-400">No reports generated.</p>'}</div>
          </aside>
        </div>

        <div class="px-5 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-3">
          <button class="open-user px-4 py-2 text-sm font-medium rounded-md bg-sky-600 text-white hover:bg-sky-700"
                  data-user-id="${r.userId||''}" data-user-email="${esc(r.userEmail||'')}">
            Open in User Management
          </button>
          <button class="close-modal px-4 py-2 text-sm font-medium rounded-md border text-gray-700 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>`;

  modalRoot.innerHTML = modalHTML;
  modalRoot.classList.remove('hidden');
  setTimeout(()=>modalRoot.classList.remove('opacity-0'),10);

  modalRoot.addEventListener('click', onModalClick);
};


  const onModalClick = (e) => {
    if (e.target.classList.contains('close-modal') || e.target === modalRoot.querySelector('.modal-backdrop')) closeModal();
    const openUser = e.target.closest('.open-user');
    if (openUser){
      const uid = openUser.getAttribute('data-user-id');
      const email = openUser.getAttribute('data-user-email');
      const param = uid || email;
      window.location.href = `user-management.html?userId=${encodeURIComponent(param)}`;
    }
  };

  const closeModal = () => {
    modalRoot.classList.add('opacity-0');
    setTimeout(()=>{
      modalRoot.classList.add('hidden');
      modalRoot.innerHTML = '';
      modalRoot.removeEventListener('click', onModalClick);
    },200);
  };

  // ===== EVENTS =====
  document.getElementById('prev-page').addEventListener('click', () => { curPage=Math.max(1,curPage-1); renderTable(); });
  document.getElementById('next-page').addEventListener('click', () => { curPage=Math.min(curPage+1, Math.ceil(filtered.length/PAGE_SIZE)); renderTable(); });
  document.getElementById('reports-tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('.open-detail');
    if (btn) openDetailModal(btn.dataset.id);
  });

  // init
  applyFilters();
});
