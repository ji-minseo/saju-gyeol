import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildReadingGuide} from '../src/content/guide-v1.mjs';

const samples=[
  {birthDate:'1988-09-19',birthTime:'16:40',sex:'male'},
  {birthDate:'1995-10-13',birthTime:'10:10',sex:'female'},
  {birthDate:'2000-05-20',birthTime:'10:00',sex:'male'}
];

test('guide explains the actual day pillar, element distribution and ten-god emphasis',()=>{
  for(const input of samples){
    const result=calculateSaju(input);
    const guide=buildReadingGuide(result);

    assert.ok(guide.dayPillar.includes(result.pillars.day.hanja));
    assert.ok(guide.dayPillar.includes(result.pillars.day.stem.hanja));
    assert.ok(guide.dayPillar.includes(result.pillars.day.branch.hanja));
    assert.ok(guide.elements.includes('가장'));
    assert.ok(guide.elements.includes('길흉 점수는 아니에요'));
    assert.ok(guide.tenGods.includes('표면 십성'));
    assert.ok(guide.tenGods.includes('어느 기둥의 천간·지지'));
  }
});

test('guide stays explanatory rather than making deterministic health or wealth claims',()=>{
  for(const input of samples){
    const text=JSON.stringify(buildReadingGuide(calculateSaju(input)));
    for(const forbidden of [
      '반드시 부자','확실히 부자','질병','암에','치료해야','결혼합니다','이혼합니다',
      '아버지가 일찍','배우자가 죽','투자해야','주식을 사'
    ]){
      assert.equal(text.includes(forbidden),false,`${input.birthDate}: ${forbidden}`);
    }
  }
});
