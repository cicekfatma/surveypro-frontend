import { styles } from "../../styles/surveyListStyles";

function TabBar() {
  return (
    <div style={styles.tabHeader}>
      <div style={styles.tabText}>Anket Listesi</div>
      <div style={styles.tabUnderline} />
    </div>
  );
}

export default TabBar;
