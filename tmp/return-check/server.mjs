import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('frontend/dist');
http.createServer((req,res)=>{
 if(req.method!=='GET'){res.writeHead(405);res.end();return;}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/publico'){res.setHeader('Content-Type','application/json');res.end(fs.readFileSync('tmp/return-check/catalog.json','utf8').replace(/^\uFEFF/,''));return;}
 if(pathname==='/api/session'){res.writeHead(401);res.end();return;}
 if(pathname==='/product.html'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('tmp/return-check/product.html'));return;}
 if(/^\/api\/imagenes\/\d+\/archivo$/.test(pathname)){res.writeHead(302,{Location:'https://bazar-nazareth-web-f0a6gwcwehhmcahk.westus3-01.azurewebsites.net'+pathname});res.end();return;}
 let file=path.resolve(root,'.'+decodeURIComponent(pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpeg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
}).listen(5188,'127.0.0.1',()=>console.log('Preview ready'));
