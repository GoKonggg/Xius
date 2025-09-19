document.addEventListener('DOMContentLoaded', () => {

    const leadsData = {
        'lead1': {
            phone: '081234567890',
            name: 'Bapak Hendra (CFO, Maju Jaya)',
            lastMessage: "Terima kasih, tim kami akan segera review...",
            timestamp: 'Yesterday',
            unread: 2,
            messages: [
                { type: 'received', text: "Selamat siang, kami dari PT Maju Jaya tertarik dengan solusi Anda. Bisa kirimkan proposal untuk paket enterprise?", time: "Yesterday, 14:30" },
                { type: 'sent', text: "Terima kasih, Pak Hendra. Tentu, proposal akan segera kami siapkan dan kirimkan ke email Anda.", time: "Yesterday, 14:35" }
            ]
        },
        'lead2': {
            phone: '081234567893',
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
            phone: '081234567892',
            name: 'Andi - ProFinance Consultant',
            lastMessage: 'Apakah ada paket enterprise?',
            timestamp: '18/09/2025',
            unread: 0,
            messages: [
                { type: 'received', text: "Halo, saya seorang konsultan keuangan. Apakah ada paket enterprise untuk klien korporat saya?", time: '18/09/2025' }
            ]
        }
    };

    // --- SELEKSI ELEMEN DOM ---
    const contactListContainer = document.getElementById('contact-list'); // [PERBAIKAN] Menggunakan ID yang spesifik
    const chatHeader = document.querySelector('.p-3.flex.items-center.border-b .font-semibold');
    const messageArea = document.querySelector('.flex-1.overflow-y-auto.p-6 .flex.flex-col.space-y-4');
    const messageInput = document.querySelector('input[placeholder="Type a message"]');
    const sendButton = document.querySelector('.bg-sky-500.text-white.rounded-full');
    const searchInput = document.querySelector('input[placeholder="Search or start new chat"]');
    
    // helper ambil query param
const getParam = (k) => new URLSearchParams(location.search).get(k);

let activeLeadId = 'lead2'; // default lama

// override dari URL
const qLeadId = getParam('leadId');
const qPhone  = getParam('phone');

if (qLeadId && leadsData[qLeadId]) {
  activeLeadId = qLeadId;
} else if (qPhone) {
  const found = Object.entries(leadsData)
    .find(([_, v]) => (v.phone || '').replace(/\s+/g,'') === qPhone.replace(/\s+/g,''));
  if (found) activeLeadId = found[0];
}
 

    // --- FUNGSI-FUNGSI ---

    const renderContactList = (idsToRender = Object.keys(leadsData)) => {
        contactListContainer.innerHTML = ''; 
        
        if (idsToRender.length === 0) {
            contactListContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No contacts found.</p>`;
            return;
        }

        idsToRender.forEach(leadId => {
            const lead = leadsData[leadId];
            const isActive = leadId === activeLeadId ? 'bg-gray-100' : 'hover:bg-gray-100';
            const unreadBadge = lead.unread > 0 
                ? `<span class="w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">${lead.unread}</span>` 
                : '';

            // Menggunakan <div> sebagai pengganti <a> untuk item kontak
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
            const sentTick = `<svg class="w-4 h-4 text-sky-500 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.213 1.213a2 2 0 012.828 0l6.25 6.25a2 2 0 010 2.828l-10 10a2 2 0 01-2.828 0l-6.25-6.25a2 2 0 010-2.828l10-10zM12.04 7.96a1 1 0 00-1.414-1.414L6 11.172l-1.626-1.626a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l5.166-5.166z" clip-rule="evenodd" fill-rule="evenodd"></path><path d="M16.586 6.586a1 1 0 00-1.414-1.414l-5.166 5.166-1.626-1.626a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l6.5-6.5z"></path></svg>`;

            if (msg.type === 'sent') {
                messageHtml = `
                    <div class="flex justify-end">
                        <div class="max-w-lg p-3 rounded-lg bg-wa-green-light shadow-sm">
                            <p class="text-sm text-gray-800">${msg.text}</p>
                            <div class="flex justify-end items-center mt-1">
                                <p class="text-xs text-gray-500">${msg.time}</p>
                                ${sentTick}
                            </div>
                        </div>
                    </div>`;
            } else if (msg.type === 'received') {
                messageHtml = `
                    <div class="flex justify-start">
                        <div class="max-w-lg p-3 rounded-lg bg-white shadow-sm">
                            <p class="text-sm text-gray-800">${msg.text}</p>
                            <p class="text-xs text-gray-400 text-right mt-1">${msg.time}</p>
                        </div>
                    </div>`;
            }
            messageArea.innerHTML += messageHtml;
        });

        // Auto-scroll to the bottom
        messageArea.parentElement.scrollTop = messageArea.parentElement.scrollHeight;
    };

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
        leadsData[activeLeadId].lastMessage = text; // Update last message
        leadsData[activeLeadId].timestamp = currentTime; // Update timestamp

        renderChatWindow(activeLeadId);
        renderContactList(); // Re-render contact list to show new last message

        messageInput.value = '';
        messageInput.focus();
    };

    const addContactClickListeners = () => {
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            item.addEventListener('click', () => {
                const leadId = item.getAttribute('data-lead-id');
                if (leadId !== activeLeadId) {
                    activeLeadId = leadId;
                    searchInput.value = '';
                    renderContactList(); 
                    renderChatWindow(leadId);
                }
            });
        });
    };
    
    const handleSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredIds = Object.keys(leadsData).filter(leadId => 
            leadsData[leadId].name.toLowerCase().includes(searchTerm)
        );
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

    // Initial render
    renderContactList();
    renderChatWindow(activeLeadId);
});