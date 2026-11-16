import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HostDashboard from './views/HostDashboard';
import BroadcastView from './views/BroadcastView';
import { initRealtimeSync } from './store/useBingoStore';

export default function App() {
  useEffect(() => {
    const cleanup = initRealtimeSync();
    return cleanup;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/broadcast" replace />} />
        <Route path="/broadcast" element={<BroadcastView />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="*" element={<Navigate to="/broadcast" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
