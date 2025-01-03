import "./App.css";
import { Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { WaitingRoom } from "./pages/waitingroom";
import { ProtectedRoute } from "./lib/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/:id" element={<WaitingRoom />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
