document.addEventListener('DOMContentLoaded', () => {
    // --- DATA PENGGUNA (CONTOH) ---
    // Di aplikasi nyata, data ini akan diambil dari server/API
    const usersData = [
        { name: 'Alex Johnson', email: 'alex.j@example.com', source: 'Organic', subscription: 'Pro Plan', status: 'Active', joinDate: '2025-08-15' },
        { name: 'Samantha Bee', email: 'samantha.b@example.com', source: 'Referral', subscription: 'Trial', status: 'Active', joinDate: '2025-09-01' },
        { name: 'Charles Davis', email: 'charles.d@example.com', source: 'Organic', subscription: 'Cancelled', status: 'Suspended', joinDate: '2025-01-20' },
        { name: 'Maria Garcia', email: 'maria.g@example.com', source: 'Ad Campaign', subscription: 'Pro Plan', status: 'Active', joinDate: '2025-07-30' },
        { name: 'Ken Tanaka', email: 'ken.t@example.com', source: 'Referral', subscription: 'Pro Plan', status: 'Active', joinDate: '2025-06-11' },
        { name: 'Fatima Ahmed', email: 'fatima.a@example.com', source: 'Organic', subscription: 'Trial', status: 'Active', joinDate: '2025-09-10' },
        { name: 'David Wilson', email: 'david.w@example.com', source: 'Ad Campaign', subscription: 'Cancelled', status: 'Suspended', joinDate: '2024-11-05' }
    ];

    // --- SELEKSI ELEMEN DOM ---
    // Mengambil semua elemen interaktif dari HTML untuk dikontrol oleh JavaScript
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
    const modalContainer = document.getElementById('user-detail-modal');

    // --- FUNGSI BANTUAN UNTUK MEMBUAT BADGE ---
    // Fungsi-fungsi ini membuat HTML untuk badge berwarna agar kode lebih rapi
    const getSubscriptionBadge = (sub) => {
        const styles = {
            'Pro Plan': 'text-green-800 bg-green-100',
            'Trial': 'text-yellow-800 bg-yellow-100',
            'Cancelled': 'text-gray-800 bg-gray-200',
        };
        return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[sub] || ''}">${sub}</span>`;
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Active': 'text-green-800 bg-green-100',
            'Suspended': 'text-gray-800 bg-gray-200',
        };
        return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || ''}">${status}</span>`;
    };

    const getSourceBadge = (source) => {
        const styles = {
            'Organic': 'text-sky-800 bg-sky-100',
            'Referral': 'text-purple-800 bg-purple-100',
            'Ad Campaign': 'text-indigo-800 bg-indigo-100',
        };
        return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${styles[source] || ''}">${source}</span>`;
    };
    
    // --- FUNGSI UNTUK MERENDER KONTEN ---
    // Fungsi untuk mengisi tabel dengan data pengguna
    const renderTable = (users) => {
        if (users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No matching users found.</td></tr>`;
            return;
        }
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td class="p-4 align-middle">
                    <button class="text-left user-detail-button" data-email="${user.email}">
                        <p class="text-sky-600 font-medium hover:underline">${user.name}</p>
                        <p class="text-xs text-gray-500">${user.email}</p>
                    </button>
                </td>
                <td class="p-4 align-middle">${getSourceBadge(user.source)}</td>
                <td class="p-4 align-middle">${getSubscriptionBadge(user.subscription)}</td>
                <td class="p-4 align-middle">${getStatusBadge(user.status)}</td>
                <td class="p-4 align-middle relative">
                    <button class="send-message-btn bg-sky-100 text-sky-700 px-3 py-1 text-sm font-medium rounded-md hover:bg-sky-200">Send Message</button>
                </td>
            </tr>
        `).join('');
        addModalEventListeners(); // Setelah tabel dibuat, pasang event listener untuk tombol detail
    };

    // Fungsi untuk menampilkan filter yang aktif sebagai "chip"
    const renderFilterChips = () => {
        filterChipsContainer.innerHTML = '';
        let filterCount = 0;
        const filterLabels = { subscription: 'Subscription', status: 'Status', source: 'Source' };

        Object.keys(filterSelects).forEach(key => {
            const select = filterSelects[key];
            if (select.value !== 'all') {
                filterCount++;
                const chip = document.createElement('div');
                chip.className = 'flex items-center gap-2 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full';
                chip.innerHTML = `
                    <span>${filterLabels[key]}: ${select.value}</span>
                    <button class="remove-chip-btn text-gray-500 hover:text-gray-800" data-filter-key="${key}">&times;</button>
                `;
                filterChipsContainer.appendChild(chip);
            }
        });

        // Perbarui badge angka di tombol filter
        if (filterCount > 0) {
            filterCountBadge.textContent = filterCount;
            filterCountBadge.classList.remove('hidden');
        } else {
            filterCountBadge.classList.add('hidden');
        }

        // Tambahkan event listener untuk tombol hapus di setiap chip
        document.querySelectorAll('.remove-chip-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const key = e.target.dataset.filterKey;
                filterSelects[key].value = 'all';
                applyFilters();
            });
        });
    };

    // --- LOGIKA FILTER DAN PENCARIAN ---
    // Fungsi utama yang dijalankan saat filter atau pencarian dilakukan
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilters = {
            subscription: filterSelects.subscription.value,
            status: filterSelects.status.value,
            source: filterSelects.source.value
        };

        const filteredUsers = usersData.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
            const subMatch = activeFilters.subscription === 'all' || user.subscription === activeFilters.subscription;
            const statusMatch = activeFilters.status === 'all' || user.status === activeFilters.status;
            const sourceMatch = activeFilters.source === 'all' || user.source === activeFilters.source;
            return searchMatch && subMatch && statusMatch && sourceMatch;
        });

        renderTable(filteredUsers);
        renderFilterChips();
        toggleFilterPanel(false); // Selalu tutup panel setelah menerapkan filter
    };

    // --- LOGIKA MODAL ---
    // Fungsi untuk membuat dan menampilkan modal detail pengguna
    const openModal = (user) => {
        const modalContent = `
            <div class="modal-backdrop absolute inset-0 flex items-center justify-center p-4">
                <div class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl transform">
                    <div class="flex justify-between items-center p-4 border-b">
                        <h3 class="text-xl font-semibold text-gray-800">User Details</h3>
                        <button class="close-modal-button text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p class="text-sm text-gray-500">Name</p>
                            <p class="font-medium text-gray-800">${user.name}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Email</p>
                            <p class="font-medium text-gray-800">${user.email}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Joined On</p>
                            <p class="font-medium text-gray-800">${user.joinDate}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Acquisition Source</p>
                            <p class="font-medium text-gray-800">${getSourceBadge(user.source)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Subscription Plan</p>
                            <p class="font-medium text-gray-800">${getSubscriptionBadge(user.subscription)}</p>
                        </div>
                         <div>
                            <p class="text-sm text-gray-500">Account Status</p>
                            <p class="font-medium text-gray-800">${getStatusBadge(user.status)}</p>
                        </div>
                    </div>
                    <div class="p-4 bg-gray-50 border-t text-right">
                         <button class="close-modal-button px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">Close</button>
                    </div>
                </div>
            </div>
        `;
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');
        setTimeout(() => modalContainer.classList.remove('opacity-0'), 10); // Efek fade-in

        // Tambahkan event listener untuk semua tombol tutup di dalam modal
        modalContainer.querySelectorAll('.close-modal-button').forEach(btn => btn.addEventListener('click', closeModal));
        modalContainer.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal(); // Tutup jika klik di luar area konten
        });
    };
    
    // Fungsi untuk menutup modal
    const closeModal = () => {
        modalContainer.classList.add('opacity-0');
        setTimeout(() => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        }, 300); // Waktu harus sesuai dengan durasi transisi di CSS
    };

    // Fungsi untuk memasang event listener ke tombol "User Detail" di setiap baris tabel
    const addModalEventListeners = () => {
        document.querySelectorAll('.user-detail-button').forEach(button => {
            button.addEventListener('click', () => {
                const userEmail = button.dataset.email;
                const user = usersData.find(u => u.email === userEmail);
                if (user) openModal(user);
            });
        });
    };

    // --- PANEL FILTER & EVENT LISTENERS ---
    // Fungsi untuk membuka/menutup panel filter
    const toggleFilterPanel = (forceState) => {
        const isHidden = filterPanel.classList.contains('hidden');
        if (forceState === true || (forceState === undefined && isHidden)) {
            filterPanel.classList.remove('hidden');
            setTimeout(() => {
                filterPanel.classList.remove('opacity-0', 'scale-95');
            }, 10);
        } else {
            filterPanel.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                filterPanel.classList.add('hidden');
            }, 200);
        }
    };
    
    // Event listener untuk tombol filter utama
    filterMenuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah event klik menyebar ke dokumen
        toggleFilterPanel();
    });

    // Event listener untuk tombol "Apply Filters"
    applyFiltersBtn.addEventListener('click', applyFilters);

    // Event listener untuk tombol "Clear All"
    clearFiltersBtn.addEventListener('click', () => {
        Object.values(filterSelects).forEach(select => select.value = 'all');
        applyFilters();
    });

    // Event listener untuk input pencarian (berjalan setiap kali mengetik)
    searchInput.addEventListener('input', applyFilters);

    // Event listener untuk menutup panel filter jika klik di luar area panel
    document.addEventListener('click', (e) => {
        if (!filterPanel.contains(e.target) && !filterMenuButton.contains(e.target)) {
            toggleFilterPanel(false);
        }
    });

    // --- INISIALISASI ---
    // Render tabel pertama kali saat halaman dimuat
    renderTable(usersData);
});