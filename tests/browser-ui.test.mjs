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


test('result sharing exposes PNG save and native-share fallbacks',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/id="save-result-image"/);
  assert.match(html,/id="share-result"/);
  assert.match(html,/id="result-action-status"/);

  assert.match(source,/width:1080/);
  assert.match(source,/height:1350/);
  assert.match(source,/buildShareCanvas/);
  assert.match(source,/canvasToPngBlob/);
  assert.match(source,/saju-gyeol-result\.png/);
  assert.match(source,/navigator\.canShare/);
  assert.match(source,/navigator\.share/);
  assert.match(source,/navigator\.clipboard\.writeText/);
});

test('share card omits exact birth date and time from its drawing copy',async()=>{
  const source=await readFile('src/browser/app.mjs','utf8');
  const start=source.indexOf('const buildShareCanvas=');
  const end=source.indexOf('const canvasToPngBlob=',start);
  assert.ok(start>=0&&end>start);
  const shareCanvasSource=source.slice(start,end);
  assert.doesNotMatch(shareCanvasSource,/result\.input\.birthDate/);
  assert.doesNotMatch(shareCanvasSource,/result\.input\.birthTime/);
});
