import {withSubject,withCopulaRa} from './korean-particles.mjs';

const CATEGORY_LABELS={
  peer:'비겁',
  output:'식상',
  wealth:'재성',
  officer:'관성',
  resource:'인성'
};

const ELEMENT_LABELS={
  wood:'목',
  fire:'화',
  earth:'토',
  metal:'금',
  water:'수'
};

const ELEMENT_CONTEXT={
  wood:{
    temperament:'표면 오행에서는 목이 상대적으로 두드러져, 시작점을 만들고 방향을 넓혀 가는 움직임을 보조 신호로 봅니다.',
    situation:'새 일을 처음 잡거나 방향을 정해야 할 때, 일단 뼈대를 세우고 이후에 세부를 붙이는 방식이 편할 수 있습니다.'
  },
  fire:{
    temperament:'표면 오행에서는 화가 상대적으로 두드러져, 생각을 드러내고 반응을 만들며 흐름을 움직이는 힘을 보조 신호로 봅니다.',
    situation:'아이디어를 오래 묵히기보다 말·화면·글·결과물처럼 눈에 보이는 형태로 꺼낼 때 판단도 빨라질 수 있습니다.'
  },
  earth:{
    temperament:'표면 오행에서는 토가 상대적으로 두드러져, 흩어진 것을 정리하고 유지 가능한 형태로 묶는 힘을 보조 신호로 봅니다.',
    situation:'해야 할 일이 많을수록 순서와 기준을 먼저 정리해두면 안정적으로 오래 밀고 가기 쉬운 편입니다.'
  },
  metal:{
    temperament:'표면 오행에서는 금이 상대적으로 두드러져, 차이를 구분하고 기준을 세워 정교하게 다듬는 힘을 보조 신호로 봅니다.',
    situation:'여러 안을 비교하거나 오류를 찾아야 할 때, 무엇을 남기고 무엇을 버릴지 판단하는 속도가 붙기 쉽습니다.'
  },
  water:{
    temperament:'표면 오행에서는 수가 상대적으로 두드러져, 정보를 모으고 흐름을 읽으며 필요하면 경로를 바꾸는 힘을 보조 신호로 봅니다.',
    situation:'상황이 아직 확정되지 않았을 때도 여러 가능성을 열어두고 정보를 더 모은 뒤 움직이는 편이 자연스러울 수 있습니다.'
  }
};

const MONTH_ELEMENT_CONTEXT={
  wood:'월지가 목이라, 일상적인 환경에서는 변화·확장·새로운 시도를 요구받는 장면을 배경 신호로 함께 봅니다.',
  fire:'월지가 화라, 일상적인 환경에서는 표현·속도·가시적인 반응이 필요한 장면을 배경 신호로 함께 봅니다.',
  earth:'월지가 토라, 일상적인 환경에서는 유지·조율·현실적인 정리가 필요한 장면을 배경 신호로 함께 봅니다.',
  metal:'월지가 금이라, 일상적인 환경에서는 기준·선택·정확도를 요구받는 장면을 배경 신호로 함께 봅니다.',
  water:'월지가 수라, 일상적인 환경에서는 정보·변화·유동성에 대응해야 하는 장면을 배경 신호로 함께 봅니다.'
};

const TEMPERAMENT_PAIR_CONTEXT={
  'officer|output':'표현하고 바꾸려는 힘과 기준을 지키려는 힘이 같이 보여, 자유롭게 움직이되 결과의 책임까지 확인하려는 쪽으로 읽을 수 있습니다.',
  'officer|peer':'내 판단을 지키려는 힘과 역할·책임을 의식하는 힘이 같이 보여, 권한과 책임의 균형이 맞을 때 가장 안정적으로 힘을 쓰기 쉽습니다.',
  'officer|resource':'충분히 이해하려는 힘과 기준을 정확히 지키려는 힘이 같이 보여, 납득한 규칙 안에서는 완성도를 높이는 쪽으로 오래 집중하기 쉽습니다.',
  'officer|wealth':'현실적인 성과를 보려는 힘과 책임 기준이 같이 보여, 목표·기한·성과가 분명할수록 판단이 또렷해지는 쪽으로 읽습니다.',
  'output|peer':'직접 판단하고 바로 결과로 옮기는 힘이 같이 보여, 간섭이 적고 수정 권한이 있는 환경에서 속도가 붙기 쉽습니다.',
  'output|resource':'충분히 이해한 뒤 그것을 결과물로 바꾸는 힘이 같이 보여, 조사와 제작이 한 흐름으로 이어질 때 강점이 선명해집니다.',
  'output|wealth':'만든 것을 실제 가치와 연결하려는 힘이 같이 보여, 결과물이 반응·성과·수익으로 이어질 때 동기가 커지기 쉽습니다.',
  'peer|resource':'내 기준을 세우는 힘과 충분히 이해하려는 힘이 같이 보여, 남의 답을 그대로 따르기보다 스스로 납득한 방식으로 움직이려는 면이 강해질 수 있습니다.',
  'peer|wealth':'내 판단과 현실적인 성과 감각이 같이 보여, 선택과 결과의 거리가 가까울수록 몰입이 붙는 쪽으로 읽습니다.',
  'resource|wealth':'쌓고 이해하는 힘과 현실 가치로 바꾸려는 힘이 같이 보여, 준비를 충분히 한 뒤 실용적인 결과로 연결하려는 흐름이 자연스럽습니다.'
};

const categoryOf=name=>{
  if(name==='비견'||name==='겁재') return 'peer';
  if(name==='식신'||name==='상관') return 'output';
  if(name==='편재'||name==='정재') return 'wealth';
  if(name==='편관'||name==='정관') return 'officer';
  if(name==='편인'||name==='정인') return 'resource';
  return null;
};

const DAY_MASTER={
  甲:{
    title:'큰 방향을 먼저 잡고, 자기 방식으로 길을 내는 편',
    body:'세부를 하나씩 맞추기보다 먼저 전체 방향을 세우고 그쪽으로 밀어가는 힘을 중요하게 읽습니다. 기준이 서면 꾸준히 가지만, 납득되지 않는 방식에는 쉽게 힘을 주지 않는 편입니다.',
    pressure:'이미 비효율적이라고 느낀 방식을 계속 반복해야 할 때 답답함이 크게 쌓일 수 있어요.',
    guide:'처음 방향을 잡는 힘을 살리되, 중간에 작은 점검 지점을 두면 고집으로 굳는 것을 줄일 수 있습니다.'
  },
  乙:{
    title:'분위기와 조건을 읽고, 가장 현실적인 길을 찾는 편',
    body:'정면으로 밀어붙이기보다 주변 조건과 사람의 반응을 읽으면서 가장 통과하기 쉬운 경로를 찾는 힘을 중요하게 봅니다. 변화에 잘 맞추지만 선택지가 너무 많으면 결정을 미루기 쉽습니다.',
    pressure:'상대의 반응이나 주변 상황이 계속 바뀌면 내 기준까지 흔들리는 느낌을 받을 수 있어요.',
    guide:'유연함은 강점이지만, 선택 전에 “여기까지는 양보하지 않는다”는 기준 하나를 먼저 정해두는 편이 좋습니다.'
  },
  丙:{
    title:'생각을 밖으로 꺼내며 흐름을 움직이는 편',
    body:'머릿속에서 오래 묵히기보다 말·행동·결과물로 밖에 꺼내면서 상황을 움직이는 힘을 중요하게 읽습니다. 반응이 빠른 대신, 답답한 환경에서는 속도를 너무 올리기 쉽습니다.',
    pressure:'결정권 없이 기다리기만 해야 하거나 반응이 지나치게 느린 환경에서 에너지가 급격히 떨어질 수 있어요.',
    guide:'속도를 장점으로 쓰되, 중요한 결정은 한 번 더 확인하는 장치를 두면 시행착오를 줄일 수 있습니다.'
  },
  丁:{
    title:'작은 차이를 끝까지 보고, 완성도를 끌어올리는 편',
    body:'크게 밀어붙이기보다 디테일과 완성도를 붙잡고 다듬는 힘을 중요하게 읽습니다. 남들이 그냥 지나가는 어색함을 빨리 알아차리는 대신, 자기 기준이 높아 피로가 쌓이기 쉽습니다.',
    pressure:'마감은 다가오는데 마음에 들지 않는 부분이 남아 있을 때, 사소한 수정에 시간을 오래 쓰게 될 수 있어요.',
    guide:'디테일 감각은 강점이니 “충분히 좋은 상태”의 기준을 미리 정해두면 완성도와 속도를 같이 가져가기 좋습니다.'
  },
  戊:{
    title:'흔들리지 않는 기준과 구조를 먼저 만드는 편',
    body:'빠르게 바꾸기보다 오래 버틸 수 있는 구조와 기준을 세우는 힘을 중요하게 읽습니다. 책임 범위가 분명할수록 안정적으로 힘을 쓰지만, 이미 만든 틀을 바꾸는 데는 시간이 필요합니다.',
    pressure:'계획이 자주 뒤집히거나 역할이 계속 바뀌면 통제감을 잃은 느낌을 크게 받을 수 있어요.',
    guide:'안정성을 살리되, 처음부터 완벽한 구조를 만들기보다 수정 가능한 여지를 남겨두는 편이 좋습니다.'
  },
  己:{
    title:'흩어진 것을 정리해 실제로 굴러가게 만드는 편',
    body:'정보나 사람, 해야 할 일을 정리해서 현실적으로 작동하게 만드는 힘을 중요하게 봅니다. 세심하게 챙기는 능력이 있지만, 경계가 흐리면 다른 사람 몫까지 떠안기 쉽습니다.',
    pressure:'정리되지 않은 요청이 계속 쌓이거나 누가 맡을지 불분명한 일에서 피로가 커질 수 있어요.',
    guide:'정리 능력을 강점으로 쓰되, 맡을 범위와 끝나는 조건을 분명히 해두는 것이 중요합니다.'
  },
  庚:{
    title:'핵심을 가르고, 결정을 빠르게 내리는 편',
    body:'애매함을 오래 끌기보다 핵심을 나누고 결론을 내리는 힘을 중요하게 읽습니다. 문제 해결 속도는 빠르지만 감정이 얽힌 상황에서는 말이 너무 단정적으로 들릴 수 있습니다.',
    pressure:'결론 없이 회의만 길어지거나 책임자가 결정을 미룰 때 답답함이 크게 올라갈 수 있어요.',
    guide:'판단력은 강점이니, 사람 문제에서는 결론보다 맥락을 한 문장 더 확인하는 습관이 도움이 됩니다.'
  },
  辛:{
    title:'오차를 잡고, 더 나은 기준을 세우는 편',
    body:'작은 차이와 어색함을 잘 발견하고 무엇이 더 나은지 비교하는 힘을 중요하게 읽습니다. 품질을 높이는 데 강하지만, 스스로에게도 같은 기준을 적용해 피곤해질 수 있습니다.',
    pressure:'기준이 모호한 상태에서 “대충 알아서” 해달라는 요청을 받으면 오히려 결정이 어려워질 수 있어요.',
    guide:'정확도를 살리되, 모든 항목을 같은 수준으로 완벽하게 만들기보다 중요한 것부터 기준을 세우는 편이 좋습니다.'
  },
  壬:{
    title:'큰 흐름을 보고, 필요하면 경로를 바꾸는 편',
    body:'하나의 방식에 고정되기보다 상황 변화에 맞춰 경로를 바꾸는 힘을 중요하게 읽습니다. 여러 가능성을 동시에 보는 장점이 있지만 선택지가 너무 많아지면 집중이 분산될 수 있습니다.',
    pressure:'가능성이 많이 열려 있는데 우선순위가 정해지지 않은 상황에서 이것저것 동시에 벌이기 쉬워요.',
    guide:'넓게 보는 힘을 살리되, 한 시점에 실제로 움직일 목표는 한두 개로 제한하는 편이 좋습니다.'
  },
  癸:{
    title:'미세한 신호를 모아, 충분히 읽은 뒤 움직이는 편',
    body:'앞에 나서기보다 정보와 분위기를 세밀하게 모아서 판단하는 힘을 중요하게 읽습니다. 보이지 않는 맥락을 잘 잡지만 생각이 깊어질수록 결정이 늦어질 수 있습니다.',
    pressure:'정보가 부족하거나 상대 의도를 확신하기 어려운 상황에서는 결정을 미루며 계속 확인하고 싶어질 수 있어요.',
    guide:'관찰력은 강점이니, 필요한 정보가 어느 정도 모였을 때 결정을 끝내는 기준을 정해두는 편이 좋습니다.'
  }
};

const KIND_CONTEXT={
  output:{
    temperament:'식상이 반복되면 생각을 안에서만 정리하기보다 말·글·디자인·코드·작업물처럼 밖으로 꺼내면서 스스로도 이해가 선명해지는 경향을 더 강하게 봅니다.',
    career:'결과물이 눈에 보이는 일, 문제를 발견하고 직접 고치는 일, 기존 방식을 더 낫게 만드는 일에서 만족도가 높아지기 쉽습니다.',
    relationship:'감정도 결국 표현되어야 풀리는 편이라, 속으로 오래 참기보다 말이나 행동으로 반응이 나오는 쪽에 가깝습니다.',
    money:'능력이나 아이디어를 결과물로 만들어야 수익으로 이어지는 연결이 선명해집니다.'
  },
  resource:{
    temperament:'인성이 반복되면 바로 반응하기보다 자료를 모으고 자기 방식으로 이해한 뒤 움직여야 마음이 놓이는 면이 강해집니다.',
    career:'자료를 파고들고 구조를 이해한 뒤 다시 정리하는 과정이 포함된 일에서 강점을 쓰기 쉽습니다.',
    relationship:'상대가 왜 그렇게 행동했는지 맥락을 이해해야 감정이 정리되는 편이라 설명과 신뢰가 중요해집니다.',
    money:'도구·배움·준비에 먼저 자원을 쓰고, 그 축적이 나중에 성과나 수익으로 전환되는 흐름이 자연스럽습니다.'
  },
  peer:{
    temperament:'비겁이 반복되면 남의 기준에 맞추기보다 내가 직접 판단하고 내 방식으로 해보려는 성향이 더 또렷해집니다.',
    career:'권한과 책임이 같이 주어지는 환경, 내 판단으로 속도를 낼 수 있는 역할에서 힘을 쓰기 쉽습니다.',
    relationship:'가까운 관계에서도 서로의 영역이 존중되어야 편하고, 통제받는 느낌에는 예민하게 반응할 수 있습니다.',
    money:'공동 비용이나 수익 배분처럼 “누가 얼마를 맡는지”가 흐려지지 않게 기준을 분명히 하는 것이 중요합니다.'
  },
  wealth:{
    temperament:'재성이 드러나면 현실적으로 쓸 수 있는지, 얼마나 효율적인지, 결과가 무엇으로 남는지를 자연스럽게 따지는 면이 강해집니다.',
    career:'고객 반응·매출·전환·예산·성과처럼 결과가 측정되는 일에서 판단이 빨라질 수 있습니다.',
    relationship:'관계에서도 말보다 실제 행동과 시간 배분처럼 눈에 보이는 성의를 중요하게 볼 수 있습니다.',
    money:'가격·예산·수익처럼 측정 가능한 기준을 세울수록 판단이 선명해지는 편입니다.'
  },
  officer:{
    temperament:'관성이 드러나면 약속·책임·순서·기준을 중요하게 보고, 해야 할 일을 제대로 마무리하려는 압력이 커집니다.',
    career:'역할과 책임, 마감 기준이 분명한 환경에서 안정적으로 성과를 내기 쉽습니다.',
    relationship:'좋아하는 감정만큼이나 일관성, 약속을 지키는 태도, 책임감을 관계의 중요한 기준으로 보기 쉽습니다.',
    money:'즉흥적인 판단보다 계약·기한·고정비처럼 관리 가능한 틀을 두는 편이 편할 수 있습니다.'
  }
};

const countVisible=result=>{
  const counts={peer:0,output:0,wealth:0,officer:0,resource:0};
  for(const group of [result.tenGods.visibleStems,result.tenGods.visibleBranches]){
    for(const value of Object.values(group)){
      const kind=categoryOf(value);
      if(kind) counts[kind]+=1;
    }
  }
  return counts;
};

const hiddenKinds=result=>{
  const kinds=new Set();
  for(const layers of Object.values(result.hiddenStems.pillars)){
    if(!layers) continue;
    for(const layer of layers){
      const kind=categoryOf(layer.tenGod);
      if(kind) kinds.add(kind);
    }
  }
  return kinds;
};

const sortKinds=counts=>Object.keys(counts)
  .sort((a,b)=>counts[b]-counts[a]||a.localeCompare(b));

const visibleEvidence=(counts,limit=2)=>sortKinds(counts)
  .filter(kind=>counts[kind]>0)
  .slice(0,limit)
  .map(kind=>`${CATEGORY_LABELS[kind]} ${counts[kind]}`);

const pairKey=(first,second)=>[first,second].filter(Boolean).sort().join('|');

const elementProfile=result=>{
  const counts=result.fiveElements?.counts??{};
  const entries=Object.keys(ELEMENT_LABELS).map(key=>[key,Number(counts[key]??0)]);
  const total=entries.reduce((sum,[,count])=>sum+count,0);
  const ranked=entries.sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const [dominant,dominantCount]=ranked[0]??['earth',0];
  const [,secondCount]=ranked[1]??[null,0];
  return {
    dominant,
    dominantCount,
    total,
    tied:dominantCount===secondCount,
    evidence:dominantCount>0
      ?`표면 오행 ${ELEMENT_LABELS[dominant]} ${dominantCount}/${total}`
      :null
  };
};

const monthElement=result=>result.pillars?.month?.branch?.element??null;

const specificRelations=result=>result.branchRelations.items
  .filter(item=>Array.isArray(item.pillars)&&item.pillars.includes('day'));

const relationEvidence=item=>`${item.label} ${item.branches.join('·')}`;

const firstUsefulRelation=result=>{
  const day=specificRelations(result);
  if(day.length) return day[0];
  return result.branchRelations.items[0]??null;
};

const monthTenGod=result=>result.tenGods.visibleBranches.month;
const monthKind=result=>categoryOf(monthTenGod(result));

const uniqueParts=parts=>[...new Set(parts.filter(Boolean))];

const stripKindRepeatLead=(kind,text)=>{
  const lead=`${withSubject(CATEGORY_LABELS[kind])} 반복되면 `;
  const value=String(text||'');
  return value.startsWith(lead)?value.slice(lead.length):value;
};

const makeSection=({title,body,situations,guide,evidence})=>({
  title,
  body,
  situations:uniqueParts(situations).slice(0,2),
  guide,
  evidence:uniqueParts(evidence).slice(0,5),
  confidence:'medium',
  methodId:'reading-v2-structural'
});

const careerPair=(first,second)=>{
  const pair=new Set([first,second]);
  if(pair.has('output')&&pair.has('resource')) return {
    title:'이해한 것을 결과물로 바꾸는 일에서 강점이 살아나요',
    situation:'자료를 파악한 뒤 직접 화면·문서·기획·콘텐츠·코드처럼 손에 잡히는 결과로 정리하는 과정에서 몰입이 붙기 쉽습니다.',
    guide:'조사만 하거나 제작만 하는 역할보다 “이해 → 개선 → 결과”가 한 흐름 안에 있는 일을 고르면 강점을 더 오래 쓰기 좋습니다.'
  };
  if(pair.has('output')&&pair.has('wealth')) return {
    title:'만든 것을 실제 가치로 연결할 때 속도가 붙어요',
    situation:'프로모션, 상품화, 콘텐츠, 영업 지원처럼 결과물이 고객 반응이나 매출 같은 현실 지표와 이어질 때 동기가 분명해지기 쉽습니다.',
    guide:'잘 만드는 것에서 끝내지 말고 “누가 왜 쓰는가”까지 같이 보면 성과가 더 또렷해질 수 있습니다.'
  };
  if(pair.has('output')&&pair.has('peer')) return {
    title:'내 판단으로 직접 고치고 만드는 역할이 잘 맞아요',
    situation:'문제를 발견했는데 승인만 기다려야 하는 환경보다, 일정 범위 안에서 바로 수정하고 결과를 확인할 수 있을 때 속도가 붙기 쉽습니다.',
    guide:'자율성이 큰 만큼 완료 기준과 우선순위를 스스로 정해두는 것이 번아웃을 줄이는 데 도움이 됩니다.'
  };
  if(pair.has('resource')&&pair.has('officer')) return {
    title:'복잡한 기준을 이해해 정확하게 풀어내는 데 강점이 있어요',
    situation:'정책·기획·분석·QA처럼 자료와 기준을 충분히 이해하고 오류 없이 정리해야 하는 일에서 신뢰를 얻기 쉽습니다.',
    guide:'준비가 길어지지 않도록 조사 종료 시점과 결정 시점을 따로 정해두면 좋습니다.'
  };
  if(pair.has('wealth')&&pair.has('officer')) return {
    title:'성과와 책임 범위가 분명한 일에서 안정적으로 힘을 써요',
    situation:'예산·일정·목표가 명확한 프로젝트에서 진행 상황을 관리하고 끝까지 마무리하는 역할이 비교적 편할 수 있습니다.',
    guide:'숫자와 책임을 혼자 떠안지 않도록 의사결정 권한도 함께 확보하는 것이 중요합니다.'
  };
  if(pair.has('peer')&&pair.has('wealth')) return {
    title:'내 판단이 바로 성과로 이어지는 구조에서 동기가 커져요',
    situation:'프리랜스·사이드 프로젝트·작은 사업처럼 선택과 결과의 연결이 가까울수록 몰입이 붙기 쉽습니다.',
    guide:'자율성과 수익을 동시에 보려면 가격·범위·납기를 초기에 명확히 정해두는 편이 좋습니다.'
  };
  if(pair.has('peer')&&pair.has('resource')) return {
    title:'내가 납득한 방식으로 깊게 파고드는 일에서 강점이 살아나요',
    situation:'자료를 충분히 이해한 뒤 내 기준으로 다시 정리하거나, 스스로 방법을 선택해 문제를 푸는 역할에서 집중이 붙기 쉽습니다.',
    guide:'자율성만 큰 자리보다 필요한 자료와 판단 권한이 함께 주어지는 환경을 고르는 편이 좋습니다.'
  };
  if(pair.has('peer')&&pair.has('officer')) return {
    title:'권한과 책임이 같이 주어질 때 가장 안정적으로 힘을 써요',
    situation:'내가 결정할 수 있는 범위와 반드시 지켜야 할 기준이 동시에 분명한 프로젝트에서 실행력이 안정되기 쉽습니다.',
    guide:'책임만 크고 결정권이 없는 자리는 피하고, 맡은 범위 안에서는 스스로 판단할 수 있는지 확인해보세요.'
  };
  if(pair.has('output')&&pair.has('officer')) return {
    title:'만드는 힘에 기준과 마감이 붙을 때 완성도가 올라가요',
    situation:'디자인·콘텐츠·개발·기획처럼 직접 결과물을 만들되 품질 기준과 마감이 분명한 일에서 강점이 선명해질 수 있습니다.',
    guide:'자유롭게 만드는 시간과 검수 기준을 따로 두면 표현력과 완성도를 같이 가져가기 좋습니다.'
  };
  if(pair.has('resource')&&pair.has('wealth')) return {
    title:'쌓은 전문성을 실제 가치로 바꾸는 일에 강점이 있어요',
    situation:'리서치·분석·전문 지식을 서비스, 제안, 상품, 콘텐츠처럼 실제로 쓰이는 형태로 바꾸는 과정에서 만족도가 높아지기 쉽습니다.',
    guide:'배우고 준비하는 단계에만 오래 머물지 않도록, 일정 시점마다 결과물이나 가격으로 전환하는 마감선을 두는 편이 좋습니다.'
  };
  return null;
};

export function buildReadingV2(result){
  const counts=countVisible(result);
  const hidden=hiddenKinds(result);
  const ranked=sortKinds(counts);
  const primary=ranked.find(kind=>counts[kind]>0)??'output';
  const secondary=ranked.find(kind=>kind!==primary&&counts[kind]>0)??null;
  const dm=DAY_MASTER[result.dayMaster.hanja]??DAY_MASTER.丁;
  const relation=firstUsefulRelation(result);
  const dayRelation=relation&&Array.isArray(relation.pillars)&&relation.pillars.includes('day');
  const month=monthKind(result);
  const elements=elementProfile(result);
  const monthEl=monthElement(result);
  const pairContext=secondary?TEMPERAMENT_PAIR_CONTEXT[pairKey(primary,secondary)]:null;
  const elementContext=!elements.tied?ELEMENT_CONTEXT[elements.dominant]:null;
  const monthContext=monthEl?MONTH_ELEMENT_CONTEXT[monthEl]:null;

  const temperamentOverlay=KIND_CONTEXT[primary]?.temperament;
  const temperamentSituations=[
    counts[primary]>=2
      ?`${withSubject(CATEGORY_LABELS[primary])} 표면에서 ${counts[primary]}번 보여, 이 성향이 한 번의 반응보다 여러 장면에서 반복해서 나타나는 쪽으로 읽습니다.`
      :dm.pressure,
    secondary&&counts[secondary]>=2
      ?`${CATEGORY_LABELS[secondary]}도 반복되어, ${stripKindRepeatLead(secondary,KIND_CONTEXT[secondary].temperament)}`
      :elementContext?.situation??monthContext??KIND_CONTEXT[primary]?.temperament
  ];
  const temperament=makeSection({
    title:dm.title,
    body:uniqueParts([
      dm.body,
      counts[primary]>=2?temperamentOverlay:null,
      pairContext,
      elementContext?.temperament,
      monthContext
    ]).join(' '),
    situations:temperamentSituations,
    guide:dm.guide,
    evidence:[
      `일간 ${result.dayMaster.hanja}`,
      ...visibleEvidence(counts,2),
      elements.evidence,
      monthEl?`월지 오행 ${ELEMENT_LABELS[monthEl]}`:null,
      monthTenGod(result)?`월지 ${monthTenGod(result)}`:null
    ]
  });

  const pair=careerPair(primary,secondary);
  const careerTitle=pair?.title??(
    primary==='output'?'내 손을 거쳐 달라지는 일이 잘 맞아요':
    primary==='resource'?'충분히 이해하고 정리할 수 있는 일이 잘 맞아요':
    primary==='peer'?'권한과 책임이 함께 있는 일이 잘 맞아요':
    primary==='wealth'?'결과가 눈에 보이는 일이 잘 맞아요':
    '기준과 책임이 분명한 일이 잘 맞아요'
  );
  const careerBody=uniqueParts([
    KIND_CONTEXT[primary]?.career,
    secondary&&counts[secondary]>=1?KIND_CONTEXT[secondary]?.career:null,
    month&&month!==primary&&month!==secondary
      ?`특히 월지의 대표 십성이 ${withCopulaRa(monthTenGod(result))}, 일상적인 사회 환경에서는 ${KIND_CONTEXT[month]?.career??'역할과 환경의 영향을 함께 보는 편이 자연스럽습니다.'}`
      :null
  ]).join(' ');
  const career=makeSection({
    title:careerTitle,
    body:careerBody,
    situations:[
      pair?.situation??KIND_CONTEXT[primary]?.career,
      primary==='output'?'단순 반복·수정 요청만 받고 왜 바꾸는지 판단할 여지가 거의 없을 때 만족도가 떨어질 수 있습니다.':
      primary==='resource'?'충분한 맥락 없이 바로 답을 내야 하는 상황에서는 준비가 덜 됐다는 느낌을 받을 수 있습니다.':
      primary==='peer'?'세세한 방식까지 계속 통제받으면 성과와 별개로 피로가 빨리 쌓일 수 있습니다.':
      primary==='wealth'?'성과 기준이 계속 바뀌거나 무엇을 잘한 것으로 볼지 모호하면 동기가 떨어질 수 있습니다.':
      '책임은 큰데 기준과 권한이 불분명한 환경에서 부담을 크게 느낄 수 있습니다.'
    ],
    guide:pair?.guide??(
      primary==='output'?'완성물을 직접 만들거나 개선 권한이 있는 역할을 우선해 보세요.':
      primary==='resource'?'조사·분석·정리 시간이 실제 업무로 인정되는 환경을 고르는 편이 좋습니다.':
      primary==='peer'?'자율성뿐 아니라 책임 범위와 완료 기준도 함께 분명한 자리가 좋습니다.':
      primary==='wealth'?'성과가 어떤 숫자나 반응으로 측정되는지 미리 확인하면 판단이 쉬워집니다.':
      '책임과 함께 결정 권한도 주어지는지 확인하는 것이 중요합니다.'
    ),
    evidence:[...visibleEvidence(counts,3),monthTenGod(result)?`월지 ${monthTenGod(result)}`:null]
  });

  const wealthVisible=counts.wealth>0;
  const wealthHidden=hidden.has('wealth');
  const outputVisible=counts.output>0;
  const resourceVisible=counts.resource>0;
  let moneyTitle='돈은 한 글자보다 만들어지는 경로를 같이 보는 편이 중요해요';
  let moneyBody='재성을 한두 글자만 보고 재물운을 단정하기보다, 어떤 능력과 결과가 실제 가치로 연결되는지 함께 보는 편이 더 자연스럽습니다.';
  if(wealthVisible&&outputVisible){
    moneyTitle='잘하는 것을 결과물로 만들 때 수익 연결도 선명해져요';
    moneyBody='재성과 식상이 함께 표면에 보여, 돈 자체만 좇기보다 내가 만든 결과가 고객·성과·계약으로 연결되는 구조를 중요하게 읽습니다.';
  }else if(!wealthVisible&&wealthHidden){
    moneyTitle='돈은 앞에 내세우기보다, 쌓은 것을 바꿀 때 붙는 편';
    moneyBody='재성은 표면보다 지장간에서 확인됩니다. 처음부터 돈을 중심에 놓기보다 기술·경험·결과를 쌓고, 그것을 계약·상품·가격으로 바꾸는 순간에 재물 이슈가 더 선명해지는 구조로 읽는 편이 자연스럽습니다.';
  }else if(wealthVisible){
    moneyTitle='돈과 성과를 현실적인 기준으로 보는 편';
    moneyBody='재성이 표면에 드러나 있어 가격·예산·성과처럼 측정 가능한 결과를 비교적 직접적으로 의식하는 편으로 읽습니다.';
  }else if(resourceVisible){
    moneyTitle='먼저 쌓고, 나중에 가치로 바꾸는 흐름이 자연스러워요';
    moneyBody='표면 재성보다 인성의 신호가 더 앞에 있어, 배움·도구·전문성에 먼저 자원을 투입한 뒤 그 축적을 수익으로 바꾸는 경로를 중요하게 볼 수 있습니다.';
  }
  const money=makeSection({
    title:moneyTitle,
    body:moneyBody+(outputVisible&&!wealthVisible?' 식상이 함께 보이면 “잘하는 것”을 남이 살 수 있는 형태로 묶는 과정이 특히 중요합니다.':''),
    situations:[
      wealthVisible?'가격, 예산, 계약 조건처럼 숫자가 분명해지면 판단도 빨라지는 편으로 읽을 수 있습니다.':
      wealthHidden?'실력은 쌓였는데 가격을 붙이거나 제안서를 만드는 순간이 늦어져 수익화가 뒤로 밀릴 수 있습니다.':
      '수익만 보고 방향을 잡기보다 먼저 전문성이나 결과물을 만들 때 흐름이 자연스러울 수 있습니다.',
      counts.peer>=2&&wealthVisible?'공동 작업에서는 수익 배분·비용 부담·업무 범위를 초기에 명확히 할수록 불필요한 마찰을 줄이기 좋습니다.':
      resourceVisible?'배움과 도구에 돈을 쓰는 것이 낭비가 되지 않도록 “언제 결과로 회수할지”까지 같이 정해두면 좋습니다.':
      '수익 목표를 막연하게 두기보다 결과물 하나당 가격이나 목표를 정하면 흐름을 확인하기 쉽습니다.'
    ],
    guide:wealthVisible&&outputVisible
      ?'기술이나 아이디어를 상품·서비스·포트폴리오처럼 반복해서 팔 수 있는 단위로 묶어보는 것이 이 구조를 현실적으로 쓰는 방법입니다.'
      :wealthHidden
      ?'준비가 충분해질 때까지 기다리기보다, 작은 단위라도 가격을 붙여 시장 반응을 확인하는 과정이 도움이 됩니다.'
      :'돈의 많고 적음보다 “무엇이 실제 가치로 바뀌는가”를 기록해두는 편이 좋습니다.',
    evidence:[
      wealthVisible?`재성 ${counts.wealth}`:wealthHidden?'재성 지장간':null,
      outputVisible?`식상 ${counts.output}`:null,
      resourceVisible?`인성 ${counts.resource}`:null,
      !wealthVisible&&!wealthHidden&&!outputVisible&&!resourceVisible?`일간 ${result.dayMaster.hanja}`:null
    ]
  });

  const relationType=relation?.type;
  let relationshipTitle='가까운 사이일수록 방식과 일관성이 중요해요';
  let relationshipBody='관계는 한 글자보다 일지와 관성·비겁·식상, 그리고 지지 관계를 함께 보는 편이 자연스럽습니다.';
  let relationSituation=null;
  let relationGuide=null;
  if(relationType==='clash'){
    relationshipTitle=dayRelation?'가까워질수록 서로의 속도와 방향 차이가 크게 느껴질 수 있어요':'관계와 환경의 리듬 차이를 크게 느끼는 편';
    relationshipBody+=' 충이 보여, 관계에서 누가 옳은지보다 일정·거리·우선순위처럼 서로 다른 방향이 부딪히는 장면을 중요하게 봅니다.';
    relationSituation='만나고 싶은 타이밍, 일의 우선순위, 연락 템포처럼 작은 리듬이 계속 어긋날 때 감정보다 먼저 피로가 쌓일 수 있습니다.';
    relationGuide='갈등이 생겼을 때 감정 자체보다 “지금 서로 다르게 움직이는 것이 무엇인지”를 구체적으로 말하면 풀기가 쉬워질 수 있습니다.';
  }else if(relationType==='punishment'||relationType==='self-punishment'){
    relationshipTitle='같은 문제를 반복해서 고치려는 힘이 관계에도 들어오기 쉬워요';
    relationshipBody+=' 형의 관계가 보여, 한번 마음에 걸린 문제를 그냥 넘기기보다 이유와 기준을 계속 확인하려는 경향을 보조적으로 읽습니다.';
    relationSituation='상대가 이미 넘어간 일이라도 내가 납득하지 못한 부분이 남아 있으면 다시 꺼내 확인하고 싶어질 수 있습니다.';
    relationGuide='해결하려는 힘이 관계를 압박하지 않도록, 지금 필요한 것이 설명인지 사과인지 변화인지 먼저 구분해보는 편이 좋습니다.';
  }else if(relationType==='combine'||relationType==='three-harmony'){
    relationshipTitle='접점을 찾고 관계를 이어가는 힘이 비교적 자연스러워요';
    relationshipBody+=' 합의 관계가 보여, 서로 다른 사람 사이에서 공통점을 찾고 맞춰가는 흐름을 보조 신호로 읽을 수 있습니다.';
    relationSituation='처음에는 취향이나 관심사처럼 접점을 빠르게 찾지만, 맞춰주는 것이 계속 쌓이면 나중에 내 기준이 뒤늦게 드러날 수 있습니다.';
    relationGuide='잘 맞는다는 느낌과 실제로 필요한 경계는 별개이므로, 가까워질수록 내 기준도 같이 말해두는 편이 좋습니다.';
  }else if(relationType==='harm'||relationType==='break'){
    relationshipTitle='큰 충돌보다 작은 어긋남을 오래 기억할 수 있어요';
    relationshipBody+=' 해·파 관계는 직접적인 충돌보다 기대와 실제 행동 사이의 미세한 어긋남을 보조적으로 읽는 데 사용합니다.';
    relationSituation='말로는 괜찮다고 했는데 행동이 다르거나, 약속의 디테일이 반복해서 어긋날 때 서운함이 쌓일 수 있습니다.';
    relationGuide='상대가 알아서 알아주길 기다리기보다, 기대했던 행동을 구체적으로 말하는 편이 오해를 줄이기 좋습니다.';
  }
  const relationshipKind=counts.officer>0?'officer':counts.peer>0?'peer':counts.output>0?'output':counts.resource>0?'resource':'wealth';
  relationshipBody+=` ${KIND_CONTEXT[relationshipKind].relationship}`;
  const relationship=makeSection({
    title:relationshipTitle,
    body:relationshipBody,
    situations:[
      relationSituation??KIND_CONTEXT[relationshipKind].relationship,
      relationshipKind==='officer'?'연락 빈도보다 약속을 지키는지, 말과 행동이 일치하는지를 더 중요하게 볼 수 있습니다.':
      relationshipKind==='peer'?'가까워도 각자 혼자 쓰는 시간과 결정권이 있어야 관계가 편해질 수 있습니다.':
      relationshipKind==='output'?'속으로 참다가 한 번에 말하기보다, 불편한 지점을 작게 자주 표현하는 편이 관계 유지에 유리합니다.':
      relationshipKind==='resource'?'상대의 설명이 충분하지 않으면 혼자 맥락을 추측하면서 생각이 길어질 수 있습니다.':
      '감정보다 실제 행동과 시간 배분에서 성의를 확인하려는 경향이 나타날 수 있습니다.'
    ],
    guide:relationGuide??(
      relationshipKind==='officer'?'관계에서 원하는 약속과 기준을 처음부터 구체적으로 말해두는 편이 좋습니다.':
      relationshipKind==='peer'?'가까움과 독립성을 동시에 인정하는 관계가 오래 가기 쉽습니다.':
      relationshipKind==='output'?'표현의 양보다 타이밍과 말의 강도를 조절하는 것이 중요합니다.':
      relationshipKind==='resource'?'혼자 해석하기 전에 궁금한 맥락을 직접 확인하는 습관이 도움이 됩니다.':
      '말보다 행동을 보되, 상대에게 기대하는 행동도 구체적으로 알려주는 편이 좋습니다.'
    ),
    evidence:[
      relation?relationEvidence(relation):null,
      counts.officer>0?`관성 ${counts.officer}`:null,
      counts.peer>0?`비겁 ${counts.peer}`:null,
      counts.output>0?`식상 ${counts.output}`:null,
      `일지 ${result.pillars.day.branch.hanja}`
    ]
  });

  return {temperament,relationship,career,money};
}
