import "./App.css";
import { Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { WaitingRoom } from "./pages/waitingroom";
import { ProtectedRoute } from "./lib/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<IndexPage />} />
          <Route path="/video-chat" element={<WaitingRoom />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
