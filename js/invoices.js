document.addEventListener('DOMContentLoaded', () => {
    // --- DUMMY INVOICE DATA ---
    const invoicesData = [
        { id: 'INV-2025-001', user: 'Jane Doe', amount: 250.00, dueDate: '2025-09-15', status: 'Paid' },
        { id: 'INV-2025-002', user: 'John Smith', amount: 120.00, dueDate: '2025-09-10', status: 'Overdue' },
        { id: 'INV-2025-003', user: 'Peter Jones', amount: 75.50, dueDate: '2025-09-25', status: 'Pending' },
        { id: 'INV-2025-004', user: 'Mary Williams', amount: 500.00, dueDate: '2025-09-18', status: 'Paid' },
        { id: 'INV-2025-005', user: 'David Brown', amount: 90.00, dueDate: '2025-09-17', status: 'Failed' },
        { id: 'INV-2025-006', user: 'Alex Johnson', amount: 310.00, dueDate: '2025-10-05', status: 'Pending' },
        { id: 'INV-2025-007', user: 'Ken Tanaka', amount: 85.00, dueDate: '2025-10-01', status: 'Pending' }
    ];

    // --- DOM ELEMENT SELECTION ---
    const tableBody = document.getElementById('invoice-table-body');
    const searchInput = document.getElementById('invoice-search-input');
    const filterMenuButton = document.getElementById('filter-menu-button');
    const filterPanel = document.getElementById('filter-panel');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const filterStatusSelect = document.getElementById('filter-status');
    const filterDateFromInput = document.getElementById('filter-date-from');
    const filterDateToInput = document.getElementById('filter-date-to');
    const filterChipsContainer = document.getElementById('filter-chips-container');
    const filterCountBadge = document.getElementById('filter-count-badge');
    const summaryCards = {
        revenue: document.getElementById('total-revenue'),
        pending: document.getElementById('pending-amount'),
        failed: document.getElementById('failed-amount'),
    };

    // --- UTILITY FUNCTIONS ---
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

    // --- RENDER FUNCTIONS ---
    const renderTable = (invoices) => {
        if (invoices.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No matching invoices found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = invoices.map(inv => {
            const isOverdue = new Date(inv.dueDate) < new Date('2025-09-18T23:12:52') && inv.status === 'Overdue'; // Using current time
            const dateClass = isOverdue ? 'text-red-600' : 'text-gray-600';
            const actionText = inv.status === 'Overdue' ? 'Send Reminder' : (inv.status === 'Failed' ? 'Check Log' : 'View');
            return `
            <tr>
                <td class="p-4 font-mono text-sm text-gray-600">${inv.id}</td>
                <td class="p-4 text-gray-800 font-medium">${inv.user}</td>
                <td class="p-4 font-medium text-gray-800">${formatCurrency(inv.amount)}</td>
                <td class="p-4 ${dateClass}">${inv.dueDate}</td>
                <td class="p-4">${getStatusBadge(inv.status)}</td>
                <td class="p-4"><a href="#" class="text-sky-600 hover:text-sky-800 font-medium">${actionText}</a></td>
            </tr>
        `}).join('');
    };

    const renderFilterChips = () => {
        filterChipsContainer.innerHTML = '';
        let filterCount = 0;
        
        // Status chip
        if (filterStatusSelect.value !== 'all') {
            filterCount++;
            filterChipsContainer.innerHTML += `<div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"><span>Status: ${filterStatusSelect.value}</span><button class="remove-chip-btn" data-filter-key="status">&times;</button></div>`;
        }
        // Date From chip
        if (filterDateFromInput.value) {
            filterCount++;
            filterChipsContainer.innerHTML += `<div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"><span>From: ${filterDateFromInput.value}</span><button class="remove-chip-btn" data-filter-key="date-from">&times;</button></div>`;
        }
        // Date To chip
        if (filterDateToInput.value) {
            filterCount++;
            filterChipsContainer.innerHTML += `<div class="flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full"><span>To: ${filterDateToInput.value}</span><button class="remove-chip-btn" data-filter-key="date-to">&times;</button></div>`;
        }

        // Update badge
        filterCountBadge.textContent = filterCount;
        filterCount > 0 ? filterCountBadge.classList.remove('hidden') : filterCountBadge.classList.add('hidden');

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-chip-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.dataset.filterKey;
                if (key === 'status') filterStatusSelect.value = 'all';
                if (key === 'date-from') filterDateFromInput.value = '';
                if (key === 'date-to') filterDateToInput.value = '';
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
        summaryCards.revenue.textContent = formatCurrency(totalRevenue);
        summaryCards.pending.textContent = formatCurrency(pendingAmount);
        summaryCards.failed.textContent = formatCurrency(failedAmount);
    };

    // --- FILTER & SEARCH LOGIC ---
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatusSelect.value;
        const dateFrom = filterDateFromInput.value ? new Date(filterDateFromInput.value) : null;
        const dateTo = filterDateToInput.value ? new Date(filterDateToInput.value) : null;
        if(dateFrom) dateFrom.setHours(0,0,0,0);
        if(dateTo) dateTo.setHours(23,59,59,999);

        const filteredInvoices = invoicesData.filter(inv => {
            const searchMatch = inv.user.toLowerCase().includes(searchTerm) || inv.id.toLowerCase().includes(searchTerm);
            const statusMatch = statusFilter === 'all' || inv.status === statusFilter;
            
            const invoiceDate = new Date(inv.dueDate);
            const dateMatch = (!dateFrom || invoiceDate >= dateFrom) && (!dateTo || invoiceDate <= dateTo);
            
            return searchMatch && statusMatch && dateMatch;
        });

        renderTable(filteredInvoices);
        calculateSummary(filteredInvoices); // Recalculate summary based on filtered data
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
        filterStatusSelect.value = 'all';
        filterDateFromInput.value = '';
        filterDateToInput.value = '';
        applyFilters();
    });

    searchInput.addEventListener('input', applyFilters);

    document.addEventListener('click', (e) => {
        if (!filterPanel.contains(e.target) && !filterMenuButton.contains(e.target)) {
            toggleFilterPanel(false);
        }
    });

    // --- INITIALIZATION ---
    renderTable(invoicesData);
    calculateSummary(invoicesData); // Initial summary calculation
});