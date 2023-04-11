import React, { useEffect, useState } from 'react';
import AppContext from './AppContext';

const AppContextProvider = ({ children }) => {
  const [showCart, setShowCart] = useState(false);

  const contextValue = React.useMemo(() => {
    return {
      showCart, setShowCart
    };
  }, [showCart, setShowCart]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
