import { ChevronDown, Briefcase, DollarSign, FolderOpen, Sparkles } from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import SalaryRangeSlider from "./../../../components/Input/SalaryRangeSlider";
import { motion, AnimatePresence } from "framer-motion";

// Reusable Filter Section with cleaner design
const FilterSection = ({ title, icon: Icon, children, isExpanded, onToggle, activeCount, colorClass = "text-blue-600" }) => {
  return (
    <div className="mb-3 border-b border-gray-100 last:border-0 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors group"
      >
        <div className="flex items-center gap-2.5">

          <span className="font-semibold text-gray-700 text-sm group-hover:text-gray-900">
            {title}
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Clean Checkbox-style or Simple Pill for filters
const FilterPill = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${isActive
        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-md shadow-fuchsia-200"
        : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-700 hover:shadow-sm"
        }`}
    >
      {label}
    </button>
  );
};

const FilterContent = ({
  toggleSection,
  clearAllFilters,
  expandedSections,
  filters,
  handleFilterChange,
}) => {
  // Count active filters
  const activeJobTypes = filters?.type ? 1 : 0;
  const activeSalary = (filters?.minSalary || filters?.maxSalary) ? 1 : 0;
  const activeCategories = filters?.category ? 1 : 0;
  const totalActiveFilters = activeJobTypes + activeSalary + activeCategories;

  return (
    <div className="space-y-1">
      {/* Clear All Button - Only show when filters are active */}
      {totalActiveFilters > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 pb-2 px-1"
        >

          <button
            onClick={clearAllFilters}
            className="text-red-500 hover:text-red-600 font-medium text-xs hover:bg-red-50 px-2 py-1 rounded-md transition-all"
          >
            Clear All
          </button>
        </motion.div>
      )}

      {/* Job Type Section */}
      <FilterSection
        title="Job Type"
        icon={Briefcase}
        isExpanded={expandedSections?.jobType}
        onToggle={() => toggleSection("jobType")}
        activeCount={activeJobTypes}
        colorClass="text-purple-600 bg-purple-50"
      >
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => (
            <FilterPill
              key={type.value}
              label={type.value}
              isActive={filters?.type === type.value}
              onClick={() => handleFilterChange("type", filters?.type === type.value ? "" : type.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Salary Range Section */}
      <FilterSection
        title="Salary Range"
        icon={DollarSign}
        isExpanded={expandedSections?.salaryRange}
        onToggle={() => toggleSection("salaryRange")}
        activeCount={activeSalary}
        colorClass="text-emerald-600 bg-emerald-50"
      >
        <div className="px-1 py-1">
          <SalaryRangeSlider
            filters={filters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </FilterSection>

      {/* Category Section */}
      <FilterSection
        title="Category"
        icon={FolderOpen}
        isExpanded={expandedSections?.categories}
        onToggle={() => toggleSection("categories")}
        activeCount={activeCategories}
        colorClass="text-blue-600 bg-blue-50"
      >
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((type) => (
            <FilterPill
              key={type.value}
              label={type.value}
              isActive={filters?.category === type.value}
              onClick={() => handleFilterChange("category", filters?.category === type.value ? "" : type.value)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default FilterContent;
