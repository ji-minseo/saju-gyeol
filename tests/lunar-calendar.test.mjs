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


test('KASI Korea-specific lunar New Year fixtures that can differ from China',()=>{
  const fixtures=[
    [1988,'1988-02-18'],
    [1997,'1997-02-08'],
    [2027,'2027-02-07'],
    [2028,'2028-01-27']
  ];
  for(const [year,solarDate] of fixtures){
    assert.equal(
      lunarToSolarDate({year,month:1,day:1}).solarDate,
      solarDate,
      `Korean lunar New Year ${year}`
    );
  }
});

test('KASI 2000 official lunar month starts match all twelve published month starts',()=>{
  const fixtures=[
    [1,'2000-02-05'],[2,'2000-03-06'],[3,'2000-04-05'],[4,'2000-05-04'],
    [5,'2000-06-02'],[6,'2000-07-02'],[7,'2000-07-31'],[8,'2000-08-29'],
    [9,'2000-09-28'],[10,'2000-10-27'],[11,'2000-11-26'],[12,'2000-12-26']
  ];
  for(const [month,solarDate] of fixtures){
    assert.equal(lunarToSolarDate({year:2000,month,day:1}).solarDate,solarDate,`2000 lunar month ${month}`);
  }
});

test('KASI 2001 official leap-fourth-month fixture matches',()=>{
  assert.equal(lunarToSolarDate({year:2001,month:4,day:1,isLeapMonth:false}).solarDate,'2001-04-24');
  assert.equal(lunarToSolarDate({year:2001,month:4,day:1,isLeapMonth:true}).solarDate,'2001-05-23');
});
