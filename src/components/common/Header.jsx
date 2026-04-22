import DocumentIcon from "./icons/DocumentIcon";
import { styles } from "../../styles/surveyListStyles";

function Header({ onCreateSurvey }) {
  return (
    <div style={styles.header}>
      <div style={styles.brandArea}>
        <DocumentIcon />
        <span style={styles.brandText}>SURVEYPRO ADMIN PANELİ</span>
      </div>

      <div style={styles.headerRight}>
        <button style={styles.newSurveyButton} onClick={onCreateSurvey}>
          Yeni Anket
        </button>

        <button style={styles.menuButton} aria-label="Menü">
          ⋮
        </button>
      </div>
    </div>
  );
}

export default Header;
