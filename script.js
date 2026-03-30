// ===== Personal Website V2 - Main Script =====

// Page Load Complete
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 俊俊菌的个人博客 V2 已加载');
    
    // Initialize all functions
    initThemeToggle();
    initSidebarToggle();
    initNavigation();
    initBackgroundSelector();
    initParticles();
    
    // Page load animation
    setTimeout(() => {
        document.body.style.opacity = 1;
        document.body.classList.add('loaded');
    }, 100);
    
    // Console Easter Egg
    showConsoleEasterEgg();
});

// ===== 1. Theme Toggle (Dark/Light Mode) =====
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Check local storage for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
            showNotification('🌙 已切换至暗色模式', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
            showNotification('☀️ 已切换至亮色模式', 'light');
        }
    });
}

// ===== 2. Sidebar Toggle (Mobile) =====
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarIcon = sidebarToggle.querySelector('i');
    
    if (!sidebarToggle) return;
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        
        if (sidebar.classList.contains('active')) {
            sidebarIcon.classList.remove('fa-bars');
            sidebarIcon.classList.add('fa-times');
            document.body.style.overflow = 'hidden';
        } else {
            sidebarIcon.classList.remove('fa-times');
            sidebarIcon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });
    
    // Close sidebar when clicking main content
    document.querySelector('.main-content').addEventListener('click', () => {
        if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            sidebarIcon.classList.remove('fa-times');
            sidebarIcon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });
    
    // Close sidebar when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            sidebarIcon.classList.remove('fa-times');
            sidebarIcon.classList.add('fa-bars');
            document.body.style.overflow = '';
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
            
            // Remove all active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to current item
            item.classList.add('active');
            
            // Show corresponding content section
            const target = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(target + 'Content');
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Add animation
                targetSection.classList.add('fade-in');
                setTimeout(() => {
                    targetSection.classList.remove('fade-in');
                }, 400);
                
                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                const sidebarToggle = document.getElementById('sidebarToggle');
                const sidebarIcon = sidebarToggle.querySelector('i');
                
                sidebar.classList.remove('active');
                sidebarIcon.classList.remove('fa-times');
                sidebarIcon.classList.add('fa-bars');
                document.body.style.overflow = '';
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
    
    if (!bgToggle) return;
    
    // Open background selector
    bgToggle.addEventListener('click', () => {
        bgSelector.classList.add('active');
        bgOverlay.classList.add('active');
    });
    
    // Close background selector
    function closeBgSelector() {
        bgSelector.classList.remove('active');
        bgOverlay.classList.remove('active');
    }
    
    closeSelector.addEventListener('click', closeBgSelector);
    bgOverlay.addEventListener('click', closeBgSelector);
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bgSelector.classList.contains('active')) {
            closeBgSelector();
        }
    });
    
    // Select preset background
    bgOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove all active classes
            bgOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to current option
            option.classList.add('active');
            
            // Change background
            const bgUrl = option.getAttribute('data-bg');
            customBg.style.backgroundImage = bgUrl;
            
            // Save to local storage
            localStorage.setItem('customBackground', bgUrl);
            
            showNotification('🎨 背景已更换', 'success');
        });
    });
    
    // Upload custom background
    if (bgUpload) {
        bgUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('❌ 图片大小不能超过 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const bgUrl = `url('${e.target.result}')`;
                    customBg.style.backgroundImage = bgUrl;
                    localStorage.setItem('customBackground', bgUrl);
                    
                    // Remove active from preset options
                    bgOptions.forEach(opt => opt.classList.remove('active'));
                    
                    showNotification('🖼️ 自定义背景已上传', 'success');
                    closeBgSelector();
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Load saved background
    const savedBg = localStorage.getItem('customBackground');
    if (savedBg) {
        customBg.style.backgroundImage = savedBg;
        
        // Mark corresponding option as active
        bgOptions.forEach(option => {
            if (option.getAttribute('data-bg') === savedBg) {
                option.classList.add('active');
            }
        });
    }
}

// ===== 5. Particle Effect =====
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer, i);
    }
}

function createParticle(container, index) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    
    // Random size
    const size = 2 + Math.random() * 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random opacity
    particle.style.opacity = 0.1 + Math.random() * 0.3;
    
    container.appendChild(particle);
}

// ===== 6. Notification System =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = '<span>' + message + '</span>';
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        padding: '14px 24px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
        color: 'var(--text-primary)',
        fontSize: '0.95rem',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateY(100px)',
        opacity: '0',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    });
    
    // Set color based on type
    const colors = {
        success: 'var(--primary)',
        error: 'var(--secondary)',
        dark: 'var(--text-primary)',
        light: 'var(--text-secondary)',
        info: 'var(--primary)'
    };
    notification.style.borderLeft = '4px solid ' + (colors[type] || colors.info);
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(function() {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    });
    
    // Auto remove after 3 seconds
    setTimeout(function() {
        notification.style.transform = 'translateY(20px)';
        notification.style.opacity = '0';
        setTimeout(function() { notification.remove(); }, 400);
    }, 3000);
}

// ===== 7. Console Easter Egg =====
function showConsoleEasterEgg() {
    console.log('%c✨ 欢迎来到俊俊菌的个人博客 V2 ✨', 'color: #00a1d6; font-size: 18px; font-weight: bold;');
    console.log('%c这是一个用心设计的个人网站，希望你会喜欢 💖', 'color: #ff6b6b');
    console.log('%c技术栈: HTML5 + CSS3 + Vanilla JavaScript', 'color: #ffd166');
    console.log('%c🎮 游戏开发 | 🎵 音乐创作 | 🎨 美术设计', 'color: #4CAF50');
}

// ===== 8. Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 9. Scroll Animations (Intersection Observer) =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.glass-card').forEach(function(card) {
        observer.observe(card);
    });
}

// Initialize scroll animations
setTimeout(initScrollAnimations, 500);

// ===== 10. Window Resize Handler =====
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebarToggle) return;
    
    const sidebarIcon = sidebarToggle.querySelector('i');
    
    // On large screens, auto expand sidebar
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('active');
        sidebarIcon.classList.remove('fa-times');
        sidebarIcon.classList.add('fa-bars');
        document.body.style.overflow = '';
    }
});

// ===== 11. Card Hover Effects =====
document.querySelectorAll('.glass-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() {
        card.style.transform = 'translateY(-6px)';
    });
    
    card.addEventListener('mouseleave', function() {
        card.style.transform = 'translateY(0)';
    });
});

// ===== 12. Article Click Handler =====
document.querySelectorAll('.article-item').forEach(function(article) {
    article.addEventListener('click', function() {
        const title = article.querySelector('.article-title');
        if (title && title.textContent.indexOf('敬请期待') > -1) {
            showNotification('📝 文章正在创作中，敬请期待！', 'info');
        }
    });
});
