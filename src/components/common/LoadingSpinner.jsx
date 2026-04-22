function LoadingSpinner({ label = "Yukleniyor..." }) {
  return <div style={styles.wrapper}>{label}</div>;
}

const styles = {
  wrapper: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default LoadingSpinner;
