---
title: Spark LLM的Windows部署
category: AI
categoryName: AI
tags: Windows,AI
excerpt: Spark LLM在windows里的部署教程(写的不是很好)
---

## 第一步，安装必要工具与运行环境

【1】安装XHToken/llama.cpp 的 `llama-server.exe`
*因为park-X2.5 是 `spark2_5` 架构，要用能识别它的 llama.cpp，所以优先使用 XHToken 版*

```Windows_PowerShell
git clone https://github.com/XHToken/llama.cpp.git llama.cpp-spark
```

**温馨提示：安装前确保git，cmake已经正确安装！**

开始编译环境：
```Windows_PowerShell
cd llama.cpp-spark
cmake -B build
cmake --build build --config Release -j
```

编译完成后的预期文件：`\llama.cpp-spark\build\bin\llama-server.exe`
git下载太慢用免费的：`https://v6.gh-proxy.org/[github原链接]`

确认服务器版本是否存在：
```Windows_PowerShell

Get-ChildItem D:\AI_Deployment\llama.cpp-spark\build\bin\Release\ -Filter *.exe
Get-ChildItem D:\AI_Deployment\llama.cpp-spark\build -Recurse -Filter llama-server.exe
```

如果没看到 `llama-server.exe`，说明 cmake 没构建 server 目标/被选项关了或版本结构不同：
```Windows_PowerShell
cd llama.cpp-spark
cmake --build build --config Release -j --target llama-server
```

## 第二步，运行AI测试！

运行模型：
```Windows_PowerShell

D:\AI_Deployment\llama.cpp-spark\build\bin\Release\llama-server.exe -m "[模型路径]" --ctx-size 8192 --port 8080 --host 127.0.0.1 -ngl 0 --jinja
```

问他一次问题，就可以初始化模型：
```Windows_PowerShell
curl -UseBasicParsing -Method POST http://127.0.0.1:8080/v1/chat/completions `
  -ContentType "application/json" `
  -Body '{"model":"AI","messages":[{"role":"system","content":"你是星火大模型助手，请用中文简洁回答。"},{"role":"user","content":"你好"}],"temperature":0.2,"max_tokens":256}'
```

结尾两个参数是最重要的：
*temperature（温度）* 控制**回答的随机性/创造性**
*max_tokens（最大token）* 控制**模型最多输出多少 token**

之后你问问他他就会回答你啦！
#### 小技巧
你可以使用.bat文件双击启动AI模型哦！
如果想写系统提示词(System prompt)：
可以把 system prompt 写成一个 `.txt` 文件，比如 `D:\AI_Deployment\system_prompt.txt`
然后再.bat里面调用就好啦！`--system-file "D:\AI_Deployment\system_prompt.txt"`

