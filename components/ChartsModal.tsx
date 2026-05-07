import React from 'react';
import { CityStats } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ChartsModalProps {
  stats: CityStats;
  onClose: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const EDU_COLORS = ['#94a3b8', '#facc15', '#fb923c', '#3b82f6'];

export const ChartsModal: React.FC<ChartsModalProps> = ({ stats, onClose }) => {
  const demographicData = [
    { name: '子供', value: stats.demographics.children },
    { name: '若者', value: stats.demographics.youngAdults },
    { name: '大人', value: stats.demographics.adults },
    { name: '高齢者', value: stats.demographics.seniors },
  ];

  const educationData = [
    { name: '未就学', value: stats.education.uneducated },
    { name: '初等教育', value: stats.education.primary },
    { name: '中等教育', value: stats.education.secondary },
    { name: '高等教育', value: stats.education.higher },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md pointer-events-auto transition-all duration-300">
      <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[32px] w-full max-w-4xl text-white shadow-[0_12px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden animate-fade-in">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md z-10"
        >
          ✕
        </button>
        <h2 className="text-3xl font-extrabold mb-8 tracking-tight bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent relative z-10">City Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Demographics Card */}
          <div className="bg-black/20 p-5 rounded-3xl border border-white/5 shadow-inner">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-center text-cyan-300/80">Demographics</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-[-18px]">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Total</span>
                <span className="text-xl font-bold">{stats.population}</span>
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div className="bg-black/20 p-5 rounded-3xl border border-white/5 shadow-inner">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] mb-4 text-center text-emerald-300/80">Education</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={educationData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} className="font-sans" />
                  <YAxis tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 11}} axisLine={false} tickLine={false} className="font-mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {
                      educationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EDU_COLORS[index % EDU_COLORS.length]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-white/40 mt-3 text-center leading-relaxed">
              高度なオフィスには大卒(高等教育)の住人が必要です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
