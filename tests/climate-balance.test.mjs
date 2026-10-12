import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {CLIMATE_BALANCE_POLICY,CLIMATE_BALANCE_TABLE} from '../src/engine/climate-balance.mjs';

const MONTHS=['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];
const STEMS=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

test('climate reference table covers all 10 day stems x 12 solar-term months',()=>{
  assert.equal(Object.keys(CLIMATE_BALANCE_TABLE).length,10);
  for(const stem of STEMS){
    assert.deepEqual(Object.keys(CLIMATE_BALANCE_TABLE[stem]),MONTHS);
    for(const month of MONTHS){
      const candidates=[...CLIMATE_BALANCE_TABLE[stem][month]];
      assert.ok(candidates.length>=1,stem+month);
      assert.ok(candidates.every(x=>STEMS.includes(x)),stem+month);
    }
  }
});

test('1995-10-13 丁 day in 戌 month uses 甲 庚 戊 in classical reference order',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  const climate=result.climateBalance;

  assert.equal(climate.dayMaster.hanja,'丁');
  assert.equal(climate.month.branch,'戌');
  assert.deepEqual(climate.candidates.map(x=>x.hanja),['甲','庚','戊']);
  assert.equal(climate.primary.hanja,'甲');
  assert.equal(climate.primary.elementKo,'목');
  assert.equal(climate.primary.presence.state,'hidden');
  assert.match(climate.primary.presence.text,/아래 글자 안에 있음/);
});

test('climate and balancing useful-god systems stay visibly separate',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  assert.equal(result.structuralAnalysis.usefulGod.primary.label,'토');
  assert.equal(result.climateBalance.primary.elementKo,'목');
  assert.equal(result.climateBalance.balancingComparison.sameElement,false);
  assert.match(result.climateBalance.balancingComparison.text,/서로 다른 질문|두 방법은 질문이 달라/);
  assert.equal(CLIMATE_BALANCE_POLICY.finalUsefulGod,false);
});

test('climate output checks visible and hidden presence without turning it into health advice',()=>{
  const fixtures=[
    ['1988-09-19','16:40','male'],
    ['1995-10-13','10:13','female'],
    ['2000-05-20','10:00','male'],
    ['2026-10-12','09:30','female']
  ];
  for(const [birthDate,birthTime,sex] of fixtures){
    const climate=calculateSaju({birthDate,birthTime,sex}).climateBalance;
    assert.ok(['visible','hidden','absent'].includes(climate.primary.presence.state));
    assert.ok(climate.explanation.length>60);
    assert.match(climate.caveat,/건강상의 체온·습도|실제 날씨/);
  }
  assert.equal(CLIMATE_BALANCE_POLICY.healthDiagnosis,false);
});

test('climate analysis records a distinct transparent method in result metadata',()=>{
  const result=calculateSaju({birthDate:'1995-10-13',birthTime:'10:13',sex:'female'});
  assert.equal(result.climateBalance.method,'climate-balance-v1');
  assert.equal(result.metadata.climateBalancePolicy.method,'qiongtong-baojian-10-stems-x-12-jie-months');
});
