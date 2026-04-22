import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { getSurveyDashboard } from "../../api/surveyApi";

const COLORS = {
  primary: "#023E8A",
  orange: "#F48220",
  background: "#E5F0FF",
  text: "#28283A",
  border: "#E4E4E7",
  white: "#FFFFFF",
  muted: "#616371",
};

function DashboardPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getSurveyDashboard(surveyId);
        setDashboard(data);
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err, "Dashboard alinamadi"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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

  if (!dashboard) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={styles.statusBox}>Dashboard bulunamadı.</div>
        </div>
      </div>
    );
  }

  const cards = [
    { title: "Hedef Kişi Sayısı", value: dashboard.targetCount },
    { title: "Ulaşılan Kişi", value: dashboard.reachedCount },
    { title: "Anketi Açan", value: dashboard.openedCount },
    { title: "Anketi Tamamlayan", value: dashboard.submittedCount },
    { title: "Açılma Oranı", value: `${dashboard.openRate ?? 0}%` },
    { title: "Cevaplanma Oranı", value: `${dashboard.responseRate ?? 0}%` },
    { title: "Açmayan Kişi", value: dashboard.notOpenedCount },
    { title: "Tamamlamayan Kişi", value: dashboard.notSubmittedCount },
  ];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.brandArea}>
            <DocumentIcon />
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
          <div style={styles.tabText}>Dashboard</div>
          <div style={styles.tabUnderline} />
        </div>

        <div style={styles.contentArea}>
          <div style={styles.container}>
            <div style={styles.mainCard}>
              <h1 style={styles.title}>{dashboard.title}</h1>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Survey ID</span>
                  <span style={styles.infoValue}>{dashboard.surveyId}</span>
                </div>
              </div>
            </div>

            <div style={styles.sectionHeader}>Dashboard Özeti</div>

            <div style={styles.grid}>
              {cards.map((card, index) => (
                <div key={index} style={styles.metricCard}>
                  <div style={styles.metricTitle}>{card.title}</div>
                  <div style={styles.metricValue}>{card.value ?? 0}</div>
                </div>
              ))}
            </div>
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
    backgroundColor: "#FFFFFF",
    margin: 0,
    fontFamily: "Arial, sans-serif",
  },

  panel: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: "102px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    borderBottom: "1px solid #E4E4E7",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  brandText: {
    fontSize: "15px",
    fontWeight: 500,
    color: COLORS.text,
    letterSpacing: "0.2px",
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
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "74px",
    borderBottom: "1px solid #E4E4E7",
  },

  tabText: {
    color: COLORS.orange,
    fontSize: "16px",
    fontWeight: 700,
  },

  tabUnderline: {
    marginTop: "6px",
    width: "95px",
    height: "3px",
    backgroundColor: COLORS.orange,
    borderRadius: "999px",
  },

  contentArea: {
    backgroundColor: COLORS.background,
    minHeight: "calc(100vh - 176px)",
    padding: "24px 20px 50px",
  },

  container: {
    maxWidth: "950px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "18px",
    border: `1px solid ${COLORS.border}`,
    borderLeft: `4px solid ${COLORS.orange}`,
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
  },

  metricTitle: {
    fontSize: "14px",
    color: COLORS.text,
    marginBottom: "10px",
    fontWeight: 600,
  },

  metricValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: COLORS.primary,
  },

  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default DashboardPage;
