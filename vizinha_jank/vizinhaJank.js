// Casa vizinha da Jank — Rua Rui Barbosa. Térrea recuada ~6 m, gramado, gradil marrom no alinhamento. Lote ~13 m.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver} from '../shared/facade.js';
function cropTex(img,x,y,w,h,rep){const c=document.createElement('canvas');c.width=256;c.height=256;const s=img.width/1024;c.getContext('2d').drawImage(img,x*s,y*s,w*s,h*s,0,0,256,256);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...rep);t.colorSpace=THREE.SRGBColorSpace;return t;}
export async function buildVizinhaJank(url='./fachada_vizinha.jpg'){
 const G=new THREE.Group();G.name='vizinhaJank';const W=13,REC=6,SY=1.25;   // SY: correção vertical da perspectiva da foto
 const F=await fotoTex(url,skyAzul,.45);const img=F.image;const {wx,face}=mapper({PX:52,GX:497,GY:325,W:1024,H:576});
 // --- casa: fachada da imagem (telhado+parede, sem vizinhos) no plano z=-REC
 const H=new THREE.Group();face(F,165,158,330,325,-REC,H,true);face(F,330,128,835,325,-REC,H,true);H.scale.y=SY;G.add(H);
 const reb=M({color:0xe2d2b4}),eave=2.15*SY,x0=wx(165),x1=wx(830),D=10;
 box(wx(812)-wx(325),eave,D,reb,(wx(325)+wx(812))/2,eave/2,-REC-.02-D/2,G);          // corpo
 box(.25,eave,D,reb,x0+.15,eave/2,-REC-1-D/2,G);                                       // fundo/lado da garagem
 // telhado 4 águas cinza escuro (atrás do plano pintado, aparece de lado)
 const tt=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#4a4d50';g.fillRect(0,0,128,128);for(let y=0;y<128;y+=12){g.fillStyle='#33363a';g.fillRect(0,y,128,3);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,8);return t;})();
 const rw=x1-x0+.8,rd=D+1,rh=1.9,r=rd/2,hw=rw/2,hd=rd/2,rl=hw-r;
 const v=[-hw,0,hd,hw,0,hd,hw,0,-hd,-hw,0,-hd,-rl,rh,0,rl,rh,0],idx=[0,1,5,0,5,4,2,3,4,2,4,5,1,2,5,3,0,4];
 let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g=g.toNonIndexed();const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/2,p.getZ(i)/2+p.getY(i));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 const rf=new THREE.Mesh(g,M({map:tt,roughness:.85}));rf.position.set((x0+x1)/2,eave,-REC-D/2-.6);rf.castShadow=true;G.add(rf);
 // --- piso do lote: grama (textura recortada da imagem) + entrada da garagem + caminho
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(W,REC),M({map:cropTex(img,380,335,140,40,[6,3])}));gr.rotation.x=-Math.PI/2;gr.position.set(0,.01,-REC/2);G.add(gr);
 const pv=new THREE.Mesh(new THREE.PlaneGeometry(wx(320)-(-W/2),REC),M({map:paver(4,3)}));pv.rotation.x=-Math.PI/2;pv.position.set((-W/2+wx(320))/2,.015,-REC/2);G.add(pv);
 for(let i=0;i<8;i++)box(.9,.04,.45,M({color:0xd8d4cc}),wx(578),.03,-.4-i*.7,G);
 // --- gradil marrom 3D (barras instanciadas) com portão
 const fer=M({color:0x5a3e2e,metalness:.4,roughness:.6}),FH=1.8,step=.11,n=Math.floor(W/step);
 const bars=new THREE.InstancedMesh(new THREE.BoxGeometry(.02,FH,.02),fer,n);const m4=new THREE.Matrix4();
 for(let i=0;i<n;i++){m4.makeTranslation(-W/2+i*step+.05,FH/2,0);bars.setMatrixAt(i,m4);}bars.castShadow=true;G.add(bars);
 for(const y of[.08,FH-.05])box(W,.04,.04,fer,0,y,0,G);
 const gx0=wx(545)*0+1.0,gx1=gx0+1.3;                                              // portão de pedestre
 for(const x of[-W/2,-W/2+2.6,-W/2+5.2,gx0,gx1,W/2-2.4,W/2])box(.08,FH+.1,.08,fer,x,(FH+.1)/2,0,G);
 box(.25,.16,.12,M({color:0x2a2a2a}),gx0-.5,1.0,.06,G);                              // caixa de correio
 // --- calçada de paver + meio-fio
 const c=new THREE.Mesh(new THREE.PlaneGeometry(W,3),M({map:paver(10,3)}));c.rotation.x=-Math.PI/2;c.position.set(0,.01,1.5);c.receiveShadow=true;G.add(c);
 box(W,.15,.2,M({color:0xb9b5ad}),0,.075,3.1,G);
 return G;}
