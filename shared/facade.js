// Helpers comuns: fachada por imagem (UV) + volumes procedurais. Metros, origem no alinhamento frontal, +z = rua.
import * as THREE from 'three';
export function tex(w,h,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
export function noise(g,w,h,base,amp,n=5000){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=Math.random()>.5?255:0;g.fillStyle=`rgba(${v},${v},${v},${Math.random()*amp})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}}
export const reboco=(cor,r=1)=>tex(256,256,(g,w,h)=>noise(g,w,h,cor,.06),r,r);
export const paver=(rx=12,ry=3)=>tex(256,256,(g,w,h)=>{g.fillStyle='#8a7466';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-32;x<w;x+=64){const o=(y/32)%2?32:0,s=165+Math.random()*25;g.fillStyle=`rgb(${s+15},${s-15},${s-40})`;g.fillRect(x+o+2,y+2,60,28);}},rx,ry);
export const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
export function box(w,h,d,mat,x,y,z,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
// cfg: {PX: px por metro, GX: px do x=0, GY: px da linha do chão, W,H: tamanho da imagem em px de referência}
export function mapper(cfg){const wx=px=>(px-cfg.GX)/cfg.PX, wy=py=>(cfg.GY-py)/cfg.PX;
 function face(t,px0,py0,px1,py1,z,p,alpha=false){const w=(px1-px0)/cfg.PX,h=(py1-py0)/cfg.PX,g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)?px1:px0)/cfg.W,1-(uv.getY(i)?py0:py1)/cfg.H);
  const m=new THREE.Mesh(g,M({map:t,roughness:.85,alphaTest:alpha?.5:0}));m.position.set(wx((px0+px1)/2),wy((py0+py1)/2),z);m.receiveShadow=true;p.add(m);return m;}
 function disc(t,cx,cy,r,z,p){const g=new THREE.CircleGeometry(r/cfg.PX,32),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(cx+(uv.getX(i)-.5)*2*r)/cfg.W,1-(cy-(uv.getY(i)-.5)*2*r)/cfg.H);const m=new THREE.Mesh(g,M({map:t,roughness:.5,side:THREE.DoubleSide}));m.position.set(wx(cx),wy(cy),z);p.add(m);return m;}
 return {wx,wy,face,disc};}
// carrega imagem; isSky(r,g,b) -> true torna pixel transparente (só acima de skyLimit, fração da altura)
export async function fotoTex(url,isSky,skyLimit=.6){const img=await new Promise((ok,er)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=er;i.src=url;});
 const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
 if(isSky){const d=g.getImageData(0,0,c.width,c.height),a=d.data,lim=c.height*skyLimit;for(let y=0;y<lim;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4;if(isSky(a[k],a[k+1],a[k+2]))a[k+3]=0;}g.putImageData(d,0,0);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
export const skyAzul=(r,g,b)=>b>165&&b-r>18;
export const skyCinza=(r,g,b)=>Math.min(r,g,b)>185&&Math.max(r,g,b)-Math.min(r,g,b)<28;
