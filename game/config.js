export const TILE = 32;
export const GRAVITY = 0.6;
export const MOVE_SPEED = 2.5;
export const AIR_ACCEL = 0.25;
export const JUMP_VELOCITY = 10.25;
export const MAX_FALL_SPEED = 16;
export const CAM_LERP = 0.12;

export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }