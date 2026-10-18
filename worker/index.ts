import {auth,isAdmin,json,type Env} from './auth';
import {GET,POST} from './store';
export default {async fetch(request:Request,env:Env){try{
 const path=new URL(request.url).pathname;
 if(path==='/api/login'||path==='/api/logout')return auth(request,env,path);
 if(path==='/api/store'){
  if(request.method==='GET')return GET(request,env);
  if(request.method==='POST')return POST(request,env);
  return json({error:'Método não permitido.'},405);
 }
 if(path.startsWith('/api/'))return json({error:'Rota não encontrada.'},404);
 if(request.method!=='GET'&&request.method!=='HEAD')return json({error:'Método não permitido.'},405);
 const response=await env.ASSETS.fetch(request);const out=new Response(response.body,response);out.headers.set('X-Content-Type-Options','nosniff');out.headers.set('Referrer-Policy','strict-origin-when-cross-origin');out.headers.set('Content-Security-Policy',"frame-ancestors 'none'");return out;
 }catch{return json({error:'Serviço indisponível. Tente novamente.'},503)}}};
