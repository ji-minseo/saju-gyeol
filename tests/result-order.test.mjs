import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('result report presents interpretation before technical chart data',async()=>{
  const html=await readFile('site/index.html','utf8');
  const summary=html.indexOf('id="result-summary"');
  const reading=html.indexOf('id="result-reading"');
  const flow=html.indexOf('id="result-flow"');
  const details=html.indexOf('id="result-details"');
  const pillars=html.indexOf('class="pillar-grid"');
  const elements=html.indexOf('id="result-elements"');
  const structure=html.indexOf('id="result-structure"');

  assert.ok(summary>0);
  assert.ok(summary<reading);
  assert.ok(reading<flow);
  assert.ok(flow<details);
  assert.ok(details<pillars);
  assert.ok(pillars<elements);
  assert.ok(elements<structure);
});

test('quick summary exposes all four user-facing reading categories',async()=>{
  const html=await readFile('site/index.html','utf8');
  for(const key of ['temperament','relationship','career','money']){
    assert.match(html,new RegExp(`data-summary="${key}"`));
  }
});
