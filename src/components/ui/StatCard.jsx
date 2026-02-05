"use client";

export function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2 text-white">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bgColor }}
        >
          {typeof Icon === "string" ? (
            <span className="text-2xl">{Icon}</span>
          ) : (
            <Icon className="w-6 h-6" style={{ color }} />
          )}
        </div>
      </div>
    </div>
  );
}
