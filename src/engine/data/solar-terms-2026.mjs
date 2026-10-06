// 2026 solar terms published by Korea Astronomy and Space Science Institute (KASI).
// Source: https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2026
// KASI lists these as Korean civil clock times. In 2026 Korea is UTC+09:00.
//
// This is a regression dataset, not the final all-years term provider.
// For saju month boundaries only the 12 節 (jie) terms are used.

const term=(name,monthIndex,localIso)=>({
  name,
  monthIndex,
  localIso,
  epochMs:Date.parse(localIso)
});

export const JIE_2026=[
  // Carry-in boundary from KASI 2025, needed for 2026-01-01 through 소한.
  term('대설',10,'2025-12-07T06:05:00+09:00'),
  term('소한',11,'2026-01-05T17:23:00+09:00'),
  term('입춘',0,'2026-02-04T05:02:00+09:00'),
  term('경칩',1,'2026-03-05T22:59:00+09:00'),
  term('청명',2,'2026-04-05T03:40:00+09:00'),
  term('입하',3,'2026-05-05T20:49:00+09:00'),
  term('망종',4,'2026-06-06T00:48:00+09:00'),
  term('소서',5,'2026-07-07T10:57:00+09:00'),
  term('입추',6,'2026-08-07T20:43:00+09:00'),
  term('백로',7,'2026-09-07T23:41:00+09:00'),
  term('한로',8,'2026-10-08T15:29:00+09:00'),
  term('입동',9,'2026-11-07T18:52:00+09:00'),
  term('대설',10,'2026-12-07T11:53:00+09:00')
];

export function monthIndexAtInstant(epochMs,terms=JIE_2026){
  let current=null;
  for(const t of terms){
    if(epochMs<t.epochMs) break;
    current=t.monthIndex;
  }
  return current;
}

export function liChunReachedAt(epochMs,terms=JIE_2026){
  const liChun=terms.find(t=>t.name==='입춘');
  if(!liChun) throw new Error('Li Chun boundary is missing');
  return epochMs>=liChun.epochMs;
}

export const SOLAR_TERM_DATA_2026={
  source:'KASI calendar data 2026 + 2025 carry-in boundary',
  sourceUrl:'https://astro.kasi.re.kr/kor/life/post/calendarData?search_year=2026',
  zone:'Asia/Seoul',
  precision:'minute',
  terms:JIE_2026
};
