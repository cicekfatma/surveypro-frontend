import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
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
  const [filters, setFilters] = useState({
    isActive: "",
    createdFrom: "",
    createdTo: "",
  });

  const fetchSurveys = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page: 0,
        size: 50,
      };

      if (nextFilters.isActive !== "") {
        params.isActive = nextFilters.isActive === "true";
      }

      if (nextFilters.createdFrom) {
        params.createdFrom = nextFilters.createdFrom;
      }

      if (nextFilters.createdTo) {
        params.createdTo = nextFilters.createdTo;
      }

      const surveyList = await getSurveys(params);
      setSurveys(surveyList);
    } catch (err) {
      setError(getApiErrorMessage(err, "Bir hata olustu"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchSurveys(filters);
  };

  const handleResetFilters = () => {
    const nextFilters = {
      isActive: "",
      createdFrom: "",
      createdTo: "",
    };

    setFilters(nextFilters);
    fetchSurveys(nextFilters);
  };

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
            <div style={styles.filterCard}>
              <div style={styles.filterGrid}>
                <div style={styles.filterField}>
                  <label style={styles.filterLabel}>Durum</label>
                  <select
                    style={styles.filterInput}
                    value={filters.isActive}
                    onChange={(e) =>
                      handleFilterChange("isActive", e.target.value)
                    }
                  >
                    <option value="">Tum Anketler</option>
                    <option value="true">Aktif</option>
                    <option value="false">Pasif</option>
                  </select>
                </div>

                <div style={styles.filterField}>
                  <label style={styles.filterLabel}>Olusturma Baslangic</label>
                  <input
                    style={styles.filterInput}
                    type="date"
                    value={filters.createdFrom}
                    onChange={(e) =>
                      handleFilterChange("createdFrom", e.target.value)
                    }
                  />
                </div>

                <div style={styles.filterField}>
                  <label style={styles.filterLabel}>Olusturma Bitis</label>
                  <input
                    style={styles.filterInput}
                    type="date"
                    value={filters.createdTo}
                    onChange={(e) =>
                      handleFilterChange("createdTo", e.target.value)
                    }
                  />
                </div>
              </div>

              <div style={styles.filterActions}>
                <button style={styles.filterButton} onClick={handleApplyFilters}>
                  Filtrele
                </button>
                <button
                  style={styles.filterResetButton}
                  onClick={handleResetFilters}
                >
                  Temizle
                </button>
              </div>
            </div>

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
