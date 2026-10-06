const form=document.querySelector('#birth-form');
const dateInput=document.querySelector('#birth-date');
const timeInput=document.querySelector('#birth-time');
const timeUnknown=document.querySelector('#time-unknown');
const preview=document.querySelector('#result-preview');
const summary=document.querySelector('#input-summary');

timeUnknown?.addEventListener('change',()=>{
  timeInput.disabled=timeUnknown.checked;
  if(timeUnknown.checked) timeInput.value='';
});

form?.addEventListener('submit',event=>{
  event.preventDefault();
  if(!dateInput.value){
    dateInput.focus();
    return;
  }
  const sex=form.elements.sex?.value||'성별 미선택';
  const time=timeUnknown.checked?'출생시간 미상':(timeInput.value||'출생시간 미입력');
  const [y,m,d]=dateInput.value.split('-');
  summary.textContent=`${y}년 ${Number(m)}월 ${Number(d)}일 · ${time} · ${sex} — 계산 엔진 검증 후 이 자리에 실제 명식을 표시합니다.`;
  preview.hidden=false;
  requestAnimationFrame(()=>preview.classList.add('is-visible'));
  preview.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
});
