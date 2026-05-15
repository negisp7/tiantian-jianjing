import { DailyTip } from '../types';

export const DAILY_TIPS: DailyTip[] = [
  // ── 第 1-30 条（原有）────────────────────────────────────────────────────────
  { id: 0,  category: 'posture',   icon: '🪑', title: '坐姿黄金法则',         content: '保持屏幕与眼睛平齐，避免低头看屏幕。显示器顶部应与眼睛水平线齐平，距离保持50-70厘米。' },
  { id: 1,  category: 'exercise',  icon: '⏰', title: '20-20-20 法则',        content: '每工作20分钟，抬头看20英尺（约6米）外的物体20秒，同时活动颈部，有效预防颈椎疲劳。' },
  { id: 2,  category: 'lifestyle', icon: '😴', title: '睡眠姿势很重要',       content: '侧卧时枕头高度应填满肩颈空隙；仰卧时枕头不宜过高。避免趴睡，这会使颈椎长时间扭转。' },
  { id: 3,  category: 'science',   icon: '🧠', title: '颈椎承受的重量',       content: '头部重约5公斤，但低头15度时颈椎承受约12公斤，低头60度时高达27公斤。减少低头时间至关重要。' },
  { id: 4,  category: 'posture',   icon: '📱', title: '手机使用姿势',         content: '使用手机时尽量将手机举至眼睛水平，而不是低头看。可以用双手托起手机，减少颈部负担。' },
  { id: 5,  category: 'exercise',  icon: '🌊', title: '颈部热敷的好处',       content: '锻炼前用热毛巾热敷颈部5-10分钟，可以促进血液循环，使肌肉更加放松，提高锻炼效果。' },
  { id: 6,  category: 'lifestyle', icon: '💧', title: '保持充足水分',         content: '椎间盘主要由水分构成。保持充足水分摄入（每日1.5-2升）有助于维持椎间盘弹性，减少退变风险。' },
  { id: 7,  category: 'science',   icon: '🔬', title: '颈椎的7块骨头',       content: '颈椎由7块椎骨组成，支撑头部并保护脊髓。规律锻炼可以强化周围肌群，减轻椎骨压力。' },
  { id: 8,  category: 'posture',   icon: '🖥️', title: '电脑桌面设置',         content: '键盘应放置在肘部自然下垂时的高度，避免耸肩。鼠标与键盘保持同一高度，减少不对称姿势。' },
  { id: 9,  category: 'exercise',  icon: '🧘', title: '深呼吸放松法',         content: '颈部锻炼时配合深呼吸效果更好。吸气时保持姿势，呼气时加深拉伸幅度，可以更有效地放松肌肉。' },
  { id: 10, category: 'lifestyle', icon: '🚶', title: '步行的颈椎益处',       content: '规律步行可以改善全身血液循环，包括颈椎区域。每天步行30分钟，有助于减轻颈椎慢性炎症。' },
  { id: 11, category: 'science',   icon: '⚡', title: '颈椎病的早期信号',     content: '颈部僵硬、肩膀酸痛、手臂麻木或头痛可能是颈椎问题的早期信号。出现这些症状应及时就医。' },
  { id: 12, category: 'posture',   icon: '🎒', title: '背包使用技巧',         content: '使用双肩包而非单肩包，均匀分配重量。背包重量不应超过体重的10%，过重会加重颈肩负担。' },
  { id: 13, category: 'exercise',  icon: '🏊', title: '游泳对颈椎的益处',     content: '游泳是颈椎友好型运动，水的浮力可以减轻脊柱压力。推荐仰泳和自由泳，避免蛙泳（需频繁抬头）。' },
  { id: 14, category: 'lifestyle', icon: '🌡️', title: '避免颈部受凉',         content: '颈部受凉会导致肌肉痉挛，加重颈椎不适。空调房内注意颈部保暖，可以使用颈部围巾或披肩。' },
  { id: 15, category: 'science',   icon: '🩺', title: '颈椎曲度的重要性',     content: '正常颈椎有向前的生理曲度（约35-45度）。长期低头会导致曲度变直甚至反弓，增加颈椎退变风险。' },
  { id: 16, category: 'posture',   icon: '🚗', title: '驾车时的颈部保护',     content: '调整头枕高度至头部中心位置，避免颈部悬空。长途驾驶每2小时停车活动颈部5分钟。' },
  { id: 17, category: 'exercise',  icon: '💪', title: '核心肌群的重要性',     content: '强健的核心肌群可以改善整体姿势，间接减轻颈椎负担。将核心训练纳入日常锻炼计划。' },
  { id: 18, category: 'lifestyle', icon: '📖', title: '阅读姿势指南',         content: '阅读时将书本举至眼睛水平，避免长时间低头。使用书架或阅读支架可以有效保持正确姿势。' },
  { id: 19, category: 'science',   icon: '🧬', title: '肌筋膜与颈椎',         content: '颈部肌筋膜紧张会限制颈椎活动度并引起疼痛。规律拉伸和按摩可以改善肌筋膜弹性，恢复正常活动度。' },
  { id: 20, category: 'posture',   icon: '🛋️', title: '沙发坐姿注意事项',     content: '避免长时间蜷缩在沙发上看电视或玩手机。坐沙发时保持背部支撑，颈部自然直立。' },
  { id: 21, category: 'exercise',  icon: '🌅', title: '晨间锻炼的最佳时机',   content: '早晨起床后颈部肌肉相对僵硬，先进行5分钟温和热身再做拉伸。避免早晨进行剧烈的颈部活动。' },
  { id: 22, category: 'lifestyle', icon: '🍎', title: '营养与颈椎健康',       content: '富含钙、镁、维生素D的食物有助于骨骼健康。omega-3脂肪酸（深海鱼、亚麻籽）有助于减轻炎症。' },
  { id: 23, category: 'science',   icon: '🔄', title: '颈椎的活动范围',       content: '健康颈椎的正常活动范围：前屈45°，后伸45°，侧屈45°，旋转60-80°。定期锻炼有助于维持这些范围。' },
  { id: 24, category: 'posture',   icon: '🎧', title: '耳机使用建议',         content: '避免长时间用肩膀夹住手机通话，这会造成颈部严重不对称压力。使用耳机或免提功能代替。' },
  { id: 25, category: 'exercise',  icon: '🤸', title: '瑜伽与颈椎',           content: '猫牛式、婴儿式、鱼式等瑜伽动作对颈椎非常友好。每周2-3次瑜伽练习可显著改善颈椎灵活性。' },
  { id: 26, category: 'lifestyle', icon: '😌', title: '压力与颈椎的关系',     content: '心理压力会导致颈肩肌肉不自觉紧张。冥想、深呼吸等放松技术可以帮助缓解压力性颈椎紧张。' },
  { id: 27, category: 'science',   icon: '🏥', title: '何时需要就医',         content: '出现以下症状应立即就医：手臂或手部持续麻木、颈部疼痛伴发热、外伤后颈痛、或疼痛影响睡眠。' },
  { id: 28, category: 'posture',   icon: '🖊️', title: '书写姿势优化',         content: '书写时保持纸张在身体正前方，避免身体侧倾。桌面高度应使肘部自然弯曲约90度。' },
  { id: 29, category: 'exercise',  icon: '🎯', title: '锻炼的坚持之道',       content: '颈椎锻炼贵在坚持。建议设置每日提醒，将锻炼融入日常习惯（如饭后、工作间隙），每次5-15分钟即可见效。' },

  // ── 第 31-60 条（新增）────────────────────────────────────────────────────────
  { id: 30, category: 'posture',   icon: '🏢', title: '站立办公的好处',       content: '每天站立办公1-2小时可以有效减少颈椎压力。使用可升降桌，交替站立与坐姿，避免长时间保持同一姿势。' },
  { id: 31, category: 'exercise',  icon: '🌬️', title: '呼吸训练改善颈椎',     content: '腹式深呼吸可以激活膈肌，间接放松颈肩肌群。每天进行5分钟腹式呼吸练习，有助于缓解颈部慢性紧张。' },
  { id: 32, category: 'lifestyle', icon: '🌙', title: '枕头选择指南',         content: '枕头高度应使颈椎保持自然曲度：仰卧约8-10cm，侧卧约10-14cm。记忆棉或乳胶枕头能更好地支撑颈部。' },
  { id: 33, category: 'science',   icon: '🦴', title: '椎间盘的功能',         content: '颈椎椎间盘是天然减震器，由纤维环和髓核组成。随年龄增长椎间盘含水量减少，规律运动可延缓退变进程。' },
  { id: 34, category: 'posture',   icon: '🎮', title: '游戏玩家的颈椎保护',   content: '长时间游戏时每30分钟起身活动一次。将显示器调至眼睛水平，使用支架抬高笔记本电脑屏幕。' },
  { id: 35, category: 'exercise',  icon: '🏋️', title: '力量训练注意事项',     content: '进行力量训练时保持颈部中立位，避免颈部过度前伸或后仰。深蹲、硬拉等动作中保持"收下巴"的意识。' },
  { id: 36, category: 'lifestyle', icon: '🧴', title: '颈部按摩的正确方式',   content: '自我按摩颈部时用指腹而非指尖，沿肌肉走向轻柔揉压。避免直接按压颈椎骨骼，重点放松两侧肌肉。' },
  { id: 37, category: 'science',   icon: '🔋', title: '颈椎与自律神经',       content: '颈椎健康与自律神经系统密切相关。颈椎错位可能影响交感神经，导致头痛、失眠、心悸等症状。' },
  { id: 38, category: 'posture',   icon: '✈️', title: '乘坐交通工具时的姿势', content: '乘坐飞机或长途车时使用U形颈枕支撑颈部，避免头部侧倒入睡。靠窗座位可以让头部倚靠，减少颈部疲劳。' },
  { id: 39, category: 'exercise',  icon: '🎵', title: '配乐锻炼效果更好',     content: '研究显示，配合节奏感强的音乐进行颈椎锻炼，可以提高动作的节律性和坚持时间，同时降低疼痛感知。' },
  { id: 40, category: 'lifestyle', icon: '🌿', title: '中医与颈椎保健',       content: '中医认为颈椎问题与"气血不通"有关。艾灸大椎穴、风池穴可以温经散寒；推拿按摩有助于疏通经络。' },
  { id: 41, category: 'science',   icon: '📊', title: '颈椎病的患病率',       content: '研究显示，全球约50%的成年人一生中会经历颈椎疼痛，其中30%会发展为慢性问题。预防远比治疗重要。' },
  { id: 42, category: 'posture',   icon: '🎓', title: '学生的颈椎保护',       content: '学生长时间低头学习是颈椎损伤的高危因素。建议使用书立抬高书本，每学习45分钟休息10分钟并活动颈部。' },
  { id: 43, category: 'exercise',  icon: '🤾', title: '颈部等长训练的价值',   content: '等长训练（肌肉收缩但不运动）是颈椎康复的重要方法。每天进行颈部四方向等长训练，可显著提高颈椎稳定性。' },
  { id: 44, category: 'lifestyle', icon: '🏠', title: '家庭工作环境优化',     content: '居家办公时避免在床上或沙发上长时间工作。设置专用工作区，保持桌椅高度合适，使用外接键盘和鼠标。' },
  { id: 45, category: 'science',   icon: '🧪', title: '炎症与颈椎疼痛',       content: '颈椎疼痛往往与局部炎症有关。规律运动可以降低全身炎症水平，同时促进内啡肽分泌，自然缓解疼痛。' },
  { id: 46, category: 'posture',   icon: '👶', title: '儿童颈椎保护',         content: '儿童颈椎正在发育，更需要保护。限制每天使用电子设备的时间，鼓励户外活动，培养良好的坐姿习惯。' },
  { id: 47, category: 'exercise',  icon: '🌊', title: '水中运动的优势',       content: '水中运动（水疗）对颈椎非常友好，浮力减轻关节压力，水的阻力提供温和的肌肉训练，适合颈椎不适者。' },
  { id: 48, category: 'lifestyle', icon: '🍵', title: '抗炎饮食建议',         content: '姜黄、生姜、绿茶中含有天然抗炎成分。减少加工食品和糖分摄入，增加蔬菜水果比例，有助于降低颈椎炎症。' },
  { id: 49, category: 'science',   icon: '🧲', title: '磁共振与颈椎检查',     content: 'MRI是诊断颈椎问题的金标准，可清晰显示椎间盘、神经根和脊髓状况。出现持续症状时应及时进行影像学检查。' },
  { id: 50, category: 'posture',   icon: '🪞', title: '镜前姿势自检',         content: '每天在镜子前检查自己的站姿：耳垂应与肩峰垂直对齐，双肩等高，头部不前倾。发现问题及时纠正。' },
  { id: 51, category: 'exercise',  icon: '🧗', title: '攀岩对颈椎的益处',     content: '室内攀岩可以全面强化颈肩背部肌群，改善姿势控制能力。初学者应在专业指导下进行，注意保护颈部。' },
  { id: 52, category: 'lifestyle', icon: '🛁', title: '热水浴放松颈部',       content: '温热水浴（38-40°C）可以有效放松颈肩肌肉，促进血液循环。在浴缸中轻柔活动颈部，效果更佳。' },
  { id: 53, category: 'science',   icon: '⚙️', title: '颈椎的生物力学',       content: '颈椎承受头部重量的同时还需保持灵活性。其独特的钩椎关节（Luschka关节）是颈椎特有的，提供额外稳定性。' },
  { id: 54, category: 'posture',   icon: '🎯', title: '下巴回收练习',         content: '"收下巴"练习是改善头部前倾的最有效方法：保持眼睛水平，将下巴水平向后移动，感受颈后拉伸，每天20次。' },
  { id: 55, category: 'exercise',  icon: '🏃', title: '跑步与颈椎健康',       content: '跑步时保持头部中立，目视前方，避免低头或仰头。手臂自然摆动，肩膀放松下沉，减少颈部代偿性紧张。' },
  { id: 56, category: 'lifestyle', icon: '🌞', title: '晒太阳补充维生素D',    content: '维生素D对骨骼健康至关重要，缺乏会加速颈椎退变。每天在阳光下活动15-20分钟，有助于自然合成维生素D。' },
  { id: 57, category: 'science',   icon: '🔭', title: '颈椎与头痛的关系',     content: '颈源性头痛（由颈椎问题引起）约占慢性头痛的15-20%。改善颈椎功能往往可以显著缓解此类头痛。' },
  { id: 58, category: 'posture',   icon: '🎪', title: '站立时的颈椎保护',     content: '长时间站立时，将重心均匀分布在双脚，避免单腿承重。使用防疲劳垫，每30分钟变换站立姿势。' },
  { id: 59, category: 'exercise',  icon: '🌈', title: '多样化锻炼的重要性',   content: '单一的锻炼方式容易产生适应性，效果递减。将颈椎拉伸、力量训练、有氧运动和瑜伽结合，全面改善颈椎健康。' },
];

export const getTodayTip = (): DailyTip => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
};

export const getTipById = (id: number): DailyTip | undefined =>
  DAILY_TIPS.find((t) => t.id === id);
