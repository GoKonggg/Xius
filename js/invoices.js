document.addEventListener('DOMContentLoaded', () => {
  // --- DUMMY INVOICE DATA (dengan paidVia, coupon, clickedPayNow) ---
  const invoicesData = [
    { id: 'INV-2025-001', user: 'Jane Doe',       amount: 250.00, dueDate: '2025-09-15', status: 'Paid',    paidVia: 'Gateway',       coupon: 'WELCOME10', clickedPayNow: true,  paidAt: '2025-09-14' },
    { id: 'INV-2025-002', user: 'John Smith',     amount: 120.00, dueDate: '2025-09-10', status: 'Overdue', paidVia: 'VA',            coupon: null,        clickedPayNow: true,  paidAt: null },
    { id: 'INV-2025-003', user: 'Peter Jones',    amount: 75.50,  dueDate: '2025-09-25', status: 'Pending', paidVia: 'Bank Transfer', coupon: 'EARLYBIRD', clickedPayNow: true,  paidAt: null },
    { id: 'INV-2025-004', user: 'Mary Williams',  amount: 500.00, dueDate: '2025-09-18', status: 'Paid',    paidVia: 'Cash',          coupon: null,        clickedPayNow: false, paidAt: '2025-09-18' },
    { id: 'INV-2025-005', user: 'David Brown',    amount: 90.00,  dueDate: '2025-09-17', status: 'Failed',  paidVia: 'Gateway',       coupon: null,        clickedPayNow: true,  paidAt: null },
    { id: 'INV-2025-006', user: 'Alex Johnson',   amount: 310.00, dueDate: '2025-10-05', status: 'Pending', paidVia: 'Manual',        coupon: 'WELCOME10', clickedPayNow: false, paidAt: null },
    { id: 'INV-2025-007', user: 'Ken Tanaka',     amount: 85.00,  dueDate: '2025-10-01', status: 'Pending', paidVia: 'Gateway',       coupon: null,        clickedPayNow: true,  paidAt: null }
  ];

  // --- DOM ELEMENTS ---
  const tableBody = document.getElementById('invoice-table-body');
  const searchInput = document.getElementById('invoice-search-input');
  const filterMenuButton = document.getElementById('filter-menu-button');
  const filterPanel = document.getElementById('filter-panel');
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const filterStatusSelect = document.getElementById('filter-status');
  const filterDateFromInput = document.getElementById('filter-date-from');
  const filterDateToInput = document.getElementById('filter-date-to');
  const filterPaidViaSelect = document.getElementById('filter-paidvia');
  const filterCouponSelect = document.getElementById('filter-coupon');
  const filterChipsContainer = document.getElementById('filter-chips-container');
  const filterCountBadge = document.getElementById('filter-count-badge');

  const summaryCards = {
    revenue: document.getElementById('total-revenue'),
    pending: document.getElementById('pending-amount'),
    failed:  document.getElementById('failed-amount'),
    abortedUsers: document.getElementById('aborted-users'),
  };

  // KPI cards (buat interaktif)
  const cardPending = document.getElementById('card-pending');
  const cardFailed  = document.getElementById('card-failed');
  const cardAborted = document.getElementById('card-aborted');

  // state quick filter dari card: 'pending' | 'failed' | 'aborted' | null
  let activeCard = null;

  // --- UTILS ---
  const getStatusBadge = (status) => {
    const styles = {
      'Paid': 'text-green-800 bg-green-100',
      'Pending': 'text-yellow-800 bg-yellow-100',
      'Overdue': 'text-red-800 bg-red-100',
      'Failed': 'text-gray-800 bg-gray-200',
    };
    return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || ''}">${status}</span>`;
  };

  const formatCurrency = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const setCardVisual = () => {
    const activeCls = 'ring-2 ring-sky-400';
    [cardPending, cardFailed, cardAborted].forEach(el => el && el.classList.remove(...activeCls.split(' ')));
    if (activeCard === 'pending' && cardPending) cardPending.classList.add(...activeCls.split(' '));
    if (activeCard === 'failed'  && cardFailed)  cardFailed.classList.add(...activeCls.split(' '));
    if (activeCard === 'aborted' && cardAborted) cardAborted.classList.add(...activeCls.split(' '));
  };

  // --- RENDER ---
  const renderTable = (invoices) => {
    if (invoices.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-gray-500">No matching invoices found.</td></tr>`;
      return;
    }
    const now = new Date();
    tableBody.innerHTML = invoices.map(inv => {
      const due = new Date(inv.dueDate);
      const isPastDue = due < now && (inv.status === 'Overdue' || inv.status === 'Pending');
      const dateClass = isPastDue ? 'text-red-600' : 'text-gray-600';
      const actionText = inv.status === 'Overdue' ? 'Send Reminder' : (inv.status === 'Failed' ? 'Check Log' : 'View');
      const couponLabel = inv.coupon ? inv.coupon : '—';
      return `
        <tr class="hover:bg-gray-50">
          <td class="p-4 font-mono text-sm text-gray-600">${inv.id}</td>
          <td class="p-4 text-gray-800 font-medium">${inv.user}</td>
          <td class="p-4 font-medium text-gray-800">${formatCurrency(inv.amount)}</td>
          <td class="p-4 ${dateClass}">${inv.dueDate}</td>
          <td class="p-4">${getStatusBadge(inv.status)}</td>
          <td class="p-4 text-gray-700">${inv.paidVia || '—'}</td>
          <td class="p-4 text-gray-700">${couponLabel}</td>
          <td class="p-4"><a href="#" class="text-sky-600 hover:text-sky-800 font-medium">${actionText}</a></td>
        </tr>
      `;
    }).join('');
  };

  const renderFilterChips = () => {
    filterChipsContainer.innerHTML = '';
    let filterCount = 0;

    const addChip = (label, key) => {
      filterCount++;
      filterChipsContainer.innerHTML += `
        <div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
          <span>${label}</span>
          <button class="remove-chip-btn" data-filter-key="${key}">&times;</button>
        </div>`;
    };

    // chips dari dropdown + date
    if (filterStatusSelect.value !== 'all') addChip(`Status: ${filterStatusSelect.value}`, 'status');
    if (filterDateFromInput.value)         addChip(`From: ${filterDateFromInput.value}`, 'date-from');
    if (filterDateToInput.value)           addChip(`To: ${filterDateToInput.value}`, 'date-to');
    if (filterPaidViaSelect && filterPaidViaSelect.value !== 'all') addChip(`Paid Via: ${filterPaidViaSelect.value}`, 'paidvia');
    if (filterCouponSelect && filterCouponSelect.value !== 'all')   addChip(`Coupon: ${filterCouponSelect.value === 'with' ? 'With Coupon' : 'No Coupon'}`, 'coupon');

    // chip quick filter dari card
    if (activeCard === 'pending') addChip('Quick: Pending + Overdue', 'card');
    if (activeCard === 'failed')  addChip('Quick: Failed', 'card');
    if (activeCard === 'aborted') addChip('Quick: Aborted Checkouts', 'card');

    filterCountBadge.textContent = filterCount;
    filterCount > 0 ? filterCountBadge.classList.remove('hidden') : filterCountBadge.classList.add('hidden');

    // remove chip handlers
    document.querySelectorAll('.remove-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.dataset.filterKey;
        if (key === 'status')    filterStatusSelect.value = 'all';
        if (key === 'date-from') filterDateFromInput.value = '';
        if (key === 'date-to')   filterDateToInput.value = '';
        if (key === 'paidvia' && filterPaidViaSelect) filterPaidViaSelect.value = 'all';
        if (key === 'coupon'  && filterCouponSelect)  filterCouponSelect.value  = 'all';
        if (key === 'card')     activeCard = null, setCardVisual();
        applyFilters();
      });
    });
  };

  const calculateSummary = (invoices) => {
    let totalRevenue = 0, pendingAmount = 0, failedAmount = 0;

    invoices.forEach(inv => {
      if (inv.status === 'Paid') totalRevenue += inv.amount;
      if (inv.status === 'Pending' || inv.status === 'Overdue') pendingAmount += inv.amount;
      if (inv.status === 'Failed') failedAmount += inv.amount;
    });

    // Aborted Checkouts (Users) dihitung dari keseluruhan data (bukan hanya filtered),
    // karena metrik ini sifatnya global. Kalau mau ikut ter-filter, ganti invoicesData -> invoices.
    const abortedUsersSet = new Set(
      invoicesData
        .filter(inv => inv.clickedPayNow && inv.status !== 'Paid')
        .map(inv => inv.user)
    );

    summaryCards.revenue.textContent = formatCurrency(totalRevenue);
    summaryCards.pending.textContent = formatCurrency(pendingAmount);
    summaryCards.failed.textContent  = formatCurrency(failedAmount);
    if (summaryCards.abortedUsers) summaryCards.abortedUsers.textContent = abortedUsersSet.size.toLocaleString('en-US');
  };

  // --- FILTER & SEARCH ---
  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatusSelect.value;
    const paidViaFilter = filterPaidViaSelect ? filterPaidViaSelect.value : 'all';
    const couponFilter  = filterCouponSelect ? filterCouponSelect.value : 'all';

    const dateFrom = filterDateFromInput.value ? new Date(filterDateFromInput.value) : null;
    const dateTo   = filterDateToInput.value   ? new Date(filterDateToInput.value)   : null;
    if (dateFrom) dateFrom.setHours(0,0,0,0);
    if (dateTo)   dateTo.setHours(23,59,59,999);

    const filtered = invoicesData.filter(inv => {
      // search
      const searchMatch = inv.user.toLowerCase().includes(searchTerm) || inv.id.toLowerCase().includes(searchTerm);
      // status dropdown (single)
      const statusMatch = statusFilter === 'all' || inv.status === statusFilter;
      // paid via
      const paidViaMatch = paidViaFilter === 'all' || (inv.paidVia || '') === paidViaFilter;
      // coupon
      const couponUsed = !!inv.coupon;
      const couponMatch = (couponFilter === 'all') || (couponFilter === 'with' && couponUsed) || (couponFilter === 'none' && !couponUsed);
      // date range
      const invDate = new Date(inv.dueDate);
      const dateMatch = (!dateFrom || invDate >= dateFrom) && (!dateTo || invDate <= dateTo);
      // quick filter dari card
      let cardMatch = true;
      if (activeCard === 'pending') {
        cardMatch = (inv.status === 'Pending' || inv.status === 'Overdue');
      } else if (activeCard === 'failed') {
        cardMatch = (inv.status === 'Failed');
      } else if (activeCard === 'aborted') {
        cardMatch = (inv.clickedPayNow && inv.status !== 'Paid');
      }

      return searchMatch && statusMatch && paidViaMatch && couponMatch && dateMatch && cardMatch;
    });

    renderTable(filtered);
    calculateSummary(filtered); // summary mengikuti data yang ter-filter (kecuali aborted users di atas dibuat global)
    renderFilterChips();
    toggleFilterPanel(false);
  };

  // --- FILTER PANEL TOGGLE ---
  const toggleFilterPanel = (forceState) => {
    const isHidden = filterPanel.classList.contains('hidden');
    if (forceState === true || (forceState === undefined && isHidden)) {
      filterPanel.classList.remove('hidden');
      setTimeout(() => filterPanel.classList.remove('opacity-0', 'scale-95'), 10);
    } else {
      filterPanel.classList.add('opacity-0', 'scale-95');
      setTimeout(() => filterPanel.classList.add('hidden'), 200);
    }
  };

  // --- EVENTS ---
  filterMenuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFilterPanel();
  });

  applyFiltersBtn.addEventListener('click', applyFilters);

  clearFiltersBtn.addEventListener('click', () => {
    filterStatusSelect.value = 'all';
    filterDateFromInput.value = '';
    filterDateToInput.value = '';
    if (filterPaidViaSelect) filterPaidViaSelect.value = 'all';
    if (filterCouponSelect)  filterCouponSelect.value  = 'all';
    activeCard = null; setCardVisual();
    applyFilters();
  });

  searchInput.addEventListener('input', applyFilters);

  document.addEventListener('click', (e) => {
    if (!filterPanel.contains(e.target) && !filterMenuButton.contains(e.target)) {
      toggleFilterPanel(false);
    }
  });

  // KPI cards click = set/unset quick filter
  const toggleCard = (type) => {
    activeCard = (activeCard === type) ? null : type;
    setCardVisual();
    applyFilters();
  };
  if (cardPending) {
    cardPending.addEventListener('click', () => toggleCard('pending'));
    cardPending.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('pending'); });
  }
  if (cardFailed) {
    cardFailed.addEventListener('click', () => toggleCard('failed'));
    cardFailed.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('failed'); });
  }
  if (cardAborted) {
    cardAborted.addEventListener('click', () => toggleCard('aborted'));
    cardAborted.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') toggleCard('aborted'); });
  }

  // --- INIT ---
  renderTable(invoicesData);
  calculateSummary(invoicesData);
  renderFilterChips(); // tampilkan kosong dulu, biar konsisten
  setCardVisual();
});
