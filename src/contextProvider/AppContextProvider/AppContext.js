import React from 'react';

const AppContext = React.createContext({
  showCart: false,
  setShowCart: () => {},
});

export default AppContext;