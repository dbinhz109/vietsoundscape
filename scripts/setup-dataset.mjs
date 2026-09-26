#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const mode = process.argv[2];
if (!['demo', 'real'].includes(mode)) throw new Error('Chọn demo hoặc real.');
const run = (script, args = [], capture = false) => {
  const result = spawnSync(process.execPath, [`scripts/${script}.mjs`, ...args], {
    stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${script} thất bại`);
  return result.stdout;
};
run('prepare-data', [`--${mode}`, ...process.argv.slice(3)]);
run('render-stimuli');
if (mode === 'demo') {
  run('demo-logs');
  mkdirSync('build/demo', { recursive: true });
  const report = run('analyse-results', ['build/demo/logs'], true);
  writeFileSync('build/demo/analysis.txt', report);
  console.log(report);
}
console.log(`\nBộ ${mode} sẵn sàng. npm run dev → / và /thuc-nghiem.html?nguoi=0`);
console.log('npm run build để đóng gói cả phòng nghe và thực nghiệm.');
