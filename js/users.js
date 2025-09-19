document.addEventListener('DOMContentLoaded', () => {
    // --- STRUKTUR DATA BARU (Menambahkan joinDate) ---
    const usersData = [
        { name: 'Alex Johnson', email: 'alex.j@example.com', phone: '081234567890', source: 'Organic', rating: 5, joinDate: '2025-08-15', orderHistory: [{ date: '2025-09-15', items: 3 }, { date: '2025-08-02', items: 1 }, { date: '2025-07-21', items: 2 }] },
        { name: 'Samantha Bee', email: 'samantha.b@example.com', phone: '081234567891', source: 'Referral', rating: 4, joinDate: '2025-09-01', orderHistory: [{ date: '2025-09-01', items: 5 }] },
        { name: 'Charles Davis', email: 'charles.d@example.com', phone: '081234567892', source: 'Organic', rating: 5, joinDate: '2025-01-20', orderHistory: [{ date: '2025-08-20', items: 2 }, { date: '2025-06-10', items: 4 }] },
        
    ];

    // --- SELEKSI ELEMEN DOM (Disesuaikan) ---
    const tableBody = document.getElementById('user-table-body');
    const searchInput = document.getElementById('user-search-input');
    const filterMenuButton = document.getElementById('filter-menu-button');
    const filterPanel = document.getElementById('filter-panel');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const filterSelects = {
        source: document.getElementById('filter-source')
    };
    const filterChipsContainer = document.getElementById('filter-chips-container');
    const filterCountBadge = document.getElementById('filter-count-badge');
    
    // KPI Cards
    const totalUsersEl = document.getElementById('total-users-count');
    const totalOrdersEl = document.getElementById('total-orders-count');
    const avgRatingEl = document.getElementById('avg-rating');

    // Modals
    const orderHistoryModal = document.getElementById('order-history-modal');
    const orderHistoryTitle = document.getElementById('order-history-title');
    const orderHistoryContent = document.getElementById('order-history-content');
    const userDetailModal = document.getElementById('user-detail-modal');
    const detailModalTitle = document.getElementById('detail-modal-title');
    const detailModalContent = document.getElementById('detail-modal-content');


    // --- FUNGSI BANTUAN ---
    const getSourceBadge = (source) => { 
        const styles = { 'Organic': 'text-sky-800 bg-sky-100', 'Referral': 'text-purple-800 bg-purple-100', 'Ad Campaign': 'text-indigo-800 bg-indigo-100' };
        return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[source] || ''}">${source}</span>`; 
    };

    const getRatingStars = (rating) => {
        let stars = '<div class="flex items-center">';
        for (let i = 1; i <= 5; i++) {
            const color = i <= rating ? 'text-yellow-400' : 'text-gray-300';
            stars += `<svg class="w-4 h-4 ${color}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
        }
        stars += '</div>';
        return stars;
    };
    
    // --- FUNGSI RENDER ---
    const renderTable = (users) => {
        if (users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No matching users found.</td></tr>`; 
            return;
        }
        tableBody.innerHTML = users.map(user => {
            const totalOrders = user.orderHistory.length;
            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-4 align-middle">
                        <p class="font-medium text-gray-800">${user.name}</p>
                        <p class="text-xs text-gray-500">${user.email}</p>
                    </td>
                    
<td class="p-4 align-middle text-gray-600">
  <a href="whatsapp-leads.html?phone=${encodeURIComponent(user.phone)}"
     class="text-sky-600 hover:underline">
    ${user.phone}
  </a>
</td>

                    <td class="p-4 align-middle">${getSourceBadge(user.source)}</td>
                    <td class="p-4 align-middle text-center">
                        <button class="order-history-btn font-medium text-sky-600 hover:underline disabled:text-gray-400 disabled:no-underline" data-email="${user.email}" ${totalOrders === 0 ? 'disabled' : ''}>${totalOrders}</button>
                    </td>
                    <td class="p-4 align-middle">${getRatingStars(user.rating)}</td>
                    <td class="p-4 align-middle">
                        <button class="user-detail-btn px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200" data-email="${user.email}">Details</button>
                    </td>
                </tr>
            `;
        }).join('');
    };
    
    const renderFilterChips = () => {
        filterChipsContainer.innerHTML = ''; 
        let filterCount = 0;
        if (filterSelects.source.value !== 'all') {
            filterCount++;
            const chip = document.createElement('div');
            chip.className = 'flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full';
            chip.innerHTML = `<span>Source: ${filterSelects.source.value}</span><button class="remove-chip-btn text-gray-500 hover:text-gray-800" data-filter-key="source">&times;</button>`;
            filterChipsContainer.appendChild(chip);
        }
        
        if (filterCount > 0) { 
            filterCountBadge.textContent = filterCount; 
            filterCountBadge.classList.remove('hidden'); 
        } else { 
            filterCountBadge.classList.add('hidden'); 
        }

        document.querySelectorAll('.remove-chip-btn').forEach(button => { 
            button.addEventListener('click', (e) => { 
                const key = e.target.dataset.filterKey; 
                filterSelects[key].value = 'all'; 
                applyFilters(); 
            }); 
        });
    };

    const updateKpiCards = (users) => {
        totalUsersEl.textContent = users.length.toLocaleString('en-US');
        
        const totalOrders = users.reduce((sum, user) => sum + user.orderHistory.length, 0);
        totalOrdersEl.textContent = totalOrders.toLocaleString('en-US');
        
        const usersWithRating = users.filter(u => u.rating > 0);
        if (usersWithRating.length > 0) {
            const totalRating = usersWithRating.reduce((sum, user) => sum + user.rating, 0);
            const avgRating = (totalRating / usersWithRating.length).toFixed(1);
            avgRatingEl.innerHTML = `${avgRating} <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
        } else {
             avgRatingEl.innerHTML = `0.0 <svg class="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
        }
    };

    // --- LOGIKA FILTER & PENCARIAN ---
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const sourceFilter = filterSelects.source.value;
        
        const filteredUsers = usersData.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm) || 
                                user.email.toLowerCase().includes(searchTerm) ||
                                user.phone.includes(searchTerm);
            
            const sourceMatch = sourceFilter === 'all' || user.source === sourceFilter;
            
            return searchMatch && sourceMatch;
        });

        renderTable(filteredUsers);
        renderFilterChips();
        updateKpiCards(filteredUsers);
        toggleFilterPanel(false);
    };

    // --- LOGIKA MODAL ---
    const openModal = (modal) => {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95', '-translate-y-10');
        }, 10);
    };

    const closeModal = (modal) => {
        const modalContent = modal.querySelector('.modal-content');
        modal.classList.add('opacity-0');
        if (modalContent) {
            modalContent.classList.add('scale-95', '-translate-y-10');
        }
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    const openOrderHistoryModal = (user) => {
        orderHistoryTitle.textContent = `Order History for ${user.name}`;
        if (user.orderHistory.length === 0) {
            orderHistoryContent.innerHTML = `<p class="text-gray-500 text-center py-8">This user has no order history.</p>`;
        } else {
            orderHistoryContent.innerHTML = `
                <table class="w-full text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-3 text-sm font-medium text-gray-600">Order Date</th>
                            <th class="p-3 text-sm font-medium text-gray-600 text-center">Items</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${user.orderHistory.map(order => `
                            <tr>
                                <td class="p-3 text-gray-700">${order.date}</td>
                                <td class="p-3 text-gray-700 font-medium text-center">${order.items}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        openModal(orderHistoryModal);
    };

    const openUserDetailModal = (user) => {
        detailModalTitle.textContent = `Details for ${user.name}`;
        const totalOrders = user.orderHistory.length;

        detailModalContent.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center">
                    <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 mr-4">
                        ${user.name.charAt(0)}
                    </div>
                    <div>
                        <p class="font-bold text-lg text-gray-800">${user.name}</p>
                        <p class="text-sm text-gray-500">${user.email}</p>
                    </div>
                </div>
                <div class="border-t pt-4">
                    <dl class="grid grid-cols-2 gap-x-4 gap-y-2">
                        <dt class="text-sm font-medium text-gray-500">Phone</dt>
                        <dd class="text-sm text-gray-900">${user.phone}</dd>
                        <dt class="text-sm font-medium text-gray-500">Source</dt>
                        <dd class="text-sm text-gray-900">${getSourceBadge(user.source)}</dd>
                        <dt class="text-sm font-medium text-gray-500">Join Date</dt>
                        <dd class="text-sm text-gray-900">${user.joinDate}</dd>
                        <dt class="text-sm font-medium text-gray-500">Total Orders</dt>
                        <dd class="text-sm text-gray-900">${totalOrders}</dd>
                        <dt class="text-sm font-medium text-gray-500">Rating</dt>
                        <dd class="text-sm text-gray-900">${getRatingStars(user.rating)}</dd>
                    </dl>
                </div>
            </div>
        `;
        openModal(userDetailModal);
    };
    
    // --- EVENT LISTENERS ---
    const toggleFilterPanel = (forceState) => {
        const isHidden = filterPanel.classList.contains('hidden');
        if (forceState === true || (forceState === undefined && isHidden)) {
            filterPanel.classList.remove('hidden'); 
            setTimeout(() => { filterPanel.classList.remove('opacity-0', 'scale-95'); }, 10);
        } else {
            filterPanel.classList.add('opacity-0', 'scale-95'); 
            setTimeout(() => { filterPanel.classList.add('hidden'); }, 200);
        }
    };
    
    filterMenuButton.addEventListener('click', (e) => { e.stopPropagation(); toggleFilterPanel(); });
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', () => { 
        filterSelects.source.value = 'all'; 
        applyFilters(); 
    });
    searchInput.addEventListener('input', applyFilters);
    
    document.addEventListener('click', (e) => { 
        if (!filterPanel.contains(e.target) && !filterMenuButton.contains(e.target)) { 
            toggleFilterPanel(false); 
        } 
    });

    // Event listeners untuk semua modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal-btn') || e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Event delegation untuk tombol di dalam tabel
    tableBody.addEventListener('click', (e) => {
        const orderButton = e.target.closest('.order-history-btn');
        const detailButton = e.target.closest('.user-detail-btn');
        
        if (orderButton) {
            const userEmail = orderButton.dataset.email;
            const user = usersData.find(u => u.email === userEmail);
            if (user) openOrderHistoryModal(user);
        }

        if (detailButton) {
            const userEmail = detailButton.dataset.email;
            const user = usersData.find(u => u.email === userEmail);
            if (user) openUserDetailModal(user);
        }
    });

    // --- INISIALISASI ---
    renderTable(usersData);
    updateKpiCards(usersData);
});