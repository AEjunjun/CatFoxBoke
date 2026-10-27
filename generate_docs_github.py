# -*- coding: utf-8 -*-
"""
generate_docs_github.py
部署到 GitHub Pages 项目页（https://用户名.github.io/仓库名/）时使用。

与 generate_docs.py 功能相同，但会先询问仓库名，
然后把 docs.json 里每篇文章的 file 写成 "/仓库名/Article/xxx.md"，
保证在子路径部署下文章也能正确加载。

用法：
    python generate_docs_github.py
    （按提示输入仓库名，例如 CatFoxBoke）
"""

import json
import os
import re
import sys
import io
import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8")

ARTICLE_DIR = "Article"
OUT_PATH = os.path.join("data", "docs.json")
MUSIC_DIR = "mp3"
MUSIC_OUT = os.path.join("data", "music.json")
BG_DIR = "img"
BG_OUT = os.path.join("data", "backgrounds.json")
AWARD_DIR = "Award"
AWARD_OUT = os.path.join("data", "honors.json")
IMAGE_EXT = (".jpg", ".jpeg", ".png", ".webp", ".gif")


def scan_backgrounds():
    if not os.path.isdir(BG_DIR):
        return
    images = [BG_DIR + "/" + fn for fn in sorted(os.listdir(BG_DIR))
              if fn.lower().endswith(IMAGE_EXT)]
    with open(BG_OUT, "w", encoding="utf-8") as f:
        json.dump({"images": images}, f, ensure_ascii=False, indent=2)
    print("[完成] 已生成 %s，共 %d 张预设背景" % (BG_OUT, len(images)))


def scan_music():
    if not os.path.isdir(MUSIC_DIR):
        return
    tracks = []
    cover = ""
    for fn in sorted(os.listdir(MUSIC_DIR)):
        low = fn.lower()
        if low.endswith(".mp3"):
            tracks.append({"title": os.path.splitext(fn)[0],
                           "file": MUSIC_DIR + "/" + fn})
        elif low.endswith(IMAGE_EXT) and not cover:
            cover = MUSIC_DIR + "/" + fn
    with open(MUSIC_OUT, "w", encoding="utf-8") as f:
        json.dump({"cover": cover, "tracks": tracks}, f, ensure_ascii=False, indent=2)
    print("[完成] 已生成 %s，共 %d 首音乐" % (MUSIC_OUT, len(tracks)))


def scan_awards():
    """扫描 Award/ 文件夹生成 data/honors.json（荣誉墙）。
    已有条目的 title/date/desc 按文件名保留；新图片 title 取文件名。
    图片改名后重跑本脚本即可自动更新路径，无需手动改 JSON。"""
    if not os.path.isdir(AWARD_DIR):
        return
    old = {}
    if os.path.isfile(AWARD_OUT):
        try:
            with open(AWARD_OUT, "r", encoding="utf-8") as f:
                for item in json.load(f).get("honors", []):
                    key = os.path.basename(item.get("image", ""))
                    if key:
                        old[key] = item
        except (ValueError, OSError):
            pass
    honors = []
    for fn in sorted(os.listdir(AWARD_DIR)):
        if not fn.lower().endswith(IMAGE_EXT):
            continue
        prev = old.get(fn, {})
        honors.append({
            "title": prev.get("title") or os.path.splitext(fn)[0],
            "date": prev.get("date", ""),
            "image": AWARD_DIR + "/" + fn,
            "desc": prev.get("desc", "")
        })
    with open(AWARD_OUT, "w", encoding="utf-8") as f:
        json.dump({"honors": honors}, f, ensure_ascii=False, indent=2)
    print("[完成] 已生成 %s，共 %d 项荣誉" % (AWARD_OUT, len(honors)))


def parse_front_matter(text):
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
    chars = len(re.sub(r"\s", "", body))
    return "%d 分钟" % max(1, round(chars / 400))


def main():
    repo = input("请输入 GitHub 仓库名（例如 CatFoxBoke）：").strip().strip("/")
    if not repo:
        print("[错误] 仓库名不能为空")
        sys.exit(1)
    prefix = "/" + repo

    if not os.path.isdir(ARTICLE_DIR):
        print("[错误] 找不到 %s/ 文件夹" % ARTICLE_DIR)
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
            "file": prefix + "/Article/" + filename,
            "title": extract_title(meta, body, filename),
            "category": meta.get("category", "misc"),
            "categoryName": meta.get("categoryName", meta.get("category", "其他")),
            "tags": tags,
            "date": meta.get("date", mtime.strftime("%Y-%m-%d %H:%M")),
            "excerpt": extract_excerpt(meta, body),
            "readtime": calc_readtime(body)
        })
        print("[扫描] %s -> %s" % (filename, entries[-1]["title"]))

    entries.sort(key=lambda e: e["date"], reverse=True)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    payload = {
        "updated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "readme": "HOME.md",
        "prefix": prefix,
        "count": len(entries),
        "docs": entries
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print("[完成] 已生成 %s，共 %d 篇文章" % (OUT_PATH, len(entries)))
    scan_music()
    scan_backgrounds()
    scan_awards()
    print("[提示] 部署地址: https://<用户名>.github.io%s/" % prefix)
    print("[提示] 此脚本仅供部署使用；本地预览请重新运行 python generate_docs.py")


if __name__ == "__main__":
    main()
