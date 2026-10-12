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


test('recent reading restore is explicit opt-in and browser-local',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/id="save-reading"/);
  assert.match(html,/id="recent-reading"/);
  assert.match(html,/id="restore-recent-reading"/);
  assert.match(html,/id="clear-recent-reading"/);
  assert.match(html,/서버 저장 없이/);

  assert.match(source,/RECENT_READING_KEY='saju-gyeol:recent-reading:v1'/);
  assert.match(source,/if\(!saveReadingInput\?\.checked\) return/);
  assert.match(source,/localStorage\.setItem\(RECENT_READING_KEY/);
  assert.match(source,/localStorage\.removeItem\(RECENT_READING_KEY/);
  assert.match(source,/calculateSaju\(\s*\{birthDate:saved\.birthDate/);
});

test('recent reading UI does not expose saved birth date in its teaser',async()=>{
  const source=await readFile('src/browser/app.mjs','utf8');
  const start=source.indexOf('const refreshRecentReading=');
  const end=source.indexOf('const persistRecentReading=',start);
  assert.ok(start>=0&&end>start);
  const teaserSource=source.slice(start,end);
  assert.doesNotMatch(teaserSource,/saved\.birthDate/);
  assert.doesNotMatch(teaserSource,/saved\.birthTime/);
});


test('compatibility page exposes two-person inputs and share actions',async()=>{
  const html=await readFile('site/compatibility/index.html','utf8');
  const source=await readFile('src/browser/compatibility-app.mjs','utf8');

  assert.match(html,/id="compatibility-form"/);
  assert.match(html,/name="aCalendar"/);
  assert.match(html,/name="bCalendar"/);
  assert.match(html,/id="compat-result"/);
  assert.match(html,/id="save-compat-image"/);
  assert.match(html,/id="share-compat-result"/);

  assert.match(source,/buildCompatibilityV1/);
  assert.match(source,/calculateSaju/);
  assert.match(source,/lunarToSolarDate/);
  assert.match(source,/saju-gyeol-compatibility\.png/);
  assert.match(source,/navigator\.share/);
});


test('personal result renders expanded reading v3 report',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/id="result-deep-reading"/);
  assert.match(html,/id="deep-portrait-title"/);
  assert.match(html,/data-deep-pattern="decision"/);
  assert.match(html,/data-deep-pattern="stress"/);
  assert.match(html,/id="ten-god-position-list"/);

  assert.match(source,/buildReadingV3/);
  assert.match(source,/renderDeepReading/);
  assert.match(source,/deep\.tenGodPositions/);
  assert.doesNotMatch(source,/import \{buildReadingV2\}/);
});


test('daeun timeline renders an explanation card for every cycle',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/대운별 10년 해설/);
  assert.match(source,/className='daeun-life-card'/);
  assert.match(source,/className='daeun-life-body'/);
  assert.match(source,/className='daeun-life-guide'/);
  assert.match(source,/timeline\.evidence/);
  assert.match(source,/dataset\.daeunOrder/);
});


test('full symbolic-star catalog renders as explained supporting data',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/id="chapter-symbolic-stars"/);
  assert.match(html,/id="symbolic-stars-list"/);
  assert.match(html,/24종 \+ 12신살 전체/);
  assert.match(source,/const renderSymbolicStars=result=>/);
  assert.match(source,/className='symbolic-star-card '/);
  assert.match(source,/id=\"twelve-star-anchors\"|#twelve-star-anchors/);
  assert.match(source,/renderSymbolicStars\(result\)/);
});

test('tool-shell inner corners match the rounded outer shell',async()=>{
  const css=await readFile('site/assets/style.css','utf8');
  assert.match(css,/\.home-page \.tool-shell>\.intro\{[\s\S]*?border-radius:25px 0 0 0;/);
  assert.match(css,/\.home-page \.tool-shell>\.birth-form\{[\s\S]*?border-radius:0 25px 0 0;/);
  assert.match(css,/\.home-page:not\(\.has-result\) \.tool-shell>\.service-strip\{[\s\S]*?border-radius:0 0 25px 25px;/);
  assert.match(css,/\.home-page\.has-result \.tool-shell>\.result-preview\{[\s\S]*?border-radius:0 0 25px 25px;/);
});


test('daeun rail is masked behind its labels and long symbolic-star marks stay on one line',async()=>{
  const css=await readFile('site/assets/style.css','utf8');
  assert.match(css,/\.daeun-life-rail strong,[\s\S]*?background:var\(--daeun-rail-bg\)/);
  assert.match(css,/\.daeun-life-rail>span[\s\S]*?box-shadow:0 0 0 4px var\(--daeun-rail-bg\)/);
  assert.match(css,/\.symbolic-star-mark\{[\s\S]*?min-width:78px;[\s\S]*?white-space:nowrap;/);
});


test('seasonal balance renders classical candidates and compares them with balancing useful-god',async()=>{
  const html=await readFile('site/index.html','utf8');
  const source=await readFile('src/browser/app.mjs','utf8');

  assert.match(html,/id="chapter-climate"/);
  assert.match(html,/계절의 균형 · 조후/);
  assert.match(source,/result\.climateBalance/);
  assert.match(source,/candidate\.presence\.text/);
  assert.match(source,/climate-balance-useful/);
  assert.match(source,/climate-season-useful/);
});
