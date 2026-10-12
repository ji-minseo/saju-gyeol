const POSITION_LABELS={year:'년지',month:'월지',day:'일지',hour:'시지'};

const STAGE_MEANINGS={
  장생:'새 흐름이 시작되고 가능성이 살아나는 국면',
  목욕:'익숙한 틀에서 벗어나 변화와 자극을 크게 받는 국면',
  관대:'역할과 형태를 갖추며 바깥으로 성장하는 국면',
  건록:'내 힘으로 서고 직접 실행하는 힘이 또렷해지는 국면',
  제왕:'한 방향으로 힘이 강하게 모이고 주도성이 커지는 국면',
  쇠:'속도를 조절하고 이미 가진 것을 정리해 쓰는 국면',
  병:'힘이 여러 갈래로 분산되어 점검과 조율이 필요한 국면',
  사:'한 흐름을 마무리하고 다음 단계로 넘기는 전환의 국면',
  묘:'밖으로 펼치기보다 안에 모으고 저장하는 국면',
  절:'기존 연결을 끊고 새 판을 준비하는 전환의 국면',
  태:'아직 드러나지 않은 가능성이 안에서 만들어지는 국면',
  양:'새 흐름이 자리 잡기 전 보호하고 기르는 국면'
};

const RELATION_MEANINGS={
  combine:'두 자리가 서로 연결되고 한쪽으로 묶이기 쉬운 구조',
  clash:'서로 다른 방향이 맞부딪혀 조정이나 변화가 생기기 쉬운 구조',
  harm:'겉으로 큰 충돌보다 미세한 어긋남이나 불편이 반복되기 쉬운 구조',
  break:'이어지던 방식이 느슨해지거나 다시 조합될 수 있는 구조',
  punishment:'같은 문제를 압박감 있게 반복하거나 조정해야 하기 쉬운 구조',
  'self-punishment':'같은 지지가 겹쳐 한 패턴이 안쪽에서 반복되기 쉬운 구조',
  'three-harmony':'세 지지가 한 방향의 오행 흐름으로 연결되는 구조'
};

const hiddenLayerText=layers=>{
  const present=(layers||[]).filter(x=>x?.stem);
  if(!present.length) return null;
  return present.map(layer=>layer.tenGod+'('+layer.stem.hanja+')').join('·');
};

export function buildDetailGuide(result){
  const dayStage=result.twelveStages?.pillars?.day;
  const monthStage=result.twelveStages?.pillars?.month;
  const twelveStages=dayStage
    ?'십이운성은 일간의 기운이 각 지지에서 어떤 국면으로 드러나는지 보는 12단계 비유예요. 이 명식의 일지는 ‘'+dayStage.name+'’으로, '+(STAGE_MEANINGS[dayStage.name]||'특정한 작동 국면')+'으로 읽습니다.'+(monthStage&&monthStage.name!==dayStage.name?' 사회 환경을 보는 월지는 ‘'+monthStage.name+'’이라 두 국면의 차이도 함께 봐요.':'')+' 수명이나 실제 생애 단계를 뜻하는 표시는 아닙니다.'
    :'십이운성은 일간의 기운이 각 지지에서 어떤 국면으로 드러나는지 보는 12단계 비유이며, 실제 생애 단계나 길흉 점수로 읽지 않습니다.';

  const hiddenCandidates=['month','day','year','hour']
    .filter(key=>result.hiddenStems?.pillars?.[key]&&result.pillars?.[key])
    .map(key=>({
      key,
      branch:result.pillars[key].branch.hanja,
      text:hiddenLayerText(result.hiddenStems.pillars[key]),
      count:(result.hiddenStems.pillars[key]||[]).filter(x=>x?.stem).length
    }))
    .filter(x=>x.text);
  const layered=hiddenCandidates.filter(x=>x.count>1);
  const focus=layered.slice(0,2).map(x=>POSITION_LABELS[x.key]+' '+x.branch+' 안에는 '+x.text).join(', ');
  const hiddenStems='지장간은 지지 하나를 한 가지 성질로만 보지 않기 위해 안쪽의 천간 층을 펼쳐 보는 표예요. 정기(본기)가 대표 성질이고 중기·여기는 함께 섞여 있는 보조 성질로 봅니다.'+(focus?' 이 명식에서는 특히 '+focus+'가 함께 들어 있어, 겉의 대표 십성만으로 읽을 때보다 한 층 더 복합적으로 볼 수 있어요.':'');

  const relations=result.branchRelations?.items||[];
  const relationItems=relations.map(item=>{
    const positions=(item.pillars||[]).map(key=>POSITION_LABELS[key]).join('·');
    return {
      label:item.label,
      branches:(item.branches||[]).join('·'),
      positions,
      meaning:RELATION_MEANINGS[item.type]||'두 지지 사이의 연결 방식을 보여주는 구조'
    };
  });
  const branchRelations=relationItems.length
    ?'현재 명식에는 '+[...new Set(relationItems.map(x=>x.label))].join('·')+' 관계가 보여요. 관계가 있다고 해서 곧바로 좋고 나쁨을 뜻하지 않고, 어느 자리끼리 연결되거나 긴장하는지를 먼저 봅니다.'
    :'현재 네 지지 사이에는 이 계산 기준에서 잡는 주요 합·충·형·파·해 관계가 없습니다. 이것도 “관계가 없다”는 뜻이 아니라, 해당 규칙의 강한 연결 표시가 잡히지 않았다는 뜻이에요.';

  const occupied=result.void?.occupiedPillars||[];
  const voidBranches=result.void?.branches?.map(x=>x.hanja).join('·')||'—';
  const voidText=occupied.length
    ?'이 명식의 공망은 '+voidBranches+'이고, 실제 명식에서는 '+occupied.map(x=>POSITION_LABELS[x]).join('·')+'가 겹칩니다. 공망은 그 자리가 사라지거나 반드시 나빠진다는 뜻이 아니라, 익숙한 방식이 바로 채워지지 않거나 다르게 체감될 수 있는 보조 구조로만 봅니다.'
    :'이 명식의 공망은 '+voidBranches+'이지만 현재 네 지지와 직접 겹치는 자리는 없습니다. 공망 자체를 불운 점수로 사용하지 않고 다른 구조와 함께 참고합니다.';

  let daeun='대운은 약 10년 단위로 바뀌는 시기의 배경입니다. 원국이 사람의 기본 구조라면, 대운은 그 구조 위에서 어떤 주제가 오래 앞에 놓이는지를 보는 층이에요.';
  if(result.daeun?.status==='ok'){
    daeun+=' 이 명식은 '+(result.daeun.direction==='forward'?'순행':'역행')+'으로 배열되고 첫 대운은 약 '+result.daeun.startAgeYearsRounded+'세부터 시작합니다. 순행·역행은 운이 좋고 나쁜 방향이 아니라 대운 기둥을 배열하는 순서예요.';
  }else if(result.daeun?.status==='needs-sex'){
    daeun+=' 현재는 성별이 선택되지 않아 순행·역행과 배열을 확정하지 않았어요.';
  }else if(result.daeun?.status==='needs-birth-time'){
    daeun+=' 현재는 출생시간이 없어 첫 대운의 기산 시점을 확정하지 않았어요.';
  }

  return {hiddenStems,twelveStages,branchRelations,relationItems,void:voidText,daeun};
}

export function explainCurrentFlow(flow){
  const daeun=flow?.daeun;
  const current=flow?.annuals?.find(x=>x.isCurrent)||flow?.annuals?.[0];
  if(daeun?.status==='active'&&current){
    return '지금은 '+daeun.pillar.hanja+' 대운의 큰 배경 위에 '+current.pillar.hanja+' 세운이 겹쳐 있습니다. 아래 해석은 둘을 각각 “무슨 사건이 생긴다”로 읽지 않고, 원국에서 어떤 성질과 십성 주제가 지금 더 앞에 오는지 비교해서 보여줘요.';
  }
  if(current){
    return '현재 세운은 '+current.pillar.hanja+'입니다. 대운 위치를 확정할 정보가 부족해도 해마다 바뀌는 세운의 주제는 따로 볼 수 있어요. 특정 사건보다 원국과 어떤 주제가 겹치는지를 중심으로 읽습니다.';
  }
  return '원국은 타고난 기본 구조, 대운과 세운은 그 위에 시간에 따라 더해지는 층입니다. 사주결은 둘을 겹쳐 주제의 변화를 읽습니다.';
}
