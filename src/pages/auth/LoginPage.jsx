import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { login } from "../../api/authApi";

const COLORS = {
  primary: "#0B4DBB",
  background: "#F4F4F5",
  card: "#FFFFFF",
  text: "#28283A",
  border: "#D9D9DE",
  muted: "#8B8E99",
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>SurveyPro</div>

        <h1 style={styles.title}>Hosgeldiniz</h1>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>E-posta adresi</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>@</span>
            <input
              style={styles.input}
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Sifre</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>*</span>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Sifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              style={styles.eyeButton}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Gizle" : "Goster"}
            </button>
          </div>
        </div>

        <div style={styles.forgotPassword}>Sifremi Unuttum</div>

        <button
          style={styles.loginButton}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Giris Yapiliyor..." : "Giris Yap"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "18px",
    padding: "32px 28px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
  },
  logo: {
    fontSize: "28px",
    fontWeight: 800,
    color: COLORS.primary,
    marginBottom: "14px",
    textAlign: "center",
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    color: COLORS.text,
    textAlign: "center",
    margin: "0 0 24px",
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
    color: COLORS.text,
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "0 12px",
    backgroundColor: "#fff",
  },
  icon: {
    color: COLORS.muted,
    fontSize: "14px",
    minWidth: "16px",
    textAlign: "center",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "14px 0",
    fontSize: "14px",
    color: COLORS.text,
    backgroundColor: "transparent",
  },
  eyeButton: {
    border: "none",
    background: "transparent",
    color: COLORS.primary,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    padding: 0,
  },
  forgotPassword: {
    textAlign: "right",
    fontSize: "13px",
    color: COLORS.primary,
    marginBottom: "20px",
  },
  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    padding: "14px 16px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#B91228",
    textAlign: "center",
  },
};

export default LoginPage;
