import {STEMS,BRANCHES} from './rules.mjs';

export const SYMBOLIC_STAR_POLICY={
  version:'1.0',
  scope:['천을귀인','문창귀인','도화','역마','화개'],
  dayStemStars:['천을귀인','문창귀인'],
  branchGroupStars:['도화','역마','화개'],
  branchAnchors:['year','day'],
  deterministicPrediction:false,
  note:'신살은 원국의 보조 상징으로만 표시하며 단독 길흉·사건 예측에 사용하지 않는다.'
};

const POSITION_LABEL={year:'년지',month:'월지',day:'일지',hour:'시지'};

const TIAN_YI={
  甲:['丑','未'],戊:['丑','未'],庚:['丑','未'],
  乙:['子','申'],己:['子','申'],
  丙:['亥','酉'],丁:['亥','酉'],
  壬:['卯','巳'],癸:['卯','巳'],
  辛:['午','寅']
};

const WEN_CHANG={
  甲:['巳'],乙:['午'],丙:['申'],戊:['申'],
  丁:['酉'],己:['酉'],庚:['亥'],辛:['子'],壬:['寅'],癸:['卯']
};

const GROUP_BY_BRANCH={
  申:'申子辰',子:'申子辰',辰:'申子辰',
  寅:'寅午戌',午:'寅午戌',戌:'寅午戌',
  亥:'亥卯未',卯:'亥卯未',未:'亥卯未',
  巳:'巳酉丑',酉:'巳酉丑',丑:'巳酉丑'
};

const GROUP_TARGETS={
  '申子辰':{도화:'酉',역마:'寅',화개:'辰'},
  '寅午戌':{도화:'卯',역마:'申',화개:'戌'},
  '亥卯未':{도화:'子',역마:'巳',화개:'未'},
  '巳酉丑':{도화:'午',역마:'亥',화개:'丑'}
};

const STAR_META={
  천을귀인:{
    hanja:'天乙貴人',
    label:'천을귀인',
    plain:'도움이 들어오는 통로',
    meaning:'막힐 때 사람·정보·제도 같은 도움의 통로가 붙는 상징으로 봐요. 실제로 특정 귀인이 나타난다고 보장하는 표시는 아니에요.'
  },
  문창귀인:{
    hanja:'文昌貴人',
    label:'문창귀인',
    plain:'배우고 정리해 표현하는 힘',
    meaning:'말·글·기획·문서·학습처럼 생각을 정리하고 표현하는 힘과 연결해서 보는 상징이에요.'
  },
  도화:{
    hanja:'桃花',
    label:'도화',
    plain:'시선을 끄는 표현과 교류',
    meaning:'감각·표현·교류처럼 사람의 시선이 모이는 장면과 연결해서 봐요. 연애 성공이나 인기를 보장하는 표시는 아니에요.'
  },
  역마:{
    hanja:'驛馬',
    label:'역마',
    plain:'움직이며 바뀌는 힘',
    meaning:'이동·변화·환경 전환처럼 움직임이 커지는 장면과 연결해서 봐요. 이사나 해외 이동 같은 사건을 예언하는 표시는 아니에요.'
  },
  화개:{
    hanja:'華蓋',
    label:'화개',
    plain:'혼자 깊게 파고드는 힘',
    meaning:'혼자 몰입하고 정리하거나 예술·연구·탐구처럼 안쪽으로 깊어지는 힘과 연결해서 봐요.'
  }
};

const visibleBranches=pillars=>Object.entries(pillars)
  .filter(([,pillar])=>pillar)
  .map(([key,pillar])=>({key,label:POSITION_LABEL[key],hanja:pillar.branch.hanja,korean:pillar.branch.ko}));

const collectHits=(branches,targetSources)=>{
  const map=new Map();
  for(const source of targetSources){
    for(const branch of branches){
      if(branch.hanja!==source.target) continue;
      const id=branch.key+'-'+branch.hanja;
      const existing=map.get(id)||{...branch,sources:[]};
      existing.sources.push(source.source);
      map.set(id,existing);
    }
  }
  return [...map.values()];
};

const makeStar=(name,targetSources,branches,basis)=>{
  const meta=STAR_META[name];
  const hits=collectHits(branches,targetSources);
  return {
    ...meta,
    present:hits.length>0,
    targets:[...new Set(targetSources.map(x=>x.target))],
    targetSources,
    hits,
    basis,
    statusText:hits.length
      ?hits.map(hit=>hit.label+' '+hit.hanja).join(' · ')
      :'현재 보이는 네 기둥에는 해당 자리 없음'
  };
};

export function calculateSymbolicStars({dayStemIndex,pillars}){
  const dayStem=STEMS[dayStemIndex];
  const branches=visibleBranches(pillars);

  const tianTargets=(TIAN_YI[dayStem.hanja]||[]).map(target=>({target,source:'태어난 날의 위 글자 '+dayStem.hanja+' 기준'}));
  const wenTargets=(WEN_CHANG[dayStem.hanja]||[]).map(target=>({target,source:'태어난 날의 위 글자 '+dayStem.hanja+' 기준'}));

  const anchors=[
    pillars.year?{key:'year',label:'태어난 해의 아래 글자',branch:pillars.year.branch.hanja}:null,
    pillars.day?{key:'day',label:'태어난 날의 아래 글자',branch:pillars.day.branch.hanja}:null
  ].filter(Boolean);

  const groupSources=name=>anchors.map(anchor=>{
    const group=GROUP_BY_BRANCH[anchor.branch];
    return {
      target:GROUP_TARGETS[group][name],
      source:anchor.label+' '+anchor.branch+' 기준',
      anchor:anchor.key,
      group
    };
  });

  const stars=[
    makeStar(
      '천을귀인',
      tianTargets,
      branches,
      '태어난 날의 위 글자 '+dayStem.hanja+'를 기준으로 '+tianTargets.map(x=>x.target).join('·')+' 자리가 네 기둥에 있는지 봅니다.'
    ),
    makeStar(
      '문창귀인',
      wenTargets,
      branches,
      '태어난 날의 위 글자 '+dayStem.hanja+'를 기준으로 '+wenTargets.map(x=>x.target).join('·')+' 자리가 네 기둥에 있는지 봅니다.'
    ),
    ...['도화','역마','화개'].map(name=>{
      const sources=groupSources(name);
      return makeStar(
        name,
        sources,
        branches,
        sources.map(x=>x.source+' → '+x.target).join(' / ')
      );
    })
  ];

  return {
    method:'symbolic-stars-v1',
    policy:SYMBOLIC_STAR_POLICY,
    stars,
    present:stars.filter(x=>x.present),
    missingHour:!pillars.hour,
    explanation:'신살은 사주 전체를 대신하는 결론이 아니라, 특정 글자 조합에 붙는 보조 상징이에요. 사주결은 대표적인 다섯 가지를 계산 기준과 함께 보여주고 단독으로 좋고 나쁨을 판정하지 않습니다.'
  };
}
