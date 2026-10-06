import test from 'node:test';
import assert from 'node:assert/strict';
import {lunarToSolarDate,solarToLunarDate,LUNAR_SUPPORT} from '../src/engine/lunar-calendar.mjs';

test('Korean lunar conversion support range is explicit',()=>{
  assert.deepEqual({minYear:LUNAR_SUPPORT.minYear,maxYear:LUNAR_SUPPORT.maxYear},{minYear:1970,maxYear:2050});
});

test('2026 Seollal converts to 2026-02-17',()=>{
  assert.equal(lunarToSolarDate({year:2026,month:1,day:1}).solarDate,'2026-02-17');
});

test('2025 normal and leap sixth month map to different solar dates',()=>{
  assert.equal(lunarToSolarDate({year:2025,month:6,day:1,isLeapMonth:false}).solarDate,'2025-06-25');
  assert.equal(lunarToSolarDate({year:2025,month:6,day:1,isLeapMonth:true}).solarDate,'2025-07-25');
});

test('2017 leap fifth month fixture round-trips',()=>{
  const converted=lunarToSolarDate({year:2017,month:5,day:1,isLeapMonth:true});
  assert.equal(converted.solarDate,'2017-06-24');
  assert.deepEqual(solarToLunarDate(converted.solarDate),{year:2017,month:5,day:1,isLeapMonth:true});
});

test('impossible leap month is rejected instead of silently using normal month',()=>{
  assert.throws(
    ()=>lunarToSolarDate({year:2025,month:1,day:1,isLeapMonth:true}),
    /not a leap month/
  );
});

test('invalid lunar day is rejected',()=>{
  assert.throws(()=>lunarToSolarDate({year:2026,month:1,day:31}),/invalid Korean lunar date/);
});
