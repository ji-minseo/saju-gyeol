import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSeoulCivilTime} from '../src/engine/korea-time.mjs';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {getJieTermsForYear} from '../src/engine/solar-term-provider.mjs';
import {lunarToSolarDate,solarToLunarDate,LUNAR_SUPPORT} from '../src/engine/lunar-calendar.mjs';

test('v0.7 historical support begins at 1946',()=>{
  assert.deepEqual(LUNAR_SUPPORT,{minYear:1946,maxYear:2050,standard:'Korean lunar calendar / KASI-based table'});
  assert.equal(getJieTermsForYear(1946).length,13);
  assert.equal(calculateSaju({birthDate:'1946-01-01',birthTime:'12:00'}).status,'ok');
  assert.throws(()=>calculateSaju({birthDate:'1945-12-31',birthTime:'12:00'}),/1946\.\.2100/);
});

test('1946 lunar dates round-trip through the Korean lunar converter',()=>{
  const converted=lunarToSolarDate({year:1946,month:1,day:1});
  assert.deepEqual(solarToLunarDate(converted.solarDate),{
    year:1946,month:1,day:1,isLeapMonth:false
  });
});

test('1948 Korean DST spring gap and autumn repeat are detected',()=>{
  const skipped=resolveSeoulCivilTime({year:1948,month:6,day:1,hour:0,minute:30});
  assert.equal(skipped.status,'nonexistent');
  assert.equal(skipped.matches.length,0);

  const repeated=resolveSeoulCivilTime({year:1948,month:9,day:12,hour:23,minute:30});
  assert.equal(repeated.status,'ambiguous');
  assert.deepEqual(repeated.matches.map(x=>x.offsetMinutes),[600,540]);
});

test('1955 historical Korean DST resolves the half-hour-base offset correctly',()=>{
  const summer=resolveSeoulCivilTime({year:1955,month:6,day:1,hour:12,minute:0});
  assert.equal(summer.status,'valid');
  assert.equal(summer.matches[0].offsetMinutes,570);
});

test('1961 standard-time change from UTC+08:30 to UTC+09:00 is preserved',()=>{
  const before=resolveSeoulCivilTime({year:1961,month:8,day:9,hour:12,minute:0});
  const after=resolveSeoulCivilTime({year:1961,month:8,day:10,hour:12,minute:0});
  assert.equal(before.matches[0].offsetMinutes,510);
  assert.equal(after.matches[0].offsetMinutes,540);

  const skipped=resolveSeoulCivilTime({year:1961,month:8,day:10,hour:0,minute:15});
  assert.equal(skipped.status,'nonexistent');
});

test('old birth years still produce daeun when sex and time are known',()=>{
  const result=calculateSaju({birthDate:'1955-06-01',birthTime:'12:00',sex:'female'});
  assert.equal(result.status,'ok');
  assert.equal(result.metadata.utcOffsetMinutes,570);
  assert.equal(result.daeun.status,'ok');
});
