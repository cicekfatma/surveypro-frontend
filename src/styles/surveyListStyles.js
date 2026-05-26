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
    minHeight: "36px",
    padding: "0 16px",
    fontSize: "13px",
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
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "18px",
    border: "1px solid #d9dee5",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
  },

  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  filterLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#3b3b3b",
  },

  filterInput: {
    width: "100%",
    minHeight: "40px",
    borderRadius: "8px",
    border: "1px solid #d9dee5",
    padding: "0 12px",
    fontSize: "13px",
    color: "#28283A",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY,
  },

  dropdownWrap: {
    position: "relative",
  },

  dropdownButton: {
    width: "100%",
    minHeight: "40px",
    borderRadius: "8px",
    border: "1px solid #d9dee5",
    padding: "0 14px",
    fontSize: "13px",
    color: "#28283A",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  },

  dropdownChevron: {
    width: "7px",
    height: "7px",
    borderRight: "2px solid #616371",
    borderBottom: "2px solid #616371",
    transform: "rotate(45deg) translateY(-2px)",
    flexShrink: 0,
  },

  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    padding: "6px",
    border: "1px solid #d9dee5",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 12px 28px rgba(16, 24, 40, 0.16)",
    zIndex: 8,
  },

  dropdownOption: {
    width: "100%",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "transparent",
    color: "#28283A",
    padding: "10px 12px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },

  dropdownOptionActive: {
    backgroundColor: "#023E8A",
    color: "#ffffff",
  },

  filterActions: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    flexWrap: "wrap",
  },

  filterButton: {
    backgroundColor: "#003B95",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    minHeight: "40px",
    padding: "0 18px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  filterResetButton: {
    backgroundColor: "#F48220",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    minHeight: "34px",
    padding: "0 14px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
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

  tableActionButton: {
    backgroundColor: "#E5F0FF",
    color: "#023E8A",
    minWidth: "auto",
    minHeight: "32px",
    padding: "0 10px",
    fontSize: "11px",
    flexShrink: 0,
  },

  archiveActionButton: {
    backgroundColor: "#FFF4E5",
    color: "#B54708",
  },

  activateActionButton: {
    backgroundColor: "#ECFDF3",
    color: "#087443",
  },

  actionButtonDisabled: {
    opacity: 0.58,
    cursor: "not-allowed",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "20px",
    border: "1px solid #d9dee5",
    color: "#444",
    textAlign: "center",
  },

  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "18px",
    border: "1px solid #d9dee5",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
  },

  listCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
  },

  listCardTitle: {
    margin: 0,
    color: "#28283A",
    fontSize: "18px",
    lineHeight: 1.2,
    fontWeight: 700,
  },

  listCardSubtitle: {
    marginTop: "6px",
    color: "#616371",
    fontSize: "13px",
  },

  tableLoading: {
    minHeight: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  tableWrapLoading: {
    opacity: 0.65,
    pointerEvents: "none",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
    tableLayout: "fixed",
  },

  titleColumn: {
    width: "14%",
  },

  descriptionColumn: {
    width: "25%",
  },

  targetColumn: {
    width: "8%",
  },

  statusColumn: {
    width: "9%",
  },

  actionsColumn: {
    width: "44%",
  },

  th: {
    textAlign: "center",
    padding: "10px",
    color: "#616371",
    borderBottom: "1px solid #d9dee5",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #d9dee5",
  },

  td: {
    padding: "12px 10px",
    color: "#28283A",
    verticalAlign: "top",
    wordBreak: "break-word",
    textAlign: "center",
  },

  tableActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusActive: {
    backgroundColor: "#ECFDF3",
    color: "#087443",
  },

  statusPassive: {
    backgroundColor: "#F4F4F5",
    color: "#616371",
  },

  countPill: {
    minWidth: "30px",
    height: "30px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    color: "#023E8A",
    fontSize: "13px",
    fontWeight: 800,
    flexShrink: 0,
  },

  paginationFooter: {
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "14px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #d9dee5",
  },

  paginationTotal: {
    color: "#28283A",
    fontSize: "13px",
    fontWeight: 800,
    justifySelf: "start",
  },

  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  paginationButton: {
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "transparent",
    color: "#616371",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    boxShadow: "none",
  },

  paginationButtonActive: {
    backgroundColor: "#023E8A",
    color: "#ffffff",
    boxShadow: "0 6px 14px rgba(2, 62, 138, 0.24)",
  },

  paginationButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  pageSizeField: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifySelf: "end",
  },

  pageSizeMenuWrap: {
    position: "relative",
  },

  pageSizeSelectButton: {
    width: "76px",
    minHeight: "36px",
    border: "1px solid #d9dee5",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#28283A",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "6px 10px",
    fontSize: "14px",
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  },

  pageSizeMenu: {
    position: "absolute",
    right: 0,
    bottom: "calc(100% + 8px)",
    width: "76px",
    padding: "5px",
    border: "1px solid #d9dee5",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 12px 28px rgba(16, 24, 40, 0.16)",
    zIndex: 8,
  },

  pageSizeOption: {
    width: "100%",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "transparent",
    color: "#28283A",
    padding: "8px 10px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },

  pageSizeOptionActive: {
    backgroundColor: "#023E8A",
    color: "#ffffff",
  },

  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY,
  },

  confirmDialog: {
    width: "100%",
    maxWidth: "320px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #d9dee5",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.22)",
    padding: "20px",
    boxSizing: "border-box",
    textAlign: "center",
  },

  confirmTitle: {
    margin: "0 0 8px",
    color: "#28283A",
    fontSize: "18px",
    lineHeight: 1.25,
    fontWeight: 800,
    letterSpacing: 0,
  },

  confirmText: {
    margin: 0,
    color: "#616371",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  confirmActions: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "18px",
    flexWrap: "wrap",
  },

  confirmPrimaryButton: {
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#023E8A",
    color: "#ffffff",
    minHeight: "36px",
    minWidth: "92px",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },

  confirmSecondaryButton: {
    border: "1px solid #d9dee5",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#28283A",
    minHeight: "36px",
    minWidth: "92px",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },
};
