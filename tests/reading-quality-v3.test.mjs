import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildReadingV2} from '../src/content/reading-v2.mjs';
import {buildCurrentFlow} from '../src/content/flow-v1.mjs';

const samples=[
  {birthDate:'1980-02-11',birthTime:'06:40',sex:'female'},
  {birthDate:'1988-09-19',birthTime:'16:40',sex:'male'},
  {birthDate:'1990-08-21',birthTime:'11:20',sex:'female'},
  {birthDate:'2000-05-20',birthTime:'10:00',sex:'male'},
  {birthDate:'2001-06-12',birthTime:'14:30',sex:'female'},
  {birthDate:'2012-12-03',birthTime:'22:15',sex:'male'}
];

const sentenceList=text=>(String(text).match(/[^.!?]+[.!?]?/g)||[])
  .map(x=>x.trim())
  .filter(x=>x.length>=12);

test('reading V3 avoids duplicate body sentences and repeated situations across varied charts',()=>{
  for(const input of samples){
    const reading=buildReadingV2(calculateSaju(input));
    for(const [key,section] of Object.entries(reading)){
      const sentences=sentenceList(section.body);
      assert.equal(
        new Set(sentences).size,
        sentences.length,
        `${input.birthDate} ${key} has duplicate body sentences`
      );
      assert.equal(
        new Set(section.situations).size,
        section.situations.length,
        `${input.birthDate} ${key} has duplicate situations`
      );
    }

    const all=JSON.stringify(reading);
    assert.equal(all.includes('반복되어 한 가지 방식만 쓰기보다'),false,input.birthDate);
  }
});

test('flow V3 keeps visible guidance unique on the same result screen',()=>{
  for(const input of samples){
    const flow=buildCurrentFlow(calculateSaju(input),{today:'2026-10-06'});
    const guides=[
      flow.daeun.status==='active'?flow.daeun.guide:null,
      ...flow.annuals.map(item=>item.guide)
    ].filter(Boolean);
    assert.equal(
      new Set(guides).size,
      guides.length,
      `${input.birthDate} repeats a flow guide`
    );
  }
});

test('2028 flow exposes all distinct 巳申 relations instead of dropping lower-priority ones',()=>{
  const result=calculateSaju({birthDate:'2000-05-20',birthTime:'10:00',sex:'male'});
  const flow=buildCurrentFlow(result,{today:'2026-10-06'});
  const annual2028=flow.annuals.find(item=>item.year===2028);
  assert.ok(annual2028);
  assert.ok(annual2028.evidence.some(x=>x.startsWith('형 ')));
  assert.ok(annual2028.evidence.some(x=>x.startsWith('육합 ')));
  assert.ok(annual2028.evidence.some(x=>x.startsWith('파 ')));
  assert.equal(new Set(annual2028.evidence).size,annual2028.evidence.length);
});

test('2027 flow preserves 未戌 punishment when natal chart contains 戌',()=>{
  const result=calculateSaju({birthDate:'2000-10-20',birthTime:'10:00',sex:'female'});
  const flow=buildCurrentFlow(result,{today:'2026-10-06'});
  const annual2027=flow.annuals.find(item=>item.year===2027);
  assert.ok(annual2027);
  assert.ok(annual2027.evidence.some(x=>x==='형 未·戌'||x==='형 戌·未'));
});

test('daeun detail timeline uses month-precision start ages and reading title seam guards',async()=>{
  const app=await readFile('src/browser/app.mjs','utf8');
  assert.match(app,/formatAgeMonthsLabel\(cycle\.startAgeMonths\)/);
  assert.doesNotMatch(app,/cycle\.startAge}세/);
  assert.match(app,/relationship:\/\^관계\//);
  assert.match(app,/money:\/\^돈\//);
});

test('methodology explicitly documents that half-harmony and directional harmony are not auto-judged',async()=>{
  const method=await readFile('site/methodology/index.html','utf8');
  assert.match(method,/반합·방합은 현재 자동 판정하지 않습니다/);
  assert.match(method,/한 지지에 여러 관계가 동시에 성립하면 모두 표시합니다/);
});
