import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  AUTH_REDIRECT_REASONS,
  buildLoginPath,
  clearAuthSession,
  getAuthSession,
  getSessionValidation,
  isProtectedPath,
} from "./auth/session";
import { validateSession } from "./api/authApi";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import SurveyCreatePage from "./pages/admin/SurveyCreatePage";
import SurveyDetailPage from "./pages/admin/SurveyDetailPage";
import SurveyListPage from "./pages/admin/SurveyListPage";
import SurveyResultsPage from "./pages/admin/SurveyResultsPage";
import LoginPage from "./pages/auth/LoginPage";
import SurveyFillRoutePage from "./pages/public/SurveyFillRoutePage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const finish = () => {
      if (!isCancelled) {
        setAuthCheckComplete(true);
      }
    };

    const redirectWithReason = (reason) => {
      if (isProtectedPath(location.pathname)) {
        navigate(buildLoginPath(reason), { replace: true });
      }
    };

    const bootstrapAuth = async () => {
      setAuthCheckComplete(false);

      const { token } = getAuthSession();
      if (!token) {
        finish();
        return;
      }

      const validation = getSessionValidation();
      if (!validation.isValid) {
        clearAuthSession();
        redirectWithReason(validation.reason || AUTH_REDIRECT_REASONS.invalid);
        finish();
        return;
      }

      try {
        await validateSession();
      } catch (error) {
        const status = error?.response?.status;

        clearAuthSession();
        redirectWithReason(
          status === 403
            ? AUTH_REDIRECT_REASONS.forbidden
            : AUTH_REDIRECT_REASONS.expired
        );
      } finally {
        finish();
      }
    };

    bootstrapAuth();

    return () => {
      isCancelled = true;
    };
  }, [location.pathname, navigate]);

  if (
    !authCheckComplete &&
    getAuthSession().token &&
    isProtectedPath(location.pathname)
  ) {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/survey/:publicKey" element={<SurveyFillRoutePage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/admin/surveys" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/surveys" replace />} />
        <Route path="/admin/surveys" element={<SurveyListPage />} />
        <Route path="/admin/surveys/create" element={<SurveyCreatePage />} />
        <Route path="/admin/surveys/:surveyId" element={<SurveyDetailPage />} />
        <Route
          path="/admin/surveys/:surveyId/results"
          element={<SurveyResultsPage />}
        />
        <Route
          path="/admin/surveys/:surveyId/dashboard"
          element={<DashboardPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
