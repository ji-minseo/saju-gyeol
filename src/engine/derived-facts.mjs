import {BRANCHES,STEMS,mod} from './rules.mjs';

export const TWELVE_STAGES=['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const STAGE_START_BRANCH=[11,6,2,9,2,9,5,0,8,3];

export function twelveStage(dayStemIndex,branchIndex){
  const stem=STEMS[mod(dayStemIndex,10)];
  const start=STAGE_START_BRANCH[mod(dayStemIndex,10)];
  const stageIndex=stem.polarity==='yang'
    ?mod(branchIndex-start,12)
    :mod(start-branchIndex,12);
  return {name:TWELVE_STAGES[stageIndex],stageIndex};
}

const pairKey=(a,b)=>a<b?`${a}-${b}`:`${b}-${a}`;
const PAIR_RELATIONS={
  combine:new Set(['0-1','2-11','3-10','4-9','5-8','6-7']),
  clash:new Set(['0-6','1-7','2-8','3-9','4-10','5-11']),
  harm:new Set(['0-7','1-6','2-5','3-4','8-11','9-10']),
  break:new Set(['0-9','1-4','2-11','3-6','5-8','7-10']),
  punishment:new Set(['0-3','1-7','1-10','2-5','2-8','5-8','7-10'])
};
const TYPE_KO={combine:'육합',clash:'충',harm:'해',break:'파',punishment:'형'};
const SELF_PUNISHMENT=new Set([4,6,9,11]);
const THREE_HARMONY=[
  {branches:[8,0,4],element:'water',name:'신자진 수국'},
  {branches:[2,6,10],element:'fire',name:'인오술 화국'},
  {branches:[5,9,1],element:'metal',name:'사유축 금국'},
  {branches:[11,3,7],element:'wood',name:'해묘미 목국'}
];

export function branchRelations(entries){
  const usable=entries.filter(x=>x&&Number.isInteger(x.branchIndex));
  const relations=[];
  for(let i=0;i<usable.length;i++){
    for(let j=i+1;j<usable.length;j++){
      const a=usable[i],b=usable[j];
      const key=pairKey(a.branchIndex,b.branchIndex);
      for(const [type,set] of Object.entries(PAIR_RELATIONS)){
        if(set.has(key)) relations.push({
          type,label:TYPE_KO[type],
          pillars:[a.key,b.key],
          branches:[BRANCHES[a.branchIndex].hanja,BRANCHES[b.branchIndex].hanja]
        });
      }
      if(a.branchIndex===b.branchIndex&&SELF_PUNISHMENT.has(a.branchIndex)){
        relations.push({
          type:'self-punishment',label:'자형',
          pillars:[a.key,b.key],
          branches:[BRANCHES[a.branchIndex].hanja,BRANCHES[b.branchIndex].hanja]
        });
      }
    }
  }
  const present=new Set(usable.map(x=>x.branchIndex));
  for(const group of THREE_HARMONY){
    if(group.branches.every(x=>present.has(x))){
      relations.push({
        type:'three-harmony',label:'삼합',
        branches:group.branches.map(x=>BRANCHES[x].hanja),
        element:group.element,name:group.name
      });
    }
  }
  return relations;
}

const VOID_BRANCHES=[
  [10,11],[8,9],[6,7],[4,5],[2,3],[0,1]
];

export function dayVoid(dayCycleIndex,entries=[]){
  const xunIndex=Math.floor(mod(dayCycleIndex,60)/10);
  const branchIndices=VOID_BRANCHES[xunIndex];
  const occupied=entries
    .filter(x=>x&&branchIndices.includes(x.branchIndex))
    .map(x=>x.key);
  return {
    basis:'day-pillar-xun',
    xunIndex,
    branches:branchIndices.map(i=>({index:i,hanja:BRANCHES[i].hanja,korean:BRANCHES[i].ko})),
    occupiedPillars:occupied
  };
}
