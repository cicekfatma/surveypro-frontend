import { useNavigate, useParams } from "react-router-dom";
import SurveyFillPage from "./SurveyFillPage";

function SurveyFillRoutePage() {
  const navigate = useNavigate();
  const { publicKey } = useParams();
  const onBack = localStorage.getItem("token")
    ? () => navigate("/admin/surveys")
    : undefined;

  return <SurveyFillPage publicKey={publicKey} onBack={onBack} />;
}

export default SurveyFillRoutePage;
