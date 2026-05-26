// ===== CatFoxJun Personal Blog - Enhanced Script =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌌 俊俊菌的博客已加载');

    initSidebarToggle();
    initNavigation();
    initBackgroundSelector();
    initStarCanvas();
    initMouseGlow();
    initTypingTitle();
    initAccordion();
    initAvatarClick();
    initProjectSearch();

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 80);

    showConsoleEasterEgg();
});

// ===== 2. Sidebar Toggle =====
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');

    if (sidebarToggle) {
        const sidebarIcon = sidebarToggle.querySelector('i');
        if (sidebarIcon) { sidebarIcon.classList.remove('fa-times'); sidebarIcon.classList.add('fa-bars'); }
    }
    document.body.style.overflow = '';
}

function openMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebar) sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');

    if (sidebarToggle) {
        const sidebarIcon = sidebarToggle.querySelector('i');
        if (sidebarIcon) { sidebarIcon.classList.remove('fa-bars'); sidebarIcon.classList.add('fa-times'); }
    }
    document.body.style.overflow = 'hidden';
}

function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !sidebarToggle) return;

    sidebarToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('active')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });

    // 点击遮罩关闭
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    // 点击主内容区域关闭
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('click', () => {
            if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
                closeMobileSidebar();
            }
        });
    }

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeMobileSidebar();
        }
    });
}

// ===== 3. Navigation =====
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            item.classList.add('active');

            const target = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(target + 'Content');
            if (targetSection) {
                targetSection.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // 移动端关闭侧边栏
            if (window.innerWidth <= 1024) {
                closeMobileSidebar();
            }
        });
    });
}

// ===== 4. Background Selector =====
function initBackgroundSelector() {
    const bgToggle = document.getElementById('bgToggle');
    const bgSelector = document.getElementById('bgSelector');
    const bgOverlay = document.getElementById('bgSelectorOverlay');
    const closeSelector = document.getElementById('closeSelector');
    const bgOptions = document.querySelectorAll('.bg-option');
    const bgUpload = document.getElementById('bgUpload');
    const customBg = document.getElementById('customBg');

    if (!bgToggle || !customBg) return;

    bgToggle.addEventListener('click', () => {
        bgSelector.classList.add('active');
        bgOverlay.classList.add('active');
    });

    function closeBgSelector() {
        bgSelector.classList.remove('active');
        bgOverlay.classList.remove('active');
    }

    if (closeSelector) closeSelector.addEventListener('click', closeBgSelector);
    if (bgOverlay) bgOverlay.addEventListener('click', closeBgSelector);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bgSelector.classList.contains('active')) closeBgSelector();
    });

    bgOptions.forEach(option => {
        option.addEventListener('click', () => {
            bgOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const bgUrl = option.getAttribute('data-bg');
            customBg.style.backgroundImage = bgUrl;
            customBg.classList.add('has-bg');
            localStorage.setItem('customBackground', bgUrl);
            showNotification('🎨 背景已更换', 'success');
        });
    });

    if (bgUpload) {
        bgUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { showNotification('❌ 图片不能超过 5MB', 'error'); return; }
                const reader = new FileReader();
                reader.onload = function(e) {
                    const bgUrl = `url('${e.target.result}')`;
                    customBg.style.backgroundImage = bgUrl;
                    customBg.classList.add('has-bg');
                    localStorage.setItem('customBackground', bgUrl);
                    bgOptions.forEach(opt => opt.classList.remove('active'));
                    showNotification('🖼️ 自定义背景已上传', 'success');
                    closeBgSelector();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const savedBg = localStorage.getItem('customBackground');
    if (savedBg) {
        customBg.style.backgroundImage = savedBg;
        customBg.classList.add('has-bg');
        bgOptions.forEach(option => {
            if (option.getAttribute('data-bg') === savedBg) option.classList.add('active');
        });
    } else {
        // 默认使用本地星空图片
        const defaultBg = "url('/CatFoxBoke/img/星空.png')";
        customBg.style.backgroundImage = defaultBg;
        customBg.classList.add('has-bg');
    }
}

// ===== 5. Star Canvas =====
function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    // Stars
    const stars = [];
    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.8 + 0.3,
            alpha: Math.random() * 0.7 + 0.2,
            speed: Math.random() * 0.4 + 0.05,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            color: pickStarColor()
        });
    }

    function pickStarColor() {
        const colors = ['255,255,255', '180,220,255', '200,180,255', '255,220,180'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Shooting stars
    const shootingStars = [];
    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * W * 0.7,
            y: Math.random() * H * 0.4,
            len: Math.random() * 120 + 60,
            speed: Math.random() * 8 + 6,
            alpha: 1,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            life: 0,
            maxLife: Math.random() * 40 + 30
        });
    }

    setInterval(spawnShootingStar, 2800);

    // Floating particles
    const floatParticles = [];
    for (let i = 0; i < 22; i++) {
        floatParticles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 3 + 1,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.5 + 0.2),
            alpha: Math.random() * 0.5 + 0.1,
            color: pickParticleColor()
        });
    }

    function pickParticleColor() {
        const colors = [
            '0,198,255', '167,139,250', '255,107,157', '74,222,128', '255,209,102'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    let frame = 0;

    function draw() {
        ctx.clearRect(0, 0, W, H);
        frame++;

        // Draw stars
        stars.forEach(s => {
            s.twinkle += s.twinkleSpeed;
            const a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${s.color}, ${a})`;
            ctx.fill();
            // Subtle glow on bigger stars
            if (s.r > 1.2) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
                const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
                grd.addColorStop(0, `rgba(${s.color}, ${a * 0.3})`);
                grd.addColorStop(1, `rgba(${s.color}, 0)`);
                ctx.fillStyle = grd;
                ctx.fill();
            }
        });

        // Draw shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            ss.life++;
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.alpha = 1 - ss.life / ss.maxLife;

            if (ss.alpha <= 0) { shootingStars.splice(i, 1); continue; }

            const tx = ss.x - Math.cos(ss.angle) * ss.len;
            const ty = ss.y - Math.sin(ss.angle) * ss.len;
            const grd = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
            grd.addColorStop(0, `rgba(255,255,255,0)`);
            grd.addColorStop(0.6, `rgba(120,220,255,${ss.alpha * 0.5})`);
            grd.addColorStop(1, `rgba(255,255,255,${ss.alpha})`);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(ss.x, ss.y);
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Draw floating particles
        floatParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            ctx.fill();

            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
            grd.addColorStop(0, `rgba(${p.color}, ${p.alpha * 0.4})`);
            grd.addColorStop(1, `rgba(${p.color}, 0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// ===== 6. Mouse Glow =====
function initMouseGlow() {
    const glow = document.getElementById('mouseGlow');
    if (!glow) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    function updateGlow() {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
        requestAnimationFrame(updateGlow);
    }
    updateGlow();
}

// ===== 7. Typing Title Effect =====
function initTypingTitle() {
    const titleEl = document.querySelector('.site-title');
    if (!titleEl) return;

    const text = 'CatFoxJun 的个人博客';
    let idx = 0;

    // 用 span.title-text 承载文字，保留渐变样式
    titleEl.innerHTML = '<span class="title-text"></span><span class="cursor"></span>';
    const textSpan = titleEl.querySelector('.title-text');

    function type() {
        if (idx <= text.length) {
            textSpan.textContent = text.substring(0, idx);
            idx++;
            setTimeout(type, 60 + Math.random() * 30);
        }
    }

    setTimeout(type, 400);
}

// ===== 7b. Accordion =====
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isOpen = item.classList.contains('open');

            // 关闭同组所有
            item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('open');
            });

            // 切换当前
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
}

// ===== 7c. Avatar Click → About =====
function initAvatarClick() {
    const avatar = document.querySelector('.user-avatar');
    if (!avatar) return;

    avatar.style.cursor = 'pointer';
    avatar.title = '点击查看「关于我」';

    avatar.addEventListener('click', () => {
        // 切换到"关于"页
        const navItems = document.querySelectorAll('.nav-item');
        const contentSections = document.querySelectorAll('.content-section');

        navItems.forEach(nav => nav.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));

        const aboutNav = document.querySelector('.nav-item[data-section="about"]');
        const aboutSection = document.getElementById('aboutContent');

        if (aboutNav) aboutNav.classList.add('active');
        if (aboutSection) {
            aboutSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 移动端收起侧边栏
        if (window.innerWidth <= 1024) {
            closeMobileSidebar();
        }
    });
}

// ===== 7d. Project Search =====
function initProjectSearch() {
    const input = document.getElementById('projectSearch');
    const grid = document.getElementById('projectsGrid');
    const empty = document.getElementById('searchEmpty');
    const countEl = document.getElementById('searchCount');

    if (!input || !grid) return;

    const items = grid.querySelectorAll('.project-item');

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();

        if (!query) {
            // 空搜索：全部显示
            items.forEach(item => item.classList.remove('search-hidden'));
            if (empty) empty.classList.add('hidden');
            if (countEl) countEl.textContent = '';
            return;
        }

        let matchCount = 0;
        items.forEach(item => {
            const title = (item.querySelector('.project-title')?.textContent || '').toLowerCase();
            const desc = (item.querySelector('.project-desc')?.textContent || '').toLowerCase();
            const tags = Array.from(item.querySelectorAll('.tech-tag')).map(t => t.textContent.toLowerCase()).join(' ');
            const keywords = (item.getAttribute('data-keywords') || '').toLowerCase();

            const match = title.includes(query) || desc.includes(query) || tags.includes(query) || keywords.includes(query);

            if (match) {
                item.classList.remove('search-hidden');
                matchCount++;
            } else {
                item.classList.add('search-hidden');
            }
        });

        // 空结果提示
        if (empty) {
            empty.classList.toggle('hidden', matchCount > 0);
        }
        // 匹配数
        if (countEl) {
            countEl.textContent = matchCount > 0 ? matchCount + ' / ' + items.length : '';
        }
    });
}

// ===== 8. Notification System =====
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = '<span>' + message + '</span>';

    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '28px', right: '28px',
        padding: '14px 24px',
        background: 'rgba(5, 10, 26, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '14px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: '#f0f4ff',
        fontSize: '0.95rem',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateY(80px)',
        opacity: '0',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    });

    const borderColors = {
        success: 'var(--primary)',
        error: 'var(--secondary)',
        dark: 'var(--purple)',
        light: 'var(--accent)',
        info: 'var(--primary)'
    };
    notification.style.borderLeft = '3px solid ' + (borderColors[type] || borderColors.info);

    document.body.appendChild(notification);
    requestAnimationFrame(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    });

    setTimeout(() => {
        notification.style.transform = 'translateY(20px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ===== 9. Console Easter Egg =====
function showConsoleEasterEgg() {
    console.log('%c✨ 欢迎来到俊俊菌的个人博客 ✨', 'color: #00c6ff; font-size: 20px; font-weight: bold;');
    console.log('%c就算步伐很小，也要步步前进 💖', 'color: #ff6b9d; font-size: 14px;');
    console.log('%cHTML5 + CSS3 + Canvas + Vanilla JS', 'color: #a78bfa; font-size: 12px;');
}

// ===== 10. Card Hover Ripple =====
document.querySelectorAll('.glass-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
    });
});

// ===== 11. Window Resize =====
window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
        closeMobileSidebar();
    }
});

// ===== 12. Scroll Animation =====
setTimeout(function() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.glass-card').forEach(function(card) {
        observer.observe(card);
    });
}, 500);
