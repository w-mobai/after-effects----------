/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ShortcutCategory {
  Tools = '工具与选择',
  Layers = '图层操作',
  Composition = '合成与时间轴',
  Timeline = '关键帧与时间轴导航',
  Views = '视图与视图导航',
  Effects = '效果与属性'
}

export interface Shortcut {
  id: string;
  name: string;
  winKeys: string[]; // e.g. ['Ctrl', 'D']
  macKeys: string[]; // e.g. ['Cmd', 'D']
  description: string;
  category: ShortcutCategory;
  importance: 'high' | 'medium';
}

export enum ExpressionCategory {
  Basic = '基础入门',
  Loop = '循环控制',
  Interpolation = '插值映射',
  LayerSpace = '空间与关联',
  Physics = '物理与数学模拟'
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  defaultValue: string;
}

export interface ExpressionItem {
  id: string;
  name: string;
  englishName: string;
  code: string;
  category: ExpressionCategory;
  description: string;
  parameters: Parameter[];
  useCase: string;
  simulationType: string;
}

export enum FunctionCategory {
  Global = '全局属性与方法',
  Math = '向量与数学函数',
  Random = '随机函数',
  Interpolation = '数值插值',
  SpaceTransform = '图层空间转换',
  CompAccess = '合成与图层检索'
}

export interface ExpressionFunction {
  id: string;
  name: string;
  signature: string;
  category: FunctionCategory;
  description: string;
  returnValue: string;
  example: string;
  tips: string;
}
