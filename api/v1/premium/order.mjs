import {
  PRICE,PRODUCT_ID,PRODUCT_NAME,handleOptions,fail,sendJson,readJson,
  normalizeReportRequest,calculateFromRequest,issueToken,createOrderId
} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{message:'method not allowed'});
  try{
    if(!process.env.PREMIUM_SIGNING_SECRET) return sendJson(res,503,{message:'premium signing secret is not configured'});
    const body=await readJson(req);
    const reportRequest=normalizeReportRequest(body.reportRequest);
    calculateFromRequest(reportRequest);

    const orderId=createOrderId();
    const now=Math.floor(Date.now()/1000);
    const token=issueToken({
      kind:'order',
      productId:PRODUCT_ID,
      orderId,
      amount:PRICE,
      reportRequest,
      iat:now,
      exp:now+60*30
    });

    return sendJson(res,200,{
      productId:PRODUCT_ID,
      productName:PRODUCT_NAME,
      orderId,
      amount:PRICE,
      currency:'KRW',
      token
    });
  }catch(error){fail(req,res,error);}
}
