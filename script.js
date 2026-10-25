/* ========================================
   俊俊菌博客 · 交互脚本
   数据来源：
     data/profile.json  个人信息 / 技能墙
     data/projects.json 项目（Pinned 卡片）
     data/honors.json   荣誉墙
     data/docs.json     文章索引（由 generate_docs.py 生成）
     HOME.md            根目录自述文件（主页展示）
   ======================================== */

/* ===== 全局状态 ===== */
var profile = null;
var docs = [];
var filteredDocs = [];
var activeCategory = 'all';
var currentDocIndex = -1;
var currentView = 'home';
var projects = [];
var activeProjectTag = 'all';
var musicTracks = [];
var musicIndex = 0;

/* 链接图标（profile.json 的 icon 字段对应） */
var LINK_ICONS = {
    github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 4.77a5.44 5.44 0 0 0 0 3.77A5.44 5.44 0 0 0 3.5 8.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    bilibili: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><polyline points="7 2 12 7 17 2"/><line x1="8.5" y1="12" x2="8.5" y2="15"/><line x1="15.5" y1="12" x2="15.5" y2="15"/></svg>'
};

/* GitHub 语言标记色 */
var LANG_COLORS = {
    'C': '#555555',
    'C / C++': '#f34b7d',
    'C++': '#f34b7d',
    'C#': '#178600',
    'Python': '#3572A5',
    'JavaScript': '#f1e05a',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'HTML5': '#e34c26',
    'CSS3': '#563d7c',
    'Unity': '#222222',
    'Windows API': '#6e4a7e',
    'MQTT': '#660066',
    'SQLite': '#003b57'
};

/* ===== 初始化 ===== */
document.addEventListener('DOMContentLoaded', function () {
    initTheme();

    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
    }

    // file:// 协议下浏览器禁止 fetch 本地文件，给出提示
    if (location.protocol === 'file:') {
        showServerHint();
        return;
    }

    Promise.all([
        fetchJson('data/profile.json'),
        fetchJson('data/docs.json'),
        fetchJson('data/projects.json'),
        fetchJson('data/honors.json'),
        fetchJson('data/music.json'),
        fetchJson('data/backgrounds.json')
    ]).then(function (results) {
        profile = results[0];
        docs = results[1].docs || [];
        filteredDocs = docs.slice();

        renderProfile();
        renderSkillWall();
        renderDocList();
        renderHonors(results[3].honors || []);
        projects = results[2].projects || [];
        renderProjectPills();
        renderPinned();
        renderCategoryPills();
        renderPostList();
        initSearch();
        initMusic(results[4]);
        initClock();
        initBgMenu((results[5] && results[5].images) || []);
        applyBackground();
        initParticles();
        loadReadme(results[1].readme || 'HOME.md');
    }).catch(function (err) {
        showServerHint('数据加载失败：' + err.message);
    });
});

function fetchJson(url) {
    return fetch(url).then(function (res) {
        if (!res.ok) throw new Error(url + ' -> HTTP ' + res.status);
        return res.json();
    });
}

/* ===== 主题切换（白日 / 暗月） ===== */
function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) { /* 隐私模式等场景 */ }
    applyTheme(saved === 'light' ? 'light' : 'dark');

    var btn = document.getElementById('themeToggle');
    if (btn) {
        btn.addEventListener('click', function () {
            var next = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) { }
        });
    }
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    var btn = document.getElementById('themeToggle');
    if (btn) {
        // 按钮文字显示将要切换到的主题
        btn.textContent = theme === 'light' ? '暗月' : '白日';
    }
}

/* ===== 本地运行提示 ===== */
function showServerHint(msg) {
    var div = document.createElement('div');
    div.className = 'server-hint';
    div.innerHTML = (msg ? msg + '<br>' : '') +
        '本站通过 fetch 读取 JSON 与 Markdown 文件，不能直接双击打开。' +
        '请在项目目录运行 <code>python -m http.server 8000</code> 后访问 <code>http://localhost:8000</code>，' +
        '或部署到 GitHub Pages。';
    document.body.insertBefore(div, document.body.firstChild);
}

/* ===== 自定义背景（localStorage 优先，profile.json 的 background 为默认） ===== */
function applyBackground() {
    // 从未手动选择过：用 profile.json 的默认背景；清除过（存空串）：保持纯色
    var stored = localStorage.getItem('bg');
    var bg = (stored !== null) ? stored : ((profile && profile.background) || '');
    document.body.style.backgroundImage = bg ? 'url("' + bg + '")' : '';
    document.body.classList.toggle('has-bg', !!bg);
}

function initBgMenu(presets) {
    var btn = document.getElementById('bgMenuBtn');
    var panel = document.getElementById('bgPanel');
    var presetBox = document.getElementById('bgPresets');
    var fileInput = document.getElementById('bgFile');

    // 预设缩略图（来自 img/ 文件夹）
    if (presets.length) {
        presets.forEach(function (src) {
            var b = document.createElement('button');
            b.type = 'button';
            b.dataset.bg = src;
            b.innerHTML = '<img src="' + src + '" alt="">';
            b.addEventListener('click', function () {
                localStorage.setItem('bg', src);
                applyBackground();
                markActivePreset();
            });
            presetBox.appendChild(b);
        });
    } else {
        presetBox.innerHTML = '<span class="bg-presets-empty">暂无预设</span>';
    }

    function markActivePreset() {
        var cur = localStorage.getItem('bg') || '';
        var items = presetBox.querySelectorAll('button');
        items.forEach(function (b) {
            b.classList.toggle('active', b.dataset.bg === cur);
        });
    }
    markActivePreset();

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.style.display = (panel.style.display === 'none') ? 'block' : 'none';
    });

    // 点击面板外关闭
    document.addEventListener('click', function (e) {
        if (panel.style.display !== 'none' && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.style.display = 'none';
        }
    });

    // 导入本地图片作为背景
    document.getElementById('bgImport').addEventListener('click', function () {
        fileInput.click();
    });
    fileInput.addEventListener('change', function () {
        var file = this.files && this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
            var dataUrl = reader.result;
            try {
                localStorage.setItem('bg', dataUrl);
            } catch (err) {
                // 图片过大超出 localStorage 限额时仅本次会话生效
            }
            document.body.style.backgroundImage = 'url("' + dataUrl + '")';
            document.body.classList.add('has-bg');
            markActivePreset();
            panel.style.display = 'none';
        };
        reader.readAsDataURL(file);
        this.value = '';
    });

    document.getElementById('bgClear').addEventListener('click', function () {
        localStorage.setItem('bg', '');   // 记录"已清除"，不再回落到默认背景
        applyBackground();
        markActivePreset();
        panel.style.display = 'none';
    });
}

/* ===== 左栏：个人主页 ===== */
function renderProfile() {
    if (!profile) return;

    if (profile.avatar) document.getElementById('profileAvatar').src = profile.avatar;
    document.getElementById('profileName').textContent = profile.name || '';
    document.getElementById('profileUsername').textContent = profile.username || '';
    document.getElementById('profileBio').textContent = profile.bio || '';
    document.getElementById('repoOwner').textContent = profile.username || '';

    var mottoHtml = '';
    (profile.motto || []).forEach(function (m) {
        mottoHtml += '<span>' + escapeHtml(m) + '</span>';
    });
    document.getElementById('profileMotto').innerHTML = mottoHtml;

    var linksHtml = '';
    (profile.links || []).forEach(function (l) {
        var icon = LINK_ICONS[l.icon] || '';
        linksHtml += '<a href="' + l.url + '" target="_blank" rel="noopener">' +
            icon + '<span>' + escapeHtml(l.label) + '</span></a>';
    });
    document.getElementById('profileLinks').innerHTML = linksHtml;
}

/* ===== 右栏：技能墙 ===== */
function renderSkillWall() {
    var wall = document.getElementById('skillWall');
    if (!profile || !wall) return;

    var html = '';
    (profile.skills || []).forEach(function (s) {
        html += '<span class="skill-pill">' + escapeHtml(s.name) +
            (s.level ? ' <span class="skill-level">· ' + escapeHtml(s.level) + '</span>' : '') +
            '</span>';
    });
    wall.innerHTML = html;
}

/* ===== 右栏：文档目录 ===== */
function renderDocList() {
    var list = document.getElementById('docList');
    var count = document.getElementById('docCount');
    if (!list) return;

    count.textContent = docs.length ? '(' + docs.length + ')' : '';

    // 只展示最新 10 个文档，防止列表过长撑爆右栏
    var html = '';
    docs.slice(0, 10).forEach(function (doc, idx) {
        html += '<button class="doc-row" onclick="openPost(' + idx + ')">' +
            '<span class="doc-name">' + escapeHtml(doc.file) + '</span>' +
            '<span class="doc-date">' + doc.date + '</span>' +
            '</button>';
    });
    list.innerHTML = html || '<div class="doc-row"><span class="doc-name">暂无文档</span></div>';
}

/* ===== 荣誉墙 ===== */
function renderHonors(honors) {
    var box = document.getElementById('honorsList');
    if (!box) return;

    if (!honors.length) {
        box.innerHTML = '<span class="loading-text">暂无荣誉记录</span>';
        return;
    }

    var html = '';
    honors.forEach(function (h) {
        html += '<div class="honor-item">';
        if (h.image) {
            html += '<img class="honor-img" src="' + h.image + '" alt="' + escapeHtml(h.title) + '">';
        }
        html += '<div class="honor-info">' +
            '<span class="honor-title">' + escapeHtml(h.title) + '</span>' +
            (h.date ? '<span class="honor-date">' + escapeHtml(h.date) + '</span>' : '') +
            (h.desc ? '<span class="honor-desc">' + escapeHtml(h.desc) + '</span>' : '') +
            '</div></div>';
    });
    box.innerHTML = html;
}

/* ===== 项目页：标签自动分类 ===== */
/* 从 projects.json 的 tags 字段动态提取分类，新增标签无需改代码 */
function renderProjectPills() {
    var box = document.getElementById('projectPills');
    if (!box) return;

    var tags = [];
    var seen = {};
    projects.forEach(function (p) {
        (p.tags || []).forEach(function (t) {
            if (!seen[t]) {
                seen[t] = true;
                tags.push(t);
            }
        });
    });

    var html = '<button class="cat-pill' + (activeProjectTag === 'all' ? ' active' : '') + '" data-tag="all">全部</button>';
    tags.forEach(function (t) {
        html += '<button class="cat-pill' + (activeProjectTag === t ? ' active' : '') +
            '" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + '</button>';
    });
    box.innerHTML = html;

    var pills = box.querySelectorAll('.cat-pill');
    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            activeProjectTag = this.getAttribute('data-tag');
            pills.forEach(function (p) { p.classList.remove('active'); });
            this.classList.add('active');
            renderPinned();
        });
    });
}

/* ===== 项目（Pinned 卡片） ===== */
var projectKeyword = '';

function renderPinned() {
    var grid = document.getElementById('pinnedGrid');
    if (!grid) return;

    // 同一项目可属于多个标签，筛选时会在每个匹配分类下出现
    var list = (activeProjectTag === 'all')
        ? projects
        : projects.filter(function (p) { return (p.tags || []).indexOf(activeProjectTag) !== -1; });

    // 关键词过滤：名称 / 描述 / 技术栈 / 标签
    if (projectKeyword) {
        var kw = projectKeyword.toLowerCase();
        list = list.filter(function (p) {
            return (p.name || '').toLowerCase().indexOf(kw) !== -1 ||
                (p.desc || '').toLowerCase().indexOf(kw) !== -1 ||
                (p.tech || []).join(' ').toLowerCase().indexOf(kw) !== -1 ||
                (p.tags || []).join(' ').toLowerCase().indexOf(kw) !== -1;
        });
    }

    if (!list.length) {
        grid.innerHTML = '<span class="loading-text">暂无项目</span>';
        return;
    }

    var html = '';
    list.forEach(function (p) {
        var techHtml = '';
        (p.tech || []).forEach(function (t) {
            var color = LANG_COLORS[t] || '#8b949e';
            techHtml += '<span class="pin-tech-item">' +
                '<span class="lang-dot" style="background-color:' + color + '"></span>' +
                escapeHtml(t) + '</span>';
        });

        var inner =
            '<div class="pin-name">' + escapeHtml(p.name) + '</div>' +
            '<div class="pin-desc">' + escapeHtml(p.desc || '') + '</div>' +
            '<div class="pin-tech">' + techHtml + '</div>';

        if (p.url) {
            html += '<a class="pin-card" href="' + p.url + '" target="_blank" rel="noopener">' + inner + '</a>';
        } else {
            html += '<div class="pin-card">' + inner + '</div>';
        }
    });
    grid.innerHTML = html;
}

/* ===== 中栏：README 自述渲染 ===== */
var typingTimer = null;

function loadReadme(file) {
    fetch(file).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
    }).then(function (md) {
        document.getElementById('readmeContent').innerHTML =
            (typeof marked !== 'undefined') ? marked.parse(md) : '<pre>' + escapeHtml(md) + '</pre>';
        initTypingQuote();
    }).catch(function () {
        document.getElementById('readmeContent').innerHTML =
            '<p class="loading-text">无法加载 ' + escapeHtml(file) + '</p>';
    });
}

/* ===== 自述语录打字机（还是猫狐可爱喵 / ...） ===== */
function initTypingQuote() {
    var quote = document.querySelector('#readmeContent blockquote');
    if (!quote) return;

    // 语录行用 " / " 分隔写在 blockquote 里
    var lines = quote.textContent.split('/').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!lines.length) return;

    quote.innerHTML = '<span class="typing-text"></span><span class="typing-caret"></span>';
    var textEl = quote.querySelector('.typing-text');

    if (typingTimer) clearTimeout(typingTimer);

    var lineIdx = 0, charIdx = 0, deleting = false;

    function tick() {
        var line = lines[lineIdx];
        if (!deleting) {
            charIdx++;
            textEl.textContent = line.slice(0, charIdx);
            if (charIdx === line.length) {
                deleting = true;
                typingTimer = setTimeout(tick, 2000);   // 打完后停留
                return;
            }
            typingTimer = setTimeout(tick, 90);
        } else {
            charIdx--;
            textEl.textContent = line.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                lineIdx = (lineIdx + 1) % lines.length;
                typingTimer = setTimeout(tick, 400);
                return;
            }
            typingTimer = setTimeout(tick, 40);
        }
    }
    tick();
}

/* ===== 文章列表页 ===== */
function renderCategoryPills() {
    var box = document.getElementById('categoryPills');
    if (!box) return;

    // 从数据中动态提取分类
    var cats = [];
    var seen = {};
    docs.forEach(function (d) {
        if (!seen[d.category]) {
            seen[d.category] = true;
            cats.push({ key: d.category, name: d.categoryName });
        }
    });

    var html = '<button class="cat-pill' + (activeCategory === 'all' ? ' active' : '') + '" data-cat="all">全部</button>';
    cats.forEach(function (c) {
        html += '<button class="cat-pill' + (activeCategory === c.key ? ' active' : '') +
            '" data-cat="' + c.key + '">' + escapeHtml(c.name) + '</button>';
    });
    box.innerHTML = html;

    var pills = box.querySelectorAll('.cat-pill');
    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            activeCategory = this.getAttribute('data-cat');
            pills.forEach(function (p) { p.classList.remove('active'); });
            this.classList.add('active');
            applyFilter();
            var input = document.getElementById('blogSearch');
            if (input) input.value = '';
        });
    });
}

function renderPostList() {
    var grid = document.getElementById('postGrid');
    var empty = document.getElementById('postEmpty');
    if (!grid) return;

    if (filteredDocs.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    var html = '';
    filteredDocs.forEach(function (doc) {
        var realIdx = docs.indexOf(doc);
        html += '<button class="post-row" onclick="openPost(' + realIdx + ')">' +
            '<div class="post-row-title">' + escapeHtml(doc.title) + '</div>' +
            '<div class="post-row-excerpt">' + escapeHtml(doc.excerpt) + '</div>' +
            '<div class="post-row-meta">' +
                '<span class="post-row-cat">' + escapeHtml(doc.categoryName) + '</span>' +
                '<span>' + doc.date + '</span>' +
                '<span>' + doc.readtime + '</span>' +
            '</div>' +
            '</button>';
    });
    grid.innerHTML = html;
}

/* ===== 搜索 ===== */
function initSearch() {
    var input = document.getElementById('blogSearch');
    if (!input) return;

    // Ctrl+F 聚焦站内搜索框（替代浏览器默认查找）
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
            e.preventDefault();
            input.focus();
            input.select();
        }
    });

    input.addEventListener('input', function () {
        applyFilter(this.value.trim().toLowerCase());
        if (this.value.trim() !== '' && currentView !== 'posts') {
            switchView('posts');
        }
    });

    // 项目页 / 仓库页 独立搜索框
    var projectSearch = document.getElementById('projectSearch');
    if (projectSearch) {
        projectSearch.addEventListener('input', function () {
            projectKeyword = this.value.trim();
            renderPinned();
        });
    }
    var repoSearch = document.getElementById('repoSearch');
    if (repoSearch) {
        repoSearch.addEventListener('input', function () {
            repoKeyword = this.value.trim();
            renderRepos();
        });
    }
}

function applyFilter(keyword) {
    var source = (activeCategory === 'all')
        ? docs.slice()
        : docs.filter(function (d) { return d.category === activeCategory; });

    if (keyword) {
        source = source.filter(function (d) {
            return d.title.toLowerCase().indexOf(keyword) !== -1 ||
                   d.excerpt.toLowerCase().indexOf(keyword) !== -1 ||
                   d.tags.some(function (t) { return t.toLowerCase().indexOf(keyword) !== -1; });
        });
    }

    filteredDocs = source;
    renderPostList();
}

/* ===== 打开文章（按需读取 Article/*.md） ===== */
function openPost(index) {
    var doc = docs[index];
    if (!doc) return;

    currentDocIndex = index;

    document.getElementById('articleCat').textContent = doc.categoryName;
    document.getElementById('articleTitle').textContent = doc.title;
    document.getElementById('articleDate').textContent = doc.date;
    document.getElementById('articleReadtime').textContent = doc.readtime;

    var tagsHtml = '';
    doc.tags.forEach(function (tag) {
        tagsHtml += '<span class="article-tag">' + escapeHtml(tag) + '</span>';
    });
    document.getElementById('articleTags').innerHTML = tagsHtml;

    var contentEl = document.getElementById('articleContent');
    contentEl.innerHTML = '<p class="loading-text">正在加载 ' + escapeHtml(doc.file) + ' ...</p>';

    fetch('Article/' + encodeURIComponent(doc.file)).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
    }).then(function (md) {
        md = stripFrontMatter(md);
        contentEl.innerHTML = (typeof marked !== 'undefined')
            ? marked.parse(md)
            : '<pre>' + escapeHtml(md) + '</pre>';
    }).catch(function () {
        contentEl.innerHTML = '<p class="loading-text">无法加载文章文件。</p>';
    });

    updateArticleNav();
    switchView('article');
    window.scrollTo(0, 0);
}

/* 去掉 front matter 头部，只渲染正文 */
function stripFrontMatter(md) {
    return md.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n/, '');
}

/* ===== 上一篇 / 下一篇 ===== */
function updateArticleNav() {
    document.getElementById('prevPost').disabled = (currentDocIndex <= 0);
    document.getElementById('nextPost').disabled = (currentDocIndex >= docs.length - 1);
}

function navigatePost(direction) {
    var newIndex = currentDocIndex + direction;
    if (newIndex >= 0 && newIndex < docs.length) {
        openPost(newIndex);
    }
}

/* ===== 视图切换 ===== */
function switchView(view) {
    currentView = view;

    var views = document.querySelectorAll('.page-view');
    views.forEach(function (v) { v.classList.remove('active'); });

    var target = document.getElementById(view + 'View');
    if (target) target.classList.add('active');

    var links = document.querySelectorAll('.topnav-link');
    links.forEach(function (link) {
        link.classList.remove('active');
        var linkView = link.getAttribute('data-view');
        if (view === 'article' && linkView === 'posts') {
            link.classList.add('active');
        } else if (linkView === view) {
            link.classList.add('active');
        }
    });

    window.scrollTo(0, 0);

    if (view === 'repos') loadRepos();
}

/* ===== 仓库页：GitHub 公开仓库 ===== */
var reposLoaded = false;
var reposData = [];
var repoKeyword = '';

function renderRepos() {
    var grid = document.getElementById('reposGrid');
    var list = reposData;
    if (repoKeyword) {
        var kw = repoKeyword.toLowerCase();
        list = list.filter(function (r) {
            return (r.name || '').toLowerCase().indexOf(kw) !== -1 ||
                (r.description || '').toLowerCase().indexOf(kw) !== -1 ||
                (r.language || '').toLowerCase().indexOf(kw) !== -1;
        });
    }
    if (!list.length) {
        grid.innerHTML = '<span class="loading-text">' + (reposData.length ? '没有匹配的仓库' : '暂无公开仓库') + '</span>';
        return;
    }
    var html = '';
    list.forEach(function (r) {
        var techHtml = '';
        if (r.language) {
            techHtml += '<span class="pin-tech-item">' +
                '<span class="lang-dot" style="background-color:' +
                (LANG_COLORS[r.language] || '#8b949e') + '"></span>' +
                escapeHtml(r.language) + '</span>';
        }
        if (r.stargazers_count) {
            techHtml += '<span class="pin-tech-item">★ ' + r.stargazers_count + '</span>';
        }
        html += '<a class="pin-card" href="' + r.html_url + '" target="_blank" rel="noopener">' +
            '<div class="pin-name">' + escapeHtml(r.name) + '</div>' +
            '<div class="pin-desc">' + escapeHtml(r.description || '暂无描述') + '</div>' +
            '<div class="pin-tech">' + techHtml + '</div>' +
            '</a>';
    });
    grid.innerHTML = html;
}

function loadRepos() {
    if (reposLoaded) return;
    reposLoaded = true;

    var gh = (profile.links || []).filter(function (l) { return l.icon === 'github'; })[0];
    var grid = document.getElementById('reposGrid');
    if (!gh) { grid.innerHTML = '<span class="loading-text">未配置 GitHub 账号</span>'; return; }
    var user = gh.url.match(/github\.com\/([^\/]+)/)[1];

    fetch('https://api.github.com/users/' + user + '/repos?per_page=100&sort=pushed')
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function (repos) {
            reposData = repos.filter(function (r) { return !r.fork; });
            renderRepos();
        })
        .catch(function () {
            reposLoaded = false;   // 失败允许重试
            grid.innerHTML = '<span class="loading-text">仓库加载失败，请稍后重试</span>';
        });
}

/* ===== 音乐播放器 ===== */
function initMusic(data) {
    var tracks = (data && data.tracks) || [];
    if (!tracks.length) return;

    musicTracks = tracks;

    var player = document.getElementById('musicPlayer');
    var audio = document.getElementById('musicAudio');
    player.style.display = 'flex';

    if (data.cover) {
        document.getElementById('musicCover').src = data.cover;
    } else {
        document.getElementById('musicCover').style.display = 'none';
    }

    loadTrack(0);

    document.getElementById('musicPlay').addEventListener('click', toggleMusicPlay);
    document.getElementById('musicPrev').addEventListener('click', function () { stepTrack(-1); });
    document.getElementById('musicNext').addEventListener('click', function () { stepTrack(1); });

    // 进度条
    audio.addEventListener('timeupdate', function () {
        if (audio.duration) {
            document.getElementById('musicProgressBar').style.width =
                (audio.currentTime / audio.duration * 100) + '%';
        }
    });

    // 播完自动下一首
    audio.addEventListener('ended', function () { stepTrack(1); });

    // 单曲时禁用切换按钮
    var single = musicTracks.length <= 1;
    document.getElementById('musicPrev').disabled = single;
    document.getElementById('musicNext').disabled = single;

    // 默认不自动播放，等待用户点击
    setPlayState(false);
}

function loadTrack(i) {
    var audio = document.getElementById('musicAudio');
    musicIndex = (i + musicTracks.length) % musicTracks.length;
    audio.src = musicTracks[musicIndex].file;
    document.getElementById('musicTitle').textContent = musicTracks[musicIndex].title;
    document.getElementById('musicProgressBar').style.width = '0';
}

function toggleMusicPlay() {
    var audio = document.getElementById('musicAudio');
    if (audio.paused) {
        audio.play();
        setPlayState(true);
    } else {
        audio.pause();
        setPlayState(false);
    }
}

function stepTrack(step) {
    loadTrack(musicIndex + step);
    var audio = document.getElementById('musicAudio');
    audio.play();
    setPlayState(true);
}

var MUSIC_ICON_PLAY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
var MUSIC_ICON_PAUSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

function setPlayState(playing) {
    var btn = document.getElementById('musicPlay');
    btn.innerHTML = playing ? MUSIC_ICON_PAUSE : MUSIC_ICON_PLAY;
    btn.setAttribute('aria-label', playing ? '暂停' : '播放');
}

/* ===== 时钟（本机时间） ===== */
function initClock() {
    var hourHand = document.getElementById('clockHour');
    var minHand = document.getElementById('clockMin');
    var timeEl = document.getElementById('clockTime');
    if (!hourHand || !minHand || !timeEl) return;

    function update() {
        var now = new Date();
        var h = now.getHours();
        var m = now.getMinutes();
        var s = now.getSeconds();

        // 时针：30°/小时 + 分钟偏移；分针：6°/分钟
        var hourAngle = (h % 12) * 30 + m * 0.5;
        var minAngle = m * 6 + s * 0.1;

        hourHand.setAttribute('transform', 'rotate(' + hourAngle + ' 50 50)');
        minHand.setAttribute('transform', 'rotate(' + minAngle + ' 50 50)');

        function pad(n) { return (n < 10 ? '0' : '') + n; }
        timeEl.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    update();
    setInterval(update, 1000);
}

/* ===== 默认背景粒子（蓝色，避开鼠标） ===== */
function initParticles() {
    var canvas = document.getElementById('bgParticles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -9999, y: -9999 };
    var color = '#58a6ff';
    var frame = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // 按屏幕面积控制数量，约 1.8 万像素 1 个
        var target = Math.min(90, Math.floor(canvas.width * canvas.height / 18000));
        while (particles.length < target) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.5 + 1
            });
        }
        particles.length = target;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', function () {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    resize();

    function tick() {
        requestAnimationFrame(tick);

        // 每 30 帧重新读取主题色
        if (frame % 30 === 0) {
            var c = getComputedStyle(document.body);
            var ac = c.getPropertyValue('--accent');
            if (ac) color = ac.trim();
        }
        frame++;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var i, p, dx, dy, dist;
        for (i = 0; i < particles.length; i++) {
            p = particles[i];

            // 鼠标排斥：120px 内自然推开
            dx = p.x - mouse.x;
            dy = p.y - mouse.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
                var force = (120 - dist) / 120 * 0.6;
                p.vx += dx / dist * force;
                p.vy += dy / dist * force;
            }

            // 限速并缓慢回稳
            p.vx *= 0.98;
            p.vy *= 0.98;
            if (Math.abs(p.vx) < 0.15) p.vx += (Math.random() - 0.5) * 0.04;
            if (Math.abs(p.vy) < 0.15) p.vy += (Math.random() - 0.5) * 0.04;

            p.x += p.vx;
            p.y += p.vy;

            // 边缘环绕
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;

            // 蓝色彗星拖尾：沿运动反方向画渐变短线，速度越快尾巴越长
            var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            var tailLen = Math.min(40, speed * 10) + 6;
            var tx = p.x - (p.vx / (speed || 1)) * tailLen;
            var ty = p.y - (p.vy / (speed || 1)) * tailLen;
            var grad = ctx.createLinearGradient(tx, ty, p.x, p.y);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, color);
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = grad;
            ctx.lineWidth = p.r * 1.1;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            // 粒子头部
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    tick();
}

/* ===== 工具 ===== */
function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str == null ? '' : str);
    return div.innerHTML;
}
