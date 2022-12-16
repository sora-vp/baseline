import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";

import styles from "@/styles/routes/Main.module.css";

import { soraTRPC } from "@/utils/trpc";

const Main = () => {
  const videoRef = useRef<HTMLVideoElement>(null!);

  useEffect(() => {
    const qrScanner = new QrScanner(videoRef.current, () => {
      qrScanner.stop();
    });

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
            <video className={styles.video}  ref={videoRef}></video>
          </div>
          <div className={styles.lowerItem}>
            <h3>Scan Barcode ID Mu!</h3>
          </div>
        </div>
      </article>
    </section>
  );
};

export default Main;
