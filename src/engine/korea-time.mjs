const SEOUL_ZONE='Asia/Seoul';
const MINUTE=60000;

const formatter=new Intl.DateTimeFormat('en-CA-u-ca-gregory',{
  timeZone:SEOUL_ZONE,
  year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',second:'2-digit',
  hourCycle:'h23',
  timeZoneName:'longOffset'
});

const partsObject=epochMs=>{
  const out={};
  for(const part of formatter.formatToParts(new Date(epochMs))){
    if(part.type!=='literal') out[part.type]=part.value;
  }
  return out;
};

const parseOffset=value=>{
  if(value==='GMT'||value==='UTC') return 0;
  const match=/^(?:GMT|UTC)([+-])(\d{2}):(\d{2})$/.exec(value);
  if(!match) throw new Error(`Unsupported time-zone offset: ${value}`);
  const sign=match[1]==='+'?1:-1;
  return sign*(Number(match[2])*60+Number(match[3]));
};

export function offsetMinutesAt(epochMs){
  return parseOffset(partsObject(epochMs).timeZoneName);
}

export function seoulPartsAt(epochMs){
  const p=partsObject(epochMs);
  return {
    year:Number(p.year),month:Number(p.month),day:Number(p.day),
    hour:Number(p.hour),minute:Number(p.minute),second:Number(p.second)
  };
}

const sameCivil=(a,b)=>
  a.year===b.year&&a.month===b.month&&a.day===b.day&&
  a.hour===b.hour&&a.minute===b.minute&&(b.second??0)===a.second;

const assertCivil=input=>{
  const values=['year','month','day','hour','minute'].map(k=>input[k]);
  if(values.some(v=>!Number.isInteger(v))) throw new TypeError('civil time fields must be integers');
  if(input.year<1970||input.year>2100) throw new RangeError('v0.1 civil-time support is 1970..2100');
  if(input.month<1||input.month>12||input.day<1||input.day>31||input.hour<0||input.hour>23||input.minute<0||input.minute>59){
    throw new RangeError('invalid civil time');
  }
};

// Converts a Korean wall-clock reading to possible UTC instants.
// 0 matches = skipped local time (e.g. spring DST transition)
// 1 match   = normal time
// 2 matches = repeated local time (fall DST transition)
// It intentionally does not apply longitude / true-solar-time correction.
export function resolveSeoulCivilTime(input){
  assertCivil(input);
  const civil={...input,second:input.second??0};
  const naive=Date.UTC(civil.year,civil.month-1,civil.day,civil.hour,civil.minute,civil.second);
  const offsets=new Set([480,510,540,600]);

  for(const hours of [-48,-36,-24,-12,0,12,24,36,48]){
    offsets.add(offsetMinutesAt(naive+hours*60*60*1000));
  }

  const found=new Map();
  for(const offsetMinutes of offsets){
    const epochMs=naive-offsetMinutes*MINUTE;
    if(sameCivil(seoulPartsAt(epochMs),civil)){
      found.set(epochMs,{epochMs,utcIso:new Date(epochMs).toISOString(),offsetMinutes});
    }
  }

  const matches=[...found.values()].sort((a,b)=>a.epochMs-b.epochMs);
  return {
    zone:SEOUL_ZONE,
    civil,
    status:matches.length===0?'nonexistent':matches.length===1?'valid':'ambiguous',
    matches
  };
}

export const KOREA_TIME_POLICY={
  zone:SEOUL_ZONE,
  source:'IANA tz database via Intl.DateTimeFormat',
  longitudeCorrection:false,
  equationOfTime:false
};
