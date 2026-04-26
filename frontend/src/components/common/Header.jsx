import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="header">
      <h1>{title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ')}</h1>
      <div className="date">{new Date().toLocaleDateString()}</div>
    </header>
  );
};

export default Header;
