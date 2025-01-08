import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { cooki } from "./process";

export function ProtectedRoute() {
  const navigate = useNavigate();

  const check = () => {
    if (!cooki) {
      navigate("/");
    }
  };
  useEffect(() => {
    check();
  }, []);

  return <Outlet />;
}
