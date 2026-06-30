/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExpressionFunction, FunctionCategory } from '../types';

export const functionsData: ExpressionFunction[] = [
  // --- Global ---
  {
    id: 'func-time',
    name: 'time',
    signature: 'time',
    category: FunctionCategory.Global,
    description: '返回当前时间轴指针所在的当前时间（以秒为单位）。是一个只读的浮点数，随着播放自动递增。',
    returnValue: 'Number (单位：秒)',
    example: 'rotation = time * 360; // 图层每秒顺时针旋转一周(360度)',
    tips: '这是制作各种时间驱动型动画的核心参数。如果需要转为帧数，请结合 `timeToFrames()` 使用。'
  },
  {
    id: 'func-index',
    name: 'index',
    signature: 'index',
    category: FunctionCategory.Global,
    description: '返回当前图层在时间轴（Timeline）面板上的堆叠索引序号。最顶部的图层 index 为 1，第二个为 2，以此类推。',
    returnValue: 'Number (只读整数)',
    example: 'position = [value[0], value[1] + (index - 1) * 50]; // 让复制出来的图层自动以 50 像素的间隔向下排开',
    tips: '配合 `Ctrl+D` 复制图层时，利用 `index` 可以快速实现阶梯排列、立体层叠等极其震撼的矩阵式排版。'
  },
  {
    id: 'func-value',
    name: 'value',
    signature: 'value',
    category: FunctionCategory.Global,
    description: '获取该属性在当前时间点「被表达式处理前」的原始数值。即你在时间轴上手工拉动的数值或打关键帧产生的值。',
    returnValue: 'Number 或 Array (对应属性的数据类型)',
    example: 'value + 100; // 在当前帧打的手动值基础上，强制加 100 像素',
    tips: '如果你既想手动拉位置、打关键帧，又想在关键帧的基础叠加表达式微调（如叠加 wiggle），必须使用 `value`。'
  },
  {
    id: 'func-thiscomp',
    name: 'thisComp',
    signature: 'thisComp',
    category: FunctionCategory.Global,
    description: '获取当前表达式所在的合成（Composition）对象。通过它可以访问合成的宽度、高度、帧率和持续时间等。',
    returnValue: 'Comp 对象',
    example: 'width = thisComp.width; // 获取合成的宽度\nheight = thisComp.height; // 获取合成的高度\n[width/2, height/2]; // 始终定位于合成的正中心',
    tips: '在做自适应版面、弹性UI组件时，用 `thisComp.width` 和 `height` 相比硬编码固定分辨率（如1920, 1080）更加安全，哪怕后期改合成尺寸也不会错位。'
  },
  {
    id: 'func-thislayer',
    name: 'thisLayer',
    signature: 'thisLayer',
    category: FunctionCategory.Global,
    description: '代表表达式所在的当前图层对象本身。是引用当前图层其它非自身属性的快捷途径。',
    returnValue: 'Layer 对象',
    example: 'name = thisLayer.name; // 获取该图层的名字',
    tips: '在跨图层关联时比较常用。例如你想做一个属性面板，可通过 `thisLayer` 结合 JavaScript 字符串处理来让某些属性动态变化。'
  },

  // --- Math ---
  {
    id: 'func-length',
    name: 'length()',
    signature: 'length(vec1, vec2)',
    category: FunctionCategory.Math,
    description: '计算两个坐标点（向量）之间的欧氏距离，或者计算单个向量本身的几何长度。',
    returnValue: 'Number (正数，像素值)',
    example: 'p1 = thisComp.layer("Point A").transform.position;\np2 = transform.position;\ndistance = length(p1, p2); // 算出两点间像素距离',
    tips: '配合 `linear` 或是 `ease` 使用，可实现「当鼠标越靠近它、它就放大/变亮」等带有距离感应和磁力吸附效果的交互设计。'
  },
  {
    id: 'func-clamp',
    name: 'clamp()',
    signature: 'clamp(value, limit1, limit2)',
    category: FunctionCategory.Math,
    description: '数值钳制约束。强制限制输入的 value 只能在 limit1 (下限) 和 limit2 (上限) 之间。若超出边界则输出两端的边界值。',
    returnValue: 'Number 或 Array',
    example: 'input = effect("Slider Control")("Slider");\nclamp(input, 0, 100); // 哪怕滑块被拉到 500，输出也死死卡在 100',
    tips: '常用于物理联动、拖拽面板、或者防止某些关键属性（如缩放为负数，不透明度大于 100%）发生越界报错。'
  },
  {
    id: 'func-normalize',
    name: 'normalize()',
    signature: 'normalize(vec)',
    category: FunctionCategory.Math,
    description: '将一个多维向量（例如 [x, y] 或 [x, y, z]）转化为方向完全相同，但几何长度精确为 1.0 的单位向量。',
    returnValue: 'Array (一维长度为1的向量)',
    example: 'dir = sub(transform.position, [960, 540]);\nunitDir = normalize(dir); // 提取朝向中心点的方向矢量',
    tips: '在自定义力学模型、3D 空间轨道物理模拟、或者沿方向做定距位移时，它是数学计算中不可或缺的纯方向向量。'
  },
  {
    id: 'func-add',
    name: 'add()',
    signature: 'add(vec1, vec2)',
    category: FunctionCategory.Math,
    description: '将两个相同维度的数组或向量进行对应项相加。常用于二维或三维位置坐标的整体累加偏移。',
    returnValue: 'Array (或对应向量)',
    example: 'offset = [100, 200];\nadd(value, offset); // 等同于 value + [100, 200]',
    tips: '在旧版 AE 中，数组是不能像 `[x,y] + [a,b]` 这样直接写加号相加的，所以提供了 `add()`。新版 AE 已支持直接用加号，但使用 `add()` 函数在严谨的数学库中更加安全。'
  },

  // --- Random ---
  {
    id: 'func-random',
    name: 'random()',
    signature: 'random(min, max)',
    category: FunctionCategory.Random,
    description: '产生指定范围内的伪随机数。如果只有一个参数，则产生 0 到该参数之间的随机数；若两个参数，则在两者之间。',
    returnValue: 'Number',
    example: 'random(10, 50); // 每帧产生 10 到 50 之间的随机数',
    tips: '如果不做特殊处理，`random` 会在「每一帧」都刷新产生不同的值，会造成疯狂闪烁。如果想让其静止下来，需要在之前加 `seedRandom(seed, true)`。'
  },
  {
    id: 'func-seedrandom',
    name: 'seedRandom()',
    signature: 'seedRandom(seed, timeless = false)',
    category: FunctionCategory.Random,
    description: '初始化随机数生成器的种子（seed）。可以通过设 timeless 参数，决定产生的随机数是只生成一次（静止）还是随时间帧率每帧刷新。',
    returnValue: 'Void (无返回值，作用于后续 random 函数)',
    example: 'seedRandom(index, true);\nopacity = random(20, 100); // 每一个图层根据自己的排位获得专属的固定亮度值，不随时间闪烁',
    tips: '它是写随机效果最常用的保驾护航函数。没有它，所有的 random、wiggle 都会闪得让人头疼，设置 timeless 为 true 即可将其固化。'
  },
  {
    id: 'func-gaussrandom',
    name: 'gaussRandom()',
    signature: 'gaussRandom(min, max)',
    category: FunctionCategory.Random,
    description: '产生符合高斯分布（正态分布，即钟形曲线）的随机数。这意味着产生的值绝大多数都落在中间值附近，两极端的极值极难出现。相比 random 的平摊分布，高斯的随机结果要自然和集中得多。',
    returnValue: 'Number',
    example: 'gaussRandom(0, 100); // 产生的数约有 90% 集中在 40~60 之间',
    tips: '如果需要模拟下雨落下的位置、星空的微尘分布等极其逼真的自然物理随机，高斯分布是高级粒子感拟真的必选方法。'
  },

  // --- Interpolation ---
  {
    id: 'func-linear',
    name: 'linear()',
    signature: 'linear(t, tMin, tMax, value1, value2)',
    category: FunctionCategory.Interpolation,
    description: '线性范围映射与插值。将输入参数 t 的范围 [tMin, tMax] 成比例缩放，并映射给输出值 [value1, value2] 的范围。若 t 小于 tMin，输出 value1；若大于 tMax，输出 value2。',
    returnValue: 'Number 或 Array',
    example: 'vol = thisComp.layer("Audio").effect("Both Channels")("Slider");\nlinear(vol, 2, 15, 100, 150); // 音量在 2-15 间时，缩放属性等比在 100%-150% 间变化',
    tips: '这是整个 AE 里面使用率仅次于 wiggle 的万能映射利器！能将各种控制信号（声音分贝、滑块数值、旋转度数）完美搭桥给颜色、位移、不透明度等其它截然不同单位的属性。'
  },
  {
    id: 'func-ease',
    name: 'ease()',
    signature: 'ease(t, tMin, tMax, value1, value2)',
    category: FunctionCategory.Interpolation,
    description: '缓动插值。功能与 `linear()` 类似，但是采用了平滑的 Hermite 插值算法（类似 S 曲线），在两端（起步和停下）会渐入渐出，其运动比 linear 的硬直加速、硬直减速要优美自然得多。',
    returnValue: 'Number 或 Array',
    example: 'ease(time, 1, 3, 0, 360); // 在第 1 秒到第 3 秒之间，图层平稳缓加速、缓减速地转动 360 度',
    tips: '通常在制作 UI 动画、图层位移、过渡动画时，极力推荐用 `ease` 替代 `linear` 以保证画面呼吸感。'
  },
  {
    id: 'func-easein',
    name: 'easeIn()',
    signature: 'easeIn(t, tMin, tMax, value1, value2)',
    category: FunctionCategory.Interpolation,
    description: '单向缓入插值。在起点处非常缓慢地起跑加速（缓动），但在终点（tMax）则是以线性最大速度直挺挺地撞向终点值。',
    returnValue: 'Number 或 Array',
    example: 'easeIn(time, 0, 2, [0,0], [960,540]);',
    tips: '常用于模拟受到恒定引力加速下落的石块，起步缓，终点极快撞击。'
  },
  {
    id: 'func-easeout',
    name: 'easeOut()',
    signature: 'easeOut(t, tMin, tMax, value1, value2)',
    category: FunctionCategory.Interpolation,
    description: '单向缓出插值。起步时动作非常迅速凌厉，但在接近终点（tMax）时，则极具温柔地滑行并缓慢减速停下。',
    returnValue: 'Number 或 Array',
    example: 'easeOut(time, 0, 1, 0, 100);',
    tips: '用于做极其轻快的卡片抽屉拉出、镜头快速推近停稳等动效，这种起跑快、收步慢的质感让人感觉极度利索。'
  },

  // --- SpaceTransform ---
  {
    id: 'func-tocomp',
    name: 'toComp()',
    signature: 'toComp(point, t = time)',
    category: FunctionCategory.SpaceTransform,
    description: '局部图层三维坐标转换至合成二维屏幕坐标。将该图层局部坐标系下的点坐标（例如图层的最左上角 [0,0,0] 或是锚点）解析为当前合成屏幕的 [x, y] 像素绝对坐标。',
    returnValue: 'Array [x, y] (合成窗口屏幕绝对位置)',
    example: 'thisComp.layer("My 3D Null").toComp([0,0,0]); // 应用给一个2D图层的位置',
    tips: '当你在场景中旋转 3D 图层、或者有复杂的 3D 摄像机飞舞时，2D 特效（如红巨星镜头光晕 Flare、Particular 发射器）是不能直接读取 3D 图层的 Position 的。此时在 2D 特效位置属性上挂此表达式，能将 3D 位置完美转换为 2D 位置，死死贴住！'
  },
  {
    id: 'func-fromcomp',
    name: 'fromComp()',
    signature: 'fromComp(point, t = time)',
    category: FunctionCategory.SpaceTransform,
    description: '与 `toComp` 正好相反。将合成的 2D 坐标（如鼠标位置、某 2D 层的坐标）转换当前图层自己的局部 3D 空间坐标系数值。',
    returnValue: 'Array [x, y, z]',
    example: 'fromComp(thisComp.layer("Null").transform.position);',
    tips: '多在高级 rigging 骨骼控制器、或者将全局平面动作转换给局部斜面图层定位时使用。'
  },

  // --- CompAccess ---
  {
    id: 'func-layer',
    name: 'layer()',
    signature: 'layer(indexOrName)',
    category: FunctionCategory.CompAccess,
    description: '跨图层检索引用。通过输入图层名字（String）或图层在时间轴的 index 序号，获取该合成中指定图层的所有属性对象。',
    returnValue: 'Layer 对象',
    example: 'target = thisComp.layer("Control Null");\ntarget.transform.scale; // 跨图层读取 Control Null 的缩放值',
    tips: '这是编写联动、控制面板的核心基础。在引用名字时，必须套上双引号，例如 `thisComp.layer("文本图层 1")`。'
  },
  {
    id: 'func-comp',
    name: 'comp()',
    signature: 'comp(name)',
    category: FunctionCategory.CompAccess,
    description: '跨合成检索引用。由于 `thisComp` 只能拿到自己所在的合成，你可以通过此函数，传入名字，直接提取并访问 AE 项目中「另一个」完全不同的合成里的各种图层和数值。',
    returnValue: 'Comp 对象',
    example: 'comp("全局色板").layer("Color Controller").effect("Color Accent")("Color"); // 跨合成读取颜色控制器的色彩',
    tips: '在搭建企业级统一包装、UI 套件 (Templates) 时，常常建立一个专门叫「SETTINGS」的控制台合成，其它数百个合成里面的表达式统统用 `comp("SETTINGS")` 引用它，这样改一个设置就能刷新所有合成，极其强悍。'
  }
];
