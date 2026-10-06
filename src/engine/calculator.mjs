import {
  yearPillar,monthPillar,dayPillar,effectiveDayDate,
  hourBranchIndex,hourPillar,tenGod,surfaceElementCounts,ELEMENT_LABELS
} from './rules.mjs';
import {resolveSeoulCivilTime,KOREA_TIME_POLICY} from './korea-time.mjs';
import {
  JIE_2026,monthIndexAtInstant,liChunReachedAt,SOLAR_TERM_DATA_2026
} from './data/solar-terms-2026.mjs';

export const ENGINE_VERSION='0.2.0';
export const SUPPORTED_SOLAR_TERM_YEARS=[2026];

const parseDate=value=>{
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));
  if(!match) throw new TypeError('birthDate must be YYYY-MM-DD');
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  const probe=new Date(Date.UTC(year,month-1,day));
  if(probe.getUTCFullYear()!==year||probe.getUTCMonth()+1!==month||probe.getUTCDate()!==day){
    throw new RangeError('invalid birthDate');
  }
  return {year,month,day};
};

const parseTime=value=>{
  if(value==null||value==='') return null;
  const match=/^(\d{2}):(\d{2})$/.exec(String(value));
  if(!match) throw new TypeError('birthTime must be HH:MM or null');
  const hour=Number(match[1]),minute=Number(match[2]);
  if(hour<0||hour>23||minute<0||minute>59) throw new RangeError('invalid birthTime');
  return {hour,minute};
};

const onlyInstant=resolution=>{
  if(resolution.status==='nonexistent'){
    throw new RangeError('birth time did not exist in Asia/Seoul because of a civil-time transition');
  }
  if(resolution.status==='ambiguous'){
    throw new RangeError('birth time is ambiguous in Asia/Seoul because the civil clock repeated');
  }
  return resolution.matches[0];
};

const boundaryState=epochMs=>({
  afterLiChun:liChunReachedAt(epochMs,JIE_2026),
  monthIndex:monthIndexAtInstant(epochMs,JIE_2026)
});

const sameBoundaryState=(a,b)=>a.afterLiChun===b.afterLiChun&&a.monthIndex===b.monthIndex;

const pillarSummary=pillar=>pillar?({
  hanja:pillar.hanja,
  korean:pillar.korean,
  stem:{
    hanja:pillar.stem.hanja,
    korean:pillar.stem.ko,
    element:pillar.stem.element,
    elementKo:ELEMENT_LABELS[pillar.stem.element],
    polarity:pillar.stem.polarity
  },
  branch:{
    hanja:pillar.branch.hanja,
    korean:pillar.branch.ko,
    element:pillar.branch.element,
    elementKo:ELEMENT_LABELS[pillar.branch.element]
  },
  stemIndex:pillar.stemIndex,
  branchIndex:pillar.branchIndex,
  cycleIndex:pillar.index
}):null;

const buildResult=({date,time,instant,state,dayBoundary})=>{
  const year=yearPillar(date.year,{afterLiChun:state.afterLiChun});
  if(state.monthIndex==null) throw new RangeError('solar-term boundary data is incomplete for this instant');
  const month=monthPillar(year.stemIndex,state.monthIndex);

  const civilForDay={...date,hour:time?.hour??0};
  const effectiveDate=effectiveDayDate(civilForDay,{dayBoundary});
  const day=dayPillar(effectiveDate.year,effectiveDate.month,effectiveDate.day);

  const hour=time?hourPillar(day.stemIndex,hourBranchIndex(time.hour,time.minute)):null;
  const pillars=[year,month,day,hour];
  const counts=surfaceElementCounts(pillars);

  const visibleStemTenGods={
    year:tenGod(day.stemIndex,year.stemIndex),
    month:tenGod(day.stemIndex,month.stemIndex),
    day:'일간',
    hour:hour?tenGod(day.stemIndex,hour.stemIndex):null
  };

  return {
    status:time?'ok':'partial',
    input:{
      birthDate:`${String(date.year).padStart(4,'0')}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`,
      birthTime:time?`${String(time.hour).padStart(2,'0')}:${String(time.minute).padStart(2,'0')}`:null,
      timeKnown:Boolean(time)
    },
    pillars:{
      year:pillarSummary(year),
      month:pillarSummary(month),
      day:pillarSummary(day),
      hour:pillarSummary(hour)
    },
    dayMaster:pillarSummary(day).stem,
    fiveElements:{
      method:'visible-stems-and-branches',
      characterCount:hour?8:6,
      counts,
      labels:ELEMENT_LABELS
    },
    tenGods:{
      method:'visible-heavenly-stems-relative-to-day-master',
      visibleStems:visibleStemTenGods,
      hiddenStemsIncluded:false
    },
    metadata:{
      engineVersion:ENGINE_VERSION,
      dayBoundary,
      timezone:KOREA_TIME_POLICY.zone,
      timeSource:KOREA_TIME_POLICY.source,
      longitudeCorrection:KOREA_TIME_POLICY.longitudeCorrection,
      equationOfTime:KOREA_TIME_POLICY.equationOfTime,
      solarTermSource:SOLAR_TERM_DATA_2026.source,
      solarTermPrecision:SOLAR_TERM_DATA_2026.precision,
      resolvedInstant:instant?instant.utcIso:null,
      utcOffsetMinutes:instant?instant.offsetMinutes:null
    }
  };
};

export function calculateSaju(input,{dayBoundary='midnight'}={}){
  const date=parseDate(input?.birthDate);
  const time=parseTime(input?.birthTime);

  if(!SUPPORTED_SOLAR_TERM_YEARS.includes(date.year)){
    throw new RangeError(`solar-term provider for ${date.year} is not installed; currently supported: ${SUPPORTED_SOLAR_TERM_YEARS.join(', ')}`);
  }

  if(time){
    const resolution=resolveSeoulCivilTime({...date,...time});
    const instant=onlyInstant(resolution);
    return buildResult({
      date,time,instant,
      state:boundaryState(instant.epochMs),
      dayBoundary
    });
  }

  // Without a birth time, year/month are safe only when the whole civil date
  // lies on the same side of all relevant solar-term boundaries.
  const start=onlyInstant(resolveSeoulCivilTime({...date,hour:0,minute:0}));
  const end=onlyInstant(resolveSeoulCivilTime({...date,hour:23,minute:59}));
  const startState=boundaryState(start.epochMs);
  const endState=boundaryState(end.epochMs);

  if(!sameBoundaryState(startState,endState)){
    return {
      status:'needs-birth-time',
      reason:'solar-term-boundary',
      input:{birthDate:input.birthDate,birthTime:null,timeKnown:false},
      metadata:{
        engineVersion:ENGINE_VERSION,
        dayBoundary,
        timezone:KOREA_TIME_POLICY.zone,
        solarTermSource:SOLAR_TERM_DATA_2026.source
      }
    };
  }

  return buildResult({
    date,time:null,instant:null,state:startState,dayBoundary
  });
}
