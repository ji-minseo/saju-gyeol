import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju,ENGINE_VERSION} from '../src/engine/calculator.mjs';
import {resolveSeoulCivilTime} from '../src/engine/korea-time.mjs';
import {getJieTermsForYear,SOLAR_TERM_SUPPORT} from '../src/engine/solar-term-provider.mjs';
import {lunarToSolarDate,LUNAR_SUPPORT} from '../src/engine/lunar-calendar.mjs';

test('v0.8 support boundaries are explicit',()=>{
  assert.equal(ENGINE_VERSION,'0.8.0');
  assert.deepEqual(SOLAR_TERM_SUPPORT,{minYear:1912,maxYear:2100});
  assert.equal(LUNAR_SUPPORT.minYear,1912);
  assert.equal(LUNAR_SUPPORT.maxYear,2050);
});

test('1912 Korean civil time resolves with UTC+09:00',()=>{
  const resolved=resolveSeoulCivilTime({year:1912,month:1,day:1,hour:12,minute:0});
  assert.equal(resolved.status,'valid');
  assert.equal(resolved.matches[0].offsetMinutes,540);
  assert.equal(resolved.matches[0].utcIso,'1912-01-01T03:00:00.000Z');
});

test('pre-1912 Korean civil time stays closed until sub-minute historical offsets are supported',()=>{
  assert.throws(
    ()=>resolveSeoulCivilTime({year:1911,month:12,day:31,hour:12,minute:0}),
    /1912\.\.2100/
  );
});

test('historical Korea standard-time eras are preserved',()=>{
  const duringHalfHour=resolveSeoulCivilTime({year:1955,month:1,day:15,hour:12,minute:0});
  assert.equal(duringHalfHour.status,'valid');
  assert.equal(duringHalfHour.matches[0].offsetMinutes,510);

  const modernStandard=resolveSeoulCivilTime({year:1962,month:1,day:15,hour:12,minute:0});
  assert.equal(modernStandard.status,'valid');
  assert.equal(modernStandard.matches[0].offsetMinutes,540);
});

test('1912 full Saju calculation succeeds with historical Asia/Seoul resolution',()=>{
  const result=calculateSaju({birthDate:'1912-06-15',birthTime:'12:00',sex:'female'});
  assert.equal(result.status,'ok');
  assert.equal(result.metadata.utcOffsetMinutes,540);
  assert.equal(result.input.birthDate,'1912-06-15');
  assert.ok(result.pillars.year.hanja);
  assert.ok(result.pillars.month.hanja);
  assert.ok(result.pillars.day.hanja);
  assert.ok(result.pillars.hour.hanja);
});

test('1912 solar-term provider returns the full chronological Jie set',()=>{
  const terms=getJieTermsForYear(1912);
  assert.equal(terms.length,13);
  assert.equal(terms.find(x=>x.name==='입춘').monthIndex,0);
  for(let i=1;i<terms.length;i++) assert.ok(terms[i].epochMs>terms[i-1].epochMs);
});

test('1912 Korean lunar input converts and feeds a supported solar year',()=>{
  const converted=lunarToSolarDate({year:1912,month:1,day:1});
  assert.match(converted.solarDate,/^1912-/);
  const result=calculateSaju({birthDate:converted.solarDate,birthTime:'12:00'});
  assert.equal(result.status,'ok');
});

test('1911 inputs are rejected at the public engine boundary',()=>{
  assert.throws(
    ()=>calculateSaju({birthDate:'1911-12-31',birthTime:'12:00'}),
    /1912\.\.2100/
  );
  assert.throws(
    ()=>lunarToSolarDate({year:1911,month:1,day:1}),
    /1912\.\.2050/
  );
});
