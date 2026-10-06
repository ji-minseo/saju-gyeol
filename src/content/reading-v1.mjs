const categoryOf=name=>{
  if(name==='비견'||name==='겁재') return 'peer';
  if(name==='식신'||name==='상관') return 'output';
  if(name==='편재'||name==='정재') return 'wealth';
  if(name==='편관'||name==='정관') return 'officer';
  if(name==='편인'||name==='정인') return 'resource';
  return null;
};

const DAY_MASTER={
  甲:{title:'크게 방향을 잡고 밀어붙이는 쪽',body:'작은 조정보다 큰 방향을 먼저 세우고, 한번 납득한 목표는 오래 끌고 가는 편으로 읽힙니다. 일이 막히면 미세 조정보다 구조 자체를 바꾸려는 선택이 빨라질 수 있어요.'},
  乙:{title:'상황을 읽고 유연하게 파고드는 쪽',body:'정면 돌파보다 주변 조건을 빨리 읽고 가장 현실적인 틈을 찾는 편으로 읽힙니다. 사람이나 환경의 미묘한 차이를 잘 감지하지만, 기준이 흔들리면 결정이 늦어질 수 있어요.'},
  丙:{title:'밖으로 드러내고 판을 움직이는 쪽',body:'생각을 숨겨두기보다 밖으로 꺼내 분위기와 흐름을 바꾸는 쪽에 가깝습니다. 반응이 빠르고 존재감이 분명한 대신, 답답한 환경에서는 속도를 지나치게 올릴 수 있어요.'},
  丁:{title:'작게 보이는 차이를 끝까지 다듬는 쪽',body:'겉으로 크게 밀기보다 디테일과 완성도를 붙잡고 오래 다듬는 힘을 중요하게 읽습니다. 마음에 안 드는 부분을 그냥 넘기지 못해 결과물은 좋아지지만, 자기 기준이 높아 피로가 쌓이기 쉬워요.'},
  戊:{title:'흔들리지 않는 기준을 먼저 만드는 쪽',body:'빠른 변화보다 안정적인 구조와 기준을 만드는 데 강점이 있습니다. 책임 범위가 분명할수록 힘을 잘 쓰지만, 이미 만든 틀을 바꾸는 데 시간이 걸릴 수 있어요.'},
  己:{title:'정리하고 돌보며 현실화하는 쪽',body:'흩어진 정보나 사람을 한데 모아 실제로 굴러가게 만드는 힘을 중요하게 읽습니다. 세심하게 챙기는 대신, 다른 사람 몫까지 떠안기 쉬운 편이에요.'},
  庚:{title:'문제를 빠르게 잘라내고 결정하는 쪽',body:'애매함을 오래 끌기보다 핵심을 가르고 결정하는 힘이 강합니다. 실무에서 속도가 나지만, 충분히 설명되지 않은 감정 문제에서는 말이 날카롭게 들릴 수 있어요.'},
  辛:{title:'정확도와 완성 기준을 세우는 쪽',body:'작은 오차와 어색함을 잘 발견하고, 무엇이 더 나은지 비교하는 감각을 중요하게 읽습니다. 퀄리티에는 강하지만 스스로에게 지나치게 엄격해질 수 있어요.'},
  壬:{title:'큰 흐름을 읽고 방향을 바꾸는 쪽',body:'한 가지 방식에 고정되기보다 상황 변화에 맞춰 경로를 바꾸는 힘이 있습니다. 여러 가능성을 동시에 볼 수 있지만, 선택지가 많아지면 집중이 분산되기 쉬워요.'},
  癸:{title:'미세한 신호를 모아 판단하는 쪽',body:'앞에 나서기보다 정보와 분위기를 세밀하게 모아서 판단하는 편으로 읽힙니다. 보이지 않는 맥락을 잘 잡지만, 생각이 깊어질수록 결정이 늦어질 수 있어요.'}
};

const countCategories=result=>{
  const counts={peer:0,output:0,wealth:0,officer:0,resource:0};
  for(const group of [result.tenGods.visibleStems,result.tenGods.visibleBranches]){
    for(const value of Object.values(group)){
      const key=categoryOf(value);
      if(key) counts[key]+=1;
    }
  }
  return counts;
};

const hiddenHas=(result,kind)=>Object.values(result.hiddenStems.pillars)
  .filter(Boolean).flat().some(x=>categoryOf(x.tenGod)===kind);

const relationNames=result=>new Set(result.branchRelations.items.map(x=>x.type));

export function buildReading(result){
  const counts=countCategories(result);
  const dm=DAY_MASTER[result.dayMaster.hanja]??DAY_MASTER.丁;
  const relations=relationNames(result);
  const outputStrong=counts.output>=2;
  const resourceStrong=counts.resource>=2;
  const peerStrong=counts.peer>=2;
  const wealthVisible=counts.wealth>0;
  const wealthHidden=hiddenHas(result,'wealth');
  const officerVisible=counts.officer>0;

  const temperament={
    title:dm.title,
    body:dm.body+(outputStrong?' 여기에 식신·상관이 반복되어, 생각을 머릿속에만 두기보다 실제 말·글·작업물로 꺼내면서 정리하는 성향이 더 강해집니다.':'')+(resourceStrong?' 인성도 반복되어, 바로 움직이기 전에 자료를 모으거나 자기 방식으로 이해해야 마음이 놓이는 면이 함께 보입니다.':''),
    evidence:[`일간 ${result.dayMaster.hanja}`,...(outputStrong?['식상 반복']:[]),...(resourceStrong?['인성 반복']:[])]
  };

  const careerParts=[];
  if(outputStrong) careerParts.push('요청을 그대로 처리하는 역할보다, 문제를 보고 방식 자체를 개선하거나 결과물을 직접 만드는 일에서 강점을 쓰기 쉽습니다.');
  if(resourceStrong) careerParts.push('자료를 파고들어 자기 언어로 다시 정리하는 과정도 중요해서, 기획·분석·디자인·개발처럼 이해와 산출이 함께 필요한 일이 잘 맞는 편으로 읽힙니다.');
  if(peerStrong) careerParts.push('동료나 경쟁자가 있는 환경에서는 자극을 받아 속도가 붙지만, 역할 경계가 불분명하면 “왜 내가 이것까지?”라는 피로가 커질 수 있습니다.');
  if(careerParts.length===0) careerParts.push('한 가지 직업명보다, 명식에서 반복되는 십성의 역할을 기준으로 일하는 방식을 읽는 편이 더 자연스럽습니다.');
  const career={
    title:outputStrong?'내 손을 거쳐 달라지는 일이 잘 맞는 편':'역할보다 일하는 방식을 먼저 보는 편',
    body:careerParts.join(' '),
    evidence:[...(outputStrong?['식신·상관']:[]),...(resourceStrong?['정인·편인']:[]),...(peerStrong?['비견·겁재']:[])]
  };

  let moneyBody;
  if(!wealthVisible&&wealthHidden){
    moneyBody='재성은 겉의 천간·지지 대표값에는 두드러지지 않지만 지장간에는 들어 있습니다. 그래서 돈 자체를 앞세우기보다 기술·작업·경험을 먼저 쌓고, 그것이 상품·계약·수익으로 바뀌는 순간에 재물 이슈가 선명해지는 구조로 읽는 편이 자연스럽습니다.';
  }else if(wealthVisible){
    moneyBody='재성이 원국 표면에도 드러나 있어, 결과를 금액·성과·소유처럼 측정 가능한 형태로 바꾸는 문제를 비교적 직접적으로 의식하는 편으로 읽힙니다.';
  }else{
    moneyBody='재성을 한두 글자만 보고 재물운을 단정하기보다, 식상에서 결과물이 만들어지고 그것이 실제 수익으로 연결되는 경로를 함께 보는 편이 중요합니다.';
  }
  if(outputStrong) moneyBody+=' 식상이 함께 강하면 “잘하는 것”을 실제 판매 가능한 결과물로 묶는 과정이 특히 중요해집니다.';
  const money={
    title:!wealthVisible&&wealthHidden?'돈은 앞보다 뒤에서 붙는 구조':'결과를 실제 가치로 바꾸는 방식이 중요',
    body:moneyBody,
    evidence:[wealthVisible?'재성 표출':wealthHidden?'재성 지장간':'재성 약표출',...(outputStrong?['식상 반복']:[])]
  };

  let loveBody='관계에서는 한 글자보다 일지와 관성·재성, 그리고 지지 관계를 함께 보는 편이 안전합니다.';
  if(relations.has('clash')) loveBody+=' 충이 있으면 가까운 관계와 바깥 환경 사이의 속도나 방향이 어긋날 때 스트레스를 크게 느끼는 패턴으로 읽을 수 있습니다.';
  if(relations.has('punishment')) loveBody+=' 형이 있으면 상대의 행동보다 “왜 이렇게 해야 하는지”에 대한 자기 기준이 강해져, 같은 문제를 오래 곱씹거나 수정하려는 경향이 나타날 수 있어요.';
  if(officerVisible) loveBody+=' 관성도 표면에 있어 관계에서 약속, 일관성, 책임감을 꽤 중요한 기준으로 삼기 쉽습니다.';
  const relationship={
    title:(relations.has('clash')||relations.has('punishment'))?'가까워질수록 기준과 속도 차이가 중요':'관계에서는 일관성과 방식의 합이 중요',
    body:loveBody,
    evidence:[...(relations.has('clash')?['지지 충']:[]),...(relations.has('punishment')?['지지 형']:[]),...(officerVisible?['관성 표출']:[])]
  };

  return {temperament,relationship,career,money};
}
