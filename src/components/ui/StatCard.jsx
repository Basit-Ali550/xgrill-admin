"use client";

export function StatCard({ title, value, icon, color, bgColor }) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>
            {value}
          </p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: bgColor }}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
