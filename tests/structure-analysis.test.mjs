import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {STRUCTURE_ANALYSIS_POLICY} from '../src/engine/structure-analysis.mjs';

test('1995-10-13 10:13 reference chart gets transparent base structure',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  assert.equal(result.pillars.year.hanja,'乙亥');
  assert.equal(result.pillars.month.hanja,'丙戌');
  assert.equal(result.pillars.day.hanja,'丁丑');
  assert.equal(result.pillars.hour.hanja,'乙巳');

  const a=result.structuralAnalysis;
  assert.equal(a.pattern.label,'상관격');
  assert.equal(a.pattern.monthMainTenGod,'상관');
  assert.equal(a.strength.label,'신강');
  assert.equal(a.usefulGod.status,'candidate');
  assert.equal(a.usefulGod.primary.label,'토');
  assert.ok(a.strength.evidence.some(x=>x.includes('월령')));
  assert.ok(a.strength.roots.length>=1);
});

test('structure analysis declares its school-sensitive limits',()=>{
  const result=calculateSaju({birthDate:'1988-09-19',birthTime:'16:40',sex:'male'});
  const a=result.structuralAnalysis;
  assert.equal(a.policy.climateUsefulGod,false);
  assert.equal(a.policy.specialPatternOverride,false);
  assert.equal(a.policy.transformationOverride,false);
  assert.match(a.pattern.caveat,/특수격|합화/);
  assert.match(a.usefulGod.caveat,/조후용신/);
});

test('strength classification remains finite and explainable across fixtures',()=>{
  const fixtures=[
    ['1970-01-01','12:00','male'],
    ['1988-09-19','16:40','male'],
    ['1995-10-13','10:13','female'],
    ['2000-05-20','10:00','male'],
    ['2026-10-12','09:30','female']
  ];
  const allowed=new Set(['very-strong','strong','balanced','weak','very-weak']);
  for(const [birthDate,birthTime,sex] of fixtures){
    const a=calculateSaju({birthDate,birthTime,sex}).structuralAnalysis;
    assert.ok(Number.isFinite(a.strength.score),birthDate);
    assert.ok(allowed.has(a.strength.grade),birthDate);
    assert.equal(a.strength.evidence.length,3,birthDate);
    assert.ok(a.pattern.label.length>=3,birthDate);
  }
});

test('balancing candidate does not pretend to include unimplemented methods',()=>{
  assert.equal(STRUCTURE_ANALYSIS_POLICY.usefulGodMethod,'balancing-candidate');
  assert.equal(STRUCTURE_ANALYSIS_POLICY.climateUsefulGod,false);
});
