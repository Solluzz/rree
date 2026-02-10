
export type TaskType = 'watering' | 'fertilization';

export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringFrequency: number; // in days
  fertilizationFrequency: number; // in days
  lastWatered: string; // ISO date
  lastFertilized: string; // ISO date
  image: string;
  notes: string;
}

export interface CareTask {
  id: string;
  plantId: string;
  plantName: string;
  type: TaskType;
  dueDate: string;
  completed: boolean;
}

export interface DayTasks {
  date: Date;
  tasks: CareTask[];
}
