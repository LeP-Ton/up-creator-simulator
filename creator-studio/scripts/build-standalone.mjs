import { readFile, writeFile, readdir, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const dist = new URL('../dist/', import.meta.url);
const read = name => readFile(new URL(name, dist), 'utf8');
const assets = {};
for (const file of await readdir(new URL('assets/', dist))) {
  if (!file.endsWith('.jpg')) continue;
  const image = await readFile(new URL(`assets/${file}`, dist));
  assets[file.replace(/\.jpg$/, '')] = `data:image/jpeg;base64,${image.toString('base64')}`;
}
const modules = await Promise.all(['data.mjs', 'engine.mjs', 'app.js'].map(read));
// 将独立模块合并在同一作用域，图片改为内嵌数据，允许直接打开本地文件。
const script = `const __assets = ${JSON.stringify(assets)};\n` + modules
  .map(source => source.replace(/^import[^\n]*\n/gm, '').replace(/^export /gm, ''))
  .join('\n')
  .replace(/\.\/assets\/\$\{([^}]+)\}\.jpg/g, (_, expression) => '${__assets[' + expression + ']}')
  .replace(/\.\/assets\/([a-z]+)\.jpg/g, (_, key) => '${__assets.' + key + '}');
const check = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: script, encoding: 'utf8' });
if (check.status !== 0) throw new Error(`单文件脚本检查失败：${check.stderr}`);
let html = await read('index.html');
const css = await read('style.css');
html = html.replace(/<link rel="icon"[^>]+>/, `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(await read('favicon.svg'))}">`);
html = html.replace('<link rel="stylesheet" href="./style.css">', () => `<style>\n${css}\n</style>`);

// 替换内容使用函数，避免 JavaScript 模板文本中的美元符号被当作替换占位符。
const output = html.replace('<script type="module" src="./app.js"></script>', () => `<script type="module">\n${script}\n</script>`);
const destination = new URL('standalone.html', dist);
await writeFile(destination, output, 'utf8');
console.log(`单文件游戏已生成：${fileURLToPath(destination)}`);

// 托管工具只接受根目录标准产物目录，保持本地源码目录与预览入口稳定。
const release = new URL('../../dist/', import.meta.url);
await mkdir(release, { recursive: true });
for (const entry of await readdir(dist, { withFileTypes: true })) {
  await cp(new URL(entry.name, dist), new URL(entry.name, release), { recursive: true });
}
console.log(`静态发布目录已生成：${fileURLToPath(release)}`);

