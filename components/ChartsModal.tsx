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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-4xl text-white shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-100 border-b border-slate-700 pb-2">都市の統計データ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Demographics Card */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner">
            <h3 className="text-lg font-bold mb-4 text-center text-slate-300">年齢層の分布</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-4">
              <span>総人口: {stats.population}人</span>
            </div>
          </div>

          {/* Education Card */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner">
            <h3 className="text-lg font-bold mb-4 text-center text-slate-300">学歴の分布</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={educationData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={{stroke: '#334155'}} />
                  <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    cursor={{fill: '#334155'}}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {
                      educationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EDU_COLORS[index % EDU_COLORS.length]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              高度なオフィスには大卒(高等教育)の住人が必要です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
