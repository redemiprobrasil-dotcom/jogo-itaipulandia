// LP Engenharia + Cross Moto — R. Castro Alves. Imagem 966x538 (recorte do print aprovado), ~53.7 px/m, ~18 m de largura.
// Platibanda bege 3D com cornija; 2 portas de vidro recuadas 0.4 m; janelas recuadas 0.08 m; base cinza; faixa de terra; calçada de paver com linha amarela; meio-fio.
import * as THREE from 'three';
import {M,box,mapper,fotoTex,skyAzul,reboco,paver} from '../shared/facade.js';
export async function buildLpCross(url='./fachada_lp_cross.jpg'){
 const G=new THREE.Group();G.name='lp_cross';const PX=53.7,R=.4,RJ=.08,D=14,W=966;
 const F=await fotoTex(url,skyAzul,.2);const {wx,wy,face}=mapper({PX,GX:W/2,GY:468,W,H:538});
 const x0=wx(0),x1=wx(W),L=x1-x0,cx=0,TOP=wy(85),CB=wy(220),CT=wy(214);
 const bege=M({map:reboco('#c9a77c')}),branco=M({map:reboco('#ecebe4')});
 // platibanda 3D (frente com a foto) + cornija
 face(F,0,85,W,214,.01,G);box(L,TOP-CT,.35,bege,cx,(TOP+CT)/2,-.17,G);
 box(L+.1,CT-CB,.5,M({color:0xb9966c}),cx,(CT+CB)/2,-.1,G);
 box(L,.06,.4,M({color:0x8a7a66}),cx,TOP+.03,-.17,G);
 // parede: faixas entre aberturas
 const portas=[[189,374],[696,878]],jan=[[22,144],[404,506],[576,668],[906,966]];
 const PT=wy(301),JT=wy(302),JB=wy(400);
 face(F,0,220,W,301,0,G);
 const cols=[[0,189],[374,696],[878,W]];
 for(const [a,b] of cols){face(F,a,301,b,468,0,G);}
 // portas de vidro recuadas com batentes 3D
 const vid=M({color:0x9aa2a6,roughness:.4});
 for(const [a,b] of portas){const w=wx(b)-wx(a),c=(wx(a)+wx(b))/2;
  face(F,a,301,b,468,-R,G);
  box(w,.04,R,vid,c,PT-.02,-R/2,G);box(.04,PT,R,vid,wx(a)+.02,PT/2,-R/2,G);box(.04,PT,R,vid,wx(b)-.02,PT/2,-R/2,G);}
 // janelas levemente recuadas (sobre as colunas da parede)
 for(const [a,b] of jan){const m=face(F,a,302,b,400,-RJ+.02,G);}
 // encobre a parede da foto onde a janela fica (furo simulado com caixas de borda)
 for(const [a,b] of jan){const w=wx(b)-wx(a),c=(wx(a)+wx(b))/2;
  box(w,.03,RJ,branco,c,JB+.015,-RJ/2+.01,G);box(w,.03,RJ,branco,c,JT-.015,-RJ/2+.01,G);}
 // corpo
 box(L,TOP,D-R-.03,branco,cx,TOP/2,-R-.03-(D-R-.03)/2,G);
 box(L,.1,D-1,M({color:0x8c8a86}),cx,CB-.6,-.5-(D-1)/2,G);
 // base cinza 3D
 box(L,.25,.06,M({color:0x6d6f72}),cx,.125,.03,G);
 // terra, calçada de paver, linha amarela, meio-fio
 const ls=wy(490)*-1,ws=(520-490)/PX;
 box(L+.5,.04,.41,M({color:0x4a3a2e,roughness:1}),cx,.02,.205,G);
 box(L+.5,.06,ws,M({map:paver(30,2),roughness:1}),cx,.03,.41+ws/2,G);
 box(L+.5,.005,.06,M({color:0xd8b23a}),cx,.063,.5,G);
 box(L+.5,.15,.22,M({color:0xa9a69f}),cx,.075,.41+ws+.11,G);
 return G;}
