import React from 'react';

const Card = ({ title, children, className = '', icon: Icon, actions }) => {
  return (
    <div className={`card ${className}`}>
      {(title || Icon || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary-100 rounded-lg">
                <Icon className="text-primary-600" size={24} />
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
