import { useState } from "react";
import { clearAuthSession } from "../auth/session";

const FONT_FAMILY = '"Poppins", sans-serif';

export function useLogoutConfirmation(navigate) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const logoutConfirmDialog = isLogoutConfirmOpen ? (
    <div style={styles.overlay} role="presentation">
      <div
        style={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
      >
        <h2 id="logout-confirm-title" style={styles.title}>
          Çıkış yapılsın mı?
        </h2>
        <div style={styles.actions}>
          <button type="button" style={styles.confirmButton} onClick={confirmLogout}>
            Çıkış Yap
          </button>
          <button type="button" style={styles.cancelButton} onClick={cancelLogout}>
            İptal
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return {
    requestLogout,
    logoutConfirmDialog,
  };
}

const styles = {
  overlay: {
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
  dialog: {
    width: "100%",
    maxWidth: "240px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    border: "1px solid #E4E4E7",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.22)",
    padding: "18px",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 8px",
    color: "#28283A",
    fontSize: "18px",
    lineHeight: 1.25,
    fontWeight: 800,
    letterSpacing: 0,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    marginTop: "18px",
  },
  cancelButton: {
    border: "1px solid #D9DEE5",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    color: "#28283A",
    minHeight: "36px",
    width: "140px",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },
  confirmButton: {
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#F48220",
    color: "#FFFFFF",
    minHeight: "36px",
    width: "140px",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },
};

