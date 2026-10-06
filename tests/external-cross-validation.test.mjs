import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {dayPillar} from '../src/engine/rules.mjs';
import {getJieTermsForYear} from '../src/engine/solar-term-provider.mjs';

const pad=n=>String(n).padStart(2,'0');
const seoulParts=epochMs=>{
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23'
  }).formatToParts(new Date(epochMs));
  const get=type=>Number(parts.find(x=>x.type===type).value);
  return {year:get('year'),month:get('month'),day:get('day'),hour:get('hour'),minute:get('minute')};
};
const inputAt=epochMs=>{
  const p=seoulParts(epochMs);
  return {birthDate:`${p.year}-${pad(p.month)}-${pad(p.day)}`,birthTime:`${pad(p.hour)}:${pad(p.minute)}`};
};

test('KASI 2000 published first-day iljin anchors reproduce every Gregorian month',()=>{
  const expected=['戊午','己丑','戊午','己丑','己未','庚寅','庚申','辛卯','壬戌','壬辰','癸亥','癸巳'];
  for(let month=1;month<=12;month++){
    assert.equal(dayPillar(2000,month,1).hanja,expected[month-1],`2000-${pad(month)}-01`);
  }
});

test('KASI 2000 published jie times switch Saju month pillars at the official minute',()=>{
  const fixtures=[
    ['소한','2000-01-06T10:00:00+09:00'],
    ['입춘','2000-02-04T21:40:00+09:00'],
    ['경칩','2000-03-05T15:42:00+09:00'],
    ['청명','2000-04-04T20:31:00+09:00'],
    ['입하','2000-05-05T13:50:00+09:00'],
    ['망종','2000-06-05T17:58:00+09:00'],
    ['소서','2000-07-07T04:13:00+09:00'],
    ['입추','2000-08-07T14:02:00+09:00'],
    ['백로','2000-09-07T16:59:00+09:00'],
    ['한로','2000-10-08T08:38:00+09:00'],
    ['입동','2000-11-07T11:47:00+09:00'],
    ['대설','2000-12-07T04:36:00+09:00']
  ];

  const generated=getJieTermsForYear(2000);
  for(const [name,iso] of fixtures){
    const official=Date.parse(iso);
    const actual=generated.find(x=>x.name===name&&Math.abs(x.epochMs-official)<86400000);
    assert.ok(actual,name);
    assert.ok(Math.abs(actual.epochMs-official)<90000,`${name} differs by >90 seconds`);

    const before=calculateSaju(inputAt(actual.epochMs-120000));
    const after=calculateSaju(inputAt(actual.epochMs+120000));
    assert.notEqual(before.pillars.month.hanja,after.pillars.month.hanja,`${name} should change month pillar`);
    if(name==='입춘') assert.notEqual(before.pillars.year.hanja,after.pillars.year.hanja,'Li Chun should change year pillar');
  }
});

test('all 12 jie boundaries in multiple decades change month exactly once around the computed instant',()=>{
  for(const year of [1970,1980,1990,2000,2010,2020,2030,2050,2100]){
    for(const term of getJieTermsForYear(year).filter(x=>x.epochMs>=Date.parse(`${year}-01-01T00:00:00Z`))){
      const before=calculateSaju(inputAt(term.epochMs-120000));
      const after=calculateSaju(inputAt(term.epochMs+120000));
      assert.notEqual(before.pillars.month.hanja,after.pillars.month.hanja,`${year} ${term.name}`);
    }
  }
});

test('midnight policy advances day pillar at 00:00 while zi-start policy advances at 23:00',()=>{
  const base={birthDate:'2000-03-10',sex:'female'};
  const a=calculateSaju({...base,birthTime:'22:59'},{dayBoundary:'midnight'});
  const b=calculateSaju({...base,birthTime:'23:01'},{dayBoundary:'midnight'});
  const c=calculateSaju({...base,birthTime:'23:59'},{dayBoundary:'midnight'});
  assert.equal(a.pillars.day.hanja,b.pillars.day.hanja);
  assert.equal(b.pillars.day.hanja,c.pillars.day.hanja);

  const z=calculateSaju({...base,birthTime:'23:01'},{dayBoundary:'zi-start'});
  const next=calculateSaju({birthDate:'2000-03-11',birthTime:'00:01',sex:'female'},{dayBoundary:'midnight'});
  assert.equal(z.pillars.day.hanja,next.pillars.day.hanja);
  assert.notEqual(z.pillars.day.hanja,b.pillars.day.hanja);
});
