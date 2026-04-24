import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  AUTH_REDIRECT_REASONS,
  clearAuthSession,
  getSessionValidation,
} from "../../auth/session";

function ProtectedRoute() {
  const location = useLocation();
  const validation = getSessionValidation();

  if (!validation.isValid) {
    clearAuthSession();

    return (
      <Navigate
        to={`/login?reason=${validation.reason || AUTH_REDIRECT_REASONS.invalid}`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
