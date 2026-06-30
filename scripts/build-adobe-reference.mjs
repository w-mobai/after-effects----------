import { writeFile } from 'node:fs/promises';

const url = 'https://helpx.adobe.com/cn/after-effects/using/expression-language-reference.html';
const html = await (await fetch(url)).text();
const clean = (value = '') => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&quot;/g, '"')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const categoryNames = {
  '全局对象、属性和方法（表达式引用）': '全局对象',
  '时间转换方法（表达式引用）': '时间转换',
  '矢量数学方法（表达式引用）': '矢量数学',
  '随机数方法（表达式引用）': '随机与噪波',
  '插值方法（表达式引用）': '插值与缓动',
  '颜色转换方法（表达式引用）': '颜色转换',
  '其他数学方法（表达式引用）': '角度数学',
  '合成属性和方法（表达式引用）': '合成对象',
  '下拉菜单属性（表达式参考）': '下拉菜单',
  '素材属性和方法（表达式引用）': '素材与数据',
  '图层子对象属性和方法（表达式引用）': '图层子对象',
  '图层常规属性和方法（表达式引用）': '图层常规',
  '图层属性特性和方法（表达式引用）': '图层变换',
  '图层 3D 属性和方法（表达式引用）': '图层 3D',
  '图层空间变换方法（表达式引用）': '空间变换',
  '摄像机属性和方法（表达式引用）': '摄像机',
  '光照属性和方法（表达式引用）': '灯光',
  '效果属性和方法（表达式引用）': '效果',
  '蒙版属性和方法（表达式引用）': '蒙版',
  '属性特性和方法（表达式引用）': '属性与关键帧',
  'Key 属性和方法（表达式引用）': '关键帧对象',
  'MarkerKey 属性（表达式引用）': '标记对象',
};

const visualFor = (category) => {
  if (/时间|关键帧|标记/.test(category)) return 'time';
  if (/矢量|空间|3D|图层变换/.test(category)) return 'vector';
  if (/随机/.test(category)) return 'random';
  if (/插值/.test(category)) return 'curve';
  if (/颜色|灯光/.test(category)) return 'color';
  if (/摄像机/.test(category)) return 'camera';
  if (/素材|下拉|数据/.test(category)) return 'data';
  if (/属性|效果|蒙版/.test(category)) return 'property';
  return 'space';
};

const returnMatch = (body) => clean(body).match(/返回类型[：:]\s*([^。]+)/)?.[1] ?? '请参照属性上下文';
const firstUsefulParagraph = (body) => {
  const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((match) => clean(match[1]));
  return paragraphs.find((p) => p && !/^返回类型|^参数类型|^语法/.test(p)) ?? '访问或计算当前表达式上下文中的对应值。';
};
const exampleFor = (signature, category) => {
  const bare = signature.replace(/\s*（.*?）/g, '').trim();
  if (!bare.includes('(')) {
    const prefix = category === '合成对象' ? 'thisComp.' : category.startsWith('图层') ? 'thisLayer.' : '';
    return `${prefix}${bare}`;
  }
  return bare
    .replace(/name/g, '"名称"')
    .replace(/index/g, '1')
    .replace(/point1/g, '[0, 0]')
    .replace(/point2/g, '[100, 100]')
    .replace(/point/g, '[0, 0, 0]')
    .replace(/vec1/g, '[10, 20]')
    .replace(/vec2/g, '[5, 8]')
    .replace(/vec/g, '[10, 20]')
    .replace(/degrees/g, '180')
    .replace(/radians/g, 'Math.PI');
};

const headingOrItem = /<h2[^>]*>([\s\S]*?)<\/h2>|<span class="help-variable-title">([\s\S]*?)<\/span>/g;
let match;
let currentCategory = '';
const rawItems = [];
while ((match = headingOrItem.exec(html))) {
  if (match[1]) {
    currentCategory = clean(match[1]);
    continue;
  }
  if (!categoryNames[currentCategory]) continue;
  const signature = clean(match[2]);
  const nextItem = html.indexOf('help-variable-title', headingOrItem.lastIndex);
  const nextHeading = html.indexOf('<h2', headingOrItem.lastIndex);
  const end = Math.min(...[nextItem, nextHeading, html.length].filter((n) => n >= 0));
  rawItems.push({ signature, body: html.slice(headingOrItem.lastIndex, end), category: categoryNames[currentCategory] });
}

const seen = new Map();
const items = rawItems.map((item, position) => {
  const key = `${item.category}-${item.signature}`;
  const duplicate = seen.get(key) ?? 0;
  seen.set(key, duplicate + 1);
  const name = item.signature.split('(')[0].trim();
  return {
    id: `adobe-${position + 1}-${name.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-')}${duplicate ? `-${duplicate + 1}` : ''}`,
    name,
    signature: item.signature,
    category: item.category,
    description: firstUsefulParagraph(item.body),
    returnValue: returnMatch(item.body),
    example: exampleFor(item.signature, item.category),
    tips: `“${name}”属于 Adobe 官方“${item.category}”章节。请注意参数默认值、对象上下文和返回维度。`,
    sourceUrl: url,
    visualType: visualFor(item.category),
  };
});

const output = `/**\n * 从 Adobe After Effects 官方表达式语言参考生成。\n * 来源：${url}\n * 生成日期：${new Date().toISOString().slice(0, 10)}\n */\nimport type { ExpressionFunction } from '../types';\n\nexport const functionCategories = ${JSON.stringify([...new Set(items.map((item) => item.category))], null, 2)} as const;\n\nexport const functionsData: ExpressionFunction[] = ${JSON.stringify(items, null, 2)};\n`;
await writeFile(new URL('../src/data/functions.ts', import.meta.url), output);
console.log(`Imported ${items.length} Adobe expression reference entries.`);
