import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
    success: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
    danger: 'bg-gradient-to-br from-red-400 to-red-600 text-white',
    warning: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
    info: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
  };

  const cardBgClasses = {
    primary: 'bg-gradient-to-br from-orange-50 to-orange-100',
    success: 'bg-gradient-to-br from-green-50 to-green-100',
    danger: 'bg-gradient-to-br from-red-50 to-red-100',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    info: 'bg-gradient-to-br from-blue-50 to-blue-100'
  };

  return (
    <div className={`card ${cardBgClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
