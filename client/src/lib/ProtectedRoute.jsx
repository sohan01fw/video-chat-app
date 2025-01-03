import { Outlet, useNavigate } from "react-router-dom";
import cookie from "js-cookie";
import { useEffect } from "react";

export function ProtectedRoute() {
  const navigate = useNavigate();

  const check = () => {
    const cookies = cookie.get("email");
    if (!cookies) {
      navigate("/");
    }
  };
  useEffect(() => {
    check();
  }, []);

  return <Outlet />;
}
