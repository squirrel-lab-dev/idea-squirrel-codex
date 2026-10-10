import { appendFile, access, mkdir, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join } from 'node:path';

const dir = process.env.AI_BEHAVIOR_MONITOR_DIR || process.env.PLUGIN_DATA;
if (!dir) process.exit(0);
const enabled = join(dir, 'enabled');
try { await access(enabled, constants.F_OK); } catch { process.exit(0); }
let raw = '';
for await (const chunk of process.stdin) raw += chunk;
let event; try { event = JSON.parse(raw || '{}'); } catch { event = { raw }; }
const out = join(dir, 'events.ndjson');
await mkdir(dirname(out), { recursive: true });
await appendFile(out, JSON.stringify({ capturedAt: new Date().toISOString(), event }) + '\n', 'utf8');
