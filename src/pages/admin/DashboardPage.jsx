import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import {
  getSurveyDashboard,
  getSurveyDailyStats,
} from "../../api/surveyApi";
import surveyProLogo from "../../assets/surveypro-logo.png";
import { useLogoutConfirmation } from "../../hooks/useLogoutConfirmation";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts";

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
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0))}%`;
}

function formatChartDate(value) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatTooltipDate(value) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={styles.tooltipCard}>
      <div style={styles.tooltipTitle}>{formatTooltipDate(label)}</div>
      {payload.map((item) => (
        <div key={item.dataKey} style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: item.color }} />
          <span style={styles.tooltipLabel}>{`${item.name}:`}</span>
          <span style={styles.tooltipValue}>{item.value ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [dailyStatsError, setDailyStatsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { requestLogout, logoutConfirmDialog } = useLogoutConfirmation(navigate);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");
        setDailyStatsError("");

        const dashboardData = await getSurveyDashboard(surveyId);
        setDashboard(dashboardData);

        try {
          const dailyStatsData = await getSurveyDailyStats(surveyId);
          setDailyStats(dailyStatsData || []);
        } catch (dailyStatsRequestError) {
          console.error(dailyStatsRequestError);
          setDailyStats([]);
          setDailyStatsError(
            getApiErrorMessage(
              dailyStatsRequestError,
              "Günlük istatistikler şu anda alınamıyor."
            )
          );
        }
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err, "Panel alınamadı"));
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
          <div style={styles.statusBox}>Panel bulunamadı.</div>
        </div>
      </div>
    );
  }

  const cards = [
    { title: "Hedef Kişi Sayısı", value: dashboard.targetCount },
    { title: "Ulaşılan Kişi", value: dashboard.reachedCount },
    { title: "Anketi Açan", value: dashboard.openedCount },
    { title: "Anketi Tamamlayan", value: dashboard.submittedCount },
    { title: "Açılma Oranı", value: formatPercentage(dashboard.openRate) },
    {
      title: "Cevaplanma Oranı",
      value: formatPercentage(dashboard.responseRate),
    },
    { title: "Açmayan Kişi", value: dashboard.notOpenedCount },
    { title: "Tamamlamayan Kişi", value: dashboard.notSubmittedCount },
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
              Anket Listesine Dön
            </button>
            <button
              type="button"
              style={styles.logoutButton}
              onClick={requestLogout}
              aria-label="Çıkış Yap"
              title="Çıkış Yap"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        <div style={styles.tabHeader}>
          <div style={styles.tabText}>Panel</div>
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

            <div style={styles.sectionHeader}>Panel Özeti</div>

            <div style={styles.grid}>
              {cards.map((card, index) => (
                <div key={index} style={styles.metricCard}>
                  <div style={styles.metricTitle}>{card.title}</div>
                  <div style={styles.metricValue}>{card.value ?? 0}</div>
                </div>
              ))}
            </div>

            <div style={styles.chartSection}>
              <div style={styles.sectionHeader}>Günlük İstatistikler</div>

              <div style={styles.chartCard}>
                {dailyStatsError && (
                  <div style={styles.chartErrorText}>
                    Hata: {dailyStatsError}
                  </div>
                )}

                {dailyStats.length === 0 ? (
                  <div style={styles.emptyChartText}>
                    Henüz günlük istatistik verisi yok.
                  </div>
                ) : (
                  <div style={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={dailyStats}
                        margin={{ top: 12, right: 20, left: 0, bottom: 28 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                        <XAxis
                          dataKey="date"
                          stroke="#616371"
                          tickFormatter={formatChartDate}
                          angle={-30}
                          textAnchor="end"
                          height={60}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          allowDecimals={false}
                          domain={[0, "auto"]}
                          stroke="#616371"
                        >
                          <Label
                            value="Açılma"
                            angle={-90}
                            position="insideLeft"
                            style={styles.leftAxisLabel}
                          />
                        </YAxis>
                        <YAxis
                          yAxisId="submitted"
                          orientation="right"
                          allowDecimals={false}
                          domain={[0, "auto"]}
                          stroke={COLORS.orange}
                        >
                          <Label
                            value="Tamamlanma"
                            angle={90}
                            position="insideRight"
                            style={styles.rightAxisLabel}
                          />
                        </YAxis>
                        <Tooltip content={<ChartTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="openedCount"
                          name="Açılma"
                          fill={COLORS.primary}
                          radius={[6, 6, 0, 0]}
                          barSize={24}
                        />
                        <Line
                          type="monotone"
                          dataKey="submittedCount"
                          name="Tamamlanma"
                          yAxisId="submitted"
                          stroke={COLORS.orange}
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {logoutConfirmDialog}
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
    minHeight: "36px",
    height: "36px",
    padding: "0 16px",
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

  chartSection: {
    marginTop: "28px",
  },

  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "18px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
  },

  chartWrapper: {
    width: "100%",
    height: "320px",
  },

  emptyChartText: {
    color: COLORS.muted,
    fontSize: "14px",
  },

  chartErrorText: {
    color: "#B91228",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "12px",
  },

  tooltipCard: {
    backgroundColor: "#FFFFFF",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "10px 12px",
    boxShadow: "0 8px 24px rgba(16, 24, 40, 0.12)",
  },

  tooltipTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: "8px",
  },

  tooltipRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: COLORS.text,
    marginTop: "4px",
  },

  tooltipDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    flexShrink: 0,
  },

  tooltipLabel: {
    color: COLORS.muted,
  },

  tooltipValue: {
    marginLeft: "auto",
    fontWeight: 700,
    color: COLORS.text,
  },

  leftAxisLabel: {
    fill: "#616371",
    fontSize: "12px",
    fontWeight: 600,
  },

  rightAxisLabel: {
    fill: COLORS.orange,
    fontSize: "12px",
    fontWeight: 600,
  },

  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default DashboardPage;

