const {decodeGif}=require('./gif.cjs');const {encodeGif}=require('./enc.cjs');const fs=require('fs');
// node spurs.cjs in out minTransparentNeighbours [passes]  : remove neutral light-grey edge spurs
const [,,inf,outf,nS,pS]=process.argv;const NT=+(nS||6),PASSES=+(pS||1);
const g=decodeGif(fs.readFileSync(inf));const W=g.W,H=g.H,N=W*H;let removed=0;
g.frames.forEach(fr=>{const f=fr.rgba;
  for(let ps=0;ps<PASSES;ps++){const kill=[];
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const p=y*W+x;if(!f[p*4+3])continue;
      const r=f[p*4],gg=f[p*4+1],b=f[p*4+2];if(r<190||Math.abs(r-gg)>4||Math.abs(gg-b)>4)continue;
      let t=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;if(!f[((y+dy)*W+x+dx)*4+3])t++;}
      if(t>=NT)kill.push(p);}
    kill.forEach(p=>{f[p*4+3]=0;removed++;});}
});
fs.writeFileSync(outf,encodeGif(W,H,g.frames.map(fr=>({rgba:fr.rgba,delay:fr.delay}))));console.log('removed px',removed);
