import {calculateSaju} from '../engine/calculator.mjs';
import {lunarToSolarDate} from '../engine/lunar-calendar.mjs';
import {buildCompatibilityV1} from '../content/compatibility-v1.mjs';

const form=document.querySelector('#compatibility-form');
const resultSection=document.querySelector('#compat-result');
const errorBox=document.querySelector('#compat-error');
const saveButton=document.querySelector('#save-compat-image');
const shareButton=document.querySelector('#share-compat-result');
const actionStatus=document.querySelector('#compat-action-status');

let latestCompatibility=null;
let statusTimer=null;

const personRefs=prefix=>({
  name:document.querySelector(`#${prefix}-name`),
  date:document.querySelector(`#${prefix}-birth-date`),
  solarRow:document.querySelector(`#${prefix}-solar-row`),
  lunarFields:document.querySelector(`#${prefix}-lunar-fields`),
  lunarYear:document.querySelector(`#${prefix}-lunar-year`),
  lunarMonth:document.querySelector(`#${prefix}-lunar-month`),
  lunarDay:document.querySelector(`#${prefix}-lunar-day`),
  lunarLeap:document.querySelector(`#${prefix}-lunar-leap`),
  time:document.querySelector(`#${prefix}-birth-time`),
  timeUnknown:document.querySelector(`#${prefix}-time-unknown`),
  calendar:[...document.querySelectorAll(`input[name="${prefix}Calendar"]`)]
});

const people={a:personRefs('a'),b:personRefs('b')};
const defaultLabels={a:'A',b:'B'};

const selectedCalendar=prefix=>document.querySelector(`input[name="${prefix}Calendar"]:checked`)?.value||'solar';
const selectedDayBoundary=()=>form.elements.dayBoundary?.value||'midnight';
const dayBoundaryLabel=value=>value==='zi-start'?'23:00 자시 시작':'00:00 일자 변경';

const syncCalendar=prefix=>{
  const refs=people[prefix];
  const lunar=selectedCalendar(prefix)==='lunar';
  refs.solarRow.hidden=lunar;
  refs.lunarFields.hidden=!lunar;
  refs.date.required=!lunar;
  refs.lunarYear.required=lunar;
  refs.lunarMonth.required=lunar;
  refs.lunarDay.required=lunar;
};

for(const prefix of ['a','b']){
  const refs=people[prefix];
  refs.calendar.forEach(input=>input.addEventListener('change',()=>syncCalendar(prefix)));
  refs.timeUnknown.addEventListener('change',()=>{
    refs.time.disabled=refs.timeUnknown.checked;
    if(refs.timeUnknown.checked) refs.time.value='';
  });
  syncCalendar(prefix);
}

const setError=message=>{
  errorBox.textContent=message;
  errorBox.hidden=!message;
};

const personDisplayLabel=(prefix,refs)=>refs.name.value.trim()||defaultLabels[prefix];

const readPerson=prefix=>{
  const refs=people[prefix];
  const label=personDisplayLabel(prefix,refs);
  const calendar=selectedCalendar(prefix);
  let birthDate=refs.date.value;
  let calendarMeta=null;

  if(calendar==='solar'){
    if(!birthDate) throw new Error(`${label}의 생년월일을 입력해 주세요.`);
  }else{
    if(!refs.lunarYear.value||!refs.lunarMonth.value||!refs.lunarDay.value){
      throw new Error(`${label}의 음력 생년월일을 모두 입력해 주세요.`);
    }
    try{
      const converted=lunarToSolarDate({
        year:refs.lunarYear.value,
        month:refs.lunarMonth.value,
        day:refs.lunarDay.value,
        isLeapMonth:refs.lunarLeap.checked
      });
      birthDate=converted.solarDate;
      calendarMeta={type:'lunar',...converted.lunar};
    }catch(error){
      const message=String(error?.message||error);
      if(message.includes('not a leap month')) throw new Error(`${label}의 선택한 달은 윤달이 아니에요.`);
      if(message.includes('1912..2050')) throw new Error(`${label}의 음력 날짜는 현재 1912~2050년만 지원해요.`);
      throw new Error(`${label}의 음력 날짜와 윤달 여부를 다시 확인해 주세요.`);
    }
  }

  const birthTime=refs.timeUnknown.checked?null:(refs.time.value||null);
  return {label,calendar,birthDate,birthTime,calendarMeta};
};

const calculatePerson=(person,dayBoundary)=>{
  try{
    const result=calculateSaju(
      {birthDate:person.birthDate,birthTime:person.birthTime,sex:null},
      {dayBoundary}
    );
    if(result.status==='needs-birth-time'){
      throw new Error(`${person.label}의 날짜는 절기 경계일이라 정확한 비교를 위해 출생시간이 필요해요.`);
    }
    return result;
  }catch(error){
    const message=String(error?.message||error);
    if(message.includes('did not exist')) throw new Error(`${person.label}의 입력 시각은 당시 한국 표준시 전환 때문에 존재하지 않았던 시각이에요.`);
    if(message.includes('ambiguous')) throw new Error(`${person.label}의 입력 시각은 당시 표준시 전환으로 두 번 존재했던 시각이에요.`);
    if(message.includes('1912..2100')||message.includes('1912~2100')) throw new Error(`${person.label}의 양력 날짜는 현재 1912~2100년만 지원해요.`);
    throw error;
  }
};

const elementKo={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};

const setText=(selector,value)=>{
  const node=document.querySelector(selector);
  if(node) node.textContent=value||'';
};

const renderEvidence=(selector,items=[])=>{
  const node=document.querySelector(selector);
  if(!node) return;
  node.replaceChildren();
  for(const item of items.filter(Boolean)){
    const chip=document.createElement('span');
    chip.textContent=item;
    node.append(chip);
  }
};

const renderDirection=(key,section,fromLabel,toLabel)=>{
  setText(`#${key}-label`,`${fromLabel} → ${toLabel}`);
  setText(`#${key}-title`,section.title);
  setText(`#${key}-body`,section.body);
  setText(`#${key}-guide`,section.guide);
  renderEvidence(`#${key}-evidence`,section.evidence);
};

const renderStory=(key,section)=>{
  setText(`#compat-${key}-title`,section.title);
  setText(`#compat-${key}-body`,section.body);
  setText(`#compat-${key}-guide`,section.guide||'');
  renderEvidence(`#compat-${key}-evidence`,section.evidence);
};

const showCompatibility=({aPerson,bPerson,a,b,dayBoundary})=>{
  const reading=buildCompatibilityV1(a,b,{aLabel:aPerson.label,bLabel:bPerson.label});
  latestCompatibility={aPerson,bPerson,a,b,reading,dayBoundary};

  setText('#compat-result-title',`${aPerson.label} × ${bPerson.label}, 두 사람 사이의 결`);
  setText('#compat-result-meta',`두 명식 비교 · ${dayBoundaryLabel(dayBoundary)} · 점수 없이 구조로 읽기`);

  setText('#result-a-label',aPerson.label);
  setText('#result-b-label',bPerson.label);
  setText('#result-a-pillar',a.pillars.day.hanja);
  setText('#result-b-pillar',b.pillars.day.hanja);
  setText('#result-a-master',`일간 ${a.dayMaster.hanja} · ${elementKo[a.dayMaster.element]}`);
  setText('#result-b-master',`일간 ${b.dayMaster.hanja} · ${elementKo[b.dayMaster.element]}`);

  setText('#pair-signature-title',reading.overview.title);
  setText('#pair-overview-body',reading.overview.body);
  renderEvidence('#pair-overview-evidence',reading.overview.evidence);

  renderDirection('a-to-b',reading.aToB,aPerson.label,bPerson.label);
  renderDirection('b-to-a',reading.bToA,bPerson.label,aPerson.label);

  renderStory('rhythm',reading.rhythm);
  renderStory('friction',reading.friction);
  renderStory('guide',reading.guide);

  resultSection.hidden=false;
  requestAnimationFrame(()=>resultSection.classList.add('is-visible'));
  resultSection.scrollIntoView({
    behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
    block:'start'
  });
};

form?.addEventListener('submit',event=>{
  event.preventDefault();
  setError('');
  resultSection.classList.remove('is-visible');

  try{
    const aPerson=readPerson('a');
    const bPerson=readPerson('b');
    const dayBoundary=selectedDayBoundary();
    const a=calculatePerson(aPerson,dayBoundary);
    const b=calculatePerson(bPerson,dayBoundary);
    showCompatibility({aPerson,bPerson,a,b,dayBoundary});
  }catch(error){
    setError(String(error?.message||error));
    resultSection.hidden=true;
  }
});

// Share image ---------------------------------------------------------------

const SHARE={
  width:1080,
  height:1350,
  pad:72,
  url:'saju.everytinytool.com/compatibility'
};

const fonts={
  sans:'"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif',
  serif:'"Noto Serif KR","Nanum Myeongjo","AppleMyungjo",serif'
};

const palette={
  paper:'#f7f3ee',
  ink:'#302a30',
  muted:'#7a7177',
  line:'#d6cdd2',
  plum:'#625062',
  plumDeep:'#4d3c4c',
  rose:'#a36d76',
  sage:'#687d77',
  gold:'#9b7c4f',
  white:'#fffdfb'
};

const roundRect=(ctx,x,y,w,h,r)=>{
  const radius=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+radius,y);
  ctx.arcTo(x+w,y,x+w,y+h,radius);
  ctx.arcTo(x+w,y+h,x,y+h,radius);
  ctx.arcTo(x,y+h,x,y,radius);
  ctx.arcTo(x,y,x+w,y,radius);
  ctx.closePath();
};

const line=(ctx,x1,y1,x2,y2,color=palette.line,width=1)=>{
  ctx.save();
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.restore();
};

const wrap=(ctx,text,maxWidth,maxLines=3)=>{
  const chars=[...String(text||'')];
  const lines=[];
  let current='';
  for(const char of chars){
    const next=current+char;
    if(current&&ctx.measureText(next).width>maxWidth){
      lines.push(current.trim());
      current=char===' '?'':char;
      if(lines.length===maxLines) break;
    }else current=next;
  }
  if(lines.length<maxLines&&current.trim()) lines.push(current.trim());
  if(lines.length===maxLines){
    const used=lines.join('').replaceAll(' ','').length;
    const full=chars.join('').replaceAll(' ','').length;
    if(used<full){
      let last=lines[maxLines-1];
      while(last&&ctx.measureText(last+'…').width>maxWidth) last=last.slice(0,-1);
      lines[maxLines-1]=last.replace(/[ ,·]+$/,'')+'…';
    }
  }
  return lines;
};

const drawLines=(ctx,lines,x,y,lineHeight)=>{
  lines.forEach((text,index)=>ctx.fillText(text,x,y+index*lineHeight));
};

const buildShareCanvas=async()=>{
  if(!latestCompatibility) throw new Error('no compatibility result');
  if(document.fonts?.ready) await document.fonts.ready;

  const {aPerson,bPerson,a,b,reading,dayBoundary}=latestCompatibility;
  const canvas=document.createElement('canvas');
  canvas.width=SHARE.width;
  canvas.height=SHARE.height;
  const ctx=canvas.getContext('2d');
  const {width,height,pad}=SHARE;

  ctx.fillStyle=palette.paper;
  ctx.fillRect(0,0,width,height);

  ctx.save();
  ctx.globalAlpha=.045;
  ctx.fillStyle=palette.plum;
  ctx.font=`700 220px ${fonts.serif}`;
  ctx.textAlign='right';
  ctx.fillText('緣',width-pad+12,174);
  ctx.restore();
  ctx.textAlign='left';

  ctx.fillStyle=palette.plum;
  ctx.font=`700 60px ${fonts.serif}`;
  ctx.fillText('사주결',pad,102);
  ctx.fillStyle=palette.gold;
  ctx.font=`800 15px ${fonts.sans}`;
  ctx.fillText('TWO PEOPLE  ·  COMPATIBILITY',pad,145);
  ctx.fillStyle=palette.muted;
  ctx.font=`600 20px ${fonts.sans}`;
  ctx.fillText('점수보다, 두 사람 사이에 생기는 반응을 읽습니다.',pad,182);
  line(ctx,pad,217,width-pad,217,'#cfc5cb',1.5);
  ctx.fillStyle=palette.gold;
  ctx.fillRect(pad,213,58,5);

  const pairY=270;
  const pillarW=280;
  const pillarH=230;
  const leftX=pad+24;
  const rightX=width-pad-24-pillarW;

  const drawPerson=(x,label,pillar,master,isRight=false)=>{
    roundRect(ctx,x,pairY,pillarW,pillarH,28);
    ctx.fillStyle=isRight?'#edf0ed':palette.plum;
    ctx.fill();
    ctx.strokeStyle=isRight?'#cbd5cf':palette.plum;
    ctx.lineWidth=2;
    ctx.stroke();

    ctx.textAlign='center';
    ctx.fillStyle=isRight?palette.sage:'rgba(255,255,255,.75)';
    ctx.font=`800 18px ${fonts.sans}`;
    ctx.fillText(label,x+pillarW/2,pairY+48);

    ctx.fillStyle=isRight?palette.ink:'#fff';
    ctx.font=`700 72px ${fonts.serif}`;
    ctx.fillText(pillar,x+pillarW/2,pairY+134);

    ctx.fillStyle=isRight?palette.muted:'rgba(255,255,255,.72)';
    ctx.font=`650 16px ${fonts.sans}`;
    ctx.fillText(`일간 ${master.hanja} · ${elementKo[master.element]}`,x+pillarW/2,pairY+179);
    ctx.textAlign='left';
  };

  drawPerson(leftX,aPerson.label,a.pillars.day.hanja,a.dayMaster,false);
  drawPerson(rightX,bPerson.label,b.pillars.day.hanja,b.dayMaster,true);

  const centerX=width/2;
  line(ctx,leftX+pillarW+20,pairY+114,centerX-42,pairY+114,'#bcaeb7',1.5);
  line(ctx,centerX+42,pairY+114,rightX-20,pairY+114,'#bcaeb7',1.5);
  ctx.textAlign='center';
  ctx.fillStyle=palette.gold;
  ctx.font=`700 54px ${fonts.serif}`;
  ctx.fillText('緣',centerX,pairY+132);
  ctx.textAlign='left';

  ctx.fillStyle=palette.rose;
  ctx.font=`800 15px ${fonts.sans}`;
  ctx.fillText('RELATIONSHIP SIGNATURE',pad,555);
  ctx.fillStyle=palette.ink;
  ctx.font=`750 29px ${fonts.sans}`;
  const overviewLines=wrap(ctx,reading.overview.title,width-pad*2,2);
  drawLines(ctx,overviewLines,pad,600,42);

  const directionY=700;
  const gap=24;
  const cardW=(width-pad*2-gap)/2;
  const cardH=224;

  [
    {x:pad,label:`${aPerson.label} → ${bPerson.label}`,section:reading.aToB,tone:'a'},
    {x:pad+cardW+gap,label:`${bPerson.label} → ${aPerson.label}`,section:reading.bToA,tone:'b'}
  ].forEach(item=>{
    roundRect(ctx,item.x,directionY,cardW,cardH,24);
    ctx.fillStyle=item.tone==='a'?'#f0e9ef':'#edf1ee';
    ctx.fill();

    ctx.fillStyle=item.tone==='a'?palette.plum:palette.sage;
    ctx.font=`800 16px ${fonts.sans}`;
    ctx.fillText(item.label,item.x+24,directionY+38);

    ctx.fillStyle=palette.ink;
    ctx.font=`750 23px ${fonts.sans}`;
    const titleLines=wrap(ctx,item.section.title,cardW-48,3);
    drawLines(ctx,titleLines,item.x+24,directionY+82,34);
  });

  ctx.fillStyle=palette.gold;
  ctx.font=`800 15px ${fonts.sans}`;
  ctx.fillText('RELATIONSHIP RHYTHM',pad,982);
  line(ctx,pad+210,976,width-pad,976,'#d5ccd1',1);

  const storyItems=[
    ['생활',reading.rhythm.title],
    ['차이',reading.friction.title],
    ['함께',reading.guide.title]
  ];
  storyItems.forEach(([label,title],index)=>{
    const y=1028+index*72;
    ctx.fillStyle=index===1?palette.rose:palette.plum;
    ctx.font=`800 16px ${fonts.sans}`;
    ctx.fillText(label,pad,y);

    ctx.fillStyle=palette.ink;
    ctx.font=`700 21px ${fonts.sans}`;
    const lines=wrap(ctx,title,width-pad*2-92,2);
    drawLines(ctx,lines,pad+78,y,29);
    if(index<2) line(ctx,pad+78,y+38,width-pad,y+38,'#ded6da',1);
  });

  line(ctx,pad,1266,width-pad,1266,'#cfc5cb',1.5);
  ctx.fillStyle=palette.plum;
  ctx.font=`800 18px ${fonts.sans}`;
  ctx.fillText(SHARE.url,pad,1307);

  ctx.textAlign='right';
  ctx.fillStyle=palette.muted;
  ctx.font=`650 14px ${fonts.sans}`;
  ctx.fillText(`한국 표준시 · ${dayBoundaryLabel(dayBoundary)}`,width-pad,1307);
  ctx.textAlign='left';

  return canvas;
};

const canvasToBlob=canvas=>new Promise((resolve,reject)=>{
  canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('image export failed')),'image/png');
});

const setStatus=(message,{error=false}={})=>{
  clearTimeout(statusTimer);
  actionStatus.textContent=message;
  actionStatus.dataset.state=error?'error':'ok';
  statusTimer=setTimeout(()=>{
    actionStatus.textContent='';
    delete actionStatus.dataset.state;
  },3200);
};

const shareText=()=>{
  if(!latestCompatibility) return '';
  const {aPerson,bPerson,reading}=latestCompatibility;
  return `사주결 궁합 · ${aPerson.label} × ${bPerson.label}\n${reading.overview.title}\nhttps://saju.everytinytool.com/compatibility/`;
};

saveButton?.addEventListener('click',async()=>{
  if(!latestCompatibility) return;
  saveButton.setAttribute('aria-busy','true');
  try{
    const canvas=await buildShareCanvas();
    const blob=await canvasToBlob(canvas);
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download='saju-gyeol-compatibility.png';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setStatus('궁합 공유 이미지를 저장했어요.');
  }catch(error){
    console.error(error);
    setStatus('이미지 저장 중 문제가 생겼어요.',{error:true});
  }finally{
    saveButton.removeAttribute('aria-busy');
  }
});

shareButton?.addEventListener('click',async()=>{
  if(!latestCompatibility) return;
  shareButton.setAttribute('aria-busy','true');
  try{
    const canvas=await buildShareCanvas();
    const blob=await canvasToBlob(canvas);
    const file=new File([blob],'saju-gyeol-compatibility.png',{type:'image/png'});
    const url='https://saju.everytinytool.com/compatibility/';

    if(navigator.share&&navigator.canShare?.({files:[file]})){
      await navigator.share({
        title:'사주결 · 두 사람의 궁합',
        text:'점수보다 두 사람 사이의 결을 읽는 사주 궁합',
        url,
        files:[file]
      });
      setStatus('공유 창을 열었어요.');
      return;
    }

    if(navigator.share){
      await navigator.share({title:'사주결 · 두 사람의 궁합',text:shareText(),url});
      setStatus('공유 창을 열었어요.');
      return;
    }

    await navigator.clipboard.writeText(shareText());
    setStatus('핵심 결과와 링크를 복사했어요.');
  }catch(error){
    if(error?.name!=='AbortError'){
      console.error(error);
      try{
        await navigator.clipboard.writeText(shareText());
        setStatus('공유 대신 핵심 결과와 링크를 복사했어요.');
      }catch{
        setStatus('공유 기능을 사용할 수 없는 브라우저예요.',{error:true});
      }
    }
  }finally{
    shareButton.removeAttribute('aria-busy');
  }
});
