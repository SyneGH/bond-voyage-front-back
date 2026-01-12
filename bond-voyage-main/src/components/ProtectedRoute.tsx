import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const publicRoutes = ["/home"];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    if (!token && !isPublicRoute) {
      navigate("/home", { replace: true });
      return;
    }

    if (token && !isPublicRoute) {
      try {
        const { role } = jwtDecode(token) as { role: "ADMIN" | "USER" };
        const isUserRoute = location.pathname.startsWith("/user/");

        if (role === "USER" && !isUserRoute) {
          navigate("/user/home", { replace: true });
          return;
        }

        if (role === "ADMIN" && isUserRoute) {
          navigate("/", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("accessToken");
        navigate("/home", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};
