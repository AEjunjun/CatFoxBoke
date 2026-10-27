---
title: Python MQTT 物联网通信协议入门
category: python
categoryName: Python
tags: Python,MQTT,物联网,paho-mqtt
excerpt: 使用 paho-mqtt 库实现传感器数据上报，详解发布/订阅模型、QoS 等级与断线重连机制。
---

## 什么是 MQTT

MQTT（Message Queuing Telemetry Transport）是一种**轻量级发布/订阅消息传输协议**，专为低带宽、不可靠网络环境下的 IoT 设备设计。

**核心特点：**

- 协议头极小（最小 2 字节）
- 支持三种 QoS（服务质量）等级
- 断线自动重连
- 一对多消息推送

## 发布/订阅模型

不同于 HTTP 的「请求-响应」模式，MQTT 通过 **主题（Topic）** 来路由消息：

```text
传感器 ─── publish ──→ [MQTT Broker] ── subscribe ──→ 监控端
                           ↑
                      消息中转站
```

- **Publisher（发布者）**：发送消息到指定主题
- **Subscriber（订阅者）**：接收感兴趣主题的消息
- **Broker（代理服务器）**：负责消息路由

## 快速上手 paho-mqtt

安装依赖：

```bash
pip install paho-mqtt
```

### 基础示例

```python
import paho.mqtt.client as mqtt
import time

# 回调：连接成功
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[OK] 已连接到 MQTT Broker")
    else:
        print(f"[NO] 连接失败，返回码: {rc}")

# 回调：收到消息
def on_message(client, userdata, msg):
    print(f"[收到] 主题: {msg.topic} | 内容: {msg.payload.decode()}")

# 创建客户端
client = mqtt.Client(client_id="raspberry_pi_001")
client.on_connect = on_connect
client.on_message = on_message

# 连接公共 Broker
client.connect("broker.emqx.io", 1883, 60)

# 订阅主题
client.subscribe("sensor/soil")

# 启动消息循环
client.loop_start()

# 发布消息
for i in range(5):
    client.publish("sensor/soil", f"ADC:5000 湿度:{25+i:.1f}%")
    time.sleep(2)

client.loop_stop()
```

## QoS 服务质量等级

| 等级 | 名称 | 说明 |
|------|------|------|
| QoS 0 | 最多一次 | 发完不管，可能丢消息 |
| QoS 1 | 至少一次 | 保证送达，可能重复 |
| QoS 2 | 恰好一次 | 保证送达且不重复 |

```python
# QoS 使用示例
client.publish("sensor/alert", "水位过高！", qos=1)
```

实际项目中传感器数据上报通常使用 QoS 0（丢了就等下一次采样），告警消息使用 QoS 1。

## 断线重连

```python
client = mqtt.Client()

# 设置遗嘱消息 - 客户端断开时自动发布
client.will_set("device/status", "离线", qos=1, retain=True)

# 自动重连
client.connect_async("broker.emqx.io", 1883, 60)
client.reconnect_delay_set(min_delay=1, max_delay=30)
```

## 主题通配符

- `+`：匹配单层主题
- `#`：匹配多层主题

```python
client.subscribe("sensor/+")      # 匹配 sensor/soil、sensor/temp 等
client.subscribe("device/#")      # 匹配 device/status、device/data/temp 等
```

## 总结

MQTT 是物联网通信的事实标准，搭配 Python 的 paho-mqtt 库可以快速实现设备数据上云。在树莓派竞赛项目中，我正是用它把传感器数据实时推送到手机端监控。

> 推荐一个好用的公共 Broker：broker.emqx.io，免费且稳定 ~
