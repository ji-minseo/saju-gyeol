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
  assert.deepEqual(result.tenGods.visibleBranches,{
    year:'편재',
    month:'편인',
    day:'편관',
    hour:'정재'
  });
  assert.deepEqual(
    result.hiddenStems.pillars.day.map(layer=>layer.stem?.hanja??null),
    ['癸','辛','己']
  );
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

test('Li Chun changes year and month pillars across the astronomical boundary',()=>{
  const before=calculateSaju({birthDate:'2026-02-04',birthTime:'05:01'});
  const after=calculateSaju({birthDate:'2026-02-04',birthTime:'05:03'});
  assert.equal(before.pillars.year.hanja,'乙巳');
  assert.equal(before.pillars.month.hanja,'己丑');
  assert.equal(after.pillars.year.hanja,'丙午');
  assert.equal(after.pillars.month.hanja,'庚寅');
});

test('2026 January dates before Xiaohan use the 2025 Dashue carry-in boundary',()=>{
  const result=calculateSaju({birthDate:'2026-01-01',birthTime:'12:00'});
  assert.equal(result.pillars.year.hanja,'乙巳');
  assert.equal(result.pillars.month.hanja,'戊子');
});

test('Hanlu changes month pillar across the astronomical boundary',()=>{
  const before=calculateSaju({birthDate:'2026-10-08',birthTime:'15:28'});
  const after=calculateSaju({birthDate:'2026-10-08',birthTime:'15:31'});
  assert.equal(before.pillars.month.hanja,'丁酉');
  assert.equal(after.pillars.month.hanja,'戊戌');
});

test('provider supports ordinary dates across the 1912..2100 service range',()=>{
  for(const birthDate of ['1912-06-15','1946-06-15','1970-06-15','1996-04-17','2008-03-22','2050-11-03','2100-01-20']){
    const result=calculateSaju({birthDate,birthTime:'12:00'});
    assert.equal(result.status,'ok');
    assert.ok(result.pillars.year.hanja);
    assert.ok(result.pillars.month.hanja);
    assert.ok(result.pillars.day.hanja);
    assert.ok(result.pillars.hour.hanja);
  }
});

test('out-of-range years fail loudly rather than approximate',()=>{
  assert.throws(
    ()=>calculateSaju({birthDate:'1911-12-31',birthTime:'10:10'}),
    /supports 1912\.\.2100/
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
