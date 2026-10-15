// Quarteirão Itaipulândia — mapa completo + teste FPS (three.js r160).
// Cenário: modelos/mapa_novo.glb (mapa baixado pelo usuário). Quarteirão antigo em mapa/backup_quarteirao/ e /mapa_antigo/ no site.
// Antigo: x∈[0,Lx], z∈[0,Lz]. z=Lz Av. Tiradentes (+z), z=0 R. Sete de Setembro (−z), x=0 R. Castro Alves (−x), x=Lx R. Rui Barbosa (+x).
import * as THREE from 'three';
import {computeBoundsTree,acceleratedRaycast} from 'three-mesh-bvh';
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
const cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,700);
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);});

// ---------- cenário (glb) + colisão por raycast com BVH ----------
THREE.BufferGeometry.prototype.computeBoundsTree=computeBoundsTree;THREE.Mesh.prototype.raycast=acceleratedRaycast;
const B='../';const ESC=2.5; // mapa original ~70x45 un, árvores ~4,6 un -> x2,5 dá escala coerente c/ soldado de 1,8 m
const ld=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
hud.textContent='carregando mapa…';
const [mapa,mapa2]=await Promise.all([ld.loadAsync(B+'modelos/mapa_novo.glb'),ld.loadAsync(B+'modelos/mapa_novo2.glb')]).then(r=>r.map(x=>x.scene));
mapa.scale.setScalar(ESC);S.add(mapa);mapa.updateMatrixWorld(true);
// mapa 2 (serra com estrada de terra, já em metros): o pé da estrada (−106,132,−55 no original) encosta na borda leste do mapa 1 (x=50) em y=0
const OFF2=new THREE.Vector3(181,-132.2,39);mapa2.position.copy(OFF2);S.add(mapa2);mapa2.updateMatrixWorld(true);
const chaoMs=[],paredeMs=[],ocupMs=[];
function filtraTri(o,fora){const g=o.geometry,P=g.attributes.position,I=g.index;if(!I)return;const v=new THREE.Vector3(),keep=[];
 for(let i=0;i<I.count;i+=3){let n=0;for(let k=0;k<3;k++){v.fromBufferAttribute(P,I.getX(i+k)).applyMatrix4(o.matrixWorld);if(fora(v))n++;}if(n<3)keep.push(I.getX(i),I.getX(i+1),I.getX(i+2));}
 if(keep.length<I.count)g.setIndex(keep);}
mapa.traverse(o=>{if(!o.isMesh)return;const n=o.name;
 if(n.startsWith('Sphere')||n.startsWith('Plane002')||n.startsWith('Plane003')){o.visible=false;return;} // céu em domo (não cobre o mapa 2) e protótipos flutuando
 filtraTri(o,v=>v.y>30*ESC); // protótipos de árvore flutuando
 for(const m of [].concat(o.material))if(m)m.side=THREE.DoubleSide;o.geometry.computeBoundsTree();
 if(/^Plane_Material001|^Plane00[679]/.test(n))chaoMs.push(o);
 if(/^Plane00[14579]|^Plane2522/.test(n)){paredeMs.push(o);ocupMs.push(o);}
});
const B1=new THREE.Box3();mapa.traverse(o=>{if(o.isMesh&&o.name.startsWith('Plane_Material001'))B1.expandByObject(o);});
mapa2.traverse(o=>{if(!o.isMesh)return;const n=o.name;
 filtraTri(o,v=>v.x<B1.max.x-1&&v.z>B1.min.z-2&&v.z<B1.max.z+2); // o que fica por baixo do mapa 1 sai (sem sobreposição)
 for(const m of [].concat(o.material))if(m)m.side=THREE.DoubleSide;o.geometry.computeBoundsTree();
 if(/Terrain|Aerial_Grass|Grass_Close|Dirt_Road|Road_Edge|Cobblestone|Ground_Dirt|Mud_Pile|Puddle|Rock_Decal|Sloped_Rock|Tall_Cliff|Broken_Rocks/.test(n))chaoMs.push(o);
 if(/Trunk|Tall_Cliff|Sloped_Rock|Broken_Rocks|Fence|Wood_Log/.test(n))paredeMs.push(o);
 if(/Trunk|Atlas001|Forest_Bush|Fence|Wood_Log|Tall_Cliff|Broken_Rocks|Dirt_Road|Road_Edge|Cobblestone/.test(n))ocupMs.push(o); // não pôr casa em cima
});
// faixa de ligação (estrada de terra) entre a borda do mapa 1 e o pé da estrada do mapa 2
{const lig=new THREE.Mesh(new THREE.PlaneGeometry(34,46),new THREE.MeshStandardMaterial({color:0x6f6250,roughness:1}));lig.rotation.x=-Math.PI/2;lig.position.set(B1.max.x+15,.04,-16);S.add(lig);lig.updateMatrixWorld(true);lig.geometry.computeBoundsTree();chaoMs.push(lig);}
const rc=new THREE.Raycaster();rc.firstHitOnly=true;const _d=new THREE.Vector3(0,-1,0),_v=new THREE.Vector3();
function altura(x,z,de=200,lista=chaoMs){rc.set(_v.set(x,de,z),_d);rc.far=de+50;const h=rc.intersectObjects(lista,false)[0];return h?h.point.y:null;}
// ---------- casas baixadas: pontos aleatórios (seed fixa), longe umas das outras ----------
let rs=20261015;const rnd=()=>((rs=Math.imul(rs^rs>>>15,1|rs)+0x6D2B79F5|0,rs^=rs+Math.imul(rs^rs>>>7,61|rs),((rs^rs>>>14)>>>0)/4294967296));
const casaTpls=[];
{let lista=[];try{lista=(await (await fetch(B+'modelos/lista.json',{cache:'no-cache'})).json()).modelos;}catch(e){console.error('falhou lista.json',e);}
 await Promise.all(lista.map(async(M0)=>{try{const r=(await ld.loadAsync(B+'modelos/'+M0.arquivo)).scene;
  const piv=new THREE.Group();piv.add(r);r.rotation.y=THREE.MathUtils.degToRad(M0.rotY||0);piv.updateMatrixWorld(true);
  let b=new THREE.Box3().setFromObject(piv),sz=b.getSize(new THREE.Vector3());
  const W=M0.altura?sz.x*M0.altura/sz.y:(M0.largura||11);piv.scale.setScalar(W/Math.max(sz.x,1e-6));piv.updateMatrixWorld(true);b.setFromObject(piv);
  const c=b.getCenter(new THREE.Vector3());const t=new THREE.Group();t.add(piv);piv.position.set(-c.x,-b.min.y,-c.z);b.getSize(sz);t.userData={w:sz.x,d:sz.z,nome:M0.arquivo};
  t.traverse(o=>{if(o.isMesh){o.geometry.computeBoundsTree();}});casaTpls.push(t);}catch(e){console.error('falhou modelo',M0.arquivo,e);}}));
 casaTpls.sort((x,y)=>x.userData.nome<y.userData.nome?-1:1);}
const chaoB=B1.clone();const AREA=new THREE.Box3(new THREE.Vector3(B1.min.x,-50,-121),new THREE.Vector3(301,100,199));
const spawn=new THREE.Vector3();
{let melhor=-1;for(let i=0;i<400;i++){const x=THREE.MathUtils.lerp(chaoB.min.x+8,chaoB.max.x-8,rnd()),z=THREE.MathUtils.lerp(chaoB.min.z+8,chaoB.max.z-8,rnd());
  const h=altura(x,z);if(h===null||h>3)continue;const t=altura(x,z,200,ocupMs);if(t!==null&&t>h+.3)continue; // não em cima de árvore
  const d=Math.hypot(x-(chaoB.min.x+chaoB.max.x)/2,z-(chaoB.min.z+chaoB.max.z)/2);if(melhor<0||d<melhor){melhor=d;spawn.set(x,h,z);}}}
const casas=[],DMIN=Math.max(40,Math.min(60,Math.min(AREA.max.x-AREA.min.x,AREA.max.z-AREA.min.z)*.35));
for(let tent=0;tent<6000&&casaTpls.length;tent++){const T=casaTpls[(casas.length+(tent>>8))%casaTpls.length],R0=Math.max(T.userData.w,T.userData.d)/2;
 const x=THREE.MathUtils.lerp(AREA.min.x+R0+2,AREA.max.x-R0-2,rnd()),z=THREE.MathUtils.lerp(AREA.min.z+R0+2,AREA.max.z-R0-2,rnd()),ry=rnd()*Math.PI*2;
 if(Math.hypot(x-spawn.x,z-spawn.z)<R0+12)continue;if(casas.some(c=>Math.hypot(c.x-x,c.z-z)<DMIN))continue;
 // plano e livre: amostra 9 pontos do retângulo girado
 let hs=[],ok=true;for(const a of [-.5,0,.5])for(const bq of [-.5,0,.5]){const lx=a*T.userData.w,lz=bq*T.userData.d,px=x+lx*Math.cos(ry)+lz*Math.sin(ry),pz=z-lx*Math.sin(ry)+lz*Math.cos(ry);
  const h=altura(px,pz);if(h===null){ok=false;break;}const t=altura(px,pz,200,ocupMs);if(t!==null&&t>h-.3){ok=false;break;}hs.push(h);}
 if(!ok||Math.max(...hs)-Math.min(...hs)>2.5)continue;
 const g=T.clone();g.position.set(x,Math.min(...hs)-.05,z);g.rotation.y=ry;S.add(g);casas.push({x,z,g,nome:T.userData.nome});
 // tenta trocar o modelo na próxima vez se este não couber
}
for(const c of casas){c.g.updateMatrixWorld(true);c.g.traverse(o=>{if(o.isMesh){chaoMs.push(o);paredeMs.push(o);}});}
console.log('CASAS',casas.length,'DMIN',DMIN.toFixed(0),JSON.stringify(casas.map(c=>[c.nome,+c.x.toFixed(1),+c.z.toFixed(1)])));
const M=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.95},o));
function caixa(w,h,d,mat,x,y,z,ry=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;S.add(m);return m;}
// ---------- colisão ----------
const RAIO=.35,ALT=1.7,PASSO=.45;
function chao(x,z,pes){const h=altura(x,z,pes+PASSO+.05);return h===null?-1e9:h;}
const DIRS=[...Array(8)].map((_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/4),0,Math.sin(i*Math.PI/4)));
function bate(x,z,pes){const h=altura(x,z,pes+PASSO+.05);if(h===null)return true; // fora do mapa ou degrau alto demais
 for(const y of [pes+.6,pes+1.4])for(const d of DIRS){rc.set(_v.set(x,y,z),d);rc.far=RAIO;if(rc.intersectObjects(paredeMs,false).length)return true;}return false;}
// ---------- jogador ----------
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
hud.textContent=`Mapa novo · ${casas.length} casas 3D`;
player.visible=sd?true:!!MODO;if(sd)arma.visible=false;
if(MODO==='topo'){info.style.display='none';document.getElementById('mira').style.display='none';hud.style.display='none';arma.visible=false;
 const c2=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,2000);const cx=(AREA.min.x+AREA.max.x)/2,cz=(AREA.min.z+AREA.max.z)/2;
 c2.position.set(cx,420,cz+160);c2.lookAt(cx,0,cz-10);S.fog=null;S.traverse(o=>{if(o.isMesh&&o.name.startsWith('Sphere'))o.visible=false;});player.scale.setScalar(4);
 let n=0;(function f(){R.render(S,c2);if(++n<30)requestAnimationFrame(f);else document.title='PRONTO';})();}
else if(MODO==='rua'){info.style.display='none';
 const p=spawn;cam.position.set(p.x,p.y+1.6,p.z);const c0=casas[0]||{x:p.x,z:p.z-10};cam.lookAt(c0.x,p.y+3,c0.z);atirar();
 let n=0;(function f(){R.render(S,cam);if(++n<30)requestAnimationFrame(f);else document.title='PRONTO';})();}
else if(MODO==='3p'||MODO==='1p'){info.style.display='none';terceira=MODO==='3p';sd.setFirstPerson(!terceira);
 pl.p.copy(spawn);cam.rotation.set(-.05,-Math.PI/2+.5,0);tecla.KeyW=true;
 for(let i=0;i<50;i++){passo(1/30);poeCamera(1/30);}tecla.KeyW=false;if(terceira)sd.atirar();for(let i=0;i<3;i++){passo(1/60);poeCamera(1/60);}
 let n=0;(function f(){R.render(S,cam);if(++n<20)requestAnimationFrame(f);else document.title='PRONTO';})();}
else{(function loop(){requestAnimationFrame(loop);const dt=Math.min(relogio.getDelta(),.05);if(ctl.isLocked||jogando){if(MV.fogo){tFogo-=dt;if(tFogo<=0){atirar();tFogo=.11;}}passo(dt);}poeCamera(dt);R.render(S,cam);})();}
