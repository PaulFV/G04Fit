const {decodeGif,png}=require('./gif.cjs');const fs=require('fs');
const dir=require('path').join(__dirname,'../../assets/exercises/gifs/');
function findDots(rgba,W,H,opts){
  const N=W*H,op=new Uint8Array(N);for(let i=0;i<N;i++)if(rgba[i*4+3])op[i]=1;
  // isolated opaque components (any colour) up to maxArea px: 8-connectivity
  const seen=new Uint8Array(N),dots=[];
  for(let s=0;s<N;s++){if(!op[s]||seen[s])continue;const cells=[s];seen[s]=1;
    for(let k=0;k<cells.length&&cells.length<=opts.max;k++){const q=cells[k],x=q%W,y=(q/W)|0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const r=ny*W+nx;if(op[r]&&!seen[r]){seen[r]=1;cells.push(r);}}}
    if(cells.length<=opts.max){dots.push(cells);}
    else{// big component: flood the rest so it is skipped
      const st=cells.slice(-1);while(st.length){const q=st.pop(),x=q%W,y=(q/W)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const r=ny*W+nx;if(op[r]&&!seen[r]){seen[r]=1;st.push(r);}}}}
  }
  return dots;
}
module.exports={findDots};
if(require.main===module){
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('-dark.gif'));
  const rows=[];
  for(const f of files){const g=decodeGif(fs.readFileSync(dir+f));let tot=0,px=0,worst=0;
    g.frames.forEach(fr=>{const d=findDots(fr.rgba,g.W,g.H,{max:+process.argv[2]||6});tot+=d.length;px+=d.reduce((a,c)=>a+c.length,0);worst=Math.max(worst,d.length);});
    rows.push([f.replace('-dark.gif',''),g.frames.length,tot,(tot/g.frames.length).toFixed(1),worst]);}
  rows.sort((a,b)=>b[2]-a[2]);rows.forEach(r=>console.log(r[0].padEnd(28),'frames',r[1],'dots',String(r[2]).padStart(4),'avg',r[3],'max',r[4]));
}
