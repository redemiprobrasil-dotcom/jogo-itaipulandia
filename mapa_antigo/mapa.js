// Quarteirão Itaipulândia — mapa completo + teste FPS (three.js r160).
// Quadra: x∈[0,Lx], z∈[0,Lz]. z=Lz Av. Tiradentes (+z), z=0 R. Sete de Setembro (−z), x=0 R. Castro Alves (−x), x=Lx R. Rui Barbosa (+x).
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {createSoldado} from '../skin/soldado.js?v=7';
const hud=document.getElementById('hud'),info=document.getElementById('info'),hitEl=document.getElementById('hit');
const MODO=location.hash.slice(1); // '', 'topo', 'rua', 'mobile'
const MOBILE=MODO==='mobile'||matchMedia('(pointer:coarse)').matches||('ontouchstart' in window&&navigator.maxTouchPoints>0);
if(MOBILE)document.body.classList.add('mobile');
const R=new THREE.WebGLRenderer({antialias:!MOBILE,preserveDrawingBuffer:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1:1.25));R.setSize(innerWidth,innerHeight);R.toneMapping=THREE.ACESFilmicToneMapping;R.outputColorSpace=THREE.SRGBColorSpace;
R.shadowMap.enabled=false; // leve p/ RTX 3050
document.body.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0x9cc3ea);S.fog=new THREE.Fog(0x9cc3ea,MOBILE?35:90,MOBILE?110:260);
S.add(new THREE.HemisphereLight(0xf2f6fb,0x8a8070,1.6));const sun=new THREE.DirectionalLight(0xffffff,1.2);sun.position.set(-40,80,60);S.add(sun);
const cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,MOBILE?130:400);
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);});

// ---------- módulos ----------
const B='../';
const MOD={
 kibarato:['kibarato/kibarato.js','buildKibarato',[B+'kibarato/fachada_kibarato.jpg']],
 pauli:['pauli/pauli.js','buildPauli',[B+'pauli/']],
 rokeli:['rokeli/rokeli.js','buildRokeli',[B+'rokeli/']],
 predio_cinza:['predio_cinza/predio_cinza.js','buildPredioCinza',[B+'predio_cinza/']],
 bar_esquina:['bar_esquina/bar_esquina.js','buildBarEsquina',[B+'bar_esquina/']],
 esquina_tijolo:['esquina_tijolo/esquina_tijolo.js','buildEsquinaTijolo',[B+'esquina_tijolo/']],
 lote_vazio:['lote_vazio/lote_vazio.js','buildLoteVazio',[]],
 lp_cross:['lp_cross/lp_cross.js','buildLpCross',[B+'lp_cross/fachada_lp_cross.jpg']],
 lote_portao:['lote_portao/lote_portao.js','buildLotePortao',[B+'lote_portao/fachada_lote_portao.jpg']],
 bazzar:['bazzar/bazzar.js','buildBazzar',[B+'bazzar/']],
 casa_vermelha:['casa_vermelha/casa_vermelha.js','buildCasaVermelha',[B+'casa_vermelha/']],
 mil_gaucho:['mil_gaucho/milGaucho.js','buildMilGaucho',[B+'mil_gaucho/fachada_mil_gaucho.jpg']],
 vizinha_jank:['vizinha_jank/vizinhaJank.js','buildVizinhaJank',[B+'vizinha_jank/fachada_vizinha.jpg']],
 jank:['jank/jank.js','buildJank',[B+'jank/fachada_jank.jpg']],
 toke_final:['toke_final/toke_final.js','buildTokeFinal',[B+'toke_final/fachada_toke.jpg']],
 icell:['icell/icell.js','buildIcell',[B+'icell/fachada_icell.jpg']],
 sobrado:['sobrado/sobrado.js','buildSobrado',[B+'sobrado/fachada_sobrado.jpg']],
 garagem:['garagem/garagem.js','buildGaragem',[B+'garagem/fachada_garagem.jpg']],
 portao_branco:['portao_branco/portaoBranco.js','buildPortaoBranco',[B+'portao_branco/fachada_portao_branco.jpg']],
 mecanica:['mecanica/mecanica.js','buildMecanica',[B+'mecanica/fachada_mecanica.jpg']],
 lenz:['lenz/lenz.js','buildLenz',[B+'lenz/fachada_lenz.jpg']],
 sky:['sky/sky.js','buildSky',[B+'sky/fachada_sky.jpg']],
 choperia:['choperia/choperia.js','buildChoperia',[B+'choperia/fachada_choperia.jpg',B+'choperia/lateral_choperia.jpg']],
};
// Ordem reconstruída da conversa + vizinhos visíveis em cada foto (ver relatório). Cada lista vai da esquerda p/ a direita
// de quem olha a fachada da rua; prédio de esquina tem a lateral no +x local (direita) -> nenhum módulo precisa ser espelhado.
// '|' = o que vem depois encosta no fim do lado (esquina) e a sobra vira muro; '~' = sobra dividida igualmente entre os lotes.
const LADOS={
 tiradentes:['~','bar_esquina','predio_cinza','rokeli','pauli','kibarato'],       // Castro → Rui: gramado na esquina da Castro, Kibarato na esquina da Rui (lateral na Rui)
 rui:['|','sobrado','jank','vizinha_jank','mil_gaucho'],                          // Tiradentes → Sete: lateral do Kibarato, (trecho sem foto), 277, Jank, vizinha, Mil e Uma+Gaúcho (lateral na Sete)
 sete:['garagem','portao_branco','mecanica','lenz','sky','choperia'],              // Rui → Castro: lateral do Gaúcho, ..., choperia na esquina (lateral na Castro)
 castro:['icell','toke_final','lote_vazio','lp_cross','lote_portao','esquina_tijolo','bazzar','casa_vermelha'], // Sete → Tiradentes: lateral da choperia ... casa vermelha, gramado do bar
};
const ESPELHAR=[];
const ST=10,SW=3.5,GAP=.3;

hud.textContent='carregando módulos…';
const built={};
await Promise.all(Object.entries(MOD).map(async([k,[f,fn,args]])=>{
 try{const m=await import(B+f);built[k]=await m[fn](...args);}
 catch(e){console.error('falhou',k,e);const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(8,4,10),new THREE.MeshStandardMaterial({color:0xff00ff}));b.position.set(0,2,-5);g.add(b);built[k]=g;built[k].userData.falhou=true;}
}));
// limita texturas: >2048 sempre, >1024 no celular
const TMAX=MOBILE?1024:2048,texVistas=new Set();
function capTex(t){if(!t||texVistas.has(t)||!t.image)return;texVistas.add(t);const im=t.image,w=im.width,h=im.height;if(!w||Math.max(w,h)<=TMAX)return;
 const k=TMAX/Math.max(w,h),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);t.image=c;t.needsUpdate=true;}
for(const k in built)built[k].traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material))if(m)for(const n of ['map','normalMap','roughnessMap','emissiveMap','aoMap'])capTex(m[n]);});
const dim={};
function espelhar(g){g.scale.x=-1;g.traverse(o=>{if(!o.isMesh||!o.geometry.attributes.uv)return;o.geometry=o.geometry.clone();const uv=o.geometry.attributes.uv;let a=1e9,b=-1e9;
 for(let i=0;i<uv.count;i++){a=Math.min(a,uv.getX(i));b=Math.max(b,uv.getX(i));}for(let i=0;i<uv.count;i++)uv.setX(i,a+b-uv.getX(i));uv.needsUpdate=true;});}
for(const k of ESPELHAR)if(built[k])espelhar(built[k]);
// remove o piso de rua 40x20 que o casa277 traz (o mapa tem a própria rua)
//built.casa277?.traverse(o=>{if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===40)o.visible=false;});
//built.casa277?.children.filter(o=>!o.visible).forEach(o=>o.parent.remove(o));
function caixaVertical(g){g.updateMatrixWorld(true);const b=new THREE.Box3(),t=new THREE.Box3();g.traverse(o=>{if(!o.isMesh)return;t.setFromObject(o);if(t.max.y-t.min.y>.3)b.union(t);});return b;}
for(const k in built){const g=built[k];let b=caixaVertical(g);if(b.isEmpty()||b.max.x-b.min.x<3)b=new THREE.Box3().setFromObject(g);
 dim[k]={minx:b.min.x,w:THREE.MathUtils.clamp(b.max.x-b.min.x,3,40),d:THREE.MathUtils.clamp(-b.min.z,3,30)};}
const soma=l=>l.filter(k=>k!=='|'&&k!=='~').reduce((a,k)=>a+dim[k].w+GAP,0),maxD=l=>Math.max(...l.filter(k=>k!=='|').map(k=>dim[k].d));
const dK=dim.kibarato.d,dBar=dim.bar_esquina.d,dG=dim.mil_gaucho.d,dCh=dim.choperia.d;
const Lx=Math.ceil(Math.max(soma(LADOS.tiradentes),dG+soma(LADOS.sete)));
const Lz=Math.ceil(Math.max(dK+soma(LADOS.rui),dCh+soma(LADOS.castro)+dBar));
const zOp=Lz+2*SW+ST;
const LADO_CFG={
 tiradentes:{P:[0,Lz],u:[1,0],rot:0,s0:0,L:Lx},
 rui:{P:[Lx,Lz],u:[0,-1],rot:Math.PI/2,s0:dK,L:Lz},
 sete:{P:[Lx,0],u:[-1,0],rot:Math.PI,s0:dG,L:Lx},
 castro:{P:[0,0],u:[0,1],rot:-Math.PI/2,s0:dCh,L:Lz-dBar},
};
const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.95},o));
const muroMat=M({color:0xd8d0c0}),gramaMat=M({color:0x5f8a3c}),asfMat=M({color:0x3d3f42}),calcMat=M({color:0x9a968e}),meioMat=M({color:0xc8c4bb});
function caixa(w,h,d,mat,x,y,z,ry=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;S.add(m);return m;}
const layout=[];
// ---------- casa 3D baixada (um carregamento, clones) ----------
// lista em modelos/lista.json -> cada modelo é normalizado (escala p/ largura real, chão y=0, frente em z=0 virada p/ +z)
const casaTpls=[];
{const ld=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);let lista=[];
 try{lista=(await (await fetch(B+'modelos/lista.json',{cache:'no-cache'})).json()).modelos;}catch(e){console.error('falhou lista.json',e);}
 await Promise.all(lista.map(async(M0)=>{try{const gl=await ld.loadAsync(B+'modelos/'+M0.arquivo);const r=gl.scene;
  const piv=new THREE.Group();piv.add(r);r.rotation.y=THREE.MathUtils.degToRad(M0.rotY||0);piv.updateMatrixWorld(true);
  let b=new THREE.Box3().setFromObject(piv),sz=b.getSize(new THREE.Vector3());
  if(sz.y>Math.max(sz.x,sz.z)*1.5&&sz.z<sz.x*.3){r.rotation.x=-Math.PI/2;piv.updateMatrixWorld(true);b.setFromObject(piv);b.getSize(sz);} // Z-up
  const W=M0.altura?sz.x*M0.altura/sz.y:(M0.largura||11);piv.scale.setScalar(W/Math.max(sz.x,1e-6));piv.updateMatrixWorld(true);b.setFromObject(piv);
  const c=b.getCenter(new THREE.Vector3());const t=new THREE.Group();t.add(piv);piv.position.set(-c.x,-b.min.y,-b.max.z);
  b.getSize(sz);t.userData={w:W,d:sz.z,h:sz.y,nome:M0.arquivo};
  t.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material))if(m)for(const n of ['map','normalMap','roughnessMap','emissiveMap','aoMap'])capTex(m[n]);});
  casaTpls.push(t);console.log('casa',M0.arquivo,sz.x.toFixed(1),sz.y.toFixed(1),sz.z.toFixed(1));}catch(e){console.error('falhou modelo',M0.arquivo,e);}}));
 casaTpls.sort((x,y)=>x.userData.nome<y.userData.nome?-1:1);}
const casaTpl=casaTpls.length?1:null;
let nCasas=0;
// coloca o modelo T com frente no ponto (x,z), virado p/ ry (frente local +z), ocupando largura w
function casa(x,z,ry,w,i,T){const g=T.clone();const v=1+((i*37)%11-5)/100;const e=w/T.userData.w;const ez=Math.min(1.05,22/T.userData.d);
 g.scale.set(e*(i%2?-1:1),v,ez*v);g.rotation.y=ry;g.position.set(x,0,z);g.translateZ(-.4);S.add(g);nCasas++;}
// preenche um trecho de comprimento L com modelos variados da lista (cada um na sua largura natural, esticada p/ fechar o trecho)
function fileira(P0,u,L,ry,i0=0){if(!casaTpls.length||L<7)return false;const GP=1.2,seq=[];let s=0,i=i0;
 const menor=casaTpls.reduce((a,t)=>t.userData.w<a.userData.w?t:a);
 while(L-s>=7){const ok=casaTpls.filter(t=>t.userData.w<=(L-s)*1.15);if(!ok.length)break;const T=ok[(i*7+(i>>2))%ok.length];seq.push(T);s+=T.userData.w+GP;i++;}
 if(!seq.length)seq.push(menor);const tot=seq.reduce((a,t)=>a+t.userData.w+GP,0),f=L/tot;let m=0;
 seq.forEach((T,j)=>{const w=(T.userData.w+GP)*f;casa(P0[0]+u[0]*(m+w/2),P0[1]+u[1]*(m+w/2),ry,w-GP*f,i0+j,T);m+=w;});return true;}
function muro(c,s,sobra,lado){if(fileira([c.P[0]+c.u[0]*s,c.P[1]+c.u[1]*s],c.u,sobra,c.rot,Math.round(s))){layout.push({k:'(casa3d)',lado,s,w:sobra,d:0});return;}const mid=s+sobra/2,x=c.P[0]+c.u[0]*mid,z=c.P[1]+c.u[1]*mid;const m=caixa(sobra,1.8,.2,muroMat,x,.9,z,c.rot);m.translateZ(-.1);layout.push({k:'(muro)',lado,s,w:sobra,d:0});}
for(let[lado,lista]of Object.entries(LADOS)){const c=LADO_CFG[lado];let s=c.s0;
 const put=k=>{const g=built[k],d=dim[k];g.rotation.y=c.rot;g.position.set(c.P[0]+c.u[0]*(s-d.minx),0,c.P[1]+c.u[1]*(s-d.minx));S.add(g);layout.push({k,lado,s,w:d.w,d:d.d});s+=d.w+GAP;};
 if(lista[0]==='~'){const it=lista.slice(1),folga=Math.max(0,c.L-c.s0-soma(it))/(it.length-1);
  it.forEach((k,i)=>{if(i&&folga>.5){muro(c,s-GAP,folga+GAP,lado);s+=folga;}put(k);});continue;}
 const iB=lista.indexOf('|'),ini=iB<0?lista:lista.slice(0,iB),fim=iB<0?[]:lista.slice(iB+1);
 ini.forEach(put);const sFim=c.L-soma(fim)+GAP;if(sFim-s>.5)muro(c,s,sFim-s,lado);s=Math.max(s,sFim);fim.forEach(put);
 const sobra=c.L-s;if(sobra>.5)muro(c,s,sobra,lado);
}
// usuário: "pode alterar tudo por essas" -> todas as casas/lojas viram a casa 3D; terrenos vazios/gramado ficam
const MANTER=new Set(['lote_vazio','lote_portao']);
if(casaTpl)for(const L of layout){if(L.k[0]==='('||MANTER.has(L.k))continue;const c=LADO_CFG[L.lado];S.remove(built[L.k]);
 fileira([c.P[0]+c.u[0]*L.s,c.P[1]+c.u[1]*L.s],c.u,L.w,c.rot,Math.round(L.s)+7);L.k='(casa3d:'+L.k+')';}
// chão: asfalto, grama no miolo, calçadas e meio-fio
const tot=new THREE.Mesh(new THREE.PlaneGeometry(Lx+120,zOp+120),asfMat);tot.rotation.x=-Math.PI/2;tot.position.set(Lx/2,-.03,zOp/2);S.add(tot);
const gr=new THREE.Mesh(new THREE.PlaneGeometry(Lx,Lz),gramaMat);gr.rotation.x=-Math.PI/2;gr.position.set(Lx/2,-.02,Lz/2);S.add(gr);
function calcada(x0,z0,x1,z1){const p=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),calcMat);p.rotation.x=-Math.PI/2;p.position.set((x0+x1)/2,-.015,(z0+z1)/2);S.add(p);}
calcada(-SW,-SW,Lx+SW,0);calcada(-SW,Lz,Lx+SW,Lz+SW);calcada(-SW,0,0,Lz);calcada(Lx,0,Lx+SW,Lz);
// meio-fio (anel em volta da quadra + lado oposto)
const mf=(w,d,x,z)=>caixa(w,.15,d,meioMat,x,.075,z);
mf(Lx+2*SW,.2,Lx/2,-SW);mf(Lx+2*SW,.2,Lx/2,Lz+SW);mf(.2,Lz+2*SW,-SW,Lz/2);mf(.2,Lz+2*SW,Lx+SW,Lz/2);
// faixas centrais
const fx=M({color:0xe9d36a,emissive:0x222200});
for(let x=-SW-ST;x<Lx+SW+ST;x+=6){caixa(3,.01,.15,fx,x+1.5,.0,Lz+SW+ST/2);caixa(3,.01,.15,fx,x+1.5,0,-SW-ST/2);}
for(let z=-SW-ST;z<zOp;z+=6){caixa(.15,.01,3,fx,-SW-ST/2,0,z+1.5);caixa(.15,.01,3,fx,Lx+SW+ST/2,0,z+1.5);}
// quarteirões vizinhos (do outro lado das 4 ruas), de frente p/ a quadra principal
{const o=2*SW+ST;
 calcada(-SW-o,Lz+o,Lx+SW+o,Lz+o+SW);calcada(-SW-o,-o-SW,Lx+SW+o,-o);calcada(-o-SW,-o,-o,Lz+o);calcada(Lx+o,-o,Lx+o+SW,Lz+o);
 fileira([0,Lz+o+SW],[1,0],Lx,Math.PI,100);      // Av. Tiradentes (lado oposto)
 fileira([Lx,-o-SW],[-1,0],Lx,0,200);            // R. Sete de Setembro
 fileira([-o-SW,Lz],[0,-1],Lz,Math.PI/2,300);    // R. Castro Alves
 fileira([Lx+o+SW,0],[0,1],Lz,-Math.PI/2,400);}  // R. Rui Barbosa
// placas de rua
function placa(txt,x,z,ry){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.fillStyle='#1d4f9a';g.fillRect(0,0,512,96);g.fillStyle='#fff';g.font='bold 44px sans-serif';g.textAlign='center';g.fillText(txt,256,64);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const p=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.45),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));p.position.set(x,3,z);p.rotation.y=ry;S.add(p);caixa(.08,3,.08,M({color:0x555555}),x,1.5,z);}
placa('Av. Tiradentes',Lx+SW-.3,Lz+SW-.3,0);placa('R. Rui Barbosa',Lx+SW-.3,Lz+SW-.6,Math.PI/2);
placa('R. Sete de Setembro',-SW+.3,-SW+.3,0);placa('R. Castro Alves',-SW+.3,-SW+.6,Math.PI/2);

// ---------- colisão (caixas por malha, grade espacial) ----------
S.updateMatrixWorld(true);const caixas=[],grade=new Map(),CEL=4,key=(i,j)=>i+','+j;
S.traverse(o=>{if(!o.isMesh||o===tot||o===gr)return;if(o.material&&o.material.transparent&&o.material.opacity<.3)return;
 const b=new THREE.Box3().setFromObject(o);const sx=b.max.x-b.min.x,sy=b.max.y-b.min.y,sz=b.max.z-b.min.z;
 if(sy<.05&&b.max.y<.2)return; if(sx>80||sz>80)return; caixas.push(b);
 for(let i=Math.floor(b.min.x/CEL);i<=Math.floor(b.max.x/CEL);i++)for(let j=Math.floor(b.min.z/CEL);j<=Math.floor(b.max.z/CEL);j++){const kk=key(i,j);if(!grade.has(kk))grade.set(kk,[]);grade.get(kk).push(b);}});
function perto(x,z){const r=[],i=Math.floor(x/CEL),j=Math.floor(z/CEL),vis=new Set();for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++)for(const c of grade.get(key(a,b))||[])if(!vis.has(c)){vis.add(c);r.push(c);}return r;}
const RAIO=.35,ALT=1.7,PASSO=.45;
function chao(x,z,pes){let h=0;for(const b of perto(x,z))if(x>b.min.x-RAIO*.5&&x<b.max.x+RAIO*.5&&z>b.min.z-RAIO*.5&&z<b.max.z+RAIO*.5&&b.max.y<=pes+PASSO&&b.max.y>h&&(b.max.y-b.min.y)<1.2)h=b.max.y;return h;}
function bate(x,z,pes){for(const b of perto(x,z)){if(b.max.y<=pes+PASSO||b.min.y>=pes+ALT)continue;
 if(x>b.min.x-RAIO&&x<b.max.x+RAIO&&z>b.min.z-RAIO&&z<b.max.z+RAIO)return true;}return false;}

// ---------- jogador ----------
const spawn=new THREE.Vector3(Lx/2,0,Lz+SW+ST/2); // meio da Av. Tiradentes
const pl={p:spawn.clone(),vy:0,noChao:true};
const player=new THREE.Group();S.add(player);
let sd=null;try{sd=await createSoldado('../skin/');player.add(sd.object);sd.setFirstPerson(true);}catch(e){console.log('ERR soldado '+e);const corpo=new THREE.Mesh(new THREE.CapsuleGeometry(RAIO,ALT-2*RAIO,4,12),M({color:0x2f6fd0}));corpo.position.y=ALT/2;player.add(corpo);}
let terceira=false;const camAlvo=new THREE.Vector3();
const ctl=new PointerLockControls(cam,document.body);cam.rotation.set(0,0,0);cam.rotation.order='YXZ';
// arma + clarão
const arma=new THREE.Group();const am=M({color:0x222222,roughness:.5,metalness:.6});
const cano=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,.45),am);arma.add(cano);const cabo=new THREE.Mesh(new THREE.BoxGeometry(.06,.16,.08),am);cabo.position.set(0,-.1,.12);arma.add(cabo);
arma.position.set(.22,-.2,-.45);cam.add(arma);S.add(cam);
const flash=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0xffd27a}));flash.position.set(0,0,-.28);flash.visible=false;arma.add(flash);
const luzF=new THREE.PointLight(0xffb040,0,6);luzF.position.set(.22,-.2,-.8);cam.add(luzF);
const marcas=[];const marcaMat=new THREE.MeshBasicMaterial({color:0x111111});const marcaGeo=new THREE.CircleGeometry(.05,8);
const ray=new THREE.Raycaster();let tFlash=0;
const alvos=S.children.filter(o=>o!==player&&o!==cam&&!o.isLight);
function atirar(){if(sd)sd.atirar();else{flash.visible=true;luzF.intensity=3;tFlash=.05;arma.position.z=-.4;}
 ray.setFromCamera({x:0,y:0},cam);ray.far=200;const h=ray.intersectObjects(alvos,true)[0];
 if(h){const m=new THREE.Mesh(marcaGeo,marcaMat);m.position.copy(h.point);if(h.face){const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);m.lookAt(h.point.clone().add(n));m.position.addScaledVector(n,.01);}
  S.add(m);marcas.push(m);if(marcas.length>60)S.remove(marcas.shift());hitEl.style.transition='none';hitEl.style.opacity=1;requestAnimationFrame(()=>{hitEl.style.transition='opacity .25s';hitEl.style.opacity=0;});}}
const tecla={};addEventListener('keydown',e=>{tecla[e.code]=true;if(e.code==='KeyV'&&sd){terceira=!terceira;sd.setFirstPerson(!terceira);}if(e.code==='Space')e.preventDefault();});addEventListener('keyup',e=>tecla[e.code]=false);
let jogando=false;const MV={x:0,y:0,corre:false,toggle:false,fogo:false};
if(!MOBILE)info.addEventListener('click',()=>ctl.lock());ctl.addEventListener('lock',()=>info.style.display='none');ctl.addEventListener('unlock',()=>info.style.display='flex');
addEventListener('mousedown',e=>{if(ctl.isLocked&&e.button===0)atirar();});
cam.position.set(spawn.x,1.6,spawn.z);cam.lookAt(spawn.x,1.6,spawn.z-10);
// ---------- controles de toque ----------
let tFogo=0;
if(MOBILE){
 const css=document.createElement('style');css.textContent=`html,body{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;position:fixed;inset:0}
 #tc{position:fixed;inset:0;z-index:5;display:none}#joy{position:fixed;left:4vw;bottom:6vh;width:150px;height:150px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.4);z-index:6;display:none}
 #joyK{position:absolute;left:45px;top:45px;width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.45)}
 .bt{position:fixed;z-index:6;border-radius:50%;background:rgba(0,0,0,.35);border:2px solid rgba(255,255,255,.55);color:#fff;font:bold 12px sans-serif;text-align:center;display:none;align-items:center;justify-content:center;text-shadow:0 0 2px #000}
 .bt.on{background:rgba(255,190,60,.55)}#bFogo{right:5vw;bottom:9vh;width:96px;height:96px;font-size:14px;background:rgba(200,30,30,.45)}
 #bPulo{right:calc(5vw + 108px);bottom:5vh;width:68px;height:68px}#bCorre{right:calc(5vw + 20px);bottom:calc(9vh + 108px);width:64px;height:64px;font-size:11px}
 #bCam{right:12px;top:12px;width:58px;height:58px;font-size:11px}#gire{position:fixed;inset:0;z-index:20;background:#111;color:#fff;display:none;align-items:center;justify-content:center;text-align:center;font:18px sans-serif}
 @media (orientation:portrait){#gire{display:flex}}#hud{font-size:11px;left:50%;transform:translateX(-50%);bottom:auto;top:6px}`;
 document.head.appendChild(css);
 document.body.insertAdjacentHTML('beforeend',`<div id="tc"></div><div id="joy"><div id="joyK"></div></div><div class="bt" id="bFogo">ATIRAR</div><div class="bt" id="bPulo">PULAR</div><div class="bt" id="bCorre">CORRER</div><div class="bt" id="bCam">CÂMERA<br>1ª</div><div id="gire"><div>📱↻<br><br>Gire o celular<br>para jogar deitado</div></div>`);
 info.innerHTML='<div><b>Quarteirão Itaipulândia – teste</b><br><br>Toque para jogar<br><br><small>Joystick esquerdo: andar (empurre até o fim p/ correr)<br>Arraste no lado direito: mirar<br>ATIRAR (segure = rajada) · PULAR · CORRER · CÂMERA 1ª/3ª</small></div>';
 const $=id=>document.getElementById(id),joy=$('joy'),joyK=$('joyK'),tc=$('tc'),els=[joy,tc,$('bFogo'),$('bPulo'),$('bCorre'),$('bCam')];
 const mostra=v=>els.forEach(e=>e.style.display=v?(e.classList.contains('bt')?'flex':'block'):'none');
 document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturestart',e=>e.preventDefault());
 info.addEventListener('click',async()=>{try{const d=document.documentElement;await (d.requestFullscreen||d.webkitRequestFullscreen).call(d);}catch(e){}
  try{await screen.orientation.lock('landscape');}catch(e){}jogando=true;info.style.display='none';mostra(true);relogio.getDelta();});
 document.addEventListener('fullscreenchange',()=>{});
 // joystick
 let jId=null,jc={x:0,y:0};const RJ=60;
 joy.addEventListener('pointerdown',e=>{jId=e.pointerId;joy.setPointerCapture(jId);const r=joy.getBoundingClientRect();jc={x:r.left+r.width/2,y:r.top+r.height/2};jm(e);});
 function jm(e){let dx=e.clientX-jc.x,dy=e.clientY-jc.y;const d=Math.hypot(dx,dy);if(d>RJ){dx*=RJ/d;dy*=RJ/d;}joyK.style.transform=`translate(${dx}px,${dy}px)`;
  MV.x=dx/RJ;MV.y=-dy/RJ;MV.corre=Math.min(d,RJ*1.2)/RJ>.92&&MV.y>.3;}
 joy.addEventListener('pointermove',e=>{if(e.pointerId===jId)jm(e);});
 const jUp=e=>{if(e.pointerId!==jId)return;jId=null;MV.x=MV.y=0;MV.corre=false;joyK.style.transform='';};joy.addEventListener('pointerup',jUp);joy.addEventListener('pointercancel',jUp);
 // mirar arrastando (qualquer dedo fora do joystick/botões; tc cobre a tela)
 const olhar=new Map(),SENS=.0055;
 tc.addEventListener('pointerdown',e=>{olhar.set(e.pointerId,{x:e.clientX,y:e.clientY});tc.setPointerCapture(e.pointerId);});
 tc.addEventListener('pointermove',e=>{const o=olhar.get(e.pointerId);if(!o)return;cam.rotation.y-=(e.clientX-o.x)*SENS;cam.rotation.x=THREE.MathUtils.clamp(cam.rotation.x-(e.clientY-o.y)*SENS,-1.45,1.45);o.x=e.clientX;o.y=e.clientY;});
 const oUp=e=>olhar.delete(e.pointerId);tc.addEventListener('pointerup',oUp);tc.addEventListener('pointercancel',oUp);
 // botões (o dedo no ATIRAR também mira ao arrastar)
 const bF=$('bFogo');let fId=null,fp={x:0,y:0};
 bF.addEventListener('pointerdown',e=>{fId=e.pointerId;bF.setPointerCapture(fId);fp={x:e.clientX,y:e.clientY};MV.fogo=true;tFogo=0;bF.classList.add('on');});
 bF.addEventListener('pointermove',e=>{if(e.pointerId!==fId)return;cam.rotation.y-=(e.clientX-fp.x)*SENS;cam.rotation.x=THREE.MathUtils.clamp(cam.rotation.x-(e.clientY-fp.y)*SENS,-1.45,1.45);fp={x:e.clientX,y:e.clientY};});
 const fUp=e=>{if(e.pointerId!==fId)return;fId=null;MV.fogo=false;bF.classList.remove('on');};bF.addEventListener('pointerup',fUp);bF.addEventListener('pointercancel',fUp);
 const bP=$('bPulo');bP.addEventListener('pointerdown',()=>{tecla.Space=true;bP.classList.add('on');});const pUp=()=>{tecla.Space=false;bP.classList.remove('on');};bP.addEventListener('pointerup',pUp);bP.addEventListener('pointercancel',pUp);
 const bC=$('bCorre');bC.addEventListener('pointerdown',()=>{MV.toggle=!MV.toggle;bC.classList.toggle('on',MV.toggle);});
 const bV=$('bCam');bV.addEventListener('pointerdown',()=>{if(!sd)return;terceira=!terceira;sd.setFirstPerson(!terceira);bV.innerHTML='CÂMERA<br>'+(terceira?'3ª':'1ª');});
 window.__mostraControles=mostra;
 if(MODO==='mobile'){jogando=true;info.style.display='none';mostra(true);}
}

const relogio=new THREE.Clock();const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function passo(dt){
 const corre=tecla.ShiftLeft||tecla.ShiftRight||MV.corre||MV.toggle,vel=corre?5.5:2.2; /* velocidades casadas com o mocap (andar 1,7 / correr 4,4 m/s) */cam.getWorldDirection(fw);fw.y=0;fw.normalize();rt.crossVectors(fw,new THREE.Vector3(0,1,0));
 let mx=0,mz=0;if(MOBILE&&(MV.x||MV.y)){mx+=fw.x*MV.y+rt.x*MV.x;mz+=fw.z*MV.y+rt.z*MV.x;}if(tecla.KeyW){mx+=fw.x;mz+=fw.z;}if(tecla.KeyS){mx-=fw.x;mz-=fw.z;}if(tecla.KeyD){mx+=rt.x;mz+=rt.z;}if(tecla.KeyA){mx-=rt.x;mz-=rt.z;}
 const l=Math.hypot(mx,mz);if(l>0){const f=MOBILE&&!tecla.KeyW&&!tecla.KeyS&&!tecla.KeyA&&!tecla.KeyD?Math.min(1,Math.hypot(MV.x,MV.y)*1.6):1;mx=mx/l*vel*f*dt;mz=mz/l*vel*f*dt;}
 const p=pl.p;if(!bate(p.x+mx,p.z,p.y))p.x+=mx;if(!bate(p.x,p.z+mz,p.y))p.z+=mz;
 if(tecla.Space&&pl.noChao){pl.vy=5.2;pl.noChao=false;if(sd)sd.pular();}
 pl.vy-=14*dt;p.y+=pl.vy*dt;const h=chao(p.x,p.z,p.y-pl.vy*dt);if(p.y<=h){p.y=h;pl.vy=0;if(!pl.noChao&&sd)sd.setGrounded(true);pl.noChao=true;}else if(p.y>h+.3)pl.noChao=false;
 player.position.copy(p);player.rotation.y=Math.atan2(-fw.x,-fw.z);
 if(sd){const v=l>0?vel:0;sd.setMove(v,l>0?Math.atan2(mx*rt.x+mz*rt.z,mx*fw.x+mz*fw.z):0,corre&&!tecla.KeyS&&!(MV.y<-.3));}
 if(tFlash>0){tFlash-=dt;if(tFlash<=0){flash.visible=false;luzF.intensity=0;arma.position.z=-.45;}}
}
const _o=new THREE.Vector3(),_b=new THREE.Vector3(),_r=new THREE.Vector3();
function poeCamera(dt){const p=pl.p;
 if(!sd){cam.position.set(p.x,p.y+1.6,p.z);return;}
 sd.setAim(cam.rotation.x);sd.update(dt);
 if(terceira){cam.getWorldDirection(_b);_r.crossVectors(_b,new THREE.Vector3(0,1,0)).normalize();
  // atrás do ombro direito; aproxima se bater em parede
  let dist=2.9;const piv=_o.set(p.x,p.y+1.75,p.z).addScaledVector(_r,.6);
  ray.set(piv,_b.clone().negate());ray.far=dist;const hh=ray.intersectObjects(alvos,true)[0];if(hh)dist=Math.max(.4,hh.distance-.2);
  camAlvo.copy(piv).addScaledVector(_b,-dist);cam.position.lerp(camAlvo,1-Math.exp(-dt/.05));}
 else{sd.olho(_o);cam.position.x=_o.x;cam.position.z=_o.z;cam.position.y+=(_o.y-cam.position.y)*(1-Math.exp(-dt/.06));}
}
const nFalhas=Object.values(built).filter(g=>g.userData.falhou).length;
console.log('LAYOUT',JSON.stringify({Lx,Lz,dK,dBar,dG,dCh,layout}));
hud.textContent=`Quarteirão ${Lx}×${Lz} m · ${Object.keys(built).length} módulos${nFalhas?` · ${nFalhas} falharam`:''} · ${caixas.length} caixas de colisão · ${nCasas} casas 3D`;
player.visible=sd?true:!!MODO;if(sd)arma.visible=false;
if(MODO==='topo'){info.style.display='none';document.getElementById('mira').style.display='none';hud.style.display='none';arma.visible=false;
 const c2=new THREE.OrthographicCamera(-1,1,1,-1,.1,500);const cx=Lx/2,cz=Lz/2,half=(Lz+2*SW+2*ST+6)/2+16;
 const a=innerWidth/innerHeight;c2.left=-half*a;c2.right=half*a;c2.top=half;c2.bottom=-half;c2.updateProjectionMatrix();c2.position.set(cx,200,cz);c2.up.set(0,0,-1);c2.lookAt(cx,0,cz);
 S.fog=null;player.position.copy(spawn);
 for(const L of layout){if(L.k[0]==='(')continue;const b=new THREE.Box3().setFromObject(built[L.k]),c=b.getCenter(new THREE.Vector3());
  const cv=document.createElement('canvas');cv.width=512;cv.height=96;const g=cv.getContext('2d');g.font='bold 52px sans-serif';const tw=g.measureText(L.k).width+24;
  g.fillStyle='rgba(0,0,0,.65)';g.fillRect((512-tw)/2,10,tw,76);g.fillStyle='#fff';g.textAlign='center';g.fillText(L.k,256,66);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sp.scale.set(24,4.5,1);sp.position.set(c.x,60,c.z);sp.renderOrder=9;S.add(sp);}player.scale.setScalar(3);
 let n=0;(function f(){R.render(S,c2);if(++n<30)requestAnimationFrame(f);else document.title='PRONTO';})();}
else if(MODO==='rua'){info.style.display='none';
 const p=new THREE.Vector3(LADO_CFG.tiradentes.P[0]+4,0,Lz+SW+3);cam.position.set(p.x,1.6,p.z);cam.lookAt(p.x+18,2.5,Lz-2);atirar();
 let n=0;(function f(){R.render(S,cam);if(++n<30)requestAnimationFrame(f);else document.title='PRONTO';})();}
else if(MODO==='3p'||MODO==='1p'){info.style.display='none';terceira=MODO==='3p';sd.setFirstPerson(!terceira);
 pl.p.set(LADO_CFG.tiradentes.P[0]+14,0,Lz+SW+4.5);cam.rotation.set(-.05,-Math.PI/2+.5,0);tecla.KeyW=true;
 for(let i=0;i<50;i++){passo(1/30);poeCamera(1/30);}tecla.KeyW=false;if(terceira)sd.atirar();for(let i=0;i<3;i++){passo(1/60);poeCamera(1/60);}
 let n=0;(function f(){R.render(S,cam);if(++n<20)requestAnimationFrame(f);else document.title='PRONTO';})();}
else{(function loop(){requestAnimationFrame(loop);const dt=Math.min(relogio.getDelta(),.05);if(ctl.isLocked||jogando){if(MV.fogo){tFogo-=dt;if(tFogo<=0){atirar();tFogo=.11;}}passo(dt);}poeCamera(dt);R.render(S,cam);})();}
