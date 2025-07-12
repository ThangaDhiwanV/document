import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const DocumentMetrics: React.FC = () => {
  const chartData = [
    { month: 'Jan', documents: 45, signatures: 38 },
    { month: 'Feb', documents: 52, signatures: 47 },
    { month: 'Mar', documents: 48, signatures: 42 },
    { month: 'Apr', documents: 61, signatures: 55 },
    { month: 'May', documents: 55, signatures: 49 },
    { month: 'Jun', documents: 67, signatures: 62 }
  ];

  const maxValue = Math.max(...chartData.flatMap(d => [d.documents, d.signatures]));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Document Activity</h3>
          <p className="text-sm text-gray-600">Documents created vs signatures completed</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+12% this month</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {chartData.map((data, index) => (
          <div key={data.month} className="flex items-center space-x-4">
            <div className="w-8 text-xs font-medium text-gray-600">
              {data.month}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(data.documents / maxValue) * 100}%` }}
                />
                <span className="text-xs text-gray-600">{data.documents} created</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(data.signatures / maxValue) * 100}%` }}
                />
                <span className="text-xs text-gray-600">{data.signatures} signed</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Documents Created</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Signatures Completed</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetrics;