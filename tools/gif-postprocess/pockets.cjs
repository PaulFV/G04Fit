const {decodeGif}=require('./gif.cjs');const {encodeGif}=require('./enc.cjs');const fs=require('fs');
// node pockets.cjs infile outfile minArea [grow]
const [,,inf,outf,minS,growS,loS,hiS]=process.argv;const LO=+(loS||228),HI=+(hiS||232);const MIN=+minS,GROW=+(growS||2);
const g=decodeGif(fs.readFileSync(inf));const W=g.W,H=g.H,N=W*H;let removed=0;
g.frames.forEach(fr=>{const f=fr.rgba;const flat=new Uint8Array(N);
  for(let i=0;i<N;i++)if(f[i*4+3]&&f[i*4]>=LO&&f[i*4]<=HI&&f[i*4]===f[i*4+1]&&f[i*4]===f[i*4+2])flat[i]=1;
  const seen=new Uint8Array(N),kill=new Uint8Array(N);
  for(let s=0;s<N;s++){if(!flat[s]||seen[s])continue;const st=[s],cells=[s];seen[s]=1;
    while(st.length){const q=st.pop();for(const r of [q-1,q+1,q-W,q+W]){if(r>=0&&r<N&&flat[r]&&!seen[r]){seen[r]=1;st.push(r);cells.push(r);}}}
    if(cells.length>=MIN)cells.forEach(q=>kill[q]=1);}
  // grow over light grey neighbours (antialias rim)
  for(let it=0;it<GROW;it++){const add=[];for(let p=0;p<N;p++){if(kill[p]||!f[p*4+3])continue;const r=f[p*4],ok=r>=200&&Math.abs(r-f[p*4+1])<=3&&Math.abs(r-f[p*4+2])<=3;if(!ok)continue;
    const x=p%W,y=(p/W)|0;if((x>0&&kill[p-1])||(x<W-1&&kill[p+1])||(y>0&&kill[p-W])||(y<H-1&&kill[p+W]))add.push(p);}add.forEach(p=>kill[p]=1);}
  for(let p=0;p<N;p++)if(kill[p]){f[p*4+3]=0;removed++;}
});
fs.writeFileSync(outf,encodeGif(W,H,g.frames.map(fr=>({rgba:fr.rgba,delay:fr.delay}))));console.log('removed px',removed);
