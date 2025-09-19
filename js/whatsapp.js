document.addEventListener('DOMContentLoaded', () => {

    // --- [MODIFIKASI] DATA LEADS DISESUAIKAN DENGAN TEMA AKUNTANSI ---
    const leadsData = {
        'lead1': {
            name: 'Bapak Hendra (CFO, Maju Jaya)',
            lastMessage: "Terima kasih, tim kami akan segera review...",
            timestamp: 'Yesterday',
            unread: 2,
            messages: [
                { type: 'received', text: "Selamat siang, kami dari PT Maju Jaya tertarik dengan solusi Anda. Bisa kirimkan proposal untuk paket enterprise?", time: "Yesterday, 14:30" },
                { type: 'sent', text: "Terima kasih, Pak Hendra. Tentu, proposal akan segera kami siapkan dan kirimkan ke email Anda. Tim kami akan segera review kebutuhan Bapak.", time: "Yesterday, 14:35" }
            ]
        },
        'lead2': {
            name: 'Ibu Sarah (Accounting)',
            lastMessage: 'Baik, saya tertarik untuk coba trial-nya.',
            timestamp: '09:41 AM',
            unread: 0,
            messages: [
                { type: 'received', text: "Selamat pagi, saya mau tanya, apakah aplikasi ini bisa mengubah laporan penjualan dari Excel menjadi format e-statement bank?", time: "09:35 AM" },
                { type: 'sent', text: "Selamat pagi, Ibu Sarah. Betul sekali. Anda bisa upload file Excel atau CSV, dan sistem kami akan mengkonversinya secara otomatis. Apakah ada format bank tertentu yang Anda butuhkan?", time: "09:36 AM" },
                { type: 'received', text: "Biasanya kami pakai format Bank Central Asia (BCA). Apakah bisa?", time: "09:38 AM" },
                { type: 'sent', text: "Tentu bisa. Format BCA sudah kami dukung sepenuhnya. Apakah Ibu tertarik untuk mencoba versi trial gratis selama 7 hari untuk melihat kemudahannya?", time: "09:40 AM" },
                { type: 'received', text: "Baik, saya tertarik untuk coba trial-nya.", time: "09:41 AM" }
            ]
        },
        'lead3': {
            name: 'Andi - ProFinance Consultant',
            lastMessage: 'Apakah ada paket enterprise?',
            timestamp: '18/09/2025',
            unread: 0,
            messages: [
                { type: 'received', text: "Halo, saya seorang konsultan keuangan. Apakah ada paket enterprise untuk klien korporat saya?", time: '18/09/2025' }
            ]
        },
        'lead4': {
            name: 'Support Internal',
            lastMessage: '[CLOSED] User issue resolved.',
            timestamp: '17/09/2025',
            unread: 0,
            messages: [
                { type: 'system', text: '[CLOSED] User issue regarding CSV import has been resolved.' }
            ]
        }
    };

    // --- SELEKSI ELEMEN DOM ---
    const contactListContainer = document.querySelector('.flex-1.overflow-y-auto');
    const chatHeader = document.querySelector('.p-3.flex.items-center.border-b .font-semibold');
    const messageArea = document.querySelector('.flex-1.overflow-y-auto.p-6 .flex.flex-col.space-y-4');
    const messageInput = document.querySelector('.flex-1.w-full.px-4.py-2.border');
    const sendButton = document.querySelector('.bg-sky-500.text-white.rounded-full');
    const searchInput = document.querySelector('input[placeholder="Search"]');
    
    // Set chat yang aktif sesuai dengan HTML
    let activeLeadId = 'lead2'; 

    // --- FUNGSI-FUNGSI ---

    /**
     * Membuat daftar kontak berdasarkan array ID yang diberikan
     * @param {string[]} idsToRender - Array ID lead yang ingin ditampilkan. Default-nya semua lead.
     */
    const renderContactList = (idsToRender = Object.keys(leadsData)) => {
        contactListContainer.innerHTML = ''; 
        
        if (idsToRender.length === 0) {
            contactListContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No contacts found.</p>`;
            return;
        }

        idsToRender.forEach(leadId => {
            const lead = leadsData[leadId];
            const isActive = leadId === activeLeadId ? 'bg-gray-100' : 'hover:bg-gray-50';
            const unreadBadge = lead.unread > 0 
                ? `<span class="w-5 h-5 ${lead.unread > 15 ? 'bg-red-500' : 'bg-green-500'} text-white text-xs font-bold rounded-full flex items-center justify-center">${lead.unread}</span>` 
                : '';

            const contactHtml = `
                <div class="contact-item flex items-center p-3 cursor-pointer border-b border-gray-100 ${isActive}" data-lead-id="${leadId}">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">${lead.name}</p>
                        <p class="text-sm text-gray-500 truncate">${lead.lastMessage}</p>
                    </div>
                    <div class="flex flex-col items-end text-xs ml-2">
                        <p class="text-gray-400 mb-1">${lead.timestamp}</p>
                        ${unreadBadge}
                    </div>
                </div>
            `;
            contactListContainer.innerHTML += contactHtml;
        });
        
        addContactClickListeners();
    };
    
    /**
     * Menampilkan jendela obrolan untuk lead yang dipilih
     * @param {string} leadId - ID dari lead yang akan ditampilkan
     */
    const renderChatWindow = (leadId) => {
        const lead = leadsData[leadId];
        if (!lead) {
            chatHeader.textContent = 'Select a Chat';
            messageArea.innerHTML = `<p class="text-center text-gray-500">Please select a conversation to start chatting.</p>`;
            return;
        };

        chatHeader.textContent = lead.name;
        messageArea.innerHTML = '';
        
        lead.messages.forEach(msg => {
            let messageHtml = '';
            const messageTime = msg.time ? `<p class="text-xs text-gray-400 text-right mt-1">${msg.time}</p>` : '';

            if (msg.type === 'sent') {
                messageHtml = `
                    <div class="flex justify-end">
                        <div class="max-w-lg p-3 rounded-lg bg-[#DCF8C6] shadow-sm">
                            <p class="text-sm text-gray-800">${msg.text}</p>
                            ${messageTime}
                        </div>
                    </div>`;
            } else if (msg.type === 'received') {
                messageHtml = `
                    <div class="flex justify-start">
                        <div class="max-w-lg p-3 rounded-lg bg-white shadow-sm">
                            <p class="text-sm text-gray-800">${msg.text}</p>
                             ${messageTime}
                        </div>
                    </div>`;
            } else if (msg.type === 'system') {
                messageHtml = `
                    <div class="flex justify-center">
                        <div class="text-xs text-gray-600 bg-yellow-100/80 px-3 py-1 rounded-full">
                            ${msg.text}
                        </div>
                    </div>`;
            }
            messageArea.innerHTML += messageHtml;
        });

        messageArea.parentElement.scrollTop = messageArea.parentElement.scrollHeight;
    };

    /**
     * Fungsi untuk mengirim pesan baru
     */
    const sendMessage = () => {
        const text = messageInput.value.trim();
        if (text === '' || !activeLeadId) return;

        const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const newMessage = {
            type: 'sent',
            text: text,
            time: currentTime
        };

        leadsData[activeLeadId].messages.push(newMessage);
        renderChatWindow(activeLeadId);

        messageInput.value = '';
        messageInput.focus();
    };

    /**
     * Menambahkan event listener ke semua item kontak
     */
    const addContactClickListeners = () => {
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            item.addEventListener('click', () => {
                const leadId = item.getAttribute('data-lead-id');
                if (leadId !== activeLeadId) {
                    activeLeadId = leadId;
                    // Saat ganti chat, reset input pencarian dan tampilkan semua kontak
                    searchInput.value = '';
                    renderContactList(); 
                    renderChatWindow(leadId);
                }
            });
        });
    };
    
    /**
     * Fungsi untuk menangani input pada search bar
     */
    const handleSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const allLeadIds = Object.keys(leadsData);
        
        const filteredIds = allLeadIds.filter(leadId => {
            const leadName = leadsData[leadId].name.toLowerCase();
            return leadName.includes(searchTerm);
        });

        renderContactList(filteredIds);
    };


    // --- INISIALISASI & EVENT LISTENERS ---
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    searchInput.addEventListener('input', handleSearch);

    renderContactList();
    renderChatWindow(activeLeadId);
});