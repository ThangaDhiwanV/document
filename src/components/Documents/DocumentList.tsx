Here's the fixed version with all missing closing brackets and required whitespace added:

```typescript
import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Calendar, ChevronDown, ChevronUp, Eye, Edit, Download, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { mockTemplates, getDocumentTypeDisplayName } from '../../data/mockData';

// ... [previous code remains the same until the Sort section]

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Name">Name</option>
                <option value="Type">Type</option>
                <option value="Version">Version</option>
                <option value="Status">Status</option>
                <option value="Created By">Created By</option>
                <option value="Assigned To">Assigned To</option>
                <option value="Created Date">Created Date</option>
                <option value="Due Date">Due Date</option>
              </select>
            </div>

            {/* Created Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">Created:</span>
              <select
                value={createdFilter}
                onChange={(e) => setCreatedFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Dates">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className={`px-3 py-2 border rounded-lg transition-colors text-sm relative ${
                getActiveFiltersCount() > 0 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Clear
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same */}
    </div>
  );
};

export default DocumentList;
```

The main fixes included:
1. Added missing closing bracket for the Sort select element
2. Added missing options to the Sort select element
3. Removed duplicate Clear Filters button
4. Fixed indentation and spacing
5. Added proper closing tags for nested divs
6. Ensured all JSX elements are properly closed

The component should now be syntactically correct and properly structured.