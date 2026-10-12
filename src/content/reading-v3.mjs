import {buildReadingV2} from './reading-v2.mjs';

const CATEGORY_LABELS={
  peer:'비겁',
  output:'식상',
  wealth:'재성',
  officer:'관성',
  resource:'인성'
};

const categoryOf=name=>{
  if(name==='비견'||name==='겁재') return 'peer';
  if(name==='식신'||name==='상관') return 'output';
  if(name==='편재'||name==='정재') return 'wealth';
  if(name==='편관'||name==='정관') return 'officer';
  if(name==='편인'||name==='정인') return 'resource';
  return null;
};

const DAY_MASTER_PROFILE={
  甲:{title:'먼저 방향을 세우고 길을 내는 사람',desire:'내가 납득한 방향으로 꾸준히 밀고 갈 수 있을 때 힘이 붙습니다.',decision:'큰 방향을 먼저 정한 뒤 세부를 맞추는 편입니다.',stress:'방향은 정해지지 않았는데 같은 일을 반복해야 할 때 답답함이 커질 수 있습니다.'},
  乙:{title:'조건을 읽고 가장 현실적인 길을 찾는 사람',desire:'주변 조건을 활용하면서도 내 기준을 잃지 않을 때 안정감을 느낍니다.',decision:'정면 돌파보다 가능한 경로를 여러 개 살핀 뒤 가장 통과하기 쉬운 길을 고릅니다.',stress:'주변 반응이 계속 바뀌면 내 선택까지 흔들리는 느낌을 받을 수 있습니다.'},
  丙:{title:'밖으로 꺼내며 흐름을 움직이는 사람',desire:'내 생각이 말·행동·결과물로 이어지고 반응이 돌아올 때 에너지가 살아납니다.',decision:'움직여 보면서 답을 찾는 편이라 첫 반응과 실행 속도가 빠른 편입니다.',stress:'결정권 없이 기다려야 하거나 반응이 지나치게 느린 환경에서 지치기 쉽습니다.'},
  丁:{title:'작은 차이를 끝까지 보고 완성도를 높이는 사람',desire:'내가 중요하다고 느낀 디테일을 충분히 다듬을 수 있을 때 만족도가 높아집니다.',decision:'겉으로 비슷해 보여도 미세한 차이를 비교한 뒤 더 나은 쪽을 고르는 편입니다.',stress:'마감은 다가오는데 마음에 들지 않는 부분이 남아 있을 때 스스로를 몰아붙이기 쉽습니다.'},
  戊:{title:'흔들리지 않는 기준과 구조를 만드는 사람',desire:'오래 버틸 수 있는 틀과 책임 범위가 분명할 때 안정적으로 힘을 씁니다.',decision:'빠른 변화보다 지속 가능한지부터 확인하고 결정하는 편입니다.',stress:'계획과 역할이 자주 뒤집히면 통제감을 잃었다고 느끼기 쉽습니다.'},
  己:{title:'흩어진 것을 정리해 실제로 굴러가게 만드는 사람',desire:'복잡한 것을 정리해 모두가 쓸 수 있는 형태로 만들 때 성취감을 느끼기 쉽습니다.',decision:'누가 무엇을 맡고 어떤 순서로 움직여야 하는지를 정리하면서 답을 찾습니다.',stress:'경계가 흐린 요청이 계속 쌓이면 다른 사람 몫까지 떠안기 쉽습니다.'},
  庚:{title:'핵심을 가르고 결론을 만드는 사람',desire:'문제의 핵심과 결정권이 분명할 때 가장 빠르게 힘을 씁니다.',decision:'애매함을 오래 끌기보다 기준을 세워 선택지를 줄이고 결론을 내립니다.',stress:'결론 없는 논의가 길어지거나 책임자가 결정을 미룰 때 피로가 커질 수 있습니다.'},
  辛:{title:'오차를 잡고 더 나은 기준을 세우는 사람',desire:'무엇이 더 나은지 비교하고 품질을 높일 수 있을 때 강점이 또렷해집니다.',decision:'차이를 세밀하게 비교한 뒤 가장 완성도 높은 선택을 고르는 편입니다.',stress:'기준이 모호한 상태에서 대충 알아서 해달라는 요구를 받으면 오히려 판단이 어려워질 수 있습니다.'},
  壬:{title:'큰 흐름을 보며 필요하면 경로를 바꾸는 사람',desire:'여러 가능성을 열어두고 상황에 맞춰 움직일 수 있을 때 자유롭게 힘을 씁니다.',decision:'한 가지 길에 고정하기보다 전체 흐름과 다음 선택지를 함께 보고 움직입니다.',stress:'가능성만 많고 우선순위가 정해지지 않으면 에너지가 분산되기 쉽습니다.'},
  癸:{title:'미세한 신호를 모아 충분히 읽고 움직이는 사람',desire:'정보와 맥락을 충분히 이해한 뒤 내 속도로 결정할 수 있을 때 편합니다.',decision:'눈에 보이는 사실뿐 아니라 분위기와 맥락까지 모은 뒤 결론을 내리는 편입니다.',stress:'정보가 부족하거나 상대 의도를 확신하기 어려운 상황에서 생각이 길어질 수 있습니다.'}
};

const BRANCH_PROFILE={
  子:{tone:'빠르게 움직이는 정보와 반응을 잘 포착하는 결',note:'가까운 일상에서는 변화하는 분위기와 타이밍을 민감하게 읽는 쪽으로 나타날 수 있습니다.'},
  丑:{tone:'천천히 쌓고 오래 유지하는 결',note:'가까운 일상에서는 익숙한 방식과 안정적인 반복을 통해 신뢰를 만드는 편에 가깝습니다.'},
  寅:{tone:'새로운 흐름을 먼저 여는 결',note:'가까운 일상에서는 가만히 기다리기보다 먼저 시작점이나 방향을 만드는 쪽으로 나타날 수 있습니다.'},
  卯:{tone:'관계와 분위기의 미세한 차이를 읽는 결',note:'가까운 일상에서는 말투·취향·거리감 같은 작은 차이를 중요하게 느낄 수 있습니다.'},
  辰:{tone:'여러 조건을 한데 묶어 조정하는 결',note:'가까운 일상에서는 서로 다른 요구를 중간에서 정리하고 현실적인 접점을 찾으려는 편입니다.'},
  巳:{tone:'생각을 빠르게 표현과 행동으로 바꾸는 결',note:'가까운 일상에서는 반응이 빠르고 상황을 직접 움직여야 답답함이 덜한 편일 수 있습니다.'},
  午:{tone:'감정과 의사를 비교적 분명하게 드러내는 결',note:'가까운 일상에서는 좋고 싫음, 하고 싶은 것과 아닌 것을 비교적 선명하게 표현하는 편입니다.'},
  未:{tone:'사람과 상황을 부드럽게 정리하는 결',note:'가까운 일상에서는 충돌을 바로 키우기보다 서로가 받아들일 수 있는 형태로 다듬으려는 편입니다.'},
  申:{tone:'상황 변화에 맞춰 빠르게 방식을 바꾸는 결',note:'가까운 일상에서는 새로운 도구나 방법을 익히고 효율적인 경로를 찾는 데 익숙한 편입니다.'},
  酉:{tone:'정확도와 완성도를 세밀하게 보는 결',note:'가까운 일상에서는 말이나 행동의 디테일, 약속의 정확성을 중요하게 느낄 수 있습니다.'},
  戌:{tone:'기준과 경계를 지키려는 결',note:'가까운 일상에서는 어디까지가 내 몫인지, 무엇을 지켜야 하는지를 분명히 하려는 편입니다.'},
  亥:{tone:'깊이 파고들고 가능성을 넓게 보는 결',note:'가까운 일상에서는 한 번 관심이 생긴 주제를 오래 탐색하고 의미를 충분히 이해하려는 편입니다.'}
};

const CATEGORY_PROFILE={
  peer:{
    strength:'내 판단과 독립성을 지키면서 직접 움직이는 힘',
    overdrive:'모든 선택을 혼자 책임지려 하거나, 도움을 받는 것까지 간섭처럼 느끼기 쉬워질 수 있어요.',
    decision:'내가 직접 결정할 수 있는지와 선택권이 얼마나 있는지를 먼저 봅니다.',
    stress:'통제받는 느낌, 역할 침범, 비교와 경쟁이 길어질 때 예민해질 수 있습니다.',
    relationship:'가까워도 서로의 시간과 결정권이 존중될 때 관계가 편해집니다.',
    work:'자율성과 수정 권한이 있는 역할에서 속도가 붙기 쉽습니다.',
    money:'공동 비용·수익 배분처럼 경계가 필요한 돈 문제는 기준을 분명히 할수록 편합니다.'
  },
  output:{
    strength:'생각을 말·글·작업물로 바꾸고 실제 변화를 만들어내는 힘',
    overdrive:'답답함을 견디기 어려워 너무 빨리 말하거나, 충분히 다듬기 전에 다음 단계로 넘어가기 쉬워질 수 있어요.',
    decision:'머릿속에서만 고민하기보다 작은 시도나 결과물을 만들어 반응을 확인하며 결정합니다.',
    stress:'표현할 수 없거나 고칠 수 없는 상태가 오래 이어질 때 에너지가 급격히 떨어질 수 있습니다.',
    relationship:'감정도 어느 정도 표현되어야 풀리는 편이라 침묵이 길어지면 답답함이 커질 수 있습니다.',
    work:'직접 만들고 고치며 결과가 눈에 보이는 업무에서 강점을 쓰기 쉽습니다.',
    money:'아이디어와 기술을 누군가가 사용할 수 있는 결과로 묶을 때 수익 연결이 선명해집니다.'
  },
  wealth:{
    strength:'시간·비용·성과를 현실적인 기준으로 바꾸는 감각',
    overdrive:'모든 선택을 효율과 결과로만 판단하면 쉬는 시간이나 관계의 여유까지 손익처럼 느껴질 수 있어요.',
    decision:'실제로 얻는 결과, 들어가는 비용, 유지 가능성을 비교하면서 선택합니다.',
    stress:'성과 기준이 자주 바뀌거나 내가 한 일이 무엇으로 남는지 보이지 않을 때 동기가 떨어질 수 있습니다.',
    relationship:'말보다 시간 배분과 행동처럼 눈에 보이는 성의를 중요하게 느낄 수 있습니다.',
    work:'성과 기준과 목표가 분명한 프로젝트에서 판단이 빨라질 수 있습니다.',
    money:'예산·가격·성과처럼 측정 가능한 기준을 세우면 돈을 다루는 흐름이 안정되기 쉽습니다.'
  },
  officer:{
    strength:'약속·책임·완료 기준을 세우고 끝까지 지키려는 힘',
    overdrive:'기준을 너무 높게 잡으면 나와 타인을 계속 평가하게 되고, 작은 실수도 오래 마음에 남을 수 있어요.',
    decision:'무엇이 맞는지뿐 아니라 책임 범위와 이후의 영향까지 확인한 뒤 결정합니다.',
    stress:'책임은 큰데 권한이나 기준이 모호한 상황에서 부담이 크게 쌓일 수 있습니다.',
    relationship:'일관성, 약속을 지키는 태도, 말과 행동의 일치를 중요하게 봅니다.',
    work:'역할과 마감 기준이 분명한 환경에서 안정적으로 힘을 씁니다.',
    money:'충동보다 계약·고정비·기한처럼 관리 가능한 틀을 두는 편이 잘 맞습니다.'
  },
  resource:{
    strength:'정보와 맥락을 깊이 이해하고 내 방식으로 다시 정리하는 힘',
    overdrive:'충분히 이해한 뒤 움직이려다 준비가 길어지고, 결정 전에 확인할 것이 계속 늘어날 수 있어요.',
    decision:'자료와 이유를 충분히 이해해야 마음이 놓이며, 납득한 뒤에는 오래 밀고 가는 편입니다.',
    stress:'설명이 부족하거나 맥락 없이 결론만 요구받을 때 불안정하게 느낄 수 있습니다.',
    relationship:'상대가 왜 그렇게 행동했는지 이해해야 감정도 정리되는 편입니다.',
    work:'조사·분석·정리처럼 이해가 실제 결과로 이어지는 업무에서 강점이 살아납니다.',
    money:'배움과 도구에 먼저 투자하고 그 축적을 나중에 가치로 바꾸는 흐름이 자연스럽습니다.'
  }
};

const TEN_GOD_PROFILE={
  본인:{label:'본인',core:'내 판단과 기준 자체가 중심이 되는 자리입니다.'},
  비견:{label:'비견',core:'동등한 관계, 자기 기준, 독립적인 선택을 강조하는 십성입니다.'},
  겁재:{label:'겁재',core:'경쟁, 자원 배분, 경계와 주도권을 의식하게 하는 십성입니다.'},
  식신:{label:'식신',core:'꾸준한 표현, 생산, 돌봄처럼 결과를 자연스럽게 만들어내는 십성입니다.'},
  상관:{label:'상관',core:'기존 방식을 질문하고 더 나은 형태로 바꾸려는 표현력을 강조하는 십성입니다.'},
  편재:{label:'편재',core:'기회, 넓은 접점, 빠른 현실 감각을 통해 가치를 연결하는 십성입니다.'},
  정재:{label:'정재',core:'계획, 반복 가능한 관리, 안정적인 현실 감각을 강조하는 십성입니다.'},
  편관:{label:'편관',core:'압력 속에서 결단하고 책임을 감당하는 힘을 강조하는 십성입니다.'},
  정관:{label:'정관',core:'규칙, 신뢰, 역할과 책임의 일관성을 중요하게 보는 십성입니다.'},
  편인:{label:'편인',core:'익숙한 답보다 다른 관점과 독특한 이해 방식을 찾는 십성입니다.'},
  정인:{label:'정인',core:'배움, 보호, 안정적인 이해와 축적을 중요하게 보는 십성입니다.'}
};

const POSITION_PROFILE={
  year:{
    label:'년주',
    theme:'뿌리와 바깥 인상',
    stemLead:'초기에 접하는 기준과 바깥에서 보이는 태도에는',
    branchLead:'익숙하게 배운 환경과 반복되는 배경에는'
  },
  month:{
    label:'월주',
    theme:'사회적 환경과 일상 리듬',
    stemLead:'일이나 사회적 역할에서 겉으로 드러나는 방식에는',
    branchLead:'반복되는 생활·업무 환경에서 체감하는 방식에는'
  },
  day:{
    label:'일주',
    theme:'나와 가까운 일상',
    stemLead:'내 판단의 중심에는',
    branchLead:'가까운 관계와 일상에서 편안함을 느끼는 방식에는'
  },
  hour:{
    label:'시주',
    theme:'개인적인 계획과 확장',
    stemLead:'혼자 구상하거나 앞으로 만들어가고 싶은 영역에는',
    branchLead:'장기적으로 반복하고 싶은 생활 방식에는'
  }
};

const countVisible=result=>{
  const counts={peer:0,output:0,wealth:0,officer:0,resource:0};
  for(const group of [result.tenGods.visibleStems,result.tenGods.visibleBranches]){
    for(const value of Object.values(group||{})){
      const kind=categoryOf(value);
      if(kind) counts[kind]+=1;
    }
  }
  return counts;
};

const rankKinds=counts=>Object.keys(counts)
  .sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b));

const elementSummary=result=>{
  const names={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
  const entries=Object.entries(result.fiveElements?.counts||{})
    .map(([key,value])=>({key,value:Number(value||0),label:names[key]||key}))
    .sort((a,b)=>b.value-a.value||a.key.localeCompare(b.key));
  const top=entries[0]||{key:'earth',value:0,label:'토'};
  const low=[...entries].sort((a,b)=>a.value-b.value||a.key.localeCompare(b.key))[0]||top;
  return {top,low};
};

const unique=items=>[...new Set(items.filter(Boolean))];

const makeDeepSection=(title,body,evidence=[],tip=null)=>({
  title,
  body,
  evidence:unique(evidence).slice(0,5),
  tip,
  confidence:'medium',
  methodId:'reading-v3-expanded'
});

const positionReading=(result,key)=>{
  const pillar=result.pillars[key];
  if(!pillar) return null;
  const meta=POSITION_PROFILE[key];
  const stemGod=result.tenGods.visibleStems[key]||'본인';
  const branchGod=result.tenGods.visibleBranches[key]||null;
  const stem=TEN_GOD_PROFILE[stemGod]||TEN_GOD_PROFILE.본인;
  const branch=branchGod?(TEN_GOD_PROFILE[branchGod]||null):null;

  const body=[
    `${meta.stemLead} ${stem.label}의 성격이 놓여 있습니다. ${stem.core}`,
    branch?`${meta.branchLead} ${branch.label}의 성격이 함께 보입니다. ${branch.core}`:null
  ].filter(Boolean).join(' ');

  return {
    key,
    label:meta.label,
    theme:meta.theme,
    pillar:pillar.hanja,
    stemGod,
    branchGod,
    title:branch&&branchGod!==stemGod
      ?`${stem.label}과 ${branch.label}, 두 방식이 함께 작동하는 자리`
      :`${stem.label}의 성격이 비교적 선명한 자리`,
    body,
    evidence:unique([
      `${meta.label} ${pillar.hanja}`,
      stemGod?`천간 ${stemGod}`:null,
      branchGod?`지지 ${branchGod}`:null
    ])
  };
};

export function buildReadingV3(result){
  const core=buildReadingV2(result);
  const counts=countVisible(result);
  const ranked=rankKinds(counts);
  const primary=ranked.find(kind=>counts[kind]>0)||'output';
  const secondary=ranked.find(kind=>kind!==primary&&counts[kind]>0)||null;
  const primaryProfile=CATEGORY_PROFILE[primary];
  const secondaryProfile=secondary?CATEGORY_PROFILE[secondary]:null;
  const dm=DAY_MASTER_PROFILE[result.dayMaster.hanja]||DAY_MASTER_PROFILE.丁;
  const day=result.pillars.day;
  const branch=BRANCH_PROFILE[day.branch.hanja]||BRANCH_PROFILE.丑;
  const elements=elementSummary(result);

  const portrait=makeDeepSection(
    `${day.hanja}, ${dm.title}`,
    `일간 ${result.dayMaster.hanja}은 판단의 중심을, 일지 ${day.branch.hanja}은 가까운 일상에서 반복되기 쉬운 리듬을 보는 기준으로 씁니다. ${dm.desire} 여기에 ${branch.tone}이 겹쳐, ${branch.note}`,
    [
      `일주 ${day.hanja}`,
      `일간 ${result.dayMaster.hanja}`,
      `일지 ${day.branch.hanja}`,
      `${CATEGORY_LABELS[primary]} ${counts[primary]}`,
      `표면 오행 ${elements.top.label} ${elements.top.value}`
    ],
    '일주 하나로 사람 전체를 단정하지 않고, 월지·십성·오행과 함께 교차해 읽습니다.'
  );

  const strengths=makeDeepSection(
    primaryProfile.strength,
    `표면 십성에서 ${CATEGORY_LABELS[primary]}이 가장 앞에 보여 이 힘을 기본 강점으로 읽습니다.${secondaryProfile?` ${CATEGORY_LABELS[secondary]}도 함께 보여, ${secondaryProfile.strength}이 보조 강점으로 붙습니다.`:''}`,
    [
      `${CATEGORY_LABELS[primary]} ${counts[primary]}`,
      secondary?`${CATEGORY_LABELS[secondary]} ${counts[secondary]}`:null
    ]
  );

  const overdrive=makeDeepSection(
    '강점이 너무 세게 쓰일 때 생기는 피로',
    `${primaryProfile.overdrive} ${dm.stress}`,
    [
      `${CATEGORY_LABELS[primary]} 반복 ${counts[primary]}`,
      `일간 ${result.dayMaster.hanja}`
    ],
    '약점이라기보다 같은 장점이 과하게 쓰일 때 나타날 수 있는 패턴으로 봅니다.'
  );

  const decision=makeDeepSection(
    '결정은 이렇게 내리는 편이에요',
    `${dm.decision} ${primaryProfile.decision}${secondaryProfile?` 동시에 ${secondaryProfile.decision}`:''}`,
    [
      `일간 ${result.dayMaster.hanja}`,
      `주요 십성 ${CATEGORY_LABELS[primary]}`,
      secondary?`보조 십성 ${CATEGORY_LABELS[secondary]}`:null
    ],
    '결정을 미룬다면 정보가 부족한지, 권한이 부족한지, 결과 기준이 모호한지 먼저 구분해보세요.'
  );

  const stress=makeDeepSection(
    '압박이 쌓일 때 먼저 흔들리는 지점',
    `${primaryProfile.stress} ${dm.stress}`,
    [
      `주요 십성 ${CATEGORY_LABELS[primary]}`,
      `일간 ${result.dayMaster.hanja}`
    ],
    '스트레스 반응은 운명적 예측이 아니라, 원국에서 반복되는 선택 기준을 바탕으로 본 생활 패턴입니다.'
  );

  const relationship=makeDeepSection(
    '가까워질수록 필요한 관계의 조건',
    `${primaryProfile.relationship}${secondaryProfile?` ${secondaryProfile.relationship}`:''} 기존 관계 해석에서 보이는 지지 관계까지 함께 보면, 감정보다 어떤 방식이 반복되는지를 확인하는 편이 더 도움이 됩니다.`,
    [
      `${CATEGORY_LABELS[primary]} ${counts[primary]}`,
      `일지 ${day.branch.hanja}`,
      ...core.relationship.evidence.slice(0,2)
    ],
    core.relationship.guide
  );

  const work=makeDeepSection(
    '잘하는 일보다, 잘할 수 있는 환경이 중요해요',
    `${primaryProfile.work}${secondaryProfile?` ${secondaryProfile.work}`:''} 그래서 직업 이름 하나를 고르기보다 자율성·결과 가시성·기준의 명확함처럼 실제 업무 조건을 같이 보는 편이 맞습니다.`,
    [
      `${CATEGORY_LABELS[primary]} ${counts[primary]}`,
      secondary?`${CATEGORY_LABELS[secondary]} ${counts[secondary]}`:null,
      ...core.career.evidence.slice(0,2)
    ],
    core.career.guide
  );

  const money=makeDeepSection(
    '돈을 판단하는 기준에도 성향이 드러나요',
    `${primaryProfile.money}${secondaryProfile?` ${secondaryProfile.money}`:''} 이는 수익을 예측하는 해석이 아니라, 가격·비용·축적·성과를 어떤 방식으로 판단하기 쉬운지에 대한 구조적 읽기입니다.`,
    [
      `${CATEGORY_LABELS[primary]} ${counts[primary]}`,
      ...core.money.evidence.slice(0,3)
    ],
    core.money.guide
  );

  const tenGodPositions=['year','month','day','hour']
    .map(key=>positionReading(result,key))
    .filter(Boolean);

  return {
    ...core,
    deep:{
      portrait,
      strengths,
      overdrive,
      patterns:{decision,stress,relationship,work,money},
      tenGodPositions,
      meta:{
        primary,
        secondary,
        primaryLabel:CATEGORY_LABELS[primary],
        secondaryLabel:secondary?CATEGORY_LABELS[secondary]:null,
        strongestElement:elements.top.label,
        lowestElement:elements.low.label
      }
    }
  };
}
