document.addEventListener('DOMContentLoaded', function () {
    // --- DUMMY COUPON DATA ---
    const couponsData = [
        { code: 'HEMAT20', discount: '20%', usageCurrent: 15, usageLimit: 100, expires: '2025-10-31', status: 'Active' },
        { code: 'DISKONBARU', discount: '$10 Off', usageCurrent: 78, usageLimit: 200, expires: '2025-12-31', status: 'Active' },
        { code: 'WELCOME5', discount: '5%', usageCurrent: 250, usageLimit: Infinity, expires: '-', status: 'Inactive' },
        { code: 'FREEONGKIR', discount: 'Free Shipping', usageCurrent: 152, usageLimit: 500, expires: '2025-09-30', status: 'Active' },
        { code: 'SEPTEMBERDEAL', discount: '$25 Off', usageCurrent: 45, usageLimit: 50, expires: '2025-09-25', status: 'Active' },
        { code: 'FLASH15', discount: '15%', usageCurrent: 98, usageLimit: 100, expires: '2025-09-20', status: 'Inactive' }
    ];

    // --- DOM ELEMENT SELECTION ---
    const tableBody = document.getElementById('coupons-table-body');
    const searchInput = document.getElementById('coupon-search-input');
    const activeCouponsEl = document.getElementById('active-coupons-count');
    const mostUsedCouponEl = document.getElementById('most-used-coupon');
    const totalUsageEl = document.getElementById('total-usage-count');
    const filterMenuButton = document.getElementById('filter-menu-button');
    const filterPanel = document.getElementById('filter-panel');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const filterSelects = {
        status: document.getElementById('filter-status'),
        discountType: document.getElementById('filter-discount-type')
    };
    const filterDateInputs = {
        from: document.getElementById('filter-date-from'),
        to: document.getElementById('filter-date-to')
    };
    const filterChipsContainer = document.getElementById('filter-chips-container');
    const filterCountBadge = document.getElementById('filter-count-badge');

    // --- RENDER FUNCTIONS ---
    const renderTable = (coupons) => {
        tableBody.innerHTML = '';
        if (coupons.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No coupons found.</td></tr>`;
            return;
        }

        coupons.forEach(coupon => {
            const statusClass = coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800';
            const usageLimitDisplay = coupon.usageLimit === Infinity ? '∞' : coupon.usageLimit;
            const actionButton = coupon.status === 'Active' ? `<a href="#" class="text-gray-500 hover:text-gray-700 font-medium">Deactivate</a>` : `<a href="#" class="text-green-600 hover:text-green-800 font-medium">Activate</a>`;

            const row = `
                <tr>
                    <td class="p-4 font-mono text-gray-800 font-medium">${coupon.code}</td>
                    <td class="p-4 text-gray-600">${coupon.discount}</td>
                    <td class="p-4 text-gray-600">${coupon.usageCurrent} / ${usageLimitDisplay}</td>
                    <td class="p-4 text-gray-600">${coupon.expires}</td>
                    <td class="p-4"><span class="px-2 py-1 text-xs font-semibold ${statusClass} rounded-full">${coupon.status}</span></td>
                    <td class="p-4 space-x-4">
                        <a href="#" class="text-sky-600 hover:text-sky-800 font-medium">Edit</a>
                        ${actionButton}
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    };

    const updateInsights = (coupons) => {
        const activeCoupons = coupons.filter(c => c.status === 'Active');
        activeCouponsEl.textContent = activeCoupons.length;

        if (coupons.length > 0) {
            const mostUsed = coupons.reduce((prev, current) => (prev.usageCurrent > current.usageCurrent) ? prev : current);
            mostUsedCouponEl.textContent = mostUsed.code;
        } else {
            mostUsedCouponEl.textContent = '-';
        }

        const totalUsage = coupons.reduce((sum, current) => sum + current.usageCurrent, 0);
        totalUsageEl.textContent = totalUsage.toLocaleString('en-US');
    };
    
    const renderFilterChips = () => {
        filterChipsContainer.innerHTML = '';
        let filterCount = 0;
        const filterLabels = { status: 'Status', discountType: 'Type', dateFrom: 'Expires From', dateTo: 'Expires To' };

        // Select filters
        Object.keys(filterSelects).forEach(key => {
            if (filterSelects[key].value !== 'all') {
                filterCount++;
                filterChipsContainer.innerHTML += `<div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"><span>${filterLabels[key]}: ${filterSelects[key].value}</span><button class="remove-chip-btn" data-filter-key="${key}">&times;</button></div>`;
            }
        });
        // Date filters
        if (filterDateInputs.from.value) {
            filterCount++;
            filterChipsContainer.innerHTML += `<div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"><span>${filterLabels.dateFrom}: ${filterDateInputs.from.value}</span><button class="remove-chip-btn" data-filter-key="dateFrom">&times;</button></div>`;
        }
        if (filterDateInputs.to.value) {
            filterCount++;
            filterChipsContainer.innerHTML += `<div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"><span>${filterLabels.dateTo}: ${filterDateInputs.to.value}</span><button class="remove-chip-btn" data-filter-key="dateTo">&times;</button></div>`;
        }
        
        filterCountBadge.textContent = filterCount;
        filterCount > 0 ? filterCountBadge.classList.remove('hidden') : filterCountBadge.classList.add('hidden');

        document.querySelectorAll('.remove-chip-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.dataset.filterKey;
                if(filterSelects[key]) filterSelects[key].value = 'all';
                if(key === 'dateFrom') filterDateInputs.from.value = '';
                if(key === 'dateTo') filterDateInputs.to.value = '';
                applyFilters();
            });
        });
    };

    // --- FILTER & SEARCH LOGIC ---
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterSelects.status.value;
        const discountTypeFilter = filterSelects.discountType.value;
        const dateFrom = filterDateInputs.from.value ? new Date(filterDateInputs.from.value) : null;
        const dateTo = filterDateInputs.to.value ? new Date(filterDateInputs.to.value) : null;
        if(dateFrom) dateFrom.setHours(0,0,0,0);
        if(dateTo) dateTo.setHours(23,59,59,999);

        const filteredCoupons = couponsData.filter(coupon => {
            const searchMatch = coupon.code.toLowerCase().includes(searchTerm);
            const statusMatch = statusFilter === 'all' || coupon.status === statusFilter;
            
            let discountTypeMatch = true;
            if (discountTypeFilter !== 'all') {
                if(discountTypeFilter === 'Percentage') discountTypeMatch = coupon.discount.includes('%');
                if(discountTypeFilter === 'Fixed') discountTypeMatch = coupon.discount.includes('$');
            }

            let dateMatch = true;
            if (coupon.expires !== '-') {
                const couponDate = new Date(coupon.expires);
                dateMatch = (!dateFrom || couponDate >= dateFrom) && (!dateTo || couponDate <= dateTo);
            } else {
                // If coupon never expires, it shouldn't be filtered out by a date range,
                // unless the user specifically wants to exclude non-expiring coupons.
                // For simplicity, we include them.
                dateMatch = true;
            }
            
            return searchMatch && statusMatch && discountTypeMatch && dateMatch;
        });

        renderTable(filteredCoupons);
        updateInsights(filteredCoupons);
        renderFilterChips();
        toggleFilterPanel(false);
    };

    // --- PANEL & EVENT LISTENERS ---
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
    
    filterMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterPanel();
    });

    applyFiltersBtn.addEventListener('click', applyFilters);

    clearFiltersBtn.addEventListener('click', () => {
        Object.values(filterSelects).forEach(select => select.value = 'all');
        filterDateInputs.from.value = '';
        filterDateInputs.to.value = '';
        applyFilters();
    });

    searchInput.addEventListener('input', applyFilters);

    document.addEventListener('click', (e) => {
        if (!filterPanel.contains(e.target) && !filterMenuButton.contains(e.target)) {
            toggleFilterPanel(false);
        }
    });

    // --- INITIALIZATION ---
    renderTable(couponsData);
    updateInsights(couponsData);
});