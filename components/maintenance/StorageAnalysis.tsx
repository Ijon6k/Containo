'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { HardDrive } from 'lucide-react';

interface StorageAnalysisProps {
  systemInfo: any;
}

function freeColor(pct: number): string {
  if (pct <= 10) return '#f87171';
  if (pct <= 25) return '#fbbf24';
  if (pct <= 50) return '#a78bfa';
  return '#34d399';
}

export function StorageAnalysis({ systemInfo }: StorageAnalysisProps) {
  const [view, setView] = useState<'bar' | 'donut'>('bar');
  const s = systemInfo?.storage || { hostTotal: 1, hostFree: 0, hostUsed: 0, systemBytes: 0, dockerBytes: 0 };
  const systemGB = s.systemBytes / 1024 ** 3 || 0;
  const dockerGB = s.dockerBytes / 1024 ** 3 || 0;
  const freeGB = s.hostFree / 1024 ** 3 || 0;
  const hostTotalGB = s.hostTotal / 1024 ** 3 || 0;
  const usedPct = (s.hostUsed / s.hostTotal) * 100 || 0;
  const freePct = (freeGB / hostTotalGB) * 100 || 0;
  const systemPct = (s.systemBytes / s.hostTotal) * 100 || 0;
  const dockerPct = (s.dockerBytes / s.hostTotal) * 100 || 0;

  const pieData = [
    { name: 'System', value: systemGB, color: '#555555' },
    { name: 'Docker', value: dockerGB, color: '#a78bfa' },
    { name: 'Free', value: Math.max(0, hostTotalGB - systemGB - dockerGB), color: 'transparent' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-brand/10 text-brand flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-[15px] font-semibold text-text-primary">Storage analysis</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface2 rounded-sm p-0.5">
            <button
              onClick={() => setView('bar')}
              className={`px-2.5 py-1 text-[12px] rounded-md transition-colors ${view === 'bar' ? 'bg-surface border border-border text-brand' : 'text-text-secondary'}`}
            >Bar</button>
            <button
              onClick={() => setView('donut')}
              className={`px-2.5 py-1 text-[12px] rounded-md transition-colors ${view === 'donut' ? 'bg-surface border border-border text-brand' : 'text-text-secondary'}`}
            >Donut</button>
          </div>
          <span className="text-[12px] text-text-tertiary">{hostTotalGB.toFixed(1)} GB total</span>
        </div>
      </div>

      <div className="mb-5">
        {view === 'bar' ? (
          <div className="space-y-4">
            <div className="h-8 bg-hover rounded-full overflow-hidden flex border border-border/30">
              <div
                className="h-full bg-[#555555] flex items-center justify-center text-[11px] text-white/70 font-medium min-w-[40px] transition-all duration-500"
                style={{ width: `${systemPct}%` }}
              >
                {systemPct > 8 ? `${systemGB.toFixed(0)} GB` : ''}
              </div>
              <div
                className="h-full bg-brand flex items-center justify-center text-[11px] text-white/70 font-medium min-w-[40px] transition-all duration-500"
                style={{ width: `${dockerPct}%` }}
              >
                {dockerPct > 8 ? `${dockerGB.toFixed(0)} GB` : ''}
              </div>
              <div className="flex-1 h-full" />
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-text-tertiary">System {systemPct.toFixed(0)}% · Docker {dockerPct.toFixed(0)}%</span>
              <span className="text-text-primary font-medium">{freeGB.toFixed(0)} GB free</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={70}
                    dataKey="value" stroke="none" isAnimationActive={false}>
                    {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12 }}
                    formatter={(val, name) => [`${Number(val).toFixed(0)} GB`, String(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-4">
                <div className="text-[12px] text-text-tertiary">Used</div>
                <div className="text-lg font-semibold text-text-primary" style={{ color: usedPct > 85 ? '#f87171' : usedPct > 65 ? '#fbbf24' : '#a78bfa' }}>
                  {usedPct.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'System', value: systemGB, color: 'bg-[#555555]' },
          { label: 'Docker', value: dockerGB, color: 'bg-brand' },
          { label: 'Free', value: freeGB, color: freePct <= 10 ? 'bg-danger' : freePct <= 25 ? 'bg-warning' : 'bg-success', textColor: freeColor(freePct) },
        ].map((item: any) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-sm ${item.color} shrink-0`} />
            <div>
              <div className="text-[12px] text-text-tertiary">{item.label}</div>
              <div className="text-[13px] font-semibold tabular-nums" style={item.textColor ? { color: item.textColor } : { color: 'var(--text-primary)' }}>{item.value.toFixed(1)} GB</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
