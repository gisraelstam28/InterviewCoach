import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InterviewPrepV2Page from './components/interview-prep-wizard/InterviewPrepV2Page';
import './index.css';

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <InterviewPrepV2Page />
    </QueryClientProvider>
  </React.StrictMode>,
);
