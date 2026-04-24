import { useNavigate } from "react-router-dom";
import surveyProLogo from "../../assets/surveypro-logo.png";
import { styles } from "../../styles/surveyListStyles";

function Header({ onCreateSurvey }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div style={styles.header}>
      <div style={styles.brandArea}>
        <img src={surveyProLogo} alt="SurveyPro logo" style={styles.logo} />
      </div>

      <div style={styles.headerRight}>
        <button style={styles.newSurveyButton} onClick={onCreateSurvey}>
          Yeni Anket
        </button>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Cikis Yap
        </button>
      </div>
    </div>
  );
}

export default Header;
