import { Search } from 'lucide-react';

interface AdminBlueprintControlPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
}

export function AdminBlueprintControlPanel({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: AdminBlueprintControlPanelProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search blueprints by name or category..."
          aria-label="Search blueprints"
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onStatusFilterChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => onStatusFilterChange('inactive')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'inactive'
              ? 'bg-gray-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Inactive
        </button>
      </div>
    </div>
  );
}
