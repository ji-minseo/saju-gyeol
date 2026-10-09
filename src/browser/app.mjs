import {calculateSaju,ENGINE_VERSION} from '../engine/calculator.mjs';
import {buildReadingV2} from '../content/reading-v2.mjs';
import {buildCurrentFlow} from '../content/flow-v1.mjs';
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

let latestShareState=null;
let resultActionStatusTimer=null;

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
  for(const cycle of result.daeun.cycles){
    const timeline=flow.daeunTimeline.find(item=>item.order===cycle.order);
    const item=document.createElement('div');

    const age=document.createElement('small');
    age.textContent=`약 ${formatAgeMonthsLabel(cycle.startAgeMonths)}~`;
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


const SHARE_CARD={
  width:1080,
  height:1350,
  pad:76,
  url:'saju.everytinytool.com'
};

const shareFonts={
  sans:'"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif',
  serif:'"Noto Serif KR","Nanum Myeongjo","AppleMyungjo",serif'
};

const elementShareColors={
  wood:'#6f8f73',
  fire:'#b77768',
  earth:'#a88a61',
  metal:'#7d8290',
  water:'#657b91'
};

const shareCategoryLabels={
  temperament:'성향',
  relationship:'관계',
  career:'일',
  money:'돈'
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

const buildShareCanvas=async result=>{
  if(document.fonts?.ready) await document.fonts.ready;
  const reading=buildReadingV2(result);
  const canvas=document.createElement('canvas');
  canvas.width=SHARE_CARD.width;
  canvas.height=SHARE_CARD.height;
  const ctx=canvas.getContext('2d');
  const {width,height,pad}=SHARE_CARD;

  ctx.fillStyle='#fbf8f6';
  ctx.fillRect(0,0,width,height);

  ctx.fillStyle='#5f4d5d';
  ctx.font=`700 62px ${shareFonts.serif}`;
  ctx.fillText('사주결',pad,112);

  ctx.fillStyle='#9a7e55';
  ctx.font=`700 18px ${shareFonts.sans}`;
  ctx.letterSpacing='3px';
  ctx.fillText('SAJU GYEOL · PERSONAL READING',pad,154);
  ctx.letterSpacing='0px';

  ctx.fillStyle='#70666f';
  ctx.font=`500 24px ${shareFonts.sans}`;
  ctx.fillText('나를 만나는 사주, 사주결',pad,198);

  ctx.strokeStyle='#d7cfd4';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(pad,232);
  ctx.lineTo(width-pad,232);
  ctx.stroke();

  const pillarKeys=['year','month','day','hour'];
  const pillarLabels=['년주','월주','일주','시주'];
  const pillarGap=14;
  const pillarW=(width-pad*2-pillarGap*3)/4;
  const pillarY=280;
  const pillarH=188;

  pillarKeys.forEach((key,index)=>{
    const x=pad+index*(pillarW+pillarGap);
    const isDay=key==='day';
    roundRectPath(ctx,x,pillarY,pillarW,pillarH,22);
    ctx.fillStyle=isDay?'#615061':'#ffffff';
    ctx.fill();
    ctx.strokeStyle=isDay?'#615061':'#ded6db';
    ctx.lineWidth=2;
    ctx.stroke();

    ctx.fillStyle=isDay?'rgba(255,255,255,.72)':'#8b8188';
    ctx.font=`700 17px ${shareFonts.sans}`;
    ctx.textAlign='center';
    ctx.fillText(pillarLabels[index],x+pillarW/2,pillarY+42);

    ctx.fillStyle=isDay?'#fff':'#312b31';
    ctx.font=`700 58px ${shareFonts.serif}`;
    ctx.fillText(result.pillars[key]?.hanja||'—',x+pillarW/2,pillarY+119);

    ctx.fillStyle=isDay?'rgba(255,255,255,.76)':'#81777f';
    ctx.font=`600 15px ${shareFonts.sans}`;
    const stemGod=result.tenGods.visibleStems[key];
    const branchGod=result.tenGods.visibleBranches[key];
    ctx.fillText(key==='day'?'나의 중심':(stemGod&&branchGod?`${stemGod} · ${branchGod}`:'출생시간 미상'),x+pillarW/2,pillarY+154);
  });
  ctx.textAlign='left';

  ctx.fillStyle='#9a7e55';
  ctx.font=`800 17px ${shareFonts.sans}`;
  ctx.fillText('KEY READING',pad,528);

  const cardGap=18;
  const cardW=(width-pad*2-cardGap)/2;
  const cardH=174;
  const cardStartY=554;
  Object.entries(reading).forEach(([key,section],index)=>{
    const col=index%2;
    const row=Math.floor(index/2);
    const x=pad+col*(cardW+cardGap);
    const y=cardStartY+row*(cardH+cardGap);
    roundRectPath(ctx,x,y,cardW,cardH,20);
    ctx.fillStyle='#fff';
    ctx.fill();
    ctx.strokeStyle='#dfd8dc';
    ctx.lineWidth=2;
    ctx.stroke();

    ctx.fillStyle='#a06a75';
    ctx.font=`800 18px ${shareFonts.sans}`;
    ctx.fillText(shareCategoryLabels[key]||key,x+24,y+36);

    ctx.fillStyle='#322c31';
    ctx.font=`700 25px ${shareFonts.sans}`;
    const lines=wrapCanvasText(ctx,section.title,cardW-48,3);
    drawCanvasLines(ctx,lines,x+24,y+76,36);
  });

  const elementY=940;
  ctx.fillStyle='#9a7e55';
  ctx.font=`800 17px ${shareFonts.sans}`;
  ctx.fillText('FIVE ELEMENTS',pad,elementY);

  const counts=result.fiveElements.counts;
  const total=Math.max(1,Object.values(counts).reduce((sum,value)=>sum+value,0));
  const keys=['wood','fire','earth','metal','water'];
  const barX=pad+68;
  const barW=width-pad*2-160;
  keys.forEach((key,index)=>{
    const y=elementY+42+index*47;
    ctx.fillStyle='#6f666d';
    ctx.font=`700 18px ${shareFonts.sans}`;
    ctx.fillText(shareElementLabels[key],pad,y+7);

    roundRectPath(ctx,barX,y-10,barW,16,8);
    ctx.fillStyle='#ebe6e8';
    ctx.fill();

    const value=Number(counts[key]||0);
    if(value>0){
      roundRectPath(ctx,barX,y-10,Math.max(16,barW*(value/total)),16,8);
      ctx.fillStyle=elementShareColors[key];
      ctx.fill();
    }

    ctx.fillStyle='#766d73';
    ctx.font=`700 16px ${shareFonts.sans}`;
    ctx.textAlign='right';
    ctx.fillText(String(value),width-pad,y+6);
    ctx.textAlign='left';
  });

  ctx.strokeStyle='#d7cfd4';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(pad,1234);
  ctx.lineTo(width-pad,1234);
  ctx.stroke();

  ctx.fillStyle='#5f4d5d';
  ctx.font=`800 21px ${shareFonts.sans}`;
  ctx.fillText(SHARE_CARD.url,pad,1282);

  ctx.fillStyle='#887e85';
  ctx.font=`600 16px ${shareFonts.sans}`;
  ctx.textAlign='right';
  ctx.fillText(`절기 기준 · 한국 표준시 · ${dayBoundaryLabel(result.metadata?.dayBoundary)}`,width-pad,1282);
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
  const reading=buildReadingV2(result);
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
  renderElements(result);
  renderTenGods(result);
  renderHiddenStems(result);
  renderStructureFacts(result);
  renderReading(result);
  renderFlow(result);
  renderSummary(result,sex,calendarMeta);
  preview.hidden=false;
  requestAnimationFrame(()=>preview.classList.add('is-visible'));
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
  }catch(error){
    const message=String(error?.message||error);
    if(message.includes('did not exist')) setError('입력한 시각은 당시 한국의 표준시 전환 때문에 존재하지 않았던 시각이에요. 출생기록을 다시 확인해 주세요.');
    else if(message.includes('ambiguous')) setError('입력한 시각은 당시 표준시 전환으로 두 번 존재했던 시각이에요. 현재 버전에서는 자동 선택하지 않습니다.');
    else if(message.includes('1912..2100')||message.includes('1912~2100')) setError('현재 계산 지원 범위는 1912년부터 2100년까지예요.');
    else setError('계산 중 확인이 필요한 값이 발견됐어요. 입력값을 다시 확인해 주세요.');
    preview.hidden=true;
  }
});
