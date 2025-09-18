document.addEventListener('DOMContentLoaded', function () {
    // --- DATA KHUSUS UNTUK HALAMAN INI ---
    // Data sudah difilter untuk hanya menampilkan customer yang aktif.
    const usersData = {
        'Andi Wijaya': {
            name: 'Andi Wijaya',
            email: 'andi.w@example.com',
            phone: '0812-3456-7890',
            joinDate: '2025-08-01',
            source: 'Organic',
            subscription: 'Pro Plan',
            status: 'Active',
            usage: {
                creditsUsed: 4500,
                creditsTotal: 5000,
                lastActivity: '2 hours ago'
            },
            paymentHistory: [
                { date: '2025-09-15', amount: 'Rp 750.000', status: 'Paid' },
                { date: '2025-08-10', amount: 'Rp 750.000', status: 'Paid' },
            ]
        }
    };

    // --- Bagian Modal (Popup) ---
    const modal = document.getElementById('user-detail-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const userDetailButtons = document.querySelectorAll('.user-detail-button');
    const modalBody = modal.querySelector('.p-6.space-y-4');
    const modalTitle = modal.querySelector('h3.text-xl');

    const populateModal = (userData) => {
        modalTitle.textContent = `Details for ${userData.name}`;
        modalBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h4 class="font-semibold text-gray-700 mb-2">User Information</h4><div class="text-sm space-y-1 text-gray-600"><p><strong>Email:</strong> ${userData.email}</p><p><strong>Phone:</strong> ${userData.phone}</p><p><strong>Join Date:</strong> ${userData.joinDate}</p><p><strong>Source:</strong> ${userData.source}</p></div></div>
                <div><h4 class="font-semibold text-gray-700 mb-2">Subscription & Usage</h4><div class="text-sm space-y-1 text-gray-600"><p><strong>Plan:</strong> ${userData.subscription}</p><p><strong>Status:</strong> ${userData.status}</p><p><strong>Usage:</strong> ${userData.usage.creditsUsed} / ${userData.usage.creditsTotal} credits</p><p><strong>Last Activity:</strong> ${userData.usage.lastActivity}</p></div></div>
            </div>
            <div><h4 class="font-semibold text-gray-700 mb-2">Payment History</h4><ul class="text-sm space-y-2 text-gray-600 border-t pt-2">${userData.paymentHistory.length > 0 ? userData.paymentHistory.map(p => `<li class="flex justify-between"><span>${p.date} - Invoice</span><span>${p.amount} (${p.status})</span></li>`).join('') : '<li>No payment history found.</li>'}</ul></div>`;
    };

    const openModal = (userName) => {
        const userData = usersData[userName];
        if (userData) {
            populateModal(userData);
            modal.classList.remove('hidden');
        }
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    userDetailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userName = button.querySelector('p.font-medium').textContent;
            openModal(userName);
        });
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }

    // --- Bagian Filter & Search ---
    const searchInput = document.querySelector('input[type="text"]');
    const filterSelect = document.querySelector('select');
    const tableRows = document.querySelectorAll('tbody tr');

    const filterAndSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filterTerm = filterSelect.value.toLowerCase();
        tableRows.forEach(row => {
            const userNameAndEmail = row.querySelector('td:first-child').textContent.toLowerCase();
            const subscriptionStatus = row.querySelector('td:nth-child(3) span').textContent.toLowerCase();
            const searchMatch = userNameAndEmail.includes(searchTerm);
            const filterMatch = filterTerm === 'filter subscription' || subscriptionStatus.includes(filterTerm);
            if (searchMatch && filterMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };
    
    if (searchInput) {
        searchInput.addEventListener('input', filterAndSearch);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterAndSearch);
    }
    
    // --- Bagian Perhitungan Loyalitas ---
    const getPurchaseCadence = (paymentHistory) => {
        if (!paymentHistory || paymentHistory.length <= 1) return '<span class="text-gray-500">New Customer</span>';
        const purchaseTransactions = paymentHistory.filter(p => p.status === 'Paid');
        if (purchaseTransactions.length <= 1) return '<span class="text-gray-500">New Customer</span>';
        
        const sortedHistory = [...purchaseTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const timeDiffs = [];
        for (let i = 1; i < sortedHistory.length; i++) {
            const date1 = new Date(sortedHistory[i - 1].date);
            const date2 = new Date(sortedHistory[i].date);
            timeDiffs.push((Math.abs(date2 - date1)) / (1000 * 60 * 60 * 24));
        }
        
        const avgDays = Math.round(timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length);
        let textColor = 'text-green-700';
        if (avgDays > 90) {
            textColor = 'text-orange-700';
        } else if (avgDays > 30) {
            textColor = 'text-blue-700';
        }
        return `<span class="font-medium ${textColor}">~${avgDays} days</span>`;
    };

    const updateCadenceInTable = () => {
        tableRows.forEach(row => {
            const userName = row.querySelector('p.font-medium').textContent;
            const userData = usersData[userName];
            if (userData) {
                const cadenceCell = row.querySelector('td:nth-child(4)');
                if(cadenceCell) cadenceCell.innerHTML = getPurchaseCadence(userData.paymentHistory);
            }
        });
    };

    updateCadenceInTable();
});