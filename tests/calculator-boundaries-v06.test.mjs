import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {dayPillar} from '../src/engine/rules.mjs';

test('2026 Xiaohan changes month pillar at the published KST minute',()=>{
  const before=calculateSaju({birthDate:'2026-01-05',birthTime:'17:22'});
  const after=calculateSaju({birthDate:'2026-01-05',birthTime:'17:24'});
  assert.equal(before.pillars.year.hanja,'乙巳');
  assert.equal(before.pillars.month.hanja,'戊子');
  assert.equal(after.pillars.year.hanja,'乙巳');
  assert.equal(after.pillars.month.hanja,'己丑');
});

test('time unknown on Xiaohan date refuses to guess the month pillar',()=>{
  const result=calculateSaju({birthDate:'2026-01-05',birthTime:null});
  assert.equal(result.status,'needs-birth-time');
  assert.equal(result.reason,'solar-term-boundary');
});

test('Gregorian leap day is accepted and day cycle advances exactly one step',()=>{
  const leap=calculateSaju({birthDate:'2000-02-29',birthTime:'12:00'});
  assert.equal(leap.status,'ok');

  const a=dayPillar(2000,2,28).index;
  const b=dayPillar(2000,2,29).index;
  const c=dayPillar(2000,3,1).index;
  assert.equal((b-a+60)%60,1);
  assert.equal((c-b+60)%60,1);
});

test('invalid Gregorian leap day is rejected',()=>{
  assert.throws(
    ()=>calculateSaju({birthDate:'2001-02-29',birthTime:'12:00'}),
    /invalid birthDate/
  );
});

test('calculator rejects the 1988 DST spring clock gap rather than inventing an instant',()=>{
  assert.throws(
    ()=>calculateSaju({birthDate:'1988-05-08',birthTime:'02:30'}),
    /did not exist/
  );
});

test('calculator rejects the 1988 DST autumn repeated clock time rather than choosing one',()=>{
  assert.throws(
    ()=>calculateSaju({birthDate:'1988-10-09',birthTime:'02:30'}),
    /ambiguous/
  );
});

test('minute immediately outside DST anomalies resolves normally',()=>{
  const spring=calculateSaju({birthDate:'1988-05-08',birthTime:'03:30'});
  const autumn=calculateSaju({birthDate:'1988-10-09',birthTime:'03:30'});
  assert.equal(spring.status,'ok');
  assert.equal(autumn.status,'ok');
  assert.equal(spring.metadata.utcOffsetMinutes,600);
  assert.equal(autumn.metadata.utcOffsetMinutes,540);
});
