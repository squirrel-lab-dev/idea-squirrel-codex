import { unlink } from 'node:fs/promises';
const dir = process.env.AI_BEHAVIOR_MONITOR_DIR || process.env.PLUGIN_DATA;
if (!dir) throw new Error('请设置 AI_BEHAVIOR_MONITOR_DIR，或在 Codex hook 环境中运行。');
try { await unlink(`${dir}/enabled`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
console.log(`监测已停止：${dir}`);
