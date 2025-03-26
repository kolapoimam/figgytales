// App.tsx (assumed)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Results from '@/pages/Results';
import ShareView from '@/pages/ShareView';
import { FileProvider } from '@/context/FileContext';

const App: React.FC = () => {
  return (
    <Router>
      <FileProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/share/:id" element={<ShareView />} />
        </Routes>
      </FileProvider>
    </Router>
  );
};

export default App;
