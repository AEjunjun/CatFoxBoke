---
title: C++ Windows API 从零开始学习笔记
category: cpp
categoryName: C / C++
tags: C++,Windows API,Win32,笔记
date: 2026-10-26
excerpt: 从 WinMain 入口函数到消息循环，手把手带你理解 Windows 桌面程序的核心机制。
---

## 前言

最近开始系统学习 C++ 和 Windows API，发现网上很多教程要么太老（VC6 时代），要么太跳跃。这篇笔记记录了我从零搭建第一个 Win32 窗口程序的完整过程，希望对同样在入门的朋友有帮助 qwq。

## 什么是 Windows API

Windows API（Win32 API）是微软提供的一组 C 语言风格函数，用来直接操作 Windows 操作系统。和 MFC、Qt 这类框架不同，Win32 API 是最底层的接口，你写的每一行代码都在直接和系统对话。

**学习 Win32 API 的好处：**

- 深入理解 Windows 程序运行机制
- 写出更轻量、更可控的程序
- 为后续学习 C++ 框架打下扎实基础

## 第一个窗口程序

下面是一个最小化的 Win32 窗口程序框架：

```cpp
#include <windows.h>

// 窗口过程函数 - 处理所有窗口消息
LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_DESTROY:
            PostQuitMessage(0);  // 窗口关闭时退出消息循环
            return 0;
        case WM_PAINT: {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);
            FillRect(hdc, &ps.rcPaint, (HBRUSH)(COLOR_WINDOW + 1));
            EndPaint(hwnd, &ps);
            return 0;
        }
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

// 程序入口点
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance,
                   LPSTR lpCmdLine, int nCmdShow) {
    // 1. 注册窗口类
    const wchar_t CLASS_NAME[] = L"Sample Window Class";
    WNDCLASS wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    RegisterClass(&wc);

    // 2. 创建窗口
    HWND hwnd = CreateWindowEx(
        0, CLASS_NAME, L"我的第一个窗口", WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600,
        NULL, NULL, hInstance, NULL
    );

    if (hwnd == NULL) return 0;

    // 3. 显示窗口
    ShowWindow(hwnd, nCmdShow);

    // 4. 消息循环
    MSG msg = {};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
```

## 核心概念解析

### WinMain 入口函数

和普通 C++ 程序的 `main()` 不同，Windows 桌面程序使用 `WinMain` 作为入口。它接收四个参数：

| 参数 | 含义 |
|------|------|
| `hInstance` | 当前实例句柄 |
| `hPrevInstance` | 前一实例句柄（Win32 中始终为 NULL） |
| `lpCmdLine` | 命令行参数 |
| `nCmdShow` | 窗口初始显示方式 |

### 消息循环机制

Windows 程序是 **事件驱动** 的。系统把鼠标点击、键盘输入、窗口缩放等操作打包成「消息」，程序通过消息循环不断接收并处理这些消息。

```cpp
while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);  // 转换键盘消息
    DispatchMessage(&msg);   // 分派给窗口过程
}
```

### 窗口过程函数

这是整个程序的核心！所有窗口行为都在 `WindowProc` 中通过 `switch-case` 响应不同的消息类型。

## 小结

Win32 API 上手确实有门槛，但一旦理解了消息驱动模型，后续的学习曲线会平滑很多。下一篇计划讲 GDI 绘图和控件使用，敬请期待~

> 学习资源推荐：《Windows 程序设计》（Charles Petzold 著），虽然有些年头了，但原理永远不会过时。
