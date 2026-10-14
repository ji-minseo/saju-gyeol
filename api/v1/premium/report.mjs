import {
  PRODUCT_ID,handleOptions,fail,sendJson,readJson,verifyToken,buildReport
} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{message:'method not allowed'});
  try{
    if(!process.env.PREMIUM_SIGNING_SECRET) return sendJson(res,503,{message:'premium signing secret is not configured'});
    const body=await readJson(req);
    const access=verifyToken(body.accessToken);
    if(access.kind!=='access'||access.productId!==PRODUCT_ID) throw Object.assign(new Error('invalid access token'),{status:400});
    if(body.paymentId&&access.paymentId!==body.paymentId) throw Object.assign(new Error('payment id mismatch'),{status:400});

    return sendJson(res,200,{
      ok:true,
      paymentId:access.paymentId,
      report:buildReport(access.reportRequest)
    });
  }catch(error){fail(req,res,error);}
}
