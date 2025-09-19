document.addEventListener('DOMContentLoaded', () => {
    // --- CONTOH DATA DINAMIS ---
    const mockUserData = [];
    const today = new Date();
    // Generate data dummy untuk 90 hari ke belakang
    for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const signupDate = `${yyyy}-${mm}-${dd}`;

        // Simulasi data sign-up
        const dailySignups = Math.floor(Math.random() * 5); // 0-4 signups per hari
        for (let j = 0; j < dailySignups; j++) {
            const isPaid = Math.random() > 0.5;
            const reportsGenerated = Math.floor(Math.random() * 20) + (isPaid ? 5 : 1);
            
            // DATA BARU: Revenue dan Cost
            const revenue = isPaid ? 50000 : 0; // Rp 50.000 jika user berbayar
            const costPerReport = 0.5539; // Biaya Rp 1.500 per laporan
            const totalCost = reportsGenerated * costPerReport;

            mockUserData.push({ signupDate, isPaid, reportsGenerated, revenue, totalCost });
        }
    }

    // --- SELEKSI ELEMEN DOM ---
    const totalSignupsEl = document.getElementById('total-signups');
    const totalPaidUsersEl = document.getElementById('total-paid-users');
    const totalUsageEl = document.getElementById('total-usage');
    const totalRevenueEl = document.getElementById('total-revenue');
    const totalCostEl = document.getElementById('total-cost');
    const totalCostPerReportEl = document.getElementById('total-cost-per-report'); // Selektor baru
    const chartCanvas = document.getElementById('summary-chart').getContext('2d');
    const chartTitleEl = document.getElementById('chart-title');
    const datePickerInput = document.getElementById('date-range-picker');
    const statCards = document.querySelectorAll('.stat-card');

    let mainChart = null;
    let activeMetric = 'signups';
    let currentFilteredData = [];
    let currentStartDate = null;
    let currentEndDate = null;

    // --- FUNGSI-FUNGSI ---

    const updateDashboardUI = (startDate, endDate) => {
        currentStartDate = startDate;
        currentEndDate = endDate;

        const inclusiveEndDate = new Date(endDate);
        inclusiveEndDate.setHours(23, 59, 59, 999);
        
        currentFilteredData = mockUserData.filter(user => {
            const userDate = new Date(user.signupDate);
            return userDate >= currentStartDate && userDate <= inclusiveEndDate;
        });

        totalSignupsEl.textContent = currentFilteredData.length.toLocaleString('id-ID');
        totalPaidUsersEl.textContent = currentFilteredData.filter(u => u.isPaid).length.toLocaleString('id-ID');
        
        // KALKULASI BARU: Revenue, Cost, dan Cost Per Report
        const totalReports = currentFilteredData.reduce((sum, u) => sum + u.reportsGenerated, 0);
        const totalRevenue = currentFilteredData.reduce((sum, u) => sum + u.revenue, 0);
        const totalCost = currentFilteredData.reduce((sum, u) => sum + u.totalCost, 0);

        // Hitung rata-rata biaya per laporan (hindari pembagian dengan nol)
        const costPerReport = totalReports > 0 ? totalCost / totalReports : 0;

        // Tampilkan semua data
        totalUsageEl.textContent = totalReports.toLocaleString('id-ID');
        totalRevenueEl.textContent = `$ ${totalRevenue.toLocaleString('id-ID')}`;
        totalCostEl.textContent = `$ ${totalCost.toLocaleString('id-ID')}`;
        totalCostPerReportEl.textContent = `$  ${costPerReport.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;


        updateActiveCardVisuals();
        renderChart();
    };
    
    const renderChart = () => {
        let datasetLabel = '';
        let borderColor = '';
        let backgroundColor = '';
        let chartRawData = {};

        switch (activeMetric) {
            case 'paid':
                chartTitleEl.textContent = 'New Paid Users Trend';
                datasetLabel = 'New Paid Users';
                borderColor = '#22c55e';
                backgroundColor = 'rgba(34, 197, 94, 0.1)';
                currentFilteredData.filter(u => u.isPaid).forEach(user => {
                    chartRawData[user.signupDate] = (chartRawData[user.signupDate] || 0) + 1;
                });
                break;

            case 'usage':
                chartTitleEl.textContent = 'Reports Generated Trend';
                datasetLabel = 'Reports Generated';
                borderColor = '#8b5cf6';
                backgroundColor = 'rgba(139, 92, 246, 0.1)';
                currentFilteredData.forEach(user => {
                    chartRawData[user.signupDate] = (chartRawData[user.signupDate] || 0) + user.reportsGenerated;
                });
                break;
            
            case 'revenue':
                chartTitleEl.textContent = 'Revenue Trend';
                datasetLabel = 'Revenue';
                borderColor = '#f59e0b';
                backgroundColor = 'rgba(245, 158, 11, 0.1)';
                currentFilteredData.forEach(user => {
                    chartRawData[user.signupDate] = (chartRawData[user.signupDate] || 0) + user.revenue;
                });
                break;
            
            case 'cost':
                chartTitleEl.textContent = 'Cost Trend';
                datasetLabel = 'Cost';
                borderColor = '#ef4444';
                backgroundColor = 'rgba(239, 68, 68, 0.1)';
                currentFilteredData.forEach(user => {
                    chartRawData[user.signupDate] = (chartRawData[user.signupDate] || 0) + user.totalCost;
                });
                break;

            case 'signups':
            default:
                chartTitleEl.textContent = 'User Sign-ups Trend';
                datasetLabel = 'New Users';
                borderColor = '#0ea5e9';
                backgroundColor = 'rgba(14, 165, 233, 0.1)';
                currentFilteredData.forEach(user => {
                    chartRawData[user.signupDate] = (chartRawData[user.signupDate] || 0) + 1;
                });
                break;
        }

        const allDatesInRange = getDatesInRange(currentStartDate, currentEndDate);
        const labels = allDatesInRange.map(d => d.toISOString().split('T')[0]);
        const dataForChart = labels.map(date => chartRawData[date] || 0);

        if (mainChart) mainChart.destroy();

        mainChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: datasetLabel,
                    data: dataForChart,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d, yyyy',
                            displayFormats: { day: 'MMM d' }
                        },
                        grid: { display: false }
                    },
                    y: { 
                        beginAtZero: true, 
                        ticks: { 
                            precision: 0,
                            callback: function(value) {
                                if (activeMetric === 'revenue' || activeMetric === 'cost') {
                                    return '$  ' + value.toLocaleString('id-ID');
                                }
                                return value;
                            }
                        },
                        grid: { color: '#e5e7eb' }
                    }
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1f2937',
                        titleFont: { weight: 'bold' },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 4,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                let value = context.parsed.y;
                                if (activeMetric === 'revenue' || activeMetric === 'cost') {
                                    label += '$ ' + value.toLocaleString('id-ID');
                                } else {
                                    label += value;
                                }
                                return label;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                }
            }
        });
    };

    const updateActiveCardVisuals = () => {
        statCards.forEach(card => {
            card.classList.remove('active');
            if (card.dataset.metric === activeMetric) {
                card.classList.add('active');
            }
        });
    };

    const getDatesInRange = (startDate, endDate) => {
        const dates = [];
        let currentDate = new Date(startDate);
        const realEndDate = new Date(endDate);
        while (currentDate <= realEndDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    // --- INISIALISASI & EVENT LISTENERS ---
    const fp = flatpickr(datePickerInput, {
        mode: "range",
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d M Y",
        onClose: (selectedDates) => {
            if (selectedDates.length === 2) {
                updateDashboardUI(selectedDates[0], selectedDates[1]);
            }
        }
    });
    
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            // Kita hanya jalankan jika kartu punya data-metric
            if (card.dataset.metric) {
                activeMetric = card.dataset.metric;
                renderChart();
                updateActiveCardVisuals();
            }
        });
    });

    // Muat data untuk 30 hari terakhir saat halaman pertama kali dibuka
    const initialEndDate = new Date();
    const initialStartDate = new Date();
    initialStartDate.setDate(initialEndDate.getDate() - 29); // 30 hari total
    fp.setDate([initialStartDate, initialEndDate]);

    // Panggil fungsi untuk memuat data secara langsung dengan tanggal awal
    updateDashboardUI(initialStartDate, initialEndDate);
});