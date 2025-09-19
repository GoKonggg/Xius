document.addEventListener('DOMContentLoaded', () => {
  // --- DUMMY REVIEW DATA (SINKRON DENGAN users.js) ---
  // Pakai userId: u-101 (Alex), u-102 (Samantha), u-103 (Charles)
  const reviewsData = [
    { 
      id: 1,
      userId: 'u-101',
      userEmail: 'alex.j@example.com',
      user: 'Alex Johnson',
      rating: 4, 
      text: "Aplikasinya bagus, tapi PDF hasil generate-nya kadang miring sebelah. Excel-nya sih aman.", 
      date: '2025-09-18',
      status: 'Positive Feedback',
      generatedFiles: [
        { name: 'Financial_Report_Q3.xlsx', url: '#', type: 'excel', generatedAt: '2025-09-18T09:24:00+07:00', durationMs: 2400 },
        { name: 'Invoice_Summary_Sept.pdf', url: '#', type: 'pdf',   generatedAt: '2025-09-18T09:26:12+07:00', durationMs: 3900 }
      ],
      activityLog: [
        { ts: '2025-09-18T09:20:31+07:00', action: 'login',            detail: 'Login via email' },
        { ts: '2025-09-18T09:22:05+07:00', action: 'upload',           detail: 'Upload bank_statement_sep.csv (1.2 MB)' },
        { ts: '2025-09-18T09:24:02+07:00', action: 'generate_report',  detail: 'Financial_Report_Q3.xlsx' },
        { ts: '2025-09-18T09:26:15+07:00', action: 'generate_report',  detail: 'Invoice_Summary_Sept.pdf' },
        { ts: '2025-09-18T09:28:40+07:00', action: 'download',         detail: 'Invoice_Summary_Sept.pdf' }
      ]
    },
    { 
      id: 2,
      userId: 'u-102',
      userEmail: 'samantha.b@example.com',
      user: 'Samantha Bee',
      rating: 1, 
      text: "Hasil ekspor Excel berantakan, banyak kolom jadi satu. Tidak bisa dipakai sama sekali.", 
      date: '2025-09-17',
      status: 'Needs Attention',
      generatedFiles: [
        { name: 'Sales_Data_Export.xlsx', url: '#', type: 'excel', generatedAt: '2025-09-17T14:03:20+07:00', durationMs: 1800 }
      ],
      activityLog: [
        { ts: '2025-09-17T13:58:11+07:00', action: 'login',           detail: 'Login via Google' },
        { ts: '2025-09-17T14:01:07+07:00', action: 'mapping',         detail: 'Map 12 columns → 7 fields' },
        { ts: '2025-09-17T14:03:21+07:00', action: 'generate_report', detail: 'Sales_Data_Export.xlsx' },
        { ts: '2025-09-17T14:05:02+07:00', action: 'report_preview',  detail: 'Preview table merged unexpectedly' }
      ]
    },
    { 
      id: 3,
      userId: 'u-103',
      userEmail: 'charles.d@example.com',
      user: 'Charles Davis',
      rating: 5, 
      text: "Luar biasa! Sangat membantu pekerjaan saya. Ekspor PDF rapi dan profesional.", 
      date: '2025-09-16',
      status: 'Positive Feedback',
      generatedFiles: [
        { name: 'Annual_Performance_Review.pdf', url: '#', type: 'pdf', generatedAt: '2025-09-16T10:11:45+07:00', durationMs: 3200 }
      ],
      activityLog: [
        { ts: '2025-09-16T10:04:00+07:00', action: 'login',           detail: 'Login via email' },
        { ts: '2025-09-16T10:08:13+07:00', action: 'configure',       detail: 'Custom footer & brand color' },
        { ts: '2025-09-16T10:11:46+07:00', action: 'generate_report', detail: 'Annual_Performance_Review.pdf' },
        { ts: '2025-09-16T10:13:10+07:00', action: 'share',           detail: 'Share link to CFO' }
      ]
    },
    { 
      id: 4,
      userId: 'u-101', // Alex lagi
      userEmail: 'alex.j@example.com',
      user: 'Alex Johnson',
      rating: 3, 
      text: "Cukup oke. Tidak ada yang spesial, tapi berfungsi sesuai yang diiklankan.", 
      date: '2025-09-15',
      status: 'Positive Feedback',
      generatedFiles: [],
      activityLog: [
        { ts: '2025-09-15T08:12:33+07:00', action: 'login', detail: 'Login via email' }
      ]
    },
    { 
      id: 5,
      userId: 'u-102', // Samantha lagi
      userEmail: 'samantha.b@example.com',
      user: 'Samantha Bee',
      rating: 2, 
      text: "Sering crash saat generate file besar. Excel 5MB saja gagal terus.", 
      date: '2025-09-13',
      status: 'Needs Attention',
      generatedFiles: [],
      activityLog: [
        { ts: '2025-09-13T11:41:02+07:00', action: 'login',                    detail: 'Login via email' },
        { ts: '2025-09-13T11:44:18+07:00', action: 'upload',                   detail: 'huge_ledger.xlsx (5.1 MB)' },
        { ts: '2025-09-13T11:45:12+07:00', action: 'generate_report_failed',   detail: 'Timeout after 30s' }
      ]
    },
  ];

  // --- DOM ELEMENTS ---
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

  // --- UTILS ---
  const escapeHTML = (str) => {
    if (str == null) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const fmtDateTime = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const fmtDuration = (ms) => {
    if (ms == null) return '';
    if (ms < 1000) return `${ms} ms`;
    const s = Math.round(ms / 100) / 10;
    return `${s}s`;
  };

  const actionLabel = (a) => {
    const map = {
      login: 'Login',
      upload: 'Upload',
      mapping: 'Mapping Columns',
      configure: 'Customize Settings',
      generate_report: 'Generate Report',
      generate_report_failed: 'Report Failed',
      report_preview: 'Preview Report',
      download: 'Download',
      share: 'Share Link'
    };
    return map[a] || a;
  };

  const actionPillClass = (a) => {
    if (a.includes('failed')) return 'bg-red-100 text-red-700';
    if (a.includes('generate_report')) return 'bg-sky-100 text-sky-700';
    if (a === 'upload' || a === 'mapping') return 'bg-amber-100 text-amber-700';
    if (a === 'login') return 'bg-gray-100 text-gray-700';
    return 'bg-green-100 text-green-700';
  };

  // --- RENDER HELPERS ---
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
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      totalRating += r.rating;
    });

    const avgRating = reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : '0.0';
    avgRatingValueEl.textContent = avgRating;

    if (ratingBreakdownContainer) {
      ratingBreakdownContainer.innerHTML = '';
      for (let i = 5; i >= 1; i--) {
        const count = ratingCounts[i] || 0;
        const percentage = reviewsData.length > 0 ? (count / reviewsData.length) * 100 : 0;
        ratingBreakdownContainer.innerHTML += `
          <div class="flex items-center gap-3 text-sm cursor-default">
            <span class="text-gray-500 font-medium w-6 text-right">${i}★</span>
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div class="bg-yellow-400 h-2 rounded-full" style="width: ${percentage}%"></div>
            </div>
            <span class="text-gray-800 font-semibold w-8 text-right">${count}</span>
          </div>`;
      }
    }
    
    actionRequiredCountEl.textContent = reviewsData.filter(r => r.status === 'Needs Attention').length;
    
    const lowRatedReviews = reviewsData
      .filter(r => r.rating <= 2)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    spotlightContainer.innerHTML = '';
    if (lowRatedReviews.length > 0) {
      lowRatedReviews.forEach(review => {
        spotlightContainer.innerHTML += `
          <button class="w-full text-left border-t pt-4 first:border-t-0 focus:outline-none hover:bg-gray-50 rounded-md p-2"
                  data-spotlight-id="${review.id}">
            <div class="flex justify-between items-center">
              <p class="font-semibold text-sm text-gray-800">${escapeHTML(review.user)}</p>
              ${renderRatingStars(review.rating)}
            </div>
            <p class="text-sm text-gray-600 mt-2 truncate">${escapeHTML(review.text)}</p>
          </button>`;
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
      const borderColors = { 'Needs Attention': 'border-red-500', 'Positive Feedback': 'border-gray-200', 'Hidden': 'border-gray-200' };
      const statusClasses = { 'Needs Attention': 'bg-red-100 text-red-800', 'Positive Feedback': 'bg-green-100 text-green-800', 'Hidden': 'bg-gray-100 text-gray-800' };
      
      reviewsContainer.innerHTML += `
        <div class="border ${borderColors[review.status]} p-4 rounded-lg">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-800">${escapeHTML(review.user)}</p>
              <div class="flex items-center text-xs text-gray-500 gap-2 mt-1">
                <span>${escapeHTML(review.date)}</span>
                <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[review.status]}">${escapeHTML(review.status)}</span>
              </div>
            </div>
            ${renderRatingStars(review.rating)}
          </div>
          <p class="mt-3 text-gray-600 truncate">${escapeHTML(review.text)}</p>
          <div class="mt-4 pt-3 border-t flex items-center justify-end">
            <button class="view-details-btn px-4 py-2 text-sm bg-sky-500 text-white rounded-md hover:bg-sky-600" data-review-id="${review.id}">
              View Details & Files
            </button>
          </div>
        </div>`;
    });
  };

  // GANTI seluruh fungsi openReviewModal jadi ini
const openReviewModal = (reviewId) => {
  const review = reviewsData.find(r => r.id === reviewId);
  if (!review) return;

  // ----- FILES (kanan) -----
  const fileLinks = (review.generatedFiles || []).map(file => {
    const icon = file.type === 'excel'
      ? `<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" class="text-green-500" fill="currentColor"/></svg>`
      : `<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" class="text-red-500" fill="currentColor"/></svg>`;

    return `
      <a href="${file.url}" target="_blank" class="group flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 transition">
        ${icon}
        <div class="min-w-0">
          <div class="truncate font-medium text-sm text-sky-700 group-hover:underline">${escapeHTML(file.name)}</div>
          <div class="text-xs text-gray-500 mt-0.5">
            Generated: <span class="font-medium">${fmtDateTime(file.generatedAt)}</span>
            ${file.durationMs!=null ? `<span class="mx-1.5 text-gray-400">•</span>Duration: <span class="font-medium">${fmtDuration(file.durationMs)}</span>` : ''}
          </div>
        </div>
      </a>
    `;
  }).join('');

  // ----- TIMELINE (kiri) -----
  const activity = (review.activityLog || [])
    .slice()
    .sort((a,b) => new Date(b.ts) - new Date(a.ts))
    .map(ev => `
      <li class="relative pl-6">
        <!-- garis + bullet -->
        <span class="absolute left-0 top-2 -ml-[3px] h-2 w-2 rounded-full ${ev.action.includes('failed') ? 'bg-red-500' : 'bg-sky-500'}"></span>

        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold text-gray-900">${escapeHTML(actionLabel(ev.action))}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full ${actionPillClass(ev.action)}">${escapeHTML(ev.action)}</span>
          </div>
          <time class="text-xs text-gray-500 whitespace-nowrap">${fmtDateTime(ev.ts)}</time>
        </div>

        <p class="text-sm text-gray-700 mt-1.5">${escapeHTML(ev.detail || '-')}</p>
      </li>
    `).join('');

  // ----- MODAL CONTENT -----
  const modalContent = `
    <div class="modal-backdrop absolute inset-0 flex items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl transform">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <h3 id="review-detail-title" class="text-lg font-semibold text-gray-900">Review Details</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600 text-2xl font-bold" aria-label="Close">&times;</button>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-1 lg:grid-cols-3">
          <!-- Left: review + timeline -->
          <section class="lg:col-span-2 p-6 lg:p-7">
            <!-- user + rating -->
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="text-[15px] font-bold text-gray-900">${escapeHTML(review.user)}</div>
                <div class="text-sm text-gray-500">${escapeHTML(review.date)}</div>
              </div>
              <div class="scale-110">${renderRatingStars(review.rating)}</div>
            </div>

            <!-- review text -->
            <p class="mt-3.5 text-[15px] leading-relaxed text-gray-800">${escapeHTML(review.text)}</p>

            <!-- timeline -->
            <div class="mt-6">
              <h4 class="text-sm font-semibold text-gray-900 mb-3.5">User Activity Timeline</h4>
              ${
                activity
                  ? `<ul class="relative pl-0">
                      <div class="absolute left-2 top-0 bottom-0 w-px bg-gray-200"></div>
                      ${activity}
                    </ul>`
                  : `<p class="text-sm text-gray-400">No activity recorded.</p>`
              }
            </div>
          </section>

          <!-- Right: files -->
          <aside class="p-6 lg:p-7 bg-gray-50 border-l">
            <h4 class="text-sm font-semibold text-gray-900 mb-3.5">Generated Reports</h4>
            <div class="space-y-2.5">${fileLinks || '<p class="text-sm text-gray-400">No reports generated.</p>'}</div>
          </aside>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-3">
          <button
            class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
            data-user-id="${escapeHTML(review.userId || '')}"
            data-user-email="${escapeHTML(review.userEmail || '')}"
            id="open-user-management-btn"
          >
            Open in User Management
          </button>
          <button class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border border-red-200 text-red-700 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>
    </div>`;

  // mount + open
  modalContainer.innerHTML = modalContent;
  modalContainer.classList.remove('hidden');
  setTimeout(() => modalContainer.classList.remove('opacity-0'), 10);

  // close handlers
  modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeReviewModal));
  modalContainer.querySelector('.modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeReviewModal();
  });

  // deep-link handler (userId prioritas, fallback email)
  const openBtn = modalContainer.querySelector('#open-user-management-btn');
  openBtn?.addEventListener('click', () => {
    const uid = openBtn.getAttribute('data-user-id');
    const email = openBtn.getAttribute('data-user-email');
    const param = uid || email;
    window.location.href = `user-management.html?userId=${encodeURIComponent(param)}`;
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
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const statusFilter = filterStatusSelect?.value || 'all';
    const sortBy = sortSelect?.value || 'newest';

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

  // --- EVENTS ---
  if (searchInput) searchInput.addEventListener('input', applyFiltersAndSort);
  if (filterStatusSelect) filterStatusSelect.addEventListener('change', applyFiltersAndSort);
  if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndSort);
  
  if (queueActionRequiredBtn) {
    queueActionRequiredBtn.addEventListener('click', () => { 
      if (filterStatusSelect) {
        filterStatusSelect.value = 'Needs Attention'; 
        applyFiltersAndSort(); 
      }
    });
  }

  if (reviewsContainer) {
    reviewsContainer.addEventListener('click', (e) => {
      const button = e.target.closest('.view-details-btn');
      if (button) {
        const reviewId = parseInt(button.dataset.reviewId);
        openReviewModal(reviewId);
      }
    });
  }

  if (spotlightContainer) {
    spotlightContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-spotlight-id]');
      if (btn) {
        const rid = parseInt(btn.getAttribute('data-spotlight-id'));
        openReviewModal(rid);
      }
    });
  }

  // --- INIT ---
  const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusFromUrl = urlParams.get('filter_status');
    if (statusFromUrl && filterStatusSelect) filterStatusSelect.value = statusFromUrl;

    updateInsights();
    applyFiltersAndSort();
  };

  initializePage();
});
