import React, { useEffect, useState } from 'react';
import { Users, Filter, Calendar } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import Dropdown, { DropdownOption } from '../common/Dropdown';
import { dropdownsApi } from '../../api/dropdowns';

interface DocumentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupBy: string;
  onGroupByChange: (value: string) => void;
  filterBy: string;
  onFilterByChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  createdFilter: string;
  onCreatedFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  groupBy,
  onGroupByChange,
  filterBy,
  onFilterByChange,
  sortBy,
  onSortByChange,
  createdFilter,
  onCreatedFilterChange,
  onClearFilters,
  activeFiltersCount
}) => {
  const [groupByOptions, setGroupByOptions] = useState<DropdownOption[]>([]);
  const [filterOptions, setFilterOptions] = useState<DropdownOption[]>([]);
  const [sortOptions, setSortOptions] = useState<DropdownOption[]>([]);
  const [dateOptions, setDateOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [groupBy, filter, sort, date] = await Promise.all([
          dropdownsApi.getGroupByOptions(),
          dropdownsApi.getDocumentStatuses(),
          dropdownsApi.getSortOptions(),
          dropdownsApi.getDateFilterOptions()
        ]);

        setGroupByOptions(groupBy);
        setFilterOptions([{ value: 'All Documents', label: 'All Documents' }, ...filter]);
        setSortOptions(sort);
        setDateOptions(date);
      } catch (error) {
        console.error('Failed to load dropdown options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownData();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search documents..."
        className="min-w-[300px]"
      />

      <div className="flex items-center space-x-4 ml-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">Group By:</span>
          <Dropdown
            options={groupByOptions}
            value={groupBy}
            onChange={onGroupByChange}
            loading={loading}
            className="min-w-[100px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">Filter:</span>
          <Dropdown
            options={filterOptions}
            value={filterBy}
            onChange={onFilterByChange}
            loading={loading}
            className="min-w-[120px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Sort:</span>
          <Dropdown
            options={sortOptions}
            value={sortBy}
            onChange={onSortByChange}
            loading={loading}
            className="min-w-[100px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium">Created:</span>
          <Dropdown
            options={dateOptions}
            value={createdFilter}
            onChange={onCreatedFilterChange}
            loading={loading}
            className="min-w-[100px]"
          />
        </div>

        <button
          onClick={onClearFilters}
          className={`px-3 py-2 border rounded-lg transition-colors text-sm relative ${
            activeFiltersCount > 0 
              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
              : 'text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Clear
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentFilters;