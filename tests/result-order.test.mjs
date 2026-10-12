import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('result report is organized as data-first interpretation chapters',async()=>{
  const html=await readFile('site/index.html','utf8');
  const pillars=html.indexOf('class="pillar-grid"');
  const summary=html.indexOf('id="result-summary"');
  const day=html.indexOf('id="chapter-day"');
  const structure=html.indexOf('id="result-structure-reading"');
  const elements=html.indexOf('id="chapter-elements"');
  const tenGods=html.indexOf('id="chapter-ten-gods"');
  const relations=html.indexOf('id="chapter-relations"');
  const stars=html.indexOf('id="chapter-symbolic-stars"');
  const flow=html.indexOf('id="chapter-flow"');
  const details=html.indexOf('id="result-details"');

  for(const [key,value] of Object.entries({pillars,summary,day,structure,elements,tenGods,relations,stars,flow,details})){
    assert.ok(value>0,key);
  }
  assert.ok(pillars<summary);
  assert.ok(summary<day);
  assert.ok(day<structure);
  assert.ok(structure<elements);
  assert.ok(elements<tenGods);
  assert.ok(tenGods<relations);
  assert.ok(relations<stars);
  assert.ok(stars<flow);
  assert.ok(flow<details);
});

test('interpretations sit beside the data they are derived from',async()=>{
  const html=await readFile('site/index.html','utf8');

  const day=html.indexOf('id="chapter-day"');
  const structure=html.indexOf('id="result-structure-reading"');
  const temperament=html.indexOf('data-reading="temperament"');
  assert.ok(day<temperament&&temperament<structure);

  const tenGods=html.indexOf('id="chapter-ten-gods"');
  const relations=html.indexOf('id="chapter-relations"');
  const tenGodData=html.indexOf('id="ten-gods"');
  const career=html.indexOf('data-reading="career"');
  const money=html.indexOf('data-reading="money"');
  assert.ok(tenGods<tenGodData&&tenGodData<career&&career<relations);
  assert.ok(tenGodData<money&&money<relations);

  const branchData=html.indexOf('id="branch-relations"');
  const relationship=html.indexOf('data-reading="relationship"');
  const stars=html.indexOf('id="chapter-symbolic-stars"');
  const flow=html.indexOf('id="chapter-flow"');
  assert.ok(relations<branchData&&branchData<relationship&&relationship<stars);
  assert.ok(stars<flow);

  const daeunTrack=html.indexOf('id="daeun-track"');
  const currentFlow=html.indexOf('id="result-flow"');
  assert.ok(flow<daeunTrack&&daeunTrack<currentFlow);
});

test('quick summary exposes all four user-facing reading categories',async()=>{
  const html=await readFile('site/index.html','utf8');
  for(const key of ['temperament','relationship','career','money']){
    assert.match(html,new RegExp(`data-summary="${key}"`));
    assert.equal((html.match(new RegExp(`data-reading="${key}"`,'g'))||[]).length,1,key);
  }
});
