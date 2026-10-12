const ELEMENT_LABELS={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};

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

const polarityLabel=value=>value==='yang'?'양':'음';

const countCategories=result=>{
  const counts={peer:0,output:0,wealth:0,officer:0,resource:0};
  for(const group of [result.tenGods?.visibleStems,result.tenGods?.visibleBranches]){
    for(const value of Object.values(group||{})){
      const category=categoryOf(value);
      if(category) counts[category]+=1;
    }
  }
  return counts;
};

const joinTop=(entries,value)=>entries
  .filter(([,count])=>count===value)
  .map(([key])=>CATEGORY_LABELS[key])
  .join('·');

export function buildReadingGuide(result){
  const day=result.pillars?.day;
  const stem=day?.stem;
  const branch=day?.branch;

  const dayPillar=day
    ?`당신의 일주는 ${day.hanja}입니다. 두 글자 중 위의 ${stem.hanja}(${stem.korean})은 태어난 날의 위 글자로, 사주에서 ‘나’를 뜻하는 기준이에요. 이 글자를 일간이라고 불러요. ${stem.hanja}은 ${polarityLabel(stem.polarity)}의 ${ELEMENT_LABELS[stem.element]}이고, 아래의 ${branch.hanja}(${branch.korean})은 가까운 생활과 관계의 바탕을 보는 글자예요. 이 아래 글자를 일지라고 합니다.`
    :'태어난 날의 두 글자 가운데 위 글자를 나를 뜻하는 기준으로, 아래 글자를 가까운 생활의 바탕으로 읽습니다.';

  const elementEntries=Object.entries(result.fiveElements?.counts||{})
    .map(([key,value])=>[key,Number(value||0)])
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const highValue=elementEntries[0]?.[1]??0;
  const lowValue=elementEntries[elementEntries.length-1]?.[1]??0;
  const highs=elementEntries.filter(([,value])=>value===highValue).map(([key])=>ELEMENT_LABELS[key]).join('·');
  const lows=elementEntries.filter(([,value])=>value===lowValue).map(([key])=>ELEMENT_LABELS[key]).join('·');
  const total=Number(result.fiveElements?.characterCount||elementEntries.reduce((sum,[,value])=>sum+value,0));
  const elements=elementEntries.length
    ?`현재 겉으로 드러난 ${total || '네 기둥의'}글자 기준으로 ${highs}가 ${highValue}개로 가장 많이 보이고, ${lows}가 ${lowValue}개로 가장 적게 보입니다. 이 분포는 전체 구조를 읽는 출발점이지, 많고 적음 자체가 길흉 점수는 아니에요.`
    :'오행 분포를 계산한 뒤 어떤 성질이 상대적으로 많이 또는 적게 드러나는지 설명합니다.';

  const categoryCounts=countCategories(result);
  const categoryEntries=Object.entries(categoryCounts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const topCount=categoryEntries[0]?.[1]??0;
  const dominant=topCount>0?joinTop(categoryEntries,topCount):'뚜렷한 한 축 없음';
  const tenGods=topCount>0
    ?`사주에서 ‘나’를 뜻하는 글자와 다른 글자들의 관계를 십성이라고 불러요. 당신에게는 ${dominant} 계열이 ${topCount}회로 가장 자주 보입니다. 숫자만 보는 게 아니라 어느 자리의 위·아래 글자에 놓였는지도 함께 봐요.`
    :'십성은 ‘나’를 뜻하는 글자와 다른 글자들이 어떤 관계인지 붙인 이름이에요. 아래에서는 그 관계가 어느 자리에 놓였는지도 함께 봅니다.';

  return {dayPillar,elements,tenGods};
}
