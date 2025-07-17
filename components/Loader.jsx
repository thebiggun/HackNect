import React from 'react';

const Loader = ({ size = 20, color = '#fff', className = '' }) => (
  <span
    className={`inline-block animate-spin border-2 border-t-transparent rounded-full ${className}`}
    style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
    aria-label="Loading"
  />
);

export default Loader; 