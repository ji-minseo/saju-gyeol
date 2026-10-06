import {yearPillar,tenGod,branchTenGod} from '../engine/rules.mjs';
import {branchRelations} from '../engine/derived-facts.mjs';
import {getJieTermsForYear} from '../engine/solar-term-provider.mjs';
import {resolveSeoulCivilTime} from '../engine/korea-time.mjs';

const GOD_FLOW={
  비견:{
    keyword:'내 선택 · 독립',
    body:'남의 기준보다 내가 직접 판단하고 움직이는 일이 앞에 오기 쉽습니다. 동료나 비슷한 위치의 사람과 비교·협업하는 장면도 함께 늘 수 있어요.',
    action:'혼자 결정할 것과 함께 맞출 것을 먼저 나누면 힘을 덜 소모합니다.'
  },
  겁재:{
    keyword:'경쟁 · 분배',
    body:'사람·시간·돈을 어떻게 나눌지, 경쟁과 협업 사이에서 내 몫을 어디까지 가져갈지가 중요한 주제가 되기 쉽습니다.',
    action:'공동 작업과 비용은 역할·범위·배분 기준을 초기에 분명히 하는 편이 좋습니다.'
  },
  식신:{
    keyword:'생산 · 루틴',
    body:'꾸준히 만들고 반복하면서 실력을 결과로 쌓는 일이 앞에 오기 쉽습니다. 생활 리듬과 작업 습관을 안정시키는 것도 중요해집니다.',
    action:'큰 한 방보다 반복 가능한 루틴과 산출물 단위를 만드는 데 초점을 맞춰보세요.'
  },
  상관:{
    keyword:'표현 · 개선',
    body:'기존 방식의 답답한 점을 발견하고 더 나은 방식으로 바꾸거나, 내 생각을 말·글·콘텐츠·작업물로 강하게 드러내는 일이 늘기 쉽습니다.',
    action:'문제를 지적하는 데서 끝내지 말고 대안이나 결과물까지 같이 보여주면 힘을 더 잘 쓸 수 있습니다.'
  },
  편재:{
    keyword:'기회 · 외부활동',
    body:'새 사람·새 프로젝트·거래처럼 바깥에서 들어오는 기회를 빠르게 판단하는 일이 많아지기 쉽습니다. 움직이는 만큼 선택지도 늘어나는 흐름입니다.',
    action:'기회가 많을수록 시간과 비용 상한선을 먼저 정해두는 편이 좋습니다.'
  },
  정재:{
    keyword:'관리 · 현실화',
    body:'예산·수입·일정처럼 측정 가능한 결과를 안정적으로 관리하는 일이 중요해집니다. 크게 벌이기보다 꾸준히 남기는 감각이 앞에 오기 쉽습니다.',
    action:'고정비·반복 수익·완료 기준처럼 숫자로 확인할 수 있는 기준을 만들어보세요.'
  },
  편관:{
    keyword:'압박 · 돌파',
    body:'마감·책임·경쟁처럼 외부 압력이 강해지거나, 미뤄둔 문제를 빠르게 정리해야 하는 장면이 앞에 오기 쉽습니다.',
    action:'압박을 전부 혼자 받아내기보다 우선순위와 책임 범위를 먼저 분리하는 것이 중요합니다.'
  },
  정관:{
    keyword:'책임 · 체계',
    body:'역할·약속·계약·평가처럼 기준이 분명한 일이 중요해지기 쉽습니다. 무엇을 맡고 어디까지 책임질지가 더 선명해지는 흐름입니다.',
    action:'책임이 커질수록 결정 권한과 평가 기준도 함께 확인하는 편이 좋습니다.'
  },
  편인:{
    keyword:'탐색 · 재해석',
    body:'익숙한 방식보다 새로운 도구·관점·분야를 파고들거나, 기존에 알던 것을 다른 방식으로 다시 이해하는 일이 많아지기 쉽습니다.',
    action:'흥미로운 것을 넓게 탐색하되 실제로 써볼 주제를 하나 정해 결과까지 연결해보세요.'
  },
  정인:{
    keyword:'학습 · 정리',
    body:'배우고 정리하고 문서화하는 과정, 또는 도움과 자원을 받아 기반을 다지는 일이 중요해지기 쉽습니다.',
    action:'준비만 길어지지 않도록 배운 것을 언제 실제 결과에 적용할지 시점을 같이 정해두세요.'
  }
};

const RELATION_FLOW={
  clash:{
    label:'충',
    body:'원국의 지지와 충이 걸려 있어, 익숙한 일정·관계·환경의 리듬을 그대로 유지하기보다 조정할 일이 생기기 쉬운 흐름으로 봅니다.',
    action:'무엇이 바뀌어야 하는지 구체적으로 나누고, 한꺼번에 전부 바꾸려 하지 않는 편이 좋습니다.'
  },
  punishment:{
    label:'형',
    body:'형의 관계가 걸려 있어, 마음에 걸리는 문제를 반복해서 점검하거나 수정하려는 압력이 커질 수 있습니다.',
    action:'수정 자체가 목표가 되지 않도록 완료 기준과 중단 시점을 정해두세요.'
  },
  'self-punishment':{
    label:'자형',
    body:'같은 지지가 겹치는 자형 신호가 있어, 익숙한 패턴을 스스로 반복하거나 같은 문제를 오래 붙잡는 흐름을 보조적으로 읽습니다.',
    action:'반복되는 문제는 의지보다 환경·루틴을 바꾸는 쪽에서 해결책을 찾아보세요.'
  },
  combine:{
    label:'육합',
    body:'합의 관계가 걸려 있어 사람·프로젝트·역할 사이의 접점을 찾고 연결하는 일이 비교적 자연스럽게 늘 수 있습니다.',
    action:'잘 맞는다는 느낌만 보지 말고 실제 조건과 역할도 함께 확인하는 편이 좋습니다.'
  },
  'three-harmony':{
    label:'삼합',
    body:'삼합의 연결이 만들어지는 시기라 여러 요소가 한 방향으로 모이는 흐름을 보조적으로 읽을 수 있습니다.',
    action:'흩어진 기회를 한 주제 아래 묶을 수 있는지 살펴보세요.'
  },
  harm:{
    label:'해',
    body:'큰 충돌보다 기대와 실제 행동 사이의 작은 어긋남이 신경 쓰일 수 있는 흐름으로 봅니다.',
    action:'추측으로 오래 끌기보다 기대했던 조건을 구체적으로 확인하는 편이 좋습니다.'
  },
  break:{
    label:'파',
    body:'이미 굴러가던 방식의 연결이 느슨해지거나 작은 재정비가 필요한 흐름을 보조적으로 읽습니다.',
    action:'완전히 버리기보다 무엇을 남기고 무엇을 교체할지 구분해보세요.'
  }
};

const parseIsoDate=value=>{
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));
  if(!match) throw new TypeError('date must be YYYY-MM-DD');
  return {year:Number(match[1]),month:Number(match[2]),day:Number(match[3])};
};

const dateFromValue=value=>{
  if(typeof value==='string') return parseIsoDate(value);
  if(value instanceof Date&&!Number.isNaN(value.getTime())){
    return {year:value.getFullYear(),month:value.getMonth()+1,day:value.getDate()};
  }
  throw new TypeError('today must be Date or YYYY-MM-DD');
};

const seoulNoonEpoch=date=>{
  const resolution=resolveSeoulCivilTime({...date,hour:12,minute:0});
  if(resolution.status!=='valid') throw new RangeError('target date noon could not be resolved in Asia/Seoul');
  return resolution.matches[0].epochMs;
};

const sajuYearAt=date=>{
  const terms=getJieTermsForYear(date.year);
  const liChun=terms.find(term=>term.name==='입춘');
  if(!liChun) throw new Error('Li Chun boundary is missing');
  return seoulNoonEpoch(date)>=liChun.epochMs?date.year:date.year-1;
};

const ageMonthsAt=(birth,target)=>{
  let months=(target.year-birth.year)*12+(target.month-birth.month);
  if(target.day<birth.day) months-=1;
  return Math.max(0,months);
};

const natalBranchEntries=result=>[
  ['year',result.pillars.year],
  ['month',result.pillars.month],
  ['day',result.pillars.day],
  ['hour',result.pillars.hour]
].filter(([,pillar])=>pillar).map(([key,pillar])=>({key,branchIndex:pillar.branchIndex}));

const relationPriority={
  clash:0,
  punishment:1,
  'self-punishment':2,
  combine:3,
  harm:4,
  break:5,
  'three-harmony':6
};

const flowRelations=(result,branchIndex,key)=>{
  const items=branchRelations([...natalBranchEntries(result),{key,branchIndex}]);
  return items
    .filter(item=>{
      if(Array.isArray(item.pillars)) return item.pillars.includes(key);
      if(item.type==='three-harmony') return item.branches.includes(result.pillars.day?.branch.hanja)||true;
      return false;
    })
    .sort((a,b)=>(relationPriority[a.type]??99)-(relationPriority[b.type]??99));
};

const relationEvidence=item=>item?`${item.label} ${item.branches.join('·')}`:null;

const relationText=item=>{
  if(!item) return null;
  return RELATION_FLOW[item.type]??{
    label:item.label,
    body:`${item.label} 관계가 함께 보여 기존 원국과의 상호작용을 보조적으로 확인합니다.`,
    action:'한 가지 신호만으로 사건을 단정하지 말고 실제 상황과 함께 확인해보세요.'
  };
};

const godPairSummary=(stemGod,branchGod)=>{
  const stem=GOD_FLOW[stemGod];
  const branch=GOD_FLOW[branchGod];
  return {
    title:stemGod===branchGod
      ?`${stem.keyword}가 반복해서 앞에 오는 흐름`
      :`${stem.keyword}와 ${branch.keyword}가 함께 움직이는 흐름`,
    body:`겉으로 드러나는 주제는 ${stemGod}의 ${stem.keyword}, 생활 속 바탕에는 ${branchGod}의 ${branch.keyword}가 놓입니다. ${stem.body}`,
    guide:stemGod===branchGod?stem.action:`${stem.action} 동시에 ${branch.action}`
  };
};

const buildAnnual=(result,year,currentYear,index)=>{
  const pillar=yearPillar(year,{afterLiChun:true});
  const stemGod=tenGod(result.pillars.day.stemIndex,pillar.stemIndex);
  const branchGod=branchTenGod(result.pillars.day.stemIndex,pillar.branchIndex);
  const relations=flowRelations(result,pillar.branchIndex,`annual-${year}`);
  const relation=relations[0]??null;
  const relationCopy=relationText(relation);
  const pair=godPairSummary(stemGod,branchGod);
  return {
    year,
    position:index===0?'current':index===1?'next':'later',
    label:index===0?'지금의 세운':index===1?'다음 세운':'그다음 세운',
    period:`${year}년 입춘부터`,
    pillar:{
      hanja:pillar.hanja,
      korean:pillar.korean,
      stemIndex:pillar.stemIndex,
      branchIndex:pillar.branchIndex
    },
    stemTenGod:stemGod,
    branchTenGod:branchGod,
    title:pair.title,
    body:relationCopy?`${pair.body} ${relationCopy.body}`:pair.body,
    guide:relationCopy?`${pair.guide} ${relationCopy.action}`:pair.guide,
    evidence:[
      `${year} ${pillar.hanja}`,
      `천간 ${stemGod}`,
      `지지 ${branchGod}`,
      relationEvidence(relation)
    ].filter(Boolean),
    isCurrent:year===currentYear,
    confidence:'medium',
    methodId:'annual-flow-v1'
  };
};

const formatAgeMonths=months=>{
  const years=Math.floor(months/12);
  const rest=months%12;
  return rest?`${years}세 ${rest}개월`:`${years}세`;
};

const buildDaeun=(result,target)=>{
  if(result.daeun.status==='needs-sex'){
    return {status:'needs-sex',title:'성별을 선택하면 지금의 대운을 볼 수 있어요'};
  }
  if(result.daeun.status==='needs-birth-time'){
    return {status:'needs-birth-time',title:'출생시간을 입력하면 지금의 대운을 볼 수 있어요'};
  }
  if(result.daeun.status!=='ok'){
    return {status:'unavailable',title:'현재 입력에서는 대운 위치를 계산할 수 없어요'};
  }

  const birth=parseIsoDate(result.input.birthDate);
  const ageMonths=ageMonthsAt(birth,target);
  const cycle=result.daeun.cycles.find(item=>
    ageMonths>=item.startAgeMonths&&ageMonths<item.startAgeMonths+120
  );

  if(!cycle){
    if(ageMonths<result.daeun.startAgeMonths){
      return {
        status:'before-first',
        title:'아직 첫 대운이 시작되기 전이에요',
        body:`첫 대운은 약 ${formatAgeMonths(result.daeun.startAgeMonths)} 무렵 시작하는 기준으로 계산됩니다.`,
        guide:'이 구간은 원국 자체의 구조를 중심으로 읽고, 세운은 별도로 참고하는 편이 자연스럽습니다.',
        evidence:[`첫 대운 약 ${formatAgeMonths(result.daeun.startAgeMonths)}`]
      };
    }
    return {status:'unavailable',title:'현재 나이에 해당하는 대운 배열이 준비되지 않았어요'};
  }

  const stemGod=tenGod(result.pillars.day.stemIndex,cycle.pillar.stemIndex);
  const branchGod=branchTenGod(result.pillars.day.stemIndex,cycle.pillar.branchIndex);
  const relations=flowRelations(result,cycle.pillar.branchIndex,'daeun-current');
  const relation=relations[0]??null;
  const relationCopy=relationText(relation);
  const pair=godPairSummary(stemGod,branchGod);
  const endAge=cycle.startAgeMonths+120;
  return {
    status:'active',
    order:cycle.order,
    pillar:cycle.pillar,
    period:`약 ${formatAgeMonths(cycle.startAgeMonths)} ~ ${formatAgeMonths(endAge)}`,
    title:pair.title,
    body:relationCopy?`${pair.body} ${relationCopy.body}`:pair.body,
    guide:relationCopy?`${pair.guide} ${relationCopy.action}`:pair.guide,
    stemTenGod:stemGod,
    branchTenGod:branchGod,
    evidence:[
      `대운 ${cycle.pillar.hanja}`,
      `천간 ${stemGod}`,
      `지지 ${branchGod}`,
      relationEvidence(relation)
    ].filter(Boolean),
    confidence:'medium',
    approximateStart:true,
    methodId:'daeun-current-v1'
  };
};

export function buildCurrentFlow(result,{today=new Date()}={}){
  const target=dateFromValue(today);
  const currentYear=sajuYearAt(target);
  return {
    asOf:`${target.year}-${String(target.month).padStart(2,'0')}-${String(target.day).padStart(2,'0')}`,
    currentSajuYear:currentYear,
    daeun:buildDaeun(result,target),
    annuals:[0,1,2].map(offset=>buildAnnual(result,currentYear+offset,currentYear,offset)),
    policy:{
      yearBoundary:'li-chun',
      daeunStart:'3-days-per-year, rounded to months',
      eventPrediction:false
    }
  };
}
