import {STEMS,BRANCHES,mod} from './rules.mjs';

export const SYMBOLIC_STAR_POLICY={
  version:'2.0',
  catalog:'common-24-plus-twelve-stars',
  commonCount:24,
  twelveStarCount:12,
  deterministicPrediction:false,
  schoolVariance:true,
  note:'신살은 학파마다 수백 종까지 확장되므로 사주결은 실전 공통 24종과 별도 체계인 12신살 전체를 고정 범위로 제공한다. 단독 길흉·사건 예측에는 사용하지 않는다.'
};

const POSITION_LABEL={year:'년',month:'월',day:'일',hour:'시'};
const STEM_POSITION_LABEL={year:'년간',month:'월간',day:'일간',hour:'시간'};
const BRANCH_POSITION_LABEL={year:'년지',month:'월지',day:'일지',hour:'시지'};

const GROUP_BY_BRANCH={
  申:'申子辰',子:'申子辰',辰:'申子辰',
  寅:'寅午戌',午:'寅午戌',戌:'寅午戌',
  亥:'亥卯未',卯:'亥卯未',未:'亥卯未',
  巳:'巳酉丑',酉:'巳酉丑',丑:'巳酉丑'
};

const TIAN_YI={
  甲:['丑','未'],戊:['丑','未'],庚:['丑','未'],
  乙:['子','申'],己:['子','申'],
  丙:['酉','亥'],丁:['酉','亥'],
  辛:['寅','午'],
  壬:['卯','巳'],癸:['卯','巳']
};

const WEN_CHANG={
  甲:'巳',乙:'午',丙:'申',戊:'申',丁:'酉',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'
};
const XUE_TANG={
  甲:'亥',乙:'午',丙:'寅',戊:'寅',丁:'酉',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'
};
const AN_LU={
  甲:'亥',乙:'戌',丙:'申',戊:'申',丁:'未',己:'未',庚:'巳',辛:'辰',壬:'寅',癸:'丑'
};
const JIN_YU={
  甲:'辰',乙:'巳',丙:'未',戊:'未',丁:'申',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'
};
const TIAN_CHU={
  甲:'巳',乙:'午',丙:'巳',丁:'午',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'
};
const TIAN_GUAN={
  甲:'未',乙:'辰',丙:'巳',丁:'酉',戊:'戌',己:'卯',庚:'亥',辛:'申',壬:'酉',癸:'午'
};
const HONG_YAN={
  甲:'午',乙:'午',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'
};
const YANG_REN={甲:'卯',丙:'午',戊:'午',庚:'酉',壬:'子'};

const TIAN_DE={
  寅:{kind:'stem',value:'丁'},卯:{kind:'branch',value:'申'},辰:{kind:'stem',value:'壬'},
  巳:{kind:'stem',value:'辛'},午:{kind:'branch',value:'亥'},未:{kind:'stem',value:'甲'},
  申:{kind:'stem',value:'癸'},酉:{kind:'branch',value:'寅'},戌:{kind:'stem',value:'丙'},
  亥:{kind:'stem',value:'乙'},子:{kind:'branch',value:'巳'},丑:{kind:'stem',value:'庚'}
};
const YUE_DE={
  '寅午戌':'丙','申子辰':'壬','亥卯未':'甲','巳酉丑':'庚'
};

const SAN_HE_TARGETS={
  '寅午戌':{도화:'卯',역마:'申',화개:'戌'},
  '巳酉丑':{도화:'午',역마:'亥',화개:'丑'},
  '申子辰':{도화:'酉',역마:'寅',화개:'辰'},
  '亥卯未':{도화:'子',역마:'巳',화개:'未'}
};

const GUI_MUN_PAIRS=[['子','酉'],['丑','午'],['寅','未'],['卯','申'],['辰','亥'],['巳','戌']];
const WON_JIN_PAIRS=[['子','未'],['丑','午'],['寅','酉'],['卯','申'],['辰','亥'],['巳','戌']];
const NET_PAIRS=[
  {name:'천라',pair:['戌','亥']},
  {name:'지망',pair:['辰','巳']}
];
const GANG_PILLARS=['庚辰','庚戌','壬辰','壬戌'];
const GANG_VARIANTS=['戊辰','戊戌'];
const BAEKHO_PILLARS=['甲辰','乙未','丙戌','丁丑','戊辰','壬戌','癸丑'];
const HYEON_CHIM_STEMS=['甲','辛'];
const HYEON_CHIM_BRANCHES=['卯','午','未','申'];

const GEUP_GAK={
  spring:['亥','子'],
  summer:['卯','未'],
  autumn:['寅','戌'],
  winter:['丑','辰']
};

const GO_SIN_GWA_SUK={
  winter:{anchors:['亥','子','丑'],고신:'寅',과숙:'戌'},
  spring:{anchors:['寅','卯','辰'],고신:'巳',과숙:'丑'},
  summer:{anchors:['巳','午','未'],고신:'申',과숙:'辰'},
  autumn:{anchors:['申','酉','戌'],고신:'亥',과숙:'未'}
};

const SAMJAE={
  '申子辰':['寅','卯','辰'],
  '寅午戌':['申','酉','戌'],
  '亥卯未':['巳','午','未'],
  '巳酉丑':['亥','子','丑']
};

const TWELVE_TABLE={
  '寅午戌':['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
  '巳酉丑':['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'],
  '申子辰':['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
  '亥卯未':['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌']
};
const TWELVE_NAMES=['지살','도화살','월살','망신살','장성살','반안살','역마살','육해살','화개살','겁살','재살','천살'];

const META={
  천을귀인:{hanja:'天乙貴人',group:'귀인·길신',plain:'도움이 들어오는 통로',meaning:'사람·정보·제도 같은 도움의 통로를 상징해요. 특정 귀인이 반드시 나타난다는 뜻은 아니에요.'},
  천덕귀인:{hanja:'天德貴人',group:'귀인·길신',plain:'위기를 부드럽게 넘기는 복원력',meaning:'태어난 달을 기준으로 보는 보호와 복원력의 상징이에요.'},
  월덕귀인:{hanja:'月德貴人',group:'귀인·길신',plain:'사람 사이의 완충과 인덕',meaning:'태어난 달의 삼합을 기준으로 사람 사이의 완충과 조력을 상징해요.'},
  문창귀인:{hanja:'文昌貴人',group:'귀인·길신',plain:'배우고 정리해 표현하는 힘',meaning:'글·기획·문서·학습처럼 생각을 정리해 밖으로 표현하는 힘과 연결해서 봐요.'},
  천의성:{hanja:'天醫星',group:'귀인·길신',plain:'돌보고 회복시키는 감각',meaning:'태어난 달의 바로 앞 지지를 기준으로 돌봄·회복·문제 해결 감각을 상징해요. 질병을 예측하는 표시는 아니에요.'},
  암록:{hanja:'暗祿',group:'귀인·길신',plain:'겉으로 드러나지 않은 지원',meaning:'직접 보이지 않는 자원·지원·여유가 숨어 있는 상징으로 봐요.'},
  금여록:{hanja:'金輿祿',group:'귀인·길신',plain:'편안함과 결실을 담는 자리',meaning:'안정감·생활의 여유·주변을 편안하게 하는 힘과 연결해서 봐요.'},
  천주천관:{hanja:'天廚·天官',group:'귀인·길신',plain:'생활의 풍요와 공적 인정',meaning:'천주는 의식주와 생산, 천관은 책임과 공적 인정의 상징으로 각각 봐요.'},
  학당귀인:{hanja:'學堂貴人',group:'귀인·길신',plain:'배우고 익혀 체계화하는 힘',meaning:'학습·자격·교육처럼 지식을 익히고 체계화하는 힘과 연결해서 봐요.'},

  귀문관살:{hanja:'鬼門關殺',group:'신살·보조',plain:'예민한 감각과 깊은 몰입',meaning:'특정 지지 두 글자가 만날 때 생기는 예민함·몰입의 상징으로 봐요.'},
  괴강살:{hanja:'魁罡殺',group:'신살·보조',plain:'강한 결단과 밀어붙이는 힘',meaning:'특정 간지의 강한 추진·결단 성향을 보는 보조 표시예요.'},
  천라지망살:{hanja:'天羅地網殺',group:'신살·보조',plain:'멈춰 깊어지는 구간',meaning:'술·해 또는 진·사가 함께 있을 때 지체·숙성·내면화의 상징으로 봐요.'},
  도화살:{hanja:'桃花殺',group:'신살·보조',plain:'시선을 끄는 표현과 교류',meaning:'표현·교류·감각처럼 사람의 시선이 모이는 장면과 연결해서 봐요.'},
  역마살:{hanja:'驛馬殺',group:'신살·보조',plain:'움직이며 바뀌는 힘',meaning:'이동·변화·환경 전환처럼 움직임이 커지는 장면과 연결해서 봐요.'},
  화개살:{hanja:'華蓋殺',group:'신살·보조',plain:'혼자 깊게 파고드는 힘',meaning:'몰입·예술·연구·탐구처럼 안쪽으로 깊어지는 힘과 연결해서 봐요.'},
  백호살:{hanja:'白虎殺',group:'신살·보조',plain:'강하게 밀어붙이는 추진력',meaning:'특정 간지에 응축된 강한 추진·결단의 기운을 보는 보조 표시예요.'},
  양인살:{hanja:'羊刃殺',group:'신살·보조',plain:'날카로운 결단과 승부근성',meaning:'양일간이 가장 왕성한 자리를 만날 때의 강한 결단·전문성을 상징해요.'},
  홍염살:{hanja:'紅艶殺',group:'신살·보조',plain:'은근히 스며드는 표현력',meaning:'도화와는 다른 방식의 친화력·표현·매력을 보는 보조 표시예요.'},
  원진살:{hanja:'怨嗔殺',group:'신살·보조',plain:'가까울수록 생기는 미묘한 마찰',meaning:'특정 지지 두 글자가 만나 끌림과 마찰이 함께 생기는 관계의 각도로 봐요.'},
  공망:{hanja:'空亡',group:'신살·보조',plain:'비어 있어 다르게 쓰이는 자리',meaning:'일주가 속한 열흘 묶음에서 빠지는 두 지지를 보는 표예요. 불운 점수로 보지 않아요.'},
  삼재:{hanja:'三災',group:'신살·보조',plain:'띠 기준으로 반복되는 세 해 묶음',meaning:'원국 안의 “살”이라기보다 띠의 삼합을 기준으로 반복되는 3년 주기예요.'},
  현침살:{hanja:'懸針殺',group:'신살·보조',plain:'정밀하고 날카로운 감각',meaning:'바늘처럼 곧고 뾰족한 모양으로 보는 전통적 글자 상징이에요. 의료·사고를 예측하는 표시는 아니에요.'},
  급각살:{hanja:'急脚殺',group:'신살·보조',plain:'빠른 움직임과 조절의 과제',meaning:'계절과 특정 지지의 조합을 보는 전통적 보조 표시예요. 신체 질환이나 사고를 단정하지 않아요.'},
  고신과숙살:{hanja:'孤辰·寡宿',group:'신살·보조',plain:'혼자 정리하고 버티는 힘',meaning:'태어난 해의 계절 그룹 바깥쪽 지지를 보는 상징으로, 혼자 있는 힘과 독립성을 참고해요.'}
};

const pillarEntries=pillars=>Object.entries(pillars).filter(([,p])=>p);
const branchEntries=pillars=>pillarEntries(pillars).map(([key,p])=>({key,label:BRANCH_POSITION_LABEL[key],hanja:p.branch.hanja,korean:p.branch.ko}));
const stemEntries=pillars=>pillarEntries(pillars).map(([key,p])=>({key,label:STEM_POSITION_LABEL[key],hanja:p.stem.hanja,korean:p.stem.ko}));
const pillarHanjaEntries=pillars=>pillarEntries(pillars).map(([key,p])=>({key,label:POSITION_LABEL[key]+'주',hanja:p.hanja,korean:p.korean}));

const branchHits=(pillars,targets)=>branchEntries(pillars).filter(x=>targets.includes(x.hanja));
const stemHits=(pillars,targets)=>stemEntries(pillars).filter(x=>targets.includes(x.hanja));
const pillarHits=(pillars,targets)=>pillarHanjaEntries(pillars).filter(x=>targets.includes(x.hanja));

const pairHits=(pillars,pairs)=>{
  const entries=branchEntries(pillars);
  const out=[];
  for(const pair of pairs){
    const a=entries.filter(x=>x.hanja===pair[0]);
    const b=entries.filter(x=>x.hanja===pair[1]);
    for(const left of a) for(const right of b){
      if(left.key===right.key) continue;
      out.push({
        label:left.label+' '+left.hanja+' ↔ '+right.label+' '+right.hanja,
        hanja:pair.join(''),
        key:left.key+'-'+right.key
      });
    }
  }
  return out;
};

const makeStar=(name,{hits=[],basis='',statusText='',mode='presence',extra=null}={})=>{
  const meta=META[name];
  return {
    key:name,
    ...meta,
    mode,
    present:mode==='cycle'?null:hits.length>0,
    hits,
    basis,
    statusText:statusText||(hits.length?hits.map(x=>x.label+' '+x.hanja).join(' · '):'해당 없음'),
    extra
  };
};

const sanheSources=pillars=>[
  pillars.year?{key:'year',label:'태어난 해의 아래 글자',branch:pillars.year.branch.hanja}:null,
  pillars.day?{key:'day',label:'태어난 날의 아래 글자',branch:pillars.day.branch.hanja}:null
].filter(Boolean);

const sanheStar=(name,pillars)=>{
  const sources=sanheSources(pillars).map(source=>{
    const group=GROUP_BY_BRANCH[source.branch];
    return {...source,group,target:SAN_HE_TARGETS[group][name]};
  });
  const hits=[];
  for(const source of sources){
    for(const hit of branchHits(pillars,[source.target])){
      hits.push({...hit,source:source.label+' '+source.branch+' 기준'});
    }
  }
  return makeStar(name+'살',{
    hits,
    basis:sources.map(x=>x.label+' '+x.branch+' → '+x.target).join(' / ')
  });
};

const monthSeason=branch=>{
  if(['寅','卯','辰'].includes(branch)) return 'spring';
  if(['巳','午','未'].includes(branch)) return 'summer';
  if(['申','酉','戌'].includes(branch)) return 'autumn';
  return 'winter';
};

const voidBranches=dayIndex=>{
  const startBranch=mod(Math.floor(dayIndex/10)*10,12);
  return [BRANCHES[mod(startBranch+10,12)].hanja,BRANCHES[mod(startBranch+11,12)].hanja];
};

const twelveForAnchor=(anchor,pillars)=>{
  const group=GROUP_BY_BRANCH[anchor.branch];
  const order=TWELVE_TABLE[group];
  const byBranch=Object.fromEntries(order.map((branch,index)=>[branch,TWELVE_NAMES[index]]));
  return {
    anchor:anchor.key,
    anchorLabel:anchor.label,
    anchorBranch:anchor.branch,
    group,
    rows:branchEntries(pillars).map(hit=>({
      position:hit.key,
      positionLabel:hit.label,
      branch:hit.hanja,
      label:byBranch[hit.hanja]
    }))
  };
};

export function calculateSymbolicStars({dayStemIndex,pillars}){
  const dayStem=STEMS[dayStemIndex];
  const monthBranch=pillars.month.branch.hanja;
  const yearBranch=pillars.year.branch.hanja;
  const dayBranch=pillars.day.branch.hanja;
  const dayPillarIndex=pillars.day.index;

  const tianDeRule=TIAN_DE[monthBranch];
  const tianDeHits=tianDeRule.kind==='stem'
    ?stemHits(pillars,[tianDeRule.value])
    :branchHits(pillars,[tianDeRule.value]);

  const yueDeTarget=YUE_DE[GROUP_BY_BRANCH[monthBranch]];
  const heavenlyDoctorTarget=BRANCHES[mod(pillars.month.branchIndex-1,12)].hanja;

  const kitchenHits=branchHits(pillars,[TIAN_CHU[dayStem.hanja]]).map(x=>({...x,subtype:'천주'}));
  const officeHits=branchHits(pillars,[TIAN_GUAN[dayStem.hanja]]).map(x=>({...x,subtype:'천관'}));

  const gangHits=pillarHits(pillars,GANG_PILLARS);
  const netHits=[];
  for(const item of NET_PAIRS){
    for(const hit of pairHits(pillars,[item.pair])) netHits.push({...hit,subtype:item.name});
  }

  const yangTarget=YANG_REN[dayStem.hanja]||null;
  const voids=voidBranches(dayPillarIndex);

  const samjaeGroup=GROUP_BY_BRANCH[yearBranch];
  const samjaeYears=SAMJAE[samjaeGroup];

  const season=monthSeason(monthBranch);
  const geupHits=branchHits(pillars,GEUP_GAK[season]);

  const lonelinessRule=Object.values(GO_SIN_GWA_SUK).find(x=>x.anchors.includes(yearBranch));
  const lonelinessHits=[
    ...branchHits(pillars,[lonelinessRule.고신]).map(x=>({...x,subtype:'고신'})),
    ...branchHits(pillars,[lonelinessRule.과숙]).map(x=>({...x,subtype:'과숙'}))
  ];

  const stars=[
    makeStar('천을귀인',{
      hits:branchHits(pillars,TIAN_YI[dayStem.hanja]),
      basis:'태어난 날의 위 글자 '+dayStem.hanja+' 기준 → '+TIAN_YI[dayStem.hanja].join('·')
    }),
    makeStar('천덕귀인',{
      hits:tianDeHits,
      basis:'태어난 달의 아래 글자 '+monthBranch+' 기준 → '+tianDeRule.value+' ('+(tianDeRule.kind==='stem'?'위 글자':'아래 글자')+'에서 찾음)'
    }),
    makeStar('월덕귀인',{
      hits:stemHits(pillars,[yueDeTarget]),
      basis:'태어난 달 '+monthBranch+'의 삼합 '+GROUP_BY_BRANCH[monthBranch]+' 기준 → 위 글자 '+yueDeTarget
    }),
    makeStar('문창귀인',{
      hits:branchHits(pillars,[WEN_CHANG[dayStem.hanja]]),
      basis:'태어난 날의 위 글자 '+dayStem.hanja+' 기준 → '+WEN_CHANG[dayStem.hanja]
    }),
    makeStar('천의성',{
      hits:branchHits(pillars,[heavenlyDoctorTarget]),
      basis:'태어난 달의 아래 글자 '+monthBranch+' 바로 앞 지지 → '+heavenlyDoctorTarget
    }),
    makeStar('암록',{
      hits:branchHits(pillars,[AN_LU[dayStem.hanja]]),
      basis:'태어난 날의 위 글자 '+dayStem.hanja+' 기준 → '+AN_LU[dayStem.hanja]
    }),
    makeStar('금여록',{
      hits:branchHits(pillars,[JIN_YU[dayStem.hanja]]),
      basis:'태어난 날의 위 글자 '+dayStem.hanja+' 기준 → '+JIN_YU[dayStem.hanja]
    }),
    makeStar('천주천관',{
      hits:[...kitchenHits,...officeHits],
      basis:'태어난 날의 위 글자 '+dayStem.hanja+' 기준 → 천주 '+TIAN_CHU[dayStem.hanja]+' / 천관 '+TIAN_GUAN[dayStem.hanja],
      statusText:[...kitchenHits,...officeHits].length
        ?[...kitchenHits,...officeHits].map(x=>x.subtype+' '+x.label+' '+x.hanja).join(' · ')
        :'해당 없음'
    }),
    makeStar('학당귀인',{
      hits:branchHits(pillars,[XUE_TANG[dayStem.hanja]]),
      basis:'태어난 날의 위 글자 '+dayStem.hanja+'의 장생 자리 → '+XUE_TANG[dayStem.hanja]
    }),

    makeStar('귀문관살',{
      hits:pairHits(pillars,GUI_MUN_PAIRS),
      basis:'지지 두 글자 조합 · 子酉 / 丑午 / 寅未 / 卯申 / 辰亥 / 巳戌'
    }),
    makeStar('괴강살',{
      hits:gangHits,
      basis:'표준 괴강 간지 · '+GANG_PILLARS.join(' · '),
      extra:{schoolVariant:'일부 학파는 '+GANG_VARIANTS.join(' · ')+'도 포함합니다.'}
    }),
    makeStar('천라지망살',{
      hits:netHits,
      basis:'천라 戌亥 / 지망 辰巳 조합'
    }),
    sanheStar('도화',pillars),
    sanheStar('역마',pillars),
    sanheStar('화개',pillars),
    makeStar('백호살',{
      hits:pillarHits(pillars,BAEKHO_PILLARS),
      basis:'백호 7간지 · '+BAEKHO_PILLARS.join(' · ')
    }),
    makeStar('양인살',{
      hits:yangTarget?branchHits(pillars,[yangTarget]):[],
      basis:yangTarget
        ?'양일간 '+dayStem.hanja+'의 제왕 자리 → '+yangTarget
        :'음일간은 양인살 표준 판정에서 제외하는 기준을 사용합니다.'
    }),
    makeStar('홍염살',{
      hits:branchHits(pillars,[HONG_YAN[dayStem.hanja]]),
      basis:'태어난 날의 위 글자 '+dayStem.hanja+' 기준 → '+HONG_YAN[dayStem.hanja]
    }),
    makeStar('원진살',{
      hits:pairHits(pillars,WON_JIN_PAIRS),
      basis:'지지 짝 · 子未 / 丑午 / 寅酉 / 卯申 / 辰亥 / 巳戌'
    }),
    makeStar('공망',{
      hits:branchHits(pillars,voids),
      basis:'태어난 날의 60갑자 순(旬) 기준 → 공망 '+voids.join('·')
    }),
    makeStar('삼재',{
      mode:'cycle',
      basis:'태어난 해의 아래 글자 '+yearBranch+'가 속한 삼합 '+samjaeGroup+' 기준',
      statusText:'삼재가 되는 해의 지지 · '+samjaeYears.join(' · '),
      extra:{yearBranches:samjaeYears}
    }),
    makeStar('현침살',{
      hits:[
        ...stemHits(pillars,HYEON_CHIM_STEMS),
        ...branchHits(pillars,HYEON_CHIM_BRANCHES)
      ],
      basis:'글자 모양 기준 · 위 글자 '+HYEON_CHIM_STEMS.join('·')+' / 아래 글자 '+HYEON_CHIM_BRANCHES.join('·')
    }),
    makeStar('급각살',{
      hits:geupHits,
      basis:'태어난 달 '+monthBranch+'의 계절 기준 → '+GEUP_GAK[season].join('·')
    }),
    makeStar('고신과숙살',{
      hits:lonelinessHits,
      basis:'태어난 해의 아래 글자 '+yearBranch+' 기준 → 고신 '+lonelinessRule.고신+' / 과숙 '+lonelinessRule.과숙,
      statusText:lonelinessHits.length
        ?lonelinessHits.map(x=>x.subtype+' '+x.label+' '+x.hanja).join(' · ')
        :'해당 없음'
    })
  ];

  const anchors=sanheSources(pillars);
  const twelveStars=anchors.map(anchor=>twelveForAnchor(anchor,pillars));

  return {
    method:'symbolic-stars-v2',
    policy:SYMBOLIC_STAR_POLICY,
    stars,
    present:stars.filter(x=>x.present===true),
    twelveStars,
    missingHour:!pillars.hour,
    explanation:'사주결은 일부 신살만 골라 보여주지 않고, 고정한 공통 24종 전체와 별도 체계인 12신살 전체를 함께 계산합니다. 다만 신살은 학파에 따라 범위와 표가 달라질 수 있고, 어느 하나만으로 길흉이나 사건을 단정하지 않습니다.'
  };
}
