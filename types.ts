/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None',
  Road = 'Road',
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Park = 'Park',
  School = 'School',
  HighSchool = 'HighSchool',
  University = 'University',
  Office = 'Office',
  AdvancedOffice = 'AdvancedOffice',
  Highrise = 'Highrise',
  Mall = 'Mall',
  PowerPlant = 'PowerPlant',
  Stadium = 'Stadium',
}

export enum TerrainType {
  Water = 'Water',
  Sand = 'Sand',
  Grass = 'Grass',
  Forest = 'Forest',
  Stone = 'Stone'
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string; // Main color for 3D material
  popGen: number; // Population generation per tick
  incomeGen: number; // Money generation per tick
  unlockLevel?: number; // Optional level requirement
  educateCapacity?: { level: 'primary' | 'secondary' | 'higher', amount: number }; // How many it can educate per tick
  requireEducation?: { level: 'higher', amount: number }; // Requirement to build
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  terrainType: TerrainType;
  height: number;
  isOwned: boolean;
  variant?: number;
}

export type Grid = TileData[][];

export interface DemographicStats {
  children: number;
  youngAdults: number;
  adults: number;
  seniors: number;
}

export interface EducationStats {
  uneducated: number;
  primary: number;
  secondary: number;
  higher: number;
}

export interface CityStats {
  money: number;
  population: number;
  day: number;
  level: number;
  demographics: DemographicStats;
  education: EducationStats;
}

export interface AIGoal {
  description: string;
  targetType: 'population' | 'money' | 'building_count';
  targetValue: number;
  buildingType?: BuildingType; // If target is building_count
  reward: number;
  completed: boolean;
}

export type GameGoalType = 'sandbox' | 'pop1000' | 'pop5000' | 'money1m' | 'maxLevel';

export interface HighScore {
  goal: GameGoalType;
  days: number;
  date: string;
}

export interface NewsItem {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}