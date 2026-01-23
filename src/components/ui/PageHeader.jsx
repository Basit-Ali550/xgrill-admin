"use client";
import { Badge } from "./badge";

export function PageHeader({ title, icon, badge, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {badge && (
          <Badge variant="secondary" className="ml-2 text-sm font-normal">
            {badge}
          </Badge>
        )}
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
