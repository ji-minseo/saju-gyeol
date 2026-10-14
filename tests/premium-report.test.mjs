
import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildPremiumReportV1,PREMIUM_REPORT_POLICY} from '../src/premium/report-v1.mjs';

const fixture=()=>calculateSaju({
  birthDate:'1995-10-13',
  birthTime:'10:13',
  sex:'female'
});

test('premium report is synthesis-first and contains eight distinct chapters',()=>{
  const report=buildPremiumReportV1(fixture(),{today:'2026-10-14'});
  assert.equal(report.method,'premium-report-v1');
  assert.equal(report.sections.length,8);
  assert.deepEqual(report.sections.map(x=>x.key),[
    'core','friction','balance','relationship','work','money','timing','stars'
  ]);
  assert.ok(report.sections.every(x=>x.body.length>80));
  assert.ok(report.actionPlan.items.length>=4);
  assert.equal(PREMIUM_REPORT_POLICY.synthesisFirst,true);
});

test('premium report explicitly reconciles strength and seasonal balance instead of choosing one true useful god',()=>{
  const report=buildPremiumReportV1(fixture(),{today:'2026-10-14'});
  const balance=report.sections.find(x=>x.key==='balance');
  assert.match(report.signalLine,/신강|신약|중화/);
  assert.match(report.signalLine,/힘의 균형/);
  assert.match(report.signalLine,/계절의 균형/);
  assert.match(balance.body,/서로 다른|같은 방향/);
  assert.doesNotMatch(balance.body,/진짜 용신|유일한 용신|무조건/);
});

test('premium report compares current and next daeun when available',()=>{
  const report=buildPremiumReportV1(fixture(),{today:'2026-10-14'});
  const timing=report.sections.find(x=>x.key==='timing');
  assert.ok(report.meta.currentDaeun);
  assert.ok(report.meta.nextDaeun);
  assert.match(timing.body,/다음 대운/);
  assert.ok(timing.evidence.length>=2);
});

test('premium output avoids deterministic event, medical and investment promises',()=>{
  const report=buildPremiumReportV1(fixture(),{today:'2026-10-14'});
  const text=JSON.stringify(report);
  for(const forbidden of [
    '반드시 결혼','무조건 성공','사고가 난다','질병이 생긴다',
    '주가가 오른다','투자하면 번다','수익을 보장'
  ]){
    assert.equal(text.includes(forbidden),false,forbidden);
  }
  assert.equal(PREMIUM_REPORT_POLICY.deterministicEvents,false);
  assert.equal(PREMIUM_REPORT_POLICY.financialPrediction,false);
  assert.equal(PREMIUM_REPORT_POLICY.medicalPrediction,false);
});

test('premium report body does not expose exact birth date or time',()=>{
  const report=buildPremiumReportV1(fixture(),{today:'2026-10-14'});
  const text=JSON.stringify(report);
  assert.equal(text.includes('1995-10-13'),false);
  assert.equal(text.includes('10:13'),false);
});
