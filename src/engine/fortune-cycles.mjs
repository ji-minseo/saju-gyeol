import {sexagenary,STEMS} from './rules.mjs';
import {getJieTermsForYear} from './solar-term-provider.mjs';

const DAY_MS=86400000;

export function daeunDirection(yearStemIndex,sex){
  if(sex!=='female'&&sex!=='male') return null;
  const yin=STEMS[yearStemIndex].polarity==='yin';
  const forward=(sex==='male'&&!yin)||(sex==='female'&&yin);
  return forward?'forward':'reverse';
}

const uniqueTerms=terms=>{
  const seen=new Set();
  return terms.filter(term=>{
    if(seen.has(term.epochMs)) return false;
    seen.add(term.epochMs);
    return true;
  }).sort((a,b)=>a.epochMs-b.epochMs);
};

function adjacentJie(year,epochMs,direction){
  let terms=[...getJieTermsForYear(year)];
  if(direction==='forward'&&terms.every(t=>t.epochMs<=epochMs)&&year<2100){
    terms=uniqueTerms([...terms,...getJieTermsForYear(year+1)]);
  }
  if(direction==='reverse'&&terms.every(t=>t.epochMs>=epochMs)&&year>1970){
    terms=uniqueTerms([...getJieTermsForYear(year-1),...terms]);
  }
  if(direction==='forward') return terms.find(t=>t.epochMs>epochMs)??null;
  return [...terms].reverse().find(t=>t.epochMs<epochMs)??null;
}

export function calculateDaeun({
  birthYear,birthInstantMs,yearStemIndex,monthCycleIndex,sex,count=10
}){
  const direction=daeunDirection(yearStemIndex,sex);
  if(!direction) return {status:'needs-sex'};
  if(!Number.isFinite(birthInstantMs)) return {status:'needs-birth-time',direction};

  const boundary=adjacentJie(birthYear,birthInstantMs,direction);
  if(!boundary) return {status:'boundary-unavailable',direction};

  const distanceMs=Math.abs(boundary.epochMs-birthInstantMs);
  const distanceDays=distanceMs/DAY_MS;
  const startAgeMonths=Math.round(distanceDays*4);
  const startAgeYearsRounded=Math.round(startAgeMonths/12);
  const step=direction==='forward'?1:-1;
  const cycles=Array.from({length:count},(_,i)=>{
    const pillar=sexagenary(monthCycleIndex+step*(i+1));
    return {
      order:i+1,
      startAge:startAgeYearsRounded+i*10,
      startAgeMonths:startAgeMonths+i*120,
      pillar:{
        hanja:pillar.hanja,korean:pillar.korean,
        stemIndex:pillar.stemIndex,branchIndex:pillar.branchIndex,cycleIndex:pillar.index
      }
    };
  });
  return {
    status:'ok',
    method:'year-stem-yinyang-sex-and-3days-per-year',
    direction,
    boundary:{name:boundary.name,epochMs:boundary.epochMs,utcIso:boundary.utcIso},
    distanceDays,
    startAgeMonths,
    startAgeYearsRounded,
    cycles
  };
}
