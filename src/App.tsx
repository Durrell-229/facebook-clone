import React from 'react';
import './App.css';
import SyntaxAIWidget from './components/organisms/ai/SyntaxAIWidget';
import MainLayout from './components/layouts/MainLayout';
import Routers from './routes/Router';

const App: React.FC = () => {
  return (
    <MainLayout>
      <Routers />
      <SyntaxAIWidget />
    </MainLayout>
  );
};

export default App;
