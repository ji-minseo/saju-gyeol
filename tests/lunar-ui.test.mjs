import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('lunar calendar option is enabled with separate lunar date controls',async()=>{
  const home=await readFile('site/index.html','utf8');
  assert.match(home,/name="calendar" value="lunar"/);
  assert.doesNotMatch(home,/value="lunar" disabled/);
  for(const id of ['lunar-year','lunar-month','lunar-day','lunar-leap','lunar-date-fields','leap-month-row']){
    assert.ok(home.includes(`id="${id}"`),id);
  }
});

test('browser converts lunar date before calling the existing solar Saju engine',async()=>{
  const app=await readFile('src/browser/app.mjs','utf8');
  assert.match(app,/lunarToSolarDate/);
  assert.match(app,/birthDate=converted\.solarDate/);
  assert.match(app,/calculateSaju\(\{birthDate,birthTime,sex:sexValue\}\)/);
  assert.match(app,/calendarMeta=\{type:'lunar',\.\.\.converted\.lunar\}/);
});

test('lunar result summary exposes original lunar date and converted solar date',async()=>{
  const app=await readFile('src/browser/app.mjs','utf8');
  assert.match(app,/음력 \$\{calendarMeta\.year\}년/);
  assert.match(app,/→ 양력/);
  assert.match(app,/윤달/);
});

test('methodology no longer claims lunar conversion is unsupported',async()=>{
  const method=await readFile('site/methodology/index.html','utf8');
  assert.doesNotMatch(method,/음력 변환은 아직 지원하지 않습니다/);
  assert.doesNotMatch(method,/음력 변환은 미지원/);
  assert.match(method,/음력 1970~2050/);
  assert.match(method,/윤달 지원/);
});
