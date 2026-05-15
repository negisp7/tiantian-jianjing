import { DailyTip } from '../types';

export const DAILY_TIPS: DailyTip[] = [
  { id: 0,  category: 'posture',   icon: '🪑', title: '坐姿黄金法则',       content: '保持屏幕与眼睛平齐，避免低头看屏幕。显示器顶部应与眼睛水平线齐平，距离保持50-70厘米。' },
  { id: 1,  category: 'exercise',  icon: '⏰', title: '20-20-20 法则',      content: '每工作20分钟，抬头看20英尺（约6米）外的物体20秒，同时活动颈部，有效预防颈椎疲劳。' },
  { id: 2,  category: 'lifestyle', icon: '😴', title: '睡眠姿势很重要',     content: '侧卧时枕头高度应填满肩颈空隙；仰卧时枕头不宜过高。避免趴睡，这会使颈椎长时间扭转。' },
  { id: 3,  category: 'science',   icon: '🧠', title: '颈椎承受的重量',     content: '头部重约5公斤，但低头15度时颈椎承受约12公斤，低头60度时高达27公斤。减少低头时间至关重要。' },
  { id: 4,  category: 'posture',   icon: '📱', title: '手机使用姿势',       content: '使用手机时尽量将手机举至眼睛水平，而不是低头看。可以用双手托起手机，减少颈部负担。' },
  { id: 5,  category: 'exercise',  icon: '🌊', title: '颈部热敷的好处',     content: '锻炼前用热毛巾热敷颈部5-10分钟，可以促进血液循环，使肌肉更加放松，提高锻炼效果。' },
  { id: 6,  category: 'lifestyle', icon: '💧', title: '保持充足水分',       content: '椎间盘主要由水分构成。保持充足水分摄入（每日1.5-2升）有助于维持椎间盘弹性，减少退变风险。' },
  { id: 7,  category: 'science',   icon: '🔬', title: '颈椎的7块骨头',     content: '颈椎由7块椎骨组成，支撑头部并保护脊髓。规律锻炼可以强化周围肌群，减轻椎骨压力。' },
  { id: 8,  category: 'posture',   icon: '🖥️', title: '电脑桌面设置',       content: '键盘应放置在肘部自然下垂时的高度，避免耸肩。鼠标与键盘保持同一高度，减少不对称姿势。' },
  { id: 9,  category: 'exercise',  icon: '🧘', title: '深呼吸放松法',       content: '颈部锻炼时配合深呼吸效果更好。吸气时保持姿势，呼气时加深拉伸幅度，可以更有效地放松肌肉。' },
  { id: 10, category: 'lifestyle', icon: '🚶', title: '步行的颈椎益处',     content: '规律步行可以改善全身血液循环，包括颈椎区域。每天步行30分钟，有助于减轻颈椎慢性炎症。' },
  { id: 11, category: 'science',   icon: '⚡', title: '颈椎病的早期信号',   content: '颈部僵硬、肩膀酸痛、手臂麻木或头痛可能是颈椎问题的早期信号。出现这些症状应及时就医。' },
  { id: 12, category: 'posture',   icon: '🎒', title: '背包使用技巧',       content: '使用双肩包而非单肩包，均匀分配重量。背包重量不应超过体重的10%，过重会加重颈肩负担。' },
  { id: 13, category: 'exercise',  icon: '🏊', title: '游泳对颈椎的益处',   content: '游泳是颈椎友好型运动，水的浮力可以减轻脊柱压力。推荐仰泳和自由泳，避免蛙泳（需频繁抬头）。' },
  { id: 14, category: 'lifestyle', icon: '🌡️', title: '避免颈部受凉',       content: '颈部受凉会导致肌肉痉挛，加重颈椎不适。空调房内注意颈部保暖，可以使用颈部围巾或披肩。' },
  { id: 15, category: 'science',   icon: '🩺', title: '颈椎曲度的重要性',   content: '正常颈椎有向前的生理曲度（约35-45度）。长期低头会导致曲度变直甚至反弓，增加颈椎退变风险。' },
  { id: 16, category: 'posture',   icon: '🚗', title: '驾车时的颈部保护',   content: '调整头枕高度至头部中心位置，避免颈部悬空。长途驾驶每2小时停车活动颈部5分钟。' },
  { id: 17, category: 'exercise',  icon: '💪', title: '核心肌群的重要性',   content: '强健的核心肌群可以改善整体姿势，间接减轻颈椎负担。将核心训练纳入日常锻炼计划。' },
  { id: 18, category: 'lifestyle', icon: '📖', title: '阅读姿势指南',       content: '阅读时将书本举至眼睛水平，避免长时间低头。使用书架或阅读支架可以有效保持正确姿势。' },
  { id: 19, category: 'science',   icon: '🧬', title: '肌筋膜与颈椎',       content: '颈部肌筋膜紧张会限制颈椎活动度并引起疼痛。规律拉伸和按摩可以改善肌筋膜弹性，恢复正常活动度。' },
  { id: 20, category: 'posture',   icon: '🛋️', title: '沙发坐姿注意事项',   content: '避免长时间蜷缩在沙发上看电视或玩手机。坐沙发时保持背部支撑，颈部自然直立。' },
  { id: 21, category: 'exercise',  icon: '🌅', title: '晨间锻炼的最佳时机', content: '早晨起床后颈部肌肉相对僵硬，先进行5分钟温和热身再做拉伸。避免早晨进行剧烈的颈部活动。' },
  { id: 22, category: 'lifestyle', icon: '🍎', title: '营养与颈椎健康',     content: '富含钙、镁、维生素D的食物有助于骨骼健康。omega-3脂肪酸（深海鱼、亚麻籽）有助于减轻炎症。' },
  { id: 23, category: 'science',   icon: '🔄', title: '颈椎的活动范围',     content: '健康颈椎的正常活动范围：前屈45°，后伸45°，侧屈45°，旋转60-80°。定期锻炼有助于维持这些范围。' },
  { id: 24, category: 'posture',   icon: '🎧', title: '耳机使用建议',       content: '避免长时间用肩膀夹住手机通话，这会造成颈部严重不对称压力。使用耳机或免提功能代替。' },
  { id: 25, category: 'exercise',  icon: '🤸', title: '瑜伽与颈椎',         content: '猫牛式、婴儿式、鱼式等瑜伽动作对颈椎非常友好。每周2-3次瑜伽练习可显著改善颈椎灵活性。' },
  { id: 26, category: 'lifestyle', icon: '😌', title: '压力与颈椎的关系',   content: '心理压力会导致颈肩肌肉不自觉紧张。冥想、深呼吸等放松技术可以帮助缓解压力性颈椎紧张。' },
  { id: 27, category: 'science',   icon: '🏥', title: '何时需要就医',       content: '出现以下症状应立即就医：手臂或手部持续麻木、颈部疼痛伴发热、外伤后颈痛、或疼痛影响睡眠。' },
  { id: 28, category: 'posture',   icon: '🖊️', title: '书写姿势优化',       content: '书写时保持纸张在身体正前方，避免身体侧倾。桌面高度应使肘部自然弯曲约90度。' },
  { id: 29, category: 'exercise',  icon: '🎯', title: '锻炼的坚持之道',     content: '颈椎锻炼贵在坚持。建议设置每日提醒，将锻炼融入日常习惯（如饭后、工作间隙），每次5-15分钟即可见效。' },
];

export const getTodayTip = (): DailyTip => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
};

export const getTipById = (id: number): DailyTip | undefined =>
  DAILY_TIPS.find((t) => t.id === id);
