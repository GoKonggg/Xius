document.addEventListener('DOMContentLoaded', () => {
    // --- SAMPLE BLOG DATA ---
    // In a real application, this would come from a database or API.
    let blogPosts = [
        { 
            id: 1, 
            title: '10 Powerful SEO Tips for Beginners in 2025', 
            author: 'Jane Doe', 
            status: 'Published', 
            lastUpdated: '2025-09-18', 
            urlSlug: '10-powerful-seo-tips-beginners-2025', 
            content: 'In 2025, search engine optimization (SEO) remains crucial for online visibility. For beginners, understanding the basics can be overwhelming. This guide breaks down the most powerful and actionable SEO tips you can implement today.\n\n## 1. Keyword Research is King\n\nStart with thorough **keyword research**. Identify terms your target audience uses when searching for information related to your business. Tools like Google Keyword Planner, Ahrefs, or SEMrush can help you find high-volume, low-competition keywords.\n\n### On-Page Elements\n\nEnsure your title tags, meta descriptions, and headings (`H1`, `H2`, etc.) include your focus keywords. Don\'t forget to optimize your images with alt text!\n\n* **Title Tag:** Keep it concise and keyword-rich (50-60 characters).\n* **Meta Description:** Summarize your content compellingly (150-160 characters).\n* **URL Slug:** Make it short, descriptive, and include keywords.\n\n> "The best place to hide a dead body is page 2 of Google search results." - Ancient SEO Proverb\n\n## 2. High-Quality Content is Non-Negotiable\n\nCreate content that genuinely helps your audience. Aim for comprehensive articles that are well-researched, easy to read, and provide unique value. This is a sample text that has well over 300 words to satisfy the SEO checker. The more value you provide, the more likely other sites will link to you, boosting your authority.', 
            metaTitle: '10 Powerful SEO Tips for Beginners 2025 | The Complete Guide', 
            metaDescription: 'Learn the 10 most effective SEO tips for beginners to get your website ranking at the top of Google. This guide covers keyword research, on-page, and off-page SEO.',
            focusKeyword: 'seo tips',
            featuredImageUrl: 'https://images.unsplash.com/photo-1554042312-42b6a0b26333?auto=format&fit=crop&w=1470&q=80'
        },
        { 
            id: 2, 
            title: 'The Ultimate Guide to Keyword Research', 
            author: 'John Smith', 
            status: 'Published', 
            lastUpdated: '2025-09-15', 
            urlSlug: 'ultimate-guide-keyword-research', 
            content: 'Keyword research is the foundation of a successful SEO strategy...',
            metaTitle: 'The Ultimate Guide to Keyword Research for Beginners | Nexius', 
            metaDescription: 'How to conduct in-depth keyword research to find relevant, high-volume keywords for your business.',
            focusKeyword: 'keyword research',
            featuredImageUrl: ''
        },
        { 
            id: 3, 
            title: 'Understanding Core Web Vitals (Coming Soon)', 
            author: 'Jane Doe', 
            status: 'Draft', 
            lastUpdated: '2025-09-19', 
            urlSlug: '', 
            content: '',
            metaTitle: '', 
            metaDescription: '',
            focusKeyword: '',
            featuredImageUrl: '' 
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
    
    // Tab and Preview Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const previewTitle = document.getElementById('preview-title');
    const previewAuthor = document.getElementById('preview-author');
    const previewDate = document.getElementById('preview-date');
    const previewImageContainer = document.getElementById('preview-featured-image-container');
    const previewImage = document.getElementById('preview-featured-image');
    const previewContent = document.getElementById('preview-content');

    const inputsToAnalyze = [
        'post-title', 'url-slug', 'post-content', 'focus-keyword', 
        'meta-title', 'meta-description', 'featured-image-url', 'post-author'
    ].map(id => document.getElementById(id));


    // --- CORE FUNCTIONS ---

    const renderTable = () => {
        tableBody.innerHTML = '';
        if (blogPosts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-gray-500">No posts found. Create one!</td></tr>`;
            return;
        }

        blogPosts.forEach(post => {
            const statusClass = post.status === 'Published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800';
            const row = `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 font-semibold text-gray-900">${post.title}</td>
                    <td class="p-4 text-gray-600">${post.author}</td>
                    <td class="p-4"><span class="px-2.5 py-1 text-xs font-semibold ${statusClass} rounded-full">${post.status}</span></td>
                    <td class="p-4 text-gray-600">${post.lastUpdated}</td>
                    <td class="p-4 text-right space-x-3 whitespace-nowrap">
                        <button class="edit-btn text-sky-600 hover:text-sky-800 font-bold" data-id="${post.id}">Edit</button>
                        <button class="delete-btn text-red-600 hover:text-red-800 font-bold" data-id="${post.id}">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        addTableEventListeners();
    };
    
    const updatePreview = () => {
        const title = document.getElementById('post-title').value;
        const author = document.getElementById('post-author').value;
        const content = document.getElementById('post-content').value;
        const imageUrl = document.getElementById('featured-image-url').value;
        
        // Update title using prose structure
        previewTitle.innerHTML = `<h1>${title || 'Your Title Will Appear Here'}</h1>`;
        previewAuthor.textContent = author || 'Author Name';
        previewDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Render markdown content using the Marked.js library
        previewContent.innerHTML = marked.parse(content);

        // FIX: Handle featured image visibility correctly
        if (imageUrl && imageUrl.trim() !== '') {
            previewImage.src = imageUrl;
            previewImageContainer.classList.remove('hidden');
        } else {
            previewImageContainer.classList.add('hidden');
        }
    };
    
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
                ? `<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>`
                : `<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>`;
        };

        const kwInTitle = keyword && title.includes(keyword);
        checklistHTML += `<li class="${kwInTitle ? 'text-gray-800' : 'text-gray-500'}">${getIcon(kwInTitle)} Focus keyword is in the title.</li>`;
        
        const kwInDesc = keyword && metaDesc.toLowerCase().includes(keyword);
        checklistHTML += `<li class="${kwInDesc ? 'text-gray-800' : 'text-gray-500'}">${getIcon(kwInDesc)} Focus keyword in meta description.</li>`;
        
        const kwInSlug = keyword && slug.includes(keyword);
        checklistHTML += `<li class="${kwInSlug ? 'text-gray-800' : 'text-gray-500'}">${getIcon(kwInSlug)} Focus keyword in the URL slug.</li>`;

        const metaTitleLengthOk = metaTitle.length >= 50 && metaTitle.length <= 60;
        metaTitleCounter.textContent = `${metaTitle.length} / 60`;
        metaTitleCounter.className = `text-xs text-right mt-1 ${metaTitle.length > 60 || (metaTitle.length > 0 && metaTitle.length < 50) ? 'text-red-500 font-semibold' : 'text-gray-500'}`;
        checklistHTML += `<li class="${metaTitleLengthOk ? 'text-gray-800' : 'text-gray-500'}">${getIcon(metaTitleLengthOk)} Meta title length is optimal (50-60).</li>`;

        const metaDescLengthOk = metaDesc.length >= 150 && metaDesc.length <= 160;
        metaDescCounter.textContent = `${metaDesc.length} / 160`;
        metaDescCounter.className = `text-xs text-right mt-1 ${metaDesc.length > 160 || (metaDesc.length > 0 && metaDesc.length < 150) ? 'text-red-500 font-semibold' : 'text-gray-500'}`;
        checklistHTML += `<li class="${metaDescLengthOk ? 'text-gray-800' : 'text-gray-500'}">${getIcon(metaDescLengthOk)} Meta description is optimal (150-160).</li>`;

        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const contentLengthOk = wordCount >= 300;
        checklistHTML += `<li class="${contentLengthOk ? 'text-gray-800' : 'text-gray-500'}">${getIcon(contentLengthOk)} Content is long enough (min. 300 words). (${wordCount} words)</li>`;

        seoChecklist.innerHTML = checklistHTML;
    };


    // --- MODAL MANAGEMENT & USER ACTIONS ---

    const openModal = (modal) => {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('-translate-y-10');
            if (modal.id === 'post-modal') {
                runSeoAnalysis();
                updatePreview();
            }
        }, 10);
    };

    const closeModal = (modal) => {
        modal.classList.add('opacity-0');
        modal.querySelector('.modal-content').classList.add('-translate-y-10');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    const handleCreatePost = () => {
        modalTitle.textContent = 'Create New Post';
        postForm.reset();
        document.getElementById('post-id').value = '';
        switchTab('edit');
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
        document.getElementById('featured-image-url').value = post.featuredImageUrl;
        
        switchTab('edit');
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
            urlSlug: document.getElementById('url-slug').value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            content: document.getElementById('post-content').value,
            focusKeyword: document.getElementById('focus-keyword').value,
            metaTitle: document.getElementById('meta-title').value,
            metaDescription: document.getElementById('meta-description').value,
            featuredImageUrl: document.getElementById('featured-image-url').value
        };

        if (id) {
            blogPosts = blogPosts.map(p => p.id === parseInt(id) ? { ...p, ...newPostData, id: parseInt(id) } : p);
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

    // Run SEO analysis and update preview on any form input
    inputsToAnalyze.forEach(input => {
        input.addEventListener('input', () => {
            runSeoAnalysis();
            updatePreview();
        });
    });

    // Tab switching logic
    const switchTab = (activeTab) => {
        tabContents.forEach(content => {
            content.classList.remove('active-tab-content');
        });
        document.getElementById(`tab-${activeTab}`).classList.add('active-tab-content');

        tabButtons.forEach(button => {
            button.classList.remove('active-tab-button');
            if (button.dataset.tab === activeTab) {
                button.classList.add('active-tab-button');
            }
        });
    };
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });

    // Modal closing listeners
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
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