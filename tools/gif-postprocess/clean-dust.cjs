const {decodeGif}=require('./gif.cjs');const {encodeGif}=require('./enc.cjs');const {findDots}=require('./dots.cjs');const fs=require('fs');
const dir=require('path').join(__dirname,'../../assets/exercises/gifs/');
const MAX=+process.argv[2]||8, write=process.argv[3]==='write';
let changed=0,removedTotal=0;
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('-dark.gif'))){
  const g=decodeGif(fs.readFileSync(dir+f));let rem=0;
  g.frames.forEach(fr=>{const d=findDots(fr.rgba,g.W,g.H,{max:MAX});d.forEach(c=>c.forEach(q=>{fr.rgba[q*4+3]=0;rem++;}));});
  if(rem){changed++;removedTotal+=rem;console.log(f.replace('-dark.gif','').padEnd(28),'removed px',rem);
    if(write)fs.writeFileSync(dir+f,encodeGif(g.W,g.H,g.frames.map(fr=>({rgba:fr.rgba,delay:fr.delay}))));}
}
console.log('files changed',changed,'pixels',removedTotal,write?'(written)':'(dry run)');
