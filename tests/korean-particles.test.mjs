import test from 'node:test';
import assert from 'node:assert/strict';
import {
  withSubject,withComitative,withCopulaRa
} from '../src/content/korean-particles.mjs';

test('Korean subject particles follow 받침',()=>{
  assert.equal(withSubject('루틴'),'루틴이');
  assert.equal(withSubject('독립'),'독립이');
  assert.equal(withSubject('지민'),'지민이');
  assert.equal(withSubject('관계'),'관계가');
  assert.equal(withSubject('정재'),'정재가');
});

test('Korean 과/와 particles follow 받침',()=>{
  assert.equal(withComitative('루틴'),'루틴과');
  assert.equal(withComitative('독립'),'독립과');
  assert.equal(withComitative('분배'),'분배와');
  assert.equal(withComitative('체계'),'체계와');
});

test('Korean 이라/라 copula follows 받침',()=>{
  assert.equal(withCopulaRa('식신'),'식신이라');
  assert.equal(withCopulaRa('상관'),'상관이라');
  assert.equal(withCopulaRa('겁재'),'겁재라');
  assert.equal(withCopulaRa('편재'),'편재라');
  assert.equal(withCopulaRa('정재'),'정재라');
});
