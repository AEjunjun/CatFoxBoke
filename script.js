// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 个人静态博客已加载');
    
    // 初始化所有功能
    initThemeToggle();
    initSidebarToggle();
    initNavigation();
    initBackgroundSelector();
    initCustomCursor();
    
    // 页面加载动画
    setTimeout(() => {
        document.body.style.opacity = 1;
    }, 100);
});

// 1. 主题切换
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // 检查本地存储
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
            console.log('🌙 切换至暗色模式');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
            console.log('🌞 切换至亮色模式');
        }
    });
}

// 2. 侧边栏切换（移动端）
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
        } else {
            sidebarIcon.classList.remove('fa-times');
            sidebarIcon.classList.add('fa-bars');
        }
    });
    
    // 点击主内容区关闭侧边栏（移动端）
    document.querySelector('.main-content').addEventListener('click', () => {
        if (window.innerWidth <= 1024 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            sidebarIcon.classList.remove('fa-times');
            sidebarIcon.classList.add('fa-bars');
        }
    });
}

// 3. 导航切换
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有active类
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // 添加active类到当前项
            item.classList.add('active');
            
            // 显示对应的内容区
            const target = item.getAttribute('href').substring(1);
            const targetSection = document.getElementById(target + 'Content');
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 添加淡入动画
                targetSection.classList.add('fade-in');
                setTimeout(() => {
                    targetSection.classList.remove('fade-in');
                }, 300);
            }
            
            // 移动端自动关闭侧边栏
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                const sidebarToggle = document.getElementById('sidebarToggle');
                const sidebarIcon = sidebarToggle.querySelector('i');
                
                sidebar.classList.remove('active');
                sidebarIcon.classList.remove('fa-times');
                sidebarIcon.classList.add('fa-bars');
            }
        });
    });
}

// 4. 背景选择器
function initBackgroundSelector() {
    const bgToggle = document.getElementById('bgToggle');
    const bgSelector = document.getElementById('bgSelector');
    const closeSelector = document.getElementById('closeSelector');
    const bgOptions = document.querySelectorAll('.bg-option');
    const bgUpload = document.getElementById('bgUpload');
    const customBg = document.getElementById('customBg');
    
    if (!bgToggle) return;
    
    // 打开背景选择器
    bgToggle.addEventListener('click', () => {
        bgSelector.classList.add('active');
    });
    
    // 关闭背景选择器
    closeSelector.addEventListener('click', () => {
        bgSelector.classList.remove('active');
    });
    
    // 点击背景选择器外部关闭
    bgSelector.addEventListener('click', (e) => {
        if (e.target === bgSelector) {
            bgSelector.classList.remove('active');
        }
    });
    
    // 选择预设背景
    bgOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有active类
            bgOptions.forEach(opt => opt.classList.remove('active'));
            
            // 添加active类到当前选项
            option.classList.add('active');
            
            // 更改背景
            const bgUrl = option.getAttribute('data-bg');
            customBg.style.backgroundImage = bgUrl;
            
            // 保存到本地存储
            localStorage.setItem('customBackground', bgUrl);
            
            console.log('🎨 背景已更换');
        });
    });
    
    // 上传自定义背景
    if (bgUpload) {
        bgUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const bgUrl = `url('${e.target.result}')`;
                    customBg.style.backgroundImage = bgUrl;
                    localStorage.setItem('customBackground', bgUrl);
                    console.log('🖼️ 自定义背景已上传');
                    
                    // 关闭选择器
                    bgSelector.classList.remove('active');
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // 加载保存的背景
    const savedBg = localStorage.getItem('customBackground');
    if (savedBg) {
        customBg.style.backgroundImage = savedBg;
    }
}

// 5. 自定义光标增强
function initCustomCursor() {
    // 为链接和按钮添加悬停效果
    const interactiveElements = document.querySelectorAll('a, button, .clickable');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.05)';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
        });
    });
    
    // 为卡片添加悬停效果
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// 6. 窗口大小调整处理
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebarToggle) return;
    
    const sidebarIcon = sidebarToggle.querySelector('i');
    
    // 在大屏设备上自动展开侧边栏
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('active');
        if (sidebarIcon) {
            sidebarIcon.classList.remove('fa-times');
            sidebarIcon.classList.add('fa-bars');
        }
    }
});

// 7. 添加控制台彩蛋
console.log('%c✨ 欢迎来到我的静态个人博客！', 
    'color: #00a1d6; font-size: 16px; font-weight: bold;');
console.log('%c这是一个纯静态网站，所有内容都在本地编辑。', 
    'color: #ff6b6b;');
console.log('%c修改内容只需编辑HTML文件即可。', 
    'color: #00a1d6;');

// 8. 页面平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

// 9. 初始化滚动动画
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // 观察所有卡片
    document.querySelectorAll('.glass-card').forEach(card => {
        observer.observe(card);
    });
}

// 初始化滚动动画
setTimeout(initScrollAnimations, 500);