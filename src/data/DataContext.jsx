import { createContext, useContext } from 'react';

// Holds the currently-loaded, processed dataset (the object returned by
// processCsv). Every visualization component reads from here.
const DataContext = createContext(null);

export function DataProvider({ value, children }) {
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
