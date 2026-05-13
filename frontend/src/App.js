import React, { useState } from 'react';
import './App.css';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { PermutationVisualizer } from './visualizers/PermutationVisualizer';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="content">
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'permutation' && <PermutationVisualizer />}
      </div>
    </div>
  );
}

export default App;
