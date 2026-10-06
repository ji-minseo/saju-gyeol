// Saju Gyeol calculation primitives.
// This file contains deterministic calendar relationships only.
// Solar-term lookup, historical time normalization and interpretive text live elsewhere.

export const STEMS = [
  {hanja:'甲',ko:'갑',element:'wood',polarity:'yang'},
  {hanja:'乙',ko:'을',element:'wood',polarity:'yin'},
  {hanja:'丙',ko:'병',element:'fire',polarity:'yang'},
  {hanja:'丁',ko:'정',element:'fire',polarity:'yin'},
  {hanja:'戊',ko:'무',element:'earth',polarity:'yang'},
  {hanja:'己',ko:'기',element:'earth',polarity:'yin'},
  {hanja:'庚',ko:'경',element:'metal',polarity:'yang'},
  {hanja:'辛',ko:'신',element:'metal',polarity:'yin'},
  {hanja:'壬',ko:'임',element:'water',polarity:'yang'},
  {hanja:'癸',ko:'계',element:'water',polarity:'yin'}
];

export const BRANCHES = [
  {hanja:'子',ko:'자',element:'water'},
  {hanja:'丑',ko:'축',element:'earth'},
  {hanja:'寅',ko:'인',element:'wood'},
  {hanja:'卯',ko:'묘',element:'wood'},
  {hanja:'辰',ko:'진',element:'earth'},
  {hanja:'巳',ko:'사',element:'fire'},
  {hanja:'午',ko:'오',element:'fire'},
  {hanja:'未',ko:'미',element:'earth'},
  {hanja:'申',ko:'신',element:'metal'},
  {hanja:'酉',ko:'유',element:'metal'},
  {hanja:'戌',ko:'술',element:'earth'},
  {hanja:'亥',ko:'해',element:'water'}
];

export const ELEMENT_LABELS={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};

// Three-layer 여(餘氣)·중(中氣)·정(正氣) representation used by many Korean manse charts.
// This is intentionally named as a ruling/display table because hidden-stem tables vary by school.
export const BRANCH_RULING_STEMS=[
  {residual:8,middle:null,main:9}, // 子 壬 - 癸
  {residual:9,middle:7,main:5},   // 丑 癸 辛 己
  {residual:4,middle:2,main:0},   // 寅 戊 丙 甲
  {residual:0,middle:null,main:1}, // 卯 甲 - 乙
  {residual:1,middle:9,main:4},   // 辰 乙 癸 戊
  {residual:4,middle:6,main:2},   // 巳 戊 庚 丙
  {residual:2,middle:5,main:3},   // 午 丙 己 丁
  {residual:3,middle:1,main:5},   // 未 丁 乙 己
  {residual:4,middle:8,main:6},   // 申 戊 壬 庚
  {residual:6,middle:null,main:7}, // 酉 庚 - 辛
  {residual:7,middle:3,main:4},   // 戌 辛 丁 戊
  {residual:4,middle:0,main:8}    // 亥 戊 甲 壬
];
export const mod=(n,m)=>((n%m)+m)%m;

export function sexagenary(index){
  const i=mod(index,60);
  const stemIndex=i%10;
  const branchIndex=i%12;
  return {
    index:i,
    stemIndex,
    branchIndex,
    stem:STEMS[stemIndex],
    branch:BRANCHES[branchIndex],
    hanja:`${STEMS[stemIndex].hanja}${BRANCHES[branchIndex].hanja}`,
    korean:`${STEMS[stemIndex].ko}${BRANCHES[branchIndex].ko}`
  };
}

// 1984 is a 甲子 year. Caller decides whether the instant is before/after Li Chun.
export function yearPillar(year,{afterLiChun=true}={}){
  const effectiveYear=afterLiChun?year:year-1;
  return sexagenary(effectiveYear-1984);
}

// Month index: 0 寅, 1 卯 ... 10 子, 11 丑.
// The first month stem follows the traditional Five Tigers relation.
export function monthPillar(yearStemIndex,monthIndex){
  if(!Number.isInteger(monthIndex)||monthIndex<0||monthIndex>11) throw new RangeError('monthIndex must be 0..11');
  const firstStem=mod(2+2*mod(yearStemIndex,5),10);
  const stemIndex=mod(firstStem+monthIndex,10);
  const branchIndex=mod(2+monthIndex,12);
  const cycleIndex=[...Array(60).keys()].find(i=>i%10===stemIndex&&i%12===branchIndex);
  return sexagenary(cycleIndex);
}

const DAY_ANCHOR={year:2026,month:10,day:6,index:49}; // 癸丑, checked against KASI monthly calendar.
const DAY_MS=86400000;
const utcDayNumber=(year,month,day)=>Math.floor(Date.UTC(year,month-1,day)/DAY_MS);

export function dayPillar(year,month,day){
  const delta=utcDayNumber(year,month,day)-utcDayNumber(DAY_ANCHOR.year,DAY_ANCHOR.month,DAY_ANCHOR.day);
  return sexagenary(DAY_ANCHOR.index+delta);
}

export function nextCivilDate(year,month,day){
  const d=new Date(Date.UTC(year,month-1,day)+DAY_MS);
  return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};
}

// Boundary policy is deliberately explicit because 23:00-23:59 is a disputed convention.
export function effectiveDayDate({year,month,day,hour=0},{dayBoundary='midnight'}={}){
  if(dayBoundary==='zi-start'&&hour===23) return nextCivilDate(year,month,day);
  if(dayBoundary!=='midnight'&&dayBoundary!=='zi-start') throw new RangeError('dayBoundary must be midnight or zi-start');
  return {year,month,day};
}

// Civil-clock branch mapping: 子 23:00-00:59, 丑 01:00-02:59 ... 亥 21:00-22:59.
// Historical DST / longitude correction must be applied before calling this function.
export function hourBranchIndex(hour,minute=0){
  if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59) throw new RangeError('invalid time');
  return Math.floor(mod(hour*60+minute+60,1440)/120);
}

// Five Rats relation: day stem determines the stem of 子 hour.
export function hourPillar(dayStemIndex,branchIndex){
  const ziStem=mod(2*mod(dayStemIndex,5),10);
  const stemIndex=mod(ziStem+branchIndex,10);
  const cycleIndex=[...Array(60).keys()].find(i=>i%10===stemIndex&&i%12===branchIndex);
  return sexagenary(cycleIndex);
}

const ELEMENT_INDEX={wood:0,fire:1,earth:2,metal:3,water:4};
const TEN_GODS={
  same:{same:'비견',opposite:'겁재'},
  output:{same:'식신',opposite:'상관'},
  wealth:{same:'편재',opposite:'정재'},
  officer:{same:'편관',opposite:'정관'},
  resource:{same:'편인',opposite:'정인'}
};

export function tenGod(dayStemIndex,otherStemIndex){
  const day=STEMS[mod(dayStemIndex,10)];
  const other=STEMS[mod(otherStemIndex,10)];
  const d=ELEMENT_INDEX[day.element];
  const o=ELEMENT_INDEX[other.element];
  const distance=mod(o-d,5);
  const relation=['same','output','wealth','officer','resource'][distance];
  const polarity=day.polarity===other.polarity?'same':'opposite';
  return TEN_GODS[relation][polarity];
}

export function branchMainStemIndex(branchIndex){
  return BRANCH_RULING_STEMS[mod(branchIndex,12)].main;
}

export function branchTenGod(dayStemIndex,branchIndex){
  return tenGod(dayStemIndex,branchMainStemIndex(branchIndex));
}

export function branchRulingStems(dayStemIndex,branchIndex){
  const row=BRANCH_RULING_STEMS[mod(branchIndex,12)];
  return ['residual','middle','main'].map(position=>{
    const stemIndex=row[position];
    if(stemIndex==null) return {position,stem:null,tenGod:null};
    return {position,stemIndex,stem:STEMS[stemIndex],tenGod:tenGod(dayStemIndex,stemIndex)};
  });
}

// Counts only the visible 8 characters. It is not a strength/weakness score.
export function surfaceElementCounts(pillars){
  const counts={wood:0,fire:0,earth:0,metal:0,water:0};
  for(const pillar of pillars.filter(Boolean)){
    counts[pillar.stem.element]+=1;
    counts[pillar.branch.element]+=1;
  }
  return counts;
}
