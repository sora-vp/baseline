import QrScanner from "qr-scanner";
import { validateId } from "id-generator";
import { useRef, useEffect } from "react";

import styles from "@/styles/components/Scanner.module.css";

const NormalScanner: React.FC<{ setInvalidQr: Function }> = ({
  setInvalidQr,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        qrScanner.stop();

        const isValidQr = validateId(data);

        if (!isValidQr) return setInvalidQr(true);
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
      }
    );

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  return (
    <section className={styles.container}>
      <article className={`card ${styles.card}`}>
        <div className={styles.cardContainer}>
          <div className={styles.upperItem}>
            <video className={styles.video} ref={videoRef}></video>
          </div>
          <div className={styles.lowerItem}>
            <h3>Scan Barcode ID Mu!</h3>
          </div>
        </div>
      </article>
    </section>
  );
};

export default NormalScanner;
