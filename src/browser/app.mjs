import {calculateSaju,ENGINE_VERSION} from '../engine/calculator.mjs';

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
    hanja.textContent='—';
    detail.textContent=key==='hour'?'출생시간 미상':'계산되지 않음';
    return;
  }
  card.classList.remove('is-empty');
  hanja.textContent=pillar.hanja;
  const stemMeta=`${pillar.stem.korean}${elementNames[pillar.stem.element]} · ${pillar.stem.polarity==='yang'?'양':'음'}`;
  detail.textContent=key==='day'
    ?`나를 나타내는 중심 · ${stemMeta} · 지지 ${branchTenGod}`
    :`${pillar.korean} · 천간 ${stemTenGod} · 지지 ${branchTenGod}`;
};

const renderElements=result=>{
  for(const [element,count] of Object.entries(result.fiveElements.counts)){
    const row=document.querySelector(`[data-element="${element}"]`);
    if(row) row.querySelector('[data-count]').textContent=`${count}개`;
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

const renderSummary=(result,sex)=>{
  const [y,m,d]=result.input.birthDate.split('-');
  const time=result.input.timeKnown?result.input.birthTime:'출생시간 미상';
  const status=result.status==='partial'?' · 시주 제외':'';
  summary.textContent=`${y}년 ${Number(m)}월 ${Number(d)}일 · ${time} · ${sex}${status}`;
};

const showResult=(result,sex)=>{
  renderPillar('year',result.pillars.year,result.tenGods.visibleStems.year,result.tenGods.visibleBranches.year);
  renderPillar('month',result.pillars.month,result.tenGods.visibleStems.month,result.tenGods.visibleBranches.month);
  renderPillar('day',result.pillars.day,result.tenGods.visibleStems.day,result.tenGods.visibleBranches.day);
  renderPillar('hour',result.pillars.hour,result.tenGods.visibleStems.hour,result.tenGods.visibleBranches.hour);
  renderElements(result);
  renderTenGods(result);
  renderHiddenStems(result);
  renderSummary(result,sex);
  preview.hidden=false;
  requestAnimationFrame(()=>preview.classList.add('is-visible'));
  preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
};

form?.addEventListener('submit',event=>{
  event.preventDefault();
  setError('');
  if(!dateInput.value){dateInput.focus();return;}
  const sex=form.elements.sex?.value==='female'?'여성':form.elements.sex?.value==='male'?'남성':'성별 미선택';
  const birthTime=timeUnknown.checked?null:(timeInput.value||null);
  try{
    const result=calculateSaju({birthDate:dateInput.value,birthTime});
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
