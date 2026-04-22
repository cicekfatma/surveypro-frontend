import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TabBar from "../../components/common/TabBar";
import SurveyCard from "../../components/survey/SurveyCard";
import { getSurveys } from "../../services/surveyService";
import { styles } from "../../styles/surveyListStyles";

function SurveyListPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError("");
      const surveyList = await getSurveys();
      setSurveys(surveyList);
    } catch (err) {
      setError(err.message || "Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={{ ...styles.statusBox, color: "#b42318" }}>Hata: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.panel}>
        <Header onCreateSurvey={() => navigate("/admin/surveys/create")} />
        <TabBar />

        <div style={styles.contentArea}>
          <div style={styles.listWrapper}>
            {surveys.length === 0 ? (
              <div style={styles.emptyCard}>Anket bulunamadi.</div>
            ) : (
              surveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onDetail={() => navigate(`/admin/surveys/${survey.id}`)}
                  onResults={() => navigate(`/admin/surveys/${survey.id}/results`)}
                  onDashboard={() =>
                    navigate(`/admin/surveys/${survey.id}/dashboard`)
                  }
                  onPublic={() => navigate(`/survey/${survey.publicKey}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyListPage;
