import {PRICE,PRODUCT_ID,PRODUCT_NAME,handleOptions,fail,corsHeaders} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='GET'){
    res.statusCode=405;
    res.end();
    return;
  }
  try{
    const enabled=Boolean(process.env.TOSS_CLIENT_KEY&&process.env.TOSS_SECRET_KEY&&process.env.PREMIUM_SIGNING_SECRET);
    for(const [key,value] of Object.entries(corsHeaders(req))) res.setHeader(key,value);
    res.statusCode=200;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.end(JSON.stringify({
      productId:PRODUCT_ID,
      productName:PRODUCT_NAME,
      price:PRICE,
      currency:'KRW',
      provider:'toss',
      enabled,
      clientKey:enabled?process.env.TOSS_CLIENT_KEY:null
    }));
  }catch(error){fail(req,res,error);}
}
