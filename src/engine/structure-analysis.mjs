
import {
  STEMS,BRANCHES,BRANCH_RULING_STEMS,ELEMENT_LABELS,tenGod,surfaceElementCounts,mod
} from './rules.mjs';
import {twelveStage} from './derived-facts.mjs';

export const STRUCTURE_ANALYSIS_POLICY={
  version:'1.0',
  strengthMethod:'season-root-visible-support',
  patternMethod:'month-branch-main-qi-base-pattern',
  usefulGodMethod:'balancing-candidate',
  climateUsefulGod:false,
  specialPatternOverride:false,
  transformationOverride:false,
  note:'학파별 차이가 큰 영역이므로 사주결의 고정 기준을 공개하고 후보/기초격으로 표시한다.'
};

const SAME=new Set(['비견','겁재']);
const RESOURCE=new Set(['정인','편인']);
const OUTPUT=new Set(['식신','상관']);
const WEALTH=new Set(['정재','편재']);
const OFFICER=new Set(['정관','편관']);

const relationGroup=name=>{
  if(SAME.has(name)) return 'same';
  if(RESOURCE.has(name)) return 'resource';
  if(OUTPUT.has(name)) return 'output';
  if(WEALTH.has(name)) return 'wealth';
  if(OFFICER.has(name)) return 'officer';
  return 'other';
};

const GROUP_KO={
  same:'비겁',
  resource:'인성',
  output:'식상',
  wealth:'재성',
  officer:'관성',
  other:'기타'
};

const SEASON_WEIGHT={same:3.2,resource:2.3,output:-1.6,wealth:-1.8,officer:-2.4,other:0};
const VISIBLE_WEIGHT={same:1.05,resource:.85,output:-.7,wealth:-.85,officer:-1.05,other:0};
const ROOT_WEIGHT={main:1.2,middle:.65,residual:.35};

const POSITION_KO={year:'년지',month:'월지',day:'일지',hour:'시지'};
const STEM_POSITION_KO={year:'년간',month:'월간',day:'일간',hour:'시간'};

const GOD_PLAIN={
  비견:'나와 비슷한 힘이 나란히 서는 관계',
  겁재:'나와 비슷한 힘끼리 경쟁하거나 나누는 관계',
  식신:'내 힘을 밖으로 만들고 표현하는 관계',
  상관:'내 힘을 밖으로 드러내고 기존 방식을 바꾸려는 관계',
  편재:'바깥의 기회와 자원을 빠르게 다루는 관계',
  정재:'현실적인 자원과 결과를 꾸준히 관리하는 관계',
  편관:'외부 압박과 경쟁, 책임을 강하게 받는 관계',
  정관:'규칙·책임·기준을 받아들이는 관계',
  편인:'새로운 관점과 정보를 받아들이는 관계',
  정인:'배우고 정리하며 도움을 받는 관계'
};

const PATTERN_LABEL={
  식신:'식신격',상관:'상관격',
  편재:'편재격',정재:'정재격',
  편관:'편관격',정관:'정관격',
  편인:'편인격',정인:'정인격'
};

const ELEMENT_ORDER=['wood','fire','earth','metal','water'];
const ELEMENT_INDEX=Object.fromEntries(ELEMENT_ORDER.map((x,i)=>[x,i]));
const relationForElement=(dayElement,otherElement)=>{
  const d=ELEMENT_INDEX[dayElement];
  const o=ELEMENT_INDEX[otherElement];
  return ['same','output','wealth','officer','resource'][mod(o-d,5)];
};

const strengthLabel=score=>{
  if(score>=4) return {key:'very-strong',label:'매우 신강',short:'신강'};
  if(score>=1.4) return {key:'strong',label:'신강',short:'신강'};
  if(score>-1.4) return {key:'balanced',label:'중화권',short:'중화'};
  if(score>-4) return {key:'weak',label:'신약',short:'신약'};
  return {key:'very-weak',label:'매우 신약',short:'신약'};
};

const polarityText=value=>value==='yang'?'양':'음';

export function analyzeDayMasterStrength({dayStemIndex,pillars}){
  const dayStem=STEMS[mod(dayStemIndex,10)];
  const month=pillars.month;
  if(!month) throw new TypeError('month pillar is required');

  const monthMainStem=BRANCH_RULING_STEMS[month.branchIndex].main;
  const monthTenGod=tenGod(dayStemIndex,monthMainStem);
  const seasonGroup=relationGroup(monthTenGod);
  const seasonScore=SEASON_WEIGHT[seasonGroup];

  const roots=[];
  let rootScore=0;
  for(const [key,pillar] of Object.entries(pillars)){
    if(!pillar) continue;
    const row=BRANCH_RULING_STEMS[pillar.branchIndex];
    let best=null;
    for(const position of ['main','middle','residual']){
      const stemIndex=row[position];
      if(stemIndex==null) continue;
      const stem=STEMS[stemIndex];
      if(stem.element!==dayStem.element) continue;
      const weight=ROOT_WEIGHT[position];
      if(!best||weight>best.weight) best={key,position,stemIndex,weight};
    }
    if(best){
      rootScore+=best.weight;
      roots.push({
        pillar:best.key,
        position:best.position,
        branch:BRANCHES[pillar.branchIndex].hanja,
        stem:STEMS[best.stemIndex].hanja,
        weight:best.weight
      });
    }
  }

  const visible=[];
  let visibleScore=0;
  for(const [key,pillar] of Object.entries(pillars)){
    if(!pillar||key==='day') continue;
    const god=tenGod(dayStemIndex,pillar.stemIndex);
    const group=relationGroup(god);
    const weight=VISIBLE_WEIGHT[group];
    visibleScore+=weight;
    visible.push({pillar:key,stem:pillar.stem.hanja,tenGod:god,group,weight});
  }

  const score=Number((seasonScore+rootScore+visibleScore).toFixed(2));
  const grade=strengthLabel(score);
  const supportiveVisible=visible.filter(x=>x.weight>0);
  const drainingVisible=visible.filter(x=>x.weight<0);

  const seasonDirection=seasonScore>0?'돕는':seasonScore<0?'힘을 쓰게 하거나 누르는':'중립적인';
  const rootText=roots.length
    ?roots.map(x=>POSITION_KO[x.pillar]+' '+x.branch+' 속 '+x.stem).join(', ')
    :'같은 오행의 뚜렷한 지지 뿌리가 없음';
  const visibleSupportText=supportiveVisible.length
    ?supportiveVisible.map(x=>STEM_POSITION_KO[x.pillar]+' '+x.stem+'·'+x.tenGod).join(', ')
    :'표면 천간의 직접 도움은 적음';
  const visiblePressureText=drainingVisible.length
    ?drainingVisible.map(x=>STEM_POSITION_KO[x.pillar]+' '+x.stem+'·'+x.tenGod).join(', ')
    :'표면 천간의 직접 소모·압박은 적음';

  return {
    method:STRUCTURE_ANALYSIS_POLICY.strengthMethod,
    score,
    grade:grade.key,
    label:grade.label,
    shortLabel:grade.short,
    dayElement:dayStem.element,
    dayElementKo:ELEMENT_LABELS[dayStem.element],
    season:{
      monthBranch:month.branch.hanja,
      mainStem:STEMS[monthMainStem].hanja,
      tenGod:monthTenGod,
      group:seasonGroup,
      score:seasonScore,
      text:'태어난 달의 아래 글자 '+month.branch.hanja+' 속 대표 기운 '+STEMS[monthMainStem].hanja+'('+monthTenGod+')은, 나를 뜻하는 글자의 힘을 '+seasonDirection+' 계절 조건으로 봅니다.'
    },
    roots,
    rootScore:Number(rootScore.toFixed(2)),
    visible,
    visibleScore:Number(visibleScore.toFixed(2)),
    evidence:[
      '태어난 달의 계절 힘 · '+monthTenGod+' '+(seasonScore>0?'+':'')+seasonScore,
      '같은 기운의 받침 · '+roots.length+'곳 '+(rootScore?('+'+Number(rootScore.toFixed(2))):'0'),
      '겉에 드러난 글자 · 도움 '+supportiveVisible.length+' / 소모·압박 '+drainingVisible.length
    ],
    explanation:'태어난 날의 위 글자를 ‘나’로 놓고, ① 태어난 달의 계절 기운이 나를 돕는지 ② 아래 글자들 속에 나와 같은 기운이 받쳐주는지 ③ 겉에 드러난 다른 글자들이 나를 돕는지 또는 힘을 쓰게 하는지를 함께 봅니다. 이 명식은 '+grade.label+' 쪽으로 분류됩니다. 이 상대적인 힘의 구분을 신강·신약이라고 불러요.',
    detail:{
      roots:rootText,
      visibleSupport:visibleSupportText,
      visiblePressure:visiblePressureText
    }
  };
}

export function analyzeBasePattern({dayStemIndex,pillars}){
  const month=pillars.month;
  const monthMainStemIndex=BRANCH_RULING_STEMS[month.branchIndex].main;
  const mainTenGod=tenGod(dayStemIndex,monthMainStemIndex);
  const monthStage=twelveStage(dayStemIndex,month.branchIndex).name;
  const dayStem=STEMS[mod(dayStemIndex,10)];

  let label=PATTERN_LABEL[mainTenGod]||(mainTenGod+' 월령');
  let status='base';
  if(mainTenGod==='비견'){
    label=monthStage==='건록'?'건록격':'비견 월령';
    status=monthStage==='건록'?'base':'descriptive';
  }else if(mainTenGod==='겁재'){
    if(dayStem.polarity==='yang'&&monthStage==='제왕'){
      label='양인격 후보';
      status='candidate';
    }else{
      label='겁재 월령';
      status='descriptive';
    }
  }

  const exposed=Object.entries(pillars)
    .filter(([key,p])=>p&&key!=='day'&&p.stemIndex===monthMainStemIndex)
    .map(([key])=>key);

  return {
    method:STRUCTURE_ANALYSIS_POLICY.patternMethod,
    label,
    status,
    monthBranch:month.branch.hanja,
    monthMainStem:STEMS[monthMainStemIndex].hanja,
    monthMainTenGod:mainTenGod,
    monthStage,
    exposed,
    exposedLabels:exposed.map(x=>STEM_POSITION_KO[x]),
    explanation:'태어난 달의 아래 글자 '+month.branch.hanja+' 안에서 가장 중심이 되는 기운은 '+STEMS[monthMainStemIndex].hanja+'이에요. 이 기운은 나를 뜻하는 글자와 ‘'+mainTenGod+'’ 관계이고, 쉽게 말하면 '+GOD_PLAIN[mainTenGod]+'예요. 그래서 이 명식의 기본 골격에 ‘'+label+'’이라는 이름을 붙입니다. 이렇게 태어난 달의 중심 역할을 이름 붙인 것을 격국이라고 해요.',
    caveat:'종격·화격·전왕격 같은 특수격과 합화에 따른 격 변화는 이 자동 판정에 넣지 않습니다.'
  };
}

const usefulGodRanking=(strength,counts,dayElement)=>{
  const isStrong=strength.grade==='strong'||strength.grade==='very-strong';
  const favorable=isStrong?['output','officer','wealth']:['resource','same'];
  const base=isStrong
    ?{output:3,officer:2.8,wealth:2.6}
    :{resource:3,same:2.7};

  return ELEMENT_ORDER
    .map(element=>{
      const role=relationForElement(dayElement,element);
      if(!favorable.includes(role)) return null;
      const scarcity=Math.max(0,3-(counts[element]||0))*.14;
      const abundance=Math.max(0,(counts[element]||0)-2)*.08;
      return {element,role,score:Number((base[role]+scarcity-abundance).toFixed(2)),count:counts[element]||0};
    })
    .filter(Boolean)
    .sort((a,b)=>b.score-a.score||a.count-b.count);
};

export function analyzeUsefulGod({strength,pillars}){
  const counts=surfaceElementCounts(Object.values(pillars));
  const dayElement=STEMS[pillars.day.stemIndex].element;
  if(strength.grade==='balanced'){
    return {
      method:STRUCTURE_ANALYSIS_POLICY.usefulGodMethod,
      status:'hold',
      primary:null,
      supportive:[],
      counts,
      explanation:'나를 뜻하는 글자의 힘이 한쪽으로 크게 치우치지 않은 편이라, 균형을 위해 특정 오행 하나를 꼭 보태야 한다고 정하지 않습니다. 그래서 이 경우에는 단일 용신 후보를 보류해요.',
      caveat:'조후용신·격국용신은 별도 체계이므로 여기서 억지로 하나로 합치지 않습니다.'
    };
  }

  const ranking=usefulGodRanking(strength,counts,dayElement);
  const primary=ranking[0]||null;
  const supportive=ranking.slice(1,3);
  const isStrong=strength.grade==='strong'||strength.grade==='very-strong';
  const direction=isStrong?'강한':'약한';
  const action=isStrong?'이미 강한 힘을 밖으로 쓰거나 정리하는':'나를 직접 돕거나 보충하는';

  return {
    method:STRUCTURE_ANALYSIS_POLICY.usefulGodMethod,
    status:'candidate',
    primary:primary?{...primary,label:ELEMENT_LABELS[primary.element],roleLabel:GROUP_KO[primary.role]}:null,
    supportive:supportive.map(x=>({...x,label:ELEMENT_LABELS[x.element],roleLabel:GROUP_KO[x.role]})),
    counts,
    explanation:primary
      ?'나를 뜻하는 글자가 주변에서 받는 도움과 쓰는 힘의 균형을 맞추는 관점에서, 지금은 '+action+' 기운을 우선 봅니다. 겉으로 드러난 오행 분포까지 함께 비교하면 균형을 돕는 1순위 후보는 '+ELEMENT_LABELS[primary.element]+'이에요. 이런 균형 후보를 용신이라고 불러요.'
      :'현재 기준에서는 단일 용신 후보를 정하지 않습니다.',
    caveat:'이 값은 억부 기준 후보입니다. 조후용신, 격국용신, 특수격 전환은 별도 판정이며 학파에 따라 결론이 달라질 수 있습니다.'
  };
}

export function analyzeStructure({dayStemIndex,pillars}){
  const strength=analyzeDayMasterStrength({dayStemIndex,pillars});
  const pattern=analyzeBasePattern({dayStemIndex,pillars});
  const usefulGod=analyzeUsefulGod({strength,pillars});
  const dayStem=STEMS[mod(dayStemIndex,10)];
  return {
    method:'saju-gyeol-structure-v1',
    policy:STRUCTURE_ANALYSIS_POLICY,
    dayMaster:{
      stem:dayStem.hanja,
      korean:dayStem.ko,
      element:dayStem.element,
      elementKo:ELEMENT_LABELS[dayStem.element],
      polarity:polarityText(dayStem.polarity)
    },
    strength,
    pattern,
    usefulGod
  };
}
