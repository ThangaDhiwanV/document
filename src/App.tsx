import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentList from './components/documents/DocumentList';
import FormBuilder from './components/FormBuilder/FormBuilder';
import SigningQueue from './components/Signing/SigningQueue';
import Templates from './components/Templates/Templates';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<DocumentList />} />
          <Route path="builder" element={<FormBuilder />} />
          <Route path="builder/:templateId" element={<FormBuilder />} />
          <Route path="builder/new" element={<FormBuilder />} />
          <Route path="signing" element={<SigningQueue />} />
          <Route path="templates" element={<Templates />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;