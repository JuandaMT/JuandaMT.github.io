/**
 * Collects every pending item into TODO.md:
 *  - `todos:` lists in content frontmatter
 *  - `TODO:` comments in source files (.ts, .astro, .md, .css, .mjs)
 *  - <Todo note="…" /> placeholders in components
 *   pnpm todos
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exts = new Set(['.ts', '.astro', '.md', '.css', '.mjs']);
const groups = new Map();

function add(file, item) {
  const rel = path.relative(root, file);
  if (!groups.has(rel)) groups.set(rel, new Set());
  groups.get(rel).add(item.trim());
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) scan(full);
  }
}

function scan(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let inTodos = false;
  for (const line of lines) {
    if (/^todos:\s*$/.test(line)) {
      inTodos = true;
      continue;
    }
    if (inTodos) {
      const m = line.match(/^\s+-\s+['"]?(.*?)['"]?\s*$/);
      if (m) {
        add(file, m[1]);
        continue;
      }
      inTodos = false;
    }
    const comment = line.match(/TODO:\s*(.+?)\s*(?:-->|\*\/)?\s*$/);
    if (comment) add(file, comment[1]);
    const tag = line.match(/<Todo note="([^"]+)"/);
    if (tag) add(file, tag[1]);
  }
}

walk(path.join(root, 'src'));
for (const p of ['public/cv']) {
  if (!fs.readdirSync(path.join(root, p)).some((f) => f.endsWith('.pdf'))) {
    add(path.join(root, p), 'Añadir los PDF del CV (inglés y español)');
  }
}

const total = [...groups.values()].reduce((n, s) => n + s.size, 0);
let out = `# Pendientes\n\nGenerado con \`pnpm todos\`. ${total} elementos. No edites a mano: resuelve el TODO en su fichero y vuelve a ejecutar el script.\n`;
for (const [file, items] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
  out += `\n## \`${file}\`\n\n${[...items].map((i) => `- [ ] ${i}`).join('\n')}\n`;
}
fs.writeFileSync(path.join(root, 'TODO.md'), out);
console.log(`TODO.md: ${total} items in ${groups.size} files`);
