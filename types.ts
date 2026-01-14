
export enum UnitSystem {
  METRIC = 'METRIC',
  IMPERIAL = 'IMPERIAL'
}

export enum InputMode {
  MEASURED = 'MEASURED', // CM or Inches
  SQUARES = 'SQUARES'    // 1.5cm Squares
}

export enum AdjustmentType {
  MOA_1_4 = '1/4 MOA',
  MOA_1_8 = '1/8 MOA',
  MOA_1_2 = '1/2 MOA',
  MIL_0_1 = '0.1 MIL (mrad)',
  MIL_0_05 = '0.05 MIL (mrad)'
}

export interface ZeroInput {
  distance: number;
  unit: UnitSystem;
  inputMode: InputMode;
  adjustment: AdjustmentType;
  horizontalOffset: number; // Em CM ou Pol
  verticalOffset: number;   // Em CM ou Pol
}

export interface ZeroResult {
  horizontalClicks: number;
  horizontalDirection: 'LEFT' | 'RIGHT' | 'NONE';
  verticalClicks: number;
  verticalDirection: 'UP' | 'DOWN' | 'NONE';
  description: string;
}
