const ORANGE = " #F48220";
const BABY_BLUE = "#FFEFC7";
const FONT_FAMILY = '"Poppins", sans-serif';
const COLORS = {
  ORANGE: "#F48220",
};

export const styles = {
    pageWrapper: {
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#F3F3F4",
        padding: "0",
        margin: "0",
        fontFamily: FONT_FAMILY,
      },
      panel: {
        minHeight: "100vh",
        width: "100%",
        borderRadius: "0",
        overflow: "hidden",
        border: "none",
        backgroundColor: "#F3F3F4",
      },

      header: {
        height: "60px",
        backgroundColor: "#ffffff",
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

  newSurveyButton: {
    backgroundColor: "#003B95",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    minHeight: "42px",
    padding: "0 20px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    backgroundColor: "transparent",
    color: "#023E8A",
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
    justifyContent: "flex-end",
    height: "36px",
    paddingBottom: "4px",
    boxSizing: "border-box",
  },

 tabText: {
    color: COLORS.ORANGE,
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1,
    fontFamily: FONT_FAMILY,
  },

  tabUnderline: {
    marginTop: "5px",
    width: "64px",
    height: "2px",
    backgroundColor: COLORS.ORANGE,
    borderRadius: "999px",
  },

  contentArea: {
    backgroundColor: "#F3F3F4",
    minHeight: "calc(100vh - 96px)",
    padding: "34px 20px 60px",
  },
  listWrapper: {
    maxWidth: "620px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  surveyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "16px 18px",
    minHeight: "48px",
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
    borderRadius: "9999px",
    minHeight: "40px",
    padding: "0 20px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    minWidth: "84px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
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
