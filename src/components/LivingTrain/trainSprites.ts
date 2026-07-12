import type { SpriteCoords } from './trainTypes';

export const Sprites = {
  FlatBedVariants: [
    { x: 0, y: 0, w: 32, h: 32 },
    { x: 32, y: 0, w: 32, h: 32 },
  ] as SpriteCoords[],
  
  ContainerVariants: [
    { x: 64, y: 0, w: 32, h: 32 },
    { x: 96, y: 0, w: 32, h: 32 },
    { x: 128, y: 0, w: 32, h: 32 },
    { x: 160, y: 0, w: 32, h: 32 },
  ] as SpriteCoords[],
  
  BinVariants: [
    { x: 0, y: 32, w: 32, h: 32 },
    { x: 32, y: 32, w: 32, h: 32 },
  ] as SpriteCoords[],
  
  Tags32Wide: [
    { x: 64, y: 32, w: 32, h: 32 },
    { x: 96, y: 32, w: 32, h: 32 },
    { x: 128, y: 32, w: 32, h: 32 },
    { x: 160, y: 32, w: 32, h: 32 },
  ] as SpriteCoords[],
  
  IndustrialEngineVariants: [
    { x: 0, y: 64, w: 48, h: 32 },
    { x: 48, y: 64, w: 48, h: 32 },
  ] as SpriteCoords[],
  
  TracksBase: { x: 176, y: 64, w: 16, h: 32 } as SpriteCoords,
  
  TracksVariants: [
    { x: 96, y: 64, w: 16, h: 32 },
    { x: 112, y: 64, w: 16, h: 32 },
    { x: 128, y: 64, w: 16, h: 32 },
    { x: 144, y: 64, w: 16, h: 32 },
    { x: 160, y: 64, w: 16, h: 32 },
    { x: 128, y: 96, w: 16, h: 32 },
    { x: 144, y: 96, w: 16, h: 32 },
    { x: 160, y: 96, w: 16, h: 32 },
    { x: 176, y: 96, w: 16, h: 32 },
  ] as SpriteCoords[],
  
  TGVCarriage: { x: 0, y: 96, w: 64, h: 32 } as SpriteCoords,
  TGVEngine: { x: 64, y: 96, w: 64, h: 32 } as SpriteCoords,
  
  TEREngineVariants: [
    { x: 0, y: 128, w: 48, h: 32 },
    { x: 48, y: 128, w: 48, h: 32 },
    { x: 96, y: 128, w: 48, h: 32 },
  ] as SpriteCoords[],
  
  TERCarriageVariants: [
    { x: 0, y: 160, w: 48, h: 32 },
    { x: 48, y: 160, w: 48, h: 32 },
    { x: 96, y: 160, w: 48, h: 32 },
  ] as SpriteCoords[],
  
  Tags48Wide: [
    { x: 144, y: 128, w: 48, h: 32 },
    { x: 144, y: 160, w: 48, h: 32 },
  ] as SpriteCoords[],
};
