import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STEMS,BRANCHES,BRANCH_RULING_STEMS,HIDDEN_STEM_POLICY,
  tenGod,branchRulingStems
} from '../src/engine/rules.mjs';
import {
  TWELVE_STAGES,BRANCH_RELATION_POLICY,twelveStage,branchRelations,dayVoid
} from '../src/engine/derived-facts.mjs';
import {daeunDirection,calculateDaeun} from '../src/engine/fortune-cycles.mjs';
import {resolveSeoulCivilTime} from '../src/engine/korea-time.mjs';

const TEN_GODS_MATRIX=[
  ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'],
  ['겁재','비견','상관','식신','정재','편재','정관','편관','정인','편인'],
  ['편인','정인','비견','겁재','식신','상관','편재','정재','편관','정관'],
  ['정인','편인','겁재','비견','상관','식신','정재','편재','정관','편관'],
  ['편관','정관','편인','정인','비견','겁재','식신','상관','편재','정재'],
  ['정관','편관','정인','편인','겁재','비견','상관','식신','정재','편재'],
  ['편재','정재','편관','정관','편인','정인','비견','겁재','식신','상관'],
  ['정재','편재','정관','편관','정인','편인','겁재','비견','상관','식신'],
  ['식신','상관','편재','정재','편관','정관','편인','정인','비견','겁재'],
  ['상관','식신','정재','편재','정관','편관','정인','편인','겁재','비견']
];

const TWELVE_STAGE_MATRIX=[
  ['목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양','장생'],
  ['병','쇠','제왕','건록','관대','목욕','장생','양','태','절','묘','사'],
  ['태','양','장생','목욕','관대','건록','제왕','쇠','병','사','묘','절'],
  ['절','묘','사','병','쇠','제왕','건록','관대','목욕','장생','양','태'],
  ['태','양','장생','목욕','관대','건록','제왕','쇠','병','사','묘','절'],
  ['절','묘','사','병','쇠','제왕','건록','관대','목욕','장생','양','태'],
  ['사','묘','절','태','양','장생','목욕','관대','건록','제왕','쇠','병'],
  ['장생','양','태','절','묘','사','병','쇠','제왕','건록','관대','목욕'],
  ['제왕','쇠','병','사','묘','절','태','양','장생','목욕','관대','건록'],
  ['건록','관대','목욕','장생','양','태','절','묘','사','병','쇠','제왕']
];

const HIDDEN_STEMS=[
  ['壬',null,'癸'],
  ['癸','辛','己'],
  ['戊','丙','甲'],
  ['甲',null,'乙'],
  ['乙','癸','戊'],
  ['戊','庚','丙'],
  ['丙','己','丁'],
  ['丁','乙','己'],
  ['戊','壬','庚'],
  ['庚',null,'辛'],
  ['辛','丁','戊'],
  ['戊','甲','壬']
];

const PAIRS={
  combine:['子丑','寅亥','卯戌','辰酉','巳申','午未'],
  clash:['子午','丑未','寅申','卯酉','辰戌','巳亥'],
  harm:['子未','丑午','寅巳','卯辰','申亥','酉戌'],
  break:['子酉','丑辰','寅亥','卯午','巳申','未戌'],
  punishment:['子卯','丑未','丑戌','寅巳','寅申','巳申','未戌']
};

const relationPairs=type=>{
  const found=[];
  for(let a=0;a<12;a++){
    for(let b=a+1;b<12;b++){
      const items=branchRelations([{key:'a',branchIndex:a},{key:'b',branchIndex:b}]);
      if(items.some(item=>item.type===type)) found.push(BRANCHES[a].hanja+BRANCHES[b].hanja);
    }
  }
  return found.sort();
};

test('ten gods 10x10 matrix matches the locked reference table',()=>{
  assert.equal(TEN_GODS_MATRIX.length,10);
  for(let day=0;day<10;day++){
    for(let other=0;other<10;other++){
      assert.equal(
        tenGod(day,other),
        TEN_GODS_MATRIX[day][other],
        `${STEMS[day].hanja} day master vs ${STEMS[other].hanja}`
      );
    }
  }
});

test('selected hidden-stem convention is explicit and all 12 branches are locked',()=>{
  assert.equal(HIDDEN_STEM_POLICY.scheme,'three-layer-initial-middle-main');
  assert.equal(HIDDEN_STEM_POLICY.schoolVariance,true);
  for(let branch=0;branch<12;branch++){
    const actual=[
      BRANCH_RULING_STEMS[branch].residual,
      BRANCH_RULING_STEMS[branch].middle,
      BRANCH_RULING_STEMS[branch].main
    ].map(index=>index==null?null:STEMS[index].hanja);
    assert.deepEqual(actual,HIDDEN_STEMS[branch],BRANCHES[branch].hanja);
  }
});

test('hidden stems always derive their ten god from the same day-master matrix',()=>{
  for(let day=0;day<10;day++){
    for(let branch=0;branch<12;branch++){
      for(const layer of branchRulingStems(day,branch)){
        if(layer.stemIndex==null){
          assert.equal(layer.tenGod,null);
        }else{
          assert.equal(layer.tenGod,TEN_GODS_MATRIX[day][layer.stemIndex]);
        }
      }
    }
  }
});

test('twelve stages match the full 10 stems x 12 branches reference matrix',()=>{
  assert.deepEqual(TWELVE_STAGES,['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양']);
  for(let stem=0;stem<10;stem++){
    for(let branch=0;branch<12;branch++){
      assert.equal(
        twelveStage(stem,branch).name,
        TWELVE_STAGE_MATRIX[stem][branch],
        `${STEMS[stem].hanja} at ${BRANCHES[branch].hanja}`
      );
    }
  }
});

test('all 60 day pillars map to the six locked void pairs',()=>{
  const expected=[
    ['戌','亥'],
    ['申','酉'],
    ['午','未'],
    ['辰','巳'],
    ['寅','卯'],
    ['子','丑']
  ];
  for(let cycle=0;cycle<60;cycle++){
    assert.deepEqual(
      dayVoid(cycle).branches.map(x=>x.hanja),
      expected[Math.floor(cycle/10)],
      `cycle ${cycle}`
    );
  }
});

test('branch pair relation sets have no accidental additions or omissions',()=>{
  assert.equal(BRANCH_RELATION_POLICY.punishment,'pairwise-links');
  assert.equal(BRANCH_RELATION_POLICY.threeHarmony,'requires-all-three');
  for(const [type,expected] of Object.entries(PAIRS)){
    assert.deepEqual(relationPairs(type),[...expected].sort(),type);
  }
});

test('self-punishment is limited to 辰 午 酉 亥 duplicate branches',()=>{
  const expected=new Set(['辰','午','酉','亥']);
  for(let branch=0;branch<12;branch++){
    const items=branchRelations([
      {key:'a',branchIndex:branch},
      {key:'b',branchIndex:branch}
    ]);
    assert.equal(
      items.some(x=>x.type==='self-punishment'),
      expected.has(BRANCHES[branch].hanja),
      BRANCHES[branch].hanja
    );
  }
});

test('three-harmony requires all three branches, not only two',()=>{
  const full=branchRelations([
    {key:'a',branchIndex:8},
    {key:'b',branchIndex:0},
    {key:'c',branchIndex:4}
  ]);
  assert.ok(full.some(x=>x.type==='three-harmony'&&x.name==='신자진 수국'));

  const partial=branchRelations([
    {key:'a',branchIndex:8},
    {key:'b',branchIndex:0}
  ]);
  assert.equal(partial.some(x=>x.type==='three-harmony'),false);
});

test('daeun direction is exhaustive for every year stem and both sexes',()=>{
  for(let stem=0;stem<10;stem++){
    const yin=STEMS[stem].polarity==='yin';
    assert.equal(daeunDirection(stem,'male'),yin?'reverse':'forward');
    assert.equal(daeunDirection(stem,'female'),yin?'forward':'reverse');
  }
});

test('daeun 3-days-per-year conversion locks to month precision around 2026 Hanlu and Bailu',()=>{
  const birthInstantMs=Date.parse('2026-10-06T10:10:00+09:00');

  const forward=calculateDaeun({
    birthYear:2026,
    birthInstantMs,
    yearStemIndex:2,
    monthCycleIndex:33,
    sex:'male',
    count:1
  });
  assert.equal(forward.status,'ok');
  assert.equal(forward.direction,'forward');
  assert.equal(forward.boundary.name,'한로');
  assert.equal(forward.startAgeMonths,9);

  const reverse=calculateDaeun({
    birthYear:2026,
    birthInstantMs,
    yearStemIndex:2,
    monthCycleIndex:33,
    sex:'female',
    count:1
  });
  assert.equal(reverse.status,'ok');
  assert.equal(reverse.direction,'reverse');
  assert.equal(reverse.boundary.name,'백로');
  assert.equal(reverse.startAgeMonths,114);
});

test('1988 Seoul DST spring gap and autumn repeat are detected instead of guessed',()=>{
  const skipped=resolveSeoulCivilTime({year:1988,month:5,day:8,hour:2,minute:30});
  assert.equal(skipped.status,'nonexistent');
  assert.equal(skipped.matches.length,0);

  const repeated=resolveSeoulCivilTime({year:1988,month:10,day:9,hour:2,minute:30});
  assert.equal(repeated.status,'ambiguous');
  assert.deepEqual(repeated.matches.map(x=>x.offsetMinutes),[600,540]);
});
