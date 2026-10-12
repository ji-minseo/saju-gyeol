import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('HOW TO READ is contextual instead of a standalone FAQ guidebook',async()=>{
  const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
  assert.equal(html.includes('class="reading-guidebook"'),false);
  assert.ok(html.includes('id="context-reading-guide"'));
  assert.ok(html.includes('id="context-guide-title"'));
  assert.ok(html.includes('id="context-guide-body"'));
  assert.ok(html.includes('id="context-guide-personal"'));

  for(const key of ['pillars','summary','day','structure','elements','tengods','relations','stars','flow','appendix']){
    assert.ok(html.includes('data-guide-key="'+key+'"'),key);
  }
});

test('contextual guide copy changes by report chapter',async()=>{
  const app=await readFile(new URL('../src/browser/app.mjs',import.meta.url),'utf8');
  for(const phrase of [
    "命式 · 네 기둥",
    "AT A GLANCE · 먼저 보는 핵심",
    "日柱 · DAY PILLAR",
    "STRUCTURE · 힘과 균형",
    "五行 · FIVE ELEMENTS",
    "十星 · TEN GODS",
    "地支關係 · BRANCH RELATIONS",
    "神煞 · 貴人 · 보조 상징",
    "原局 × 大運 × 歲運",
    "APPENDIX · 보조 데이터"
  ]){
    assert.ok(app.includes(phrase),phrase);
  }
  assert.ok(app.includes('syncContextGuideToScroll'));
  assert.ok(app.includes("window.addEventListener('scroll'"));
});

test('HOW TO READ label has no colored text background',async()=>{
  const css=await readFile(new URL('../site/assets/style.css',import.meta.url),'utf8');
  assert.match(css,/\.context-guide-label\{[\s\S]*?background:none;/);
  assert.match(css,/\.context-guide-label span,[\s\S]*?background:none;/);
});

test('desktop recent reading occupies a full-width row without displacing the form',async()=>{
  const css=await readFile(new URL('../site/assets/style.css',import.meta.url),'utf8');
  assert.match(css,/@media\(min-width:761px\)[\s\S]*?\.tool-shell>\.intro\{[\s\S]*?grid-row:1;/);
  assert.match(css,/@media\(min-width:761px\)[\s\S]*?\.tool-shell>\.birth-form\{[\s\S]*?grid-column:2;[\s\S]*?grid-row:1;/);
  assert.match(css,/@media\(min-width:761px\)[\s\S]*?\.tool-shell>\.recent-reading\{[\s\S]*?grid-column:1 \/ -1;[\s\S]*?grid-row:2;/);
});


test('sticky guide ancestors stay overflow-visible on mobile and desktop',async()=>{
  const css=await readFile(new URL('../site/assets/style.css',import.meta.url),'utf8');
  assert.match(css,/\.home-page \.tool-shell,\s*\.home-page \.result-preview\{[\s\S]*?overflow:visible!important;/);
  assert.match(css,/\.context-reading-guide\{[\s\S]*?position:-webkit-sticky;[\s\S]*?position:sticky;/);
});

test('compatibility nav uses the same main reading label',async()=>{
  const html=await readFile(new URL('../site/compatibility/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('href="../#reading">내 사주 보기</a>'));
  assert.equal(html.includes('href="../#reading">내 사주</a>'),false);
});


test('data chapters expose personalized inline explanations',async()=>{
  const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
  const source=await readFile(new URL('../src/browser/app.mjs',import.meta.url),'utf8');
  for(const id of ['chapter-day-personal','chapter-elements-personal','chapter-ten-gods-personal']){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.ok(source.includes("setInline('#chapter-day-personal',guide.dayPillar)"));
  assert.ok(source.includes("setInline('#chapter-elements-personal',guide.elements)"));
  assert.ok(source.includes("setInline('#chapter-ten-gods-personal',guide.tenGods)"));
});


test('structure chapter defines expert terms in plain Korean before relying on them',async()=>{
  const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
  const source=await readFile(new URL('../src/browser/app.mjs',import.meta.url),'utf8');

  assert.ok(html.includes('class="structure-beginner-map"'));
  for(const phrase of [
    '나를 뜻하는 글자',
    '태어난 달의 계절 힘',
    '그 계절의 중심 역할',
    '균형을 돕는 오행 후보',
    '일간</em>',
    '월령</em>',
    '격국</em>',
    '용신</em>'
  ]) assert.ok(html.includes(phrase),phrase);

  assert.ok(source.includes("kicker:'STRUCTURE · 힘과 균형'"));
  assert.ok(source.includes('명리에서는 각각 신강·신약, 격국, 용신이라고 불러요.'));
  assert.equal(source.includes(":'월령·뿌리·천간의 도움과 소모를 함께 계산합니다.'"),false);
});
