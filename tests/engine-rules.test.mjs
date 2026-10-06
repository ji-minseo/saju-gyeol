import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sexagenary,yearPillar,monthPillar,dayPillar,effectiveDayDate,
  hourBranchIndex,hourPillar,tenGod,surfaceElementCounts
} from '../src/engine/rules.mjs';

test('sexagenary cycle anchors are stable',()=>{
  assert.equal(sexagenary(0).hanja,'甲子');
  assert.equal(sexagenary(59).hanja,'癸亥');
  assert.equal(sexagenary(60).hanja,'甲子');
});

test('2026 changes year pillar at Li Chun policy boundary',()=>{
  assert.equal(yearPillar(2026,{afterLiChun:false}).hanja,'乙巳');
  assert.equal(yearPillar(2026,{afterLiChun:true}).hanja,'丙午');
});

test('2026 Bing year uses Ding-You before Hanlu and Wu-Xu after Hanlu',()=>{
  const bingStem=yearPillar(2026,{afterLiChun:true}).stemIndex;
  assert.equal(monthPillar(bingStem,7).hanja,'丁酉');
  assert.equal(monthPillar(bingStem,8).hanja,'戊戌');
});

test('day pillar matches KASI October 2026 records',()=>{
  assert.equal(dayPillar(2026,10,1).hanja,'戊申');
  assert.equal(dayPillar(2026,10,6).hanja,'癸丑');
  assert.equal(dayPillar(2026,10,7).hanja,'甲寅');
  assert.equal(dayPillar(2026,10,31).hanja,'戊寅');
});

test('23:00 boundary convention is explicit rather than hidden',()=>{
  assert.deepEqual(
    effectiveDayDate({year:2026,month:10,6,hour:23},{dayBoundary:'midnight'}),
    {year:2026,month:10,day:6}
  );
  assert.deepEqual(
    effectiveDayDate({year:2026,month:10,6,hour:23},{dayBoundary:'zi-start'}),
    {year:2026,month:10,day:7}
  );
});

test('hour branch mapping starts Zi at 23:00',()=>{
  assert.equal(hourBranchIndex(22,59),11);
  assert.equal(hourBranchIndex(23,0),0);
  assert.equal(hourBranchIndex(0,59),0);
  assert.equal(hourBranchIndex(1,0),1);
  assert.equal(hourBranchIndex(10,0),5);
});

test('Gui-Chou day at Si hour gives Ding-Si',()=>{
  const day=dayPillar(2026,10,6);
  assert.equal(day.hanja,'癸丑');
  assert.equal(hourPillar(day.stemIndex,hourBranchIndex(10,0)).hanja,'丁巳');
});

test('ten gods follow element relation and polarity',()=>{
  const jia=0;
  assert.equal(tenGod(jia,0),'비견');
  assert.equal(tenGod(jia,1),'겁재');
  assert.equal(tenGod(jia,2),'식신');
  assert.equal(tenGod(jia,3),'상관');
  assert.equal(tenGod(jia,4),'편재');
  assert.equal(tenGod(jia,5),'정재');
  assert.equal(tenGod(jia,6),'편관');
  assert.equal(tenGod(jia,7),'정관');
  assert.equal(tenGod(jia,8),'편인');
  assert.equal(tenGod(jia,9),'정인');
});

test('surface element count is exactly eight visible characters for four pillars',()=>{
  const pillars=[
    yearPillar(2026,{afterLiChun:true}),
    monthPillar(2,7),
    dayPillar(2026,10,6),
    hourPillar(9,hourBranchIndex(10,0))
  ];
  const counts=surfaceElementCounts(pillars);
  assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),8);
});
