import styles from "@/styles/components/Scanner.module.css";

const ErrorScanner: React.FC<{ setInvalidQr: Function }> = ({
  setInvalidQr,
}) => {
  return (
    <section className={styles.container}>
      <article className={`card ${styles.card}`}>
        <div className={styles.cardContainer}>
          <div>
            <h2 style={{ padding: "0" }}>QR Tidak Valid!</h2>
          </div>
          <div style={{ textAlign: "center", margin: "1rem" }}>
            <p>QR Code yang anda tunjukkan tidak valid.</p>
            <p>Mohon hubungi panitia untuk kesalahan ini.</p>
          </div>
          <div>
            <button className="warning" onClick={() => setInvalidQr(false)}>
              Coba Scan Ulang
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default ErrorScanner;
