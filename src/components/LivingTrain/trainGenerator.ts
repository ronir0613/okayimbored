import { Sprites } from './trainSprites';
import type { SpriteCoords, TrainData, TrainType, WagonData } from './trainTypes';

function chooseOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function createWagon(sprite: SpriteCoords, flip = false, tag?: SpriteCoords): WagonData {
  return {
    sprite,
    tag,
    flip,
    length: sprite.w,
  };
}

export function generateIndustrialTrain(): TrainData {
  const typeDiceThrow = randInt(100);
  const wagons: WagonData[] = [
    createWagon(chooseOne(Sprites.IndustrialEngineVariants)),
  ];

  if (typeDiceThrow < 30) {
    // container and flatbeds, 5-7 wagons, 30% chance of tag
    const numWagons = randInt(3) + 5;
    for (let i = 0; i < numWagons; i++) {
      if (randInt(2) === 0) {
        wagons.push(createWagon(chooseOne(Sprites.FlatBedVariants)));
      } else {
        const container = createWagon(chooseOne(Sprites.ContainerVariants));
        if (randInt(3) === 0) {
          container.tag = chooseOne(Sprites.Tags32Wide);
        }
        wagons.push(container);
      }
    }
  } else if (typeDiceThrow < 60) {
    // bins and flatbed, 3-6 wagons, 30-70 partition, 10% chance of tag on bins
    const numWagons = randInt(4) + 3;
    for (let i = 0; i < numWagons; i++) {
      if (randInt(10) < 4) {
        const bin = createWagon(chooseOne(Sprites.BinVariants));
        if (randInt(10) === 0) {
          bin.tag = chooseOne(Sprites.Tags32Wide);
        }
        wagons.push(bin);
      } else {
        wagons.push(createWagon(chooseOne(Sprites.FlatBedVariants)));
      }
    }
  } else if (typeDiceThrow < 90) {
    // container only, 3-7 wagons, 60% chance of tag
    const numWagons = randInt(5) + 3;
    for (let i = 0; i < numWagons; i++) {
      const container = createWagon(chooseOne(Sprites.ContainerVariants));
      if (randInt(10) < 6) {
        container.tag = chooseOne(Sprites.Tags32Wide);
      }
      wagons.push(container);
    }
  } else {
    // 12-20 bins, 10% chance of tag
    const numWagons = randInt(9) + 12;
    for (let i = 0; i < numWagons; i++) {
      const bin = createWagon(chooseOne(Sprites.BinVariants));
      if (randInt(10) === 0) {
        bin.tag = chooseOne(Sprites.Tags32Wide);
      }
      wagons.push(bin);
    }
  }

  const length = wagons.reduce((acc, w) => acc + w.length, 0);
  return { wagons, length, speed: 1 };
}

function generateOneTER(typeDiceThrow: number): TrainData {
  const wagons: WagonData[] = [];
  wagons.push(createWagon(Sprites.TEREngineVariants[typeDiceThrow]));

  const numCarriages = randInt(3) + 3;
  for (let i = 0; i < numCarriages; i++) {
    const carriage = createWagon(Sprites.TERCarriageVariants[typeDiceThrow]);
    if (randInt(100) < 15) {
      carriage.tag = chooseOne(Sprites.Tags48Wide);
    }
    wagons.push(carriage);
  }

  const flippedEngine = createWagon(Sprites.TEREngineVariants[typeDiceThrow], true);
  wagons.push(flippedEngine);

  const length = wagons.reduce((acc, w) => acc + w.length, 0);
  return { wagons, length, speed: 1.5 };
}

export function generateTER(): TrainData {
  let typeDiceThrow = randInt(100);
  if (typeDiceThrow < 50) {
    typeDiceThrow = 0;
  } else if (typeDiceThrow < 90) {
    typeDiceThrow = 1;
  } else {
    typeDiceThrow = 2;
  }

  if (randInt(2) === 0) {
    return generateOneTER(typeDiceThrow);
  } else {
    const train1 = generateOneTER(typeDiceThrow);
    const train2 = generateOneTER(typeDiceThrow);
    return {
      wagons: [...train1.wagons, ...train2.wagons],
      length: train1.length + train2.length,
      speed: Math.min(train1.speed, train2.speed),
    };
  }
}

export function generateTGV(): TrainData {
  const wagons: WagonData[] = [];
  wagons.push(createWagon(Sprites.TGVEngine));

  const numCarriages = randInt(4) + 5;
  for (let i = 0; i < numCarriages; i++) {
    wagons.push(createWagon(Sprites.TGVCarriage));
  }

  wagons.push(createWagon(Sprites.TGVEngine, true));

  const length = wagons.reduce((acc, w) => acc + w.length, 0);
  return { wagons, length, speed: 2 };
}

export function generateTrain(type: TrainType = 'random'): TrainData {
  if (type === 'random') {
    const dice = randInt(100);
    if (dice < 45) {
      return generateTER();
    } else if (dice < 85) {
      return generateIndustrialTrain();
    } else {
      return generateTGV();
    }
  }

  switch (type) {
    case 'TER': return generateTER();
    case 'TGV': return generateTGV();
    case 'Industrial': return generateIndustrialTrain();
    default: return generateIndustrialTrain();
  }
}

export function generateTracks(screenWidth: number, onlyCleanTracks: boolean = false): SpriteCoords[] {
  const tracks: SpriteCoords[] = [];
  const tileCount = Math.ceil(screenWidth / 16);
  
  if (onlyCleanTracks) {
    for (let i = 0; i < tileCount; i++) {
      tracks.push(Sprites.TracksBase);
    }
  } else {
    for (let i = 0; i < tileCount; i++) {
      if (randInt(10) < 6) {
        tracks.push(Sprites.TracksBase);
      } else {
        tracks.push(chooseOne(Sprites.TracksVariants));
      }
    }
  }
  
  return tracks;
}
