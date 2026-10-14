
import {calculateSaju} from '../src/engine/calculator.mjs';
import {buildPremiumReportV1,PREMIUM_REPORT_POLICY} from '../src/premium/report-v1.mjs';

const PRICE=5900;
const PRODUCT_ID=PREMIUM_REPORT_POLICY.productId;
const PRODUCT_NAME='사주결 정밀 리포트';

const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{
  status,
  headers:{'content-type':'application/json; charset=utf-8',...headers}
});

const corsHeaders=(request,env)=>{
  const origin=request.headers.get('origin')||'';
  const allowed=env.ALLOWED_ORIGIN||'https://saju.everytinytool.com';
  return {
    'access-control-allow-origin':origin===allowed?origin:allowed,
    'access-control-allow-methods':'GET,POST,OPTIONS',
    'access-control-allow-headers':'content-type',
    'vary':'Origin'
  };
};

const base64url=bytes=>{
  let binary='';
  for(const byte of bytes) binary+=String.fromCharCode(byte);
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
};

const encodePayload=value=>base64url(new TextEncoder().encode(JSON.stringify(value)));

const decodePayload=value=>{
  const padded=value.replaceAll('-','+').replaceAll('_','/')+'='.repeat((4-value.length%4)%4);
  const binary=atob(padded);
  const bytes=Uint8Array.from(binary,ch=>ch.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};

const importSigningKey=secret=>crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(secret),
  {name:'HMAC',hash:'SHA-256'},
  false,
  ['sign','verify']
);

const signPart=async(part,secret)=>{
  const key=await importSigningKey(secret);
  const signature=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(part));
  return base64url(new Uint8Array(signature));
};

const issueToken=async(payload,secret)=>{
  const part=encodePayload(payload);
  const signature=await signPart(part,secret);
  return part+'.'+signature;
};

const verifyToken=async(token,secret)=>{
  if(!token||!secret) throw new Error('invalid token');
  const [part,signature]=String(token).split('.');
  if(!part||!signature) throw new Error('invalid token');
  const expected=await signPart(part,secret);
  if(signature!==expected) throw new Error('invalid token');
  const payload=decodePayload(part);
  if(!payload.exp||payload.exp<Math.floor(Date.now()/1000)) throw new Error('expired token');
  return payload;
};

const parseJson=async request=>{
  try{return await request.json();}
  catch{throw new Error('invalid json');}
};

const normalizeReportRequest=value=>({
  birthDate:String(value?.birthDate||''),
  birthTime:value?.birthTime?String(value.birthTime):null,
  sex:value?.sex==='female'||value?.sex==='male'?value.sex:null,
  dayBoundary:value?.dayBoundary==='zi-start'?'zi-start':'midnight'
});

const calculateFromRequest=request=>{
  const result=calculateSaju({
    birthDate:request.birthDate,
    birthTime:request.birthTime,
    sex:request.sex
  },{dayBoundary:request.dayBoundary});
  if(result.status==='needs-birth-time') throw new Error('birth time required for this date');
  return result;
};

const seoulDateString=()=>{
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',
    year:'numeric',
    month:'2-digit',
    day:'2-digit'
  }).formatToParts(new Date());
  const byType=Object.fromEntries(parts.map(x=>[x.type,x.value]));
  return byType.year+'-'+byType.month+'-'+byType.day;
};

const tossAuth=secret=>'Basic '+btoa(secret+':');

const confirmTossPayment=async({paymentKey,orderId,amount},env)=>{
  const response=await fetch('https://api.tosspayments.com/v1/payments/confirm',{
    method:'POST',
    headers:{
      'authorization':tossAuth(env.TOSS_SECRET_KEY),
      'content-type':'application/json'
    },
    body:JSON.stringify({paymentKey,orderId,amount})
  });
  const data=await response.json();
  if(!response.ok){
    const error=new Error(data?.message||'payment confirmation failed');
    error.status=response.status;
    error.code=data?.code||'TOSS_CONFIRM_FAILED';
    throw error;
  }
  return data;
};

const buildReport=request=>{
  const result=calculateFromRequest(request);
  return buildPremiumReportV1(result,{today:seoulDateString()});
};

const routeConfig=(request,env)=>json({
  productId:PRODUCT_ID,
  productName:PRODUCT_NAME,
  price:PRICE,
  currency:'KRW',
  provider:'toss',
  enabled:Boolean(env.TOSS_CLIENT_KEY&&env.TOSS_SECRET_KEY&&env.PREMIUM_SIGNING_SECRET),
  clientKey:env.TOSS_CLIENT_KEY||null
},200,corsHeaders(request,env));

const routeOrder=async(request,env)=>{
  if(!env.PREMIUM_SIGNING_SECRET) return json({message:'premium signing secret is not configured'},503,corsHeaders(request,env));
  const body=await parseJson(request);
  const reportRequest=normalizeReportRequest(body.reportRequest);
  calculateFromRequest(reportRequest);

  const orderId='saju_'+crypto.randomUUID().replaceAll('-','').slice(0,28);
  const now=Math.floor(Date.now()/1000);
  const token=await issueToken({
    kind:'order',
    productId:PRODUCT_ID,
    orderId,
    amount:PRICE,
    reportRequest,
    iat:now,
    exp:now+60*30
  },env.PREMIUM_SIGNING_SECRET);

  return json({
    productId:PRODUCT_ID,
    productName:PRODUCT_NAME,
    orderId,
    amount:PRICE,
    currency:'KRW',
    token
  },200,corsHeaders(request,env));
};

const routeConfirm=async(request,env)=>{
  if(!env.TOSS_SECRET_KEY||!env.PREMIUM_SIGNING_SECRET){
    return json({message:'payment server is not configured'},503,corsHeaders(request,env));
  }
  const body=await parseJson(request);
  const order=await verifyToken(body.token,env.PREMIUM_SIGNING_SECRET);
  if(order.kind!=='order'||order.productId!==PRODUCT_ID) throw new Error('invalid order token');
  if(order.orderId!==body.orderId) throw new Error('order id mismatch');
  if(order.amount!==PRICE||Number(body.amount)!==PRICE) throw new Error('amount mismatch');
  if(!body.paymentKey) throw new Error('payment key is required');

  const payment=await confirmTossPayment({
    paymentKey:String(body.paymentKey),
    orderId:order.orderId,
    amount:PRICE
  },env);

  if(payment.orderId!==order.orderId||Number(payment.totalAmount)!==PRICE){
    throw new Error('confirmed payment does not match order');
  }

  const now=Math.floor(Date.now()/1000);
  const accessToken=await issueToken({
    kind:'access',
    productId:PRODUCT_ID,
    orderId:order.orderId,
    reportRequest:order.reportRequest,
    paidAt:payment.approvedAt||null,
    iat:now,
    exp:now+60*60*24*30
  },env.PREMIUM_SIGNING_SECRET);

  return json({
    ok:true,
    orderId:order.orderId,
    accessToken,
    report:buildReport(order.reportRequest),
    payment:{
      method:payment.method||null,
      approvedAt:payment.approvedAt||null,
      receiptUrl:payment.receipt?.url||null
    }
  },200,corsHeaders(request,env));
};

const routeReport=async(request,env)=>{
  if(!env.PREMIUM_SIGNING_SECRET) return json({message:'premium signing secret is not configured'},503,corsHeaders(request,env));
  const body=await parseJson(request);
  const access=await verifyToken(body.accessToken,env.PREMIUM_SIGNING_SECRET);
  if(access.kind!=='access'||access.productId!==PRODUCT_ID) throw new Error('invalid access token');
  if(body.orderId&&access.orderId!==body.orderId) throw new Error('order id mismatch');

  return json({
    ok:true,
    orderId:access.orderId,
    report:buildReport(access.reportRequest)
  },200,corsHeaders(request,env));
};

export default {
  async fetch(request,env){
    const cors=corsHeaders(request,env);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors});

    const url=new URL(request.url);
    try{
      if(request.method==='GET'&&url.pathname==='/v1/premium/config') return routeConfig(request,env);
      if(request.method==='POST'&&url.pathname==='/v1/premium/order') return await routeOrder(request,env);
      if(request.method==='POST'&&url.pathname==='/v1/premium/confirm') return await routeConfirm(request,env);
      if(request.method==='POST'&&url.pathname==='/v1/premium/report') return await routeReport(request,env);
      return json({message:'not found'},404,cors);
    }catch(error){
      const status=Number(error?.status)||400;
      return json({
        message:String(error?.message||'request failed'),
        code:error?.code||'PREMIUM_REQUEST_FAILED'
      },status,cors);
    }
  }
};
