import {PRICE,PRODUCT_ID,PRODUCT_NAME,handleOptions,fail,corsHeaders} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='GET'){
    res.statusCode=405;
    res.end();
    return;
  }
  try{
    const enabled=Boolean(
      process.env.PORTONE_STORE_ID&&
      process.env.PORTONE_CHANNEL_KEY&&
      process.env.PORTONE_API_SECRET&&
      process.env.PREMIUM_SIGNING_SECRET
    );
    for(const [key,value] of Object.entries(corsHeaders(req))) res.setHeader(key,value);
    res.statusCode=200;
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.end(JSON.stringify({
      productId:PRODUCT_ID,
      productName:PRODUCT_NAME,
      price:PRICE,
      currency:'KRW',
      provider:'portone-v2',
      pgProvider:'NHN KCP',
      payMethod:'CARD',
      enabled,
      storeId:enabled?process.env.PORTONE_STORE_ID:null,
      channelKey:enabled?process.env.PORTONE_CHANNEL_KEY:null
    }));
  }catch(error){fail(req,res,error);}
}
