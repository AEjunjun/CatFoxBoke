# CatFoxBoke 个人博客

纯静态个人博客，GitHub 风格暗色界面，无需后端、无需构建，数据全部通过 JSON 驱动。

在线预览：https://aejunjun.github.io/CatFoxBoke/

## 功能

- **首页**：三栏连窗布局 —— 左侧个人资料 + 音乐播放器 + 时钟，中间自述文件（HOME.md）打字机渲染，右侧技能墙 + 最新文档
- **文章**：Markdown 驱动，按分类筛选、标签过滤、关键词搜索（Ctrl+F 快速聚焦）
- **项目**：JSON 配置，标签自动分类（一个项目可属于多个标签）
- **荣誉墙**：图片卡片展示
- **仓库**：自动拉取 GitHub 公开仓库
- **主题**：白日 / 暗月双主题切换，自定义背景（预设 + 本地导入），默认蓝色粒子背景（鼠标避让、彗星拖尾）
- **移动端**：响应式适配

## 目录结构

```
├── index.html            页面入口
├── style.css             样式
├── script.js             逻辑
├── marked.min.js         Markdown 渲染（本地引用，不依赖 CDN）
├── HOME.md               主页自述文件（首页中间展示）
├── Article/              文章（.md，中文文件名，支持 front matter）
├── Award/                荣誉图片
├── img/                  预设背景图
├── mp3/                  音乐（首个图片文件作为封面）
├── data/                 自动生成的索引 JSON（勿手动编辑）
├── generate_docs.py      本地索引生成脚本
└── generate_docs_github.py  部署用索引生成脚本
```

## 日常使用

**新增文章**：把 `.md` 文件放入 `Article/`，可选 front matter：

```markdown
---
title: 文章标题
category: cpp
categoryName: C / C++
tags: 标签1,标签2
date: 2026-10-26
excerpt: 自定义摘要
---
```

然后运行：

```bash
python generate_docs.py
```

**新增音乐**：往 `mp3/` 放 `.mp3`，运行一次脚本即可自动收录。

**新增预设背景**：往 `img/` 放图片，运行脚本即可。

**修改个人信息 / 技能 / 链接**：编辑 `data/profile.json`。

**修改项目**：编辑 `data/projects.json`，`tags` 数组随意填，页面自动生成分类按钮。

**修改荣誉墙**：编辑 `data/honors.json`。

## 部署到 GitHub Pages

1. 运行部署版索引脚本（会询问仓库名，为文章路径添加前缀）：

```bash
python generate_docs_github.py
```

2. 推送仓库后在 Settings → Pages 选择 `main` 分支根目录
3. 仓库根目录已包含 `.nojekyll`（必须保留，否则 Jekyll 会吞掉 .md 文件导致文章 404）

> 注意：运行部署脚本后本地预览会 404，重新运行 `python generate_docs.py` 即可恢复。

## 素材版权说明

本仓库 `mp3/` 文件夹中的音乐、`img/` 文件夹中的图片**版权归原作者/版权方所有**，本人不拥有其版权，仅用于个人博客的非商业展示与学习交流。如有侵权请联系作者删除。

## License

代码部分可自由学习参考；文章内容归作者所有。

代码部分遵循GPLv3.0开源协议
