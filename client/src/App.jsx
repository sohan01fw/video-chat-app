import "./App.css";
import { Route, Routes } from "react-router-dom";
import { IndexPage } from "./pages";
import { Room } from "./pages/room";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/:id" element={<Room />} />
      </Routes>
    </>
  );
}

export default App;
