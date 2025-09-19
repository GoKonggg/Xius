document.addEventListener('DOMContentLoaded', () => {
    // --- DATA CONTOH UNTUK SELURUH DASBOR ---
    // Di aplikasi nyata, data ini akan diambil dari API/database.

    // 1. Data untuk Kartu KPI di Atas
    const kpiData = {
        needAttention: 2,
        totalUsers: 7,
        leads: 42,
        revenue: 12800,
    };

    // 2. Data untuk Grafik Tren Penjualan
    const salesData = {
        labels: [
            "01 Sep", "03 Sep", "05 Sep", "07 Sep", "09 Sep", 
            "11 Sep", "13 Sep", "15 Sep", "17 Sep", "19 Sep"
        ],
        values: [450, 470, 500, 480, 520, 550, 530, 580, 600, 650]
    };

    // 3. Data Aktivitas Terbaru
    const recentActivitiesData = [
        { type: 'new_user', user: 'Budi Santoso', time: '5 minutes ago', icon: 'user' },
        { type: 'payment', user: 'Citra Lestari', amount: '$250', time: '1 hour ago', icon: 'payment' },
        { type: 'review', user: 'Eko Prasetyo', time: '3 hours ago', icon: 'review' },
        { type: 'new_user', user: 'Dewi Anggraini', time: '5 hours ago', icon: 'user' }
    ];

    // 4. Data untuk Top Performing Coupons
    const topCouponsData = [
        { code: 'HEMAT50', usage: 120, discount: 1500 },
        { code: 'BARUPAKAI', usage: 98, discount: 980 },
        { code: 'DISKONAKHIRTAHUN', usage: 75, discount: 1875 },
        { code: 'FREESHIP', usage: 55, discount: 275 }
    ];

    // --- FUNGSI UNTUK MERENDER KARTU KPI ---
    const renderKpiCards = () => {
        const needAttentionEl = document.getElementById('need-attention-count');
        const totalUsersEl = document.getElementById('total-users-count');
        const leadsEl = document.getElementById('leads-count');
        const revenueEl = document.getElementById('revenue-amount');

        if (needAttentionEl) needAttentionEl.textContent = kpiData.needAttention;
        if (totalUsersEl) totalUsersEl.textContent = kpiData.totalUsers.toLocaleString('en-US');
        if (leadsEl) leadsEl.textContent = kpiData.leads;
        if (revenueEl) revenueEl.textContent = `$${kpiData.revenue.toLocaleString('en-US')}`;
    };

    // --- FUNGSI UNTUK MERENDER GRAFIK PENJUALAN ---
    const renderSalesChart = () => {
        const ctx = document.getElementById('salesTrendChart');
        if (!ctx) return;
        const chartContext = ctx.getContext('2d');
        const gradient = chartContext.createLinearGradient(0, 0, 0, ctx.offsetHeight * 1.5);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.3)');
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

        new Chart(chartContext, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Sales',
                    data: salesData.values,
                    backgroundColor: gradient,
                    borderColor: '#0ea5e9',
                    borderWidth: 2,
                    pointBackgroundColor: '#0ea5e9',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#0ea5e9',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: '#0f172a',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toLocaleString('en-US')}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { drawBorder: false, color: '#e5e7eb' },
                        ticks: {
                            callback: function(value, index, values) {
                                return '$' + (value / 1000) + 'K';
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                    }
                }
            }
        });
    };
    
    // --- FUNGSI UNTUK MERENDER AKTIVITAS TERBARU ---
    const renderRecentActivities = () => {
        const container = document.getElementById('recent-activities-container');
        if (!container) return;
        const icons = {
            user: `<div class="bg-green-100 p-2 rounded-full"><svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>`,
            payment: `<div class="bg-sky-100 p-2 rounded-full"><svg class="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>`,
            review: `<div class="bg-yellow-100 p-2 rounded-full"><svg class="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>`
        };
        let activitiesHTML = '<ul class="space-y-4">';
        recentActivitiesData.forEach(activity => {
            let text = '';
            switch (activity.type) {
                case 'new_user':
                    text = `New user <span class="font-semibold text-gray-900">${activity.user}</span> just registered.`;
                    break;
                case 'payment':
                    text = `Payment of <span class="font-semibold text-gray-900">${activity.amount}</span> from <span class="font-semibold text-gray-900">${activity.user}</span> received.`;
                    break;
                case 'review':
                    text = `Review from <span class="font-semibold text-gray-900">${activity.user}</span> requires attention.`;
                    break;
            }
            activitiesHTML += `<li class="flex items-start space-x-3">${icons[activity.icon]}<div><p class="text-sm text-gray-700">${text}</p><p class="text-xs text-gray-500">${activity.time}</p></div></li>`;
        });
        activitiesHTML += '</ul>';
        container.innerHTML = activitiesHTML;
    };

    // --- (BARU) FUNGSI UNTUK MERENDER TOP COUPONS ---
    const renderTopCoupons = () => {
        const container = document.getElementById('top-coupons-container');
        if (!container) return;

        let tableHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="p-4 text-sm font-medium text-gray-600 uppercase tracking-wider">Coupon Code</th>
                            <th class="p-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-center">Usage</th>
                            <th class="p-4 text-sm font-medium text-gray-600 uppercase tracking-wider text-right">Discount Generated</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
        `;

        topCouponsData.forEach(coupon => {
            tableHTML += `
                <tr>
                    <td class="p-4">
                        <span class="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">${coupon.code}</span>
                    </td>
                    <td class="p-4 text-center text-gray-700 font-medium">${coupon.usage.toLocaleString('en-US')}x</td>
                    <td class="p-4 text-right text-gray-700 font-bold">$${coupon.discount.toLocaleString('en-US')}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
            <div class="text-center mt-4">
                <a href="coupons.html" class="text-sky-600 font-semibold hover:underline">View All Coupons →</a>
            </div>
        `;

        container.innerHTML = tableHTML;
    };

    // --- INISIALISASI SEMUA KOMPONEN SAAT HALAMAN DIMUAT ---
    renderKpiCards();
    renderSalesChart();
    renderRecentActivities();
    renderTopCoupons(); // Panggil fungsi baru
});