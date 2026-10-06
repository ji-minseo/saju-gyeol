import test from 'node:test';
import assert from 'node:assert/strict';
import {twelveStage,branchRelations,dayVoid} from '../src/engine/derived-facts.mjs';
import {daeunDirection,calculateDaeun} from '../src/engine/fortune-cycles.mjs';

test('Ding day master twelve stages match the standard growth cycle',()=>{
  assert.equal(twelveStage(3,5).name,'제왕'); // 巳
  assert.equal(twelveStage(3,1).name,'묘');   // 丑
  assert.equal(twelveStage(3,10).name,'양');  // 戌
  assert.equal(twelveStage(3,11).name,'태');  // 亥
});

test('branch relations detect Si-Hai clash and Chou-Xu punishment without interpretation',()=>{
  const items=branchRelations([
    {key:'year',branchIndex:11},
    {key:'month',branchIndex:10},
    {key:'day',branchIndex:1},
    {key:'hour',branchIndex:5}
  ]);
  assert.ok(items.some(x=>x.type==='clash'&&x.branches.join('')==='亥巳'));
  assert.ok(items.some(x=>x.type==='punishment'&&x.branches.join('')==='戌丑'));
});

test('Ding-Chou day belongs to Jia-Xu xun with Shen-You void',()=>{
  const info=dayVoid(13,[
    {key:'year',branchIndex:8},
    {key:'month',branchIndex:10},
    {key:'hour',branchIndex:9}
  ]);
  assert.deepEqual(info.branches.map(x=>x.hanja),['申','酉']);
  assert.deepEqual(info.occupiedPillars,['year','hour']);
});

test('daeun direction follows year-stem yin-yang and sex',()=>{
  assert.equal(daeunDirection(0,'male'),'forward');
  assert.equal(daeunDirection(0,'female'),'reverse');
  assert.equal(daeunDirection(1,'female'),'forward');
  assert.equal(daeunDirection(1,'male'),'reverse');
});

test('forward daeun advances one sexagenary pillar from the natal month',()=>{
  const result=calculateDaeun({
    birthYear:2025,
    birthInstantMs:Date.parse('2025-10-15T03:00:00Z'),
    yearStemIndex:1,
    monthCycleIndex:22,
    sex:'female',
    count:3
  });
  assert.equal(result.status,'ok');
  assert.equal(result.direction,'forward');
  assert.deepEqual(result.cycles.map(x=>x.pillar.hanja),['丁亥','戊子','己丑']);
  assert.ok(result.startAgeYearsRounded>=0&&result.startAgeYearsRounded<=10);
});
