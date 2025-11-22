import React from 'react';

const Card = ({ title, children, className = '', icon: Icon, actions }) => {
  return (
    <div className={`card ${className}`}>
      {(title || Icon || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
                <Icon className="text-white" size={22} />
              </div>
            )}
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
