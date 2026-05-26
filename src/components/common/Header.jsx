import { useLogoutConfirmation } from "../../hooks/useLogoutConfirmation";
import { useNavigate } from "react-router-dom";
import surveyProLogo from "../../assets/surveypro-logo.png";
import { styles } from "../../styles/surveyListStyles";

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

function Header({ onCreateSurvey }) {
  const navigate = useNavigate();
  const { requestLogout, logoutConfirmDialog } = useLogoutConfirmation(navigate);

  return (
    <>
      <div style={styles.header}>
        <div style={styles.brandArea}>
          <img src={surveyProLogo} alt="SurveyPro logo" style={styles.logo} />
        </div>

        <div style={styles.headerRight}>
          <button style={styles.newSurveyButton} onClick={onCreateSurvey}>
            Yeni Anket Oluştur
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
      {logoutConfirmDialog}
    </>
  );
}

export default Header;

