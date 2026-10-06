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

test('browser UI exposes day-boundary choice with midnight as the default',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/name="dayBoundary" value="midnight" checked/);
  assert.match(html,/name="dayBoundary" value="zi-start"/);
  assert.match(html,/00:00 일자 변경/);
  assert.match(html,/23:00 자시 시작/);
  assert.match(source,/selectedDayBoundary/);
  assert.match(source,/calculateSaju\(\{birthDate,birthTime,sex:sexValue\},\{dayBoundary\}\)/);
  assert.match(source,/일자 기준/);
});
