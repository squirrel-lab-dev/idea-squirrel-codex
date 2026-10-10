import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const plugin = resolve(root, 'plugins/ai-behavior-reviewer');
const json = p => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).filter(e => e.name !== '.git')
    .flatMap(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]);
}

test('marketplace points to this plugin with explicit install policies', () => {
  const market = json('.agents/plugins/marketplace.json');
  assert.match(market.name, /^[A-Za-z0-9_-]+$/);
  assert.equal(market.plugins.length, 1);
  const entry = market.plugins[0];
  assert.equal(resolve(root, entry.source.path), plugin);
  assert.equal(entry.name, 'ai-behavior-reviewer');
  assert.equal(entry.policy.installation, 'AVAILABLE');
  assert.equal(entry.policy.authentication, 'ON_INSTALL');
});

test('default package has real metadata, skill and image, no automatic integrations', () => {
  const manifest = json('plugins/ai-behavior-reviewer/.codex-plugin/plugin.json');
  assert.equal(manifest.name, basename(plugin));
  assert.equal(manifest.version, '0.1.0-preview.1');
  assert.equal(manifest.author.name, 'zhenyu200308-web');
  for (const field of ['hooks', 'apps', 'mcpServers']) assert.equal(manifest[field], undefined);
  assert.ok(existsSync(resolve(plugin, manifest.interface.logo)));
  assert.ok(existsSync(resolve(plugin, 'skills/conversation-review/SKILL.md')));
  for (const name of ['hooks', '.mcp.json', '.app.json']) assert.ok(!existsSync(resolve(plugin, name)));
});

test('all local Markdown links and HTML image sources resolve inside the repository', () => {
  for (const file of files(root).filter(p => p.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    const links = [...text.matchAll(/\]\(([^)]+)\)/g), ...text.matchAll(/src="([^"]+)"/g)];
    for (const [, raw] of links) {
      if (/^(https?:|#)/.test(raw)) continue;
      const target = resolve(dirname(file), decodeURIComponent(raw.split('#')[0]));
      assert.ok(!relative(root, target).startsWith('..'), raw);
      assert.ok(existsSync(target), `${relative(root, file)} -> ${raw}`);
    }
  }
});

test('distribution excludes runtime data, keys, binaries and private logs', () => {
  for (const file of files(root)) {
    const name = relative(root, file).replaceAll('\\', '/');
    assert.doesNotMatch(name, /(^|\/)(archive|node_modules|dist|\.env)(\/|$)|\.(ndjson|jsonl|log|key|pem|exe|zip)$/i);
    if (file.endsWith('.png')) continue;
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /sk-[a-zA-Z0-9]{16,}|gh[pousr]_[a-zA-Z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/);
  }
});

test('example and README disclose fictional input and preview limitations', () => {
  assert.match(readFileSync(resolve(root, 'examples/虚构会话.md'), 'utf8'), /虚构材料/);
  const readme = readFileSync(resolve(root, 'README.md'), 'utf8');
  assert.match(readme, /尚未完成真实客户端安装验收/);
  assert.match(readme, /不是桌面 App/);
});
