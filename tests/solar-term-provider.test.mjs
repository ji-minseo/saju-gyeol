import test from 'node:test';
import assert from 'node:assert/strict';
import {getJieTermsForYear,SOLAR_TERM_PROVIDER_METADATA} from '../src/engine/solar-term-provider.mjs';
import {JIE_2026} from '../src/engine/data/solar-terms-2026.mjs';

test('astronomical provider reproduces every KASI 2026 jie boundary to the published minute',()=>{
  const generated=getJieTermsForYear(2026);
  assert.equal(generated.length,JIE_2026.length);
  for(let i=0;i<JIE_2026.length;i++){
    const actual=generated[i];
    const expected=JIE_2026[i];
    assert.equal(actual.name,expected.name);
    assert.equal(actual.monthIndex,expected.monthIndex);
    const deltaSeconds=Math.abs(actual.epochMs-expected.epochMs)/1000;
    assert.ok(
      deltaSeconds<90,
      `${expected.name}: astronomy provider differs from KASI fixture by ${deltaSeconds.toFixed(1)} seconds`
    );
  }
});

test('provider spans the full v0.1 year range and preserves chronological boundaries',()=>{
  for(const year of [1970,1990,2000,2030,2100]){
    const terms=getJieTermsForYear(year);
    assert.equal(terms.length,13);
    for(let i=1;i<terms.length;i++) assert.ok(terms[i].epochMs>terms[i-1].epochMs);
    assert.equal(terms.find(t=>t.name==='입춘').monthIndex,0);
  }
});

test('provider records the astronomical method used for auditability',()=>{
  assert.equal(SOLAR_TERM_PROVIDER_METADATA.packageVersion,'2.1.19');
  assert.match(SOLAR_TERM_PROVIDER_METADATA.method,/SearchSunLongitude/);
});
