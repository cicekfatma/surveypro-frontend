import { useNavigate, useParams } from "react-router-dom";
import { hasValidAuthSession } from "../../auth/session";
import SurveyFillPage from "./SurveyFillPage";

function SurveyFillRoutePage() {
  const navigate = useNavigate();
  const { publicKey } = useParams();
  const onBack = hasValidAuthSession()
    ? () => navigate("/admin/surveys")
    : undefined;

  return <SurveyFillPage publicKey={publicKey} onBack={onBack} />;
}

export default SurveyFillRoutePage;
