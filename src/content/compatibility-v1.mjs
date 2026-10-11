import {tenGod} from '../engine/rules.mjs';
import {branchRelations} from '../engine/derived-facts.mjs';

const CATEGORY_LABELS={
  peer:'비슷한 결',
  output:'표현과 움직임',
  wealth:'현실과 실행',
  officer:'기준과 책임',
  resource:'이해와 신뢰'
};

const categoryOf=name=>{
  if(name==='비견'||name==='겁재') return 'peer';
  if(name==='식신'||name==='상관') return 'output';
  if(name==='편재'||name==='정재') return 'wealth';
  if(name==='편관'||name==='정관') return 'officer';
  if(name==='편인'||name==='정인') return 'resource';
  return null;
};

const ELEMENT_KO={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};

const DIRECTION_READING={
  peer:{
    title:'비슷한 속도와 자기 기준을 먼저 느끼기 쉬워요',
    body:'상대를 나와 비슷한 위치의 사람으로 인식하기 쉬워, 편하게 의견을 주고받는 대신 서로의 독립성과 결정권도 중요해집니다.',
    guide:'의견이 같을 때는 빠르지만 다를 때는 힘겨루기가 되기 쉬우니, 누가 맞는지보다 각자 맡을 범위를 먼저 나누는 편이 좋아요.'
  },
  output:{
    title:'상대 앞에서 표현과 행동이 더 많이 나오는 편이에요',
    body:'상대를 만나면 생각을 말이나 행동으로 꺼내고, 뭔가 제안하거나 바꾸고 싶어지는 흐름을 읽을 수 있습니다.',
    guide:'표현이 많아지는 만큼 상대의 반응 속도를 확인해주면 일방적으로 밀어붙이는 느낌을 줄이기 좋아요.'
  },
  wealth:{
    title:'관계를 현실적으로 굴러가게 만드는 쪽을 의식하기 쉬워요',
    body:'시간·약속·비용·계획처럼 실제 생활에서 맞춰야 하는 부분을 더 빨리 보게 되는 흐름으로 읽습니다.',
    guide:'챙겨주는 것과 관리하려는 것을 구분하면 관계가 훨씬 편해져요. 상대가 원하는 방식도 함께 확인해보세요.'
  },
  officer:{
    title:'상대 앞에서 약속과 기준을 더 의식하기 쉬워요',
    body:'좋고 싫음만큼이나 말과 행동이 일치하는지, 관계의 규칙과 책임이 지켜지는지를 중요하게 느낄 수 있습니다.',
    guide:'기준이 높아질수록 상대를 평가하는 말처럼 들릴 수 있으니, 기대하는 행동을 구체적으로 설명하는 편이 좋아요.'
  },
  resource:{
    title:'상대를 충분히 이해해야 마음이 놓이는 편이에요',
    body:'상대의 말과 행동 뒤에 있는 이유를 알고 싶어지고, 설명·신뢰·정서적인 안정감을 관계의 중요한 바탕으로 보기 쉽습니다.',
    guide:'혼자 의미를 추측하는 시간이 길어지기 전에 궁금한 점을 직접 물어보면 불필요한 오해를 줄일 수 있어요.'
  }
};

const RELATION_READING={
  combine:{
    title:'접점을 찾고 가까워지는 힘이 자연스럽게 생기는 조합',
    body:'두 일지에 육합이 보여, 서로 다른 부분이 있어도 공통점을 발견하고 관계를 이어가려는 힘을 보조적으로 읽습니다.',
    friction:'잘 맞는다는 느낌 때문에 한쪽이 계속 맞춰주고 있는 부분을 늦게 알아차릴 수 있어요.',
    guide:'편하게 맞는 지점과 각자 지켜야 하는 경계를 따로 말해두면 오래 가기 좋아요.'
  },
  clash:{
    title:'끌림과 별개로 속도와 방향 차이가 크게 느껴질 수 있는 조합',
    body:'두 일지에 충이 보여, 일정·거리·연락 템포·우선순위처럼 실제 움직임의 차이가 관계에서 크게 체감될 수 있습니다.',
    friction:'감정 자체보다 “왜 자꾸 타이밍이 안 맞지?”라는 피로가 먼저 쌓일 수 있어요.',
    guide:'갈등이 생기면 마음을 추측하기보다 지금 서로 다르게 움직이는 항목을 하나씩 구체화해보세요.'
  },
  punishment:{
    title:'서로의 기준을 건드리면서 같은 문제를 반복해서 고치려는 조합',
    body:'두 일지에 형이 보여, 마음에 걸린 지점을 그냥 넘기기보다 이유를 확인하고 수정하려는 힘이 강해질 수 있습니다.',
    friction:'이미 끝난 문제를 다시 확인하거나 상대의 작은 습관을 계속 고치려는 패턴으로 이어질 수 있어요.',
    guide:'문제를 꺼낼 때 설명이 필요한지, 사과가 필요한지, 실제 변화가 필요한지를 먼저 구분해보세요.'
  },
  'self-punishment':{
    title:'닮은 민감함이 같은 지점을 반복해서 건드릴 수 있는 조합',
    body:'같은 지지의 자형 신호가 보여, 서로 닮은 방식으로 고민하거나 같은 문제를 오래 붙잡는 장면을 보조적으로 읽습니다.',
    friction:'상대의 모습에서 내 불편한 습관이 비쳐 보여 더 예민하게 반응할 수 있어요.',
    guide:'상대를 고치려 하기 전에 둘 다 반복하는 패턴인지 먼저 확인해보는 편이 도움이 됩니다.'
  },
  harm:{
    title:'큰 충돌보다 작은 어긋남을 오래 기억하기 쉬운 조합',
    body:'두 일지에 해가 보여, 말보다 행동의 디테일이나 기대와 실제 사이의 작은 차이가 관계에서 중요해질 수 있습니다.',
    friction:'말로는 괜찮다고 했는데 행동이 다를 때 서운함이 누적되기 쉬워요.',
    guide:'상대가 알아서 알아주길 기다리기보다 기대했던 행동을 구체적으로 말해두는 편이 좋아요.'
  },
  break:{
    title:'관계의 리듬이 가끔 끊기거나 계획이 쉽게 바뀔 수 있는 조합',
    body:'두 일지에 파가 보여, 큰 갈등보다 약속·계획·집중의 흐름이 중간에 끊기는 장면을 보조적으로 읽습니다.',
    friction:'좋은 분위기였다가도 작은 변수 때문에 흐름이 갑자기 식었다고 느낄 수 있어요.',
    guide:'변경이 생겼을 때 이유와 다음 계획을 바로 공유하면 불필요한 거리감을 줄이기 좋아요.'
  }
};

const firstPairRelation=(aBranch,bBranch)=>{
  const relations=branchRelations([
    {key:'a',branchIndex:aBranch},
    {key:'b',branchIndex:bBranch}
  ]);
  const priority=['combine','clash','punishment','self-punishment','harm','break'];
  return priority.map(type=>relations.find(item=>item.type===type)).find(Boolean)??null;
};

const allPairRelations=(aBranch,bBranch)=>branchRelations([
  {key:'a',branchIndex:aBranch},
  {key:'b',branchIndex:bBranch}
]);

const dominantElement=result=>{
  const entries=Object.entries(result.fiveElements.counts);
  entries.sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  return entries[0]?.[0]??'earth';
};

const elementRelation=(a,b)=>{
  if(a===b) return 'same';
  const cycle=['wood','fire','earth','metal','water'];
  const ai=cycle.indexOf(a),bi=cycle.indexOf(b);
  if((ai+1)%5===bi) return 'a-generates-b';
  if((bi+1)%5===ai) return 'b-generates-a';
  const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  if(controls[a]===b) return 'a-controls-b';
  if(controls[b]===a) return 'b-controls-a';
  return 'neutral';
};

const elementReading=(aElement,bElement)=>{
  const relation=elementRelation(aElement,bElement);
  const names=`${ELEMENT_KO[aElement]}·${ELEMENT_KO[bElement]}`;
  if(relation==='same') return {
    title:'기본 에너지의 결이 비슷해서 속도를 맞추기 쉬운 편',
    body:`두 사람의 표면 오행에서 각각 ${names}이 중심으로 보여, 익숙하게 느끼는 방식이 비슷할 수 있습니다. 대신 같은 약점도 함께 커질 수 있어요.`
  };
  if(relation==='a-generates-b'||relation==='b-generates-a') return {
    title:'한쪽의 움직임이 다른 쪽의 다음 행동으로 이어지기 쉬운 편',
    body:`두 사람의 중심 오행이 ${names} 흐름으로 이어져, 한 사람이 시작한 분위기나 아이디어가 다른 사람의 반응으로 자연스럽게 연결되는 장면을 읽을 수 있습니다.`
  };
  if(relation==='a-controls-b'||relation==='b-controls-a') return {
    title:'서로의 기준을 선명하게 만들어주는 대신 압박도 생길 수 있는 편',
    body:`두 사람의 중심 오행 ${names} 사이에는 제어 관계가 있어, 한쪽의 방식이 다른 쪽에게 정리 기준이나 긴장으로 느껴질 수 있습니다.`
  };
  return {
    title:'서로 다른 방식이 섞이면서 역할을 나누기 좋은 편',
    body:`두 사람의 중심 오행은 ${names}으로, 닮음보다는 서로 다른 방식이 관계에서 역할 차이로 드러날 가능성을 봅니다.`
  };
};

const monthRhythm=(a,b)=>{
  const relation=firstPairRelation(a.pillars.month.branchIndex,b.pillars.month.branchIndex);
  if(!relation) return {
    title:'생활 리듬은 관계를 만들어가면서 맞춰가는 쪽',
    body:'월지 사이에 강한 합·충 신호가 바로 잡히지 않아, 처음부터 정해진 호흡보다 실제 생활에서 시간을 쓰며 맞춰가는 과정이 더 중요합니다.',
    evidence:[`A 월지 ${a.pillars.month.branch.hanja}`,`B 월지 ${b.pillars.month.branch.hanja}`]
  };
  if(relation.type==='combine') return {
    title:'일상적인 생활 리듬에서 접점을 찾기 쉬운 편',
    body:'두 월지에 육합이 보여, 약속 방식이나 생활 패턴처럼 반복되는 일상에서 자연스럽게 공통 루틴을 만들기 쉬운 신호로 읽습니다.',
    evidence:[`월지 ${relation.label} ${relation.branches.join('·')}`]
  };
  if(relation.type==='clash') return {
    title:'좋아하는 마음과 별개로 생활 리듬은 조율이 필요한 편',
    body:'두 월지에 충이 보여, 쉬는 방식·일정·속도처럼 반복되는 생활 패턴에서 차이를 크게 체감할 수 있습니다.',
    evidence:[`월지 ${relation.label} ${relation.branches.join('·')}`]
  };
  return {
    title:'사소한 생활 습관이 관계 만족도에 꽤 중요해질 수 있어요',
    body:`두 월지에 ${relation.label} 관계가 보여, 거창한 사건보다 반복되는 습관과 작은 약속을 어떻게 맞추는지가 관계의 체감에 영향을 줄 수 있습니다.`,
    evidence:[`월지 ${relation.label} ${relation.branches.join('·')}`]
  };
};

const directionSection=(viewer,target,viewerLabel,targetLabel)=>{
  const tenGodName=tenGod(viewer.pillars.day.stemIndex,target.pillars.day.stemIndex);
  const kind=categoryOf(tenGodName)??'peer';
  const copy=DIRECTION_READING[kind];
  return {
    title:copy.title,
    body:copy.body,
    guide:copy.guide,
    evidence:[`${viewerLabel} 기준 ${targetLabel} 일간은 ${tenGodName}`,CATEGORY_LABELS[kind]]
  };
};

export function buildCompatibilityV1(a,b,{aLabel='A',bLabel='B'}={}){
  const dayRelation=firstPairRelation(a.pillars.day.branchIndex,b.pillars.day.branchIndex);
  const dayRelations=allPairRelations(a.pillars.day.branchIndex,b.pillars.day.branchIndex);
  const relationCopy=dayRelation?RELATION_READING[dayRelation.type]:null;

  const aElement=dominantElement(a);
  const bElement=dominantElement(b);
  const element=elementReading(aElement,bElement);
  const rhythm=monthRhythm(a,b);

  const aToB=directionSection(a,b,aLabel,bLabel);
  const bToA=directionSection(b,a,bLabel,aLabel);

  const overview=relationCopy?{
    title:relationCopy.title,
    body:`${relationCopy.body} ${element.body}`,
    evidence:[
      ...dayRelations.map(item=>`일지 ${item.label} ${item.branches.join('·')}`),
      `${aLabel} 중심 오행 ${ELEMENT_KO[aElement]}`,
      `${bLabel} 중심 오행 ${ELEMENT_KO[bElement]}`
    ]
  }:{
    title:element.title,
    body:`두 일지 사이에 강한 합·충 신호가 바로 잡히지는 않습니다. 그래서 한 가지 관계 표식보다 서로를 어떤 십성으로 경험하는지와 생활 리듬을 함께 보는 편이 자연스럽습니다. ${element.body}`,
    evidence:[
      `${aLabel} 일지 ${a.pillars.day.branch.hanja}`,
      `${bLabel} 일지 ${b.pillars.day.branch.hanja}`,
      `${aLabel} 중심 오행 ${ELEMENT_KO[aElement]}`,
      `${bLabel} 중심 오행 ${ELEMENT_KO[bElement]}`
    ]
  };

  const friction={
    title:relationCopy?.friction??'서로가 당연하다고 여기는 방식이 다를 때 오해가 생기기 쉬워요',
    body:relationCopy
      ?`${relationCopy.friction} 여기에 두 사람이 서로를 보는 십성 방향까지 다르면 같은 상황에서도 한쪽은 표현의 문제로, 다른 쪽은 약속이나 신뢰의 문제로 받아들일 수 있습니다.`
      :'강한 충돌 표식이 없더라도, 두 사람이 서로를 경험하는 방식이 다르면 같은 상황을 전혀 다른 문제로 해석할 수 있습니다.',
    guide:relationCopy?.guide??'갈등의 내용보다 먼저 “나는 지금 무엇이 불편한가”를 각자 한 문장으로 말해보는 편이 좋아요.',
    evidence:[
      ...dayRelations.map(item=>`일지 ${item.label}`),
      aToB.evidence[0],
      bToA.evidence[0]
    ]
  };

  const guide={
    title:'잘 맞는 부분을 키우고, 다른 부분은 역할로 나누는 게 좋아요',
    body:`${rhythm.body} 궁합을 고정된 점수로 보기보다 서로에게 어떤 반응을 끌어내는지 알고 쓰는 편이 이 조합을 더 현실적으로 이해하는 방법입니다.`,
    guide:dayRelation?.type==='clash'
      ?'연락 빈도·약속 시간·혼자 있는 시간처럼 리듬이 부딪히기 쉬운 항목을 미리 합의해두면 관계 피로를 크게 줄일 수 있어요.'
      :dayRelation?.type==='combine'
      ?'잘 맞는 부분이 많아도 각자 혼자 결정할 영역을 남겨두면 지나친 맞춤이나 의존을 줄이기 좋아요.'
      :'서로 잘하는 역할을 자연스럽게 나누되, 한 사람이 계속 설명하거나 계속 맞추는 구조가 되지 않는지 가끔 확인해보세요.',
    evidence:rhythm.evidence
  };

  return {
    methodId:'compatibility-v1-structural',
    confidence:'medium',
    overview,
    aToB,
    bToA,
    rhythm,
    friction,
    guide,
    meta:{
      aDayMaster:a.dayMaster.hanja,
      bDayMaster:b.dayMaster.hanja,
      aDayPillar:a.pillars.day.hanja,
      bDayPillar:b.pillars.day.hanja,
      aElement,
      bElement
    }
  };
}
