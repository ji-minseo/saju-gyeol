import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildCompatibilityV1} from '../src/content/compatibility-v1.mjs';

const A={birthDate:'1995-10-13',birthTime:'10:10'};
const B={birthDate:'1993-04-22',birthTime:'18:40'};

test('compatibility v1 returns structured two-way reading without a score',()=>{
  const a=calculateSaju(A);
  const b=calculateSaju(B);
  const reading=buildCompatibilityV1(a,b,{aLabel:'A',bLabel:'B'});

  assert.equal(reading.methodId,'compatibility-v1-structural');
  assert.equal(reading.confidence,'medium');

  for(const key of ['overview','aToB','bToA','rhythm','friction','guide']){
    assert.ok(reading[key]);
    assert.ok(reading[key].title.length>=8,key);
    assert.ok(reading[key].body.length>=30,key);
  }

  assert.ok(reading.aToB.evidence.some(x=>x.startsWith('A 기준 B 일간은 ')));
  assert.ok(reading.bToA.evidence.some(x=>x.startsWith('B 기준 A 일간은 ')));
  assert.equal(JSON.stringify(reading).includes('점수'),false);
  assert.equal(JSON.stringify(reading).includes('100점'),false);
});

test('compatibility v1 keeps directional readings independent',()=>{
  const a=calculateSaju({birthDate:'2000-05-20',birthTime:'10:00'});
  const b=calculateSaju({birthDate:'2001-06-12',birthTime:'14:30'});
  const reading=buildCompatibilityV1(a,b,{aLabel:'첫째',bLabel:'둘째'});

  assert.notEqual(reading.aToB.evidence[0],reading.bToA.evidence[0]);
  assert.match(reading.aToB.evidence[0],/^첫째 기준 둘째 일간은 /);
  assert.match(reading.bToA.evidence[0],/^둘째 기준 첫째 일간은 /);
});

test('compatibility v1 avoids deterministic relationship claims',()=>{
  const samples=[
    [
      {birthDate:'1988-09-19',birthTime:'16:40'},
      {birthDate:'1990-08-21',birthTime:'11:20'}
    ],
    [
      {birthDate:'2000-05-20',birthTime:'10:00'},
      {birthDate:'2000-10-20',birthTime:'10:00'}
    ]
  ];

  for(const [aInput,bInput] of samples){
    const text=JSON.stringify(buildCompatibilityV1(
      calculateSaju(aInput),
      calculateSaju(bInput)
    ));
    for(const forbidden of ['천생연분','헤어집니다','결혼합니다','무조건','반드시 잘 맞','최악의 궁합']){
      assert.equal(text.includes(forbidden),false,forbidden);
    }
  }
});

test('compatibility works with unknown birth time when both dates are not solar-term boundaries',()=>{
  const a=calculateSaju({birthDate:'1995-10-13',birthTime:null});
  const b=calculateSaju({birthDate:'1993-04-22',birthTime:null});
  assert.equal(a.status,'partial');
  assert.equal(b.status,'partial');
  const reading=buildCompatibilityV1(a,b);
  assert.ok(reading.overview.title);
});
