export const INTERPRETATION_LAYERS={
  fact:'verified-fact',
  derived:'derived-judgment',
  narrative:'narrative-reading'
};

export const CONFIDENCE_LEVELS=['high','medium','low'];

export const NARRATIVE_CATEGORIES=[
  'overview',
  'temperament',
  'career',
  'money',
  'relationship',
  'love',
  'current-luck-cycle',
  'yearly-flow',
  'long-term-flow'
];

export const HIGH_STAKES_GUARDRAILS={
  health:{
    forbid:['diagnosis','disease_prediction','treatment_instruction'],
    framing:'symbolic-wellbeing-only'
  },
  finance:{
    forbid:['guaranteed_return','asset_prohibition','specific_investment_command'],
    framing:'symbolic-tendency-only'
  },
  relationship:{
    forbid:['guaranteed_marriage','guaranteed_divorce','fixed_spouse_profile'],
    framing:'pattern-and-tendency-only'
  }
};

export function makeNarrativeClaim({
  id,category,title,summary,evidence=[],confidence='medium',methodId=null
}){
  if(!id||!category||!title||!summary) throw new TypeError('narrative claim requires id, category, title and summary');
  if(!NARRATIVE_CATEGORIES.includes(category)) throw new RangeError('unknown narrative category');
  if(!CONFIDENCE_LEVELS.includes(confidence)) throw new RangeError('unknown confidence');
  if(!Array.isArray(evidence)||evidence.length===0) throw new TypeError('narrative claim requires evidence');
  return Object.freeze({
    id,
    layer:INTERPRETATION_LAYERS.narrative,
    category,
    title,
    summary,
    evidence:[...evidence],
    confidence,
    methodId
  });
}
