import { styles } from "../../styles/surveyListStyles";

function SurveyCard({
  survey,
  onDetail,
  onResults,
  onDashboard,
  onMail,
  onPublic,
}) {
  return (
    <div style={styles.surveyCard}>
      <div style={styles.surveyTitle}>{survey.title}</div>

      <div style={styles.actionsRow}>
        <button
          style={styles.smallActionButton}
          onClick={() => onDetail?.(survey)}
        >
          Detay
        </button>

        <button
          style={styles.smallActionButton}
          onClick={() => onResults?.(survey)}
        >
          Results
        </button>

        <button
          style={styles.smallActionButton}
          onClick={() => onDashboard?.(survey)}
        >
          Dashboard
        </button>

        <button
          style={styles.smallActionButton}
          onClick={() => onMail?.(survey)}
        >
          Mail
        </button>

        <button
          style={styles.smallActionButton}
          onClick={() => onPublic?.(survey)}
        >
          Public Test
        </button>
      </div>
    </div>
  );
}

export default SurveyCard;
