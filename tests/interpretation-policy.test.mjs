import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeNarrativeClaim,
  HIGH_STAKES_GUARDRAILS,
  INTERPRETATION_LAYERS
} from '../src/content/interpretation-policy.mjs';

test('narrative claims cannot exist without chart evidence',()=>{
  assert.throws(()=>makeNarrativeClaim({
    id:'career.example',
    category:'career',
    title:'example',
    summary:'example'
  }),/requires evidence/);
});

test('valid narrative claim records its interpretation layer and confidence',()=>{
  const claim=makeNarrativeClaim({
    id:'career.output',
    category:'career',
    title:'표현을 결과물로 바꾸는 힘',
    summary:'식상 구조를 커리어 표현력과 연결해 읽습니다.',
    evidence:['tenGod.monthBranch','tenGod.dayBranch'],
    confidence:'medium',
    methodId:'career-v1'
  });
  assert.equal(claim.layer,INTERPRETATION_LAYERS.narrative);
  assert.equal(claim.confidence,'medium');
  assert.deepEqual(claim.evidence,['tenGod.monthBranch','tenGod.dayBranch']);
});

test('high-stakes interpretation guardrails stay explicit',()=>{
  assert.ok(HIGH_STAKES_GUARDRAILS.health.forbid.includes('diagnosis'));
  assert.ok(HIGH_STAKES_GUARDRAILS.finance.forbid.includes('guaranteed_return'));
  assert.ok(HIGH_STAKES_GUARDRAILS.relationship.forbid.includes('guaranteed_divorce'));
});
