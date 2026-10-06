export const hasFinalConsonant=text=>{
  const chars=[...String(text??'').trim()];
  const last=chars.at(-1);
  if(!last) return false;
  const code=last.charCodeAt(0);
  if(code<0xac00||code>0xd7a3) return false;
  return (code-0xac00)%28!==0;
};

export const subjectParticle=text=>hasFinalConsonant(text)?'이':'가';
export const comitativeParticle=text=>hasFinalConsonant(text)?'과':'와';
export const copulaRa=text=>hasFinalConsonant(text)?'이라':'라';

export const withSubject=text=>`${text}${subjectParticle(text)}`;
export const withComitative=text=>`${text}${comitativeParticle(text)}`;
export const withCopulaRa=text=>`${text}${copulaRa(text)}`;
