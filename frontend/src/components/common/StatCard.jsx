import React from 'react';
import '../../styles/responsive.css';

const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
    </div>
  );
};

export default StatCard;
