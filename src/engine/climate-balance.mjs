import {STEMS,BRANCH_RULING_STEMS,ELEMENT_LABELS} from './rules.mjs';

export const CLIMATE_BALANCE_POLICY={
  version:'1.0',
  method:'qiongtong-baojian-10-stems-x-12-jie-months',
  sourceFrame:'궁통보감 계열 통행 정리표',
  monthBasis:'solar-term-month-branch',
  orderedCandidates:true,
  firstCandidateIsPrimaryReference:true,
  finalUsefulGod:false,
  healthDiagnosis:false,
  note:'일간×절기월 120칸의 고전 조후 참고표를 사용하되, 표의 1순위를 최종 용신으로 확정하지 않는다. 원국 존재 여부와 억부 기준을 따로 비교한다.'
};

const TABLE={
  甲:{寅:'丙癸',卯:'庚丙丁戊己',辰:'庚丁壬',巳:'癸丁庚',午:'癸丁庚',未:'丁庚癸',申:'庚丁壬',酉:'丁丙庚',戌:'庚甲丁壬癸',亥:'庚丁丙戊',子:'丁庚丙',丑:'丁庚丙'},
  乙:{寅:'丙癸',卯:'丙癸',辰:'癸丙戊',巳:'癸',午:'癸丙',未:'癸丙',申:'丙癸己',酉:'癸丙丁',戌:'癸辛',亥:'丙戊',子:'丙',丑:'丙'},
  丙:{寅:'壬庚',卯:'壬己',辰:'壬甲',巳:'壬癸庚',午:'壬庚',未:'壬庚',申:'壬戊',酉:'壬癸',戌:'甲壬',亥:'甲戊庚壬',子:'壬戊己',丑:'壬甲'},
  丁:{寅:'甲庚',卯:'庚甲',辰:'甲庚',巳:'甲庚',午:'壬庚癸',未:'甲壬庚',申:'甲庚丙戊',酉:'甲庚丙戊',戌:'甲庚戊',亥:'甲庚',子:'甲庚',丑:'甲庚'},
  戊:{寅:'丙甲癸',卯:'丙甲癸',辰:'甲丙癸',巳:'甲丙癸',午:'壬甲丙',未:'癸丙甲',申:'丙癸甲',酉:'丙癸',戌:'甲丙癸',亥:'甲丙',子:'丙甲',丑:'丙甲'},
  己:{寅:'丙庚甲',卯:'甲癸丙',辰:'丙癸甲',巳:'癸丙',午:'癸丙',未:'癸丙',申:'丙癸',酉:'丙癸',戌:'甲丙癸',亥:'丙甲戊',子:'丙甲戊',丑:'丙甲戊'},
  庚:{寅:'戊甲壬丙丁',卯:'丁甲庚丙',辰:'甲丁壬癸',巳:'壬戊丙丁',午:'壬癸',未:'丁甲',申:'丁甲',酉:'丁甲丙',戌:'甲壬',亥:'丁丙',子:'丁甲丙',丑:'丙丁甲'},
  辛:{寅:'己壬庚',卯:'壬甲',辰:'壬甲',巳:'壬甲癸',午:'壬己癸',未:'壬庚甲',申:'壬甲戊',酉:'壬甲',戌:'壬甲',亥:'壬丙',子:'丙戊壬甲',丑:'丙壬戊己'},
  壬:{寅:'庚丙戊',卯:'戊辛庚',辰:'甲庚',巳:'壬辛庚癸',午:'癸庚辛',未:'辛甲',申:'戊丁',酉:'甲庚',戌:'甲丙',亥:'戊丙庚',子:'戊丙',丑:'丙丁甲'},
  癸:{寅:'辛丙',卯:'庚辛',辰:'丙辛甲',巳:'辛',午:'庚辛壬癸',未:'庚辛壬癸',申:'丁',酉:'辛丙',戌:'辛甲壬癸',亥:'庚辛戊丁',子:'丙辛',丑:'丙丁'}
};

const MONTH_PROFILE={
  寅:{season:'초봄',plain:'겨울의 찬 기운이 아직 남아 있지만 봄기운이 막 올라오는 때'},
  卯:{season:'봄 한가운데',plain:'온기가 올라오고 목 기운이 넓게 퍼지는 때'},
  辰:{season:'늦봄',plain:'봄의 습기가 남아 있으면서 여름으로 넘어가는 때'},
  巳:{season:'초여름',plain:'열기가 빠르게 올라오기 시작하는 때'},
  午:{season:'한여름',plain:'열기가 가장 강하게 드러나는 때'},
  未:{season:'늦여름',plain:'더위가 남아 있고 건조함도 함께 커지기 쉬운 때'},
  申:{season:'초가을',plain:'더위가 꺾이고 서늘함과 건조함이 시작되는 때'},
  酉:{season:'가을 한가운데',plain:'서늘하고 건조한 기운이 또렷해지는 때'},
  戌:{season:'늦가을',plain:'서늘하고 건조하며 겨울로 넘어가기 직전의 때'},
  亥:{season:'초겨울',plain:'찬 기운과 습기가 함께 커지기 시작하는 때'},
  子:{season:'한겨울',plain:'찬 기운이 가장 강하게 드러나는 때'},
  丑:{season:'늦겨울',plain:'차고 습한 기운이 남아 있으면서 봄을 기다리는 때'}
};

const STEM_INDEX=Object.fromEntries(STEMS.map((stem,index)=>[stem.hanja,index]));
const POSITION_LABEL={year:'년주',month:'월주',day:'일주',hour:'시주'};
const HIDDEN_LABEL={residual:'여기',middle:'중기',main:'정기'};

const candidatePresence=(stemHanja,pillars)=>{
  const index=STEM_INDEX[stemHanja];
  const visible=[];
  const hidden=[];
  for(const [key,pillar] of Object.entries(pillars)){
    if(!pillar) continue;
    if(pillar.stemIndex===index){
      visible.push({pillar:key,label:POSITION_LABEL[key]+' 위 글자',branch:null});
    }
    const row=BRANCH_RULING_STEMS[pillar.branchIndex];
    for(const position of ['residual','middle','main']){
      if(row[position]!==index) continue;
      hidden.push({
        pillar:key,
        label:POSITION_LABEL[key]+' 아래 글자 '+pillar.branch.hanja+' 속 '+HIDDEN_LABEL[position],
        branch:pillar.branch.hanja,
        position
      });
    }
  }
  return {
    visible,
    hidden,
    state:visible.length?'visible':hidden.length?'hidden':'absent',
    text:visible.length
      ?'겉에 이미 보임 · '+visible.map(x=>x.label).join(' · ')
      :hidden.length
        ?'겉에는 없지만 아래 글자 안에 있음 · '+hidden.map(x=>x.label).join(' · ')
        :'현재 명식의 위 글자와 지장간에는 직접 보이지 않음'
  };
};

const stemInfo=hanja=>{
  const stem=STEMS[STEM_INDEX[hanja]];
  return {
    hanja,
    korean:stem.ko,
    element:stem.element,
    elementKo:ELEMENT_LABELS[stem.element],
    label:hanja+' · '+stem.ko+ELEMENT_LABELS[stem.element]
  };
};

export function analyzeClimateBalance({dayStemIndex,pillars,structuralAnalysis=null}){
  const dayStem=STEMS[dayStemIndex];
  const monthBranch=pillars.month.branch.hanja;
  const profile=MONTH_PROFILE[monthBranch];
  const ordered=[...TABLE[dayStem.hanja][monthBranch]];
  const candidates=ordered.map((hanja,index)=>({
    priority:index+1,
    ...stemInfo(hanja),
    presence:candidatePresence(hanja,pillars)
  }));
  const primary=candidates[0];
  const balancing=structuralAnalysis?.usefulGod?.primary||null;
  const sameElement=Boolean(balancing&&primary&&balancing.element===primary.element);

  let comparison;
  if(!balancing){
    comparison='힘의 균형 쪽에서는 특정 오행 하나를 고정하지 않았고, 계절 기준에서는 '+primary.elementKo+'을 먼저 참고합니다.';
  }else if(sameElement){
    comparison='힘의 균형과 계절 기준이 모두 '+primary.elementKo+' 쪽을 먼저 보고 있어요. 서로 다른 두 기준이 같은 방향을 가리키는 경우입니다.';
  }else{
    comparison='힘의 균형은 '+balancing.label+', 계절 기준은 '+primary.elementKo+'을 먼저 봐요. 두 방법은 질문이 달라 결과가 달라도 계산 오류는 아니에요.';
  }

  const candidateList=candidates.map(x=>x.label).join(' → ');

  return {
    method:'climate-balance-v1',
    policy:CLIMATE_BALANCE_POLICY,
    dayMaster:{
      hanja:dayStem.hanja,
      korean:dayStem.ko,
      element:dayStem.element,
      elementKo:ELEMENT_LABELS[dayStem.element]
    },
    month:{
      branch:monthBranch,
      korean:pillars.month.branch.ko,
      ...profile
    },
    candidates,
    primary,
    secondary:candidates.slice(1),
    balancingComparison:{
      balancingElement:balancing?.element||null,
      balancingElementKo:balancing?.label||null,
      sameElement,
      text:comparison
    },
    explanation:'태어난 날의 위 글자 '+dayStem.hanja+'와 태어난 달의 아래 글자 '+monthBranch+'를 함께 놓고, 전통적인 조후 참고표에서 계절상 먼저 살펴보는 후보를 찾습니다. 이 조합의 참고 순서는 '+candidateList+'입니다.',
    presenceSummary:'1순위 '+primary.label+'은 '+primary.presence.text+'입니다.',
    caveat:'이 표는 같은 일간·같은 절기월의 공통 출발점이에요. 실제 명식 전체의 강약·격국·원국에 이미 있는 기운까지 같다고 보지는 않으며, 건강상의 체온·습도나 실제 날씨를 뜻하지 않습니다.'
  };
}

export const CLIMATE_BALANCE_TABLE=TABLE;
