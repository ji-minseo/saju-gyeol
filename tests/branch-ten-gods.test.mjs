import test from 'node:test';
import assert from 'node:assert/strict';
import {branchMainStemIndex,branchTenGod,branchRulingStems,STEMS} from '../src/engine/rules.mjs';

test('branch main qi follows the twelve-branch ruling table',()=>{
  const expected=['癸','己','甲','乙','戊','丙','丁','己','庚','辛','戊','壬'];
  assert.deepEqual(expected.map((_,i)=>STEMS[branchMainStemIndex(i)].hanja),expected);
});

test('Ding day master branch representative ten gods match main qi relations',()=>{
  const ding=3;
  assert.equal(branchTenGod(ding,11),'정관');
  assert.equal(branchTenGod(ding,10),'상관');
  assert.equal(branchTenGod(ding,1),'식신');
  assert.equal(branchTenGod(ding,5),'겁재');
});

test('three-layer ruling stems preserve residual-middle-main positions',()=>{
  const ding=3;
  const hai=branchRulingStems(ding,11);
  assert.deepEqual(hai.map(x=>x.stem?.hanja??null),['戊','甲','壬']);
  assert.deepEqual(hai.map(x=>x.tenGod),['상관','정인','정관']);
  const zi=branchRulingStems(ding,0);
  assert.deepEqual(zi.map(x=>x.stem?.hanja??null),['壬',null,'癸']);
});
