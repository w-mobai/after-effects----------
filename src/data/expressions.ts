/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExpressionItem, ExpressionCategory } from '../types';

export const expressionsData: ExpressionItem[] = [
  // --- Basic Category ---
  {
    id: 'exp-time',
    name: '时间自动递增',
    englishName: 'Time Multiplication',
    code: 'time * 120;',
    category: ExpressionCategory.Basic,
    description: '通过将 AE 的时间（秒）乘以一个系数，来实现无缝、持续不断的自增。最常用于时针旋转、背景滚动、机器齿轮运转等。',
    parameters: [
      { name: '系数 (multiplier)', type: 'Number', description: '控制自增速度。例如 360 代表每过一秒，数值增加 360（旋转正好是一周）。', defaultValue: '120' }
    ],
    useCase: '用于旋转、位移或噪波演变等属性，使其无需手动打关键帧即可自动循环运动。',
    simulationType: 'timeSpeed'
  },
  {
    id: 'exp-wiggle',
    name: '抖动/随机振荡',
    englishName: 'Wiggle',
    code: 'wiggle(3, 50);',
    category: ExpressionCategory.Basic,
    description: 'AE 最出名的表达式。在当前值的基础上，生成平滑的自然随机抖动。可完美模拟手持相机晃动、微弱闪烁、震动或自然飘动。',
    parameters: [
      { name: '频率 (freq)', type: 'Number', description: '每秒抖动的次数。数值越大，抖动得越急促。', defaultValue: '3' },
      { name: '振幅 (amp)', type: 'Number', description: '抖动的最大像素或度数范围。数值越大，偏离中心点的距离越远。', defaultValue: '50' },
      { name: '八度/细节 (octaves)', type: 'Number', description: '（可选）噪声的细节层数。默认 1。数值越高，抖动细节越丰富，但也越刺耳。', defaultValue: '1' },
      { name: '振幅倍数 (amp_mult)', type: 'Number', description: '（可选）多层细节的放大倍数，默认 0.5。', defaultValue: '0.5' },
      { name: '时间 (t)', type: 'Number', description: '（可选）评估抖动的时间基准，默认是 time。', defaultValue: 'time' }
    ],
    useCase: '应用在「位置」、「旋转」、「缩放」、「不透明度」等任何数值上，增添生动的随机感。',
    simulationType: 'wiggle'
  },
  {
    id: 'exp-round',
    name: '数值四舍五入取整',
    englishName: 'Math Round',
    code: 'Math.round(value);',
    category: ExpressionCategory.Basic,
    description: '将属性值（或滑块控制器的浮点数值）四舍五入为最接近的整数。可以剔除所有小数点后的杂乱数字。',
    parameters: [
      { name: '当前值 (value)', type: 'Number / Prop', description: '待四舍五入的浮点数值，例如 45.74 将转换为 46。', defaultValue: 'value' }
    ],
    useCase: '制作数字翻滚计数、倒计时牌或百分比加载条动画，防止数值出现尴尬的小数。',
    simulationType: 'round'
  },
  {
    id: 'exp-clamp',
    name: '范围限制器',
    englishName: 'Clamp Range Limit',
    code: 'clamp(value, 100, 800);',
    category: ExpressionCategory.Basic,
    description: '限定某个数值的边界，无论输入属性怎么变，最终结果永远被约束在设定的最小值和最大值之间。',
    parameters: [
      { name: '输入值 (value)', type: 'Number / Array', description: '输入的动态数值（例如关联的父图层坐标）。', defaultValue: 'value' },
      { name: '下限 (min)', type: 'Number / Array', description: '允许输出的最小值。', defaultValue: '100' },
      { name: '上限 (max)', type: 'Number / Array', description: '允许输出的最大值。', defaultValue: '800' }
    ],
    useCase: '限制角色 UI 指针不要划出卡片视区、保证摄像机在规定界限内移动。',
    simulationType: 'clamp'
  },
  {
    id: 'exp-seed-random',
    name: '固定随机种子',
    englishName: 'Seed Random',
    code: 'seedRandom(5, true);\nrandom(50, 150);',
    category: ExpressionCategory.Basic,
    description: '重设随机噪声的种子，并指定该随机是否不随时间流逝而改变（静止随机值）。这样能给每个图层分配一个固定、专属的随机数，而不会产生每帧乱闪。',
    parameters: [
      { name: '种子 (seed)', type: 'Number', description: '随机种子代号。相同的种子产生相同的随机数序列。', defaultValue: '5' },
      { name: '固定标记 (timeless)', type: 'Boolean', description: '若设为 true，则数值只在第一帧随机一次，之后保持静止；若设为 false，则每一帧都随机闪烁。', defaultValue: 'true' }
    ],
    useCase: '用于多图层排版，给每个图层分配固定的随机位置、不透明度、或倾斜角度。',
    simulationType: 'seedRandom'
  },

  // --- Loop Category ---
  {
    id: 'exp-loopout-cycle',
    name: '循环播放：常规首尾循环',
    englishName: 'LoopOut Cycle',
    code: 'loopOut("cycle");',
    category: ExpressionCategory.Loop,
    description: '最经典的循环类型。当播放头超过最后一个关键帧时，它会瞬间跳回到第一个关键帧，如此循环往复，形成周期性不间断运动。',
    parameters: [
      { name: '类型 (type)', type: 'String', description: '循环模式。"cycle" 代表经典的循环往复。', defaultValue: '"cycle"' },
      { name: '关键帧数 (numKeyframes)', type: 'Number', description: '从最后一个帧往前算起参与循环的关键帧数，默认 0 代表全部关键帧参与。', defaultValue: '0' }
    ],
    useCase: '用于循环运转的传送带、奔跑的循环背景动画、心跳等首尾相接的平滑动画。',
    simulationType: 'loopOutCycle'
  },
  {
    id: 'exp-loopout-pingpong',
    name: '循环播放：乒乓往复循环',
    englishName: 'LoopOut Pingpong',
    code: 'loopOut("pingpong");',
    category: ExpressionCategory.Loop,
    description: '像打乒乓球一样来回循环。当播放头到达最后一个关键帧后，它会倒序播放返回到第一个关键帧，然后再正序播放，往复循环。',
    parameters: [
      { name: '类型 (type)', type: 'String', description: '循环模式。"pingpong" 代表来回弹摆往复。', defaultValue: '"pingpong"' },
      { name: '关键帧数 (numKeyframes)', type: 'Number', description: '参与循环的末尾帧数，默认 0 代表全部。', defaultValue: '0' }
    ],
    useCase: '实现呼吸动效、机械活塞来回抽动、钟摆摆动、眼皮眨眼等来回折返的动画。',
    simulationType: 'loopOutPingpong'
  },
  {
    id: 'exp-loopin-cycle',
    name: '循环播放：前置循环',
    englishName: 'LoopIn Cycle',
    code: 'loopIn("cycle");',
    category: ExpressionCategory.Loop,
    description: '与 loopOut 相反，loopIn 负责在第一个关键帧「之前」执行循环。一旦时间走到了第一个关键帧之后，它就会播放预先打好的关键帧并保持。',
    parameters: [
      { name: '类型 (type)', type: 'String', description: '循环模式，可为 "cycle"、"pingpong" 等。', defaultValue: '"cycle"' },
      { name: '关键帧数 (numKeyframes)', type: 'Number', description: '参与循环的起始帧数，默认 0。', defaultValue: '0' }
    ],
    useCase: '用于视频或动画的片头。在第一个打关键帧的时机到来前，图层已经提前处于无限循环等待状态。',
    simulationType: 'loopIn'
  },

  // --- Interpolation Category ---
  {
    id: 'exp-linear',
    name: '线性数值范围映射',
    englishName: 'Linear Interpolation',
    code: 'linear(value, 0, 100, 0, 360);',
    category: ExpressionCategory.Interpolation,
    description: '万能的数据桥梁。将 A 属性的值（输入区间 [min1, max1]）成比例地「映射」到 B 属性的输出区间 [min2, max2]。',
    parameters: [
      { name: '输入变量 (t)', type: 'Number', description: '要监控的输入变量，通常绑定滑块 (Slider) 或另一图层的位置、旋转等。', defaultValue: 'value' },
      { name: '输入下限 (tMin)', type: 'Number', description: '输入变量的最小值基准。', defaultValue: '0' },
      { name: '输入上限 (tMax)', type: 'Number', description: '输入变量的最大值基准。', defaultValue: '100' },
      { name: '输出下限 (value1)', type: 'Number / Array', description: '映射后输出的最小值。', defaultValue: '0' },
      { name: '输出上限 (value2)', type: 'Number / Array', description: '映射后输出的最大值。', defaultValue: '360' }
    ],
    useCase: '极常用！根据声音分贝大小（0~20）线性映射控制灯光的不透明度（20~100%），或用鼠标 X 位置（0~1920）映射图层的旋转（-180~180）。',
    simulationType: 'linear'
  },
  {
    id: 'exp-ease',
    name: '缓动数值范围映射',
    englishName: 'Ease Interpolation',
    code: 'ease(value, 0, 100, 10, 300);',
    category: ExpressionCategory.Interpolation,
    description: '与 linear 相似，但它在数值接近两端端点时采用平滑缓动算法（S型曲线加速减速），运动效果比线性的硬切变换更加自然优雅。',
    parameters: [
      { name: '输入变量 (t)', type: 'Number', description: '要监听的信号源变量。', defaultValue: 'value' },
      { name: '输入下限 (tMin)', type: 'Number', description: '信号源最小值。', defaultValue: '0' },
      { name: '输入上限 (tMax)', type: 'Number', description: '信号源最大值。', defaultValue: '100' },
      { name: '输出下限 (value1)', type: 'Number / Array', description: '缓入端的起步数值。', defaultValue: '10' },
      { name: '输出上限 (value2)', type: 'Number / Array', description: '缓出端的降落数值。', defaultValue: '300' }
    ],
    useCase: '控制 UI 交互元素、卡片划出。当数据变化时，能呈现流畅优雅的渐变过渡。',
    simulationType: 'ease'
  },

  // --- LayerSpace Category ---
  {
    id: 'exp-value-at-time',
    name: '时间偏移延迟跟随',
    englishName: 'Value At Time',
    code: 'delay = 0.1;\nthisComp.layer(index - 1).transform.position.valueAtTime(time - delay);',
    category: ExpressionCategory.LayerSpace,
    description: '获取当前属性（如位置、旋转）在「过去某个指定时刻」的值。通过引用前一个图层在 (当前时间 - delay秒) 处的位置，可以实现排队跟随效果。',
    parameters: [
      { name: '延迟 (delay)', type: 'Number', description: '延迟的秒数。例如 0.1 代表落后前一个图层 0.1 秒的轨迹。', defaultValue: '0.1' }
    ],
    useCase: '制作小蛇排队、MG拖尾动画、文本字符像多米诺骨牌一样逐字跳跃出场。',
    simulationType: 'delay'
  },
  {
    id: 'exp-index',
    name: '图层索引分层定位',
    englishName: 'Layer Index Offset',
    code: '[value[0], value[1] + (index - 1) * 35];',
    category: ExpressionCategory.LayerSpace,
    description: '`index` 代表图层在 AE 时间轴上的排序序号。通过在位置或旋转中引入 `index`，能让大量复制出来的图层自动拉开间距，生成极其整齐的立体感或排版序列。',
    parameters: [
      { name: '乘数因子', type: 'Number', description: '用于拉开图层间距。如 35 代表每向下排一个图层，Y轴偏移量就自动多加 35 像素。', defaultValue: '35' }
    ],
    useCase: '快速克隆 50 个文字图层制作 3D 挤压字效果、快速建立网格、列表卡片的自动向下排布。',
    simulationType: 'index'
  },
  {
    id: 'exp-tocomp',
    name: '图层空间坐标转换',
    englishName: 'ToComp Coordinate Conversion',
    code: 'thisComp.layer("3D Box").toComp([0,0,0]);',
    category: ExpressionCategory.LayerSpace,
    description: '三维和二维空间的联络官。将一个 3D 图层的局部空间坐标（如 3D 盒子的某一个角 [0,0,0]）转换为合成的全局 2D 坐标。这样就能用 2D 图层精准跟随 3D 摄像机和 3D 图层的顶点。',
    parameters: [
      { name: '局部点坐标', type: 'Array', description: '3D 图层自身的坐标基准点。例如 [0,0,0] 代表它的锚点。', defaultValue: '[0,0,0]' }
    ],
    useCase: '让一个 2D 发光光晕（镜头光晕）或者 2D 文字框框，完美死锁贴在 3D 粒子系统或三维跟踪盒子的某个角上。',
    simulationType: 'toComp'
  },
  {
    id: 'exp-parent',
    name: '动态偏移绑定/控制级联',
    englishName: 'Dynamic Linkage',
    code: 'thisComp.layer("Controller").transform.position * 0.5 + [100, 50];',
    category: ExpressionCategory.LayerSpace,
    description: '打破 AE 标准「父子集」必须完全相同的物理约束。通过乘积和加法，可以实现部分跟随、减速跟随、或者朝向跟随，自定复杂的机械联动结构。',
    parameters: [],
    useCase: '搭建 UI 仪表盘上的各种关联刻度针、滑块控制多个齿轮的联动。',
    simulationType: 'parent'
  },
  {
    id: 'exp-lookat',
    name: '朝向目标看向计算',
    englishName: 'LookAt Vector Look',
    code: 'lookAt(transform.position, thisComp.layer("Target").transform.position);',
    category: ExpressionCategory.LayerSpace,
    description: '自动计算从本图层指向另一个「目标图层」所需的旋转角度，使图层始终「凝视」着目标。常用于摄像头、眼珠、指示箭头指向追随目标。',
    parameters: [
      { name: '自我位置', type: 'Array', description: '自身的坐标。', defaultValue: 'transform.position' },
      { name: '目标位置', type: 'Array', description: '被注视的目标图层坐标。', defaultValue: 'thisComp.layer("Target").transform.position' }
    ],
    useCase: '让场景中的数十个向日葵、监控探头、眼珠，无论玩家如何移动，都始终聚焦对准红点。',
    simulationType: 'lookAt'
  },

  // --- Physics Category ---
  {
    id: 'exp-math-sin',
    name: '正弦规律来回摇摆',
    englishName: 'Math Sin Oscillation',
    code: 'Math.sin(time * 5) * 150 + value;',
    category: ExpressionCategory.Physics,
    description: '使用三角函数 Math.sin 根据时间生成标准的正弦波数值，形成规律、平滑、正弦完美的左右摆动、上下悬浮或呼吸闪烁。',
    parameters: [
      { name: '速度 (speed)', type: 'Number', description: '摆动的频率快慢，值越大摆动起伏越密集。', defaultValue: '5' },
      { name: '振幅 (amp)', type: 'Number', description: '摆动的峰值距离，代表波峰波谷的最大偏离量。', defaultValue: '150' }
    ],
    useCase: '实现漂浮在水面的船、热气球自然上下漂浮、呼吸灯、机械手臂的往复摆动。',
    simulationType: 'sinCos'
  },
  {
    id: 'exp-length-distance',
    name: '根据距离控制外观',
    englishName: 'Distance Opacity Factor',
    code: 'p1 = thisComp.layer("Magnet").transform.position;\np2 = transform.position;\nd = length(p1, p2);\nlinear(d, 0, 300, 100, 10);',
    category: ExpressionCategory.Physics,
    description: '计算两个图层之间的绝对物理距离。并配合线性映射，距离越近让对象变得越大、越亮，反之变小、变暗。模拟磁吸和物理感应。',
    parameters: [
      { name: '临界距离', type: 'Number', description: '感应的影响边界距离，这里为 300 像素。', defaultValue: '300' }
    ],
    useCase: '光晕感应，放大镜滑过文字时，让下方的字母因为距离变近而自动变大，划过后恢复原状。',
    simulationType: 'length'
  },
  {
    id: 'exp-bounce',
    name: '弹性阻尼衰减表达式',
    englishName: 'Inertial Bounce',
    code: `amp = 0.05;\nfreq = 3.0;\ndecay = 5.0;\n\nn = 0;\nif (numKeys > 0){\n  n = nearestKey(time).index;\n  if (key(n).time > time) n--;\n}\nif (n == 0){\n  t = 0;\n}else{\n  t = time - key(n).time;\n}\nif (n > 0 && t < 1){\n  v = velocityAtTime(key(n).time - thisComp.frameDuration/10);\n  value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);\n}else{\n  value;\n}`,
    category: ExpressionCategory.Physics,
    description: '大名鼎鼎的物理惯性回弹/Q弹表达式。你只需给图层简单打上 2 个常规的「终点和起点」移动关键帧，表达式在到达终点时会自动通过物理动力学计算，模拟出极为真实的果冻回弹效果，省去了去反复绘制缓动曲线的大量工时。',
    parameters: [
      { name: '回弹振幅 (amp)', type: 'Number', description: '弹性幅度的强烈程度。数值越高，过冲和回弹得越严重。', defaultValue: '0.05' },
      { name: '回弹频率 (freq)', type: 'Number', description: '每秒弹动的次数。数值越高，弹得越密集。', defaultValue: '3.0' },
      { name: '衰减阻尼 (decay)', type: 'Number', description: '衰减速率。数值越大，回弹停下来得越快。', defaultValue: '5.0' }
    ],
    useCase: '网页 UI 菜单滑出停顿、MG 卡牌缩放弹出、文字跳出、球落地的微弱回震。',
    simulationType: 'bounce'
  },
  {
    id: 'exp-velocity',
    name: '速度自适应物理挤压',
    englishName: 'Velocity Squash & Stretch',
    code: 'v = thisComp.layer("Leader").transform.position.velocity;\nspeed = length(v);\n[100, 100] + [speed * 0.15, -speed * 0.08];',
    category: ExpressionCategory.Physics,
    description: '获取图层运动的速度向量。通过速度计算长度，并将其赋给「缩放」属性，使得物体在高速运动时自动变长变窄，在静止时恢复原样。完美契合迪士尼经典动画十二法则之「挤压与拉伸」。',
    parameters: [
      { name: '拉伸敏感度', type: 'Number', description: '系数，控制速度对变形幅度的影响。', defaultValue: '0.15' }
    ],
    useCase: '运动小球、卡通角色。在快速下落或飞射时瞬间拉长，极具灵动和爆发感。',
    simulationType: 'velocity'
  }
];
