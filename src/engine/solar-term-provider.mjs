import {SearchSunLongitude} from 'astronomy-engine';

export const SOLAR_TERM_PROVIDER_VERSION='astronomy-engine@2.1.19';
export const SOLAR_TERM_SUPPORT={minYear:1912,maxYear:2100};

// Saju month boundaries use the 12 節 (jie), not all 24 solar terms.
// targetLongitude is the Sun's apparent geocentric ecliptic longitude of date.
const JIE_DEFINITIONS=[
  {name:'대설',monthIndex:10,targetLongitude:255,yearOffset:-1,searchMonth:12,searchDay:2},
  {name:'소한',monthIndex:11,targetLongitude:285,yearOffset:0,searchMonth:1,searchDay:2},
  {name:'입춘',monthIndex:0,targetLongitude:315,yearOffset:0,searchMonth:2,searchDay:1},
  {name:'경칩',monthIndex:1,targetLongitude:345,yearOffset:0,searchMonth:3,searchDay:2},
  {name:'청명',monthIndex:2,targetLongitude:15,yearOffset:0,searchMonth:4,searchDay:2},
  {name:'입하',monthIndex:3,targetLongitude:45,yearOffset:0,searchMonth:5,searchDay:2},
  {name:'망종',monthIndex:4,targetLongitude:75,yearOffset:0,searchMonth:6,searchDay:2},
  {name:'소서',monthIndex:5,targetLongitude:105,yearOffset:0,searchMonth:7,searchDay:4},
  {name:'입추',monthIndex:6,targetLongitude:135,yearOffset:0,searchMonth:8,searchDay:4},
  {name:'백로',monthIndex:7,targetLongitude:165,yearOffset:0,searchMonth:9,searchDay:4},
  {name:'한로',monthIndex:8,targetLongitude:195,yearOffset:0,searchMonth:10,searchDay:5},
  {name:'입동',monthIndex:9,targetLongitude:225,yearOffset:0,searchMonth:11,searchDay:4},
  {name:'대설',monthIndex:10,targetLongitude:255,yearOffset:0,searchMonth:12,searchDay:4}
];

const cache=new Map();

const assertYear=year=>{
  if(!Number.isInteger(year)||year<SOLAR_TERM_SUPPORT.minYear||year>SOLAR_TERM_SUPPORT.maxYear){
    throw new RangeError(`solar-term year must be ${SOLAR_TERM_SUPPORT.minYear}..${SOLAR_TERM_SUPPORT.maxYear}`);
  }
};

const findTerm=(birthYear,definition)=>{
  const searchYear=birthYear+definition.yearOffset;
  const start=new Date(Date.UTC(
    searchYear,
    definition.searchMonth-1,
    definition.searchDay,
    0,0,0
  ));
  const found=SearchSunLongitude(definition.targetLongitude,start,12);
  if(!found){
    throw new Error(`solar-term search failed: ${definition.name} ${searchYear}`);
  }
  return {
    name:definition.name,
    monthIndex:definition.monthIndex,
    targetLongitude:definition.targetLongitude,
    epochMs:found.date.getTime(),
    utcIso:found.date.toISOString(),
    source:SOLAR_TERM_PROVIDER_VERSION
  };
};

export function getJieTermsForYear(year){
  assertYear(year);
  if(cache.has(year)) return cache.get(year);
  const terms=JIE_DEFINITIONS
    .map(definition=>findTerm(year,definition))
    .sort((a,b)=>a.epochMs-b.epochMs);
  cache.set(year,terms);
  return terms;
}

export function clearSolarTermCache(){
  cache.clear();
}

export const SOLAR_TERM_PROVIDER_METADATA={
  engine:'Astronomy Engine',
  packageVersion:'2.1.19',
  method:'SearchSunLongitude apparent geocentric ecliptic longitude of date',
  support:SOLAR_TERM_SUPPORT,
  validation:'KASI 2000 and 2026 published Jie regression fixtures'
};
