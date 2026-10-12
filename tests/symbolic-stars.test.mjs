import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {SYMBOLIC_STAR_POLICY} from '../src/engine/symbolic-stars.mjs';

const starBy=(result,label)=>result.symbolicStars.stars.find(star=>star.label===label);

test('symbolic-star catalog is complete within the declared fixed scope',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  assert.equal(SYMBOLIC_STAR_POLICY.commonCount,24);
  assert.equal(SYMBOLIC_STAR_POLICY.twelveStarCount,12);
  assert.equal(result.symbolicStars.stars.length,24);
  assert.equal(result.symbolicStars.twelveCatalog.length,12);
  assert.equal(new Set(result.symbolicStars.stars.map(x=>x.label)).size,24);
  assert.equal(new Set(result.symbolicStars.twelveCatalog).size,12);
});

test('1995-10-13 reference chart exposes representative stars at actual positions',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});

  const tian=starBy(result,'천을귀인');
  assert.equal(tian.present,true);
  assert.ok(tian.hits.some(hit=>hit.label==='년지'&&hit.hanja==='亥'));

  assert.equal(starBy(result,'문창귀인').present,false);
  assert.equal(starBy(result,'도화살').present,false);

  const horse=starBy(result,'역마살');
  assert.equal(horse.present,true);
  assert.ok(horse.hits.some(hit=>hit.label==='년지'&&hit.hanja==='亥'));
  assert.ok(horse.hits.some(hit=>hit.label==='시지'&&hit.hanja==='巳'));

  const canopy=starBy(result,'화개살');
  assert.equal(canopy.present,true);
  assert.ok(canopy.hits.some(hit=>hit.label==='일지'&&hit.hanja==='丑'));

  const whiteTiger=starBy(result,'백호살');
  assert.equal(whiteTiger.present,true);
  assert.ok(whiteTiger.hits.some(hit=>hit.label==='일주'&&hit.hanja==='丁丑'));
});

test('month and pair based stars use their own calculation rules',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});

  assert.equal(starBy(result,'천덕귀인').present,true);
  assert.equal(starBy(result,'월덕귀인').present,true);
  assert.equal(starBy(result,'귀문관살').present,true);
  assert.equal(starBy(result,'천라지망살').present,true);
  assert.equal(starBy(result,'원진살').present,true);

  assert.match(starBy(result,'천덕귀인').basis,/태어난 달/);
  assert.match(starBy(result,'귀문관살').basis,/지지 두 글자 조합/);
});

test('twelve stars assign every visible branch under both year and day anchors',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  assert.equal(result.symbolicStars.twelveStars.length,2);
  for(const anchor of result.symbolicStars.twelveStars){
    assert.equal(anchor.rows.length,4);
    assert.equal(new Set(anchor.rows.map(row=>row.label)).size,4);
    assert.ok(anchor.rows.every(row=>result.symbolicStars.twelveCatalog.includes(row.label)));
  }
  const yearAnchor=result.symbolicStars.twelveStars.find(x=>x.anchor==='year');
  const dayAnchor=result.symbolicStars.twelveStars.find(x=>x.anchor==='day');
  assert.equal(yearAnchor.anchorBranch,'亥');
  assert.equal(dayAnchor.anchorBranch,'丑');
});

test('unknown birth time omits hour-position matches instead of inventing them',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:null,sex:'female'});
  assert.equal(result.symbolicStars.missingHour,true);
  assert.equal(result.symbolicStars.stars.some(star=>star.hits.some(hit=>hit.label==='시지'||hit.label==='시주'||hit.label==='시간')),false);
  assert.ok(result.symbolicStars.twelveStars.every(anchor=>anchor.rows.length===3));
});

test('symbolic stars are supporting symbols, not deterministic predictions',()=>{
  assert.equal(SYMBOLIC_STAR_POLICY.deterministicPrediction,false);
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  const text=JSON.stringify(result.symbolicStars);
  for(const forbidden of ['반드시 결혼','무조건 인기','반드시 귀인이 나타난다','해외로 이사하게 된다','반드시 사고가 난다','질병이 생긴다']){
    assert.equal(text.includes(forbidden),false,forbidden);
  }
});
