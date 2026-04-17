import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";

const SalaryRangeSlider = ({ filters, handleFilterChange }) => {
  const [minSalary, setMinSalary] = useState(filters?.minSalary || "");
  const [maxSalary, setMaxSalary] = useState(filters?.maxSalary || "");

  useEffect(() => {
    setMinSalary(filters?.minSalary || "");
    setMaxSalary(filters?.maxSalary || "");
  }, [filters]);

  // Peso formatter
  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Min Salary Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Min Salary
          </label>
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-50 border-r border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm">
              ₱
            </div>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="1000"
              className="w-full pl-12 pr-3 py-2.5 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-300 text-sm font-medium text-gray-700 placeholder-gray-400 outline-none"
              value={minSalary}
              onChange={({ target }) => setMinSalary(target.value)}
              onBlur={() =>
                handleFilterChange(
                  "minSalary",
                  minSalary ? parseInt(minSalary) : ""
                )
              }
            />
          </div>
        </div>

        {/* Max Salary Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Max Salary
          </label>
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-50 border-r border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm">
              ₱
            </div>
            <input
              type="number"
              placeholder="∞"
              min="0"
              step="1000"
              className="w-full pl-12 pr-3 py-2.5 border-2 border-gray-200 rounded-xl bg-white shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-300 text-sm font-medium text-gray-700 placeholder-gray-400 outline-none"
              value={maxSalary}
              onChange={({ target }) => setMaxSalary(target.value)}
              onBlur={() =>
                handleFilterChange(
                  "maxSalary",
                  maxSalary ? parseInt(maxSalary) : ""
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Range Display Chip */}
      {(minSalary || maxSalary) && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-xl border border-blue-100/50">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            {minSalary ? formatPeso(minSalary) : formatPeso(0)}
          </span>
          <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full mx-2" />
          <span className="text-sm font-semibold text-gray-700">
            {maxSalary ? formatPeso(maxSalary) : "No limit"}
          </span>
        </div>
      )}
    </div>
  );
};

export default SalaryRangeSlider;
