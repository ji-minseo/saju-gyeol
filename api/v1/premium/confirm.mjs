import {
  PRICE,PRODUCT_ID,handleOptions,fail,sendJson,readJson,
  verifyToken,issueToken,confirmTossPayment,buildReport
} from './_lib.mjs';

export default async function handler(req,res){
  if(handleOptions(req,res)) return;
  if(req.method!=='POST') return sendJson(res,405,{message:'method not allowed'});
  try{
    if(!process.env.TOSS_SECRET_KEY||!process.env.PREMIUM_SIGNING_SECRET){
      return sendJson(res,503,{message:'payment server is not configured'});
    }
    const body=await readJson(req);
    const order=verifyToken(body.token);
    if(order.kind!=='order'||order.productId!==PRODUCT_ID) throw Object.assign(new Error('invalid order token'),{status:400});
    if(order.orderId!==body.orderId) throw Object.assign(new Error('order id mismatch'),{status:400});
    if(order.amount!==PRICE||Number(body.amount)!==PRICE) throw Object.assign(new Error('amount mismatch'),{status:400});
    if(!body.paymentKey) throw Object.assign(new Error('payment key is required'),{status:400});

    const payment=await confirmTossPayment({
      paymentKey:String(body.paymentKey),
      orderId:order.orderId,
      amount:PRICE
    });

    if(payment.orderId!==order.orderId||Number(payment.totalAmount)!==PRICE){
      throw Object.assign(new Error('confirmed payment does not match order'),{status:400});
    }

    const now=Math.floor(Date.now()/1000);
    const accessToken=issueToken({
      kind:'access',
      productId:PRODUCT_ID,
      orderId:order.orderId,
      reportRequest:order.reportRequest,
      paidAt:payment.approvedAt||null,
      iat:now,
      exp:now+60*60*24*30
    });

    return sendJson(res,200,{
      ok:true,
      orderId:order.orderId,
      accessToken,
      report:buildReport(order.reportRequest),
      payment:{
        method:payment.method||null,
        approvedAt:payment.approvedAt||null,
        receiptUrl:payment.receipt?.url||null
      }
    });
  }catch(error){fail(req,res,error);}
}
