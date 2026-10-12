import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('compatibility Korean typography is forced to sans serif',async()=>{
  const css=await readFile(new URL('../site/assets/compatibility.css',import.meta.url),'utf8');
  assert.match(css,/--compat-sans:/);
  assert.match(css,/\.compatibility-page\{[\s\S]*font-family:var\(--compat-sans\)/);
  for(const selector of [
    '.compat-hero h1',
    '.compat-form-heading h2',
    '.compat-result-head h2',
    '.pair-summary h3',
    '.compat-section-heading h2'
  ]){
    assert.ok(css.includes(selector),selector);
  }
  assert.match(css,/\.pair-center b[\s\S]*Noto Serif KR/);
});

test('result page contains structural analysis explanation targets',async()=>{
  const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
  for(const id of [
    'result-structure-reading','structure-strength-label','strength-marker',
    'structure-pattern-label','structure-useful-label','structure-season-detail'
  ]){
    assert.ok(html.includes('id="'+id+'"'),id);
  }
});
