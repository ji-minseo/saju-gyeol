import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildCurrentFlow} from '../src/content/flow-v1.mjs';

test('flow v1 uses Li Chun as the annual boundary',()=>{
  const result=calculateSaju({birthDate:'2001-06-12',birthTime:'14:30',sex:'female'});
  const before=buildCurrentFlow(result,{today:'2026-01-15'});
  assert.equal(before.currentSajuYear,2025);
  assert.equal(before.annuals[0].year,2025);
  assert.equal(before.annuals[0].pillar.hanja,'乙巳');

  const after=buildCurrentFlow(result,{today:'2026-10-06'});
  assert.equal(after.currentSajuYear,2026);
  assert.deepEqual(after.annuals.map(x=>x.year),[2026,2027,2028]);
  assert.deepEqual(after.annuals.map(x=>x.pillar.hanja),['丙午','丁未','戊申']);
});

test('flow v1 identifies an active daeun for an adult chart',()=>{
  const result=calculateSaju({birthDate:'1990-08-21',birthTime:'11:20',sex:'female'});
  const flow=buildCurrentFlow(result,{today:'2026-10-06'});
  assert.equal(flow.daeun.status,'active');
  assert.ok(flow.daeun.order>=1);
  assert.ok(flow.daeun.pillar.hanja.length===2);
  assert.ok(flow.daeun.evidence.some(x=>x.startsWith('대운 ')));
  assert.equal(flow.daeun.approximateStart,true);
});

test('annual flow remains available without sex while daeun explains what is missing',()=>{
  const result=calculateSaju({birthDate:'2001-06-12',birthTime:'14:30',sex:null});
  const flow=buildCurrentFlow(result,{today:'2026-10-06'});
  assert.equal(flow.daeun.status,'needs-sex');
  assert.equal(flow.annuals.length,3);
  assert.ok(flow.annuals.every(x=>x.evidence.length>=3));
});

test('flow v1 exposes themes and guidance without guaranteed event claims',()=>{
  const result=calculateSaju({birthDate:'1988-09-19',birthTime:'16:40',sex:'male'});
  const flow=buildCurrentFlow(result,{today:'2026-10-06'});
  for(const annual of flow.annuals){
    assert.ok(annual.title.length>=8);
    assert.ok(annual.body.length>=45);
    assert.ok(annual.guide.length>=20);
    assert.equal(annual.methodId,'annual-flow-v1');
    assert.equal(annual.confidence,'medium');
  }
  const text=JSON.stringify(flow);
  for(const forbidden of [
    '무조건','반드시 부자','대박납니다','이혼합니다','결혼합니다',
    '사고가 납니다','질병이 생','투자해야','주식을 사','코인을 사'
  ]){
    assert.equal(text.includes(forbidden),false,forbidden);
  }
});
