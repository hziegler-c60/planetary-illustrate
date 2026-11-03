import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from '@/pages/Home';
import GiftDetail from '@/pages/GiftDetail';
import PencilCursor from '@/components/PencilCursor';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {/* Add your page Route elements here */}
          <Route path="/" element={<Home />} />
          <Route path="/gift/:giftId" element={<GiftDetail />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <PencilCursor />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
