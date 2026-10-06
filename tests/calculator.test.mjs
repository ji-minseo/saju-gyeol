import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju,ENGINE_VERSION} from '../src/engine/calculator.mjs';

test('2026-10-06 10:10 KST composes four pillars into one result',()=>{
  const result=calculateSaju({birthDate:'2026-10-06',birthTime:'10:10'});
  assert.equal(result.status,'ok');
  assert.equal(result.pillars.year.hanja,'丙午');
  assert.equal(result.pillars.month.hanja,'丁酉');
  assert.equal(result.pillars.day.hanja,'癸丑');
  assert.equal(result.pillars.hour.hanja,'丁巳');
  assert.equal(result.dayMaster.hanja,'癸');
  assert.equal(result.tenGods.visibleStems.year,'정재');
  assert.equal(result.tenGods.visibleStems.month,'편재');
  assert.equal(result.tenGods.visibleStems.hour,'편재');
  assert.deepEqual(result.fiveElements.counts,{
    wood:0,fire:5,earth:1,metal:1,water:1
  });
  assert.equal(result.fiveElements.characterCount,8);
  assert.equal(result.metadata.resolvedInstant,'2026-10-06T01:10:00.000Z');
  assert.equal(result.metadata.engineVersion,ENGINE_VERSION);
});

test('time unknown returns a six-character partial chart away from a term boundary',()=>{
  const result=calculateSaju({birthDate:'2026-10-06',birthTime:null});
  assert.equal(result.status,'partial');
  assert.equal(result.pillars.year.hanja,'丙午');
  assert.equal(result.pillars.month.hanja,'丁酉');
  assert.equal(result.pillars.day.hanja,'癸丑');
  assert.equal(result.pillars.hour,null);
  assert.equal(result.fiveElements.characterCount,6);
  assert.equal(result.tenGods.visibleStems.hour,null);
});

test('time unknown on Li Chun date refuses to guess year/month pillar',()=>{
  const result=calculateSaju({birthDate:'2026-02-04',birthTime:null});
  assert.equal(result.status,'needs-birth-time');
  assert.equal(result.reason,'solar-term-boundary');
});

test('exact Li Chun minute changes both year and month pillars',()=>{
  const before=calculateSaju({birthDate:'2026-02-04',birthTime:'05:01'});
  const exact=calculateSaju({birthDate:'2026-02-04',birthTime:'05:02'});
  assert.equal(before.pillars.year.hanja,'乙巳');
  assert.equal(before.pillars.month.hanja,'己丑');
  assert.equal(exact.pillars.year.hanja,'丙午');
  assert.equal(exact.pillars.month.hanja,'庚寅');
});

test('2026 January dates before Xiaohan use the 2025 Dashue carry-in boundary',()=>{
  const result=calculateSaju({birthDate:'2026-01-01',birthTime:'12:00'});
  assert.equal(result.pillars.year.hanja,'乙巳');
  assert.equal(result.pillars.month.hanja,'戊子');
});

test('exact Hanlu minute changes month pillar',()=>{
  const before=calculateSaju({birthDate:'2026-10-08',birthTime:'15:28'});
  const exact=calculateSaju({birthDate:'2026-10-08',birthTime:'15:29'});
  assert.equal(before.pillars.month.hanja,'丁酉');
  assert.equal(exact.pillars.month.hanja,'戊戌');
});

test('unsupported solar-term years fail loudly rather than approximate',()=>{
  assert.throws(
    ()=>calculateSaju({birthDate:'1995-10-13',birthTime:'10:10'}),
    /provider for 1995 is not installed/
  );
});

test('zi-start policy changes day pillar and therefore hour stem at 23xx',()=>{
  const midnight=calculateSaju(
    {birthDate:'2026-10-06',birthTime:'23:10'},
    {dayBoundary:'midnight'}
  );
  const ziStart=calculateSaju(
    {birthDate:'2026-10-06',birthTime:'23:10'},
    {dayBoundary:'zi-start'}
  );
  assert.equal(midnight.pillars.day.hanja,'癸丑');
  assert.equal(ziStart.pillars.day.hanja,'甲寅');
  assert.notEqual(midnight.pillars.hour.hanja,ziStart.pillars.hour.hanja);
});
