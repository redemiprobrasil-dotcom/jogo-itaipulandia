// Casa Rua Rui Barbosa 277 - modelo procedural (metros). Origem: centro da frente do lote, alinhamento do muro (z=0). +z = rua.
import * as THREE from 'three';
function tex(w,h,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.colorSpace=THREE.SRGBColorSpace;return t;}
function noise(g,w,h,base,amp,n=4000){g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=(Math.random()-.5)*amp;g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)})`;g.fillRect(Math.random()*w,Math.random()*h,2,2);}}
export const T={
 reboco:()=>tex(256,256,(g,w,h)=>noise(g,w,h,'#3a4352',.08)),
 rebocoClaro:()=>tex(256,256,(g,w,h)=>noise(g,w,h,'#46505e',.08)),
 madeira:(r=1)=>tex(128,256,(g,w,h)=>{g.fillStyle='#6e3420';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){g.fillStyle='#3f1c10';g.fillRect(x,0,2,h);}},r,1),
 placaConcreto:()=>tex(512,256,(g,w,h)=>{noise(g,w,h,'#cdbfa8',.12,8000);g.fillStyle='rgba(60,60,60,.35)';for(let x=0;x<w;x+=85)g.fillRect(x,0,3,h);g.fillStyle='rgba(140,90,60,.15)';g.fillRect(0,h*.8,w,h*.2);},2,1),
 paver:()=>tex(256,256,(g,w,h)=>{g.fillStyle='#7d6a62';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=-32;x<w;x+=64){const o=(y/32)%2?32:0;const s=100+Math.random()*30;g.fillStyle=`rgb(${s+20},${s},${s-8})`;g.fillRect(x+o+2,y+2,60,28);}},6,1.5),
 mosaico:()=>tex(512,512,(g,w,h)=>{g.fillStyle='#e8e4dc';g.fillRect(0,0,w,h);g.fillStyle='#24221f';g.fillRect(0,0,w,26);g.fillRect(0,0,26,h);g.fillRect(0,250,w,14);g.fillRect(250,0,14,h);g.strokeStyle='#24221f';g.lineWidth=13;g.lineCap='round';for(const [ox,oy] of [[130,130],[390,130],[130,390],[390,390]]){for(const d of[-40,40]){g.beginPath();g.arc(ox+d,oy-18,22,Math.PI*.2,Math.PI*1.6);g.arc(ox+d,oy+18,22,-Math.PI*.5,Math.PI*.8,false);g.stroke();}}for(let i=0;i<9000;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.12})`;g.fillRect(Math.random()*w,Math.random()*h,3,3);}},6,6),
 terra:()=>tex(256,256,(g,w,h)=>noise(g,w,h,'#6c6c6e',.12,9000),8,4),
 tijolo:()=>tex(128,128,(g,w,h)=>{g.fillStyle='#ccc';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=-32;x<w;x+=32){g.fillStyle='#8a4a32';g.fillRect(x+((y/16)%2?16:0)+1,y+1,30,14);}},1,3),
 solar:()=>tex(256,256,(g,w,h)=>{g.fillStyle='#1d2430';g.fillRect(0,0,w,h);g.strokeStyle='#8a94a3';g.lineWidth=3;for(let x=0;x<=w;x+=64)g.strokeRect(x,0,64,128),g.strokeRect(x,128,64,128);},3,1),
 telhaMetal:()=>tex(64,64,(g,w,h)=>{g.fillStyle='#6f7377';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='#55595d';g.fillRect(x,0,2,h);}},6,1),
};
const M=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9},o));
function box(w,h,d,mat,x,y,z,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
// janela/porta arqueada: retângulo + semicírculo
function arco(w,h,mat){const s=new THREE.Shape();const r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);return new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.06,bevelEnabled:false}),mat);}
function janelaArco(p,x,y,z,w=.75,h=1.45,rotY=0){const g=new THREE.Group();const fr=arco(w+.12,h+.06,M({color:0x5a2a18}));fr.position.z=-.02;g.add(fr);const j=arco(w,h,M({color:0x6a2e1c}));j.position.z=.01;g.add(j);const l=new THREE.Mesh(new THREE.BoxGeometry(.03,h-w/2,.02),M({color:0x3f1a0e}));l.position.set(0,(h-w/2)/2,.08);g.add(l);g.position.set(x,y,z);g.rotation.y=rotY;p.add(g);}
function floreira(p,x,y,z,w){box(w,.45,.4,M({map:T.reboco()}),x,y,z,p);for(let i=0;i<w*4;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.12,6,5),M({color:i%3?0x4f6e34:0xd8546e}));b.position.set(x-w/2+.15+i*.25,y+.3,z);p.add(b);}}
function telhado4aguas(w,d,h,mat){// pirâmide truncada (cumeeira ao longo de x)
 const r=Math.min(w,d)/2,hw=w/2,hd=d/2,rl=hw-r;
 const v=[-hw,0,hd, hw,0,hd, hw,0,-hd, -hw,0,-hd, -rl,h,0, rl,h,0];
 const idx=[0,1,5, 0,5,4, 2,3,4, 2,4,5, 1,2,5, 3,0,4];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);const n=g.toNonIndexed();n.computeVertexNormals();
 const m=new THREE.Mesh(n,mat);m.castShadow=true;return m;}
export function buildCasa277(){
 const G=new THREE.Group();G.name='casa277';
 const reb=M({map:T.reboco()}),escuro=M({color:0x6a2e1c}),telha=M({color:0x6e665c,roughness:.95});
 // ---- CORPO PRINCIPAL (2 pav.) x -3.6..+5.4, frente em z=-6.5
 const zf=-6.5, W=9, cx=0.9, D=9;
 box(W,6.2,D,reb,cx,3.1,zf-D/2,G);
 // recuo da varanda central (vazio escuro + piso)
 box(3.1,2.6,1.4,M({map:T.rebocoClaro()}),cx-.1,4.4,zf-.69,G); // parede do fundo (simplificada)
 box(3.3,.18,1.6,reb,cx-.1,3.15,zf+.05,G); // laje varanda
 // guarda-corpo
 const gc=M({color:0x6a2e1c});box(3.2,.05,.05,gc,cx-.1,4.15,zf+.8,G);for(let i=0;i<=24;i++)box(.025,.95,.025,gc,cx-1.7+i*.133,3.7,zf+.8,G);
 janelaArco(G,cx-.1,3.25,zf-.62,.85,2.2);
 {const cv=new THREE.CatmullRomCurve3([new THREE.Vector3(cx-1.5,4.3,zf+.5),new THREE.Vector3(cx-.1,3.6,zf+.55),new THREE.Vector3(cx+1.3,4.3,zf+.5)]);const hm=new THREE.Mesh(new THREE.TubeGeometry(cv,20,.07,6),M({color:0xb5532f}));G.add(hm);} // porta arqueada da varanda
 // janelas superiores: par esquerdo e par direito
 for(const x of [-2.25,-1.35,3.3,4.2])janelaArco(G,x,3.6,zf+.01);
 floreira(G,-1.8,3.25,zf+.2,1.9);floreira(G,3.75,3.25,zf+.2,1.9);
 // empena central com tábuas de madeira escura
 const emp=new THREE.Shape();emp.moveTo(-2,0);emp.lineTo(2,0);emp.lineTo(0,1.3);emp.lineTo(-2,0);
 const em=new THREE.Mesh(new THREE.ExtrudeGeometry(emp,{depth:.1,bevelEnabled:false}),M({map:T.madeira(.3)}));em.position.set(cx-.1,6.2,zf+.75);G.add(em);
 box(4,.6,.1,M({map:T.madeira(.3)}),cx-.1,5.9,zf+.8,G);
 // telhado principal 4 águas + painéis solares
 const tp=telhado4aguas(W+1.8,D+1.8,2.2,telha);tp.position.set(cx,6.2,zf-D/2);G.add(tp);
 // telhado da empena (duas águas para a frente)
 const sh=new THREE.Shape();sh.moveTo(-2.4,0);sh.lineTo(2.4,0);sh.lineTo(0,1.45);sh.lineTo(-2.4,0);
 const tg=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:1.5,bevelEnabled:false}),telha);tg.position.set(cx-.1,6.15,zf-.6);G.add(tg);
 const sol=M({map:T.solar(),roughness:.4,metalness:.3});
 for(const sx of[]){const pn=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.4),sol);pn.position.set(cx+sx,7.0,zf-.9);pn.rotation.x=-Math.PI/2+0.55;G.add(pn);}
 // ---- ALA ESQUERDA mais baixa x -6.5..-3.6
 box(2.9,5.4,7,reb,-5.05,2.7,zf-3.5+.3,G);
 const tm=M({map:T.telhaMetal()});const ta=box(3.4,.08,7.6,tm,-5.05,5.55,zf-3.2,G);ta.rotation.x=0;
 janelaArco(G,-5.2,3.5,zf+.31,.6,1.1);
 box(1.5,1.2,.06,escuro,-4.45,1.7,zf+.32,G);// janela/porta térreo escura
 box(.8,.55,.25,M({color:0xf2f2f2}),-6.1,2.3,zf+.4,G);// ar-condicionado
 // ---- MURO de placas de concreto x -6.5..+0.9, altura 2.8
 box(7.4,2.8,.12,M({map:T.placaConcreto()}),-2.8,1.4,0,G);
 for(let i=0;i<22;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.25+Math.random()*.2,7,5),M({color:0x4a6a33}));b.position.set(-6.3+Math.random()*7,.2,.25);b.scale.y=.8;G.add(b);}
 // ---- GARAGEM: laje plana em pilares de tijolo + portão de ferro arqueado x 0.9..6.5
 const tij=M({map:T.tijolo()});
 for(const [x,z] of [[1.15,-.3],[6.25,-.3],[1.15,-4.5],[6.25,-4.5]])box(.4,2.95,.4,tij,x,1.48,z,G);
 box(6,.25,6.9,M({color:0x7a3a22}),3.7,3.05,-3.2,G);
 box(6.1,.08,.4,M({color:0x7a3a22}),3.7,3.3,.1,G);
 const fe=M({color:0x2b2622,metalness:.5,roughness:.6});
 box(2.5,.85,.05,fe,2.45,.5,0,G);box(2.5,.85,.05,fe,4.95,.5,0,G);box(.08,2.4,.08,fe,3.7,1.2,0,G);// chapa inferior
 for(let i=0;i<=40;i++){const x=1.35+i*.1175;const top=2.2+.35*Math.sin(Math.PI*(i/40));box(.022,top-.65,.022,fe,x,.65+(top-.65)/2,0,G);}
 box(5.1,.05,.05,fe,3.7,1.9,0,G);
 // interior da garagem
 box(5.4,2.9,.1,M({color:0xe2c79a}),3.7,1.45,-6.4,G);const pi=new THREE.Mesh(new THREE.PlaneGeometry(5.6,6.6),M({color:0xd8d2c6}));pi.rotation.x=-Math.PI/2;pi.position.set(3.7,.03,-3.2);G.add(pi);
 box(1.8,.06,.4,M({color:0x2a2a2a}),2.6,.9,-6.1,G);for(const x of[1.75,3.45])box(.05,.9,.4,M({color:0x2a2a2a}),x,.45,-6.1,G);
 for(const x of[1.15,6.25]){const lp=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),M({color:0xfff2cc,emissive:0x664400}));lp.position.set(x,2.4,-.05);G.add(lp);}
 // ---- CALÇADA, MEIO-FIO, RUA
 const pv=new THREE.Mesh(new THREE.PlaneGeometry(14,3),M({map:T.mosaico()}));pv.rotation.x=-Math.PI/2;pv.position.set(0,.02,1.5);G.add(pv);pv.receiveShadow=true;
 
 
 const rua=new THREE.Mesh(new THREE.PlaneGeometry(40,40),M({map:T.mosaico()}));rua.rotation.x=-Math.PI/2;rua.position.set(0,.01,20);G.add(rua);rua.receiveShadow=true;
 box(.06,1.5,.06,M({color:0x9b7a55}),-3.2,.75,2.3,G);// tutor da muda
 const fl=new THREE.Mesh(new THREE.BoxGeometry(.7,.03,.7),M({color:0x9a7e5e}));fl.position.set(-3.2,.03,2.4);G.add(fl);
 // lote/quintal base
 const solo=new THREE.Mesh(new THREE.PlaneGeometry(14,30),M({color:0x8a7a62}));solo.rotation.x=-Math.PI/2;solo.position.set(0,0,-15);G.add(solo);
 // jardim tropical à direita
 {const gr=new THREE.Mesh(new THREE.PlaneGeometry(8,10),M({color:0x4f8a35}));gr.rotation.x=-Math.PI/2;gr.position.set(10.5,.03,-5);G.add(gr);
 const tr=M({color:0x8a7660}),fo=M({color:0x3f7a2e,side:THREE.DoubleSide});
 for(const [x,z,h] of [[8.8,-4,6],[10.5,-7,7.5],[12.5,-4,6.5],[11.5,-10,8]]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,h,6),tr);t.position.set(x,h/2,z);G.add(t);for(let k=0;k<9;k++){const f=new THREE.Mesh(new THREE.PlaneGeometry(.5,2.4),fo);f.position.set(x,h,z);f.rotation.set(0,k*0.7,0);f.rotateX(1.1);f.translateY(1.1);G.add(f);}}
 const pk=M({color:0xc23f8c});for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.5+Math.random()*.4,7,5),i%3?pk:M({color:0x4f7a30}));b.position.set(9.5+Math.random()*3,2+Math.random()*2.5,-1.5-Math.random()*2);G.add(b);}}
 return G;
}
export function buildVizinhoBranco(){const g=new THREE.Group();box(6,7.5,12,M({color:0xe6d2a8}),0,3.75,-6,g);return g;}
