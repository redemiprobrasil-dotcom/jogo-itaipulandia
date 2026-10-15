// Sobrado laranja — Rua Sete de Setembro. Fachada aprovada 1024x576, ~79 px/m (muro ~2.4 m, lote ~12.5 m).
// Muro de placas (esq.) e garagem coberta com pilares de tijolo + portão de grade preta (dir.) no alinhamento; casa recuada 4 m.
// Árvore/vizinhos da arte excluídos. Telhado 4 águas + frontão central em 3D; varanda recuada 1.2 m de verdade.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,paver} from '../shared/facade.js';
function prism(v,idx,mat,p){let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g=g.toNonIndexed();g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
export async function buildSobrado(url='./fachada_sobrado.jpg'){
 const G=new THREE.Group();G.name='sobrado';const REC=4,BAL=1.2,DEP=9;
 const F=await fotoTex(url,skyAzul,.5);const {wx,wy,face}=mapper({PX:79,GX:512,GY:487,W:1024,H:576});
 const x0=wx(0),x1=wx(985),zf=-REC,laranja=M({color:0xe39a78}),telha=M({color:0x4a4644,roughness:.85,side:THREE.DoubleSide});
 // --- casa: fachada (do beiral até o muro) com textura; parte de baixo escondida pelo muro é procedural
 const hx0=wx(118),hx1=wx(795),eave=wy(130),bx0=wx(460),bx1=wx(658),by=wy(252);
 face(F,118,130,460,300,zf,G);face(F,658,130,795,300,zf,G);
 face(F,460,205,658,300,zf,G);                    // guarda-corpo e laje da varanda no plano da fachada
 face(F,460,130,658,205,zf-BAL,G);                // fundo da varanda (porta em arco, rede) recuado
 box(hx1-hx0,wy(300),.1,laranja,(hx0+hx1)/2,wy(300)/2,zf-.06,G);
 box(hx1-hx0,eave,DEP-BAL,laranja,(hx0+hx1)/2,eave/2,zf-BAL-(DEP-BAL)/2,G);  // corpo
 for(const x of[bx0,bx1])box(.12,eave-by,BAL,laranja,x+(x===bx0?.06:-.06),(eave+by)/2,zf-BAL/2,G);// paredes laterais da varanda
 box(bx1-bx0,.08,BAL,laranja,(bx0+bx1)/2,eave-.04,zf-BAL/2,G);                  // forro
 box(bx1-bx0,.1,BAL,M({color:0xbfa58f}),(bx0+bx1)/2,by-.05,zf-BAL/2,G);         // piso da varanda
 // --- telhado 4 águas
 const ex0=wx(75),ex1=wx(825),w=ex1-ex0,d=DEP+1,rh=wy(60)-eave,hw=w/2,hd=d/2,rl=Math.max(hw-hd,.01);
 prism([-hw,0,hd,hw,0,hd,hw,0,-hd,-hw,0,-hd,-rl,rh,0,rl,rh,0],[0,1,5,0,5,4,2,3,4,2,4,5,1,2,5,3,0,4],telha,G).position.set((ex0+ex1)/2,eave,zf+.5-hd);
 // frontão central (2 águas, cumeeira para a rua) avançando 0.6 m
 const gx0=wx(418),gx1=wx(705),gw=(gx1-gx0)/2,gh=wy(38)-eave,gz=zf+.6,gl=hd+.1;
 prism([-gw,0,0,0,gh,0,0,gh,-gl,-gw,0,-gl, gw,0,0,0,gh,0,0,gh,-gl,gw,0,-gl],[0,1,2,0,2,3,4,6,5,4,7,6],telha,G).position.set((gx0+gx1)/2,eave,gz);
 const tri=face(F,440,50,683,128,gz-.05,G,true);tri.position.y=eave+.35;      // empena de madeira (textura)
 tri.scale.set(1,(gh-.35)/(78/79),1);
 // painéis solares sobre as águas da frente
 const sol=M({color:0x1d2c4a,roughness:.3,metalness:.4}),slope=Math.atan2(rh,hd);
 for(const [a,b] of [[360,470],[640,750]]){const p=box(wx(b)-wx(a),.04,1.4,sol,(wx(a)+wx(b))/2,eave+rh*.55,zf+.5-hd*.45,G);p.rotation.x=slope;}
 // --- muro de placas de concreto (textura) no alinhamento
 const mt=wy(298);face(F,0,298,575,487,.101,G);box(wx(575)-x0,mt,.2,M({color:0xa8a6a2}),(x0+wx(575))/2,mt/2,0,G);
 // --- garagem: pilares de tijolo, cobertura plana, portão de grade preta
 const tij=M({color:0xb0603f,roughness:.95});
 for(const [a,b] of [[575,602],[948,985]]){const p0=wx(a),p1=wx(b);box(p1-p0,wy(290),.35,tij,(p0+p1)/2,wy(290)/2,0,G);face(F,a,290,b,487,.176,G);}
 const ct=wy(268),cb=wy(290);box(wx(985)-wx(568),ct-cb,REC+.2,M({color:0x5a3a2c}),(wx(568)+wx(985))/2,(ct+cb)/2,-REC/2+.1,G);
 const pr=M({color:0x151515,roughness:.5,metalness:.5}),g0=wx(602),g1=wx(948),gt=wy(318),gm=wx(772);
 box(g1-g0,.08,.06,pr,(g0+g1)/2,gt,0,G);box(g1-g0,.06,.06,pr,(g0+g1)/2,.08,0,G);box(g1-g0,.05,.05,pr,(g0+g1)/2,gt*.62,0,G);
 for(const x of[g0+.04,gm,g1-.04])box(.07,gt,.07,pr,x,gt/2,0,G);
 for(let x=g0+.14;x<g1-.08;x+=.13)box(.025,gt-.1,.025,pr,x,gt/2,0,G);
 const pis=new THREE.Mesh(new THREE.PlaneGeometry(g1-g0+.5,REC),M({color:0x9a958d}));pis.rotation.x=-Math.PI/2;pis.position.set((g0+g1)/2,.01,-REC/2);G.add(pis);
 const qt=new THREE.Mesh(new THREE.PlaneGeometry(wx(575)-x0,REC),M({color:0x8a7a5e}));qt.rotation.x=-Math.PI/2;qt.position.set((x0+wx(575))/2,.01,-REC/2);G.add(qt);
 // --- calçada de paver com faixa amarela + guia
 const S=3.2,L=x1-x0;box(L,.08,S,M({map:paver(10,3),roughness:1}),(x0+x1)/2,.04,S/2+.1,G);
 box(L,.005,.15,M({color:0xd9b12a}),(x0+x1)/2,.083,S*.45,G);
 box(L,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2,.075,S+.1,G);
 return G;}
