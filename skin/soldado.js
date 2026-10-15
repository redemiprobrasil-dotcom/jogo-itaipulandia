// Soldado jogável — personagem riggado com animação de captura de movimento (mocap) real.
// Base: three.js examples Soldier.glb (rig Mixamo; clipes Idle/Walk/Run de mocap), retexturizado em multicam
// a partir das imagens do usuário + equipamento preso aos ossos. Tronco/braços: camada de mira (IK de dois ossos
// segurando o fuzil, curvatura da coluna, recuo com mola). Pernas: sempre o mocap, com velocidade casada ao movimento.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const V=()=>new THREE.Vector3(), Q=()=>new THREE.Quaternion();
const UP=new THREE.Vector3(0,1,0);
const _q1=Q(),_q2=Q(),_v1=V(),_v2=V(),_v3=V();

function rotWorld(bone,qd){const pq=bone.parent.getWorldQuaternion(_q1);const inv=_q2.copy(pq).invert();bone.quaternion.premultiply(inv.multiply(qd).multiply(pq));bone.updateMatrixWorld(true);}
function rotAxis(bone,axis,ang){rotWorld(bone,Q().setFromAxisAngle(axis,ang));}
function rotFromTo(bone,from,to){rotWorld(bone,Q().setFromUnitVectors(from.clone().normalize(),to.clone().normalize()));}
function wpos(o,t=V()){return o.getWorldPosition(t);}
function setWorldQuat(bone,qw){const pq=bone.parent.getWorldQuaternion(_q1).invert();bone.quaternion.copy(pq.multiply(qw));bone.updateMatrixWorld(true);}
function basis(f,n){const fx=f.clone().normalize();const nn=n.clone().addScaledVector(fx,-n.dot(fx)).normalize();const s=V().crossVectors(fx,nn);return new THREE.Matrix4().makeBasis(fx,nn,s);}

function ik(upper,lower,hand,target,pole){
 const a=wpos(upper),b=wpos(lower),c=wpos(hand);const la=a.distanceTo(b),lb=b.distanceTo(c);
 let d=a.distanceTo(target);d=THREE.MathUtils.clamp(d,1e-3,(la+lb)*.999);
 const dir=V().subVectors(target,a).normalize();const ca=THREE.MathUtils.clamp((la*la+d*d-lb*lb)/(2*la*d),-1,1),sa=Math.sqrt(1-ca*ca);
 const pv=V().subVectors(pole,a);pv.addScaledVector(dir,-pv.dot(dir)).normalize();
 const el=a.clone().addScaledVector(dir,la*ca).addScaledVector(pv,la*sa);
 rotFromTo(upper,V().subVectors(b,a),V().subVectors(el,a));
 const b2=wpos(lower),c2=wpos(hand);rotFromTo(lower,V().subVectors(c2,b2),V().subVectors(target,b2));
}

export async function createSoldado(base='./'){
 const gltf=await new GLTFLoader().loadAsync(base+'models/Soldier.glb');
 const model=gltf.scene,root=new THREE.Group();root.name='soldado';root.add(model);
 const tex=await new THREE.TextureLoader().loadAsync(base+'tex_soldier_camo.jpg');tex.flipY=false;tex.colorSpace=THREE.SRGBColorSpace;
 const mc=await new THREE.TextureLoader().loadAsync(base+'tex_mc.jpg');mc.colorSpace=THREE.SRGBColorSpace;mc.wrapS=mc.wrapT=THREE.RepeatWrapping;
 let corpo,visor;const uFP={value:0},uCut={value:new THREE.Vector4(0,0,0,.3)};
 model.traverse(o=>{if(!o.isMesh)return;o.frustumCulled=false;
  if(/visor/i.test(o.name))(visor=o).material=new THREE.MeshStandardMaterial({color:0x0c0c0c,roughness:.12,metalness:.7});
  else{corpo=o;o.material=o.material.clone();o.material.map=tex;o.material.color.setRGB(1,1,1);o.material.roughness=.92;o.material.metalness=0;
   // 1ª pessoa: some só a parte do corpo perto da cabeça/ombros (braços e fuzil continuam visíveis)
   o.material.onBeforeCompile=sh=>{sh.uniforms.uFP=uFP;sh.uniforms.uCut=uCut;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>','#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uFP;uniform vec4 uCut;').replace('void main() {','void main() {\nif(uFP>.5&&(distance(vWP,uCut.xyz)<uCut.w||vWP.y>uCut.y))discard;');};}});
 const B={};model.traverse(o=>{if(o.isBone||/mixamorig/.test(o.name))B[o.name.replace('mixamorig','').replace(':','')]=o;});
 // escala/orientação: altura 1,80 m, frente para −Z
 model.updateMatrixWorld(true);let bb=new THREE.Box3().setFromObject(model,true);
 model.scale.multiplyScalar(1.8/(bb.max.y-bb.min.y));model.updateMatrixWorld(true);
 if(wpos(B.LeftArm).x>wpos(B.RightArm).x)model.rotation.y=Math.PI;model.updateMatrixWorld(true);
 bb=new THREE.Box3().setFromObject(model,true);model.position.y-=bb.min.y;model.updateMatrixWorld(true);

 // fatia do corpo (pose de repouso) p/ dimensionar o equipamento
 const vtx=[];corpo.skeleton.update();{const p=V(),n=corpo.geometry.attributes.position.count;for(let i=0;i<n;i+=2){corpo.getVertexPosition(i,p);vtx.push(p.clone().applyMatrix4(corpo.matrixWorld));}}
 function fatia(y0,y1,x0=-9,x1=9){const b=new THREE.Box3();for(const p of vtx)if(p.y>=y0&&p.y<=y1&&p.x>=x0&&p.x<=x1)b.expandByPoint(p);return b;}

 // ---------- materiais ----------
 const mcm=(rep,c=0xffffff)=>{const t=mc.clone();t.repeat.set(rep,rep);t.needsUpdate=true;return new THREE.MeshStandardMaterial({map:t,color:c,roughness:.95});};
 const camo=mcm(2),camoEsc=mcm(2,0xb8b0a0),
  coyote=new THREE.MeshStandardMaterial({color:0x8a7656,roughness:.95}),coyEsc=new THREE.MeshStandardMaterial({color:0x6c5c44,roughness:.95}),
  verde=new THREE.MeshStandardMaterial({color:0x4b4a36,roughness:.9}),preto=new THREE.MeshStandardMaterial({color:0x1b1b1a,roughness:.6,metalness:.3}),
  lente=new THREE.MeshStandardMaterial({color:0x080808,roughness:.05,metalness:.9}),bota=new THREE.MeshStandardMaterial({color:0x9c8461,roughness:.95}),
  sola=new THREE.MeshStandardMaterial({color:0x3a3128,roughness:1}),arma_m=new THREE.MeshStandardMaterial({color:0x1d1e1f,roughness:.45,metalness:.55});
 const mascTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#6f6a52';g.fillRect(0,0,64,64);g.fillStyle='#3a382a';for(let y=0;y<64;y+=4)for(let x=(y/4)%2*2;x<64;x+=4)g.fillRect(x,y,2,2);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,4);t.colorSpace=THREE.SRGBColorSpace;return t;})();
 const masc=new THREE.MeshStandardMaterial({map:mascTex,roughness:1});
 const box=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return o;};
 const rbox=(w,h,d,m,x,y,z)=>{const o=box(w,h,d,m,x,y,z);o.geometry=new THREE.BoxGeometry(w,h,d,2,2,2);const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=V().fromBufferAttribute(p,i);const k=.92+.08*Math.cos(v.x/w*2.8)*Math.cos(v.y/h*2.8);p.setXYZ(i,v.x*(Math.abs(v.y)>h*.4?k:1),v.y,v.z*k);}o.geometry.computeVertexNormals();return o;};
 const prender=(bone,o)=>{root.updateMatrixWorld(true);bone.attach(o);return o;};
 const equip={cabeca:[],corpo:[]};

 // ---------- capacete FAST + headset + óculos + máscara ----------
 const hP=wpos(B.Head),hT=wpos(B.HeadTop_End);const hb=fatia(hP.y+.03,hT.y+.05,hP.x-.14,hP.x+.14);const hc=hb.getCenter(V()),hs=hb.getSize(V());
 const R=Math.max(hs.x,hs.z)*.5+.018;
 const cap=new THREE.Group();
 const casco=new THREE.Mesh(new THREE.SphereGeometry(R,28,16,0,Math.PI*2,0,Math.PI*.5),camo);casco.scale.set(1,.88,1.08);cap.add(casco);
 const aba=new THREE.Mesh(new THREE.CylinderGeometry(R*1.005,R*1.02,R*.32,28,1,true,Math.PI*.62,Math.PI*1.76),camo);aba.position.y=-R*.15;aba.scale.z=1.08;aba.material.side=THREE.DoubleSide;cap.add(aba);
 for(const s of[-1,1]){const tr=box(.012,.03,R*1.3,coyEsc,s*R*.99,-R*.05,0);cap.add(tr); // trilhos laterais
  const con=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.035,20),verde);con.rotation.z=Math.PI/2;con.position.set(s*(R+.022),-R*.42,.0);cap.add(con);
  const ar=new THREE.Mesh(new THREE.TorusGeometry(R+.02,.009,6,24,Math.PI*.6),preto);ar.rotation.y=Math.PI/2;ar.rotation.z=Math.PI*.2;ar.position.set(s*.02,0,0);}
 const mic=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.11,6),preto);mic.rotation.x=Math.PI/2;mic.rotation.z=.5;mic.position.set(-R*.75,-R*.6,-R*.6);cap.add(mic);
 cap.add(box(.05,.045,.025,preto,0,R*.38,-R*1.03));cap.add(box(.02,.04,.03,preto,0,R*.2,-R*1.07)); // suporte NVG
 cap.add(box(.06,.035,.05,coyEsc,0,R*.4,R*1.0)); // contrapeso
 cap.add(box(.1,.02,.02,coyEsc,0,R*.84,-.01));
 cap.position.set(hc.x,hc.y+hs.y*.08,hc.z);
 const eyeY=hP.y+(hT.y-hP.y)*.33,fz=hb.min.z;
 const ocul=new THREE.Group();const lt=new THREE.Mesh(new THREE.CylinderGeometry(R*.93,R*.93,.045,24,1,true,Math.PI*.72,Math.PI*.56),lente);lt.material.side=THREE.DoubleSide;ocul.add(lt);
 ocul.position.set(hc.x,eyeY,hc.z+.01);
 const mas=new THREE.Mesh(new THREE.CylinderGeometry(R*.9,R*.8,R*1.1,24,1,true,Math.PI*.5,Math.PI),masc);mas.material.side=THREE.DoubleSide;mas.position.set(hc.x,eyeY-R*.62,hc.z+.005);
 for(const o of[cap,ocul,mas]){prender(B.Head,o);equip.cabeca.push(o);}

 // ---------- colete (plate carrier) ----------
 const s2=wpos(B.Spine2),s1=wpos(B.Spine1),hip=wpos(B.Hips);
 const pb=fatia(s1.y-.02,s2.y+.1,-.12,.12);const pc=pb.getCenter(V()),ps=pb.getSize(V());
 const col=new THREE.Group();const W=.34,Hh=s2.y+.17-(s1.y-.06);const cy=(s2.y+.17+s1.y-.06)/2;
 col.add(rbox(W,Hh,.05,coyote,pc.x,cy,pb.min.z-.012));col.add(rbox(W*.9,Hh*.9,.035,coyote,pc.x,cy,pb.max.z+.005));
 for(const s of[-1,1]){col.add(box(.07,.03,ps.z*.7,coyote,pc.x+s*(W/2-.06),s2.y+.15,pc.z)); // ombreiras
  col.add(box(.035,Hh*.75,ps.z+.07,coyEsc,pc.x+s*(W/2+.005),cy-.03,pc.z)); // cummerbund
  col.add(rbox(.06,.12,.06,coyote,pc.x+s*(W/2+.03),cy-.07,pc.z-.02));}
 const mz=pb.min.z-.055;
 for(let i=-1;i<=1;i++){col.add(rbox(.085,.13,.05,coyote,pc.x+i*.092,cy-Hh*.18,mz));col.add(box(.06,.03,.03,preto,pc.x+i*.092,cy-Hh*.18+.08,mz-.004));col.add(box(.06,.012,.052,coyEsc,pc.x+i*.092,cy-Hh*.18+.05,mz-.002));}
 col.add(rbox(.16,.07,.035,coyote,pc.x-.03,cy+Hh*.25,mz+.01));col.add(box(.035,.11,.03,verde,pc.x+.08,cy+Hh*.27,mz+.005)); // admin + rádio
 col.add(rbox(.18,.2,.035,coyote,pc.x,cy,pb.max.z+.045)); // mochila de hidratação
 for(let k=0;k<5;k++)col.add(box(W*.9,.006,.004,coyEsc,pc.x,cy+Hh*.45-k*.035,pb.min.z-.04)); // MOLLE
 prender(B.Spine1,col);equip.corpo.push(col);equip.tronco=[col];
 // ---------- cinto de guerra ----------
 const bb2=fatia(hip.y,hip.y+.1,-.25,.25);const bc=bb2.getCenter(V()),bs=bb2.getSize(V());
 const cin=new THREE.Group();const cil=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,28,1,true),coyEsc);cil.material.side=THREE.DoubleSide;cil.scale.set(bs.x+.035,1,bs.z+.035);cil.position.copy(bc);cin.add(cil);
 cin.add(rbox(.15,.07,.03,coyote,bc.x,bc.y,bb2.min.z-.02));
 for(const s of[-1,1]){cin.add(rbox(.07,.11,.06,coyote,bc.x+s*(bs.x/2+.02),bc.y-.03,bc.z-.04));cin.add(rbox(.06,.09,.05,coyote,bc.x+s*(bs.x/2-.01),bc.y-.03,bc.z+bs.z/2));}
 const coldre=rbox(.06,.16,.05,preto,bc.x+bs.x/2+.04,bc.y-.1,bc.z+.02);cin.add(coldre);
 prender(B.Hips,cin);equip.corpo.push(cin);
 // ---------- joelheiras e botas ----------
 for(const L of['Left','Right']){const k=wpos(B[L+'Leg']);const kb=fatia(k.y-.05,k.y+.05,k.x-.12,k.x+.12);
  const jo=new THREE.Mesh(new THREE.SphereGeometry(.065,16,12,0,Math.PI*2,0,Math.PI*.55),verde);jo.rotation.x=-Math.PI/2;jo.scale.set(1,.55,1.35);jo.position.set(k.x,k.y,kb.min.z+.012);prender(B[L+'Leg'],jo);equip.corpo.push(jo);
  const f=wpos(B[L+'Foot']),t=wpos(B[L+'ToeBase']);const fb=fatia(0,f.y+.06,f.x-.1,f.x+.1);const fsz=fb.getSize(V()),fcn=fb.getCenter(V());
  const bt=new THREE.Group();bt.add(rbox(fsz.x+.025,fsz.y+.02,fsz.z+.03,bota,fcn.x,fcn.y+.005,fcn.z));bt.add(box(fsz.x+.03,.03,fsz.z+.04,sola,fcn.x,.015,fcn.z));
  const cano=new THREE.Mesh(new THREE.CylinderGeometry(.062,.068,.13,14),bota);cano.position.set(f.x,f.y+.05,f.z+.005);bt.add(cano);
  const tr=[...bt.children];const frente=tr.filter(o=>o.position.z<f.z-.02);
  if(false){prender(B[L+'Foot'],bt);equip.corpo.push(bt);}}

 // ---------- fuzil (M4) ----------
 const fuzil=new THREE.Group();const gx=(w,h,d,m,x,y,z)=>{fuzil.add(box(w,h,d,m,x,y,z));};
 gx(.035,.07,.13,arma_m,0,0,.03);gx(.04,.065,.30,arma_m,0,.005,-.13);gx(.032,.05,.24,arma_m,0,.012,-.40);
 const cn=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.2,10),arma_m);cn.rotation.x=Math.PI/2;cn.position.set(0,.012,-.62);fuzil.add(cn);
 gx(.02,.03,.05,arma_m,0,.012,-.73);gx(.03,.11,.05,arma_m,0,-.08,-.07);gx(.03,.09,.035,arma_m,0,-.065,.03);
 fuzil.children[fuzil.children.length-2].rotation.x=-.25;fuzil.children[fuzil.children.length-1].rotation.x=.35;
 gx(.04,.06,.2,arma_m,0,-.01,.22);gx(.045,.11,.03,arma_m,0,-.025,.32);gx(.02,.02,.2,preto,0,.035,.2); // coronha
 gx(.035,.045,.08,preto,0,.065,-.08);gx(.026,.026,.02,lente,0,.065,-.125); // mira
 gx(.012,.012,.42,preto,0,.04,-.25);
 const flash=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:0xffd27a}));flash.position.set(0,.012,-.79);flash.scale.set(1,1,2);flash.visible=false;fuzil.add(flash);
 const luz=new THREE.PointLight(0xffb040,0,6);luz.position.copy(flash.position);fuzil.add(luz);
 // pontos de pega (espaço local do fuzil; origem = encaixe da coronha no ombro, cano em −Z)
 const pegaD=new THREE.Vector3(.005,-.05,-.24),pegaE=new THREE.Vector3(-.01,-.035,-.6);
 fuzil.children.forEach(o=>o.position.z-=.28+.0);// coronha ~ origem
 root.add(fuzil);

 // ---------- mãos: base de repouso ----------
 const repMao={};for(const L of['Left','Right']){const h=B[L+'Hand'];const f=V().subVectors(wpos(B[L+'HandMiddle1']),wpos(h));repMao[L]={q:h.getWorldQuaternion(Q()),M:basis(f,V(0,-1,0))};}
 function V(x=0,y=0,z=0){return new THREE.Vector3(x,y,z);}

 // ---------- animação ----------
 const mixer=new THREE.AnimationMixer(model);const A={};
 for(const c of gltf.animations){if(c.name==='TPose')continue;
  c.tracks=c.tracks.filter(t=>!(t.name.endsWith('.position')&&!/Hips/.test(t.name)));
  A[c.name.toLowerCase()]=mixer.clipAction(c);A[c.name.toLowerCase()].play().setEffectiveWeight(0);}
 // velocidade natural do pé plantado de cada clipe (p/ casar com o deslocamento e não escorregar)
 const nat={};root.updateMatrixWorld(true);
 for(const k of['walk','run']){const a=A[k];a.setEffectiveWeight(1);const dur=a.getClip().duration,N=60,ys=[],zs=[];
  for(let i=0;i<=N;i++){mixer.setTime(0);a.time=dur*i/N;mixer.update(0);root.updateMatrixWorld(true);const p=wpos(B.LeftToeBase);ys.push(p.y);zs.push(p.z);}
  const ymin=Math.min(...ys);let s=0,n=0;for(let i=0;i<N;i++)if(ys[i]<ymin+.03&&ys[i+1]<ymin+.03){s+=Math.abs(zs[i+1]-zs[i])/(dur/N);n++;}
  nat[k]=n?s/n:(k==='walk'?1.4:4);a.setEffectiveWeight(0);}
 A.idle.setEffectiveWeight(1);
 const st={estado:'idle',vel:0,dir:0,pitch:0,yawPerna:0,mira:0,tMira:0,ar:false,tPulo:0,agach:0,agV:0,rc:0,rcV:0,tFlash:0,fp:false,w:{idle:1,walk:0,run:0}};

 function play(n){if(n==='shoot')return atirar();if(n==='jump')return pular();st.estado=n;if(n==='idle')st.vel=0;else if(n==='walk')st.vel=st.vel||1.5;else if(n==='run')st.vel=Math.max(st.vel,4.5);}
 function setMove(vel,dir=0,sprint=vel>=3.2){st.vel=vel;st.dir=dir;st.sprint=sprint;st.estado=vel<.1?'idle':vel<3.2?'walk':'run';}
 function setAim(p){st.pitch=THREE.MathUtils.clamp(p,-1.2,1.2);}
 function atirar(){st.rcV+=6;st.tMira=.8;st.tFlash=.05;flash.visible=true;luz.intensity=3;flash.rotation.z=Math.random()*3;}
 function pular(){if(st.ar)return;st.ar=true;st.tPulo=0;}
 function aterrar(){if(!st.ar)return;st.ar=false;st.agV-=2.2;}
 function setGrounded(g){if(g)aterrar();else st.ar=true;}

 function update(dt){
  const dirAbs=Math.abs(st.dir),tras=dirAbs>Math.PI*.6;
  const alvo={idle:0,walk:0,run:0};alvo[st.estado]=1;const k=1-Math.exp(-dt/.09);
  let tot=0;for(const n in alvo){st.w[n]+=(alvo[n]-st.w[n])*k;tot+=st.w[n];}
  for(const n in alvo)A[n].setEffectiveWeight(st.w[n]/tot);
  // sincroniza fase andar/correr e casa velocidade
  const pw=A.walk.time/A.walk.getClip().duration;A.run.time=pw*A.run.getClip().duration;
  const vref=st.w.run/(st.w.run+st.w.walk+1e-6)*nat.run+(1-st.w.run/(st.w.run+st.w.walk+1e-6))*nat.walk;
  const ts=st.vel>.05?THREE.MathUtils.clamp(st.vel/vref,.5,1.6):1;
  const sgn=tras?-1:1;A.walk.timeScale=sgn*ts*(st.ar?.15:1);A.run.timeScale=A.walk.timeScale*A.run.getClip().duration/A.walk.getClip().duration;
  mixer.update(dt);
  // ---- camada por cima do mocap ----
  root.updateMatrixWorld(true);
  const qR=root.getWorldQuaternion(Q()),F=V(0,0,-1).applyQuaternion(qR),Rr=V(1,0,0).applyQuaternion(qR),U=V(0,1,0);
  // pernas viram p/ direção do movimento (strafe), tronco compensa
  let yl=st.estado==='idle'?0:(tras?st.dir-Math.sign(st.dir)*Math.PI:st.dir);yl=THREE.MathUtils.clamp(yl,-1.2,1.2);
  st.yawPerna+=(yl-st.yawPerna)*(1-Math.exp(-dt/.12));
  rotAxis(B.Hips,U,-st.yawPerna);rotAxis(B.Spine,U,st.yawPerna*.6);rotAxis(B.Spine1,U,st.yawPerna*.4);
  // pulo: encolhe as pernas; aterrissagem: mola de agachamento
  if(st.ar)st.tPulo+=dt;const enc=st.ar?Math.min(1,st.tPulo/.18)*.8:0;
  const acc=-120*st.agach-2*Math.sqrt(120)*.9*st.agV;st.agV+=acc*dt;st.agach+=st.agV*dt;const dobra=enc+Math.max(0,-st.agach)*1.6;
  if(dobra>.001){const ax=Rr.clone();for(const L of['Left','Right']){rotAxis(B[L+'UpLeg'],ax,dobra*.7);rotAxis(B[L+'Leg'],ax,-dobra*1.3);rotAxis(B[L+'Foot'],ax,dobra*.5);}
   model.position.y=-Math.max(0,-st.agach)*.25;rotAxis(B.Spine,Rr,dobra*.15);}else model.position.y=0;
  // mira: curva coluna e pescoço
  st.tMira-=dt;const querMira=st.tMira>0||!st.sprint?1:0;st.mira+=(querMira-st.mira)*(1-Math.exp(-dt/.15));
  const pit=st.pitch;for(const b of['Spine','Spine1','Spine2'])rotAxis(B[b],Rr,pit*.17);rotAxis(B.Neck,Rr,pit*.2);rotAxis(B.Head,Rr,pit*.25);
  // recuo (mola amortecida)
  const ra=-400*st.rc-2*Math.sqrt(400)*.55*st.rcV;st.rcV+=ra*dt;st.rc+=st.rcV*dt;
  // posição do fuzil: coronha no ombro direito
  const om=wpos(B.RightArm);const sp=wpos(B.Spine2);
  const qAim=Q().setFromAxisAngle(U,0).multiply(qR).multiply(Q().setFromAxisAngle(V(1,0,0),pit+st.rc*.35));
  const qLow=qR.clone().multiply(Q().setFromAxisAngle(V(0,1,0),.75)).multiply(Q().setFromAxisAngle(V(1,0,0),-.55+pit*.4)).multiply(Q().setFromAxisAngle(V(0,0,1),.5));
  const pAim=om.clone().addScaledVector(Rr,st.fp?-.1:-.07).addScaledVector(U,st.fp?.09:0).addScaledVector(U,.0).addScaledVector(F,.02);
  const pLow=sp.clone().addScaledVector(Rr,.13).addScaledVector(U,.02).addScaledVector(F,-.13);
  fuzil.quaternion.slerpQuaternions(qLow,qAim,st.mira);fuzil.position.lerpVectors(pLow,pAim,st.mira);
  fuzil.position.addScaledVector(V(0,0,1).applyQuaternion(fuzil.quaternion),st.rc*.06);
  const gQ=fuzil.quaternion.clone();root.worldToLocal(fuzil.position);fuzil.quaternion.premultiply(qR.clone().invert());
  fuzil.updateMatrixWorld(true);
  const tD=pegaD.clone().applyMatrix4(fuzil.matrixWorld),tE=pegaE.clone().applyMatrix4(fuzil.matrixWorld);
  const gF=V(0,0,-1).applyQuaternion(gQ),gR=V(1,0,0).applyQuaternion(gQ),gU=V(0,1,0).applyQuaternion(gQ);
  ik(B.RightArm,B.RightForeArm,B.RightHand,tD,wpos(B.RightArm).addScaledVector(U,-.6).addScaledVector(Rr,.5).addScaledVector(F,-.1));
  ik(B.LeftArm,B.LeftForeArm,B.LeftHand,tE,wpos(B.LeftArm).addScaledVector(U,-.7).addScaledVector(Rr,-.3));
  // orientação das mãos na pega
  const orient=(L,f,n)=>{const r=repMao[L];const Md=basis(f,n);const Qd=Q().setFromRotationMatrix(Md.multiply(r.M.clone().invert()));setWorldQuat(B[L+'Hand'],Qd.multiply(r.q));};
  orient('Right',gF.clone().multiplyScalar(.75).addScaledVector(gU,-.65).addScaledVector(gR,-.2),gR.clone().negate().addScaledVector(gU,-.2));
  orient('Left',gR.clone().multiplyScalar(.8).addScaledVector(gF,.5),gU.clone().addScaledVector(gR,.35).negate());
  // dedos fechados
  for(const L of['Left','Right']){const hq=B[L+'Hand'];const f=V().subVectors(wpos(B[L+'HandMiddle1']),wpos(hq)).normalize();const s=V().subVectors(wpos(B[L+'HandIndex1']),wpos(B[L+'HandPinky1'])).normalize();const ax=V().crossVectors(f,s).normalize();
   const sig=L==='Left'?-1:1;
   for(const d of['Index','Middle','Ring','Pinky'])for(let i=1;i<=3;i++){const b=B[L+'Hand'+d+i];if(b){const a=V().crossVectors(V().subVectors(wpos(b.children[0]||b),wpos(b)).normalize(),s).normalize();rotAxis(b,s,sig*(L==='Right'&&d==='Index'?.45:.9)*(i===1?.8:1));}}
   const t1=B[L+'HandThumb1'];if(t1)rotAxis(t1,f,sig*.4);}
  if(st.fp){const n=wpos(B.Neck);uCut.value.set(n.x,n.y-.06,n.z,.3);}
  if(st.tFlash>0){st.tFlash-=dt;if(st.tFlash<=0){flash.visible=false;luz.intensity=0;}}
 }
 function setFirstPerson(v){st.fp=v;for(const o of [...equip.cabeca,...equip.tronco])o.visible=!v;if(visor)visor.visible=!v;uFP.value=v?1:0;corpo.material.side=THREE.FrontSide;}
 function olho(t=V()){root.updateMatrixWorld(true);const h=wpos(B.Head);const qR=root.getWorldQuaternion(Q());return t.copy(h).addScaledVector(V(0,1,0),.06).addScaledVector(V(0,0,-1).applyQuaternion(qR),.24);}
 function boca(t=V()){return flash.getWorldPosition(t);}
 update(0);
 return {object:root,play,update,setAim,setMove,setGrounded,atirar,pular,setFirstPerson,olho,boca,fuzil,ossos:B,velNatural:nat,estado:st,corpo};
}
