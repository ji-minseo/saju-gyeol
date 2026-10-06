import test from 'node:test';
import assert from 'node:assert/strict';
import {lunarToSolarDate,solarToLunarDate,LUNAR_SUPPORT} from '../src/engine/lunar-calendar.mjs';

test('Korean lunar conversion support range is explicit',()=>{
  assert.deepEqual({minYear:LUNAR_SUPPORT.minYear,maxYear:LUNAR_SUPPORT.maxYear},{minYear:1912,maxYear:2050});
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


test('KASI 2026 published lunar month starts and iljin match all twelve months',()=>{
  const fixtures=[
    [1,'2026-02-17','壬戌'],[2,'2026-03-19','壬辰'],[3,'2026-04-17','辛酉'],
    [4,'2026-05-17','辛卯'],[5,'2026-06-15','庚申'],[6,'2026-07-14','己丑'],
    [7,'2026-08-13','己未'],[8,'2026-09-11','戊子'],[9,'2026-10-11','戊午'],
    [10,'2026-11-09','丁亥'],[11,'2026-12-09','丁巳'],[12,'2027-01-08','丁亥']
  ];
  for(const [month,solarDate] of fixtures){
    assert.equal(lunarToSolarDate({year:2026,month,day:1}).solarDate,solarDate,`2026 lunar month ${month}`);
  }
});

test('KASI 2027 published lunar month starts match all twelve months',()=>{
  const fixtures=[
    [1,'2027-02-07'],[2,'2027-03-08'],[3,'2027-04-07'],[4,'2027-05-06'],
    [5,'2027-06-05'],[6,'2027-07-04'],[7,'2027-08-02'],[8,'2027-09-01'],
    [9,'2027-09-30'],[10,'2027-10-29'],[11,'2027-11-28'],[12,'2027-12-28']
  ];
  for(const [month,solarDate] of fixtures){
    assert.equal(lunarToSolarDate({year:2027,month,day:1}).solarDate,solarDate,`2027 lunar month ${month}`);
  }
});

test('KASI 2028 published lunar month starts including leap fifth month match',()=>{
  const fixtures=[
    [1,false,'2028-01-27'],[2,false,'2028-02-25'],[3,false,'2028-03-26'],
    [4,false,'2028-04-25'],[5,false,'2028-05-24'],[5,true,'2028-06-23'],
    [6,false,'2028-07-22'],[7,false,'2028-08-20'],[8,false,'2028-09-19'],
    [9,false,'2028-10-18'],[10,false,'2028-11-16'],[11,false,'2028-12-16'],
    [12,false,'2029-01-15']
  ];
  for(const [month,isLeapMonth,solarDate] of fixtures){
    assert.equal(lunarToSolarDate({year:2028,month,day:1,isLeapMonth}).solarDate,solarDate,`2028 lunar month ${month} ${isLeapMonth?'leap':''}`);
  }
});


test('KASI 2017 official almanac lunar month starts including leap fifth month match',()=>{
  const fixtures=[
    [1,false,'2017-01-28'],[2,false,'2017-02-26'],[3,false,'2017-03-28'],
    [4,false,'2017-04-26'],[5,false,'2017-05-26'],[5,true,'2017-06-24'],
    [6,false,'2017-07-23'],[7,false,'2017-08-22'],[8,false,'2017-09-20'],
    [9,false,'2017-10-20'],[10,false,'2017-11-18']
  ];
  for(const [month,isLeapMonth,solarDate] of fixtures){
    assert.equal(lunarToSolarDate({year:2017,month,day:1,isLeapMonth}).solarDate,solarDate,`2017 lunar month ${month} ${isLeapMonth?'leap':''}`);
  }
});
