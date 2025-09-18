document.addEventListener('DOMContentLoaded', function () {
    // --- Data Contoh Pengguna Trial ---
    // Di aplikasi nyata, data ini akan datang dari server.
    // 'trialEndDate' adalah kunci untuk perhitungan.
    const trialUsersData = {
        'Siti Aminah': {
            name: 'Siti Aminah',
            email: 'siti.a@example.com',
            trialEndDate: '2025-09-22' // Berakhir dalam beberapa hari
        },
        'Budi Santoso': {
            name: 'Budi Santoso',
            email: 'budi.s@example.com',
            trialEndDate: '2025-10-15' // Masih lama
        },
        'Rina Hartati': {
            name: 'Rina Hartati',
            email: 'rina.h@example.com',
            trialEndDate: '2025-09-18' // Berakhir hari ini
        },
        'Dewi Lestari': {
            name: 'Dewi Lestari',
            email: 'dewi.l@example.com',
            trialEndDate: '2025-09-10' // Sudah berakhir
        }
    };

    /**
     * Menghitung sisa hari trial dan memberikan format HTML dengan warna.
     * @param {string} endDateString - Tanggal berakhirnya trial (format YYYY-MM-DD).
     * @returns {string} - String HTML untuk ditampilkan di sel tabel.
     */
    const getTrialStatus = (endDateString) => {
        const endDate = new Date(endDateString);
        const today = new Date();
        
        // Mengatur waktu ke awal hari untuk perbandingan yang adil
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return `<span class="font-medium text-green-700">${diffDays} days left</span>`;
        } else if (diffDays > 0) {
            return `<span class="font-medium text-yellow-600">${diffDays} days left</span>`;
        } else if (diffDays === 0) {
            return `<span class="font-medium text-red-600">Ends today</span>`;
        } else {
            return `<span class="font-medium text-gray-500">Expired</span>`;
        }
    };

    /**
     * Mengisi kolom "Repeat Order" di tabel dengan status trial.
     */
    const populateTrialStatusInTable = () => {
        // Karena HTML Anda statis, kita tambahkan data baru yang belum ada di tabel
        const tableBody = document.querySelector('tbody');
        
        // Hapus baris contoh yang ada di HTML
        tableBody.innerHTML = ''; 

        // Buat baris tabel baru dari data trialUsersData
        for (const userName in trialUsersData) {
            const user = trialUsersData[userName];
            const trialStatusHTML = getTrialStatus(user.trialEndDate);

            const newRow = `
                <tr>
                    <td class="p-4 align-middle">
                        <button class="text-left user-detail-button">
                            <p class="text-sky-600 font-medium hover:underline">${user.name}</p>
                            <p class="text-xs text-gray-500">${user.email}</p>
                        </button>
                    </td>
                    <td class="p-4 align-middle"><span class="px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full">Referral</span></td>
                    <td class="p-4 align-middle"><span class="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Trial</span></td>
                    <td class="p-4 align-middle">${trialStatusHTML}</td>
                    <td class="p-4 align-middle"><span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Active</span></td>
                    <td class="p-4 align-middle">
                        <button class="send-message-btn bg-sky-100 text-sky-700 px-3 py-1 text-sm font-medium rounded-md hover:bg-sky-200">
                            Send Message
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += newRow;
        }
    };

    // Panggil fungsi utama untuk mengisi tabel saat halaman dimuat
    populateTrialStatusInTable();
});