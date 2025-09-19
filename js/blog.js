document.addEventListener('DOMContentLoaded', () => {
    // --- SAMPLE BLOG DATA ---
    // In a real application, this would come from a database or API.
    let blogPosts = [
        { 
            id: 1, 
            title: '10 Powerful SEO Tips for Beginners in 2025', 
            author: 'SEO Admin', 
            status: 'Published', 
            lastUpdated: '2025-09-18', 
            urlSlug: '10-powerful-seo-tips-beginners-2025', 
            content: 'Full content about 10 SEO tips... This is a sample content that is long enough to pass the 300-word minimum for the SEO analysis. The longer and more informative the content, the better it is for search engine rankings. Be sure to include keywords naturally in the text.', 
            metaTitle: '10 Powerful SEO Tips for Beginners 2025 | The Complete Guide', 
            metaDescription: 'Learn the 10 most effective SEO tips for beginners to get your website ranking at the top of Google. This guide covers keyword research, on-page, and off-page SEO.',
            focusKeyword: 'seo tips' 
        },
        { 
            id: 2, 
            title: 'The Ultimate Guide to Keyword Research', 
            author: 'Content Team', 
            status: 'Published', 
            lastUpdated: '2025-09-15', 
            urlSlug: 'ultimate-guide-keyword-research', 
            content: 'Keyword research is the foundation of a successful SEO strategy...',
            metaTitle: 'The Ultimate Guide to Keyword Research for Beginners | Nexius', 
            metaDescription: 'How to conduct in-depth keyword research to find relevant, high-volume keywords for your business.',
            focusKeyword: 'keyword research' 
        },
        { 
            id: 3, 
            title: 'Understanding Core Web Vitals (Coming Soon)', 
            author: 'SEO Admin', 
            status: 'Draft', 
            lastUpdated: '2025-09-19', 
            urlSlug: '', 
            content: '',
            metaTitle: '', 
            metaDescription: '',
            focusKeyword: '' 
        }
    ];

    // --- DOM ELEMENT SELECTION ---
    const tableBody = document.getElementById('blog-table-body');
    const createPostBtn = document.getElementById('create-post-btn');
    const postModal = document.getElementById('post-modal');
    const deleteModal = document.getElementById('delete-modal');
    const postForm = document.getElementById('post-form');
    const modalTitle = document.getElementById('modal-title');
    let postIdToDelete = null;

    // SEO Analysis Elements
    const seoChecklist = document.getElementById('seo-checklist');
    const metaTitleCounter = document.getElementById('meta-title-counter');
    const metaDescCounter = document.getElementById('meta-desc-counter');
    
    const inputsToAnalyze = [
        'post-title', 'url-slug', 'post-content', 'focus-keyword', 'meta-title', 'meta-description'
    ].map(id => document.getElementById(id));


    // --- CORE FUNCTIONS ---

    /**
     * Renders the blog post data into the main table.
     */
    const renderTable = () => {
        tableBody.innerHTML = '';
        if (blogPosts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4 text-gray-500">No posts found. Create one!</td></tr>`;
            return;
        }

        blogPosts.forEach(post => {
            const statusClass = post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800';
            const row = `
                <tr>
                    <td class="p-4 font-medium text-gray-800">${post.title}</td>
                    <td class="p-4 text-gray-600">${post.author}</td>
                    <td class="p-4"><span class="px-2 py-1 text-xs font-semibold ${statusClass} rounded-full">${post.status}</span></td>
                    <td class="p-4 text-gray-600">${post.lastUpdated}</td>
                    <td class="p-4 text-right space-x-2 whitespace-nowrap">
                        <button class="edit-btn text-sky-600 hover:text-sky-800 font-medium" data-id="${post.id}">Edit</button>
                        <button class="delete-btn text-red-600 hover:text-red-800 font-medium" data-id="${post.id}">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        addTableEventListeners();
    };

    /**
     * Runs a real-time SEO analysis based on the form inputs and updates the UI.
     */
    const runSeoAnalysis = () => {
        const title = document.getElementById('post-title').value.toLowerCase();
        const content = document.getElementById('post-content').value.toLowerCase();
        const metaTitle = document.getElementById('meta-title').value;
        const metaDesc = document.getElementById('meta-description').value;
        const slug = document.getElementById('url-slug').value.toLowerCase();
        const keyword = document.getElementById('focus-keyword').value.toLowerCase().trim();

        let checklistHTML = '';
        
        const getIcon = (isSuccess) => {
            return isSuccess 
                ? `<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`
                : `<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
        };

        // 1. Check: Focus keyword in title
        const kwInTitle = keyword && title.includes(keyword);
        checklistHTML += `<li class="${kwInTitle ? 'text-green-700' : 'text-red-700'}">${getIcon(kwInTitle)} Focus keyword is in the title.</li>`;

        // 2. Check: Focus keyword in meta description
        const kwInDesc = keyword && metaDesc.toLowerCase().includes(keyword);
        checklistHTML += `<li class="${kwInDesc ? 'text-green-700' : 'text-red-700'}">${getIcon(kwInDesc)} Focus keyword is in the meta description.</li>`;
        
        // 3. Check: Focus keyword in URL slug
        const kwInSlug = keyword && slug.includes(keyword);
        checklistHTML += `<li class="${kwInSlug ? 'text-green-700' : 'text-red-700'}">${getIcon(kwInSlug)} Focus keyword is in the URL slug.</li>`;

        // 4. Check: Meta Title length (optimal 50-60 chars)
        const metaTitleLengthOk = metaTitle.length >= 50 && metaTitle.length <= 60;
        metaTitleCounter.textContent = `${metaTitle.length} / 60`;
        metaTitleCounter.className = `text-xs text-right mt-1 ${metaTitle.length > 60 || metaTitle.length < 50 ? 'text-red-500' : 'text-gray-500'}`;
        checklistHTML += `<li class="${metaTitleLengthOk ? 'text-green-700' : 'text-red-700'}">${getIcon(metaTitleLengthOk)} Meta title length is optimal (50-60).</li>`;

        // 5. Check: Meta Description length (optimal 150-160 chars)
        const metaDescLengthOk = metaDesc.length >= 150 && metaDesc.length <= 160;
        metaDescCounter.textContent = `${metaDesc.length} / 160`;
        metaDescCounter.className = `text-xs text-right mt-1 ${metaDesc.length > 160 || metaDesc.length < 150 ? 'text-red-500' : 'text-gray-500'}`;
        checklistHTML += `<li class="${metaDescLengthOk ? 'text-green-700' : 'text-red-700'}">${getIcon(metaDescLengthOk)} Meta description length is optimal (150-160).</li>`;

        // 6. Check: Content length (min 300 words)
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const contentLengthOk = wordCount >= 300;
        checklistHTML += `<li class="${contentLengthOk ? 'text-green-700' : 'text-red-700'}">${getIcon(contentLengthOk)} Content is long enough (min. 300 words). (${wordCount} words)</li>`;

        seoChecklist.innerHTML = checklistHTML;
    };


    // --- MODAL MANAGEMENT FUNCTIONS ---

    const openModal = (modal) => {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('-translate-y-10');
            if (modal.id === 'post-modal') {
                runSeoAnalysis();
            }
        }, 10);
    };

    const closeModal = (modal) => {
        modal.classList.add('opacity-0');
        modal.querySelector('.modal-content').classList.add('-translate-y-10');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    
    // --- USER ACTION HANDLERS ---

    const handleCreatePost = () => {
        modalTitle.textContent = 'Create New Post';
        postForm.reset();
        document.getElementById('post-id').value = '';
        openModal(postModal);
    };
    
    const handleEditPost = (id) => {
        const post = blogPosts.find(p => p.id === id);
        if (!post) return;

        modalTitle.textContent = 'Edit Post';
        document.getElementById('post-id').value = post.id;
        document.getElementById('post-title').value = post.title;
        document.getElementById('url-slug').value = post.urlSlug;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-author').value = post.author;
        document.getElementById('post-status').value = post.status;
        document.getElementById('focus-keyword').value = post.focusKeyword;
        document.getElementById('meta-title').value = post.metaTitle;
        document.getElementById('meta-description').value = post.metaDescription;
        
        openModal(postModal);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('post-id').value;
        const newPostData = {
            title: document.getElementById('post-title').value,
            author: document.getElementById('post-author').value,
            status: document.getElementById('post-status').value,
            lastUpdated: new Date().toISOString().split('T')[0],
            urlSlug: document.getElementById('url-slug').value.toLowerCase().replace(/\s+/g, '-'),
            content: document.getElementById('post-content').value,
            focusKeyword: document.getElementById('focus-keyword').value,
            metaTitle: document.getElementById('meta-title').value,
            metaDescription: document.getElementById('meta-description').value
        };

        if (id) {
            blogPosts = blogPosts.map(p => p.id === parseInt(id) ? { ...p, ...newPostData } : p);
        } else {
            newPostData.id = blogPosts.length > 0 ? Math.max(...blogPosts.map(p => p.id)) + 1 : 1;
            blogPosts.push(newPostData);
        }

        renderTable();
        closeModal(postModal);
    };

    const handleDeletePost = (id) => {
        postIdToDelete = id;
        openModal(deleteModal);
    };

    const confirmDelete = () => {
        if (postIdToDelete) {
            blogPosts = blogPosts.filter(p => p.id !== postIdToDelete);
            postIdToDelete = null;
            renderTable();
            closeModal(deleteModal);
        }
    };
    
    // --- EVENT LISTENER SETUP ---

    const addTableEventListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleEditPost(parseInt(e.target.dataset.id, 10)));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleDeletePost(parseInt(e.target.dataset.id, 10)));
        });
    };

    createPostBtn.addEventListener('click', handleCreatePost);
    postForm.addEventListener('submit', handleFormSubmit);

    inputsToAnalyze.forEach(input => {
        input.addEventListener('input', runSeoAnalysis);
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalToClose = e.target.closest('.modal');
            if (modalToClose) closeModal(modalToClose);
        });
    });

    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete-btn').addEventListener('click', () => closeModal(deleteModal));
    
    postModal.addEventListener('click', (e) => {
        if (e.target === postModal) closeModal(postModal);
    });
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeModal(deleteModal);
    });

    // --- INITIALIZATION ---
    renderTable();
});