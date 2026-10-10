import { mkdir, writeFile } from 'node:fs/promises';
const dir = process.env.AI_BEHAVIOR_MONITOR_DIR || process.env.PLUGIN_DATA;
if (!dir) throw new Error('请设置 AI_BEHAVIOR_MONITOR_DIR，或在 Codex hook 环境中运行。');
await mkdir(dir, { recursive: true });
await writeFile(`${dir}/enabled`, new Date().toISOString(), 'utf8');
console.log(`监测已开启：${dir}`);
