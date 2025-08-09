import { TILE } from './config.js';

const LEVELS = [
`                                
  c      m           c           
###########     #######     #####
=                              D#
=   c       m     c      m     #
=###########################  ###
=                             ###
=   c        i                 ##
=         ######               ##
=   m                    c     ##
=#############       ######### ##
=                              ##
=   c    m       c        i    ##
=################################
P                               `,
`                                
 m      c     i      m      c   
#############        #########  
=                               
=    c      m     c      m    D#
=############################# ##
=                               #
=   c           i               #
=         #######               #
=   m                    c      #
=###########      ###############
=                               #
=   c    m       c              #
=################################
P                               `
];

export function spawnMonster(x,y){
  return {
    x, y, w:22, h:26, vx: (Math.random()<.5?-1:1)*1.1, vy:0, onGround:false, dir:1, alive:true, patrolLeft:x-80, patrolRight:x+80, hitCooldown:0
  };
}

export function parseLevel(idx){
  const lines = LEVELS[idx].split('\n');
  const width = Math.max(...lines.map(l => l.length));
  const height = lines.length;
  const tiles = [];
  let playerSpawn = {x: 32, y: 0};
  const coins = [];
  const monsters = [];
  const items = [];
  let door = {x: (width-2)*TILE, y:(3)*TILE};

  for (let y=0;y<height;y++){
    for (let x=0;x<width;x++){
      const ch = (lines[y][x] || ' ');
      const px = x*TILE, py = y*TILE;
      if (ch === 'P') playerSpawn = {x:px, y:py};
      if (ch === 'D') door = {x:px, y:py};
      if (ch === '#') tiles.push({x:px,y:py,type:'#'});
      if (ch === '=') tiles.push({x:px,y:py,type:'='});
      if (ch === '^') tiles.push({x:px,y:py,type:'^'});
      if (ch === 'c') coins.push({x:px,y:py,collected:false});
      if (ch === 'm') monsters.push(spawnMonster(px, py));
      if (ch === 'i') items.push({x:px,y:py,held:false});
    }
  }
  return { width: width*TILE, height: height*TILE, tiles, coins, monsters, items, door, playerSpawn };
}