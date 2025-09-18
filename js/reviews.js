document.addEventListener('DOMContentLoaded', () => {
    // --- DUMMY REVIEW DATA ---
    const reviewsData = [
        { 
            id: 1, user: 'Siti Aminah', rating: 4, 
            text: "Aplikasinya bagus, tapi PDF hasil generate-nya kadang miring sebelah. Excel-nya sih aman.", 
            date: '2025-09-18', status: 'Reviewed',
            generatedFiles: [
                { name: 'Financial_Report_Q3.xlsx', url: '#', type: 'excel' },
                { name: 'Invoice_Summary_Sept.pdf', url: '#', type: 'pdf' }
            ]
        },
        { 
            id: 2, user: 'Eko Prasetyo', rating: 1, 
            text: "Penipuan! Hasil ekspor Excel-nya berantakan, semua kolom jadi satu. Tidak bisa dipakai sama sekali.", 
            date: '2025-09-17', status: 'Needs Attention',
            generatedFiles: [
                { name: 'Sales_Data_Export.xlsx', url: '#', type: 'excel' }
            ]
        },
        { 
            id: 3, user: 'Budi Santoso', rating: 5, 
            text: "Luar biasa! Sangat membantu pekerjaan saya sehari-hari. Ekspor PDF-nya rapi dan profesional.", 
            date: '2025-09-16', status: 'Reviewed',
            generatedFiles: [
                { name: 'Annual_Performance_Review.pdf', url: '#', type: 'pdf' }
            ]
        },
        { 
            id: 4, user: 'Rina Marlina', rating: 3, 
            text: "Cukup oke. Tidak ada yang spesial, tapi berfungsi sesuai yang diiklankan.", 
            date: '2025-09-15', status: 'Reviewed',
            generatedFiles: []
        },
        { 
            id: 6, user: 'Jane Doe', rating: 2, 
            text: "Kecewa, sering crash saat generate file besar. File Excel 5MB saja sudah gagal terus.", 
            date: '2025-09-13', status: 'Needs Attention',
            generatedFiles: []
        },
    ];

    // --- DOM ELEMENT SELECTION ---
    const avgRatingValueEl = document.getElementById('average-rating-value');
    const actionRequiredCountEl = document.getElementById('action-required-count');
    const spotlightContainer = document.getElementById('spotlight-reviews-container');
    const reviewsContainer = document.getElementById('reviews-container');
    const searchInput = document.getElementById('review-search-input');
    const filterStatusSelect = document.getElementById('filter-status');
    const sortSelect = document.getElementById('sort-reviews');
    const queueActionRequiredBtn = document.getElementById('queue-action-required-btn');
    const modalContainer = document.getElementById('review-detail-modal');
    const ratingBreakdownContainer = document.getElementById('rating-breakdown-container');

    // --- RENDER FUNCTIONS ---
    const renderRatingStars = (rating) => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<svg class="h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
        }
        return `<div class="flex">${stars}</div>`;
    };

    const updateInsights = () => {
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;
        reviewsData.forEach(r => {
            ratingCounts[r.rating]++;
            totalRating += r.rating;
        });

        const avgRating = reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : '0.0';
        avgRatingValueEl.textContent = avgRating;

        if(ratingBreakdownContainer) {
            ratingBreakdownContainer.innerHTML = '';
            for (let i = 5; i >= 1; i--) {
                const count = ratingCounts[i];
                const percentage = reviewsData.length > 0 ? (count / reviewsData.length) * 100 : 0;
                ratingBreakdownContainer.innerHTML += `
                    <div class="flex items-center gap-3 text-sm">
                        <span class="text-gray-500 font-medium w-6 text-right">${i}★</span>
                        <div class="flex-1 bg-gray-200 rounded-full h-2"><div class="bg-yellow-400 h-2 rounded-full" style="width: ${percentage}%"></div></div>
                        <span class="text-gray-800 font-semibold w-8 text-right">${count}</span>
                    </div>`;
            }
        }
        
        actionRequiredCountEl.textContent = reviewsData.filter(r => r.status === 'Needs Attention').length;
        
        const lowRatedReviews = reviewsData.filter(r => r.rating <= 2).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        spotlightContainer.innerHTML = '';
        if (lowRatedReviews.length > 0) {
            lowRatedReviews.forEach(review => {
                spotlightContainer.innerHTML += `
                    <div class="border-t pt-4 first:border-t-0">
                        <div class="flex justify-between items-center">
                            <p class="font-semibold text-sm text-gray-800">${review.user}</p>
                            ${renderRatingStars(review.rating)}
                        </div>
                        <p class="text-sm text-gray-600 mt-2 truncate">${review.text}</p>
                    </div>`;
            });
        } else {
            spotlightContainer.innerHTML = `<p class="text-center text-gray-400 py-8">No critical reviews found.</p>`;
        }
    };
    
    const renderReviewCards = (reviews) => {
        reviewsContainer.innerHTML = '';
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `<p class="text-center text-gray-400 py-8">No reviews match the current filters.</p>`;
            return;
        }

        reviews.forEach(review => {
            const borderColors = { 'Needs Attention': 'border-red-500', 'Reviewed': 'border-gray-200', 'Hidden': 'border-gray-200' };
            const statusClasses = { 'Needs Attention': 'bg-red-100 text-red-800', 'Reviewed': 'bg-green-100 text-green-800', 'Hidden': 'bg-gray-100 text-gray-800' };
            
            reviewsContainer.innerHTML += `
                <div class="border ${borderColors[review.status]} p-4 rounded-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-gray-800">${review.user}</p>
                            <div class="flex items-center text-xs text-gray-500 gap-2 mt-1">
                                <span>${review.date}</span>
                                <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[review.status]}">${review.status}</span>
                            </div>
                        </div>
                        ${renderRatingStars(review.rating)}
                    </div>
                    <p class="mt-3 text-gray-600 truncate">${review.text}</p>
                    <div class="mt-4 pt-3 border-t flex items-center justify-end">
                        <button class="view-details-btn px-4 py-2 text-sm bg-sky-500 text-white rounded-md hover:bg-sky-600" data-review-id="${review.id}">
                            View Details & Files
                        </button>
                    </div>
                </div>`;
        });
    };

    const openReviewModal = (reviewId) => {
        const review = reviewsData.find(r => r.id === reviewId);
        if (!review) return;

        const fileLinks = review.generatedFiles.map(file => {
            const icon = file.type === 'excel' ? 
                `<svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 1h12v12H4V4zm4 2.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-4zM8.5 11a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-4z"/></svg>` : 
                `<svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4zm5 1a1 1 0 00-1 1v1a1 1 0 102 0V6a1 1 0 00-1-1zm2 0a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
            return `<a href="${file.url}" target="_blank" class="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors">
                        ${icon}
                        <span class="text-sm text-sky-600 hover:underline truncate">${file.name}</span>
                    </a>`;
        }).join('');

        const modalContent = `
            <div class="modal-backdrop absolute inset-0 flex items-center justify-center p-4">
                <div class="relative bg-white rounded-lg shadow-xl w-full max-w-4xl transform">
                    <div class="flex justify-between items-center p-4 border-b">
                        <h3 class="text-xl font-semibold text-gray-800">Review Details</h3>
                        <button class="close-modal-btn text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3">
                        <div class="md:col-span-2 p-6 border-r">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <p class="font-bold text-gray-900">${review.user}</p>
                                    <p class="text-sm text-gray-500">${review.date}</p>
                                </div>
                                ${renderRatingStars(review.rating)}
                            </div>
                            <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">${review.text}</div>
                        </div>
                        <div class="p-6 bg-gray-50">
                            <h4 class="font-semibold text-gray-700 mb-3">Associated Files</h4>
                            <div class="space-y-2">${fileLinks || '<p class="text-sm text-gray-400">No files attached.</p>'}</div>
                        </div>
                    </div>
                    <div class="p-4 bg-gray-100 border-t flex flex-col sm:flex-row justify-end items-center gap-3">
                        <button class="w-full sm:w-auto px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">View User</button>
                        <button class="w-full sm:w-auto px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Reply</button>
                        <button class="w-full sm:w-auto px-4 py-2 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200">Delete</button>
                    </div>
                </div>
            </div>`;
        
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');
        setTimeout(() => modalContainer.classList.remove('opacity-0'), 10);
        
        modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeReviewModal));
        modalContainer.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeReviewModal();
        });
    };

    const closeReviewModal = () => {
        modalContainer.classList.add('opacity-0');
        setTimeout(() => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
        }, 300);
    };

    const applyFiltersAndSort = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterStatusSelect.value;
        const sortBy = sortSelect.value;

        let processedReviews = reviewsData.filter(review => {
            const searchMatch = review.user.toLowerCase().includes(searchTerm) || review.text.toLowerCase().includes(searchTerm);
            const statusMatch = statusFilter === 'all' || review.status === statusFilter;
            return searchMatch && statusMatch;
        });

        processedReviews.sort((a, b) => {
            switch(sortBy) {
                case 'oldest': return new Date(a.date) - new Date(b.date);
                case 'highest': return b.rating - a.rating;
                case 'lowest': return a.rating - b.rating;
                case 'newest':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        renderReviewCards(processedReviews);
    };

    // --- EVENT LISTENERS ---
    [searchInput, filterStatusSelect, sortSelect].forEach(el => {
        el.addEventListener('input', applyFiltersAndSort);
    });
    
    queueActionRequiredBtn.addEventListener('click', () => { 
        filterStatusSelect.value = 'Needs Attention'; 
        applyFiltersAndSort(); 
    });

    reviewsContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.view-details-btn');
        if (button) {
            const reviewId = parseInt(button.dataset.reviewId);
            openReviewModal(reviewId);
        }
    });

    // --- INISIALISASI HALAMAN ---
    const initializePage = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const statusFromUrl = urlParams.get('filter_status');

        if (statusFromUrl) {
            filterStatusSelect.value = statusFromUrl;
        }

        updateInsights();
        applyFiltersAndSort();
    };

    initializePage();
});