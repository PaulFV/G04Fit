// Lossless GIF writer: frames = [{rgba, delay(ms)}], transparent index 0, disposal 2, looping
function encodeGif(W,H,frames){
  const out=[];const w16=v=>out.push(v&255,(v>>8)&255);
  out.push(...Buffer.from('GIF89a'));w16(W);w16(H);out.push(0x00,0,0);
  out.push(0x21,0xFF,11,...Buffer.from('NETSCAPE2.0'),3,1,0,0,0);
  for(const fr of frames){
    const p=fr.rgba,N=W*H,map=new Map(),pal=[[0,0,0]];const idx=new Uint8Array(N);
    for(let i=0;i<N;i++){if(!p[i*4+3]){idx[i]=0;continue;}const key=(p[i*4]<<16)|(p[i*4+1]<<8)|p[i*4+2];let v=map.get(key);if(v===undefined){v=pal.length;if(v>255)throw new Error('too many colours');map.set(key,v);pal.push([p[i*4],p[i*4+1],p[i*4+2]]);}idx[i]=v;}
    let bits=1;while((1<<bits)<pal.length)bits++;if(bits<2)bits=2;
    out.push(0x21,0xF9,4,0x09);w16(Math.round(fr.delay/10));out.push(0,0);
    out.push(0x2C);w16(0);w16(0);w16(W);w16(H);out.push(0x80|(bits-1));
    for(let i=0;i<(1<<bits);i++){const c=pal[i]||[0,0,0];out.push(c[0],c[1],c[2]);}
    out.push(bits);
    // LZW
    const mcs=bits,clear=1<<mcs,eoi=clear+1;let size=mcs+1,next=eoi+1,table=new Map();
    const bytes=[];let cur=0,nb=0;const emit=code=>{cur|=code<<nb;nb+=size;while(nb>=8){bytes.push(cur&255);cur>>=8;nb-=8;}};
    emit(clear);let prefix=idx[0];
    for(let i=1;i<N;i++){const c=idx[i],key=prefix*256+c;const e=table.get(key);
      if(e!==undefined){prefix=e;}else{emit(prefix);if(next<4096){table.set(key,next++);if(next-1===(1<<size)&&size<12)size++;}else{emit(clear);size=mcs+1;next=eoi+1;table=new Map();}prefix=c;}}
    emit(prefix);emit(eoi);if(nb>0)bytes.push(cur&255);
    for(let i=0;i<bytes.length;i+=255){const n=Math.min(255,bytes.length-i);out.push(n);for(let k=0;k<n;k++)out.push(bytes[i+k]);}
    out.push(0);
  }
  out.push(0x3B);return Buffer.from(out);
}
module.exports={encodeGif};
