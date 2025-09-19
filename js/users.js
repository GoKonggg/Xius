document.addEventListener('DOMContentLoaded', () => {
    // --- DATA PENGGUNA ---
    const usersData = [
        { name: 'Alex Johnson', email: 'alex.j@example.com', source: 'Organic', subscription: 'Pro Plan', status: 'Active', joinDate: '2025-08-15', repeatOrder: 5 },
        { name: 'Samantha Bee', email: 'samantha.b@example.com', source: 'Referral', subscription: 'Trial', status: 'Active', joinDate: '2025-09-01', repeatOrder: 0 },
        { name: 'Charles Davis', email: 'charles.d@example.com', source: 'Organic', subscription: 'Cancelled', status: 'Suspended', joinDate: '2025-01-20', repeatOrder: 12 },
        { name: 'Maria Garcia', email: 'maria.g@example.com', source: 'Ad Campaign', subscription: 'Pro Plan', status: 'Active', joinDate: '2025-07-30', repeatOrder: 8 },
        { name: 'Ken Tanaka', email: 'ken.t@example.com', source: 'Referral', subscription: 'Pro Plan', status: 'Active', joinDate: '2025-06-11', repeatOrder: 3 },
        { name: 'Fatima Ahmed', email: 'fatima.a@example.com', source: 'Organic', subscription: 'Trial', status: 'Active', joinDate: '2025-09-10', repeatOrder: 1 },
        { name: 'David Wilson', email: 'david.w@example.com', source: 'Ad Campaign', subscription: 'Cancelled', status: 'Suspended', joinDate: '2024-11-05', repeatOrder: 2 }
    ];

    Chart.register(ChartDataLabels);

    // --- SELEKSI ELEMEN DOM ---
    const tableBody = document.getElementById('user-table-body');
    const searchInput = document.getElementById('user-search-input');
    const filterMenuButton = document.getElementById('filter-menu-button');
    const filterPanel = document.getElementById('filter-panel');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const filterSelects = {
        subscription: document.getElementById('filter-subscription'),
        status: document.getElementById('filter-status'),
        source: document.getElementById('filter-source')
    };
    const filterChipsContainer = document.getElementById('filter-chips-container');
    const filterCountBadge = document.getElementById('filter-count-badge');
    const userDetailModal = document.getElementById('user-detail-modal');
    const chartModal = document.getElementById('chart-modal');
    const chartCanvas = document.getElementById('pie-chart-canvas');
    const chartModalTitle = document.getElementById('chart-modal-title');
    let pieChartInstance = null;
    
    const totalUsersEl = document.getElementById('total-users-count');
    const activeCustomersEl = document.getElementById('active-customers-count');
    const avgRepeatOrderEl = document.getElementById('avg-repeat-order');
    const activeCustomerCard = document.getElementById('active-customer-card');

    // --- FUNGSI BANTUAN ---
    const getSubscriptionBadge = (sub) => { const styles = { 'Pro Plan': 'text-green-800 bg-green-100', 'Trial': 'text-yellow-800 bg-yellow-100', 'Cancelled': 'text-gray-800 bg-gray-200' }; return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[sub] || ''}">${sub}</span>`; };
    const getStatusBadge = (status) => { const styles = { 'Active': 'text-green-800 bg-green-100', 'Suspended': 'text-gray-800 bg-gray-200' }; return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || ''}">${status}</span>`; };
    const getSourceBadge = (source) => { const styles = { 'Organic': 'text-sky-800 bg-sky-100', 'Referral': 'text-purple-800 bg-purple-100', 'Ad Campaign': 'text-indigo-800 bg-indigo-100' }; return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[source] || ''}">${source}</span>`; };
    
    // --- FUNGSI RENDER ---
    const renderTable = (users) => {
        if (users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No matching users found.</td></tr>`; return;
        }
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td class="p-4 align-middle"><button class="text-left user-detail-button" data-email="${user.email}"><p class="text-sky-600 font-medium hover:underline">${user.name}</p><p class="text-xs text-gray-500">${user.email}</p></button></td>
                <td class="p-4 align-middle">${getSourceBadge(user.source)}</td>
                <td class="p-4 align-middle">${getSubscriptionBadge(user.subscription)}</td>
                <td class="p-4 align-middle text-center font-medium text-gray-700">${user.repeatOrder}</td>
                <td class="p-4 align-middle">${getStatusBadge(user.status)}</td>
                <td class="p-4 align-middle relative"><button class="send-message-btn bg-sky-100 text-sky-700 px-3 py-1 text-sm font-medium rounded-md hover:bg-sky-200">Send Message</button></td>
            </tr>
        `).join('');
        addModalEventListeners();
    };
    const renderFilterChips = () => {
        filterChipsContainer.innerHTML = ''; let filterCount = 0; const filterLabels = { subscription: 'Subscription', status: 'Status', source: 'Source' };
        Object.keys(filterSelects).forEach(key => {
            const select = filterSelects[key];
            if (select.value !== 'all') {
                filterCount++; const chip = document.createElement('div'); chip.className = 'flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full';
                chip.innerHTML = `<span>${filterLabels[key]}: ${select.value}</span><button class="remove-chip-btn text-gray-500 hover:text-gray-800" data-filter-key="${key}">&times;</button>`;
                filterChipsContainer.appendChild(chip);
            }
        });
        if (filterCount > 0) { filterCountBadge.textContent = filterCount; filterCountBadge.classList.remove('hidden'); } else { filterCountBadge.classList.add('hidden'); }
        document.querySelectorAll('.remove-chip-btn').forEach(button => { button.addEventListener('click', (e) => { const key = e.target.dataset.filterKey; filterSelects[key].value = 'all'; applyFilters(); }); });
    };
    const updateKpiCards = (users) => {
        totalUsersEl.textContent = users.length.toLocaleString('en-US');
        const activeCustomers = users.filter(u => u.status === 'Active' && u.subscription === 'Pro Plan').length;
        activeCustomersEl.textContent = activeCustomers.toLocaleString('en-US');
        if (users.length > 0) {
            const totalRepeatOrders = users.reduce((sum, user) => sum + user.repeatOrder, 0);
            const avgRepeat = (totalRepeatOrders / users.length).toFixed(1);
            avgRepeatOrderEl.textContent = avgRepeat;
        } else { avgRepeatOrderEl.textContent = 0; }
    };

    // --- LOGIKA FILTER & PENCARIAN ---
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilters = { subscription: filterSelects.subscription.value, status: filterSelects.status.value, source: filterSelects.source.value };
        const filteredUsers = usersData.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
            const subMatch = activeFilters.subscription === 'all' || user.subscription === activeFilters.subscription;
            const statusMatch = activeFilters.status === 'all' || user.status === activeFilters.status;
            const sourceMatch = activeFilters.source === 'all' || user.source === activeFilters.source;
            return searchMatch && subMatch && statusMatch && sourceMatch;
        });
        renderTable(filteredUsers);
        renderFilterChips();
        updateKpiCards(filteredUsers);
        toggleFilterPanel(false);
    };

    // --- LOGIKA MODAL (Detail Pengguna & Pie Chart) ---
    const openUserDetailModal = (user) => {
        const modalContent = `<div class="modal-backdrop absolute inset-0 flex items-center justify-center p-4"><div class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform"></div></div>`;
        userDetailModal.innerHTML = modalContent;
        // ... sisa fungsi openUserDetailModal
    };
    const closeUserDetailModal = () => {
        userDetailModal.classList.add('opacity-0');
        setTimeout(() => { userDetailModal.classList.add('hidden'); userDetailModal.innerHTML = ''; }, 300);
    };
    const addModalEventListeners = () => {
        document.querySelectorAll('.user-detail-button').forEach(button => { button.addEventListener('click', () => { const userEmail = button.dataset.email; const user = usersData.find(u => u.email === userEmail); if (user) openUserDetailModal(user); }); });
    };
    
    // Plugin centerText untuk menggambar teks langsung di canvas
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: (chart) => {
            if (chart.data.datasets[0].data.length === 0) return;

            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

            ctx.save();
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(total.toLocaleString('en-US'), centerX, centerY - 12);

            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Users', centerX, centerY + 14);
            ctx.restore();
        }
    };

    // Ganti fungsi renderPieChart yang lama dengan versi baru ini
const renderPieChart = (labels, data) => {
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: (chart) => {
            if (chart.data.datasets[0].data.length === 0) return;
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

            ctx.save();
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.fillStyle = '#1f2937';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(total.toLocaleString('en-US'), centerX, centerY - 12);

            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Users', centerX, centerY + 14);
            ctx.restore();
        }
    };

    pieChartInstance = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#38bdf8', '#a78bfa', '#fb923c', '#4ade80', '#f87171'],
                borderColor: '#fff',
                borderWidth: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#4b5563',
                        font: { size: 12, family: 'Inter' },
                        padding: 15,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
                                    return {
                                        text: `${label}: ${value} (${percentage})`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].backgroundColor[i],
                                        lineWidth: 0,
                                        hidden: isNaN(data.datasets[0].data[i]),
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                // ## PERUBAHAN DI SINI: Tooltip dimatikan ##
                tooltip: {
                    enabled: false
                },
                datalabels: {
                    display: false
                }
            }
        },
        plugins: [centerTextPlugin]
    });
};
    const processDataForChart = (columnKey) => {
        const counts = usersData.reduce((acc, user) => { const value = user[columnKey]; acc[value] = (acc[value] || 0) + 1; return acc; }, {});
        return { labels: Object.keys(counts), data: Object.values(counts) };
    };
    
    // ## PERUBAHAN DI SINI: Panggil resize() saat modal dibuka ##
    const openChartModal = () => { 
        chartModal.classList.remove('hidden'); 
        setTimeout(() => {
            chartModal.classList.remove('opacity-0');
            // Pastikan chart di-resize ulang setelah modal muncul dan visible
            if (pieChartInstance) {
                pieChartInstance.resize(); 
            }
        }, 10);
    };
    const closeChartModal = () => { chartModal.classList.add('opacity-0'); setTimeout(() => { chartModal.classList.add('hidden'); }, 300); };
    
    // --- EVENT LISTENERS ---
    const addChartEventListeners = () => {
        document.querySelectorAll('.chart-overview-btn').forEach(button => { button.addEventListener('click', (e) => { const columnKey = e.currentTarget.dataset.column; const { labels, data } = processDataForChart(columnKey); chartModalTitle.textContent = `Overview by ${columnKey.charAt(0).toUpperCase() + columnKey.slice(1)}`; renderPieChart(labels, data); openChartModal(); }); });
        chartModal.querySelectorAll('.close-chart-modal-button').forEach(btn => btn.addEventListener('click', closeChartModal));
        chartModal.querySelector('.modal-backdrop').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeChartModal(); });
    };
    const toggleFilterPanel = (forceState) => {
        const isHidden = filterPanel.classList.contains('hidden');
        if (forceState === true || (forceState === undefined && isHidden)) {
            filterPanel.classList.remove('hidden'); setTimeout(() => { filterPanel.classList.remove('opacity-0', 'scale-95'); }, 10);
        } else {
            filterPanel.classList.add('opacity-0', 'scale-95'); setTimeout(() => { filterPanel.classList.add('hidden'); }, 200);
        }
    };
    activeCustomerCard.addEventListener('click', (e) => {
        e.preventDefault();
        const status = e.currentTarget.dataset.filterStatus;
        const subscription = e.currentTarget.dataset.filterSubscription;
        filterSelects.status.value = status;
        filterSelects.subscription.value = subscription;
        applyFilters();
    });
    filterMenuButton.addEventListener('click', (e) => { e.stopPropagation(); toggleFilterPanel(); });
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', () => { Object.values(filterSelects).forEach(select => select.value = 'all'); applyFilters(); });
    searchInput.addEventListener('input', applyFilters);
    document.addEventListener('click', (e) => { if (!filterPanel.contains(e.target) && !filterMenuButton.contains(e.target)) { toggleFilterPanel(false); } });

    // --- INISIALISASI ---
    renderTable(usersData);
    updateKpiCards(usersData);
    addChartEventListeners();
});