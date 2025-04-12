import React from 'react';
import '../assets/css/tailwind.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import ProjectsIndex from './pages/ProjectsIndex';
import ProjectSingle from './pages/ProjectSingle';
import ProjectCommits from './pages/ProjectCommits';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ProjectsIndex />} />
          <Route path="/project/:slug" element={<ProjectSingle />} />
          <Route path="/project/:slug/commits" element={<ProjectCommits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
