document.addEventListener('DOMContentLoaded', () => {

    // --- DATA CONTOH UNTUK GRAFIK PENGGUNAAN TOKEN ---
    // Di aplikasi nyata, data ini akan datang dari API.
    const tokenUsageData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        inputTokens: [2.1, 2.5, 2.2, 2.8, 2.6, 3.1], // Dalam juta (M)
        outputTokens: [0.4, 0.5, 0.45, 0.6, 0.55, 0.7] // Dalam juta (M)
    };

    // --- FUNGSI UNTUK MERENDER GRAFIK PENGGUNAAN TOKEN ---
    const renderTokenUsageChart = () => {
        const ctx = document.getElementById('tokenUsageChart');
        if (!ctx) return;

        new Chart(ctx.getContext('2d'), {
            type: 'bar', // Menggunakan tipe bar chart untuk perbandingan
            data: {
                labels: tokenUsageData.labels,
                datasets: [
                    {
                        label: 'Input Tokens (M)',
                        data: tokenUsageData.inputTokens,
                        backgroundColor: '#38bdf8', // sky-400
                        borderColor: '#0ea5e9', // sky-500
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                    {
                        label: 'Output Tokens (M)',
                        data: tokenUsageData.outputTokens,
                        backgroundColor: '#a5b4fc', // indigo-300
                        borderColor: '#6366f1', // indigo-500
                        borderWidth: 1,
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top', // Tampilkan legenda di atas
                        align: 'end',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#0f172a', // slate-900
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 6,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb' // gray-200
                        },
                        ticks: {
                            // Menambahkan 'M' di belakang angka untuk Juta
                            callback: function(value) {
                                return value + 'M';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false // Sembunyikan grid vertikal
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    };

    // --- INISIALISASI HALAMAN ---
    renderTokenUsageChart();
});