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


test('flow titles choose Korean 이/가 from the keyword final consonant',()=>{
  const sikshinChart=calculateSaju({birthDate:'2026-10-05',birthTime:'12:00',sex:'female'}); // 壬 day
  const sikshin=buildCurrentFlow(sikshinChart,{today:'2034-10-06'}).annuals[0];
  assert.match(sikshin.title,/생산 · 루틴이 반복해서/);
  assert.doesNotMatch(sikshin.title,/루틴가/);

  const peerChart=calculateSaju({birthDate:'2026-10-07',birthTime:'12:00',sex:'female'}); // 甲 day
  const peer=buildCurrentFlow(peerChart,{today:'2034-10-06'}).annuals[0];
  assert.match(peer.title,/내 선택 · 독립이 반복해서/);
  assert.doesNotMatch(peer.title,/독립가/);
});


test('daeun timeline exposes a theme for every 10-year cycle',()=>{
  const result=calculateSaju({birthDate:'1990-08-21',birthTime:'11:20',sex:'female'});
  const flow=buildCurrentFlow(result,{today:'2026-10-06'});
  assert.equal(flow.daeunTimeline.length,result.daeun.cycles.length);
  assert.ok(flow.daeunTimeline.every(item=>item.theme&&item.title&&item.pillar.hanja.length===2));
});

test('no rendered flow title contains broken Korean particles',()=>{
  const samples=[
    {birthDate:'1990-08-21',birthTime:'11:20',sex:'female'},
    {birthDate:'2001-06-12',birthTime:'14:30',sex:'male'},
    {birthDate:'2026-10-06',birthTime:'10:10',sex:'female'}
  ];
  for(const input of samples){
    const flow=buildCurrentFlow(calculateSaju(input),{today:'2026-10-06'});
    const titles=[
      flow.daeun.title,
      ...flow.annuals.map(x=>x.title),
      ...flow.daeunTimeline.map(x=>x.title)
    ].filter(Boolean).join(' ');
    assert.doesNotMatch(titles,/루틴가|독립가/);
  }
});
