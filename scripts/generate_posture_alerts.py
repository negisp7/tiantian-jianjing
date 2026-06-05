#!/usr/bin/env python3
"""
生成低头时间过长的语音提醒音频文件
使用 edge-tts zh-CN-XiaoxiaoNeural 女声
"""
import asyncio
import os
import edge_tts

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../assets/audio/posture-alerts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

ALERTS = [
    # (文件名, 文本, 触发时机)
    ("alert_1min_a.mp3", "小心哦，你已经低头一分钟啦，抬起头来，让颈部休息一下吧。", "1分钟-A"),
    ("alert_1min_b.mp3", "颈部是不是有点酸了呀？轻轻抬起头，放松一下眼睛和脖子。", "1分钟-B"),
    ("alert_5min_a.mp3", "已经低头五分钟了呢，来，停一停，轻轻做三次颈部前后拉伸，对自己好一点。", "5分钟-A"),
    ("alert_5min_b.mp3", "休息一下吧，抬头挺胸，慢慢深呼吸三次，颈椎会很感谢你的。", "5分钟-B"),
    ("alert_10min.mp3", "你已经低头十分钟了，颈椎需要休息啦，快来做一组颈部放松操，照顾好自己哦。", "10分钟"),
]

async def generate_one(filename, text, label):
    output_path = os.path.join(OUTPUT_DIR, filename)
    communicate = edge_tts.Communicate(
        text=text,
        voice="zh-CN-XiaoxiaoNeural",
        rate="-5%",
        pitch="+0Hz",
    )
    await communicate.save(output_path)
    size = os.path.getsize(output_path)
    print(f"✅ [{label}] {filename} ({size // 1024} KB)")

async def main():
    print(f"输出目录: {OUTPUT_DIR}")
    tasks = [generate_one(fn, text, label) for fn, text, label in ALERTS]
    await asyncio.gather(*tasks)
    print("\n所有语音文件生成完成！")

if __name__ == "__main__":
    asyncio.run(main())
