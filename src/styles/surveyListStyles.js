const ORANGE = " #F48220";
const BABY_BLUE = "#FFEFC7";

export const styles = {
    pageWrapper: {
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#ffffff",
        padding: "0",
        margin: "0",
      },
      panel: {
        minHeight: "100vh",
        width: "100%",
        borderRadius: "0",
        overflow: "hidden",
        border: "none",
        backgroundColor: "#ffffff",
      },

      header: {
        height: "102px",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        borderBottom: "1px solid #d8dde3",
      },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  brandText: {
    fontSize: "15px",
    fontWeight: 500,
    color: "#2f2f2f",
    letterSpacing: "0.2px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  newSurveyButton: {
    backgroundColor: ORANGE,
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },

  menuButton: {
    border: "none",
    background: "transparent",
    color: "#444",
    fontSize: "24px",
    cursor: "pointer",
    lineHeight: 1,
    padding: "4px 8px",
  },

  tabHeader: {
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "70px",
    borderBottom: "1px solid #d8dde3",
  },

  tabText: {
    color: ORANGE,
    fontSize: "16px",
    fontWeight: 700,
  },

  tabUnderline: {
    marginTop: "6px",
    width: "110px",
    height: "3px",
    backgroundColor: ORANGE,
    borderRadius: "999px",
  },

  contentArea: {
    backgroundColor: "#E2ECF5",
    minHeight: "calc(100vh - 172px)",
    padding: "34px 20px 60px",
  },
  listWrapper: {
    maxWidth: "720px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  surveyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "22px 20px",
    minHeight: "62px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
    border: "1px solid #d9dee5",
  },

  surveyTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#3b3b3b",
    marginBottom: "18px",
  },

  actionsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  smallActionButton: {
    backgroundColor: ORANGE,
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    minWidth: "84px",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    border: "1px solid #d9dee5",
    color: "#444",
    textAlign: "center",
  },

  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};
