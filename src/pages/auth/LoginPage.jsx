import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { login } from "../../api/authApi";
import surveyProLogo from "../../assets/surveypro-logo.png";

const COLORS = {
  primary: "#0A4CAA",
  primaryDark: "#083E8B",
  page: "#F7F5F2",
  card: "#FFFFFF",
  text: "#1F2A37",
  border: "#C9D2DF",
  muted: "#98A2B3",
  shadow: "0 22px 60px rgba(15, 23, 42, 0.12)",
  shadowSoft: "0 12px 32px rgba(10, 76, 170, 0.14)",
};

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7.5 11.06 12.44a1.6 1.6 0 0 0 1.88 0L20 7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3.25"
        y="5.25"
        width="17.5"
        height="13.5"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4.25"
        y="10.25"
        width="15.5"
        height="10.5"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 10V7.75A4 4 0 0 1 12 3.75a4 4 0 0 1 4 4V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2.6 12s3.3-5.8 9.4-5.8 9.4 5.8 9.4 5.8-3.3 5.8-9.4 5.8S2.6 12 2.6 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m3 3 18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.58 6.33A10.78 10.78 0 0 1 12 6.25c6.1 0 9.4 5.75 9.4 5.75a16.58 16.58 0 0 1-3.64 4.26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.7 6.97C4.15 8.38 2.6 12 2.6 12s3.3 5.75 9.4 5.75c1.2 0 2.31-.22 3.33-.58"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.88 9.88A3 3 0 0 0 14.12 14.12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth <= 960;
  });

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;

    const previous = {
      width: root.style.width,
      maxWidth: root.style.maxWidth,
      margin: root.style.margin,
      borderInline: root.style.borderInline,
      minHeight: root.style.minHeight,
    };

    root.style.width = "100%";
    root.style.maxWidth = "none";
    root.style.margin = "0";
    root.style.borderInline = "none";
    root.style.minHeight = "100vh";

    return () => {
      root.style.width = previous.width;
      root.style.maxWidth = previous.maxWidth;
      root.style.margin = previous.margin;
      root.style.borderInline = previous.borderInline;
      root.style.minHeight = previous.minHeight;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setIsCompact(window.innerWidth <= 960);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const data = await login({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      navigate("/admin/surveys", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage(getApiErrorMessage(err, "E-posta veya sifre hatali."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

      <div
        style={{
          ...styles.layout,
          ...(isCompact ? styles.layoutCompact : null),
        }}
      >
        <section
          style={{
            ...styles.brandPanel,
            ...(isCompact ? styles.brandPanelCompact : null),
          }}
        >
          <img
            src={surveyProLogo}
            alt="SurveyPro logo"
            style={{
              ...styles.brandLogo,
              ...(isCompact ? styles.brandLogoCompact : null),
            }}
          />
        </section>

        <section style={styles.formPanel}>
          <div
            style={{
              ...styles.card,
              ...(isCompact ? styles.cardCompact : null),
            }}
          >
            <h1 style={styles.title}>{"Ho\u015fgeldiniz"}</h1>

            <div style={styles.fieldGroup}>
              <label htmlFor="email" style={styles.label}>
                E-posta adresi
              </label>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>
                  <MailIcon />
                </span>
                <input
                  id="email"
                  style={styles.input}
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>
                {"\u015eifre"}
              </label>
              <div style={styles.inputWrapper}>
                <span style={styles.icon}>
                  <LockIcon />
                </span>
                <input
                  id="password"
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  placeholder={"\u015eifre"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? "\u015eifreyi gizle"
                      : "\u015eifreyi g\u00f6ster"
                  }
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button type="button" style={styles.forgotPassword}>
              {"\u015eifremi Unuttum"}
            </button>

            <button
              type="button"
              style={{
                ...styles.loginButton,
                ...(loading ? styles.loginButtonDisabled : null),
              }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Giri\u015f Yap\u0131l\u0131yor..." : "Giri\u015f Yap"}
            </button>

            {message && <p style={styles.message}>{message}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #fcfbfa 0%, #f5f2ee 52%, #f7f6f4 100%)",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: "-140px",
    left: "-80px",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255, 166, 77, 0.16) 0%, rgba(255, 166, 77, 0) 72%)",
    pointerEvents: "none",
  },
  backgroundGlowBottom: {
    position: "absolute",
    right: "-120px",
    bottom: "-180px",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(10, 76, 170, 0.14) 0%, rgba(10, 76, 170, 0) 74%)",
    pointerEvents: "none",
  },
  layout: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(320px, 1.15fr) minmax(420px, 0.95fr)",
    alignItems: "center",
    gap: "56px",
    padding: "48px clamp(28px, 6vw, 88px)",
  },
  layoutCompact: {
    gridTemplateColumns: "1fr",
    gap: "24px",
    padding: "24px 16px 36px",
    alignItems: "stretch",
  },
  brandPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "360px",
  },
  brandPanelCompact: {
    minHeight: "auto",
    paddingTop: "24px",
  },
  brandLogo: {
    width: "min(100%, 420px)",
    height: "auto",
    objectFit: "contain",
    filter: "drop-shadow(0 10px 14px rgba(10, 76, 170, 0.12))",
  },
  brandLogoCompact: {
    width: "min(78vw, 320px)",
  },
  formPanel: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    backgroundColor: COLORS.card,
    borderRadius: "30px",
    padding: "46px 34px 34px",
    boxShadow: COLORS.shadow,
    border: "1px solid rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(6px)",
  },
  cardCompact: {
    maxWidth: "100%",
    padding: "34px 22px 24px",
  },
  title: {
    margin: "0 0 34px",
    textAlign: "center",
    color: COLORS.primaryDark,
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },
  fieldGroup: {
    marginBottom: "22px",
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontSize: "14px",
    fontWeight: 600,
    color: COLORS.text,
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minHeight: "56px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "0 14px",
    backgroundColor: "#fff",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#B1B9C6",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    padding: "16px 0",
    fontSize: "14px",
    color: COLORS.text,
    backgroundColor: "transparent",
  },
  eyeButton: {
    border: "none",
    background: "transparent",
    color: "#A4ACB8",
    cursor: "pointer",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  forgotPassword: {
    display: "block",
    marginLeft: "auto",
    marginBottom: "22px",
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#1A63D0",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    background: "linear-gradient(180deg, #1B63D4 0%, #0A54C3 100%)",
    color: "#fff",
    minHeight: "52px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: COLORS.shadowSoft,
  },
  loginButtonDisabled: {
    opacity: 0.8,
    cursor: "wait",
  },
  message: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#B42318",
    textAlign: "center",
  },
};

export default LoginPage;
