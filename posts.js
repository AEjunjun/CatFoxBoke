// ===== 文章列表配置文件 =====
// 配置你的文章信息，Markdown 文件放在 GitHub 仓库的 /articles/ 文件夹下

const POSTS_CONFIG = [
    {
        // 文章唯一标识（用于 URL 参数）
        id: 'welcome',
        // 文章标题
        title: '欢迎来到我的博客',
        // 发布日期
        date: '2025-03-30',
        // 文章分类
        category: '公告',
        // 文章摘要
        excerpt: '欢迎大家！这是我的第一篇博客文章，介绍这个博客的用途和目标。',
        // 你的 GitHub 仓库中 Markdown 文件的 Raw 链接
        mdUrl: 'https://raw.githubusercontent.com/AEjunjun/Personal-Document-Library/main/README.md'
    }
    // ===== 添加新文章只需要复制下面这个块 =====
    // ,{
    //     id: 'post-id',
    //     title: '文章标题',
    //     date: '2025-04-15',
    //     category: '分类',
    //     excerpt: '文章摘要...',
    //     mdUrl: 'https://raw.githubusercontent.com/AEjunjun/Personal-Document-Library/main/articles/your-post.md'
    // }
];
