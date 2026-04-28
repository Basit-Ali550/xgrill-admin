import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";

export function ItemCard({
  title,
  subtitle,
  image,
  isActive,
  onToggleStatus,
  onEdit,
  onDelete,
  onView,
  priceDisplay,
  description,
  bottomContent,
  topBadges,
  className,
}) {
  return (
    <div
      className={`bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all flex flex-col group ${className || ""}`}
    >
      {/* Image Header */}
      <div className="relative h-40 bg-gray-900 overflow-hidden">
        {image ? (
          <img
            src={image}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt={title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800 opacity-50">
            🍔
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          {topBadges}
          <Badge
            className={`${isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="font-bold text-white text-lg leading-tight truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-orange-400 uppercase font-semibold tracking-wider">
              {subtitle}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {description || "No description"}
        </p>

        {bottomContent && <div className="mb-3">{bottomContent}</div>}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700 mt-auto">
          <div className="flex flex-col justify-center">{priceDisplay}</div>

          <div className="flex gap-2 items-center">
            {onToggleStatus && (
              <div className="flex items-center mr-1">
                <Switch
                  checked={isActive}
                  onCheckedChange={onToggleStatus}
                  className="h-5 w-9 data-[state=checked]:bg-green-500 cursor-pointer"
                />
              </div>
            )}

            {onView && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onView}
                className="h-9 w-9 p-0 rounded-full bg-gray-700/50 text-gray-300 hover:bg-white hover:text-black transition-all"
              >
                <Eye size={16} />
              </Button>
            )}

            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-9 w-9 p-0 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
              >
                <Edit size={16} />
              </Button>
            )}

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-9 w-9 p-0 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
