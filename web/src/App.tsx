import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HistoryDetailPage } from "./pages/HistoryDetailPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { ReadingPage } from "./pages/ReadingPage";
import { ResultPage } from "./pages/ResultPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<ReadingPage />} path="/reading" />
        <Route element={<ResultPage />} path="/result" />
        <Route element={<HistoryPage />} path="/history" />
        <Route element={<HistoryDetailPage />} path="/history/:id" />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
