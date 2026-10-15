// Casa Rua Rui Barbosa 277 — fachada com imagem aprovada (fachada277.jpg) mapeada por UV + volumes 3D procedurais.
// Unidades: metros. Origem: centro do lote no alinhamento do muro (z=0), +z = rua. Imagem referência: coords em px na escala 1024x576.
import * as THREE from 'three';
const PX=65, GX=512, GY=517;               // 65 px por metro, centro x, linha do chão
const wx=px=>(px-GX)/PX, wy=py=>(GY-py)/PX;
function tex(w,h,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function noise(g,w,h,base,amp,n=5000){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=Math.random();g.fillStyle=`rgba(${v>.5?255:0},${v>.5?255:0},${v>.5?255:0},${Math.random()*amp})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}}
export const T={
 reboco:(r=1)=>tex(256,256,(g,w,h)=>noise(g,w,h,'#4d5668',.07),r,r),           // azul ardósia da imagem
 telha:()=>tex(256,256,(g,w,h)=>{g.fillStyle='#5a4335';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16){g.fillStyle='#3e2d24';g.fillRect(0,y,w,3);for(let x=(y/16%2)*12;x<w;x+=24){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y,2,16);}}},6,6),
 metal:()=>tex(64,64,(g,w,h)=>{g.fillStyle='#6d7277';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='#50555a';g.fillRect(x,0,2,h);}},8,1),
 concreto:()=>tex(256,256,(g,w,h)=>noise(g,w,h,'#bdb4a6',.12,8000),3,1),
 mosaico:()=>tex(256,256,(g,w,h)=>{g.fillStyle='#e6e3dc';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.15})`;g.fillRect(Math.random()*w,Math.random()*h,3,3);}g.fillStyle='#3a3a3c';for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.beginPath();g.ellipse(64+x*128+(y%2)*0,64+y*128,46,32,0,0,Math.PI*2);g.fill();}g.fillStyle='#e6e3dc';for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.beginPath();g.ellipse(64+x*128,64+y*128,20,12,0,0,Math.PI*2);g.fill();}},28,14),
};
const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
function box(w,h,d,mat,x,y,z,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
// plano com recorte UV da imagem (px0,py0)-(px1,py1)
function face(tex,px0,py0,px1,py1,z,p,alpha=false){
 const w=(px1-px0)/PX,h=(py1-py0)/PX,g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++){uv.setXY(i,(uv.getX(i)?px1:px0)/1024,1-(uv.getY(i)?py0:py1)/576);}
 const m=new THREE.Mesh(g,M({map:tex,roughness:.85,transparent:false,alphaTest:alpha?.5:0}));
 m.position.set(wx((px0+px1)/2),wy((py0+py1)/2),z);m.receiveShadow=true;p.add(m);return m;}
// textura da imagem com céu removido (pixels claros e pouco saturados na parte de cima viram transparentes)
async function fotoTex(url){const img=await new Promise((ok,er)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=er;i.src=url;});
 const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
 const d=g.getImageData(0,0,c.width,c.height),a=d.data,lim=c.height*(330/576);
 for(let y=0;y<lim;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4,r=a[k],gg=a[k+1],b=a[k+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);if(mn>185&&mx-mn<28)a[k+3]=0;}
 g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function telhado4aguas(w,d,h,mat){const r=Math.min(w,d)/2,hw=w/2,hd=d/2,rl=hw-r;
 const v=[-hw,0,hd,hw,0,hd,hw,0,-hd,-hw,0,-hd,-rl,h,0,rl,h,0],idx=[0,1,5,0,5,4,2,3,4,2,4,5,1,2,5,3,0,4];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);
 const n=g.toNonIndexed();const p=n.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/2,p.getZ(i)/2+p.getY(i)/2);n.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));n.computeVertexNormals();
 const m=new THREE.Mesh(n,mat);m.castShadow=true;return m;}

export async function buildCasa277(url='./fachada277.jpg'){
 const G=new THREE.Group();G.name='casa277';const F=await fotoTex(url);
 const reb=M({map:T.reboco()}),zH=-4.0;              // plano da fachada da casa
 // --- volumes da casa principal e ala
 const x0=wx(205),x1=wx(870),hM=wy(108),D=9;
 box(x1-x0,hM,D,reb,(x0+x1)/2,hM/2,zH-D/2-.02,G);
 const a0=wx(28),a1=wx(206),hA=wy(232);box(a1-a0,hA,7,reb,(a0+a1)/2,hA/2,zH-3.5-.02,G);
 // telhados 3D (por trás do plano da fachada, com beiral)
 const tp=telhado4aguas(x1-x0+1.6,D+1.6,2.4,M({map:T.telha(),roughness:.95}));tp.position.set((x0+x1)/2,hM,zH-D/2+.3);G.add(tp);
 const tw=box(a1-a0+.6,.08,7.6,M({map:T.metal()}),(a0+a1)/2,hA+.1,zH-3.5+.3,G);tw.rotation.x=-.12;
 // --- fachada com imagem: casa+ala (até py 335) com céu recortado
 face(F,0,0,1024,335,zH+.02,G,true);
 // recuo da varanda: caixa escura atrás do vão (dá profundidade nas bordas)
 box(.12,2.3,1.0,reb,wx(400),wy(225),zH+.45,G);box(.12,2.3,1.0,reb,wx(668),wy(225),zH+.45,G);
 box(wx(668)-wx(400),.18,1.0,M({color:0x3a2a20}),(wx(400)+wx(668))/2,wy(282),zH+.45,G); // laje da varanda
 // --- muro de placas (frente com a imagem, topo/laterais procedurais)
 const cm=M({map:T.concreto()});box(wx(535)-wx(0),wy(330),.15,cm,(wx(0)+wx(535))/2,wy(330)/2,-.09,G);
 face(F,0,330,535,517,.0,G);
 // --- pilares de tijolo (caixas)
 for(const [p0,p1] of [[535,570],[826,871]]){const w=(p1-p0)/PX,h=wy(353);box(w,h,w,M({color:0x8f5040}),wx((p0+p1)/2),h/2,-w/2,G);face(F,p0,353,p1,517,.005,G);}
 // --- portão recuado + fundo da garagem
 face(F,570,340,826,512,-.25,G);
 // --- garagem aberta à direita: laje, viga, parede lateral, piso
 const cz0=0,cz1=zH;box(wx(1008)-wx(535),.25,cz0-cz1+.3,M({color:0x4a3326}),(wx(535)+wx(1008))/2,wy(300),(cz0+cz1)/2,G);
 face(F,535,293,1008,322,.16,G);                    // viga frontal de madeira
 box(.3,wy(296),-zH,reb,wx(992),wy(296)/2,zH/2,G);face(F,976,296,1008,517,.01,G);
 face(F,871,320,976,517,-.6,G);                     // vão aberto da garagem (fundo pintado)
 const pi=new THREE.Mesh(new THREE.PlaneGeometry(wx(976)-wx(571),-zH),M({color:0xb9b4ab}));pi.rotation.x=-Math.PI/2;pi.position.set((wx(571)+wx(976))/2,.02,zH/2);G.add(pi);
 // --- chão: calçada + rua em pedra portuguesa
 const ch=new THREE.Mesh(new THREE.PlaneGeometry(40,20),M({map:T.mosaico(),roughness:.8}));ch.rotation.x=-Math.PI/2;ch.position.set(0,0,10);ch.receiveShadow=true;G.add(ch);
 const lote=new THREE.Mesh(new THREE.PlaneGeometry(18,20),M({color:0x7d7468}));lote.rotation.x=-Math.PI/2;lote.position.set(0,.005,-10);G.add(lote);
 return G;}
export function buildVizinho(cor=0xd9c9a8){const g=new THREE.Group();box(6,6,12,M({color:cor}),0,3,-6,g);return g;}
