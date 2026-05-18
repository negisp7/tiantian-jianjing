#!/usr/bin/env python3
"""
使用 Microsoft Edge TTS (edge-tts) 预生成所有课程动作的语音文件。
声音：zh-CN-XiaoxiaoNeural（温暖自然的中文女声）
输出目录：assets/audio/
"""

import asyncio
import os
import json
import re
import edge_tts

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'audio')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 使用 XiaoxiaoNeural - 微软最自然的中文女声（温暖、新闻播报风格）
VOICE = "zh-CN-XiaoxiaoNeural"

# ── 所有需要生成的语音文本 ──────────────────────────────────────────────────────

# 固定提示语
FIXED_TEXTS = {
    "start_prefix": "开始",        # 后面接课程名称
    "start_suffix": "，请跟随指引进行锻炼。",
    "complete": "锻炼完成，做得很好！记得补充水分，好好休息。",
    "pause": "已暂停",
    "resume": "继续锻炼",
    "countdown_3": "三",
    "countdown_2": "二",
    "countdown_1": "一",
}

# 课程标题（用于开始播报）
COURSE_TITLES = [
    "晨间颈部唤醒",
    "办公室快速放松",
    "颈椎综合康复",
    "傍晚深度放松",
    "颈椎理疗强化",
    "颈椎深度康复",
]

# 所有动作（name + description 组合播报）
EXERCISES = [
    # light-morning
    ("颈部前屈拉伸", "缓慢低头，感受颈后肌群拉伸，保持呼吸均匀。"),
    ("颈部后伸拉伸", "轻柔仰头，感受颈前肌群拉伸，不要过度后仰。"),
    ("左侧屈拉伸", "头部向左侧倾斜，右肩保持放松下沉。"),
    ("右侧屈拉伸", "头部向右侧倾斜，左肩保持放松下沉。"),
    ("肩部上提放松", "双肩同时上提至耳旁，保持3秒后缓慢放下。"),
    ("颈部缓慢环绕", "以顺时针方向缓慢转动头部，动作要轻柔流畅。"),
    # light-office
    ("颈部左旋", "头部缓慢向左转动，感受右侧颈部拉伸。"),
    ("颈部右旋", "头部缓慢向右转动，感受左侧颈部拉伸。"),
    ("双肩后展", "双肩向后展开，挺胸，感受胸前肌群拉伸。"),
    ("颈部等长静力", "双手交叉置于额头，头部向前用力，手部给予阻力，保持静止。"),
    ("斜方肌拉伸", "右手轻压头部左侧，感受斜方肌拉伸，保持均匀呼吸。"),
    # moderate-comprehensive
    ("颈部前屈拉伸", "缓慢低头至最大幅度，保持10秒，感受颈后肌群充分拉伸。"),
    ("颈部后伸拉伸", "轻柔仰头，保持10秒，注意不要引起眩晕。"),
    ("左侧屈深度拉伸", "头部向左侧倾斜至最大幅度，右手自然下垂，保持15秒。"),
    ("右侧屈深度拉伸", "头部向右侧倾斜至最大幅度，左手自然下垂，保持15秒。"),
    ("颈部左旋强化", "头部向左旋转至最大幅度，保持10秒，重复3次。"),
    ("颈部右旋强化", "头部向右旋转至最大幅度，保持10秒，重复3次。"),
    ("颈部前向等长抗阻", "双手交叉置于额头，头部向前用力，手部给予阻力，保持6秒，重复5次。"),
    ("颈部后向等长抗阻", "双手置于头后，头部向后用力，手部给予阻力，保持6秒，重复5次。"),
    ("肩胛骨后缩", "双肩向后夹紧，感受肩胛骨靠拢，保持5秒后放松，重复10次。"),
    ("颈部缓慢环绕", "顺时针缓慢环绕3圈，再逆时针3圈，动作要轻柔流畅。"),
    # moderate-evening
    ("颈部热身环绕", "小幅度缓慢环绕，逐渐增大活动范围，热身颈部关节。"),
    ("胸锁乳突肌拉伸左", "头部向右旋转并轻微后仰，感受左侧颈前肌群拉伸，保持20秒。"),
    ("胸锁乳突肌拉伸右", "头部向左旋转并轻微后仰，感受右侧颈前肌群拉伸，保持20秒。"),
    ("斜方肌深度拉伸", "右手轻压头部左侧，左手向下伸展，感受斜方肌充分拉伸，保持25秒。"),
    ("颈部前屈深度拉伸", "双手交叉置于头后，轻轻向下引导，感受颈后深层肌群拉伸。"),
    ("肩部放松摇摆", "双肩放松，做前后摇摆动作，配合深呼吸，彻底放松肩部肌群。"),
    ("颈部逆时针环绕", "逆时针缓慢环绕，感受颈部各方向充分活动。"),
    # intense-therapy
    ("颈部热身活动", "小幅度缓慢活动颈部各方向，充分热身，避免突然大幅度动作。"),
    ("颈部前屈深度拉伸", "低头至最大幅度，双手轻压头后，保持20秒，重复3次。"),
    ("颈部后伸深度拉伸", "仰头至舒适最大幅度，保持15秒，注意不引起眩晕，重复3次。"),
    ("侧屈深度拉伸（左）", "头部向左侧倾斜，右手向下伸展，保持20秒，重复3次。"),
    ("侧屈深度拉伸（右）", "头部向右侧倾斜，左手向下伸展，保持20秒，重复3次。"),
    ("颈部旋转深度拉伸（左）", "头部向左旋转至最大幅度，保持15秒，重复4次。"),
    ("颈部旋转深度拉伸（右）", "头部向右旋转至最大幅度，保持15秒，重复4次。"),
    ("颈部多方向等长抗阻", "依次对前、后、左、右四个方向进行等长抗阻训练，每方向保持8秒。"),
    ("斜方肌深度拉伸（双侧）", "左右各深度拉伸斜方肌，每侧保持30秒，配合深呼吸。"),
    ("颈部神经松动（左）", "头部向右侧倾斜，左臂向下伸展并缓慢弯曲手腕，感受神经轻微拉伸。"),
    ("颈部神经松动（右）", "头部向左侧倾斜，右臂向下伸展并缓慢弯曲手腕，感受神经轻微拉伸。"),
    ("颈部全方向缓慢环绕", "以最慢速度顺时针环绕3圈，再逆时针3圈，感受每个方向的活动度。"),
    # intense-recovery
    ("颈部深层稳定肌激活", "轻微收下颌（颈部回缩），激活深层颈屈肌，保持10秒，重复10次。"),
    ("颈部前屈等长训练", "头部向前用力抵住双手，保持8秒，重复8次，训练颈屈肌耐力。"),
    ("颈部后伸等长训练", "头部向后用力抵住双手，保持8秒，重复8次，训练颈伸肌耐力。"),
    ("侧向等长训练（双侧）", "头部向左右各用力抵住单手，每侧保持8秒，重复6次，训练侧屈肌耐力。"),
    ("肩胛骨稳定训练", "双肩后缩下沉，保持10秒，重复12次，改善肩胛骨稳定性。"),
    ("颈部全范围拉伸", "依次进行前屈、后伸、左右侧屈、左右旋转的全范围拉伸，每方向20秒。"),
]

def make_key(text: str) -> str:
    """将文本转为安全的文件名 key（去除特殊字符）"""
    # 保留中文、字母、数字，其余替换为下划线
    key = re.sub(r'[^\w\u4e00-\u9fff]', '_', text)
    key = re.sub(r'_+', '_', key).strip('_')
    return key[:60]  # 限制长度

async def generate_audio(text: str, filename: str, rate: str = "+0%", pitch: str = "+0Hz"):
    """生成单个音频文件"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        print(f"  [跳过] {filename} (已存在)")
        return True
    try:
        communicate = edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch)
        await communicate.save(filepath)
        size = os.path.getsize(filepath)
        print(f"  [OK] {filename} ({size} bytes) - {text[:30]}...")
        return True
    except Exception as e:
        print(f"  [错误] {filename}: {e}")
        return False

async def main():
    print(f"🎙️  开始生成 TTS 音频文件")
    print(f"   声音: {VOICE}")
    print(f"   输出目录: {OUTPUT_DIR}")
    print()

    # 用于生成 manifest.json 的映射表
    manifest = {}

    # 1. 固定提示语
    print("── 固定提示语 ──")
    fixed_map = {
        "complete": "锻炼完成，做得很好！记得补充水分，好好休息。",
        "pause": "已暂停",
        "resume": "继续锻炼",
        "countdown_3": "三",
        "countdown_2": "二",
        "countdown_1": "一",
    }
    for key, text in fixed_map.items():
        filename = f"{key}.mp3"
        # 倒计时用稍快语速
        rate = "+15%" if key.startswith("countdown") else "+0%"
        pitch = "+2Hz" if key.startswith("countdown") else "+0Hz"
        ok = await generate_audio(text, filename, rate=rate, pitch=pitch)
        if ok:
            manifest[key] = filename

    # 2. 课程开始提示（每个课程标题）
    print("\n── 课程开始提示 ──")
    for title in COURSE_TITLES:
        text = f"开始{title}，请跟随指引进行锻炼。"
        key = f"start_{make_key(title)}"
        filename = f"{key}.mp3"
        ok = await generate_audio(text, filename)
        if ok:
            manifest[key] = filename

    # 3. 动作语音（name + description，去重）
    print("\n── 动作语音 ──")
    seen = set()
    for name, desc in EXERCISES:
        text = f"{name}。{desc}"
        if text in seen:
            continue
        seen.add(text)
        key = f"ex_{make_key(name)}_{make_key(desc)[:20]}"
        filename = f"{key}.mp3"
        ok = await generate_audio(text, filename)
        if ok:
            manifest[key] = filename

    # 4. 保存 manifest.json
    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"\n✅ 生成完成！共 {len(manifest)} 个音频文件")
    print(f"   Manifest: {manifest_path}")

    # 5. 生成 TypeScript 映射文件（供 App 使用）
    generate_ts_map(manifest)

def generate_ts_map(manifest: dict):
    """生成 TypeScript 音频映射文件"""
    lines = [
        "/**",
        " * 自动生成的 TTS 音频映射表",
        " * 由 scripts/generate_tts.py 生成，请勿手动修改",
        " */",
        "",
        "// 音频文件映射（key → require() 路径）",
        "export const AUDIO_MAP: Record<string, any> = {",
    ]
    for key, filename in manifest.items():
        lines.append(f"  '{key}': require('../assets/audio/{filename}'),")
    lines.append("};")
    lines.append("")
    lines.append("// 根据文本内容查找对应的音频 key")
    lines.append("export function getAudioKey(type: string, ...args: string[]): string | null {")
    lines.append("  switch (type) {")
    lines.append("    case 'complete': return 'complete';")
    lines.append("    case 'pause': return 'pause';")
    lines.append("    case 'resume': return 'resume';")
    lines.append("    case 'countdown': return `countdown_${args[0]}`;")
    lines.append("    case 'start': {")
    lines.append("      const key = `start_${sanitizeKey(args[0])}`;")
    lines.append("      return key in AUDIO_MAP ? key : null;")
    lines.append("    }")
    lines.append("    case 'exercise': {")
    lines.append("      const key = `ex_${sanitizeKey(args[0])}_${sanitizeKey(args[1]).substring(0, 20)}`;")
    lines.append("      return key in AUDIO_MAP ? key : null;")
    lines.append("    }")
    lines.append("    default: return null;")
    lines.append("  }")
    lines.append("}")
    lines.append("")
    lines.append("function sanitizeKey(text: string): string {")
    lines.append("  return text.replace(/[^\\w\\u4e00-\\u9fff]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 60);")
    lines.append("}")
    lines.append("")

    ts_path = os.path.join(os.path.dirname(__file__), '..', 'lib', 'audio-map.ts')
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"   TypeScript 映射: {ts_path}")

if __name__ == '__main__':
    asyncio.run(main())
