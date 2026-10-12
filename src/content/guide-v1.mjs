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
    ?`당신의 일주는 ${day.hanja}입니다. 위의 ${stem.hanja}(${stem.korean})은 일간, 즉 해석에서 ‘나’를 잡는 기준이에요. ${stem.hanja}은 ${polarityLabel(stem.polarity)}의 ${ELEMENT_LABELS[stem.element]}이고, 아래의 ${branch.hanja}(${branch.korean})은 일지로 가까운 관계와 생활 리듬을 함께 읽는 자리입니다.`
    :'출생시간과 관계없이 일주는 계산되며, 여기에서 일간과 일지의 역할을 설명합니다.';

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
    ?`당신의 표면 십성에서는 ${dominant} 축이 ${topCount}회로 가장 자주 보입니다. 여기서 중요한 건 숫자만이 아니라 ‘어느 기둥의 천간·지지에 놓였는가’예요. 그래서 아래 상세 해석에서는 같은 십성도 년주·월주·일주·시주의 위치를 나눠 읽습니다.`
    :'십성은 일간을 기준으로 계산하며, 아래 상세 해석에서는 각 십성이 어느 기둥과 위치에 놓였는지까지 함께 봅니다.';

  return {dayPillar,elements,tenGods};
}
