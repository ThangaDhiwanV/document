import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChartData {
  month: string;
  documents: number;
  signatures: number;
}

const DocumentMetrics: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await dashboardApi.getDocumentMetrics();
      setChartData(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

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