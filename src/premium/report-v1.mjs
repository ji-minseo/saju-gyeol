
import {buildReadingV3} from '../content/reading-v3.mjs';
import {buildCurrentFlow} from '../content/flow-v1.mjs';

export const PREMIUM_REPORT_POLICY={
  version:'1.0',
  productId:'saju-gyeol-deep-report-v1',
  deterministicEvents:false,
  financialPrediction:false,
  medicalPrediction:false,
  synthesisFirst:true,
  note:'무료 결과의 데이터를 숨기지 않고, 유료 리포트에서는 서로 다른 구조를 교차해 반복 패턴과 활용 기준을 더 선명하게 종합한다.'
};

const unique=items=>[...new Set(items.filter(Boolean))];
const section=(key,kicker,title,body,evidence=[],action=null)=>({
  key,kicker,title,body,evidence:unique(evidence).slice(0,7),action
});

const currentAndNextDaeun=flow=>{
  const currentIndex=flow.daeunTimeline.findIndex(x=>x.isCurrent);
  return {
    current:currentIndex>=0?flow.daeunTimeline[currentIndex]:null,
    next:currentIndex>=0?flow.daeunTimeline[currentIndex+1]||null:null
  };
};

const signalLine=result=>{
  const structure=result.structuralAnalysis;
  const climate=result.climateBalance;
  const useful=structure?.usefulGod?.primary?.label||'단일 후보 보류';
  const climateLabel=climate?.primary?.elementKo||'—';
  return (structure?.strength?.label||'강약 미정')+' · '+(structure?.pattern?.label||'기본격 미정')+' · 힘의 균형 '+useful+' · 계절의 균형 '+climateLabel;
};

export function buildPremiumReportV1(result,{today=new Date()}={}){
  const reading=buildReadingV3(result);
  const flow=buildCurrentFlow(result,{today});
  const structure=result.structuralAnalysis;
  const climate=result.climateBalance;
  const stars=result.symbolicStars?.present||[];
  const pair=currentAndNextDaeun(flow);
  const current=pair.current;
  const next=pair.next;
  const deep=reading.deep;

  const balanceSame=Boolean(climate?.balancingComparison?.sameElement);
  const balanceTitle=balanceSame
    ?'힘의 균형과 계절의 균형이 같은 방향을 가리켜요'
    :'힘의 균형과 계절의 균형이 서로 다른 답을 내놓는 이유가 있어요';
  const balanceBody=balanceSame
    ?climate.balancingComparison.text+' 중요한 건 같은 오행을 반복해서 더하라는 뜻이 아니라, 서로 다른 계산 기준이 같은 방향을 확인했다는 점이에요. 실제 선택에서는 강약·격국·현재 운의 흐름을 함께 봐야 합니다.'
    :(climate?.balancingComparison?.text||'')+' 이 차이는 모순이 아니라 “평소 힘을 어떻게 배분하는가”와 “태어난 계절에서 무엇을 먼저 보완하는가”를 따로 본 결과예요. 그래서 한쪽 후보만 정답처럼 밀기보다 상황에 따라 어느 기준이 앞에 서는지 구분하는 편이 맞습니다.';

  const currentBody=current
    ?current.title+' '+current.body+' 원래 명식의 '+deep.meta.primaryLabel+' 성향이 이 시기에는 '+current.theme+'라는 주제와 만나므로, 잘하던 방식을 더 세게 밀기보다 어디서 과해지는지를 같이 보는 것이 중요해요.'
    :'현재 대운을 특정하려면 성별과 출생시간이 필요합니다.';
  const nextBody=next
    ?'다음 대운 '+next.pillar.hanja+'에서는 '+next.theme+' 주제가 앞에 옵니다. 지금의 흐름과 비교하면 “'+(current?.theme||'현재 주제')+'”에서 “'+next.theme+'” 쪽으로 중심이 옮겨가는 구간으로 읽을 수 있어요.'
    :'다음 대운 정보는 현재 입력에서 특정하지 않습니다.';

  const starNames=stars.map(x=>x.label);
  const starBody=starNames.length
    ?'현재 공통 신살·귀인 표에서는 '+starNames.join(' · ')+' 등이 실제 명식에 걸립니다. 이 표시는 본문 결론을 만들기보다, 앞에서 확인한 성향과 관계·이동·몰입 같은 주제를 보조하는 근거로만 사용합니다.'
    :'대표 신살·귀인 표에서 직접 걸리는 항목이 적더라도 핵심 해석이 약하다는 뜻은 아니에요. 신살은 원국 구조 뒤에 붙는 보조표입니다.';

  const sections=[
    section(
      'core',
      '01 · CORE',
      '결국 이 사주를 한 문장으로 묶으면',
      deep.portrait.body+' 여기에 '+structure.strength.label+'의 힘 배분과 '+structure.pattern.label+'의 기본 골격이 겹칩니다. 그래서 “어떤 성격인가”보다 “어떤 기준으로 판단하고, 그 기준이 언제 과해지는가”를 보는 편이 이 명식의 핵심에 더 가깝습니다.',
      [signalLine(result),...deep.portrait.evidence],
      '내가 잘하는 방식과 나를 지치게 하는 방식이 같은 뿌리에서 나오는지 먼저 확인해보세요.'
    ),
    section(
      'friction',
      '02 · FRICTION',
      '잘하는데도 자꾸 피곤해지는 지점',
      deep.overdrive.body+' '+deep.patterns.stress.body+' 이 둘이 겹치면 능력이 부족해서 막히기보다, 이미 잘하는 방식을 너무 오래·세게 써서 피로가 누적되는 쪽에 가깝습니다.',
      [...deep.overdrive.evidence,...deep.patterns.stress.evidence],
      deep.patterns.stress.tip||deep.overdrive.tip
    ),
    section(
      'balance',
      '03 · BALANCE',
      balanceTitle,
      balanceBody,
      [
        '신강·신약 '+structure.strength.label,
        '기본격 '+structure.pattern.label,
        '억부 후보 '+(structure.usefulGod.primary?.label||'보류'),
        '조후 1순위 '+(climate?.primary?.label||'—'),
        climate?.presenceSummary
      ],
      '한 가지 오행을 “정답”으로 외우기보다, 지금 필요한 것이 힘 조절인지 계절 보완인지 구분해서 읽으세요.'
    ),
    section(
      'relationship',
      '04 · RELATIONSHIP',
      '관계에서 반복되는 건 감정보다 기준이에요',
      deep.patterns.relationship.body+' '+reading.relationship.body+' 그래서 가까워질수록 “좋아하느냐”보다 일정·거리·표현·약속 중 무엇이 반복해서 어긋나는지를 보는 게 더 정확합니다.',
      [...deep.patterns.relationship.evidence,...reading.relationship.evidence],
      reading.relationship.guide
    ),
    section(
      'work',
      '05 · WORK',
      '직업명보다 이 조건이 맞아야 오래 잘해요',
      deep.patterns.work.body+' '+reading.career.body+(current?' 현재 대운에서는 '+current.theme+'가 함께 앞에 와, 같은 능력도 어떤 환경에서 쓰느냐가 더 중요해집니다.':''),
      [...deep.patterns.work.evidence,...reading.career.evidence,current?.evidence?.[0]],
      reading.career.guide
    ),
    section(
      'money',
      '06 · MONEY',
      '돈에서는 수익보다 판단 습관을 먼저 봐요',
      deep.patterns.money.body+' '+reading.money.body+' 이 해석은 투자 수익이나 자산 규모를 예측하는 것이 아니라, 비용·보상·가격·축적을 판단할 때 반복되기 쉬운 기준을 보는 것입니다.',
      [...deep.patterns.money.evidence,...reading.money.evidence],
      reading.money.guide
    ),
    section(
      'timing',
      '07 · TIMING',
      '지금 10년과 다음 10년의 차이',
      currentBody+' '+nextBody,
      [...(current?.evidence||[]),...(next?.evidence||[]),...flow.annuals.slice(0,2).flatMap(x=>x.evidence.slice(0,1))],
      current?.guide||'현재 흐름은 사건을 예언하기보다 어떤 주제가 앞에 오는지 확인하는 기준으로 쓰세요.'
    ),
    section(
      'stars',
      '08 · SUPPORTING SIGNALS',
      '신살은 결론이 아니라 마지막 확인표로만 써요',
      starBody,
      starNames.slice(0,7),
      '신살 이름 하나로 관계·이동·사건을 단정하지 말고 앞의 구조 해석과 같은 방향을 보조할 때만 참고하세요.'
    )
  ];

  const actionItems=unique([
    deep.patterns.decision.tip,
    deep.patterns.stress.tip,
    reading.relationship.guide,
    reading.career.guide,
    reading.money.guide,
    current?.guide
  ]).slice(0,6);

  return {
    productId:PREMIUM_REPORT_POLICY.productId,
    method:'premium-report-v1',
    generatedFor:{
      dayPillar:result.pillars.day.hanja,
      dayMaster:result.dayMaster.hanja
    },
    signalLine:signalLine(result),
    title:result.pillars.day.hanja+' · 정밀 종합 리포트',
    subtitle:'무료 결과에서 따로 본 데이터를 한 번에 묶어, 반복되는 판단 기준과 지금의 흐름을 더 선명하게 정리했습니다.',
    sections,
    actionPlan:{
      title:'지금 바로 써먹을 기준',
      items:actionItems
    },
    annuals:flow.annuals,
    meta:{
      policy:PREMIUM_REPORT_POLICY,
      asOf:flow.asOf,
      currentDaeun:current?.pillar?.hanja||null,
      nextDaeun:next?.pillar?.hanja||null
    }
  };
}
