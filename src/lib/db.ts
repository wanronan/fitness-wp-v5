import Dexie, { type Table } from 'dexie';
import type { PersonId, WeekdayId } from '../data';

export interface SetEntry {
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

export interface ExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  prescription: string;
  targetRir: string;
  sets: SetEntry[];
}

export interface WorkoutSession {
  id?: number;
  person: PersonId;
  day: WeekdayId;
  dayLabel: string;
  emphasis: string;
  startedAt: string;
  finishedAt: string;
  completion: number;
  exercises: ExerciseEntry[];
}

export interface MeasureEntry {
  id?: number;
  person: PersonId;
  date: string;
  weight?: number | null;
  waist?: number | null;
  abdomen?: number | null;
  hip?: number | null;
  bodyFat?: number | null;
  muscleMass?: number | null;
  visceralFat?: number | null;
  notes?: string;
}

export class FitnessDb extends Dexie {
  sessions!: Table<WorkoutSession, number>;
  measures!: Table<MeasureEntry, number>;

  constructor() {
    super('fitness-wp-v5');
    this.version(1).stores({
      sessions: '++id, person, day, finishedAt',
      measures: '++id, person, date'
    });
  }
}

export const db = new FitnessDb();
