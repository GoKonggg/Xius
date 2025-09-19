document.addEventListener('DOMContentLoaded', () => {
  // -------- SAMPLE DATA --------
  let blogPosts = [
    { 
      id: 1,
      title: '10 Powerful SEO Tips for Beginners in 2025',
      author: 'Jane Doe',
      status: 'Published',
      lastUpdated: '2025-09-18',
      urlSlug: '10-powerful-seo-tips-beginners-2025',
      content: '<h2>Keyword Research is King</h2><p>Start with thorough <strong>keyword research</strong>…</p>',
      metaTitle: '10 Powerful SEO Tips for Beginners 2025 | The Complete Guide',
      metaDescription: 'Learn the 10 most effective SEO tips for beginners to get your website ranking.',
      focusKeyword: 'seo tips',
      featuredImageUrl: ''
    },
    { 
      id: 2,
      title: 'The Ultimate Guide to Keyword Research',
      author: 'John Smith',
      status: 'Published',
      lastUpdated: '2025-09-15',
      urlSlug: 'ultimate-guide-keyword-research',
      content: '<p>Keyword research is the foundation of a successful SEO strategy…</p>',
      metaTitle: 'The Ultimate Guide to Keyword Research for Beginners | Nexius',
      metaDescription: 'How to conduct in-depth keyword research.',
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

  // -------- DOM --------
  const tableBody = document.getElementById('blog-table-body');
  const createPostBtn = document.getElementById('create-post-btn');
  const postModal = document.getElementById('post-modal');
  const deleteModal = document.getElementById('delete-modal');
  const postForm = document.getElementById('post-form');
  const modalTitle = document.getElementById('modal-title');
  let postIdToDelete = null;

  // SEO / Preview
  const seoChecklist = document.getElementById('seo-checklist');
  const metaTitleCounter = document.getElementById('meta-title-counter');
  const metaDescCounter = document.getElementById('meta-desc-counter');

  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  const previewTitle = document.getElementById('preview-title');
  const previewAuthor = document.getElementById('preview-author');
  const previewDate = document.getElementById('preview-date');
  const previewImageContainer = document.getElementById('preview-featured-image-container');
  const previewImage = document.getElementById('preview-featured-image');
  const previewContent = document.getElementById('preview-content');

  // hidden textarea -> serialization sink
  const contentTextarea = document.getElementById('post-content');

  const inputsToAnalyze = [
    'post-title','url-slug','post-content','focus-keyword',
    'meta-title','meta-description','featured-image-url','post-author'
  ].map(id => document.getElementById(id));

  // Featured image: device-only
  const featuredInput = document.getElementById('featured-image-url');
  featuredInput.readOnly = true;
  const featBtn = document.createElement('button');
  featBtn.type = 'button';
  featBtn.id = 'btn-featured-upload';
  featBtn.className = 'mt-2 px-3 py-1.5 rounded-md bg-white border text-sm hover:bg-gray-50';
  featBtn.textContent = 'Upload Featured Image from Device';
  featuredInput.parentElement.appendChild(featBtn);

  // -------- BLOCK EDITOR (Rich Card) --------
  // State: array of { html: string }
  let blocks = [];

  // Shell above textarea
  const editorShell = document.createElement('div');
  editorShell.className = 'space-y-3';
  const editorList = document.createElement('div');
  editorList.id = 'rich-blocks';
  editorList.className = 'space-y-4';
  contentTextarea.classList.add('hidden');
  contentTextarea.parentElement.insertBefore(editorShell, contentTextarea);
  editorShell.appendChild(editorList);

  // Bottom sticky "Add New Block" bar
  const addBar = document.createElement('div');
  addBar.className = 'sticky bottom-0 -mb-3 pt-3 bg-gradient-to-t from-white via-white/90 to-transparent';
  addBar.innerHTML = `
  <div class="flex justify-center">
    <button type="button" id="add-card"
      class="inline-flex items-center gap-2 rounded-full bg-sky-600 text-white text-sm font-semibold px-4 py-2 shadow-md hover:bg-sky-700 focus:outline-none">
      <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
      Add Card
    </button>
  </div>
`;

  editorShell.appendChild(addBar);

  // ---- Utils
  const esc = (t='') => t.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const stripTags = (html='') => html.replace(/<[^>]*>/g,' ');
  const openPicker = (accept='image/*') => new Promise(res => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = () => res(input.files?.[0] || null);
    input.click();
  });
  const fileToDataUrlResized = (file, maxSide=1600, quality=0.9) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img, w=width, h=height;
        if (Math.max(width,height) > maxSide) {
          if (width >= height) { w = maxSide; h = Math.round(height/width*maxSide); }
          else { h = maxSide; w = Math.round(width/height*maxSide); }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        const type = (file.type || 'image/jpeg').includes('png') ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(type, quality));
      };
      img.onerror = () => resolve(fr.result);
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  // insert HTML at caret within an editor
  function placeCaretAtEnd(el) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function insertHTMLAtCaret(editor, html) {
    editor.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      editor.insertAdjacentHTML('beforeend', html);
      placeCaretAtEnd(editor);
      return;
    }
    const range = sel.getRangeAt(0);
    const frag = range.createContextualFragment(html);
    range.deleteContents();
    range.insertNode(frag);
    sel.removeAllRanges();
    placeCaretAtEnd(editor);
  }

  // ---- Per-block toolbar
  const makeToolbar = () => {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-wrap items-center gap-1.5';
    wrap.innerHTML = `
      <button data-cmd="bold" class="px-2 py-1 text-sm border rounded hover:bg-gray-50 font-semibold">B</button>
      <button data-cmd="italic" class="px-2 py-1 text-sm border rounded hover:bg-gray-50 italic">I</button>
      <button data-cmd="underline" class="px-2 py-1 text-sm border rounded hover:bg-gray-50 underline decoration-1">U</button>
      <span class="h-5 w-px bg-gray-300 mx-1"></span>
      <select data-cmd="heading" class="border rounded px-2 py-1 text-sm">
        <option value="p">Paragraph</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
      </select>
      <select data-cmd="font" class="border rounded px-2 py-1 text-sm">
        <option value="">Default font</option>
        <option value="serif">Serif</option>
        <option value="monospace">Monospace</option>
      </select>
      <select data-cmd="size" class="border rounded px-2 py-1 text-sm">
        <option value="">Normal</option>
        <option value="smaller">Small</option>
        <option value="larger">Large</option>
        <option value="x-large">X-Large</option>
      </select>
      <span class="h-5 w-px bg-gray-300 mx-1"></span>
      <button data-cmd="ul" class="px-2 py-1 text-sm border rounded hover:bg-gray-50">• List</button>
      <button data-cmd="left" class="px-2 py-1 text-sm border rounded hover:bg-gray-50">Left</button>
      <button data-cmd="center" class="px-2 py-1 text-sm border rounded hover:bg-gray-50">Center</button>
      <button data-cmd="right" class="px-2 py-1 text-sm border rounded hover:bg-gray-50">Right</button>
      <span class="h-5 w-px bg-gray-300 mx-1"></span>
      <button data-cmd="image" class="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Insert image</button>
    `;
    return wrap;
  };

  // ---- Render Blocks
  let dragIndex = null;
  const renderBlocks = () => {
    editorList.innerHTML = '';
    blocks.forEach((b, idx) => {
      const card = document.createElement('div');
      card.className = 'bg-white border border-gray-200 rounded-xl shadow-sm p-4 ring-1 ring-transparent hover:ring-sky-100 transition-shadow';
      card.setAttribute('draggable','true');
      card.dataset.index = idx;

      // header
      const head = document.createElement('div');
      head.className = 'flex items-center justify-between mb-3';
      head.innerHTML = `
        <div class="flex items-center gap-2 text-gray-400 select-none cursor-grab" title="Drag to reorder">
          <span class="text-lg leading-none">⋮⋮</span>
          <span class="text-sm text-gray-500">Block</span>
        </div>
        <button class="text-red-600 border rounded-lg px-4 py-1.5 hover:bg-red-50">Delete</button>
      `;

      const tools = makeToolbar();

      const editor = document.createElement('div');
      editor.className = 'min-h-[130px] bg-gray-50 border rounded-lg p-3 focus:outline-none prose prose-sm max-w-none';
      editor.contentEditable = 'true';
      editor.innerHTML = b.html || '<p></p>';

      // actions
      head.querySelector('button').addEventListener('click', () => {
        blocks.splice(idx,1);
        renderBlocks();
        syncTextareaAndPreview();
      });

      tools.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const cmd = btn.dataset.cmd;
        editor.focus();
        if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline') {
          document.execCommand(cmd, false, null);
        } else if (cmd === 'ul') {
          document.execCommand('insertUnorderedList');
        } else if (cmd === 'left' || cmd === 'center' || cmd === 'right') {
          document.execCommand('justify' + cmd.charAt(0).toUpperCase() + cmd.slice(1));
        } else if (cmd === 'image') {
          const f = await openPicker('image/*');
          if (!f) return;
          const url = await fileToDataUrlResized(f);
          insertHTMLAtCaret(editor, `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.06)" />`);
        }
        blocks[idx].html = editor.innerHTML;
        syncTextareaAndPreview();
      });
      tools.addEventListener('change', (e) => {
        const sel = e.target;
        if (!sel.dataset.cmd) return;
        editor.focus();
        if (sel.dataset.cmd === 'heading') {
          if (sel.value === 'p') document.execCommand('formatBlock', false, 'P');
          else document.execCommand('formatBlock', false, sel.value.toUpperCase());
        } else if (sel.dataset.cmd === 'font') {
          editor.style.fontFamily = sel.value || '';
        } else if (sel.dataset.cmd === 'size') {
          editor.style.fontSize = sel.value || '';
        }
        blocks[idx].html = editor.innerHTML;
        syncTextareaAndPreview();
      });

      // paste & DnD images
      editor.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items || [];
        for (const it of items) {
          if (it.type?.startsWith('image/')) {
            e.preventDefault();
            const file = it.getAsFile();
            if (!file) continue;
            const url = await fileToDataUrlResized(file);
            insertHTMLAtCaret(editor, `<img src="${url}" alt="pasted" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.06)" />`);
            blocks[idx].html = editor.innerHTML;
            syncTextareaAndPreview();
          }
        }
      });
      editor.addEventListener('dragover', (e)=>e.preventDefault());
      editor.addEventListener('drop', async (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []).filter(f=>f.type.startsWith('image/'));
        for (const f of files) {
          const url = await fileToDataUrlResized(f);
          insertHTMLAtCaret(editor, `<img src="${url}" alt="dropped" style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.06)" />`);
        }
        blocks[idx].html = editor.innerHTML;
        syncTextareaAndPreview();
      });

      // keep state
      editor.addEventListener('input', () => {
        blocks[idx].html = editor.innerHTML;
        syncTextareaAndPreview();
      });

      // drag reorder
      card.addEventListener('dragstart', () => { dragIndex = idx; card.classList.add('opacity-60'); });
      card.addEventListener('dragend', () => { dragIndex = null; card.classList.remove('opacity-60'); });
      card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('ring-2','ring-sky-300'); });
      card.addEventListener('dragleave', () => { card.classList.remove('ring-2','ring-sky-300'); });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('ring-2','ring-sky-300');
        if (dragIndex===null || dragIndex===idx) return;
        const moved = blocks.splice(dragIndex,1)[0];
        blocks.splice(idx,0,moved);
        renderBlocks();
        syncTextareaAndPreview();
      });

      card.appendChild(head);
      card.appendChild(tools);
      card.appendChild(editor);
      editorList.appendChild(card);
    });
  };

  // Bottom add buttons
  addBar.querySelector('#add-card').addEventListener('click', () => {
  blocks.push({ html: '<p></p>' });         // default paragraph
  renderBlocks();
  syncTextareaAndPreview();
  editorList.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


  // -------- TABLE --------
  const renderTable = () => {
    tableBody.innerHTML = '';
    if (!blogPosts.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-gray-500">No posts found. Create one!</td></tr>`;
      return;
    }
    blogPosts.forEach(post => {
      const statusClass = post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
      tableBody.innerHTML += `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="p-4 font-semibold text-gray-900">${esc(post.title)}</td>
          <td class="p-4 text-gray-600">${esc(post.author)}</td>
          <td class="p-4"><span class="px-2.5 py-1 text-xs font-semibold ${statusClass} rounded-full">${post.status}</span></td>
          <td class="p-4 text-gray-600">${post.lastUpdated}</td>
          <td class="p-4 text-right space-x-3 whitespace-nowrap">
            <button class="edit-btn text-sky-600 hover:text-sky-800 font-bold" data-id="${post.id}">Edit</button>
            <button class="delete-btn text-red-600 hover:text-red-800 font-bold" data-id="${post.id}">Delete</button>
          </td>
        </tr>`;
    });
    document.querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click',e=>handleEditPost(parseInt(e.target.dataset.id,10))));
    document.querySelectorAll('.delete-btn').forEach(b=>b.addEventListener('click',e=>handleDeletePost(parseInt(e.target.dataset.id,10))));
  };

  // -------- PREVIEW & SEO --------
  const updatePreview = () => {
    const title = document.getElementById('post-title').value;
    const author = document.getElementById('post-author').value;

    previewTitle.innerHTML = `<h1>${esc(title || 'Your Title Will Appear Here')}</h1>`;
    previewAuthor.textContent = author || 'Author Name';
    previewDate.textContent = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

    const html = contentTextarea.value || '';
    previewContent.innerHTML = html;

    // featured: if empty -> first image
    let feat = featuredInput.value;
    if (!feat) {
      const dummy = document.createElement('div');
      dummy.innerHTML = html;
      const firstImg = dummy.querySelector('img');
      if (firstImg) feat = firstImg.src;
    }
    if (feat) {
      previewImage.src = feat;
      previewImageContainer.classList.remove('hidden');
    } else {
      previewImageContainer.classList.add('hidden');
    }
  };

  const runSeoAnalysis = () => {
    const title = (document.getElementById('post-title').value || '').toLowerCase();
    const html = contentTextarea.value || '';
    const content = stripTags(html).toLowerCase();

    const metaTitle = document.getElementById('meta-title').value || '';
    const metaDesc = document.getElementById('meta-description').value || '';
    const slug = (document.getElementById('url-slug').value || '').toLowerCase();
    const keyword = (document.getElementById('focus-keyword').value || '').toLowerCase().trim();

    let checklistHTML = '';
    const icon = ok => ok
      ? `<svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>`
      : `<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>`;

    const kwInTitle = keyword && title.includes(keyword);
    checklistHTML += `<li class="${kwInTitle?'text-gray-800':'text-gray-500'}">${icon(kwInTitle)} Focus keyword is in the title.</li>`;

    const kwInDesc = keyword && metaDesc.toLowerCase().includes(keyword);
    checklistHTML += `<li class="${kwInDesc?'text-gray-800':'text-gray-500'}">${icon(kwInDesc)} Focus keyword in meta description.</li>`;

    const kwInSlug = keyword && slug.includes(keyword);
    checklistHTML += `<li class="${kwInSlug?'text-gray-800':'text-gray-500'}">${icon(kwInSlug)} Focus keyword in the URL slug.</li>`;

    metaTitleCounter.textContent = `${metaTitle.length} / 60`;
    metaTitleCounter.className = `text-xs text-right mt-1 ${(metaTitle.length>60||(metaTitle.length>0&&metaTitle.length<50))?'text-red-500 font-semibold':'text-gray-500'}`;
    checklistHTML += `<li class="${(metaTitle.length>=50&&metaTitle.length<=60)?'text-gray-800':'text-gray-500'}">${icon(metaTitle.length>=50&&metaTitle.length<=60)} Meta title length is optimal (50–60).</li>`;

    metaDescCounter.textContent = `${metaDesc.length} / 160`;
    metaDescCounter.className = `text-xs text-right mt-1 ${(metaDesc.length>160||(metaDesc.length>0&&metaDesc.length<150))?'text-red-500 font-semibold':'text-gray-500'}`;
    checklistHTML += `<li class="${(metaDesc.length>=150&&metaDesc.length<=160)?'text-gray-800':'text-gray-500'}">${icon(metaDesc.length>=150&&metaDesc.length<=160)} Meta description is optimal (150–160).</li>`;

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    checklistHTML += `<li class="${wordCount>=300?'text-gray-800':'text-gray-500'}">${icon(wordCount>=300)} Content is long enough (min. 300 words). (${wordCount} words)</li>`;

    seoChecklist.innerHTML = checklistHTML;
  };

  // serialize blocks -> textarea -> preview
  const syncTextareaAndPreview = () => {
    const html = blocks.map(b => `<div class="editor-block">${b.html || ''}</div>`).join('\n');
    contentTextarea.value = html;
    runSeoAnalysis();
    updatePreview();
  };

  // -------- Modal lifecycle --------
  const openModal = (modal) => {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.querySelector('.modal-content').classList.remove('-translate-y-10');
      if (modal.id === 'post-modal') { runSeoAnalysis(); updatePreview(); }
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
    blocks = [{ html: '<p></p>' }];       // start with 1 block
    renderBlocks(); syncTextareaAndPreview();
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
    document.getElementById('post-author').value = post.author;
    document.getElementById('post-status').value = post.status;
    document.getElementById('focus-keyword').value = post.focusKeyword || '';
    document.getElementById('meta-title').value = post.metaTitle || '';
    document.getElementById('meta-description').value = post.metaDescription || '';
    featuredInput.value = post.featuredImageUrl || '';

    // Parse existing HTML into blocks
    const container = document.createElement('div');
    container.innerHTML = post.content || '';
    const existing = Array.from(container.querySelectorAll('.editor-block'));
    if (existing.length) {
      blocks = existing.map(el => ({ html: el.innerHTML }));
    } else {
      blocks = Array.from(container.childNodes).map(n => ({ html: n.outerHTML || `<p>${n.textContent||''}</p>` }));
      if (!blocks.length) blocks = [{ html: '<p></p>' }];
    }
    renderBlocks(); syncTextareaAndPreview();
    switchTab('edit');
    openModal(postModal);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // default featured = first image
    if (!featuredInput.value) {
      const dummy = document.createElement('div');
      dummy.innerHTML = contentTextarea.value;
      const firstImg = dummy.querySelector('img');
      featuredInput.value = firstImg ? firstImg.src : '';
    }

    const id = document.getElementById('post-id').value;
    const newPostData = {
      title: document.getElementById('post-title').value,
      author: document.getElementById('post-author').value,
      status: document.getElementById('post-status').value,
      lastUpdated: new Date().toISOString().split('T')[0],
      urlSlug: document.getElementById('url-slug').value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),
      content: contentTextarea.value, // combined HTML
      focusKeyword: document.getElementById('focus-keyword').value,
      metaTitle: document.getElementById('meta-title').value,
      metaDescription: document.getElementById('meta-description').value,
      featuredImageUrl: featuredInput.value
    };

    if (id) {
      blogPosts = blogPosts.map(p => p.id === parseInt(id,10) ? { ...p, ...newPostData, id: parseInt(id,10) } : p);
    } else {
      newPostData.id = blogPosts.length ? Math.max(...blogPosts.map(p=>p.id)) + 1 : 1;
      blogPosts.push(newPostData);
    }
    renderTable();
    closeModal(postModal);
  };

  const handleDeletePost = (id) => { postIdToDelete = id; openModal(deleteModal); };
  const confirmDelete = () => {
    if (postIdToDelete) {
      blogPosts = blogPosts.filter(p => p.id !== postIdToDelete);
      postIdToDelete = null;
      renderTable();
      closeModal(deleteModal);
    }
  };

  // -------- Events --------
  const switchTab = (activeTab) => {
    tabContents.forEach(c=>c.classList.remove('active-tab-content'));
    document.getElementById(`tab-${activeTab}`).classList.add('active-tab-content');
    tabButtons.forEach(b=>{ b.classList.remove('active-tab-button'); if (b.dataset.tab===activeTab) b.classList.add('active-tab-button'); });
  };
  tabButtons.forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));

  createPostBtn.addEventListener('click', handleCreatePost);
  postForm.addEventListener('submit', handleFormSubmit);
  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
  document.getElementById('cancel-delete-btn').addEventListener('click', () => closeModal(deleteModal));
  document.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', e => closeModal(e.target.closest('.modal'))));
  postModal.addEventListener('click', e => { if (e.target===postModal) closeModal(postModal); });
  deleteModal.addEventListener('click', e => { if (e.target===deleteModal) closeModal(deleteModal); });

  // Featured upload (device only)
  featBtn.addEventListener('click', async () => {
    const f = await openPicker('image/*');
    if (!f) return;
    const url = await fileToDataUrlResized(f);
    featuredInput.value = url;
    updatePreview();
  });

  // live counters / preview for non-block inputs
  inputsToAnalyze.forEach(input => input.addEventListener('input', () => { runSeoAnalysis(); updatePreview(); }));

  // -------- INIT --------
  renderTable();
});
