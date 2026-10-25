---
title: GitHub Pages 部署个人网站完整指南
category: web
categoryName: Web 开发
tags: GitHub,GitHub Pages,部署,前端
date: 2026-10-26
excerpt: 从本地 HTML 到线上访问，手把手教你用 GitHub Pages 部署静态网站，包括路径前缀、SCP 上传等常见坑。
---

## 为什么选 GitHub Pages

- **免费**：无带宽和存储限制（合理使用范围内）
- **HTTPS 自带**：无需额外配置 SSL 证书
- **部署简单**：一条 `git push` 就上线
- **自定义域名**：支持绑定自己的域名

## 两种部署方式

### 方式一：仓库根目录部署

适用于 **用户主页**（`username.github.io` 仓库）。直接将 HTML/CSS/JS 放在仓库根目录，推送后自动部署。

访问地址：`https://你的用户名.github.io/`

### 方式二：子路径部署

适用于 **项目站点**（普通仓库）。网站文件放在仓库的 `/docs` 目录或根目录，但访问时需要加仓库名前缀。

访问地址：`https://你的用户名.github.io/仓库名/`

## 路径前缀问题

这是最常见的坑！部署到子路径时，所有本地资源的引用都需要加前缀：

```html
<!-- 错误：部署到 GitHub Pages 后 404 -->
<link rel="stylesheet" href="/style.css">
<img src="/img/logo.png">

<!-- 正确：加上仓库名前缀 -->
<link rel="stylesheet" href="/Cat_Document_Hub/style.css">
<img src="/Cat_Document_Hub/img/logo.png">
```

而对于 CDN 资源，**不需要** 加前缀：

```html
<!-- CDN 资源保持原样 -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

## 快速部署步骤

```bash
# 1. 初始化 Git（如果还没有）
git init
git add .
git commit -m "初始化博客"

# 2. 关联远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 3. 推送
git push -u origin main

# 4. 在 GitHub 仓库设置中开启 Pages
# Settings → Pages → Source: Deploy from a branch → main → /(root) → Save
```

## Windows 下用 SCP 部署到服务器

如果不想用 GitHub Pages，也可以通过 SCP 部署到自己的 Ubuntu 服务器：

```powershell
# Windows PowerShell 中使用 SCP
scp -r "E:\19847\Desktop\个人博客\*" ubuntu@你的服务器IP:/var/www/html/
```

## 实用技巧

### 1. 自动刷新缓存

GitHub Pages 有时会缓存旧版本。加个版本参数强制刷新：

```html
<link rel="stylesheet" href="/仓库名/style.css?v=2">
```

### 2. 404 页面

在仓库根目录创建 `404.html`，访问不存在的页面时会自动显示。

### 3. 自定义域名

在仓库根目录添加 `CNAME` 文件，写入你的域名，然后在 DNS 中添加 CNAME 记录指向 `你的用户名.github.io`。

## 总结

GitHub Pages 对于静态网站来说是性价比最高的部署方案。记住 **路径前缀** 这个坑就行！

> 我的博客部署在 GitHub Pages 上，欢迎访问 ~
