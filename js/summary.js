document.addEventListener('DOMContentLoaded', () => {
    // --- DATA CONTOH UNTUK SELURUH DASBOR ---
    
    // 1. Data untuk Kartu KPI di Atas
    const kpiData = {
        needAttention: 2,
        totalUsers: 1250,
        leads: 42,
        revenue: 12800,
    };

    // 2. Data Aktivitas Pengguna (untuk Grafik Retensi)
    const userActivityData = [
        { userId: 1, registrationDate: '2025-06-05', lastSeenDate: '2025-09-15' },
        { userId: 2, registrationDate: '2025-06-10', lastSeenDate: '2025-06-12' },
        { userId: 3, registrationDate: '2025-06-20', lastSeenDate: '2025-08-25' },
        { userId: 4, registrationDate: '2025-07-01', lastSeenDate: '2025-09-18' },
        { userId: 5, registrationDate: '2025-07-15', lastSeenDate: '2025-08-05' },
        { userId: 6, registrationDate: '2025-07-25', lastSeenDate: '2025-07-26' },
        { userId: 7, registrationDate: '2025-07-28', lastSeenDate: '2025-09-02' },
        { userId: 8, registrationDate: '2025-08-05', lastSeenDate: '2025-09-11' },
        { userId: 9, registrationDate: '2025-08-12', lastSeenDate: '2025-08-12' },
        { userId: 10, registrationDate: '2025-08-19', lastSeenDate: '2025-09-01' },
        { userId: 11, registrationDate: '2025-09-01', lastSeenDate: '2025-09-19' },
        { userId: 12, registrationDate: '2025-09-05', lastSeenDate: '2025-09-18' },
    ];

    // 3. Data Aktivitas Terbaru
    const recentActivitiesData = [
        { type: 'new_user', user: 'Budi Santoso', time: '5 minutes ago', icon: 'user' },
        { type: 'payment', user: 'Citra Lestari', amount: '$250', time: '1 hour ago', icon: 'payment' },
        { type: 'review', user: 'Eko Prasetyo', time: '3 hours ago', icon: 'review' }
    ];

    // --- FUNGSI UNTUK MERENDER KARTU KPI ---
    const renderKpiCards = () => {
        document.getElementById('need-attention-count').textContent = kpiData.needAttention;
        document.getElementById('total-users-count').textContent = kpiData.totalUsers.toLocaleString('en-US');
        document.getElementById('leads-count').textContent = kpiData.leads;
        document.getElementById('revenue-amount').textContent = `$${kpiData.revenue.toLocaleString('en-US')}`;
    };

    // --- LOGIKA UNTUK GRAFIK RETENSI ---
    const calculateCohortData = (userData) => {
        const cohorts = {};
        userData.forEach(user => {
            const cohortMonth = user.registrationDate.substring(0, 7);
            if (!cohorts[cohortMonth]) cohorts[cohortMonth] = [];
            cohorts[cohortMonth].push(user);
        });

        const cohortData = Object.keys(cohorts).sort().map(cohortMonth => {
            const cohortUsers = cohorts[cohortMonth];
            const cohortSize = cohortUsers.length;
            const retentionPeriods = [];
            const cohortStartDate = new Date(cohortMonth + '-01');

            for (let i = 0; i < 6; i++) {
                const periodStartDate = new Date(cohortStartDate);
                periodStartDate.setMonth(periodStartDate.getMonth() + i);
                const periodEndDate = new Date(periodStartDate);
                periodEndDate.setMonth(periodEndDate.getMonth() + 1);
                
                const retainedUsers = cohortUsers.filter(user => {
                    const lastSeen = new Date(user.lastSeenDate);
                    return lastSeen >= periodStartDate && lastSeen < periodEndDate;
                }).length;
                retentionPeriods.push(retainedUsers);
            }
            return { cohort: cohortMonth, size: cohortSize, periods: retentionPeriods };
        });
        return cohortData;
    };

    const getColorForPercentage = (percentage) => {
        if (percentage >= 80) return { bg: 'bg-sky-600', text: 'text-white' };
        if (percentage >= 60) return { bg: 'bg-sky-500', text: 'text-white' };
        if (percentage >= 40) return { bg: 'bg-sky-400', text: 'text-white' };
        if (percentage >= 20) return { bg: 'bg-sky-300', text: 'text-sky-800' };
        if (percentage > 0) return { bg: 'bg-sky-100', text: 'text-sky-700' };
        return { bg: 'bg-gray-50', text: 'text-gray-400' };
    };

    const renderRetentionChart = (data) => {
        const container = document.getElementById('retention-chart-container');
        if (!container) return;

        let tableHTML = `<table class="min-w-full text-sm retention-table">
            <thead class="bg-gray-50">
                <tr>
                    <th class="p-3 text-left font-medium text-gray-600">Cohort</th>
                    <th class="p-3 text-right font-medium text-gray-600">New Users</th>
                    ${Array.from({ length: 6 }, (_, i) => `<th class="p-3 text-right font-medium text-gray-600">M+${i}</th>`).join('')}
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">`;
        
        data.forEach(cohort => {
            const cohortDate = new Date(cohort.cohort + '-02');
            const cohortName = cohortDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            
            tableHTML += `<tr>
                <td class="p-3 font-semibold text-gray-800">${cohortName}</td>
                <td class="p-3 text-right text-gray-600">${cohort.size}</td>`;

            cohort.periods.forEach((count, index) => {
                const percentage = Math.round((count / cohort.size) * 100);
                const colors = getColorForPercentage(percentage);
                const displayValue = index === 0 ? '100%' : `${percentage}%`;
                tableHTML += `<td class="p-3 text-right font-bold ${colors.bg} ${colors.text}">${displayValue}</td>`;
            });
            tableHTML += `</tr>`;
        });
        
        tableHTML += `</tbody></table>`;
        container.innerHTML = tableHTML;
    };
    
    // --- FUNGSI UNTUK MERENDER AKTIVITAS TERBARU ---
    const renderRecentActivities = () => {
        const container = document.getElementById('recent-activities-container');
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
            activitiesHTML += `
                <li class="flex items-start space-x-3">
                    ${icons[activity.icon]}
                    <div>
                        <p class="text-sm text-gray-700">${text}</p>
                        <p class="text-xs text-gray-500">${activity.time}</p>
                    </div>
                </li>`;
        });
        activitiesHTML += '</ul>';
        container.innerHTML = activitiesHTML;
    };

    // --- INISIALISASI HALAMAN ---
    renderKpiCards();
    const cohortAnalysisData = calculateCohortData(userActivityData);
    renderRetentionChart(cohortAnalysisData);
    renderRecentActivities();
});