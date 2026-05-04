/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem, TerrainType } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_MONEY, LEVEL_REQUIREMENTS } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import { generateCityGoal, generateNewsEvent } from './services/geminiService';
import { createNoise2D } from 'simplex-noise';

// Initialize empty grid with island shape generation for 3D visual interest
const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  const center = GRID_SIZE / 2;
  const radius = GRID_SIZE / 2 - 2;
  const noise2D = createNoise2D();

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Distance from center
      const dist = Math.sqrt((x-center)*(x-center) + (y-center)*(y-center));
      
      // Basic noise for height
      let nx = x / 8 - 0.5;
      let ny = y / 8 - 0.5;
      let e = noise2D(nx, ny) * 0.5 + 0.5; // normalized to 0-1
      
      // Mask out edges to make an island
      let mask = Math.max(0, 1 - Math.pow(dist / radius, 2));
      e = e * mask;
      
      // Determine terrain type based on height
      let terrainType = TerrainType.Water;
      let height = 0;
      
      if (e < 0.15) {
        terrainType = TerrainType.Water;
        height = -0.1; // water level
      } else if (e < 0.25) {
        terrainType = TerrainType.Sand;
        height = 0;
      } else if (e < 0.6) {
        terrainType = TerrainType.Grass;
        height = (e - 0.25) * 0.5;
      } else if (e < 0.8) {
        terrainType = TerrainType.Forest;
        height = (e - 0.25) * 0.8;
      } else {
        terrainType = TerrainType.Stone;
        height = (e - 0.25) * 1.5;
      }

      // Initial ownership: Only the very center is owned.
      const isOwned = dist < 2 && terrainType !== TerrainType.Water;
      
      row.push({ 
        x, 
        y, 
        buildingType: BuildingType.None,
        terrainType,
        height,
        isOwned,
        variant: Math.floor(Math.random() * 3)
      });
    }
    grid.push(row);
  }
  return grid;
};

function App() {
  // --- Game State ---
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>({ money: INITIAL_MONEY, population: 0, day: 1, level: 0 });
  const [selectedTool, setSelectedTool] = useState<BuildingType>(BuildingType.Road);
  
  // --- AI State ---
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [pendingLandPurchase, setPendingLandPurchase] = useState<{ x: number, y: number, cost: number } | null>(null);
  
  // Refs for accessing state inside intervals without dependencies
  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);
  const aiEnabledRef = useRef(aiEnabled);

  // Sync refs
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { goalRef.current = currentGoal; }, [currentGoal]);
  useEffect(() => { aiEnabledRef.current = aiEnabled; }, [aiEnabled]);

  // --- AI Logic Wrappers ---

  const addNewsItem = useCallback((item: NewsItem) => {
    setNewsFeed(prev => [...prev.slice(-12), item]); // Keep last few
  }, []);

  const fetchNewGoal = useCallback(async () => {
    if (isGeneratingGoal || !aiEnabledRef.current) return;
    setIsGeneratingGoal(true);
    // Short delay for visual effect
    await new Promise(r => setTimeout(r, 500));
    
    try {
      const newGoal = await generateCityGoal(statsRef.current, gridRef.current);
      if (newGoal) {
        setCurrentGoal(newGoal);
      } else {
        // Retry soon if failed, but only if AI still enabled
        if(aiEnabledRef.current) setTimeout(fetchNewGoal, 5000);
      }
    } catch (e: any) {
      if (e.message === "RATE_LIMIT") {
        setAiEnabled(false);
        addNewsItem({ id: Date.now().toString(), text: "AIアドバイザーの利用制限に達しました。サンドボックスモードに移行します。", type: 'negative' });
      } else {
        if(aiEnabledRef.current) setTimeout(fetchNewGoal, 5000);
      }
    }
    setIsGeneratingGoal(false);
  }, [isGeneratingGoal, addNewsItem]); 

  const fetchNews = useCallback(async () => {
    // chance to fetch news per tick
    if (!aiEnabledRef.current || Math.random() > 0.15) return; 
    try {
      const news = await generateNewsEvent(statsRef.current, null);
      if (news) addNewsItem(news);
    } catch (e: any) {
      if (e.message === "RATE_LIMIT") {
        setAiEnabled(false);
        addNewsItem({ id: Date.now().toString(), text: "AIアドバイザーの利用制限に達しました。サンドボックスモードに移行します。", type: 'negative' });
      }
    }
  }, [addNewsItem]);


  // --- Initial Setup ---
  useEffect(() => {
    if (!gameStarted) return;

    addNewsItem({ id: Date.now().toString(), text: "SkyMetropolis へようこそ。地形の生成が完了しました。", type: 'positive' });
    
    if (aiEnabled) {
      // @google/genai-api-key-fix: The API key's availability is a hard requirement and should not be checked in the UI.
      fetchNewGoal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);


  // --- Game Loop ---
  useEffect(() => {
    if (!gameStarted) return;

    const intervalId = setInterval(() => {
      // 1. Calculate income/pop gen
      let dailyIncome = 0;
      let dailyPopGrowth = 0;
      let buildingCounts: Record<string, number> = {};

      gridRef.current.flat().forEach(tile => {
        if (tile.buildingType !== BuildingType.None) {
          const config = BUILDINGS[tile.buildingType];
          dailyIncome += config.incomeGen;
          dailyPopGrowth += config.popGen;
          buildingCounts[tile.buildingType] = (buildingCounts[tile.buildingType] || 0) + 1;
        }
      });

      // Cap population growth by residential count just for some logic
      const resCount = buildingCounts[BuildingType.Residential] || 0;
      const highriseCount = buildingCounts[BuildingType.Highrise] || 0;
      const stadiumCount = buildingCounts[BuildingType.Stadium] || 0;
      const maxPop = (resCount * 50) + (highriseCount * 300) + (stadiumCount * 1000);

      // 2. Update Stats
      setStats(prev => {
        let newPop = prev.population + dailyPopGrowth;
        if (newPop > maxPop) newPop = maxPop; // limit
        if (maxPop === 0 && prev.population > 0) newPop = Math.max(0, prev.population - 5); // people leave if no capacity

        let newLevel = 0;
        for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
          if (newPop >= LEVEL_REQUIREMENTS[i]) {
            newLevel = i;
            break;
          }
        }

        const newStats = {
          money: prev.money + dailyIncome,
          population: newPop,
          day: prev.day + 1,
          level: newLevel,
        };
        
        // 3. Check Goal Completion
        const goal = goalRef.current;
        if (aiEnabledRef.current && goal && !goal.completed) {
          let isMet = false;
          if (goal.targetType === 'money' && newStats.money >= goal.targetValue) isMet = true;
          if (goal.targetType === 'population' && newStats.population >= goal.targetValue) isMet = true;
          if (goal.targetType === 'building_count' && goal.buildingType) {
            if ((buildingCounts[goal.buildingType] || 0) >= goal.targetValue) isMet = true;
          }

          if (isMet) {
            setCurrentGoal({ ...goal, completed: true });
          }
        }

        return newStats;
      });

      // 4. Trigger news
      fetchNews();

    }, TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [fetchNews, gameStarted]);


  // --- Interaction Logic ---

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return; // Prevent clicking through start screen

    const currentGrid = gridRef.current;
    const currentStats = statsRef.current;
    const tool = selectedTool; // Capture current tool
    
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const currentTile = currentGrid[y][x];
    const buildingConfig = BUILDINGS[tool];

    // Land Purchase Logic
    if (!currentTile.isOwned) {
      if (currentTile.terrainType === TerrainType.Water) {
        addNewsItem({id: Date.now().toString(), text: "水上には建設できません。", type: 'negative'});
        return;
      }
      
      const landCost = 200 + (statsRef.current.level * 100);
      
      // Check if adjacent to owned land
      const isAdjacent = (
        (y > 0 && currentGrid[y-1][x].isOwned) ||
        (y < GRID_SIZE - 1 && currentGrid[y+1][x].isOwned) ||
        (x > 0 && currentGrid[y][x-1].isOwned) ||
        (x < GRID_SIZE - 1 && currentGrid[y][x+1].isOwned)
      );

      if (!isAdjacent) {
        addNewsItem({id: Date.now().toString(), text: "自分の土地に隣接した区画しか購入できません。", type: 'negative'});
        return;
      }

      if (currentStats.money >= landCost) {
        setPendingLandPurchase({ x, y, cost: landCost });
      } else {
        addNewsItem({id: Date.now().toString(), text: `区画の購入には ${landCost} の資金が必要です。`, type: 'negative'});
      }
      return;
    }

    // Bulldoze logic
    if (tool === BuildingType.None) {
      if (currentTile.buildingType !== BuildingType.None) {
        const demolishCost = 5;
        if (currentStats.money >= demolishCost) {
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[y][x] = { ...currentTile, buildingType: BuildingType.None };
            setGrid(newGrid);
            setStats(prev => ({ ...prev, money: prev.money - demolishCost }));
            // Sound effect here
        } else {
            addNewsItem({id: Date.now().toString(), text: "取り壊し費用が足りません。", type: 'negative'});
        }
      }
      return;
    }

    // Placement Logic
    if (currentTile.buildingType === BuildingType.None) {
      if (currentStats.money >= buildingConfig.cost) {
        // Deduct cost
        setStats(prev => ({ ...prev, money: prev.money - buildingConfig.cost }));
        
        // Place building
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[y][x] = { ...currentTile, buildingType: tool };
        setGrid(newGrid);
        // Sound effect here
      } else {
        // Not enough money feedback
        addNewsItem({id: Date.now().toString() + Math.random(), text: `${buildingConfig.name} を建設する資金がありません。`, type: 'negative'});
      }
    }
  }, [selectedTool, addNewsItem, gameStarted]);

  const confirmLandPurchase = useCallback(() => {
    if (!pendingLandPurchase) return;
    const { x, y, cost } = pendingLandPurchase;
    const currentGrid = gridRef.current;
    if (statsRef.current.money >= cost) {
      const newGrid = currentGrid.map(row => [...row]);
      newGrid[y][x] = { ...currentGrid[y][x], isOwned: true };
      setGrid(newGrid);
      setStats(prev => ({ ...prev, money: prev.money - cost }));
      addNewsItem({id: Date.now().toString(), text: `新しい区画を $${cost} で購入しました！`, type: 'positive'});
    }
    setPendingLandPurchase(null);
  }, [pendingLandPurchase, addNewsItem]);

  const cancelLandPurchase = useCallback(() => {
    setPendingLandPurchase(null);
  }, []);

  const handleClaimReward = () => {
    if (currentGoal && currentGoal.completed) {
      setStats(prev => ({ ...prev, money: prev.money + currentGoal.reward }));
      addNewsItem({id: Date.now().toString(), text: `目標達成！ ${currentGoal.reward} の資金を獲得しました。`, type: 'positive'});
      setCurrentGoal(null);
      fetchNewGoal();
    }
  };

  const handleStart = (enabled: boolean) => {
    setAiEnabled(enabled);
    setGameStarted(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-transparent selection:text-transparent bg-sky-900">
      {/* 3D Rendering Layer - Always visible now, providing background for start screen */}
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        population={stats.population}
        level={stats.level}
        money={stats.money}
      />
      
      {/* Start Screen Overlay */}
      {!gameStarted && (
        <StartScreen onStart={handleStart} />
      )}

      {/* UI Layer */}
      {gameStarted && (
        <UIOverlay
          stats={stats}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          currentGoal={currentGoal}
          newsFeed={newsFeed}
          onClaimReward={handleClaimReward}
          isGeneratingGoal={isGeneratingGoal}
          aiEnabled={aiEnabled}
        />
      )}

      {pendingLandPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl max-w-sm w-full mx-4 animate-fade-in text-white">
            <h3 className="text-xl font-bold mb-2">区画の購入</h3>
            <p className="text-slate-300 mb-6 font-mono text-sm">
              この区画を <span className="font-bold text-yellow-500">${pendingLandPurchase.cost}</span> で購入しますか？
            </p>
            <div className="flex gap-4">
              <button 
                onClick={cancelLandPurchase}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors text-sm"
              >
                キャンセル
              </button>
              <button 
                onClick={confirmLandPurchase}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(5,150,105,0.5)] text-sm"
              >
                購入する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations and utility */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in { animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .mask-image-b { -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%); mask-image: linear-gradient(to bottom, transparent 0%, black 15%); }
        
        /* Vertical text for toolbar label */
        .writing-mode-vertical { writing-mode: vertical-rl; text-orientation: mixed; }
        
        /* Custom scrollbar for news */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>
    </div>
  );
}

export default App;