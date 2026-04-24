import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { getSurveyDashboard } from "../../api/surveyApi";
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

function formatPercentage(value) {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))}%`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

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

  if (!dashboard) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={styles.statusBox}>Dashboard bulunamadi.</div>
        </div>
      </div>
    );
  }

  const cards = [
    { title: "Hedef Kisi Sayisi", value: dashboard.targetCount },
    { title: "Ulasilan Kisi", value: dashboard.reachedCount },
    { title: "Anketi Acan", value: dashboard.openedCount },
    { title: "Anketi Tamamlayan", value: dashboard.submittedCount },
    { title: "Acilma Orani", value: formatPercentage(dashboard.openRate) },
    {
      title: "Cevaplanma Orani",
      value: formatPercentage(dashboard.responseRate),
    },
    { title: "Acmayan Kisi", value: dashboard.notOpenedCount },
    { title: "Tamamlamayan Kisi", value: dashboard.notSubmittedCount },
  ];

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

            <div style={styles.sectionHeader}>Dashboard Ozeti</div>

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
