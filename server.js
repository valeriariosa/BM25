
const express=require("express"),path=require("path");
const app=express(),PORT=process.env.PORT||10000;
app.use(express.json());app.use(express.static(path.join(__dirname,"public")));
const products=[
["R1","Camisa Oxford Azul","Camisas",89.90,"Camisa de algodón azul de corte clásico, cómoda y versátil."],
["R2","Jean Slim Fit","Jeans",119.90,"Pantalón vaquero ajustado azul, moderno y fácil de combinar."],
["R3","Vestido Floral","Vestidos",129.90,"Vestido de verano con estampado floral, ligero y femenino."],
["R4","Casaca Negra","Casacas",159.90,"Chaqueta negra de acabado elegante, ideal para looks urbanos."],
["R5","Camiseta Básica Blanca","Polos",49.90,"Camiseta blanca básica de algodón suave para uso diario."],
["R6","Falda Midi Beige","Faldas",99.90,"Falda midi plisada color beige, elegante y cómoda."],
["R7","Suéter Cálido Gris","Suéteres",109.90,"Jersey de lana gris para invierno, cálido y suave."],
["R8","Abrigo Largo Camel","Abrigos",229.90,"Abrigo de invierno largo color camel, elegante y abrigador."],
["R9","Short Deportivo","Deportivo",69.90,"Pantalón corto deportivo ligero para entrenamiento."],
["R10","Blusa Fiesta","Blusas",139.90,"Blusa de seda elegante para fiestas y ocasiones especiales."]
].map((x,i)=>({id:x[0],name:x[1],category:x[2],price:x[3],description:x[4],image:[
"https://images.unsplash.com/photo-1596755389378-c31d21fd1273","https://images.unsplash.com/photo-1542272604-787c3835535d","https://images.unsplash.com/photo-1496747611176-843222e1e57c","https://images.unsplash.com/photo-1551028719-00167b16eac5","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab","https://images.unsplash.com/photo-1583496661160-fb5886a13d27","https://images.unsplash.com/photo-1576566588028-4147f3842f27","https://images.unsplash.com/photo-1539533113208-f6df8cc8b543","https://images.unsplash.com/photo-1591195853828-11db59a44f6b","https://images.unsplash.com/photo-1564257577054-1c2a6a5f2e1d"
][i]+"?auto=format&fit=crop&w=900&q=80"}));
const tok=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").match(/[a-z0-9]+/g)||[];
function bm25(docs,k1=1.5,b=.75){
 const ds=docs.map(p=>tok(p.name+" "+p.category+" "+p.description)),N=ds.length,df=new Map();
 ds.forEach(d=>[...new Set(d)].forEach(t=>df.set(t,(df.get(t)||0)+1)));
 const avg=ds.reduce((a,d)=>a+d.length,0)/N;
 return (q,i)=>{let c=new Map();ds[i].forEach(t=>c.set(t,(c.get(t)||0)+1));let s=0;
 q.forEach(t=>{let f=c.get(t)||0,n=df.get(t)||0;if(!f)return;let idf=Math.log(1+(N-n+.5)/(n+.5));s+=idf*((f*(k1+1))/(f+k1*(1-b+b*ds[i].length/avg)));});return s};
}
const score=bm25(products);
app.get("/api/products",(req,res)=>res.json(products));
app.get("/api/search",(req,res)=>{let q=String(req.query.q||""),cat=String(req.query.category||"Todas"),t=tok(q);
 let r=products.filter(p=>cat==="Todas"||p.category===cat).map(p=>({...p,score:q?score(t,products.indexOf(p)):0}));
 if(q)r.sort((a,b)=>b.score-a.score);res.json({query:q,processedQuery:t,results:r})});
app.post("/api/orders",(req,res)=>{let items=req.body?.items||[];if(!items.length)return res.status(400).json({error:"Carrito vacío"});let total=items.reduce((s,x)=>s+x.price*x.quantity,0);res.json({success:true,orderId:"POC-"+Date.now(),total:Number(total.toFixed(2))})});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log("Running on "+PORT));
