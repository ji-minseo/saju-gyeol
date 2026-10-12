import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildReadingV2} from '../src/content/reading-v2.mjs';
import {buildReadingV3} from '../src/content/reading-v3.mjs';

const samples=[
  {birthDate:'1988-09-19',birthTime:'16:40',sex:'male'},
  {birthDate:'1995-10-13',birthTime:'10:10',sex:'female'},
  {birthDate:'2000-05-20',birthTime:'10:00',sex:'male'},
  {birthDate:'2001-06-12',birthTime:'14:30',sex:'female'}
];

test('reading v3 preserves core reading and adds a substantial deep profile',()=>{
  for(const input of samples){
    const result=calculateSaju(input);
    const v2=buildReadingV2(result);
    const v3=buildReadingV3(result);

    for(const key of ['temperament','relationship','career','money']){
      assert.deepEqual(v3[key],v2[key],`${input.birthDate} should preserve ${key}`);
    }

    assert.ok(v3.deep.portrait.title.length>=12);
    assert.ok(v3.deep.portrait.body.length>=100);
    assert.equal(v3.deep.strengths.methodId,'reading-v3-expanded');
    assert.equal(v3.deep.overdrive.methodId,'reading-v3-expanded');

    for(const key of ['decision','stress','relationship','work','money']){
      const section=v3.deep.patterns[key];
      assert.ok(section.title.length>=8,key);
      assert.ok(section.body.length>=45,key);
      assert.ok(section.evidence.length>=1,key);
      assert.equal(section.methodId,'reading-v3-expanded');
      assert.equal(section.confidence,'medium');
    }

    assert.equal(v3.deep.tenGodPositions.length,4);
    assert.deepEqual(v3.deep.tenGodPositions.map(x=>x.key),['year','month','day','hour']);
    assert.ok(v3.deep.tenGodPositions.every(x=>x.body.length>=55));
  }
});

test('reading v3 day portrait exposes actual day pillar and day master evidence',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:10',sex:'female'});
  const reading=buildReadingV3(result);

  assert.ok(reading.deep.portrait.evidence.includes(`일주 ${result.pillars.day.hanja}`));
  assert.ok(reading.deep.portrait.evidence.includes(`일간 ${result.dayMaster.hanja}`));
  assert.ok(reading.deep.portrait.evidence.includes(`일지 ${result.pillars.day.branch.hanja}`));
});

test('reading v3 omits only hour-position story when birth time is unknown',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:null,sex:'female'});
  assert.equal(result.status,'partial');
  const reading=buildReadingV3(result);

  assert.deepEqual(reading.deep.tenGodPositions.map(x=>x.key),['year','month','day']);
  assert.ok(reading.deep.portrait.title);
  assert.ok(reading.deep.patterns.work.body);
});

test('reading v3 avoids deterministic, medical and investment instructions',()=>{
  for(const input of samples){
    const text=JSON.stringify(buildReadingV3(calculateSaju(input)));
    for(const forbidden of [
      '무조건','반드시 부자','확실히 부자','결혼합니다','이혼합니다',
      '질병','암에','폐가','대장이','치료','약을 먹',
      '투자해야','주식을 사','코인을 사','수익을 보장'
    ]){
      assert.equal(text.includes(forbidden),false,`${input.birthDate}: ${forbidden}`);
    }
  }
});

test('reading v3 position stories identify their actual pillar and visible ten gods',()=>{
  const result=calculateSaju({birthDate:'2000-05-20',birthTime:'10:00',sex:'male'});
  const reading=buildReadingV3(result);

  for(const item of reading.deep.tenGodPositions){
    assert.ok(item.evidence.includes(`${item.label} ${result.pillars[item.key].hanja}`));
    assert.ok(item.evidence.some(x=>x.startsWith('천간 ')));
    assert.ok(item.evidence.some(x=>x.startsWith('지지 ')));
  }
});
