import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sexagenary,yearPillar,monthPillar,dayPillar,effectiveDayDate,
  hourBranchIndex,hourPillar,tenGod,surfaceElementCounts
} from '../src/engine/rules.mjs';
import {
  offsetMinutesAt,resolveSeoulCivilTime
} from '../src/engine/korea-time.mjs';
import {
  JIE_2026,monthIndexAtInstant,liChunReachedAt
} from '../src/engine/data/solar-terms-2026.mjs';

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
    effectiveDayDate({year:2026,month:10,day:6,hour:23},{dayBoundary:'midnight'}),
    {year:2026,month:10,day:6}
  );
  assert.deepEqual(
    effectiveDayDate({year:2026,month:10,day:6,hour:23},{dayBoundary:'zi-start'}),
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

test('Asia/Seoul historical civil offsets come from the runtime IANA tz database',()=>{
  assert.equal(offsetMinutesAt(Date.parse('1965-01-15T00:00:00Z')),510);
  assert.equal(offsetMinutesAt(Date.parse('1970-01-15T00:00:00Z')),540);
  assert.equal(offsetMinutesAt(Date.parse('1988-07-01T00:00:00Z')),600);
  assert.equal(offsetMinutesAt(Date.parse('1988-12-01T00:00:00Z')),540);
});

test('a normal modern Seoul civil time resolves to one instant',()=>{
  const resolved=resolveSeoulCivilTime({year:2026,month:10,day:6,hour:10,minute:10});
  assert.equal(resolved.status,'valid');
  assert.equal(resolved.matches.length,1);
  assert.equal(resolved.matches[0].offsetMinutes,540);
  assert.equal(resolved.matches[0].utcIso,'2026-10-06T01:10:00.000Z');
});

test('KASI 2026 Li Chun boundary changes at the published minute',()=>{
  const before=Date.parse('2026-02-04T05:01:00+09:00');
  const exact=Date.parse('2026-02-04T05:02:00+09:00');
  assert.equal(monthIndexAtInstant(before,JIE_2026),11);
  assert.equal(monthIndexAtInstant(exact,JIE_2026),0);
  assert.equal(liChunReachedAt(before,JIE_2026),false);
  assert.equal(liChunReachedAt(exact,JIE_2026),true);
});

test('KASI 2026 Hanlu boundary changes You month to Xu month at 15:29 KST',()=>{
  assert.equal(monthIndexAtInstant(Date.parse('2026-10-08T15:28:00+09:00'),JIE_2026),7);
  assert.equal(monthIndexAtInstant(Date.parse('2026-10-08T15:29:00+09:00'),JIE_2026),8);
});
