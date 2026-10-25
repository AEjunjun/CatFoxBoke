# -*- coding: utf-8 -*-
"""
generate_docs.py
扫描 Article/ 文件夹中的 Markdown 文章，自动生成 data/docs.json 索引文件。
网页端通过读取该 JSON 渲染文章列表与文档目录，无需手动维护。

根目录的 HOME.md 是站点自述文件（主页展示），由网页直接读取，不经过本脚本。

用法：
    python generate_docs.py

每篇文章支持可选的 Front Matter（文件头部）：
    ---
    title: 文章标题
    category: cpp
    categoryName: C / C++
    tags: 标签1,标签2
    date: 2026-06-03
    excerpt: 自定义摘要
    ---

未提供时：title 取第一个 # 标题，date 取文件修改时间，
excerpt 取第一段正文，readtime 按约 400 字/分钟自动估算。
"""

import json
import os
import re
import sys
import io
import datetime

# Windows 控制台中文输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ARTICLE_DIR = "Article"
OUT_PATH = os.path.join("data", "docs.json")
MUSIC_DIR = "mp3"
MUSIC_OUT = os.path.join("data", "music.json")
BG_DIR = "img"
BG_OUT = os.path.join("data", "backgrounds.json")
IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp", ".gif")


def scan_backgrounds():
    """扫描 img/ 文件夹生成 data/backgrounds.json（预设背景列表）"""
    if not os.path.isdir(BG_DIR):
        return
    images = [BG_DIR + "/" + fn for fn in sorted(os.listdir(BG_DIR))
              if fn.lower().endswith(IMAGE_EXT)]
    with open(BG_OUT, "w", encoding="utf-8") as f:
        json.dump({"images": images}, f, ensure_ascii=False, indent=2)
    print("[完成] 已生成 %s，共 %d 张预设背景" % (BG_OUT, len(images)))


def scan_music():
    """扫描 mp3/ 文件夹生成 data/music.json；首个图片文件作为封面"""
    if not os.path.isdir(MUSIC_DIR):
        return
    tracks = []
    cover = ""
    for fn in sorted(os.listdir(MUSIC_DIR)):
        low = fn.lower()
        if low.endswith(".mp3"):
            tracks.append({"title": os.path.splitext(fn)[0], "file": MUSIC_DIR + "/" + fn})
        elif low.endswith(IMAGE_EXT) and not cover:
            cover = MUSIC_DIR + "/" + fn
    with open(MUSIC_OUT, "w", encoding="utf-8") as f:
        json.dump({"cover": cover, "tracks": tracks}, f, ensure_ascii=False, indent=2)
    print("[完成] 已生成 %s，共 %d 首音乐" % (MUSIC_OUT, len(tracks)))


def parse_front_matter(text):
    """解析文件头部的 front matter，返回 (meta, body)"""
    meta = {}
    match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n", text, re.S)
    if match:
        for line in match.group(1).splitlines():
            key, sep, value = line.partition(":")
            if sep:
                meta[key.strip()] = value.strip()
        body = text[match.end():]
    else:
        body = text
    return meta, body


def extract_title(meta, body, filename):
    if meta.get("title"):
        return meta["title"]
    m = re.search(r"^#\s+(.+)$", body, re.M)
    if m:
        return m.group(1).strip()
    return os.path.splitext(filename)[0]


def extract_excerpt(meta, body, max_len=90):
    if meta.get("excerpt"):
        return meta["excerpt"]
    for block in re.split(r"\n\s*\n", body):
        line = block.strip()
        if not line:
            continue
        if line.startswith(("#", "```", "|", ">", "-", "*")):
            continue
        line = re.sub(r"[`*_\[\]()#]", "", line).strip()
        if line:
            return line[:max_len] + ("..." if len(line) > max_len else "")
    return ""


def calc_readtime(body):
    """按中文约 400 字/分钟估算阅读时长"""
    chars = len(re.sub(r"\s", "", body))
    return "%d 分钟" % max(1, round(chars / 400))


def main():
    if not os.path.isdir(ARTICLE_DIR):
        print("[错误] 找不到 %s/ 文件夹，请先创建并放入 .md 文章" % ARTICLE_DIR)
        sys.exit(1)

    entries = []
    for filename in os.listdir(ARTICLE_DIR):
        if not filename.lower().endswith(".md"):
            continue
        path = os.path.join(ARTICLE_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        meta, body = parse_front_matter(text)
        mtime = datetime.datetime.fromtimestamp(os.stat(path).st_mtime)

        tags = []
        if meta.get("tags"):
            tags = [t.strip() for t in meta["tags"].split(",") if t.strip()]

        entries.append({
            "file": filename,
            "title": extract_title(meta, body, filename),
            "category": meta.get("category", "misc"),
            "categoryName": meta.get("categoryName", meta.get("category", "其他")),
            "tags": tags,
            "date": meta.get("date", mtime.strftime("%Y-%m-%d")),
            "excerpt": extract_excerpt(meta, body),
            "readtime": calc_readtime(body)
        })
        print("[扫描] %s -> %s" % (filename, entries[-1]["title"]))

    # 按日期倒序（新文章在前）
    entries.sort(key=lambda e: e["date"], reverse=True)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    payload = {
        "updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "readme": "HOME.md",
        "count": len(entries),
        "docs": entries
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print("[完成] 已生成 %s，共 %d 篇文章" % (OUT_PATH, len(entries)))
    scan_music()
    scan_backgrounds()
    print("[提示] 本地预览请运行: python -m http.server 8000 然后访问 http://localhost:8000")


if __name__ == "__main__":
    main()
