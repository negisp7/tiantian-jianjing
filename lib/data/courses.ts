import { Course } from '../types';

export const COURSES: Course[] = [
  // ─── 轻度课程 ────────────────────────────────────────────────────────────────
  {
    id: 'light-morning',
    title: '晨间颈部唤醒',
    description: '温和拉伸，唤醒沉睡的颈部肌群，适合每日早晨开始前的准备活动。',
    difficulty: 'light',
    durationMinutes: 5,
    tags: ['早晨', '放松', '入门'],
    exercises: [
      { id: 'e1', name: '颈部前屈拉伸', description: '缓慢低头，感受颈后肌群拉伸，保持呼吸均匀。', durationSeconds: 20, motionType: 'forward' },
      { id: 'e2', name: '颈部后伸拉伸', description: '轻柔仰头，感受颈前肌群拉伸，不要过度后仰。', durationSeconds: 20, motionType: 'backward' },
      { id: 'e3', name: '左侧屈拉伸', description: '头部向左侧倾斜，右肩保持放松下沉。', durationSeconds: 20, motionType: 'left-lat' },
      { id: 'e4', name: '右侧屈拉伸', description: '头部向右侧倾斜，左肩保持放松下沉。', durationSeconds: 20, motionType: 'right-lat' },
      { id: 'e5', name: '肩部上提放松', description: '双肩同时上提至耳旁，保持3秒后缓慢放下。', durationSeconds: 30, motionType: 'shoulder' },
      { id: 'e6', name: '颈部缓慢环绕', description: '以顺时针方向缓慢转动头部，动作要轻柔流畅。', durationSeconds: 30, motionType: 'rotate-cw' },
    ],
  },
  {
    id: 'light-office',
    title: '办公室快速放松',
    description: '专为久坐办公设计，5分钟快速缓解颈肩紧张，随时随地可做。',
    difficulty: 'light',
    durationMinutes: 5,
    tags: ['办公室', '快速', '放松'],
    exercises: [
      { id: 'e7', name: '颈部左旋', description: '头部缓慢向左转动，感受右侧颈部拉伸。', durationSeconds: 20, motionType: 'left' },
      { id: 'e8', name: '颈部右旋', description: '头部缓慢向右转动，感受左侧颈部拉伸。', durationSeconds: 20, motionType: 'right' },
      { id: 'e9', name: '双肩后展', description: '双肩向后展开，挺胸，感受胸前肌群拉伸。', durationSeconds: 25, motionType: 'shoulder' },
      { id: 'e10', name: '颈部等长静力', description: '双手交叉置于额头，头部向前用力，手部给予阻力，保持静止。', durationSeconds: 15, motionType: 'static' },
      { id: 'e11', name: '斜方肌拉伸', description: '右手轻压头部左侧，感受斜方肌拉伸，保持均匀呼吸。', durationSeconds: 25, motionType: 'trapezius' },
    ],
  },

  // ─── 中度课程 ────────────────────────────────────────────────────────────────
  {
    id: 'moderate-comprehensive',
    title: '颈椎综合康复',
    description: '结合拉伸与肌力训练，全面改善颈椎稳定性，适合长期伏案工作者。',
    difficulty: 'moderate',
    durationMinutes: 12,
    tags: ['综合', '强化', '康复'],
    exercises: [
      { id: 'm1', name: '颈部前屈拉伸', description: '缓慢低头至最大幅度，保持10秒，感受颈后肌群充分拉伸。', durationSeconds: 30, motionType: 'forward' },
      { id: 'm2', name: '颈部后伸拉伸', description: '轻柔仰头，保持10秒，注意不要引起眩晕。', durationSeconds: 30, motionType: 'backward' },
      { id: 'm3', name: '左侧屈深度拉伸', description: '头部向左侧倾斜至最大幅度，右手自然下垂，保持15秒。', durationSeconds: 35, motionType: 'left-lat' },
      { id: 'm4', name: '右侧屈深度拉伸', description: '头部向右侧倾斜至最大幅度，左手自然下垂，保持15秒。', durationSeconds: 35, motionType: 'right-lat' },
      { id: 'm5', name: '颈部左旋强化', description: '头部向左旋转至最大幅度，保持10秒，重复3次。', durationSeconds: 40, motionType: 'left' },
      { id: 'm6', name: '颈部右旋强化', description: '头部向右旋转至最大幅度，保持10秒，重复3次。', durationSeconds: 40, motionType: 'right' },
      { id: 'm7', name: '颈部前向等长抗阻', description: '双手交叉置于额头，头部向前用力，手部给予阻力，保持6秒，重复5次。', durationSeconds: 45, motionType: 'static' },
      { id: 'm8', name: '颈部后向等长抗阻', description: '双手置于头后，头部向后用力，手部给予阻力，保持6秒，重复5次。', durationSeconds: 45, motionType: 'static' },
      { id: 'm9', name: '肩胛骨后缩', description: '双肩向后夹紧，感受肩胛骨靠拢，保持5秒后放松，重复10次。', durationSeconds: 50, motionType: 'shoulder' },
      { id: 'm10', name: '颈部缓慢环绕', description: '顺时针缓慢环绕3圈，再逆时针3圈，动作要轻柔流畅。', durationSeconds: 60, motionType: 'rotate-cw' },
    ],
  },
  {
    id: 'moderate-evening',
    title: '傍晚深度放松',
    description: '工作结束后的深度放松课程，缓解一天积累的颈肩紧张，改善睡眠质量。',
    difficulty: 'moderate',
    durationMinutes: 10,
    tags: ['傍晚', '深度放松', '睡眠'],
    exercises: [
      { id: 'me1', name: '颈部热身环绕', description: '小幅度缓慢环绕，逐渐增大活动范围，热身颈部关节。', durationSeconds: 40, motionType: 'rotate-cw' },
      { id: 'me2', name: '胸锁乳突肌拉伸左', description: '头部向右旋转并轻微后仰，感受左侧颈前肌群拉伸，保持20秒。', durationSeconds: 30, motionType: 'right' },
      { id: 'me3', name: '胸锁乳突肌拉伸右', description: '头部向左旋转并轻微后仰，感受右侧颈前肌群拉伸，保持20秒。', durationSeconds: 30, motionType: 'left' },
      { id: 'me4', name: '斜方肌深度拉伸', description: '右手轻压头部左侧，左手向下伸展，感受斜方肌充分拉伸，保持25秒。', durationSeconds: 35, motionType: 'trapezius' },
      { id: 'me5', name: '颈部前屈深度拉伸', description: '双手交叉置于头后，轻轻向下引导，感受颈后深层肌群拉伸。', durationSeconds: 40, motionType: 'forward' },
      { id: 'me6', name: '肩部放松摇摆', description: '双肩放松，做前后摇摆动作，配合深呼吸，彻底放松肩部肌群。', durationSeconds: 40, motionType: 'shoulder' },
      { id: 'me7', name: '颈部逆时针环绕', description: '逆时针缓慢环绕，感受颈部各方向充分活动。', durationSeconds: 45, motionType: 'rotate-ccw' },
    ],
  },

  // ─── 重度课程 ────────────────────────────────────────────────────────────────
  {
    id: 'intense-therapy',
    title: '颈椎理疗强化',
    description: '针对严重颈椎不适的专业理疗课程，结合深度拉伸与神经松动技术。',
    difficulty: 'intense',
    durationMinutes: 18,
    tags: ['理疗', '强化', '专业'],
    exercises: [
      { id: 'i1', name: '颈部热身活动', description: '小幅度缓慢活动颈部各方向，充分热身，避免突然大幅度动作。', durationSeconds: 60, motionType: 'rotate-cw' },
      { id: 'i2', name: '颈部前屈深度拉伸', description: '低头至最大幅度，双手轻压头后，保持20秒，重复3次。', durationSeconds: 75, motionType: 'forward' },
      { id: 'i3', name: '颈部后伸深度拉伸', description: '仰头至舒适最大幅度，保持15秒，注意不引起眩晕，重复3次。', durationSeconds: 60, motionType: 'backward' },
      { id: 'i4', name: '侧屈深度拉伸（左）', description: '头部向左侧倾斜，右手向下伸展，保持20秒，重复3次。', durationSeconds: 70, motionType: 'left-lat' },
      { id: 'i5', name: '侧屈深度拉伸（右）', description: '头部向右侧倾斜，左手向下伸展，保持20秒，重复3次。', durationSeconds: 70, motionType: 'right-lat' },
      { id: 'i6', name: '颈部旋转深度拉伸（左）', description: '头部向左旋转至最大幅度，保持15秒，重复4次。', durationSeconds: 70, motionType: 'left' },
      { id: 'i7', name: '颈部旋转深度拉伸（右）', description: '头部向右旋转至最大幅度，保持15秒，重复4次。', durationSeconds: 70, motionType: 'right' },
      { id: 'i8', name: '颈部多方向等长抗阻', description: '依次对前、后、左、右四个方向进行等长抗阻训练，每方向保持8秒。', durationSeconds: 80, motionType: 'static' },
      { id: 'i9', name: '斜方肌深度拉伸（双侧）', description: '左右各深度拉伸斜方肌，每侧保持30秒，配合深呼吸。', durationSeconds: 75, motionType: 'trapezius' },
      { id: 'i10', name: '颈部神经松动（左）', description: '头部向右侧倾斜，左臂向下伸展并缓慢弯曲手腕，感受神经轻微拉伸。', durationSeconds: 50, motionType: 'right-lat' },
      { id: 'i11', name: '颈部神经松动（右）', description: '头部向左侧倾斜，右臂向下伸展并缓慢弯曲手腕，感受神经轻微拉伸。', durationSeconds: 50, motionType: 'left-lat' },
      { id: 'i12', name: '颈部全方向缓慢环绕', description: '以最慢速度顺时针环绕3圈，再逆时针3圈，感受每个方向的活动度。', durationSeconds: 90, motionType: 'rotate-cw' },
    ],
  },
  {
    id: 'intense-recovery',
    title: '颈椎深度康复',
    description: '针对颈椎病康复期的系统训练，改善颈椎稳定性与肌肉耐力。',
    difficulty: 'intense',
    durationMinutes: 15,
    tags: ['康复', '稳定性', '肌力'],
    exercises: [
      { id: 'ir1', name: '颈部深层稳定肌激活', description: '轻微收下颌（颈部回缩），激活深层颈屈肌，保持10秒，重复10次。', durationSeconds: 120, motionType: 'static' },
      { id: 'ir2', name: '颈部前屈等长训练', description: '头部向前用力抵住双手，保持8秒，重复8次，训练颈屈肌耐力。', durationSeconds: 90, motionType: 'forward' },
      { id: 'ir3', name: '颈部后伸等长训练', description: '头部向后用力抵住双手，保持8秒，重复8次，训练颈伸肌耐力。', durationSeconds: 90, motionType: 'backward' },
      { id: 'ir4', name: '侧向等长训练（双侧）', description: '头部向左右各用力抵住单手，每侧保持8秒，重复6次，训练侧屈肌耐力。', durationSeconds: 100, motionType: 'static' },
      { id: 'ir5', name: '肩胛骨稳定训练', description: '双肩后缩下沉，保持10秒，重复12次，改善肩胛骨稳定性。', durationSeconds: 120, motionType: 'shoulder' },
      { id: 'ir6', name: '颈部全范围拉伸', description: '依次进行前屈、后伸、左右侧屈、左右旋转的全范围拉伸，每方向20秒。', durationSeconds: 150, motionType: 'rotate-cw' },
    ],
  },
];

export const getCoursesByDifficulty = (difficulty: Course['difficulty']) =>
  COURSES.filter((c) => c.difficulty === difficulty);

export const getCourseById = (id: string) =>
  COURSES.find((c) => c.id === id);
