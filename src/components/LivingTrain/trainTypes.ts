export type TrainType = 'TER' | 'TGV' | 'Industrial' | 'random';

export interface SpriteCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WagonData {
  sprite: SpriteCoords;
  tag?: SpriteCoords;
  flip: boolean;
  length: number;
}

export interface TrainData {
  wagons: WagonData[];
  length: number;
  speed: number; // base speed multiplier
}

export interface TrainProps {
  /**
   * The type of train to generate. Defaults to 'random'.
   */
  trainType?: TrainType;

  /**
   * Direction the train will move towards.
   * "left" means it enters from the right and moves left.
   * "right" means it enters from the left and moves right.
   * Defaults to 'left'.
   */
  direction?: 'left' | 'right';

  /**
   * Animation duration (in seconds) for the train to cross the screen.
   * Alternatively, we can use a fixed CSS speed if this is omitted.
   */
  speed?: number;

  /**
   * Visual scaling of the train. Defaults to 1 (pixel perfect).
   */
  scale?: number;

  /**
   * Should the train loop continuously after it departs? Defaults to false.
   */
  loop?: boolean;

  /**
   * Automatically depart after arriving? Defaults to false.
   */
  autoDepart?: boolean;

  /**
   * Render the tracks underneath the train. Defaults to true.
   */
  showTracks?: boolean;

  /**
   * Render the train stationary (e.g. for display purposes like "Train of the Month").
   */
  stationary?: boolean;

  /**
   * Provide a container width for the track generation. Defaults to window width if not provided.
   */
  containerWidth?: number;

  /**
   * How long to pause (in ms) when it arrives, before departing (if autoDepart is true).
   * Defaults to 3000ms.
   */
  pauseDuration?: number;

  /**
   * Optional callbacks.
   */
  onArrival?: () => void;
  onDeparture?: () => void;

  className?: string;
  style?: React.CSSProperties;
}
