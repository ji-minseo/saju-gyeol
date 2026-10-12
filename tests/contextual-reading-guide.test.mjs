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

  for(const key of ['pillars','structure','summary','reading','deep','flow','details']){
    assert.ok(html.includes('data-guide-key="'+key+'"'),key);
  }
});

test('contextual guide copy changes by report chapter',async()=>{
  const app=await readFile(new URL('../src/browser/app.mjs',import.meta.url),'utf8');
  for(const phrase of [
    "命式 · 네 기둥",
    "身强身弱 · 格局 · 用神",
    "KEY READING · 먼저 볼 결",
    "十星 · 성향·관계·일·돈",
    "原局 × 大運 × 歲運",
    "DETAILS · 해석의 근거표"
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
