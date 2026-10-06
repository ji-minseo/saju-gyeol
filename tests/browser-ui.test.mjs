import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('browser UI is wired to the generated engine bundle',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');
  assert.match(html,/engine-app\.js/);
  assert.match(html,/data-pillar="year"/);
  assert.match(html,/data-element="wood"/);
  assert.match(source,/calculateSaju/);
  assert.match(source,/needs-birth-time/);
});
