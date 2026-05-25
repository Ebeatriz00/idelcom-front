
export interface ExercisesResponseDto {
  exercisesId: number;
  description: string;
  status: string;
  endDate: string; 
  exercisesCount: number;
  indBlock: boolean;
}

export interface PeriodsResponseDto {
  periodsId: number;
  exercisesId: number;
  description: string;
  endDate: string; 
  status: string;
  exerciseDescription: string;
  periodsCount: number;
  indBlock: boolean;
}

export interface PeriodsUpsertDto {
  periodsId?: number;
  exercisesId: number;
  description: string;
  endDate: string;
  status?: string;
}

export interface PeriodsStatusDto {
  periodsId: number;
  status: string; 
}

export interface ExercisesUpsertDto {
  exercisesId?: number;
  description: string;
  endDate: string;
  status?: string;
}


export interface ExercisesStatusDto{
  exercisesId: number;
  status: string
}


export interface ExercisesBlockToggleDto {
  exercisesId: number;
  indBlock: boolean; 
}
export interface PeriodsBlockToggleDto {
  periodsId: number;
  indBlock: boolean; 
}