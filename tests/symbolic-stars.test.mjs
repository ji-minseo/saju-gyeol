import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {calculateSymbolicStars,SYMBOLIC_STAR_POLICY} from '../src/engine/symbolic-stars.mjs';
import {BRANCHES} from '../src/engine/rules.mjs';

const starBy=(result,label)=>result.symbolicStars.stars.find(star=>star.label===label);

test('1995-10-13 reference chart exposes common symbolic stars at actual positions',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});

  const tian=starBy(result,'천을귀인');
  assert.equal(tian.present,true);
  assert.ok(tian.hits.some(hit=>hit.label==='년지'&&hit.hanja==='亥'));

  const wen=starBy(result,'문창귀인');
  assert.equal(wen.present,false);

  const peach=starBy(result,'도화');
  assert.equal(peach.present,false);

  const horse=starBy(result,'역마');
  assert.equal(horse.present,true);
  assert.ok(horse.hits.some(hit=>hit.label==='년지'&&hit.hanja==='亥'));
  assert.ok(horse.hits.some(hit=>hit.label==='시지'&&hit.hanja==='巳'));

  const canopy=starBy(result,'화개');
  assert.equal(canopy.present,true);
  assert.ok(canopy.hits.some(hit=>hit.label==='일지'&&hit.hanja==='丑'));
});

test('day-stem nobleman tables follow the declared fixed mapping',()=>{
  const pillars={
    year:{branch:BRANCHES[1]},
    month:{branch:BRANCHES[7]},
    day:{branch:BRANCHES[4]},
    hour:null
  };
  const result=calculateSymbolicStars({dayStemIndex:0,pillars}); // 甲 -> 丑·未
  const tian=result.stars.find(star=>star.label==='천을귀인');
  assert.deepEqual(tian.targets,['丑','未']);
  assert.equal(tian.hits.length,2);
});

test('branch-group stars use both year and day lower-letter anchors',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  const horse=starBy(result,'역마');
  assert.ok(horse.targetSources.some(x=>x.source.includes('태어난 해의 아래 글자 亥')&&x.target==='巳'));
  assert.ok(horse.targetSources.some(x=>x.source.includes('태어난 날의 아래 글자 丑')&&x.target==='亥'));
});

test('unknown birth time omits hour-position matches instead of inventing them',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:null,sex:'female'});
  assert.equal(result.symbolicStars.missingHour,true);
  assert.equal(result.symbolicStars.stars.some(star=>star.hits.some(hit=>hit.label==='시지')),false);
});

test('symbolic stars are explicitly supporting symbols, not deterministic predictions',()=>{
  assert.equal(SYMBOLIC_STAR_POLICY.deterministicPrediction,false);
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  const text=JSON.stringify(result.symbolicStars);
  for(const forbidden of ['반드시 결혼','무조건 인기','귀인이 나타난다','해외로 이사한다','사고가 난다']){
    assert.equal(text.includes(forbidden),false,forbidden);
  }
});
