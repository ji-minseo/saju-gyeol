import {
  PRICE,PRODUCT_ID,PRODUCT_NAME,handleOptions,fail,sendJson,readJson,
  normalizeReportRequest,calculateFromRequest,issueToken,createPaymentId
} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{message:'method not allowed'});
  try{
    if(!process.env.PREMIUM_SIGNING_SECRET) return sendJson(res,503,{message:'premium signing secret is not configured'});
    if(!process.env.PORTONE_STORE_ID||!process.env.PORTONE_CHANNEL_KEY||!process.env.PORTONE_API_SECRET){
      return sendJson(res,503,{message:'PortOne checkout is not configured'});
    }

    const body=await readJson(req);
    const reportRequest=normalizeReportRequest(body.reportRequest);
    calculateFromRequest(reportRequest);

    const paymentId=createPaymentId();
    const now=Math.floor(Date.now()/1000);
    const token=issueToken({
      kind:'order',
      productId:PRODUCT_ID,
      paymentId,
      amount:PRICE,
      reportRequest,
      iat:now,
      exp:now+60*30
    });

    return sendJson(res,200,{
      productId:PRODUCT_ID,
      productName:PRODUCT_NAME,
      paymentId,
      amount:PRICE,
      currency:'KRW',
      payMethod:'CARD',
      storeId:process.env.PORTONE_STORE_ID,
      channelKey:process.env.PORTONE_CHANNEL_KEY,
      token
    });
  }catch(error){fail(req,res,error);}
}
