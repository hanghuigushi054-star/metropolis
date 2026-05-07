/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (aiEnabled: boolean) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white font-sans p-6 bg-slate-900/40 backdrop-blur-md transition-all duration-1000">
      <div className="max-w-md w-full bg-white/5 p-8 rounded-[32px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden animate-fade-in">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-3 bg-gradient-to-br from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              SkyMetropolis
            </h1>
            <p className="text-slate-300 mb-10 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em]">
              アイソメトリック都市建設シミュレーター
            </p>

            <div className="w-full bg-black/20 p-5 rounded-2xl border border-white/5 mb-8 hover:border-white/10 transition-colors shadow-inner flex flex-col items-start text-left">
            <label className="flex items-center justify-between cursor-pointer w-full group">
                <div className="flex flex-col gap-1 pr-4">
                <span className="font-semibold text-base text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                    AI都市アドバイザー
                    {aiEnabled && <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>}
                </span>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                    Gemini APIによるダイナミックなクエストやニュースイベントをオンにします。
                </span>
                </div>
                
                <div className="relative flex-shrink-0">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                />
                <div className="w-12 h-6 bg-slate-800/80 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500/80 peer-checked:after:bg-white shadow-inner border border-white/5"></div>
                </div>
            </label>
            </div>

            <button 
              onClick={() => onStart(aiEnabled)}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-[20px] border border-white/20 shadow-[0_4px_24px_rgba(255,255,255,0.1)] backdrop-blur-md transform transition-all hover:scale-[1.02] active:scale-[0.98] text-lg tracking-wider"
            >
              建設を始める
            </button>

            <div className="mt-8 text-center opacity-60 hover:opacity-100 transition-opacity">
                <a 
                    href="https://x.com/ammaar" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 text-[10px] text-slate-300 transition-colors font-mono uppercase tracking-[0.2em]"
                >
                    <span>制作:</span>
                    <span className="font-semibold underline-offset-4 hover:underline">@ammaar</span>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;