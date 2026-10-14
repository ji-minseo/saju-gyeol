import {
  PRICE,PRODUCT_ID,handleOptions,fail,sendJson,readJson,
  verifyToken,issueToken,getPortOnePayment,buildReport
} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{message:'method not allowed'});
  try{
    if(!process.env.PORTONE_API_SECRET||!process.env.PREMIUM_SIGNING_SECRET){
      return sendJson(res,503,{message:'payment server is not configured'});
    }

    const body=await readJson(req);
    const order=verifyToken(body.token);
    if(order.kind!=='order'||order.productId!==PRODUCT_ID){
      throw Object.assign(new Error('invalid order token'),{status:400});
    }
    if(order.paymentId!==body.paymentId){
      throw Object.assign(new Error('payment id mismatch'),{status:400});
    }
    if(order.amount!==PRICE){
      throw Object.assign(new Error('amount mismatch'),{status:400});
    }

    const payment=await getPortOnePayment(order.paymentId);

    if(payment.id!==order.paymentId){
      throw Object.assign(new Error('verified payment does not match order'),{status:400});
    }
    if(payment.status!=='PAID'){
      throw Object.assign(new Error('payment is not completed'),{status:409,code:'PAYMENT_NOT_PAID'});
    }
    if(Number(payment.amount?.total)!==PRICE||payment.currency!=='KRW'){
      throw Object.assign(new Error('verified payment amount does not match order'),{status:400,code:'PAYMENT_AMOUNT_MISMATCH'});
    }

    const now=Math.floor(Date.now()/1000);
    const accessToken=issueToken({
      kind:'access',
      productId:PRODUCT_ID,
      paymentId:order.paymentId,
      reportRequest:order.reportRequest,
      paidAt:payment.paidAt||null,
      iat:now,
      exp:now+60*60*24*30
    });

    return sendJson(res,200,{
      ok:true,
      paymentId:order.paymentId,
      accessToken,
      report:buildReport(order.reportRequest),
      payment:{
        status:payment.status,
        transactionId:payment.transactionId||null,
        paidAt:payment.paidAt||null
      }
    });
  }catch(error){fail(req,res,error);}
}
