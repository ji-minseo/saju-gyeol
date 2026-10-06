import {KoreanLunarCalendar} from '../vendor/korean-lunar-calendar.mjs';

export const LUNAR_SUPPORT={minYear:1912,maxYear:2050,standard:'Korean lunar calendar / KASI-based table'};

const int=(value,name)=>{
  const n=Number(value);
  if(!Number.isInteger(n)) throw new TypeError(`${name} must be an integer`);
  return n;
};

const iso=({year,month,day})=>`${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

export function lunarToSolarDate({year,month,day,isLeapMonth=false}){
  const lunarYear=int(year,'lunar year');
  const lunarMonth=int(month,'lunar month');
  const lunarDay=int(day,'lunar day');
  if(lunarYear<LUNAR_SUPPORT.minYear||lunarYear>LUNAR_SUPPORT.maxYear){
    throw new RangeError(`lunar calendar supports ${LUNAR_SUPPORT.minYear}..${LUNAR_SUPPORT.maxYear}`);
  }
  const calendar=new KoreanLunarCalendar();
  const ok=calendar.setLunarDate(lunarYear,lunarMonth,lunarDay,Boolean(isLeapMonth));
  if(!ok){
    throw new RangeError(isLeapMonth
      ?'invalid Korean lunar date or this month is not a leap month'
      :'invalid Korean lunar date');
  }
  const solar=calendar.getSolarCalendar();
  return {
    solarDate:iso(solar),
    solar,
    lunar:{year:lunarYear,month:lunarMonth,day:lunarDay,isLeapMonth:Boolean(isLeapMonth)},
    source:LUNAR_SUPPORT.standard
  };
}

export function solarToLunarDate(value){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));
  if(!match) throw new TypeError('solar date must be YYYY-MM-DD');
  const calendar=new KoreanLunarCalendar();
  const ok=calendar.setSolarDate(Number(match[1]),Number(match[2]),Number(match[3]));
  if(!ok) throw new RangeError('solar date is outside Korean lunar conversion range');
  const lunar=calendar.getLunarCalendar();
  return {
    year:lunar.year,
    month:lunar.month,
    day:lunar.day,
    isLeapMonth:Boolean(lunar.intercalation)
  };
}
