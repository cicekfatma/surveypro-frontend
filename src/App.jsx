import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import SurveyCreatePage from "./pages/admin/SurveyCreatePage";
import SurveyDetailPage from "./pages/admin/SurveyDetailPage";
import SurveyListPage from "./pages/admin/SurveyListPage";
import SurveyResultsPage from "./pages/admin/SurveyResultsPage";
import LoginPage from "./pages/auth/LoginPage";
import SurveyFillRoutePage from "./pages/public/SurveyFillRoutePage";

function App() {
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
