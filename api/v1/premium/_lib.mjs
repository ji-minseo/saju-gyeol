import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
import {calculateSaju} from '../../../src/engine/calculator.mjs';
import {buildPremiumReportV1,PREMIUM_REPORT_POLICY} from '../../../src/premium/report-v1.mjs';

export const PRICE=5900;
export const PRODUCT_ID=PREMIUM_REPORT_POLICY.productId;
export const PRODUCT_NAME='사주결 정밀 리포트';

export const corsHeaders=req=>{
  const allowed=process.env.ALLOWED_ORIGIN||'https://saju.everytinytool.com';
  const origin=req.headers.origin||'';
  return {
    'Access-Control-Allow-Origin':origin===allowed?origin:allowed,
    'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'Vary':'Origin'
  };
};

export const sendJson=(res,status,body,extra={})=>{
  res.statusCode=status;
  for(const [key,value] of Object.entries({...corsHeaders(res.req),...extra})) res.setHeader(key,value);
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

const base64url=value=>Buffer.from(value).toString('base64url');

const signatureFor=part=>{
  const secret=process.env.PREMIUM_SIGNING_SECRET;
  if(!secret) throw Object.assign(new Error('premium signing secret is not configured'),{status:503});
  return createHmac('sha256',secret).update(part).digest('base64url');
};

export const issueToken=payload=>{
  const part=base64url(JSON.stringify(payload));
  return part+'.'+signatureFor(part);
};

export const verifyToken=token=>{
  const [part,signature]=String(token||'').split('.');
  if(!part||!signature) throw Object.assign(new Error('invalid token'),{status:400});
  const expected=signatureFor(part);
  const a=Buffer.from(signature);
  const b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b)) throw Object.assign(new Error('invalid token'),{status:400});
  const payload=JSON.parse(Buffer.from(part,'base64url').toString('utf8'));
  if(!payload.exp||payload.exp<Math.floor(Date.now()/1000)) throw Object.assign(new Error('expired token'),{status:400});
  return payload;
};

export const readJson=req=>new Promise((resolve,reject)=>{
  let body='';
  req.on('data',chunk=>{
    body+=chunk;
    if(body.length>100_000){
      reject(Object.assign(new Error('request body too large'),{status:413}));
      req.destroy();
    }
  });
  req.on('end',()=>{
    try{resolve(body?JSON.parse(body):{});}
    catch{reject(Object.assign(new Error('invalid json'),{status:400}));}
  });
  req.on('error',reject);
});

export const normalizeReportRequest=value=>({
  birthDate:String(value?.birthDate||''),
  birthTime:value?.birthTime?String(value.birthTime):null,
  sex:value?.sex==='female'||value?.sex==='male'?value.sex:null,
  dayBoundary:value?.dayBoundary==='zi-start'?'zi-start':'midnight'
});

export const calculateFromRequest=request=>{
  const result=calculateSaju({
    birthDate:request.birthDate,
    birthTime:request.birthTime,
    sex:request.sex
  },{dayBoundary:request.dayBoundary});
  if(result.status==='needs-birth-time') throw Object.assign(new Error('birth time required for this date'),{status:400});
  return result;
};

const seoulDateString=()=>{
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',
    year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(new Date());
  const byType=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return byType.year+'-'+byType.month+'-'+byType.day;
};

export const buildReport=request=>buildPremiumReportV1(
  calculateFromRequest(request),
  {today:seoulDateString()}
);

export const createPaymentId=()=>('saju'+randomUUID().replaceAll('-','').slice(0,28));

export const getPortOnePayment=async paymentId=>{
  const secret=process.env.PORTONE_API_SECRET;
  if(!secret) throw Object.assign(new Error('PortOne API secret is not configured'),{status:503});
  const response=await fetch(
    'https://api.portone.io/payments/'+encodeURIComponent(paymentId),
    {
      method:'GET',
      headers:{'Authorization':'PortOne '+secret}
    }
  );
  const data=await response.json();
  if(!response.ok){
    throw Object.assign(new Error(data?.message||'payment lookup failed'),{
      status:response.status,
      code:data?.type||'PORTONE_PAYMENT_LOOKUP_FAILED'
    });
  }
  return data;
};

export const handleOptions=(req,res)=>{
  if(req.method!=='OPTIONS') return false;
  res.statusCode=204;
  for(const [key,value] of Object.entries(corsHeaders(req))) res.setHeader(key,value);
  res.end();
  return true;
};

export const fail=(req,res,error)=>{
  const status=Number(error?.status)||400;
  res.statusCode=status;
  for(const [key,value] of Object.entries(corsHeaders(req))) res.setHeader(key,value);
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify({
    message:String(error?.message||'request failed'),
    code:error?.code||'PREMIUM_REQUEST_FAILED'
  }));
};
