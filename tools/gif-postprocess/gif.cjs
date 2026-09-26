const fs=require('fs'),zlib=require('zlib');
function decodeGif(buf){
  let p=6;const W=buf.readUInt16LE(p),H=buf.readUInt16LE(p+2);const fl=buf[p+4];p+=7;
  let gct=null;if(fl&0x80){const n=3*(1<<((fl&7)+1));gct=buf.subarray(p,p+n);p+=n;}
  const frames=[];let gce=null;
  let canvas=new Uint8Array(W*H*4);
  while(p<buf.length){
    const b=buf[p++];
    if(b===0x3B)break;
    if(b===0x21){const lab=buf[p++];
      if(lab===0xF9){const f=buf[p+1];gce={disp:(f>>2)&7,trans:(f&1)?buf[p+4]:-1,delay:buf.readUInt16LE(p+2)*10};}
      while(buf[p]){p+=buf[p]+1;}p++;continue;}
    if(b===0x2C){
      const x0=buf.readUInt16LE(p),y0=buf.readUInt16LE(p+2),w=buf.readUInt16LE(p+4),h=buf.readUInt16LE(p+6);const f=buf[p+8];p+=9;
      let ct=gct;if(f&0x80){const n=3*(1<<((f&7)+1));ct=buf.subarray(p,p+n);p+=n;}
      const interlace=!!(f&0x40);const mcs=buf[p++];
      const data=[];while(buf[p]){data.push(buf.subarray(p+1,p+1+buf[p]));p+=buf[p]+1;}p++;
      const bytes=Buffer.concat(data);
      // LZW
      const clear=1<<mcs,eoi=clear+1;let size=mcs+1,next=eoi+1;const prefix=new Int32Array(4096),suffix=new Uint8Array(4096),len=new Uint16Array(4096);
      for(let i=0;i<clear;i++){suffix[i]=i;len[i]=1;prefix[i]=-1;}
      const out=new Uint8Array(w*h);let op=0,bits=0,nb=0,bp=0,prev=-1;
      function emit(code){let l=len[code];let q=op+l-1;let c=code;while(c>=0&&q>=op){out[q--]=suffix[c];c=prefix[c];}op+=l;}
      function first(code){while(prefix[code]>=0)code=prefix[code];return suffix[code];}
      while(op<out.length){
        while(nb<size&&bp<bytes.length){bits|=bytes[bp++]<<nb;nb+=8;}
        if(nb<size)break;const code=bits&((1<<size)-1);bits>>=size;nb-=size;
        if(code===clear){size=mcs+1;next=eoi+1;prev=-1;continue;}
        if(code===eoi)break;
        if(prev<0){emit(code);prev=code;continue;}
        if(code<next){emit(code);if(next<4096){prefix[next]=prev;suffix[next]=first(code);len[next]=len[prev]+1;next++;}}
        else{if(next<4096){prefix[next]=prev;suffix[next]=first(prev);len[next]=len[prev]+1;next++;}emit(code);}
        prev=code;if(next===(1<<size)&&size<12)size++;
      }
      // composite
      const prevCanvas=gce&&gce.disp===3?canvas.slice():null;
      const rows=[];if(interlace){const passes=[[0,8],[4,8],[2,4],[1,2]];for(const [s,st] of passes)for(let y=s;y<h;y+=st)rows.push(y);}else for(let y=0;y<h;y++)rows.push(y);
      for(let r=0;r<h;r++){const y=rows[r];for(let x=0;x<w;x++){const ci=out[r*w+x];if(gce&&ci===gce.trans)continue;const o=((y0+y)*W+x0+x)*4;canvas[o]=ct[ci*3];canvas[o+1]=ct[ci*3+1];canvas[o+2]=ct[ci*3+2];canvas[o+3]=255;}}
      frames.push({rgba:canvas.slice(),delay:gce?gce.delay:0});
      if(gce){if(gce.disp===2){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=((y0+y)*W+x0+x)*4;canvas[o]=canvas[o+1]=canvas[o+2]=canvas[o+3]=0;}}else if(gce.disp===3&&prevCanvas)canvas=prevCanvas;}
      gce=null;continue;}
  }
  return {W,H,frames};
}
function crc32(b){let c,crc=~0;for(let i=0;i<b.length;i++){c=(crc^b[i])&255;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xEDB88320:c>>>1;crc=(crc>>>8)^c;}return ~crc>>>0;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc32(td));return Buffer.concat([l,td,c]);}
function png(W,H,rgb){const raw=Buffer.alloc((W*3+1)*H);for(let y=0;y<H;y++){raw[y*(W*3+1)]=0;Buffer.from(rgb.buffer,rgb.byteOffset+y*W*3,W*3).copy(raw,y*(W*3+1)+1);}
 const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
module.exports={decodeGif,png};
