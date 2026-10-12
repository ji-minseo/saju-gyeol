import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildDetailGuide,explainCurrentFlow} from '../src/content/guide-v2.mjs';
import {buildCurrentFlow} from '../src/content/flow-v1.mjs';

const samples=[
  {birthDate:'1988-09-19',birthTime:'16:40',sex:'male'},
  {birthDate:'1995-10-13',birthTime:'10:10',sex:'female'},
  {birthDate:'2000-05-20',birthTime:'10:00',sex:'male'}
];

test('detail guide connects jargon to the calculated chart',()=>{
  for(const input of samples){
    const result=calculateSaju(input);
    const guide=buildDetailGuide(result);

    assert.ok(guide.hiddenStems.includes('지장간'));
    assert.ok(guide.twelveStages.includes(result.twelveStages.pillars.day.name));
    assert.ok(guide.twelveStages.includes('실제 생애 단계'));
    assert.ok(guide.branchRelations.length>30);
    assert.ok(guide.void.includes(result.void.branches[0].hanja));
    assert.ok(guide.daeun.includes('대운'));

    for(const item of guide.relationItems){
      assert.ok(item.label);
      assert.ok(item.branches);
      assert.ok(item.meaning.length>=15);
    }
  }
});

test('current-flow bridge explains layering without event prediction',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:10',sex:'female'});
  const flow=buildCurrentFlow(result,{today:new Date('2026-10-12T12:00:00+09:00')});
  const text=explainCurrentFlow(flow);

  assert.ok(text.includes('원국'));
  assert.ok(text.includes('사건'));
  assert.ok(text.length>=70);
});

test('detail guide avoids deterministic health, wealth and relationship claims',()=>{
  for(const input of samples){
    const text=JSON.stringify(buildDetailGuide(calculateSaju(input)));
    for(const forbidden of [
      '반드시 부자','확실히 부자','질병','암에','치료해야','배우자가 죽',
      '아버지가 일찍','결혼합니다','이혼합니다','투자해야','주식을 사'
    ]){
      assert.equal(text.includes(forbidden),false,`${input.birthDate}: ${forbidden}`);
    }
  }
});

test('result page exposes every contextual explanation target',async()=>{
  const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
  for(const id of [
    'hidden-stem-explainer','twelve-stages-explainer','branch-relations-explainer',
    'branch-relation-guide','void-explainer','daeun-explainer','flow-reading-bridge'
  ]){
    assert.ok(html.includes(`id="${id}"`),id);
  }
});
