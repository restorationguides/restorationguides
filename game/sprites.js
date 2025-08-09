import { TILE } from './config.js';

export function drawEmoji(ctx, scale, char, x, y){
  const px = x*scale, py = y*scale;
  ctx.save();
  ctx.font = `${Math.floor(24*scale)}px system-ui,apple color emoji,Segoe UI Emoji`;
  ctx.textBaseline = 'top';
  ctx.fillText(char, px+4, py+4);
  ctx.restore();
}

export const SPR = {
  player(ctx, scale, x,y,w,h,flip,crouch,holding){
    ctx.save();
    ctx.translate(x*scale, y*scale);
    ctx.scale(scale, scale);
    if (flip) ctx.scale(-1,1);

    ctx.fillStyle = '#6be67a';
    ctx.fillRect(flip?-w:0, 0, w, h);
    ctx.fillStyle = '#202a36';
    ctx.fillRect(flip?-(w-4):4, 6, w-8, 12);

    if (holding){
      ctx.fillStyle = '#ffd86b';
      ctx.fillRect(flip?-(w+6):(w-6), crouch? h-14 : 10, 6, 6);
    }
    ctx.restore();
  },
  goober(ctx, scale, x,y,w,h){
    ctx.save();
    ctx.translate(x*scale, y*scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#c67bff';
    ctx.fillRect(0, 6, w, h-6);
    ctx.fillStyle = '#854df0';
    ctx.fillRect(-2, 0, w+4, 10);
    ctx.restore();
  },
  coin(ctx, scale, x,y){
    drawEmoji(ctx, scale, '🪙', x, y);
  },
  spike(ctx, scale, x,y){
    ctx.save();
    ctx.translate(x*scale, y*scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#9bb3c9';
    ctx.beginPath();
    for(let i=0;i<4;i++){
      ctx.moveTo(i*8,16);
      ctx.lineTo(i*8+4,0);
      ctx.lineTo(i*8+8,16);
    }
    ctx.fill();
    ctx.restore();
  },
  block(ctx, scale, x,y,type){
    ctx.save();
    ctx.translate(x*scale, y*scale);
    ctx.scale(scale, scale);
    if (type === '#') {
      ctx.fillStyle = '#2b3c4f';
      ctx.fillRect(0,0,TILE,TILE);
      ctx.fillStyle = '#3a4f66';
      ctx.fillRect(2,2,TILE-4,TILE-4);
    } else if (type === '=') {
      ctx.fillStyle = '#283a2d';
      ctx.fillRect(0,0,TILE,TILE);
      ctx.fillStyle = '#2f6142';
      ctx.fillRect(0,TILE-8,TILE,8);
    }
    ctx.restore();
  },
  door(ctx, scale, x,y,open=true){
    ctx.save();
    ctx.translate(x*scale, y*scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = open ? '#8cc7ff' : '#32465a';
    ctx.fillRect(4,4,TILE-8,TILE-4);
    ctx.fillStyle = '#1b2736';
    ctx.fillRect(8,8,TILE-16,TILE-12);
    ctx.restore();
  },
  item(ctx, scale, x,y){
    drawEmoji(ctx, scale, '🪓', x, y);
  }
};