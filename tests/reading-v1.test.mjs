import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildReading} from '../src/content/reading-v1.mjs';

test('reading v1 returns concrete sections with evidence',()=>{
  const result=calculateSaju({birthDate:'2026-10-06',birthTime:'10:10',sex:'female'});
  const reading=buildReading(result);
  for(const key of ['temperament','relationship','career','money']){
    assert.ok(reading[key].title.length>5);
    assert.ok(reading[key].body.length>40);
    assert.ok(reading[key].evidence.length>0);
  }
});

test('reading v1 does not emit guaranteed fortune language',()=>{
  const result=calculateSaju({birthDate:'2001-06-12',birthTime:'14:30',sex:'male'});
  const text=JSON.stringify(buildReading(result));
  for(const forbidden of ['무조건','반드시 부자','절대적으로','질병','이혼합니다']){
    assert.equal(text.includes(forbidden),false);
  }
});
