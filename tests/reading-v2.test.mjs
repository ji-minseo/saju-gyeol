import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildReadingV2} from '../src/content/reading-v2.mjs';

const samples=[
  {birthDate:'2026-10-06',birthTime:'10:10',sex:'female'},
  {birthDate:'2001-06-12',birthTime:'14:30',sex:'male'},
  {birthDate:'1988-02-20',birthTime:'09:15',sex:'female'}
];

test('reading v2 returns deep structured sections',()=>{
  for(const input of samples){
    const result=calculateSaju(input);
    const reading=buildReadingV2(result);
    for(const key of ['temperament','relationship','career','money']){
      const section=reading[key];
      assert.ok(section.title.length>=8,`${key} title should be specific`);
      assert.ok(section.body.length>=55,`${key} body should be substantial`);
      assert.equal(section.situations.length,2,`${key} should have two concrete situations`);
      assert.ok(section.situations.every(x=>x.length>=20),`${key} situations should be concrete`);
      assert.ok(section.guide.length>=25,`${key} should include practical guidance`);
      assert.ok(section.evidence.length>=1,`${key} should expose chart evidence`);
      assert.equal(section.methodId,'reading-v2-structural');
      assert.equal(section.confidence,'medium');
    }
  }
});

test('reading v2 keeps high-stakes and deterministic claims out',()=>{
  for(const input of samples){
    const text=JSON.stringify(buildReadingV2(calculateSaju(input)));
    for(const forbidden of [
      '무조건','반드시 부자','확실히 부자','이혼합니다','결혼합니다',
      '질병이 생','암에','투자해야','주식을 사','코인을 사'
    ]){
      assert.equal(text.includes(forbidden),false,`forbidden deterministic phrase: ${forbidden}`);
    }
  }
});

test('reading v2 evidence names actual day master',()=>{
  const result=calculateSaju(samples[0]);
  const reading=buildReadingV2(result);
  assert.ok(reading.temperament.evidence.includes(`일간 ${result.dayMaster.hanja}`));
  assert.ok(reading.relationship.evidence.includes(`일지 ${result.pillars.day.branch.hanja}`));
});
