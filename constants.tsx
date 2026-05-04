/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType } from './types';

// Map Settings
export const GRID_SIZE = 15;

// Game Settings
export const TICK_RATE_MS = 2000; // Game loop updates every 2 seconds
export const INITIAL_MONEY = 1000;

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: '取り壊す',
    description: 'タイルを空き地にする',
    color: '#ef4444', // Used for UI
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 10,
    name: '道路',
    description: '建物を繋ぎます。',
    color: '#374151', // gray-700
    popGen: 0,
    incomeGen: 0,
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential,
    cost: 100,
    name: '住宅',
    description: '人口 +5/日',
    color: '#f87171', // red-400
    popGen: 5,
    incomeGen: 0,
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial,
    cost: 200,
    name: '店舗',
    description: '資金 +15/日',
    color: '#60a5fa', // blue-400
    popGen: 0,
    incomeGen: 15,
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial,
    cost: 400,
    name: '工場',
    description: '資金 +40/日',
    color: '#facc15', // yellow-400
    popGen: 0,
    incomeGen: 40,
  },
  [BuildingType.Park]: {
    type: BuildingType.Park,
    cost: 50,
    name: '公園',
    description: '景観が良くなります。',
    color: '#4ade80', // green-400
    popGen: 1,
    incomeGen: 0,
  },
  [BuildingType.Office]: {
    type: BuildingType.Office,
    cost: 1000,
    name: 'オフィス',
    description: '資金 +100/日',
    color: '#3b82f6', // blue-500
    popGen: 0,
    incomeGen: 100,
    unlockLevel: 2,
  },
  [BuildingType.Highrise]: {
    type: BuildingType.Highrise,
    cost: 2500,
    name: '高層マンション',
    description: '人口 +30/日',
    color: '#ec4899', // pink-500
    popGen: 30,
    incomeGen: 0,
    unlockLevel: 3,
  },
  [BuildingType.Mall]: {
    type: BuildingType.Mall,
    cost: 8000,
    name: 'ショッピングモール',
    description: '資金 +500/日',
    color: '#8b5cf6', // violet-500
    popGen: 0,
    incomeGen: 500,
    unlockLevel: 3,
  },
  [BuildingType.PowerPlant]: {
    type: BuildingType.PowerPlant,
    cost: 20000,
    name: '発電所',
    description: '資金 +1500/日',
    color: '#ea580c', // orange-500
    popGen: 0,
    incomeGen: 1500,
    unlockLevel: 4,
  },
  [BuildingType.Stadium]: {
    type: BuildingType.Stadium,
    cost: 50000,
    name: 'スタジアム',
    description: '人口 +150, 資金 +2000/日',
    color: '#10b981', // emerald-500
    popGen: 150,
    incomeGen: 2000,
    unlockLevel: 5,
  },
};

export const LEVEL_REQUIREMENTS = [
  0,      // Level 0: 開拓地
  50,     // Level 1: 村
  200,    // Level 2: 町
  1000,   // Level 3: 市
  5000,   // Level 4: 大都市
  20000,  // Level 5: メガロポリス
];

export const LEVEL_NAMES = [
  "開拓地",
  "村",
  "町",
  "市",
  "大都市",
  "メガロポリス"
];

export const TERRAIN_COLORS = {
  Water: '#3b82f6', // blue-500
  Sand: '#fde047', // yellow-300
  Grass: '#4ade80', // green-400
  Forest: '#166534', // green-800
  Stone: '#9ca3af', // gray-400
};