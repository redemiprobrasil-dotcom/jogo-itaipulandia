// Kibarato — esquina da Av. Tiradentes. Imagem do usuário 900x1285 (letreiro corrigido p/ KIBARATO), ~62 px/m.
// Frente: px 0-694 (quina/coluna em px 694). Lateral visível (px 694-900) mapeada na face lateral (+x), que segue pela rua lateral.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,reboco,paver} from '../shared/facade.js';
const skyK=(r,g,b)=>Math.abs(r-136)<10&&Math.abs(g-141)<10&&Math.abs(b-147)<10;
export async function buildKibarato(url='./fachada_kibarato.jpg'){
 const G=new THREE.Group();G.name='kibarato';const PX=62,W=900,H=1285,GY=1010,QX=694,D=15;
 const F=await fotoTex(url,skyK,.45);const {wx,wy,face}=mapper({PX,GX:QX/2,GY,W,H});
 const parede=M({map:reboco('#d9d6cf')}),x0=wx(0),x1=wx(QX);
 // fachada frontal (com recorte do céu) e corpo atrás
 face(F,0,300,QX,GY,0,G,true);
 const hL=wy(530),hR=wy(470);
 box(wx(380)-x0,hL,D,parede,(x0+wx(380))/2,hL/2,-D/2-.03,G);
 box(x1-wx(380),hR,D,parede,(wx(380)+x1)/2,hR/2,-D/2-.03,G);
 // laje de piso do 2º pav. (borda) e beirais 3D discretos
 box(x1-x0+.1,.12,.5,parede,(x0+x1)/2,wy(728)-.06,-.25,G);
 // coluna da esquina 3D
 box(.35,wy(728),.35,parede,x1-.17,wy(728)/2,-.17,G);
 // face lateral (x = x1, voltada para +x): imagem px 694-900 esticada em 8 m; resto da lateral em reboco liso
 const LS=8,HS=wy(330),g=new THREE.PlaneGeometry(LS,HS),uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)?900:QX)/W,1-(uv.getY(i)?330:1040)/H);
 const sm=new THREE.Mesh(g,M({map:F,roughness:.85,alphaTest:.5}));sm.rotation.y=Math.PI/2;sm.position.set(x1+.02,HS/2,-LS/2);G.add(sm);
 // calçadão de paver na frente e na lateral
 const c=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0+4,4.5),M({map:paver(14,4)}));c.rotation.x=-Math.PI/2;c.position.set((x0+x1)/2+2,.01,2.25);c.receiveShadow=true;G.add(c);
 const cl=new THREE.Mesh(new THREE.PlaneGeometry(3,D+4.5),M({map:paver(3,16)}));cl.rotation.x=-Math.PI/2;cl.position.set(x1+1.5,.012,-D/2+2.25);cl.receiveShadow=true;G.add(cl);
 box(x1-x0+4,.15,.2,M({color:0xb9b5ad}),(x0+x1)/2+2,.075,4.5,G);box(.2,.15,D+4.5,M({color:0xb9b5ad}),x1+3,.075,-D/2+2.25,G);
 return G;}
