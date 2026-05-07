/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';
import { BuildingType, CityStats, AIGoal, NewsItem } from '../types';
import { BUILDINGS, LEVEL_NAMES, LEVEL_REQUIREMENTS } from '../constants';
import { ChartsModal } from './ChartsModal';

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: BuildingType;
  onSelectTool: (type: BuildingType) => void;
  currentGoal: AIGoal | null;
  newsFeed: NewsItem[];
  onClaimReward: () => void;
  isGeneratingGoal: boolean;
  aiEnabled: boolean;
  onReset: () => void;
}

const tools = [
  BuildingType.None, // Bulldoze
  BuildingType.Road,
  BuildingType.Residential,
  BuildingType.Park,
  BuildingType.School,
  BuildingType.HighSchool,
  BuildingType.University,
  BuildingType.Commercial,
  BuildingType.Industrial,
  BuildingType.Office,
  BuildingType.AdvancedOffice,
  BuildingType.Highrise,
  BuildingType.Mall,
  BuildingType.PowerPlant,
  BuildingType.Stadium,
];

const ToolButton: React.FC<{
  type: BuildingType;
  isSelected: boolean;
  onClick: () => void;
  stats: CityStats;
}> = ({ type, isSelected, onClick, stats }) => {
  const config = BUILDINGS[type];
  const canAfford = stats.money >= config.cost;
  const isBulldoze = type === BuildingType.None;
  const isLevelLocked = config.unlockLevel !== undefined && stats.level < config.unlockLevel;
  
  let eduLocked = false;
  let eduLockReason = '';
  if (config.requireEducation) {
    if (config.requireEducation.level === 'higher' && stats.education.higher < config.requireEducation.amount) {
      eduLocked = true;
      eduLockReason = `大卒 ${config.requireEducation.amount}人必要`;
    }
  }
  const isLocked = isLevelLocked || eduLocked;
  
  // Use 3D color for preview
  const bgColor = isBulldoze ? config.color : config.color;

  let title = config.description;
  if (isLevelLocked) title = `レベル ${config.unlockLevel} が必要です`;
  else if (eduLocked) title = eduLockReason;

  return (
    <button
      onClick={onClick}
      disabled={isLocked || (!isBulldoze && !canAfford)}
      className={`
        relative flex flex-col items-center justify-center rounded-[16px] border transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md flex-shrink-0
        w-16 h-16 md:w-[72px] md:h-[72px]
        ${isSelected ? 'border-white/50 bg-white/20 scale-105 z-10 shadow-[0_8px_32px_rgba(255,255,255,0.15)]' : 'border-white/10 bg-black/40 hover:bg-white/10 hover:border-white/20'}
        ${isLocked ? 'opacity-30 cursor-not-allowed grayscale' : !isBulldoze && !canAfford ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={title}
    >
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl mb-1 border border-white/10 shadow-inner flex items-center justify-center overflow-hidden" style={{ backgroundColor: isBulldoze ? 'transparent' : bgColor }}>
        {isBulldoze && <div className="w-full h-full bg-red-500/80 text-white flex justify-center items-center font-bold text-lg md:text-xl">✕</div>}
        {type === BuildingType.Road && <div className="w-full h-1.5 bg-white/20 transform -rotate-45"></div>}
        {isLocked && <div className="absolute font-bold text-white/50 drop-shadow-md text-sm md:text-base">🔒</div>}
      </div>
      <span className="text-[8px] md:text-[9px] font-semibold text-white/80 uppercase tracking-widest drop-shadow-sm leading-none">{config.name}</span>
      {config.cost > 0 && !isLocked && (
        <span className={`text-[9px] font-mono leading-tight mt-0.5 ${canAfford ? 'text-emerald-300' : 'text-red-400'}`}>${config.cost}</span>
      )}
      {isLevelLocked && (
        <span className="text-[8px] md:text-[9px] font-semibold leading-tight mt-0.5 text-red-300 bg-red-500/20 px-1.5 rounded-sm">Lv {config.unlockLevel}</span>
      )}
      {eduLocked && !isLevelLocked && (
        <span className="text-[8px] md:text-[9px] font-semibold leading-tight mt-0.5 text-red-300 bg-red-500/20 px-1.5 rounded-sm">学歴</span>
      )}
    </button>
  );
};

const UIOverlay: React.FC<UIOverlayProps> = ({
  stats,
  selectedTool,
  onSelectTool,
  currentGoal,
  newsFeed,
  onClaimReward,
  isGeneratingGoal,
  aiEnabled,
  onReset
}) => {
  const newsRef = useRef<HTMLDivElement>(null);
  const [showCharts, setShowCharts] = useState(false);

  // Auto-scroll news
  useEffect(() => {
    if (newsRef.current) {
      newsRef.current.scrollTop = newsRef.current.scrollHeight;
    }
  }, [newsFeed]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 font-sans z-10">
      
      {/* Top Bar: Stats & Goal */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start pointer-events-auto gap-4 w-full max-w-full">
        
        {/* Stats */}
        <div className="flex flex-col gap-3 w-full md:w-auto text-white">
          {/* Level Bar */}
          <div className="bg-black/20 text-white px-4 py-3 rounded-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex items-center justify-between gap-5">
             <div className="flex flex-col flex-1">
               <span className="text-[10px] text-white/50 uppercase font-semibold tracking-[0.2em]">{LEVEL_NAMES[stats.level]}</span>
               <span className="text-sm font-bold text-white whitespace-nowrap">Level {stats.level}</span>
             </div>
             
             <div className="flex-1 w-full min-w-[80px] bg-white/10 h-2 pl-px pr-px rounded-full overflow-hidden flex items-center justify-start border border-white/5 shadow-inner">
               {stats.level < LEVEL_REQUIREMENTS.length - 1 ? (
                 <div 
                   className="bg-gradient-to-r from-cyan-400 to-blue-400 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-1000 ease-out" 
                   style={{ width: `${Math.min(100, Math.max(0, (stats.population - LEVEL_REQUIREMENTS[stats.level]) / (LEVEL_REQUIREMENTS[stats.level+1] - LEVEL_REQUIREMENTS[stats.level]) * 100))}%` }}
                 />
               ) : (
                 <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-1.5 rounded-full w-full" />
               )}
             </div>
             
             {stats.level < LEVEL_REQUIREMENTS.length - 1 && (
               <span className="text-[10px] text-white/60 font-mono font-medium text-right w-12">{stats.population}/{LEVEL_REQUIREMENTS[stats.level+1]}</span>
             )}
             
             <button
               onClick={() => setShowCharts(true)}
               className="ml-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-white/10 flex-shrink-0 backdrop-blur-sm"
               title="都市の統計グラフを表示"
             >
               統計
             </button>
             <button
               onClick={onReset}
               className="bg-red-500/20 hover:bg-red-500/40 text-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-red-500/30 flex-shrink-0 ml-1 backdrop-blur-sm"
               title="ゲームをリセットする"
             >
               リセット
             </button>
          </div>
          
          <div className="bg-black/20 text-white p-3 md:p-4 rounded-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex gap-4 md:gap-8 items-center justify-between w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] text-white/50 uppercase font-semibold tracking-[0.2em] mb-0.5">Funds</span>
              <span className="text-lg md:text-2xl font-bold text-emerald-400 font-mono tracking-tight drop-shadow-sm">${stats.money.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] text-white/50 uppercase font-semibold tracking-[0.2em] mb-0.5">Citizens</span>
              <span className="text-base md:text-xl font-bold text-cyan-300 font-mono tracking-tight drop-shadow-sm">{stats.population.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-end">
               <span className="text-[9px] md:text-[10px] text-white/50 uppercase font-semibold tracking-[0.2em] mb-0.5">Day</span>
               <span className="text-base md:text-xl text-white font-mono tracking-tight">{stats.day}</span>
            </div>
          </div>
        </div>

        {/* AI Goal Panel */}
        <div className={`w-full md:w-80 bg-black/20 text-white rounded-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden transition-all ${!aiEnabled ? 'opacity-50 grayscale' : ''}`}>
          <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex justify-between items-center">
            <span className="font-semibold uppercase text-[10px] md:text-xs tracking-[0.2em] flex items-center gap-2">
              {aiEnabled ? (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full ${isGeneratingGoal ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}></span>
                  AI Advisor
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Sandbox
                </>
              )}
            </span>
            {isGeneratingGoal && aiEnabled && <span className="text-[10px] animate-pulse text-yellow-300/80 font-mono tracking-widest uppercase">Thinking...</span>}
          </div>
          
          <div className="p-4 md:p-5">
            {aiEnabled ? (
              currentGoal ? (
                <>
                  <p className="text-sm md:text-base font-medium text-white mb-4 leading-relaxed font-serif italic text-white/90">"{currentGoal.description}"</p>
                  
                  <div className="flex justify-between items-center mt-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <div className="text-[10px] md:text-xs text-white/60 uppercase tracking-widest font-semibold">
                      Target: <span className="font-mono text-white tracking-tight ml-1">
                        {currentGoal.targetType === 'building_count' ? BUILDINGS[currentGoal.buildingType!].name : 
                         currentGoal.targetType === 'money' ? '$' : 'POP. '} {currentGoal.targetValue}
                      </span>
                    </div>
                    <div className="text-[10px] md:text-xs text-emerald-300 font-bold font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      +${currentGoal.reward}
                    </div>
                  </div>
  
                  {currentGoal.completed && (
                    <button
                      onClick={onClaimReward}
                      className="mt-4 w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all animate-bounce text-xs uppercase tracking-widest border border-emerald-500/30"
                    >
                      報酬を受け取る
                    </button>
                  )}
                </>
              ) : (
                <div className="text-xs md:text-sm text-white/40 py-3 flex items-center gap-3">
                  <svg className="animate-spin h-4 w-4 text-white/30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="uppercase tracking-[0.2em] text-[10px] font-semibold">Analyzing City Data...</span>
                </div>
              )
            ) : (
              <div className="text-xs md:text-sm text-white/50 py-2">
                 <p className="mb-1 leading-relaxed">フリープレイモードが有効です。<br/>AIからの目標提案はありません。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Tools & News */}
      <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-end pointer-events-auto mt-auto gap-4 w-full max-w-full">
        
        {/* Toolbar */}
        <div className="flex gap-2 md:gap-3 bg-black/20 p-2 md:p-3 rounded-[24px] border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full md:w-auto overflow-x-auto no-scrollbar justify-start md:justify-start">
          <div className="flex gap-2 md:gap-3 min-w-max px-1">
            {tools.map((type) => (
              <ToolButton
                key={type}
                type={type}
                isSelected={selectedTool === type}
                onClick={() => onSelectTool(type)}
                stats={stats}
              />
            ))}
          </div>
          <div className="text-[10px] text-white/40 uppercase writing-mode-vertical flex items-center justify-center font-bold tracking-[0.2em] border-l border-white/10 pl-2 ml-1 select-none">BUILD</div>
        </div>

        {/* News Feed */}
        <div className="w-full md:w-80 h-32 md:h-48 bg-black/30 text-white rounded-2xl border border-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
          <div className="bg-white/5 border-b border-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 flex justify-between items-center z-10">
            <span>CITY FEED</span>
            <span className={`w-1.5 h-1.5 rounded-full ${aiEnabled ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-white/20'}`}></span>
          </div>
          
          <div ref={newsRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-sans tracking-wide scroll-smooth mask-image-b z-10">
            {newsFeed.length === 0 && <div className="text-white/30 italic text-center mt-10 text-[10px]">No active news.</div>}
            {newsFeed.map((news) => (
              <div key={news.id} className={`
                pl-3 py-1.5 transition-all animate-fade-in leading-relaxed relative rounded-r-lg
                ${news.type === 'positive' ? 'border-l-2 border-emerald-400 text-emerald-100 bg-emerald-500/10' : ''}
                ${news.type === 'negative' ? 'border-l-2 border-red-400 text-red-100 bg-red-500/10' : ''}
                ${news.type === 'neutral' ? 'border-l-2 border-cyan-400 text-cyan-100 bg-cyan-500/10' : ''}
              `}>
                <span className="opacity-40 text-[9px] font-mono absolute top-1 right-2">{new Date(Number(news.id.split('.')[0])).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="pr-10 block text-[11px] font-medium opacity-90">{news.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Credits */}
      <div className="absolute bottom-1 right-2 md:right-4 text-[8px] md:text-[9px] text-white/30 font-mono text-right pointer-events-auto hover:text-white/60 transition-colors">
        <a href="https://x.com/ammaar" target="_blank" rel="noreferrer">制作: @ammaar</a>
      </div>

      {showCharts && <ChartsModal stats={stats} onClose={() => setShowCharts(false)} />}
    </div>
  );
};

export default UIOverlay;