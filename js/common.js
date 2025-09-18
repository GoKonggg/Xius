document.addEventListener('DOMContentLoaded', function () {

    const components = [
        { id: 'sidebar-container', url: '_components/_sidebar.html' },
        { id: 'header-container', url: '_components/_header.html' }
    ];

    const loadComponent = async (url, elementId) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Gagal memuat komponen: ${url}, Status: ${response.status}`);
            }
            const content = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = content;
            } else {
                // Hapus warning ini jika beberapa halaman memang tidak punya header/sidebar
                // console.warn(`Elemen dengan ID '${elementId}' tidak ditemukan.`);
            }
        } catch (error) {
            console.error('Terjadi kesalahan saat memuat komponen:', error);
        }
    };

    const setActiveSidebarLink = () => {
        // Cek dulu apakah sidebar ada di halaman ini
        if (!document.getElementById('sidebar-container')) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            const sidebar = document.querySelector('#sidebar-container > div');
            if (sidebar && sidebar.classList.contains('bg-white')) { // Light theme
                 link.classList.remove('bg-sky-500', 'text-white', 'shadow-lg');
                 link.classList.add('text-gray-600', 'hover:bg-gray-100');
            } else { // Dark theme
                link.classList.remove('bg-indigo-600', 'text-white');
                link.classList.add('text-gray-300', 'hover:bg-gray-800');
            }
        });

        const activeLink = document.querySelector(`.sidebar-link[href="${currentPage}"]`);
        if (activeLink) {
            const sidebar = document.querySelector('#sidebar-container > div');
            if (sidebar && sidebar.classList.contains('bg-white')) { // Light theme
                activeLink.classList.add('active', 'bg-sky-500', 'text-white', 'shadow-lg');
                activeLink.classList.remove('text-gray-600', 'hover:bg-gray-100');
            } else { // Dark theme
                activeLink.classList.add('active', 'bg-indigo-600', 'text-white');
                activeLink.classList.remove('text-gray-300', 'hover:bg-gray-800');
            }
        }
    };

    const setupMobileMenu = () => {
        const menuBtn = document.getElementById('menu-btn');
        const sidebar = document.getElementById('sidebar-container');

        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
            });
        }
    };

    // --- LOGIKA BARU UNTUK ACTION MENU DROPDOWN ---
    const setupActionMenus = () => {
        // Event listener ini akan menangani semua klik di halaman
        document.body.addEventListener('click', function(event) {
            // Cek apakah yang diklik adalah tombol trigger menu
            const trigger = event.target.closest('.action-menu-trigger');
            
            if (trigger) {
                const menu = trigger.nextElementSibling;
                const isHidden = menu.classList.contains('hidden');

                // Tutup semua menu lain terlebih dahulu
                document.querySelectorAll('.action-menu').forEach(m => {
                    m.classList.add('hidden');
                });

                // Jika menu yang diklik tadi tersembunyi, tampilkan
                if (isHidden) {
                    menu.classList.remove('hidden');
                }
                return;
            }

            // Jika yang diklik bukan trigger DAN bukan bagian dari menu itu sendiri,
            // tutup semua menu yang sedang terbuka.
            if (!event.target.closest('.action-menu')) {
                document.querySelectorAll('.action-menu').forEach(menu => {
                    menu.classList.add('hidden');
});
            }
        });
    };

    const initialize = async () => {
        // Hanya muat komponen jika containernya ada
        const componentPromises = components
            .filter(c => document.getElementById(c.id))
            .map(c => loadComponent(c.url, c.id));
        
        await Promise.all(componentPromises);
        
        // Jalankan fungsi-fungsi setup setelah komponen dimuat
        setActiveSidebarLink();
        setupMobileMenu();
        
        // Panggil fungsi baru untuk mengaktifkan dropdown
        setupActionMenus();
    };

    initialize();
});