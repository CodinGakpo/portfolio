'use client';

import React from 'react';
import { TimelineEntry } from '../../data/data';

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="relative border-l-2 border-slate-700 ml-4 md:ml-6 py-4">
      {entries.map((entry, index) => (
        <div key={index} className="mb-10 ml-8 md:ml-12 relative group">
          {/* Node */}
          <span className="absolute -left-[41px] md:-left-[57px] flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-500 ring-4 ring-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group-hover:scale-110">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </span>

          <div className="flex flex-col gap-3">
            <div>
              <span className="text-sm font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                {entry.date}
              </span>
              <h4 className="text-xl font-bold mt-3 text-slate-100">{entry.title}</h4>
              <p className="text-slate-400 mt-2 leading-relaxed text-sm">
                {entry.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-red-400 font-semibold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Problem Faced
                </div>
                <p className="text-slate-300 text-sm">{entry.problemFaced}</p>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Solution
                </div>
                <p className="text-slate-300 text-sm">{entry.solution}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
