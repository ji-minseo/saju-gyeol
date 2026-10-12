import {calculateSaju,ENGINE_VERSION} from '../engine/calculator.mjs';
import {buildReadingV3} from '../content/reading-v3.mjs';
import {buildCurrentFlow} from '../content/flow-v1.mjs';
import {buildReadingGuide} from '../content/guide-v1.mjs';
import {buildDetailGuide,explainCurrentFlow} from '../content/guide-v2.mjs';
import {lunarToSolarDate} from '../engine/lunar-calendar.mjs';

const form=document.querySelector('#birth-form');
const dateInput=document.querySelector('#birth-date');
const solarDateFields=document.querySelector('#solar-date-fields');
const lunarDateFields=document.querySelector('#lunar-date-fields');
const lunarYear=document.querySelector('#lunar-year');
const lunarMonth=document.querySelector('#lunar-month');
const lunarDay=document.querySelector('#lunar-day');
const lunarLeap=document.querySelector('#lunar-leap');
const leapMonthRow=document.querySelector('#leap-month-row');
const calendarInputs=[...document.querySelectorAll('input[name="calendar"]')];
const timeInput=document.querySelector('#birth-time');
const timeUnknown=document.querySelector('#time-unknown');
const dayBoundaryInputs=[...document.querySelectorAll('input[name="dayBoundary"]')];
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
const saveResultImageButton=document.querySelector('#save-result-image');
const shareResultButton=document.querySelector('#share-result');
const resultActionStatus=document.querySelector('#result-action-status');
const saveReadingInput=document.querySelector('#save-reading');
const recentReading=document.querySelector('#recent-reading');
const recentReadingTitle=document.querySelector('#recent-reading-title');
const recentReadingMeta=document.querySelector('#recent-reading-meta');
const restoreRecentReadingButton=document.querySelector('#restore-recent-reading');
const clearRecentReadingButton=document.querySelector('#clear-recent-reading');
const contextReadingGuide=document.querySelector('#context-reading-guide');
const contextGuideKicker=document.querySelector('#context-guide-kicker');
const contextGuideTitle=document.querySelector('#context-guide-title');
const contextGuideBody=document.querySelector('#context-guide-body');
const contextGuidePersonal=document.querySelector('#context-guide-personal');
const contextGuideStep=document.querySelector('#context-guide-step');

let latestShareState=null;
let resultActionStatusTimer=null;
let contextGuideChapters={};
let contextGuideScrollBound=false;
let contextGuideFrame=0;

const tenGodLabels={year:'년간',month:'월간',day:'일간',hour:'시간'};
const elementNames={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};


engineBadge.textContent=`ENGINE · v${ENGINE_VERSION}`;


const selectedCalendar=()=>form.elements.calendar?.value||'solar';
const selectedDayBoundary=()=>form.elements.dayBoundary?.value||'midnight';
const dayBoundaryLabel=value=>value==='zi-start'?'23:00 자시 시작':'00:00 일자 변경';

const syncCalendarFields=()=>{
  const lunar=selectedCalendar()==='lunar';
  solarDateFields.hidden=lunar;
  lunarDateFields.hidden=!lunar;
  leapMonthRow.hidden=!lunar;
  dateInput.required=!lunar;
  lunarYear.required=lunar;
  lunarMonth.required=lunar;
  lunarDay.required=lunar;
};

calendarInputs.forEach(input=>input.addEventListener('change',()=>{
  setError('');
  syncCalendarFields();
}));
syncCalendarFields();


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

const formatAgeMonthsLabel=months=>{
  const years=Math.floor(months/12);
  const rest=months%12;
  return rest?`${years}세 ${rest}개월`:`${years}세`;
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
  for(const timeline of flow.daeunTimeline){
    const item=document.createElement('article');
    item.className='daeun-life-card';
    item.dataset.daeunOrder=String(timeline.order);
    if(timeline.isCurrent){
      item.classList.add('is-current-daeun');
      item.setAttribute('aria-current','true');
    }

    const rail=document.createElement('div');
    rail.className='daeun-life-rail';
    const order=document.createElement('small');
    order.textContent=String(timeline.order).padStart(2,'0');
    const pillar=document.createElement('strong');
    pillar.textContent=timeline.pillar.hanja;
    const korean=document.createElement('span');
    korean.textContent=timeline.pillar.korean;
    rail.append(order,pillar,korean);

    const copy=document.createElement('div');
    copy.className='daeun-life-copy';

    const top=document.createElement('div');
    top.className='daeun-life-top';
    const period=document.createElement('span');
    period.textContent=timeline.period;
    const theme=document.createElement('em');
    theme.textContent=timeline.theme;
    top.append(period,theme);

    const title=document.createElement('h4');
    title.textContent=timeline.title;

    const body=document.createElement('p');
    body.className='daeun-life-body';
    body.textContent=timeline.body;

    const guide=document.createElement('div');
    guide.className='daeun-life-guide';
    const guideLabel=document.createElement('b');
    guideLabel.textContent='이 10년을 쓰는 법';
    const guideText=document.createElement('p');
    guideText.textContent=timeline.guide;
    guide.append(guideLabel,guideText);

    const evidence=document.createElement('div');
    evidence.className='daeun-life-evidence';
    for(const value of timeline.evidence){
      const chip=document.createElement('span');
      chip.textContent=value;
      evidence.append(chip);
    }

    copy.append(top,title,body,guide,evidence);
    item.append(rail,copy);
    daeunTrack.append(item);
  }
};

const storyLead={temperament:'기질적으로 ',relationship:'관계에서는 ',career:'일에서는 ',money:'돈을 다룰 때는 '};
const redundantStoryStart={
  temperament:/^기질/,
  relationship:/^관계/,
  career:/^일(?:\s|은|이|에서|을|과|보다|의)/,
  money:/^돈/
};
const toStoryTitle=(key,title)=>{
  const clean=String(title||'').trim().replace(/[.。]+$/,'');
  if(!clean) return '';
  const lead=redundantStoryStart[key]?.test(clean)?'':(storyLead[key]||'');
  if(/[요죠니다]$/.test(clean)) return `${lead}${clean}`;
  if(/편$/.test(clean)) return `${lead}${clean}이에요.`;
  if(/쉬워요$|좋아요$|살아요$|붙어요$|선명해져요$/.test(clean)) return `${lead}${clean}`;
  return `${lead}${clean}이에요.`;
};

const coreReadingKeys=['temperament','relationship','career','money'];

const renderDeepReading=reading=>{
  const deep=reading.deep;
  if(!deep) return;

  const setText=(selector,value)=>{
    const node=document.querySelector(selector);
    if(node) node.textContent=value||'';
  };

  const setEvidence=(selector,items=[])=>{
    const node=document.querySelector(selector);
    if(!node) return;
    node.replaceChildren();
    for(const item of items){
      const chip=document.createElement('span');
      chip.textContent=item;
      node.append(chip);
    }
  };

  setText('#deep-day-pillar',deep.portrait.evidence.find(x=>x.startsWith('일주 '))?.replace('일주 ','')||'—');
  setText('#deep-portrait-title',deep.portrait.title);
  setText('#deep-portrait-body',deep.portrait.body);
  setText('#deep-portrait-tip',deep.portrait.tip);
  setEvidence('#deep-portrait-evidence',deep.portrait.evidence);

  setText('#deep-strength-title',deep.strengths.title);
  setText('#deep-strength-body',deep.strengths.body);
  setEvidence('#deep-strength-evidence',deep.strengths.evidence);

  setText('#deep-overdrive-title',deep.overdrive.title);
  setText('#deep-overdrive-body',deep.overdrive.body);
  setText('#deep-overdrive-tip',deep.overdrive.tip);
  setEvidence('#deep-overdrive-evidence',deep.overdrive.evidence);

  for(const [key,section] of Object.entries(deep.patterns)){
    const row=document.querySelector(`[data-deep-pattern="${key}"]`);
    if(!row) continue;
    row.querySelector('[data-deep-pattern-title]').textContent=section.title;
    row.querySelector('[data-deep-pattern-body]').textContent=section.body;
    const tip=row.querySelector('[data-deep-pattern-tip]');
    if(tip) tip.textContent=section.tip||'';
    const evidence=row.querySelector('[data-deep-pattern-evidence]');
    if(evidence){
      evidence.replaceChildren();
      for(const item of section.evidence){
        const chip=document.createElement('span');
        chip.textContent=item;
        evidence.append(chip);
      }
    }
  }

  const positions=document.querySelector('#ten-god-position-list');
  if(positions){
    positions.replaceChildren();
    for(const item of deep.tenGodPositions){
      const article=document.createElement('article');
      article.className='ten-god-position-item';
      article.dataset.position=item.key;

      const head=document.createElement('div');
      head.className='ten-god-position-head';

      const mark=document.createElement('span');
      mark.className='ten-god-position-pillar';
      mark.textContent=item.pillar;

      const meta=document.createElement('div');
      const label=document.createElement('small');
      label.textContent=`${item.label} · ${item.theme}`;
      const title=document.createElement('h4');
      title.textContent=item.title;
      meta.append(label,title);
      head.append(mark,meta);

      const body=document.createElement('p');
      body.textContent=item.body;

      const evidence=document.createElement('div');
      evidence.className='deep-evidence';
      for(const value of item.evidence){
        const chip=document.createElement('span');
        chip.textContent=value;
        evidence.append(chip);
      }

      article.append(head,body,evidence);
      positions.append(article);
    }
  }
};

const renderReading=result=>{
  const reading=buildReadingV3(result);

  for(const key of coreReadingKeys){
    const section=reading[key];
    const summaryCard=document.querySelector(`[data-summary="${key}"]`);
    const summaryTitle=summaryCard?.querySelector('[data-summary-title]');
    if(summaryTitle) summaryTitle.textContent=toStoryTitle(key,section.title);
  }

  for(const key of coreReadingKeys){
    const section=reading[key];
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

  renderDeepReading(reading);
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
  const bridge=document.querySelector('#flow-reading-bridge p');
  if(bridge) bridge.textContent=explainCurrentFlow(flow);
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

  [...daeunTrack.children].forEach(item=>{
    const order=Number(item.dataset.daeunOrder);
    const active=daeun.status==='active'&&order===daeun.order;
    item.classList.toggle('is-current-daeun',active);
    if(active) item.setAttribute('aria-current','true');
    else item.removeAttribute('aria-current');
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


const SHARE_CARD={
  width:1080,
  height:1350,
  pad:72,
  url:'saju.everytinytool.com'
};

const shareFonts={
  sans:'"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif',
  serif:'"Noto Serif KR","Nanum Myeongjo","AppleMyungjo",serif'
};

const SHARE_PALETTE={
  paper:'#f7f3ee',
  paperDeep:'#f0ebe5',
  ink:'#302a30',
  muted:'#7c7279',
  faint:'#cfc5cb',
  line:'#d7cfd3',
  plum:'#625062',
  plumDeep:'#4f3e4f',
  rose:'#a36770',
  gold:'#9b7c4f',
  white:'#fffdfb'
};

const elementShareColors={
  wood:'#728d75',
  fire:'#b77767',
  earth:'#aa8d64',
  metal:'#818794',
  water:'#667d91'
};

const shareCategoryLabels={
  temperament:{ko:'성향',hanja:'性'},
  relationship:{ko:'관계',hanja:'緣'},
  career:{ko:'일',hanja:'業'},
  money:{ko:'돈',hanja:'財'}
};

const shareElementLabels={
  wood:'목',
  fire:'화',
  earth:'토',
  metal:'금',
  water:'수'
};

const roundRectPath=(ctx,x,y,width,height,radius)=>{
  const r=Math.min(radius,width/2,height/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+width,y,x+width,y+height,r);
  ctx.arcTo(x+width,y+height,x,y+height,r);
  ctx.arcTo(x,y+height,x,y,r);
  ctx.arcTo(x,y,x+width,y,r);
  ctx.closePath();
};

const wrapCanvasText=(ctx,text,maxWidth,maxLines=2)=>{
  const chars=[...String(text||'')];
  const lines=[];
  let line='';
  for(const char of chars){
    const next=line+char;
    if(line&&ctx.measureText(next).width>maxWidth){
      lines.push(line.trim());
      line=char===' '?'':char;
      if(lines.length===maxLines) break;
    }else{
      line=next;
    }
  }
  if(lines.length<maxLines&&line.trim()) lines.push(line.trim());
  if(lines.length===maxLines){
    const rendered=lines.join('');
    const original=chars.join('').replaceAll(' ','');
    if(rendered.replaceAll(' ','').length<original.length){
      let last=lines[maxLines-1];
      while(last&&ctx.measureText(last+'…').width>maxWidth) last=last.slice(0,-1);
      lines[maxLines-1]=last.replace(/[ ,·]+$/,'')+'…';
    }
  }
  return lines;
};

const drawCanvasLines=(ctx,lines,x,y,lineHeight)=>{
  lines.forEach((line,index)=>ctx.fillText(line,x,y+index*lineHeight));
  return y+Math.max(0,lines.length-1)*lineHeight;
};

const drawHairline=(ctx,x1,y1,x2,y2,color=SHARE_PALETTE.line,width=1)=>{
  ctx.save();
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.restore();
};

const drawSectionKicker=(ctx,{index,title,y,pad,width})=>{
  ctx.save();
  ctx.fillStyle=SHARE_PALETTE.gold;
  ctx.font=`800 15px ${shareFonts.sans}`;
  ctx.fillText(String(index).padStart(2,'0'),pad,y);
  ctx.fillStyle=SHARE_PALETTE.ink;
  ctx.font=`800 17px ${shareFonts.sans}`;
  ctx.fillText(title,pad+40,y);
  drawHairline(ctx,pad+190,y-6,width-pad,y-6,'#d9d0d4',1);
  ctx.restore();
};

const buildShareCanvas=async result=>{
  if(document.fonts?.ready) await document.fonts.ready;
  const reading=buildReadingV3(result);
  const canvas=document.createElement('canvas');
  canvas.width=SHARE_CARD.width;
  canvas.height=SHARE_CARD.height;
  const ctx=canvas.getContext('2d');
  const {width,height,pad}=SHARE_CARD;

  ctx.fillStyle=SHARE_PALETTE.paper;
  ctx.fillRect(0,0,width,height);

  // Quiet paper grain — deterministic, no image dependency.
  ctx.save();
  ctx.globalAlpha=.16;
  ctx.strokeStyle='#ffffff';
  ctx.lineWidth=1;
  for(let y=9;y<height;y+=17) drawHairline(ctx,0,y,width,y,'#ffffff',1);
  ctx.restore();

  // Large editorial watermark.
  ctx.save();
  ctx.globalAlpha=.045;
  ctx.fillStyle=SHARE_PALETTE.plum;
  ctx.font=`700 184px ${shareFonts.serif}`;
  ctx.textAlign='right';
  ctx.fillText('結',width-pad+10,154);
  ctx.restore();
  ctx.textAlign='left';

  // Masthead.
  ctx.fillStyle=SHARE_PALETTE.plum;
  ctx.font=`700 64px ${shareFonts.serif}`;
  ctx.fillText('사주결',pad,104);

  ctx.fillStyle=SHARE_PALETTE.gold;
  ctx.font=`800 15px ${shareFonts.sans}`;
  ctx.fillText('SAJU GYEOL  ·  PERSONAL READING',pad,147);

  ctx.fillStyle=SHARE_PALETTE.muted;
  ctx.font=`600 20px ${shareFonts.sans}`;
  ctx.fillText('나를 만나는 사주, 사주결',pad,184);

  drawHairline(ctx,pad,218,width-pad,218,'#cfc5cb',1.5);
  ctx.fillStyle=SHARE_PALETTE.gold;
  ctx.fillRect(pad,214,58,5);

  // 01. Four pillars — one continuous 명식 plate instead of four floating cards.
  drawSectionKicker(ctx,{index:1,title:'命式  ·  FOUR PILLARS',y:255,pad,width});

  const pillarKeys=['year','month','day','hour'];
  const pillarLabels=['년주','월주','일주','시주'];
  const plateY=284;
  const plateH=202;
  const plateW=width-pad*2;
  const colW=plateW/4;

  roundRectPath(ctx,pad,plateY,plateW,plateH,24);
  ctx.fillStyle='rgba(255,253,251,.72)';
  ctx.fill();
  ctx.strokeStyle='#cfc4cb';
  ctx.lineWidth=1.5;
  ctx.stroke();

  pillarKeys.forEach((key,index)=>{
    const x=pad+index*colW;
    const isDay=key==='day';

    if(index>0) drawHairline(ctx,x,plateY+20,x,plateY+plateH-20,'#ddd4d9',1);

    if(isDay){
      ctx.save();
      roundRectPath(ctx,x+8,plateY+8,colW-16,plateH-16,18);
      ctx.fillStyle=SHARE_PALETTE.plum;
      ctx.fill();
      ctx.restore();

      roundRectPath(ctx,x+colW/2-29,plateY-11,58,24,12);
      ctx.fillStyle=SHARE_PALETTE.gold;
      ctx.fill();
      ctx.fillStyle=SHARE_PALETTE.white;
      ctx.font=`800 11px ${shareFonts.sans}`;
      ctx.textAlign='center';
      ctx.fillText('日 主',x+colW/2,plateY+5);
    }

    ctx.textAlign='center';
    ctx.fillStyle=isDay?'rgba(255,255,255,.70)':SHARE_PALETTE.muted;
    ctx.font=`800 15px ${shareFonts.sans}`;
    ctx.fillText(pillarLabels[index],x+colW/2,plateY+43);

    ctx.fillStyle=isDay?'#fff':SHARE_PALETTE.ink;
    ctx.font=`700 62px ${shareFonts.serif}`;
    ctx.fillText(result.pillars[key]?.hanja||'—',x+colW/2,plateY+120);

    const stemGod=result.tenGods.visibleStems[key];
    const branchGod=result.tenGods.visibleBranches[key];
    ctx.fillStyle=isDay?'rgba(255,255,255,.72)':SHARE_PALETTE.muted;
    ctx.font=`650 14px ${shareFonts.sans}`;
    ctx.fillText(
      key==='day'?'나의 중심':(stemGod&&branchGod?`${stemGod} · ${branchGod}`:'출생시간 미상'),
      x+colW/2,
      plateY+163
    );
  });
  ctx.textAlign='left';

  // 02. Key reading — editorial 2×2 spread with dividers, not boxed cards.
  drawSectionKicker(ctx,{index:2,title:'KEY READING',y:540,pad,width});

  const readingY=575;
  const readingH=352;
  const readingW=width-pad*2;
  const readingColW=readingW/2;
  const readingRowH=readingH/2;

  roundRectPath(ctx,pad,readingY,readingW,readingH,24);
  ctx.fillStyle='rgba(255,253,251,.58)';
  ctx.fill();

  drawHairline(ctx,pad+readingColW,readingY+24,pad+readingColW,readingY+readingH-24,'#ded5da',1);
  drawHairline(ctx,pad+24,readingY+readingRowH,pad+readingW-24,readingY+readingRowH,'#ded5da',1);

  Object.entries(reading).forEach(([key,section],index)=>{
    const col=index%2;
    const row=Math.floor(index/2);
    const x=pad+col*readingColW;
    const y=readingY+row*readingRowH;
    const meta=shareCategoryLabels[key]||{ko:key,hanja:''};

    ctx.save();
    ctx.globalAlpha=.08;
    ctx.fillStyle=SHARE_PALETTE.plum;
    ctx.font=`700 76px ${shareFonts.serif}`;
    ctx.fillText(meta.hanja,x+26,y+78);
    ctx.restore();

    ctx.fillStyle=SHARE_PALETTE.rose;
    ctx.font=`800 16px ${shareFonts.sans}`;
    ctx.fillText(meta.ko,x+28,y+38);

    ctx.fillStyle=SHARE_PALETTE.ink;
    ctx.font=`750 24px ${shareFonts.sans}`;
    const lines=wrapCanvasText(ctx,section.title,readingColW-64,3);
    drawCanvasLines(ctx,lines,x+28,y+82,34);
  });

  // 03. Five elements — clean inset with normalized bars for easier comparison.
  drawSectionKicker(ctx,{index:3,title:'FIVE ELEMENTS',y:981,pad,width});

  const counts=result.fiveElements.counts;
  const keys=['wood','fire','earth','metal','water'];
  const maxCount=Math.max(1,...keys.map(key=>Number(counts[key]||0)));
  const elementPanelY=1011;
  const elementPanelH=228;

  roundRectPath(ctx,pad,elementPanelY,width-pad*2,elementPanelH,22);
  ctx.fillStyle=SHARE_PALETTE.paperDeep;
  ctx.fill();

  const labelX=pad+28;
  const barX=pad+92;
  const barW=width-pad*2-154;

  keys.forEach((key,index)=>{
    const y=elementPanelY+35+index*38;
    const value=Number(counts[key]||0);

    ctx.fillStyle=SHARE_PALETTE.ink;
    ctx.font=`800 16px ${shareFonts.sans}`;
    ctx.fillText(shareElementLabels[key],labelX,y+5);

    roundRectPath(ctx,barX,y-8,barW,12,6);
    ctx.fillStyle='#ddd7da';
    ctx.fill();

    if(value>0){
      roundRectPath(ctx,barX,y-8,Math.max(14,barW*(value/maxCount)),12,6);
      ctx.fillStyle=elementShareColors[key];
      ctx.fill();
    }

    ctx.textAlign='right';
    ctx.fillStyle=SHARE_PALETTE.muted;
    ctx.font=`800 15px ${shareFonts.sans}`;
    ctx.fillText(String(value),width-pad-24,y+5);
    ctx.textAlign='left';
  });

  // Footer.
  drawHairline(ctx,pad,1272,width-pad,1272,'#cfc5cb',1.5);

  ctx.fillStyle=SHARE_PALETTE.plum;
  ctx.font=`800 18px ${shareFonts.sans}`;
  ctx.fillText(SHARE_CARD.url,pad,1311);

  ctx.fillStyle=SHARE_PALETTE.muted;
  ctx.font=`650 14px ${shareFonts.sans}`;
  ctx.textAlign='right';
  ctx.fillText(
    `절기 기준 · 한국 표준시 · ${dayBoundaryLabel(result.metadata?.dayBoundary)}`,
    width-pad,
    1311
  );
  ctx.textAlign='left';

  return canvas;
};

const canvasToPngBlob=canvas=>new Promise((resolve,reject)=>{
  canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('image export failed')),'image/png');
});

const setResultActionStatus=(message,{error=false}={})=>{
  if(!resultActionStatus) return;
  clearTimeout(resultActionStatusTimer);
  resultActionStatus.textContent=message;
  resultActionStatus.dataset.state=error?'error':'ok';
  resultActionStatusTimer=setTimeout(()=>{
    resultActionStatus.textContent='';
    delete resultActionStatus.dataset.state;
  },3200);
};

const shareSummaryText=result=>{
  const reading=buildReadingV3(result);
  return `사주결 · ${reading.temperament.title}\n${reading.career.title}\nhttps://saju.everytinytool.com/`;
};

const saveLatestResultImage=async()=>{
  if(!latestShareState) return;
  saveResultImageButton?.setAttribute('aria-busy','true');
  try{
    const canvas=await buildShareCanvas(latestShareState.result);
    const blob=await canvasToPngBlob(canvas);
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download='saju-gyeol-result.png';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setResultActionStatus('공유용 결과 이미지를 저장했어요.');
  }catch(error){
    console.error(error);
    setResultActionStatus('이미지 저장 중 문제가 생겼어요.',{error:true});
  }finally{
    saveResultImageButton?.removeAttribute('aria-busy');
  }
};

const shareLatestResult=async()=>{
  if(!latestShareState) return;
  shareResultButton?.setAttribute('aria-busy','true');
  try{
    const canvas=await buildShareCanvas(latestShareState.result);
    const blob=await canvasToPngBlob(canvas);
    const file=new File([blob],'saju-gyeol-result.png',{type:'image/png'});
    const url='https://saju.everytinytool.com/';
    const text=shareSummaryText(latestShareState.result);

    if(navigator.share&&navigator.canShare?.({files:[file]})){
      await navigator.share({
        title:'사주결 · 나의 사주 리포트',
        text:'사주결에서 확인한 나의 사주 리포트',
        url,
        files:[file]
      });
      setResultActionStatus('공유 창을 열었어요.');
      return;
    }

    if(navigator.share){
      await navigator.share({
        title:'사주결 · 나의 사주 리포트',
        text,
        url
      });
      setResultActionStatus('공유 창을 열었어요.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setResultActionStatus('핵심 결과와 링크를 복사했어요.');
  }catch(error){
    if(error?.name!=='AbortError'){
      console.error(error);
      try{
        await navigator.clipboard.writeText(shareSummaryText(latestShareState.result));
        setResultActionStatus('공유 대신 핵심 결과와 링크를 복사했어요.');
      }catch{
        setResultActionStatus('공유 기능을 사용할 수 없는 브라우저예요.',{error:true});
      }
    }
  }finally{
    shareResultButton?.removeAttribute('aria-busy');
  }
};

saveResultImageButton?.addEventListener('click',saveLatestResultImage);
shareResultButton?.addEventListener('click',shareLatestResult);

const RECENT_READING_KEY='saju-gyeol:recent-reading:v1';

const safeReadRecentReading=()=>{
  try{
    const raw=localStorage.getItem(RECENT_READING_KEY);
    if(!raw) return null;
    const saved=JSON.parse(raw);
    if(saved?.version!==1||!saved.birthDate) return null;
    return saved;
  }catch{
    return null;
  }
};

const formatSavedAt=value=>{
  const date=new Date(value);
  if(Number.isNaN(date.getTime())) return '이 브라우저에 저장됨';
  return `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} 저장`;
};

const refreshRecentReading=()=>{
  if(!recentReading) return;
  const saved=safeReadRecentReading();
  if(!saved){
    recentReading.hidden=true;
    return;
  }
  recentReading.hidden=false;
  if(recentReadingTitle){
    recentReadingTitle.textContent=saved.dayPillar
      ?`최근에 본 ${saved.dayPillar} 일주를 이어볼까요?`
      :'최근에 본 사주를 이어볼까요?';
  }
  if(recentReadingMeta){
    recentReadingMeta.textContent=`${formatSavedAt(saved.savedAt)} · 이 브라우저에만 보관 중`;
  }
};

const persistRecentReading=({calendar,birthDate,birthTime,sexValue,dayBoundary,calendarMeta,result})=>{
  if(!saveReadingInput?.checked) return;
  const lunar=calendar==='lunar'?{
    year:Number(lunarYear.value),
    month:Number(lunarMonth.value),
    day:Number(lunarDay.value),
    isLeapMonth:Boolean(lunarLeap.checked)
  }:null;
  const payload={
    version:1,
    savedAt:new Date().toISOString(),
    calendar,
    birthDate,
    birthTime,
    sex:sexValue,
    dayBoundary,
    calendarMeta,
    lunar,
    dayPillar:result.pillars.day?.hanja??null
  };
  try{
    localStorage.setItem(RECENT_READING_KEY,JSON.stringify(payload));
    refreshRecentReading();
  }catch{
    // Storage may be disabled by the browser; calculation itself should still succeed.
  }
};

const restoreRecentReading=()=>{
  const saved=safeReadRecentReading();
  if(!saved) return;

  const calendar=saved.calendar==='lunar'&&saved.lunar?'lunar':'solar';
  const calendarInput=form.elements.calendar;
  if(calendarInput) calendarInput.value=calendar;

  if(calendar==='lunar'){
    lunarYear.value=String(saved.lunar.year??'');
    lunarMonth.value=String(saved.lunar.month??'');
    lunarDay.value=String(saved.lunar.day??'');
    lunarLeap.checked=Boolean(saved.lunar.isLeapMonth);
    dateInput.value='';
  }else{
    dateInput.value=saved.birthDate;
  }
  syncCalendarFields();

  timeUnknown.checked=!saved.birthTime;
  timeInput.disabled=!saved.birthTime;
  timeInput.value=saved.birthTime||'';

  if(saved.sex&&form.elements.sex) form.elements.sex.value=saved.sex;
  if(form.elements.dayBoundary) form.elements.dayBoundary.value=saved.dayBoundary||'midnight';
  if(saveReadingInput) saveReadingInput.checked=true;

  try{
    const result=calculateSaju(
      {birthDate:saved.birthDate,birthTime:saved.birthTime||null,sex:saved.sex||null},
      {dayBoundary:saved.dayBoundary||'midnight'}
    );
    if(result.status==='needs-birth-time'){
      setError('저장된 날짜가 절기 경계일이라 정확한 결과를 다시 보려면 출생시간이 필요해요.');
      return;
    }
    const sex=saved.sex==='female'?'여성':saved.sex==='male'?'남성':'성별 미선택';
    showResult(result,sex,saved.calendarMeta||null);
  }catch{
    setError('저장된 결과를 다시 불러오지 못했어요. 새로 입력해 주세요.');
  }
};

restoreRecentReadingButton?.addEventListener('click',restoreRecentReading);
clearRecentReadingButton?.addEventListener('click',()=>{
  try{localStorage.removeItem(RECENT_READING_KEY);}catch{}
  if(saveReadingInput) saveReadingInput.checked=false;
  refreshRecentReading();
});
refreshRecentReading();


const CONTEXT_GUIDE_ORDER=['pillars','summary','day','structure','climate','elements','tengods','relations','stars','flow','appendix'];

const activateContextGuide=key=>{
  const chapter=contextGuideChapters[key]||contextGuideChapters.pillars;
  if(!chapter||!contextReadingGuide) return;
  if(contextReadingGuide.dataset.activeKey===key) return;
  contextReadingGuide.dataset.activeKey=key;
  if(contextGuideKicker) contextGuideKicker.textContent=chapter.kicker;
  if(contextGuideTitle) contextGuideTitle.textContent=chapter.title;
  if(contextGuideBody) contextGuideBody.textContent=chapter.body;
  if(contextGuidePersonal){
    contextGuidePersonal.textContent=chapter.personal||'';
    contextGuidePersonal.hidden=!chapter.personal;
  }
  if(contextGuideStep){
    const index=Math.max(0,CONTEXT_GUIDE_ORDER.indexOf(key));
    contextGuideStep.textContent=String(index+1).padStart(2,'0')+' / '+String(CONTEXT_GUIDE_ORDER.length).padStart(2,'0');
  }
};

const syncContextGuideToScroll=()=>{
  if(!contextReadingGuide||preview.hidden) return;
  const chapters=[...preview.querySelectorAll('[data-guide-key]')];
  if(!chapters.length) return;
  const anchor=Math.min(220,Math.max(110,window.innerHeight*.24));
  let active=chapters[0];
  for(const chapter of chapters){
    if(chapter.getBoundingClientRect().top<=anchor) active=chapter;
    else break;
  }
  activateContextGuide(active.dataset.guideKey);
};

const scheduleContextGuideSync=()=>{
  if(contextGuideFrame) return;
  contextGuideFrame=requestAnimationFrame(()=>{
    contextGuideFrame=0;
    syncContextGuideToScroll();
  });
};

const bindContextGuideScroll=()=>{
  if(contextGuideScrollBound) return;
  contextGuideScrollBound=true;
  window.addEventListener('scroll',scheduleContextGuideSync,{passive:true});
  window.addEventListener('resize',scheduleContextGuideSync,{passive:true});
};

const renderReadingGuide=result=>{
  const guide=buildReadingGuide(result);
  const structure=result.structuralAnalysis;
  const useful=structure?.usefulGod?.primary
    ?structure.usefulGod.primary.label+'('+structure.usefulGod.primary.roleLabel+')'
    :'단일 후보 보류';

  const setInline=(selector,value)=>{
    const node=document.querySelector(selector);
    if(node) node.textContent=value||'';
  };
  setInline('#chapter-day-personal',guide.dayPillar);
  setInline('#chapter-elements-personal',guide.elements);
  setInline('#chapter-ten-gods-personal',guide.tenGods);

  contextGuideChapters={
    pillars:{
      kicker:'命式 · 네 기둥',
      title:'지금은 태어난 순간의 네 기둥을 보고 있어요.',
      body:'사주는 태어난 순간을 네 칸으로 나눠 봐요. 각 칸은 위 글자와 아래 글자로 이루어져 있고, 그중 태어난 날의 두 글자를 나를 읽는 중심으로 삼습니다.',
      personal:guide.dayPillar
    },
    summary:{
      kicker:'AT A GLANCE · 먼저 보는 핵심',
      title:'긴 풀이에 들어가기 전에 네 가지 핵심만 먼저 압축해 봐요.',
      body:'성향·관계·일·돈을 한 줄씩 먼저 보고, 아래에서는 각각 어떤 명식 데이터에서 나온 해석인지 같은 챕터 안에서 확인할 수 있어요.',
      personal:'아래부터는 데이터와 해석을 따로 떼지 않고 바로 이어서 보여줘요.'
    },
    day:{
      kicker:'日柱 · DAY PILLAR',
      title:'태어난 날의 두 글자와 나의 중심 성향을 같이 보고 있어요.',
      body:'태어난 날의 위 글자는 사주에서 ‘나’를 뜻하는 기준이에요. 이걸 일간이라고 부르고, 아래 글자는 가까운 생활과 관계의 바탕을 보는 자리라서 일지라고 불러요.',
      personal:guide.dayPillar
    },
    structure:{
      kicker:'STRUCTURE · 힘과 균형',
      title:'여기서는 “내 힘”, “태어난 달의 중심 역할”, “균형을 돕는 오행”을 차례로 봐요.',
      body:'먼저 나를 뜻하는 글자가 주변에서 도움을 많이 받는지 봐요. 다음으로 태어난 달의 계절 기운에서 어떤 역할이 중심인지 이름을 붙이고, 마지막으로 치우침을 완화하는 데 도움이 될 오행 후보를 봅니다. 명리에서는 각각 신강·신약, 격국, 용신이라고 불러요.',
      personal:structure
        ?'현재 결과 · '+structure.strength.label+' · '+structure.pattern.label+' · 균형 후보 '+useful
        :'계산 후 현재 구조를 쉬운 말로 보여드려요.'
    },
    climate:{
      kicker:'調候 · 계절의 균형',
      title:'여기서는 “내 힘”이 아니라 “태어난 계절에서 무엇을 먼저 보나”를 봐요.',
      body:'같은 글자라도 초봄·한여름·한겨울처럼 태어난 계절이 다르면 필요한 환경을 다르게 봅니다. 이 계절 균형 관점을 조후라고 해요.',
      personal:result.climateBalance
        ?result.climateBalance.month.season+' · 1순위 참고 '+result.climateBalance.primary.label
        :'계산 후 계절 기준 후보를 보여드려요.'
    },
    elements:{
      kicker:'五行 · FIVE ELEMENTS',
      title:'오행 숫자 바로 옆에서 이 분포를 어떻게 읽는지 확인해요.',
      body:'목·화·토·금·수는 다섯 가지 기본 성질의 표면 분포예요. 많고 적음 자체를 길흉으로 보지 않고, 어떤 성질이 눈에 많이 보이고 덜 보이는지를 다른 구조와 함께 봅니다.',
      personal:guide.elements
    },
    tengods:{
      kicker:'十星 · TEN GODS',
      title:'십성 구성과 실제 일·돈의 해석을 같은 자리에서 보고 있어요.',
      body:'사주에서 ‘나’를 뜻하는 글자와 다른 글자들이 어떤 관계인지 이름을 붙인 것이 십성이에요. 그 관계가 어느 자리에 놓였는지까지 보고 실제 일·돈의 방식으로 연결합니다.',
      personal:guide.tenGods
    },
    relations:{
      kicker:'地支關係 · BRANCH RELATIONS',
      title:'합·충·형·파·해 데이터 바로 아래에서 관계 패턴을 이어서 읽어요.',
      body:'관계 이름만으로 좋고 나쁨을 정하지 않고, 어느 자리 사이에 연결이나 긴장이 있는지 확인한 다음 가까운 관계에서 반복되기 쉬운 방식으로 해석합니다.',
      personal:'지지 관계가 없더라도 관계성이 없다는 뜻은 아니고, 해당 규칙의 강한 연결 표시가 없다는 뜻이에요.'
    },
    stars:{
      kicker:'神煞 · 貴人 · 보조 상징',
      title:'여기는 공통 24종과 12신살 전체를 한 번에 확인하는 곳이에요.',
      body:'신살은 종류마다 계산 기준이 달라요. 사주결은 정한 24종을 빠짐없이 보여주고, 12신살은 연지·일지를 기준으로 열두 단계를 모두 배정해 따로 보여줍니다.',
      personal:result.symbolicStars?.present?.length
        ?'현재 공통 24종 가운데 '+result.symbolicStars.present.length+'종이 명식에 직접 걸려 있어요.'
        :'현재 공통 24종 기준에서 네 기둥에 직접 걸리는 표시는 없어요.'
    },
    flow:{
      kicker:'原局 × 大運 × 歲運',
      title:'대운 배열과 지금의 대운·세운 해석을 한 챕터에서 겹쳐 봐요.',
      body:'태어날 때 정해진 기본 사주 위에 시간이 흐르면서 10년 단위의 큰 변화와 해마다의 변화가 겹쳐져요. 이걸 각각 대운, 세운이라고 부르고 어떤 주제가 더 앞에 오는지 비교합니다.',
      personal:'아래 대운 배열에서 “지금” 위치와 현재 흐름 해석을 함께 확인할 수 있어요.'
    },
    appendix:{
      kicker:'APPENDIX · 보조 데이터',
      title:'마지막은 핵심 결론보다 한 단계 더 깊게 볼 때 참고하는 표예요.',
      body:'십이운성과 공망은 하나만 떼어 길흉으로 읽지 않고, 앞에서 본 일주·십성·지지 관계·대운과 함께 참고합니다.',
      personal:'처음 보는 경우라면 여기까지 모두 외울 필요는 없어요.'
    }
  };

  bindContextGuideScroll();
  activateContextGuide('pillars');
};

const renderClimateBalance=result=>{
  const data=result.climateBalance;
  if(!data) return;

  const setText=(selector,value)=>{
    const node=document.querySelector(selector);
    if(node) node.textContent=value||'';
  };

  setText('#climate-season-copy',
    data.month.season+' · '+data.month.plain+'. 태어난 달의 아래 글자는 '+data.month.branch+'('+data.month.korean+')예요.'
  );
  setText('#climate-primary-stem',data.primary.hanja);
  setText('#climate-primary-label',data.primary.korean+data.primary.elementKo+' · '+data.primary.elementKo+' 기운');
  setText('#climate-explanation',data.explanation);
  setText('#climate-primary-presence',data.presenceSummary);
  setText('#climate-caveat',data.caveat);
  setText('#climate-comparison-copy',data.balancingComparison.text);

  const balancing=result.structuralAnalysis?.usefulGod?.primary;
  setText('#climate-balance-useful',balancing?balancing.label+' · 힘의 균형 후보':'단일 후보 보류');
  setText('#climate-season-useful',data.primary.elementKo+' · 계절 기준 1순위');

  const list=document.querySelector('#climate-candidate-list');
  if(list){
    list.replaceChildren();
    for(const candidate of data.candidates){
      const item=document.createElement('article');
      item.className='climate-candidate '+(candidate.priority===1?'is-primary':'');
      item.dataset.presence=candidate.presence.state;

      const order=document.createElement('span');
      order.textContent=String(candidate.priority).padStart(2,'0');

      const mark=document.createElement('strong');
      mark.textContent=candidate.hanja;

      const copy=document.createElement('div');
      const title=document.createElement('b');
      title.textContent=candidate.korean+candidate.elementKo+' · '+candidate.elementKo;
      const state=document.createElement('p');
      state.textContent=candidate.presence.text;
      copy.append(title,state);

      item.append(order,mark,copy);
      list.append(item);
    }
  }

  const chapter=document.querySelector('#chapter-climate');
  if(chapter){
    chapter.dataset.sameDirection=String(Boolean(data.balancingComparison.sameElement));
  }
};

const renderSymbolicStars=result=>{
  const container=document.querySelector('#symbolic-stars-list');
  const summary=document.querySelector('#symbolic-stars-summary');
  const catalog=document.querySelector('#twelve-star-catalog');
  const anchors=document.querySelector('#twelve-star-anchors');
  const footnote=document.querySelector('#symbolic-star-footnote');
  const data=result.symbolicStars;
  if(!container||!data) return;

  if(summary){
    summary.replaceChildren();
    const count=document.createElement('strong');
    count.textContent='공통 24종 중 '+data.present.length+'종 해당';
    const note=document.createElement('span');
    note.textContent='해당 없음도 포함해 24종 전체를 아래에 표시합니다.';
    summary.append(count,note);
  }

  container.replaceChildren();
  const groups=['귀인·길신','신살·보조'];
  for(const groupName of groups){
    const stars=data.stars.filter(star=>star.group===groupName);
    const section=document.createElement('section');
    section.className='symbolic-star-group';

    const groupHead=document.createElement('div');
    groupHead.className='symbolic-star-group-head';
    const groupTitle=document.createElement('h3');
    groupTitle.textContent=groupName;
    const groupCount=document.createElement('span');
    groupCount.textContent=stars.length+'종 · 해당 '+stars.filter(x=>x.present===true).length+'종';
    groupHead.append(groupTitle,groupCount);

    const grid=document.createElement('div');
    grid.className='symbolic-star-grid';

    for(const star of stars){
      const card=document.createElement('details');
      card.className='symbolic-star-card '+(star.present===true?'is-present':star.mode==='cycle'?'is-cycle':'is-absent');
      if(star.present===true) card.open=true;

      const head=document.createElement('summary');
      head.className='symbolic-star-head';

      const mark=document.createElement('span');
      mark.className='symbolic-star-mark';
      mark.textContent=star.hanja;

      const titleBox=document.createElement('div');
      const label=document.createElement('small');
      label.textContent=star.key;
      const title=document.createElement('h4');
      title.textContent=star.plain;
      titleBox.append(label,title);

      const status=document.createElement('b');
      status.className='symbolic-star-status';
      status.textContent=star.mode==='cycle'?'주기':star.present?'있음':'해당 없음';

      head.append(mark,titleBox,status);

      const detail=document.createElement('div');
      detail.className='symbolic-star-detail';

      const meaning=document.createElement('p');
      meaning.className='symbolic-star-meaning';
      meaning.textContent=star.meaning;

      const hits=document.createElement('div');
      hits.className='symbolic-star-hits';

      if(star.mode==='cycle'){
        const row=document.createElement('div');
        const where=document.createElement('strong');
        where.textContent='주기 정보';
        const source=document.createElement('span');
        source.textContent=star.statusText;
        row.append(where,source);
        hits.append(row);
      }else if(star.present){
        for(const hit of star.hits){
          const row=document.createElement('div');
          const where=document.createElement('strong');
          where.textContent=hit.subtype
            ?hit.subtype+' · '+hit.label+' '+hit.hanja
            :hit.label+' '+hit.hanja;
          const source=document.createElement('span');
          source.textContent=hit.source||hit.sources?.join(' · ')||'이 자리에서 기준이 성립합니다.';
          row.append(where,source);
          hits.append(row);
        }
      }else{
        const empty=document.createElement('p');
        empty.textContent='현재 보이는 네 기둥에는 이 기준에 맞는 글자나 조합이 없어요.';
        hits.append(empty);
      }

      const basis=document.createElement('div');
      basis.className='symbolic-star-basis';
      const basisLabel=document.createElement('b');
      basisLabel.textContent='어떻게 찾았나요?';
      const basisText=document.createElement('p');
      basisText.textContent=star.basis;
      basis.append(basisLabel,basisText);

      detail.append(meaning,hits,basis);

      if(star.extra?.schoolVariant){
        const variance=document.createElement('p');
        variance.className='symbolic-star-variance';
        variance.textContent='학파 차이 · '+star.extra.schoolVariant;
        detail.append(variance);
      }

      card.append(head,detail);
      grid.append(card);
    }

    section.append(groupHead,grid);
    container.append(section);
  }

  if(catalog){
    catalog.replaceChildren();
    const names=data.twelveCatalog||[];
    for(const name of names){
      const chip=document.createElement('span');
      chip.textContent=name;
      catalog.append(chip);
    }
  }

  if(anchors){
    anchors.replaceChildren();
    for(const anchor of data.twelveStars||[]){
      const panel=document.createElement('article');
      panel.className='twelve-star-anchor';

      const heading=document.createElement('div');
      heading.className='twelve-star-anchor-head';
      const title=document.createElement('h4');
      title.textContent=anchor.anchorLabel+' '+anchor.anchorBranch+' 기준';
      const group=document.createElement('span');
      group.textContent='삼합 '+anchor.group;
      heading.append(title,group);

      const rows=document.createElement('div');
      rows.className='twelve-star-rows';
      for(const row of anchor.rows){
        const item=document.createElement('div');
        const position=document.createElement('span');
        position.textContent=row.positionLabel+' '+row.branch;
        const label=document.createElement('strong');
        label.textContent=row.label;
        item.append(position,label);
        rows.append(item);
      }

      panel.append(heading,rows);
      anchors.append(panel);
    }
  }

  if(footnote){
    footnote.textContent=data.explanation+(data.missingHour?' 태어난 시간을 몰라 시지에 걸리는 신살과 12신살 배정은 확인하지 않았어요.':'');
  }
};

const renderStructuralAnalysis=result=>{
  const analysis=result.structuralAnalysis;
  if(!analysis) return;
  const {strength,pattern,usefulGod}=analysis;

  const setText=(selector,value)=>{
    const node=document.querySelector(selector);
    if(node) node.textContent=value||'';
  };
  const fillChips=(selector,items=[])=>{
    const node=document.querySelector(selector);
    if(!node) return;
    node.replaceChildren();
    for(const item of items){
      const chip=document.createElement('span');
      chip.textContent=item;
      node.append(chip);
    }
  };

  setText('#structure-strength-label',strength.label);
  setText('#structure-strength-copy',strength.explanation);
  setText('#structure-season-detail',strength.season.text);
  setText('#structure-root-detail',strength.detail.roots);
  setText('#structure-support-detail',strength.detail.visibleSupport);
  setText('#structure-pressure-detail',strength.detail.visiblePressure);
  fillChips('#structure-strength-evidence',strength.evidence);

  const marker=document.querySelector('#strength-marker');
  if(marker){
    const pct=Math.max(4,Math.min(96,50+(strength.score/8)*46));
    marker.style.left=pct+'%';
    marker.dataset.grade=strength.grade;
    marker.title=strength.label+' · 상대 점수 '+strength.score;
  }

  setText('#structure-pattern-label',pattern.label);
  setText('#structure-pattern-copy',pattern.explanation);
  const patternMeta=[
    '태어난 달 아래 글자 '+pattern.monthBranch,
    '그 안의 대표 기운 '+pattern.monthMainStem+' · '+pattern.monthMainTenGod,
    pattern.exposedLabels.length?'같은 대표 기운이 위 글자에도 보임 · '+pattern.exposedLabels.join('·'):'같은 대표 기운이 위 글자에는 직접 보이지 않음'
  ];
  fillChips('#structure-pattern-meta',patternMeta);
  setText('#structure-pattern-caveat',pattern.caveat);

  setText('#structure-useful-label',usefulGod.primary
    ?usefulGod.primary.label+' · 용신 후보'
    :'단일 용신 보류');
  setText('#structure-useful-copy',usefulGod.explanation);
  const supportive=usefulGod.primary
    ?['1순위 '+usefulGod.primary.label,...usefulGod.supportive.map((x,i)=>(i+2)+'순위 '+x.label)]
    :['중화권 · 억부 단일 후보 없음'];
  fillChips('#structure-supportive-labels',supportive);
  setText('#structure-useful-caveat',usefulGod.caveat);
};

const renderDetailGuide=result=>{
  const detail=buildDetailGuide(result);
  const setText=(selector,value)=>{
    const node=document.querySelector(selector);
    if(node) node.textContent=value||'';
  };

  setText('#hidden-stem-explainer',detail.hiddenStems);
  setText('#twelve-stages-explainer',detail.twelveStages);
  setText('#branch-relations-explainer',detail.branchRelations);
  setText('#void-explainer',detail.void);
  setText('#daeun-explainer',detail.daeun);

  const relationGuide=document.querySelector('#branch-relation-guide');
  if(relationGuide){
    relationGuide.replaceChildren();
    for(const item of detail.relationItems){
      const row=document.createElement('div');
      const label=document.createElement('b');
      label.textContent=`${item.label} · ${item.branches}`;
      const copy=document.createElement('span');
      copy.textContent=item.positions?`${item.positions} · ${item.meaning}`:item.meaning;
      row.append(label,copy);
      relationGuide.append(row);
    }
  }
};

const renderSummary=(result,sex,calendarMeta=null)=>{
  const [y,m,d]=result.input.birthDate.split('-');
  const time=result.input.timeKnown?result.input.birthTime:'출생시간 미상';
  const status=result.status==='partial'?' · 시주 제외':'';
  const boundary=`일자 기준 ${dayBoundaryLabel(result.metadata?.dayBoundary)}`;
  const dateLabel=calendarMeta?.type==='lunar'
    ?`음력 ${calendarMeta.year}년 ${calendarMeta.month}월 ${calendarMeta.day}일${calendarMeta.isLeapMonth?' · 윤달':''} → 양력 ${y}년 ${Number(m)}월 ${Number(d)}일`
    :`${y}년 ${Number(m)}월 ${Number(d)}일`;
  summary.textContent=`${dateLabel} · ${time} · ${sex}${status} · ${boundary}`;
};

const showResult=(result,sex,calendarMeta=null)=>{
  document.body.classList.add('has-result');
  latestShareState={result,sex,calendarMeta};
  renderPillar('year',result.pillars.year,result.tenGods.visibleStems.year,result.tenGods.visibleBranches.year);
  renderPillar('month',result.pillars.month,result.tenGods.visibleStems.month,result.tenGods.visibleBranches.month);
  renderPillar('day',result.pillars.day,result.tenGods.visibleStems.day,result.tenGods.visibleBranches.day);
  renderPillar('hour',result.pillars.hour,result.tenGods.visibleStems.hour,result.tenGods.visibleBranches.hour);
  renderReadingGuide(result);
  renderElements(result);
  renderTenGods(result);
  renderHiddenStems(result);
  renderStructureFacts(result);
  renderDetailGuide(result);
  renderStructuralAnalysis(result);
  renderClimateBalance(result);
  renderSymbolicStars(result);
  renderReading(result);
  renderFlow(result);
  renderSummary(result,sex,calendarMeta);
  preview.hidden=false;
  requestAnimationFrame(()=>{preview.classList.add('is-visible');scheduleContextGuideSync();});
  preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
};

form?.addEventListener('submit',event=>{
  event.preventDefault();
  setError('');
  const calendar=selectedCalendar();
  let birthDate=dateInput.value;
  let calendarMeta=null;

  if(calendar==='solar'){
    if(!birthDate){dateInput.focus();return;}
  }else{
    if(!lunarYear.value||!lunarMonth.value||!lunarDay.value){
      setError('음력 생년월일의 년·월·일을 모두 입력해 주세요.');
      (!lunarYear.value?lunarYear:!lunarMonth.value?lunarMonth:lunarDay).focus();
      return;
    }
    try{
      const converted=lunarToSolarDate({
        year:lunarYear.value,
        month:lunarMonth.value,
        day:lunarDay.value,
        isLeapMonth:lunarLeap.checked
      });
      birthDate=converted.solarDate;
      calendarMeta={type:'lunar',...converted.lunar};
    }catch(error){
      const message=String(error?.message||error);
      if(message.includes('not a leap month')) setError('선택한 해의 이 달은 윤달이 아니에요. 윤달 체크를 해제하거나 날짜를 다시 확인해 주세요.');
      else if(message.includes('1912..2050')) setError('현재 음력 변환 지원 범위는 1912년부터 2050년까지예요.');
      else setError('존재하지 않는 음력 날짜예요. 음력 날짜와 윤달 여부를 다시 확인해 주세요.');
      return;
    }
  }

  const sexValue=form.elements.sex?.value||null;
  const sex=sexValue==='female'?'여성':sexValue==='male'?'남성':'성별 미선택';
  const birthTime=timeUnknown.checked?null:(timeInput.value||null);
  const dayBoundary=selectedDayBoundary();
  try{
    const result=calculateSaju({birthDate,birthTime,sex:sexValue},{dayBoundary});
    if(result.status==='needs-birth-time'){
      setError('이 날짜는 절기 경계가 바뀌는 날이라 정확한 년주·월주 판정을 위해 출생시간이 필요해요.');
      preview.hidden=true;
      return;
    }
    showResult(result,sex,calendarMeta);
    persistRecentReading({
      calendar,
      birthDate,
      birthTime,
      sexValue,
      dayBoundary,
      calendarMeta,
      result
    });
  }catch(error){
    const message=String(error?.message||error);
    if(message.includes('did not exist')) setError('입력한 시각은 당시 한국의 표준시 전환 때문에 존재하지 않았던 시각이에요. 출생기록을 다시 확인해 주세요.');
    else if(message.includes('ambiguous')) setError('입력한 시각은 당시 표준시 전환으로 두 번 존재했던 시각이에요. 현재 버전에서는 자동 선택하지 않습니다.');
    else if(message.includes('1912..2100')||message.includes('1912~2100')) setError('현재 계산 지원 범위는 1912년부터 2100년까지예요.');
    else setError('계산 중 확인이 필요한 값이 발견됐어요. 입력값을 다시 확인해 주세요.');
    preview.hidden=true;
  }
});
