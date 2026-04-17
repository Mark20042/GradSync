import { MapPin, Search } from "lucide-react";

const SearchHeader = ({
  filters,
  handleFilterChange,
  onSearch,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative z-30">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Keyword Input */}
          <div className="flex-[2] relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-blue-200 z-10 group-focus-within:text-white transition-colors duration-300">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full pl-14 pr-4 py-4 border border-white/20 rounded-xl outline-none text-base font-medium bg-white/10 backdrop-blur-sm text-white placeholder-blue-200/70 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>

          {/* Location Input */}
          <div className="flex-[1.5] relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-blue-200 z-10 group-focus-within:text-white transition-colors duration-300">
              <MapPin className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="City, state, or zip code"
              className="w-full pl-14 pr-4 py-4 border border-white/20 rounded-xl outline-none text-base font-medium bg-white/10 backdrop-blur-sm text-white placeholder-blue-200/70 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="md:w-auto w-full px-8 py-4 bg-white text-indigo-700 rounded-xl hover:bg-blue-50 transition-all duration-300 font-bold text-base shadow-lg shadow-indigo-900/20 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
          >
            Search Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
