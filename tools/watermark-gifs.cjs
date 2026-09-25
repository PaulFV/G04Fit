/* Legt das Wasserzeichen (PF-Logo mit Copyright-Zeile, assets/exercises/watermark.png, gebaut mit build-watermark.cjs) unten rechts auf die hellen Übungs-GIFs.
   Aufruf: node tools/watermark-gifs.cjs [name ...]
   Eingang: assets/exercises/sources/master/<name>-whiteclean.gif (Vorlagen ohne Wasserzeichen)
   Ausgang: assets/exercises/gifs/<name>-whiteclean.gif und tools/watermark-corners.json
   Die dunklen GIFs bekommen dasselbe Logo in tools/dark-gifs.html (liest watermark-corners.json).
   Benötigt: npm install @napi-rs/canvas gifuct-js */
const fs=require('fs');const path=require('path');const {parseGIF,decompressFrames}=require('gifuct-js');const {createCanvas,loadImage,GifEncoder}=require('@napi-rs/canvas');
// GIF lesen: jedes Bild als vollständiges RGBA-Bild (gifuct-js liefert nur die geänderten Teile)
function readGif(p) {
  const g = parseGIF(fs.readFileSync(p)), frames = decompressFrames(g, true);
  const W = g.lsd.width, H = g.lsd.height, out = [];
  const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
  let prev = null;
  for (const f of frames) {
    if (prev && prev.disposalType === 2) ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
    const id = ctx.createImageData(f.dims.width, f.dims.height); id.data.set(f.patch);
    const tmp = createCanvas(f.dims.width, f.dims.height); tmp.getContext('2d').putImageData(id, 0, 0);
    ctx.drawImage(tmp, f.dims.left, f.dims.top);
    out.push({ data: new Uint8ClampedArray(ctx.getImageData(0, 0, W, H).data), delay: f.delay });
    prev = f;
  }
  return { W, H, frames: out };
}

const ROOT=path.join(__dirname,'..'),M=path.join(ROOT,'assets/exercises/sources/master')+'/';
const outDir=path.join(ROOT,'assets/exercises/gifs');const only=process.argv.slice(2);
const LH=26,MARGIN=7,HALO=2;
let LW=0,RECTS={};
// Immer unten rechts. Trägt ein GIF unten rechts den Herkunftshinweis der Vorlage (butterfly-avatar), sitzt das
// Wasserzeichen direkt darüber, damit der Hinweis lesbar bleibt.
const LIFT={'butterfly-avatar':30};
(async()=>{
const logo=await loadImage(path.join(ROOT,'assets/exercises/watermark.png'));
LW=Math.round(LH*logo.width/logo.height);
RECTS={bl:[MARGIN,360-MARGIN-LH],tl:[MARGIN,MARGIN],tr:[360-MARGIN-LW,MARGIN],br:[360-MARGIN-LW,360-MARGIN-LH]};
const names=fs.readdirSync(M).filter(f=>f.endsWith('-whiteclean.gif')).map(f=>f.replace('-whiteclean.gif','')).filter(n=>!only.length||only.includes(n));
const corners={};
for(const n of names){
  const g=readGif(M+n+'-whiteclean.gif');const {W,H}=g;
  const lift=LIFT[n]||0;corners[n]={corner:'br',lift};
  const [lx,ly0]=RECTS.br;const ly=ly0-lift;
  // Logo mit dunklem Rand (Halo) auf einer Ebene vorbereiten
  const layer=createCanvas(W,H),lx2=layer.getContext('2d');lx2.imageSmoothingQuality='high';
  const halo=createCanvas(W,H),hx=halo.getContext('2d');hx.imageSmoothingQuality='high';
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]]){hx.drawImage(logo,lx+dx*1.0,ly+dy*1.0,LW,LH);}
  hx.globalCompositeOperation='source-in';hx.fillStyle='rgba(20,22,26,0.55)';hx.fillRect(0,0,W,H);
  lx2.drawImage(halo,0,0);lx2.drawImage(logo,lx,ly,LW,LH);
  const enc=new GifEncoder(W,H,{repeat:0,quality:1});
  g.frames.forEach(f=>{const c=createCanvas(W,H),x=c.getContext('2d');const id=x.createImageData(W,H);id.data.set(f.data);x.putImageData(id,0,0);x.globalAlpha=0.92;x.drawImage(layer,0,0);
    const o=x.getImageData(0,0,W,H).data;enc.addFrame(new Uint8Array(o.buffer,o.byteOffset,o.byteLength),W,H,{delay:f.delay});});
  // Unter Windows sperren Virenscanner/Indexer frisch geschriebene Dateien manchmal kurz: mehrfach versuchen.
  const buf=Buffer.from(enc.finish());
  for(let t=1;;t++){try{fs.writeFileSync(outDir+'/'+n+'-whiteclean.gif',buf);break;}catch(e){if(t>=8)throw e;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,500*t);}}
}
const cornerFile=path.join(__dirname,'watermark-corners.json');const all=fs.existsSync(cornerFile)?JSON.parse(fs.readFileSync(cornerFile,'utf8')):{};fs.writeFileSync(cornerFile,JSON.stringify(Object.assign(all,corners),null,1));
const cnt={};Object.values(corners).forEach(c=>cnt[c.corner]=(cnt[c.corner]||0)+1);console.log(names.length,'GIFs',cnt);
})();
