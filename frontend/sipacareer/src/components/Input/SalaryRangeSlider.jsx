import { useState, useEffect } from "react";

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
      <div className="grid grid-cols-2 gap-4 ">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Salary
          </label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Salary
          </label>
          <input
            type="number"
            placeholder="No limit"
            min="0"
            step="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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

      {(minSalary || maxSalary) && (
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
          Range: {minSalary ? formatPeso(minSalary) : formatPeso(0)} -{" "}
          {maxSalary ? formatPeso(maxSalary) : "No limit"}
        </div>
      )}
    </div>
  );
};

export default SalaryRangeSlider;
