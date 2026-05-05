import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { hasValidAuthSession } from "../../auth/session";
import SurveyFillPage from "./SurveyFillPage";

function SurveyFillRoutePage() {
  const navigate = useNavigate();
  const { publicKey } = useParams();
  const [searchParams] = useSearchParams();
  const respondentToken = searchParams.get("respondentToken") || "";
  const onBack = hasValidAuthSession()
    ? () => navigate("/admin/surveys")
    : undefined;

  return (
    <SurveyFillPage
      publicKey={publicKey}
      respondentTokenFromUrl={respondentToken}
      onBack={onBack}
    />
  );
}

export default SurveyFillRoutePage;
