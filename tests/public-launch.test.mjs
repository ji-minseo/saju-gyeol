import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('public pages are indexable and canonicalized',async()=>{
  const home=await readFile('site/index.html','utf8');
  const method=await readFile('site/methodology/index.html','utf8');

  assert.match(home,/name="robots" content="index,follow,max-image-preview:large"/);
  assert.match(home,/rel="canonical" href="https:\/\/saju\.everytinytool\.com\/"/);
  assert.doesNotMatch(home,/noindex/i);

  assert.match(method,/name="robots" content="index,follow,max-image-preview:large"/);
  assert.match(method,/rel="canonical" href="https:\/\/saju\.everytinytool\.com\/methodology\/"/);
  assert.doesNotMatch(method,/noindex/i);
});

test('404 remains excluded from search',async()=>{
  const page=await readFile('site/404.html','utf8');
  assert.match(page,/name="robots" content="noindex"/);
});

test('robots and sitemap expose only public canonical pages',async()=>{
  const robots=await readFile('site/robots.txt','utf8');
  const sitemap=await readFile('site/sitemap.xml','utf8');

  assert.match(robots,/User-agent: \*/);
  assert.match(robots,/Allow: \//);
  assert.match(robots,/Sitemap: https:\/\/saju\.everytinytool\.com\/sitemap\.xml/);

  assert.match(sitemap,/https:\/\/saju\.everytinytool\.com\/<\/loc>/);
  assert.match(sitemap,/https:\/\/saju\.everytinytool\.com\/methodology\/<\/loc>/);
  assert.doesNotMatch(sitemap,/404/);
});

test('homepage exposes social metadata and structured app data',async()=>{
  const home=await readFile('site/index.html','utf8');
  for(const required of [
    'property="og:title"',
    'property="og:description"',
    'property="og:url"',
    'property="og:image"',
    'name="twitter:card"',
    'application/ld+json',
    '"@type":"WebApplication"'
  ]){
    assert.ok(home.includes(required),required);
  }
});
