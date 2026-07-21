import { useCallback, useState } from 'react';
import { processCsv, SAMPLE_CSV } from './data/process.js';
import { DataProvider } from './data/DataContext.jsx';
import UploadScreen from './components/UploadScreen.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [state, setState] = useState({ data: null, fileName: '', isSample: false, version: 0 });

  // Processes CSV text and swaps in the new dataset. Throws on bad input so
  // callers can surface the message; bumping `version` remounts the dashboard
  // (and its GSAP effects) cleanly for the new data.
  const load = useCallback((text, name, isSample = false) => {
    const data = processCsv(text); // may throw — caller catches
    setState((s) => ({ data, fileName: name, isSample, version: s.version + 1 }));
    window.scrollTo(0, 0);
  }, []);

  const useSample = useCallback(() => {
    load(SAMPLE_CSV, 'sample.csv', true);
  }, [load]);

  if (!state.data) {
    return <UploadScreen onLoadText={(t, n) => load(t, n, false)} onUseSample={useSample} />;
  }

  return (
    <DataProvider value={state.data}>
      <Dashboard
        key={state.version}
        fileName={state.fileName}
        isSample={state.isSample}
        onLoadFile={(t, n) => load(t, n, false)}
      />
    </DataProvider>
  );
}
