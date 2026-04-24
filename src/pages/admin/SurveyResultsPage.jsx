import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { getSurveyResults } from "../../api/surveyApi";
import surveyProLogo from "../../assets/surveypro-logo.png";

const COLORS = {
  primary: "#023E8A",
  orange: "#F48220",
  background: "#F3F3F4",
  text: "#28283A",
  border: "#E4E4E7",
  white: "#FFFFFF",
  muted: "#616371",
};
const FONT_FAMILY = '"Poppins", sans-serif';

function SurveyResultsPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSurveyResults = async () => {
      try {
        const data = await getSurveyResults(surveyId);
        setResults(data);
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err, "Results alinamadi"));
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyResults();
  }, [surveyId]);

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={styles.statusBox}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={{ ...styles.statusBox, color: "#B91228" }}>
            Hata: {error}
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={styles.statusBox}>Sonuç bulunamadı.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.brandArea}>
            <img src={surveyProLogo} alt="SurveyPro logo" style={styles.logo} />
            <span style={styles.brandText}>SURVEYPRO ADMIN PANELİ</span>
          </div>

          <div style={styles.headerRight}>
            <button
              style={styles.topButton}
              onClick={() => navigate("/admin/surveys")}
            >
              Anket Listesine Dön
            </button>
            <button style={styles.menuButton} aria-label="Menü">
              ⋮
            </button>
          </div>
        </div>

        <div style={styles.tabHeader}>
          <div style={styles.tabText}>Anket Sonuçları</div>
          <div style={styles.tabUnderline} />
        </div>

        <div style={styles.contentArea}>
          <div style={styles.container}>
            <div style={styles.mainCard}>
              <h1 style={styles.title}>{results.title}</h1>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Toplam Katılımcı</span>
                  <span style={styles.infoValue}>
                    {results.totalRespondents ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.sectionHeader}>Soru Bazlı Sonuçlar</div>

            {results.questions && results.questions.length > 0 ? (
              results.questions.map((question) => (
                <div key={question.questionId} style={styles.questionCard}>
                  <div style={styles.questionTitle}>{question.questionText}</div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>Soru Tipi</span>
                    <span style={styles.metaValue}>{question.questionType}</span>
                  </div>

                  {question.questionType === "TEXT" && (
                    <div style={styles.resultBlock}>
                      <div style={styles.blockTitle}>Metin Cevapları</div>

                      {question.textAnswers && question.textAnswers.length > 0 ? (
                        <ul style={styles.list}>
                          {question.textAnswers.map((answer, index) => (
                            <li key={index} style={styles.listItem}>
                              {answer}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={styles.emptyText}>Cevap bulunamadı.</div>
                      )}
                    </div>
                  )}

                  {(question.questionType === "MULTI_CHOICE" ||
                    question.questionType === "SINGLE_CHOICE") && (
                    <div style={styles.resultBlock}>
                      <div style={styles.blockTitle}>Seçenek Sonuçları</div>

                      {question.options && question.options.length > 0 ? (
                        <ul style={styles.list}>
                          {question.options.map((option) => (
                            <li key={option.optionId} style={styles.listItem}>
                              {option.optionText} — {option.count}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={styles.emptyText}>
                          Seçenek sonucu bulunamadı.
                        </div>
                      )}
                    </div>
                  )}

                  {question.questionType === "YES_NO" && (
                    <div style={styles.resultBlock}>
                      <div style={styles.blockTitle}>Evet / Hayır Sonuçları</div>
                      <p style={styles.simpleText}>Evet: {question.yesCount ?? 0}</p>
                      <p style={styles.simpleText}>Hayır: {question.noCount ?? 0}</p>
                    </div>
                  )}

                  {question.questionType === "RATING" && (
                    <div style={styles.resultBlock}>
                      <div style={styles.blockTitle}>Puanlama Sonuçları</div>
                      <p style={styles.simpleText}>
                        Ortalama Puan: {question.averageRating ?? 0}
                      </p>

                      {question.ratings && question.ratings.length > 0 ? (
                        <ul style={styles.list}>
                          {question.ratings.map((rating, index) => (
                            <li key={index} style={styles.listItem}>
                              {rating.ratingValue} puan — {rating.count}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div style={styles.emptyText}>
                          Puanlama sonucu bulunamadı.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={styles.emptyCard}>Soru sonucu bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7 3H14L19 8V21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z"
        stroke="#5B7FA3"
        strokeWidth="1.8"
        fill="white"
      />
      <path d="M14 3V8H19" stroke="#5B7FA3" strokeWidth="1.8" />
      <path d="M8 12H16" stroke="#5B7FA3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 15H16" stroke="#5B7FA3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 18H13" stroke="#5B7FA3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#F3F3F4",
    margin: 0,
    fontFamily: FONT_FAMILY,
  },

  panel: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#F3F3F4",
  },

  header: {
    height: "60px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  brandText: {
    display: "none",
  },

  logo: {
    width: "154px",
    height: "38px",
    objectFit: "contain",
    display: "block",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  topButton: {
    backgroundColor: COLORS.orange,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  menuButton: {
    border: "none",
    background: "transparent",
    color: COLORS.text,
    fontSize: "24px",
    cursor: "pointer",
    lineHeight: 1,
    padding: "4px 8px",
  },

  tabHeader: {
    backgroundColor: "#F3F3F4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "36px",
  },

  tabText: {
    color: COLORS.orange,
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1,
    fontFamily: FONT_FAMILY,
  },

  tabUnderline: {
    marginTop: "5px",
    width: "64px",
    height: "2px",
    backgroundColor: COLORS.orange,
    borderRadius: "999px",
  },

  contentArea: {
    backgroundColor: COLORS.background,
    minHeight: "calc(100vh - 96px)",
    padding: "24px 20px 50px",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "20px",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.06)",
  },

  title: {
    marginTop: 0,
    marginBottom: "18px",
    color: COLORS.primary,
    fontSize: "28px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
    gap: "14px",
  },

  infoItem: {
    backgroundColor: "#F9FAFB",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  infoLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.muted,
  },

  infoValue: {
    fontSize: "14px",
    color: COLORS.text,
  },

  sectionHeader: {
    fontSize: "20px",
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: "14px",
  },

  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "18px",
    border: `1px solid ${COLORS.border}`,
    borderLeft: `4px solid ${COLORS.orange}`,
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
  },

  questionTitle: {
    marginBottom: "12px",
    color: COLORS.text,
    fontSize: "18px",
    fontWeight: 700,
  },

  metaRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "14px",
  },

  metaLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.muted,
  },

  metaValue: {
    fontSize: "14px",
    color: COLORS.text,
  },

  resultBlock: {
    marginTop: "10px",
    paddingTop: "12px",
    borderTop: `1px solid ${COLORS.border}`,
  },

  blockTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: "8px",
  },

  list: {
    margin: 0,
    paddingLeft: "18px",
  },

  listItem: {
    marginBottom: "6px",
    color: COLORS.text,
    fontSize: "14px",
  },

  simpleText: {
    margin: "6px 0",
    color: COLORS.text,
    fontSize: "14px",
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: "14px",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "20px",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
  },

  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default SurveyResultsPage;
