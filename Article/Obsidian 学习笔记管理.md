---
title: 使用 Obsidian 高效管理学习笔记
category: web
categoryName: Web 开发
tags: Obsidian,Markdown,笔记,效率
excerpt: 分享我的 Obsidian 笔记管理方法：文件夹结构、Markdown 技巧、双链使用和知识图谱构建。
---

## 为什么选 Obsidian

在试过 Notion、Typora、OneNote 之后，我最终选择了 Obsidian。原因很简单：

- **本地存储**：笔记在自己电脑上，不依赖云端
- **纯 Markdown**：通用格式，不会被平台锁定
- **双链功能**：笔记之间可以互相链接，构建知识网络
- **插件生态**：海量社区插件，功能无限扩展

## 我的文件夹结构

```text
E:\Obsidian\
├── C++笔记\          # C++ 和 Windows API 学习
│   ├── Win32_API.md
│   ├── STL容器.md
│   └── 内存管理.md
├── 树莓派\           # 竞赛项目相关
│   ├── ADS1115配置.md
│   ├── MQTT协议.md
│   └── GPIO控制.md
├── Web开发\          # 前端和后端
│   ├── HTML_CSS.md
│   ├── JavaScript.md
│   └── GitHub_Pages.md
├── 游戏开发\         # Unity 和 C#
│   ├── CSharp基础.md
│   └── Unity入门.md
└── Daily\            # 每日记录
    ├── 2026-06-03.md
    └── 2026-06-02.md
```

> **原则**：按项目/领域分文件夹，而不是按日期分。这样查找方便。

## Markdown 写作技巧

### 代码块

````markdown
```python
def hello():
    print("Hello, Obsidian!")
```
````

### 表格

```markdown
| 参数 | 类型 | 说明 |
|------|------|------|
| name | string | 传感器名称 |
| value | float | 当前读数 |
```

### 双链

```markdown
在 [[ADS1115配置]] 中已经配置好了 ADC 参数...
```

用 `[[笔记名]]` 创建内部链接，点击即可跳转。这是 Obsidian 最强大的功能！

### 标签

```markdown
#cpp #树莓派 #传感器
```

配合标签面板可以快速筛选相关笔记。

## 推荐插件

| 插件 | 用途 |
|------|------|
| Calendar | 日历视图，方便管理 Daily 笔记 |
| Excalidraw | 在笔记中画图 |
| Dataview | 用 SQL 方式查询笔记 |
| Mind Map | 将笔记转为思维导图 |
| Git | 自动备份到 GitHub |

## 使用习惯

1. **每天建一个 Daily 笔记**：记录当天学到的零散知识点
2. **周末整理**：把 Daily 中有价值的内容提炼到专题笔记中
3. **多用双链**：关联越多，以后检索越方便
4. **不要完美主义**：先记下来，格式事后调整

## 备份策略

Obsidian 数据就是普通文件夹，所以备份很简单：

```bash
# 可以用 Git 备份
git init
git add .
git commit -m "备份笔记"
git remote add origin https://github.com/AEjunjun/obsidian-notes.git
git push

# 或者直接复制到 OneDrive / U 盘
```

## 总结

Obsidian 已经成为我最重要的学习工具，从 C++ 笔记到竞赛项目文档，所有知识都集中管理。

> 好的工具 + 坚持记录 = 扎实的知识体系。一起加油吧！
