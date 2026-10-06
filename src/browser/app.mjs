import {calculateSaju,ENGINE_VERSION} from '../engine/calculator.mjs';
import {buildReadingV2} from '../content/reading-v2.mjs';
import {buildCurrentFlow} from '../content/flow-v1.mjs';

const form=document.querySelector('#birth-form');
const dateInput=document.querySelector('#birth-date');
const timeInput=document.querySelector('#birth-time');
const timeUnknown=document.querySelector('#time-unknown');
const preview=document.querySelector('#result-preview');
const summary=document.querySelector('#input-summary');
const errorBox=document.querySelector('#form-error');
const engineBadge=document.querySelector('#engine-badge');
const tenGods=document.querySelector('#ten-gods');
const dayMasterNote=document.querySelector('#day-master-note');
const hiddenStems=document.querySelector('#hidden-stems');
const elementNote=document.querySelector('#element-note');
const twelveStages=document.querySelector('#twelve-stages');
const branchRelationsBox=document.querySelector('#branch-relations');
const voidSummary=document.querySelector('#void-summary');
const voidDetail=document.querySelector('#void-detail');
const daeunMeta=document.querySelector('#daeun-meta');
const daeunTrack=document.querySelector('#daeun-track');
const currentDaeunCard=document.querySelector('#current-daeun-card');
const currentDaeunPillar=document.querySelector('#current-daeun-pillar');
const currentDaeunPeriod=document.querySelector('#current-daeun-period');
const currentDaeunTitle=document.querySelector('#current-daeun-title');
const currentDaeunBody=document.querySelector('#current-daeun-body');
const currentDaeunGuide=document.querySelector('#current-daeun-guide');
const currentDaeunEvidence=document.querySelector('#current-daeun-evidence');
const annualFlow=document.querySelector('#annual-flow');
const flowAsOf=document.querySelector('#flow-as-of');

const tenGodLabels={year:'년간',month:'월간',day:'일간',hour:'시간'};
const elementNames={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};


engineBadge.textContent=`ENGINE · v${ENGINE_VERSION}`;


timeUnknown?.addEventListener('change',()=>{
  timeInput.disabled=timeUnknown.checked;
  if(timeUnknown.checked) timeInput.value='';
});

const setError=message=>{
  errorBox.textContent=message;
  errorBox.hidden=!message;
};

const renderPillar=(key,pillar,stemTenGod,branchTenGod)=>{
  const card=document.querySelector(`[data-pillar="${key}"]`);
  const hanja=card.querySelector('[data-pillar-hanja]');
  const detail=card.querySelector('[data-pillar-detail]');
  if(!pillar){
    card.classList.add('is-empty');
    delete card.dataset.stemElement;
    hanja.textContent='—';
    detail.textContent=key==='hour'?'출생시간 미상':'계산되지 않음';
    return;
  }
  card.classList.remove('is-empty');
  card.dataset.stemElement=pillar.stem.element;
  hanja.textContent=pillar.hanja;
  const stemMeta=`${pillar.stem.korean}${elementNames[pillar.stem.element]} · ${pillar.stem.polarity==='yang'?'양':'음'}`;
  detail.textContent=key==='day'
    ?`${stemMeta} · 지지 ${branchTenGod}`
    :`천간 ${stemTenGod} · 지지 ${branchTenGod}`;
};

const renderElements=result=>{
  for(const [element,count] of Object.entries(result.fiveElements.counts)){
    const row=document.querySelector(`[data-element="${element}"]`);
    if(row){
      row.querySelector('[data-count]').textContent=`${count}개`;
      const bar=row.querySelector('[data-bar]');
      if(bar) bar.style.width=`${Math.max(0,Math.min(100,(count/result.fiveElements.characterCount)*100))}%`;
    }
  }
  const colors={wood:'#789a82',fire:'#d48a78',earth:'#c0a263',metal:'#a698b5',water:'#7697b5'};
  const donut=document.querySelector('#element-donut');
  const total=result.fiveElements.characterCount;
  let offset=0;
  const stops=Object.entries(colors).map(([element,color])=>{
    const start=offset;
    offset+=(result.fiveElements.counts[element]/total)*100;
    return `${color} ${start}% ${offset}%`;
  });
  if(donut){
    donut.style.background=`conic-gradient(${stops.join(',')})`;
    donut.setAttribute('aria-label',`오행 분포: ${Object.keys(colors).map(k=>`${elementNames[k]} ${result.fiveElements.counts[k]}개`).join(', ')}`);
    document.querySelector('#element-total').textContent=total;
  }
  elementNote.textContent=`천간·지지 표면 ${result.fiveElements.characterCount}글자 기준 · 강약 판정 아님`;
};

const renderTenGods=result=>{
  tenGods.replaceChildren();
  for(const key of ['year','month','day','hour']){
    const stemValue=result.tenGods.visibleStems[key];
    const branchValue=result.tenGods.visibleBranches[key];
    if(stemValue!=null){
      const chip=document.createElement('span');
      const label=document.createElement('b');
      label.textContent=tenGodLabels[key];
      chip.append(label,document.createTextNode(` · ${stemValue}`));
      tenGods.append(chip);
    }
    if(branchValue!=null){
      const chip=document.createElement('span');
      const label=document.createElement('b');
      label.textContent=tenGodLabels[key].replace('간','지');
      chip.append(label,document.createTextNode(` · ${branchValue}`));
      tenGods.append(chip);
    }
  }
  const dm=result.dayMaster;
  dayMasterNote.textContent=`일간 ${dm.hanja}(${dm.korean}) · ${elementNames[dm.element]} · ${dm.polarity==='yang'?'양':'음'} 기준 · 지지는 정기(본기) 대표 십성`;
};

const renderHiddenStems=result=>{
  hiddenStems.replaceChildren();
  const labels={year:'년지',month:'월지',day:'일지',hour:'시지'};
  const positionLabel={residual:'여',middle:'중',main:'정'};
  for(const key of ['year','month','day','hour']){
    const layers=result.hiddenStems.pillars[key];
    const pillar=result.pillars[key];
    if(!layers||!pillar) continue;
    const row=document.createElement('div');
    const title=document.createElement('b');
    title.textContent=`${labels[key]} ${pillar.branch.hanja}`;
    const values=document.createElement('span');
    values.textContent=layers.map(layer=>layer.stem?`${positionLabel[layer.position]} ${layer.stem.hanja}·${layer.tenGod}`:`${positionLabel[layer.position]} —`).join('  ');
    row.append(title,values);
    hiddenStems.append(row);
  }
};

const renderStructureFacts=result=>{
  const labels={year:'년',month:'월',day:'일',hour:'시'};

  twelveStages.replaceChildren();
  for(const key of ['year','month','day','hour']){
    const item=result.twelveStages.pillars[key];
    if(!item) continue;
    const chip=document.createElement('span');
    chip.innerHTML=`<b>${labels[key]}</b> · ${item.name}`;
    twelveStages.append(chip);
  }

  branchRelationsBox.replaceChildren();
  if(result.branchRelations.items.length===0){
    const empty=document.createElement('span');
    empty.textContent='주요 관계 없음';
    branchRelationsBox.append(empty);
  }else{
    for(const relation of result.branchRelations.items){
      const chip=document.createElement('span');
      const branches=relation.branches.join('·');
      chip.innerHTML=`<b>${relation.label}</b> · ${branches}`;
      branchRelationsBox.append(chip);
    }
  }

  voidSummary.textContent=result.void.branches.map(x=>x.hanja).join(' · ');
  voidDetail.textContent=result.void.occupiedPillars.length
    ?`현재 명식에서 공망 지지와 겹치는 자리 · ${result.void.occupiedPillars.map(k=>labels[k]+'지').join(' · ')}`
    :'현재 명식의 년·월·시지에는 해당 공망이 없습니다.';

  daeunTrack.replaceChildren();
  if(result.daeun.status==='needs-sex'){
    daeunMeta.textContent='성별을 선택하면 대운 방향과 배열을 계산합니다.';
    return;
  }
  if(result.daeun.status==='needs-birth-time'){
    daeunMeta.textContent='출생시간을 알아야 대운 기산 시점을 계산할 수 있습니다.';
    return;
  }
  if(result.daeun.status!=='ok'){
    daeunMeta.textContent='현재 입력에서는 대운 경계를 계산할 수 없습니다.';
    return;
  }
  daeunMeta.textContent=`${result.daeun.direction==='forward'?'순행':'역행'} · 대운수 약 ${result.daeun.startAgeYearsRounded} · ${result.daeun.boundary.name} 절입 기준`;
  const flow=buildCurrentFlow(result,{today:new Date()});
  for(const cycle of result.daeun.cycles){
    const timeline=flow.daeunTimeline.find(item=>item.order===cycle.order);
    const item=document.createElement('div');

    const age=document.createElement('small');
    age.textContent=`${cycle.startAge}세~`;
    const pillar=document.createElement('strong');
    pillar.textContent=cycle.pillar.hanja;
    const korean=document.createElement('span');
    korean.textContent=cycle.pillar.korean;
    const theme=document.createElement('em');
    theme.textContent=timeline?timeline.theme:'';

    item.append(age,pillar,korean,theme);
    daeunTrack.append(item);
  }
};

const storyLead={temperament:'기질적으로 ',relationship:'관계에서는 ',career:'일에서는 ',money:'돈을 다룰 때는 '};
const toStoryTitle=(key,title)=>{
  const clean=String(title||'').trim().replace(/[.。]+$/,'');
  if(!clean) return '';
  if(/[요죠니다]$/.test(clean)) return `${storyLead[key]||''}${clean}`;
  if(/편$/.test(clean)) return `${storyLead[key]||''}${clean}이에요.`;
  if(/쉬워요$|좋아요$|살아요$|붙어요$|선명해져요$/.test(clean)) return `${storyLead[key]||''}${clean}`;
  return `${storyLead[key]||''}${clean}이에요.`;
};

const renderReading=result=>{
  const reading=buildReadingV2(result);

  for(const [key,section] of Object.entries(reading)){
    const summaryCard=document.querySelector(`[data-summary="${key}"]`);
    const summaryTitle=summaryCard?.querySelector('[data-summary-title]');
    if(summaryTitle) summaryTitle.textContent=toStoryTitle(key,section.title);
  }

  for(const [key,section] of Object.entries(reading)){
    const card=document.querySelector(`[data-reading="${key}"]`);
    if(!card) continue;
    card.querySelector('[data-reading-title]').textContent=toStoryTitle(key,section.title);
    card.querySelector('[data-reading-body]').textContent=section.body;

    let depth=card.querySelector('.reading-depth');
    if(!depth){
      depth=document.createElement('div');
      depth.className='reading-depth';
      const evidenceAnchor=card.querySelector('[data-reading-evidence]');
      card.insertBefore(depth,evidenceAnchor);
    }
    depth.replaceChildren();

    const situations=document.createElement('div');
    situations.className='reading-situations';
    const situationsLabel=document.createElement('strong');
    situationsLabel.textContent='이럴 때 특히 드러나요';
    const situationsList=document.createElement('ul');
    for(const item of section.situations){
      const li=document.createElement('li');
      li.textContent=item;
      situationsList.append(li);
    }
    situations.append(situationsLabel,situationsList);

    const guide=document.createElement('div');
    guide.className='reading-guide';
    const guideLabel=document.createElement('strong');
    guideLabel.textContent='이렇게 쓰면 좋아요';
    const guideText=document.createElement('p');
    guideText.textContent=section.guide;
    guide.append(guideLabel,guideText);
    depth.append(situations,guide);

    const evidence=card.querySelector('[data-reading-evidence]');
    evidence.replaceChildren();
    for(const item of section.evidence){
      const chip=document.createElement('span');
      chip.textContent=item;
      evidence.append(chip);
    }
  }
};

const addEvidenceChips=(container,items)=>{
  container.replaceChildren();
  for(const item of items||[]){
    const chip=document.createElement('span');
    chip.textContent=item;
    container.append(chip);
  }
};

const renderFlow=result=>{
  const flow=buildCurrentFlow(result,{today:new Date()});
  if(flowAsOf) flowAsOf.textContent=`${flow.asOf.replaceAll('-','.')} 현재`;

  const daeun=flow.daeun;
  currentDaeunCard.dataset.status=daeun.status;
  currentDaeunPillar.textContent=daeun.status==='active'?daeun.pillar.hanja:'—';
  currentDaeunPeriod.textContent=daeun.period||(
    daeun.status==='needs-sex'?'성별을 선택하면 현재 대운을 계산합니다.':
    daeun.status==='needs-birth-time'?'출생시간을 입력하면 현재 대운을 계산합니다.':
    '현재 입력에서는 대운 위치를 표시할 수 없습니다.'
  );
  currentDaeunTitle.textContent=daeun.title||'지금의 큰 흐름';
  currentDaeunBody.textContent=daeun.body||'세운은 아래에서 계속 확인할 수 있어요.';
  currentDaeunGuide.textContent=daeun.guide||'대운 계산에 필요한 정보를 입력하면 활용 포인트를 함께 보여드립니다.';
  addEvidenceChips(currentDaeunEvidence,daeun.evidence||[]);

  [...daeunTrack.children].forEach((item,index)=>{
    item.classList.toggle('is-current-daeun',daeun.status==='active'&&index+1===daeun.order);
  });

  annualFlow.replaceChildren();
  for(const annual of flow.annuals){
    const card=document.createElement('article');
    card.className=`annual-flow-card is-${annual.position}`;
    if(annual.isCurrent) card.setAttribute('aria-current','true');

    const top=document.createElement('div');
    top.className='annual-card-top';
    const label=document.createElement('span');
    label.textContent=annual.label;
    const pillar=document.createElement('strong');
    pillar.textContent=annual.pillar.hanja;
    top.append(label,pillar);

    const period=document.createElement('p');
    period.className='annual-period';
    period.textContent=annual.period;

    const title=document.createElement('h4');
    title.textContent=annual.title;

    const body=document.createElement('p');
    body.className='annual-body';
    body.textContent=annual.body;

    const guide=document.createElement('div');
    guide.className='annual-guide';
    const guideLabel=document.createElement('b');
    guideLabel.textContent='활용 포인트';
    const guideText=document.createElement('p');
    guideText.textContent=annual.guide;
    guide.append(guideLabel,guideText);

    const evidence=document.createElement('div');
    evidence.className='flow-evidence';
    for(const item of annual.evidence){
      const chip=document.createElement('span');
      chip.textContent=item;
      evidence.append(chip);
    }

    card.append(top,period,title,body,guide,evidence);
    annualFlow.append(card);
  }
};

const renderSummary=(result,sex)=>{
  const [y,m,d]=result.input.birthDate.split('-');
  const time=result.input.timeKnown?result.input.birthTime:'출생시간 미상';
  const status=result.status==='partial'?' · 시주 제외':'';
  summary.textContent=`${y}년 ${Number(m)}월 ${Number(d)}일 · ${time} · ${sex}${status}`;
};

const showResult=(result,sex)=>{
  document.body.classList.add('has-result');
  renderPillar('year',result.pillars.year,result.tenGods.visibleStems.year,result.tenGods.visibleBranches.year);
  renderPillar('month',result.pillars.month,result.tenGods.visibleStems.month,result.tenGods.visibleBranches.month);
  renderPillar('day',result.pillars.day,result.tenGods.visibleStems.day,result.tenGods.visibleBranches.day);
  renderPillar('hour',result.pillars.hour,result.tenGods.visibleStems.hour,result.tenGods.visibleBranches.hour);
  renderElements(result);
  renderTenGods(result);
  renderHiddenStems(result);
  renderStructureFacts(result);
  renderReading(result);
  renderFlow(result);
  renderSummary(result,sex);
  preview.hidden=false;
  requestAnimationFrame(()=>preview.classList.add('is-visible'));
  preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
};

form?.addEventListener('submit',event=>{
  event.preventDefault();
  setError('');
  if(!dateInput.value){dateInput.focus();return;}
  const sexValue=form.elements.sex?.value||null;
  const sex=sexValue==='female'?'여성':sexValue==='male'?'남성':'성별 미선택';
  const birthTime=timeUnknown.checked?null:(timeInput.value||null);
  try{
    const result=calculateSaju({birthDate:dateInput.value,birthTime,sex:sexValue});
    if(result.status==='needs-birth-time'){
      setError('이 날짜는 절기 경계가 바뀌는 날이라 정확한 년주·월주 판정을 위해 출생시간이 필요해요.');
      preview.hidden=true;
      return;
    }
    showResult(result,sex);
  }catch(error){
    const message=String(error?.message||error);
    if(message.includes('did not exist')) setError('입력한 시각은 당시 한국의 표준시 전환 때문에 존재하지 않았던 시각이에요. 출생기록을 다시 확인해 주세요.');
    else if(message.includes('ambiguous')) setError('입력한 시각은 당시 표준시 전환으로 두 번 존재했던 시각이에요. 현재 버전에서는 자동 선택하지 않습니다.');
    else if(message.includes('1970..2100')||message.includes('1970~2100')) setError('현재 계산 지원 범위는 1970년부터 2100년까지예요.');
    else setError('계산 중 확인이 필요한 값이 발견됐어요. 입력값을 다시 확인해 주세요.');
    preview.hidden=true;
  }
});
