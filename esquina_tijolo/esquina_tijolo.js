// Casa de tijolo de esquina — Rua Castro Alves. Frente: fachada aprovada (sem "237", colunas finas, 3 vãos, só mastro).
// Lateral: retificação em perspectiva da foto real lateral_real.jpg (parede, varanda, piso com letreiro).
import * as THREE from 'three';
import {M,box,tex,noise} from '../shared/facade.js';
const L=u=>new Promise(ok=>new THREE.TextureLoader().load(u,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;ok(t);}));
export async function buildEsquinaTijolo(base='./'){
 const G=new THREE.Group();G.name='esquina_tijolo';
 const [tFr,tLat,tCh]=await Promise.all(['parede_tijolo.jpg','lateral_parede.jpg','lateral_chao.jpg'].map(n=>L(base+n)));
 const W=1113/118,H=2.8,D=20,x0=-W/2,x1=W/2,cinza=M({color:0xc9c6be});
 const plane=(w,h,t,mat)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat||M({map:t,roughness:.85}));
 // frente
 const f=plane(W,H,tFr);f.position.set(0,H/2,.001);G.add(f);
 box(W,H,D-.02,M({color:0xb85a3c}),0,H/2,-D/2,G); // volume
 for(const px of[0,(419-85)/118+.13,(821-85)/118+.13,W])box(.16,H,.12,cinza,x0+px,H/2,.04,G); // 4 colunas finas = 3 vãos
 box(W+.3,.18,.3,cinza,0,H+.05,.05,G);
 // lateral (x=x1, voltada +x), foto retificada ao longo de z
 const s=plane(D,H,tLat);s.rotation.y=Math.PI/2;s.position.set(x1+.012,H/2,-D/2);G.add(s);
 // varanda: piso terracota + pérgola de madeira
 const P=2.6,mad=M({color:0x9a6234,roughness:.8});
 const pv=plane(D,P,null,M({color:0xc98a64}));pv.rotation.set(-Math.PI/2,0,Math.PI/2);pv.position.set(x1+P/2,.06,-D/2);G.add(pv);
 for(const fr of[.08,.27,.42,.57,.91,1])box(.16,H,.16,mad,x1+P-.1,H/2,-fr*D+.2,G);
 box(.14,.2,D,mad,x1+P-.1,H+.05,-D/2,G);
 for(let z=-.3;z>-D;z-=.6)box(P+.3,.12,.07,mad,x1+P/2,H+.18,z,G);
 // chão de paver com letreiro (textura da foto)
 const ch=plane(D,7,tCh);ch.rotation.set(-Math.PI/2,0,Math.PI/2);ch.position.set(x1+P+3.5,.02,-D/2);G.add(ch);
 // telhado de 4 águas cinza (principal 12 m + volume traseiro mais baixo)
 const telha=tex(256,256,(g,w,h)=>{noise(g,w,h,'#8d8f90',.12,6000);g.strokeStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}},6,6);
 const hip=(w,d,h,y,z)=>{const g=new THREE.ConeGeometry(Math.SQRT1_2,1,4,1);g.rotateY(Math.PI/4);const m=new THREE.Mesh(g,M({map:telha,flatShading:true}));m.scale.set(w,h,d);m.position.set(0,y+h/2,z);m.castShadow=true;G.add(m);};
 hip(W+.8,12.6,1.9,H+.1,-6);hip(W+.6,9,1.4,H-.1,-15);
 // só um mastro fino (sem antena)
 const ms=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.2,6),M({color:0x777777,metalness:.7}));ms.position.set(0,H+2.9,-6);G.add(ms);
 return G;}
