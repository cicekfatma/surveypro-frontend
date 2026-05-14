import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { getRespondentResults, getSurveyResults } from "../../api/surveyApi";
import { clearAuthSession } from "../../auth/session";
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

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={styles.logoutIcon}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAnswerForQuestion(respondent, questionId) {
  return (
    respondent.answers?.find((answer) => answer.questionId === questionId)
      ?.answer || "-"
  );
}

function SurveyResultsPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [results, setResults] = useState(null);
  const [respondentResults, setRespondentResults] = useState([]);
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchSurveyResults = async () => {
      try {
        const [questionData, respondentData] = await Promise.all([
          getSurveyResults(surveyId),
          getRespondentResults(surveyId),
        ]);
        setResults(questionData);
        setRespondentResults(respondentData || []);
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
          <div style={styles.statusBox}>Yukleniyor...</div>
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
          <div style={styles.statusBox}>Sonuc bulunamadi.</div>
        </div>
      </div>
    );
  }

  const questionColumns = results.questions || [];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.brandArea}>
            <img src={surveyProLogo} alt="SurveyPro logo" style={styles.logo} />
            <span style={styles.brandText}>SURVEYPRO ADMIN PANELI</span>
          </div>

          <div style={styles.headerRight}>
            <button
              style={styles.topButton}
              onClick={() => navigate("/admin/surveys")}
            >
              Anket Listesine Don
            </button>
            <button
              type="button"
              style={styles.logoutButton}
              onClick={handleLogout}
              aria-label="Cikis Yap"
              title="Cikis Yap"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        <div style={styles.tabHeader}>
          <div style={styles.tabText}>Anket Sonuclari</div>
          <div style={styles.tabUnderline} />
        </div>

        <div style={styles.contentArea}>
          <div style={styles.container}>
            <div style={styles.mainCard}>
              <h1 style={styles.title}>{results.title}</h1>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Toplam Katilimci</span>
                  <span style={styles.infoValue}>
                    {results.totalRespondents ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.resultTabs}>
              <button
                type="button"
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "questions" ? styles.tabButtonActive : null),
                }}
                onClick={() => setActiveTab("questions")}
              >
                Soru Bazli
              </button>
              <button
                type="button"
                style={{
                  ...styles.tabButton,
                  ...(activeTab === "respondents" ? styles.tabButtonActive : null),
                }}
                onClick={() => setActiveTab("respondents")}
              >
                Katilimci Bazli
              </button>
            </div>

            {activeTab === "questions" ? (
              <QuestionResults questions={questionColumns} />
            ) : (
              <RespondentResults
                questions={questionColumns}
                respondentResults={respondentResults}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionResults({ questions }) {
  return (
    <>
      <div style={styles.sectionHeader}>Soru Bazli Sonuclar</div>

      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.questionId} style={styles.questionCard}>
            <div style={styles.questionTitle}>{question.questionText}</div>

            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Soru Tipi</span>
              <span style={styles.metaValue}>{question.questionType}</span>
            </div>

            {question.questionType === "TEXT" && (
              <div style={styles.resultBlock}>
                <div style={styles.blockTitle}>Metin Cevaplari</div>

                {question.textAnswers && question.textAnswers.length > 0 ? (
                  <ul style={styles.list}>
                    {question.textAnswers.map((answer, index) => (
                      <li key={index} style={styles.listItem}>
                        {answer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.emptyText}>Cevap bulunamadi.</div>
                )}
              </div>
            )}

            {(question.questionType === "MULTI_CHOICE" ||
              question.questionType === "SINGLE_CHOICE") && (
              <div style={styles.resultBlock}>
                <div style={styles.blockTitle}>Secenek Sonuclari</div>

                {question.options && question.options.length > 0 ? (
                  <ul style={styles.list}>
                    {question.options.map((option) => (
                      <li key={option.optionId} style={styles.listItem}>
                        {option.optionText} - {option.count}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.emptyText}>
                    Secenek sonucu bulunamadi.
                  </div>
                )}
              </div>
            )}

            {question.questionType === "YES_NO" && (
              <div style={styles.resultBlock}>
                <div style={styles.blockTitle}>Evet / Hayir Sonuclari</div>
                <p style={styles.simpleText}>Evet: {question.yesCount ?? 0}</p>
                <p style={styles.simpleText}>Hayir: {question.noCount ?? 0}</p>
              </div>
            )}

            {question.questionType === "RATING" && (
              <div style={styles.resultBlock}>
                <div style={styles.blockTitle}>Puanlama Sonuclari</div>
                <p style={styles.simpleText}>
                  Ortalama Puan: {question.averageRating ?? 0}
                </p>

                {question.ratings && question.ratings.length > 0 ? (
                  <ul style={styles.list}>
                    {question.ratings.map((rating, index) => (
                      <li key={index} style={styles.listItem}>
                        {rating.ratingValue} puan - {rating.count}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={styles.emptyText}>
                    Puanlama sonucu bulunamadi.
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={styles.emptyCard}>Soru sonucu bulunamadi.</div>
      )}
    </>
  );
}

function RespondentResults({ questions, respondentResults }) {
  return (
    <>
      <div style={styles.sectionHeader}>Katilimci Bazli Sonuclar</div>

      {respondentResults.length === 0 ? (
        <div style={styles.emptyCard}>Katilimci sonucu bulunamadi.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Katilimci</th>
                <th style={styles.th}>Acilma</th>
                <th style={styles.th}>Cevaplama</th>
                {questions.map((question) => (
                  <th key={question.questionId} style={styles.th}>
                    {question.questionText}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {respondentResults.map((respondent) => (
                <tr key={respondent.respondentId} style={styles.tr}>
                  <td style={styles.td}>
                    {respondent.displayName ||
                      respondent.email ||
                      `Anonim Katilimci #${respondent.respondentId}`}
                  </td>
                  <td style={styles.td}>{formatDateTime(respondent.openedAt)}</td>
                  <td style={styles.td}>
                    {formatDateTime(respondent.submittedAt)}
                  </td>
                  {questions.map((question) => (
                    <td key={question.questionId} style={styles.td}>
                      {getAnswerForQuestion(respondent, question.questionId)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
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
    backgroundColor: COLORS.primary,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    minHeight: "42px",
    padding: "0 20px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    backgroundColor: "transparent",
    color: COLORS.primary,
    border: "none",
    width: "24px",
    height: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    cursor: "pointer",
  },

  logoutIcon: {
    width: "20px",
    height: "20px",
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
    maxWidth: "1120px",
    margin: "0 auto",
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "20px",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "18px",
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

  resultTabs: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    backgroundColor: COLORS.white,
    marginBottom: "18px",
  },

  tabButton: {
    border: "none",
    borderRadius: "6px",
    minHeight: "34px",
    padding: "0 14px",
    backgroundColor: "transparent",
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },

  tabButtonActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
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

  tableWrap: {
    width: "100%",
    overflowX: "auto",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    fontSize: "13px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    color: COLORS.muted,
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: "#F9FAFB",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: `1px solid ${COLORS.border}`,
  },

  td: {
    padding: "12px",
    color: COLORS.text,
    verticalAlign: "top",
    wordBreak: "break-word",
    minWidth: "140px",
  },

  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default SurveyResultsPage;
