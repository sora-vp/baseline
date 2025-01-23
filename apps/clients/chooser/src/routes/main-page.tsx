import { ScannerComponent } from "@/components/scanner";
import { useServerSetting } from "@/context/server-setting";
import { motion } from "motion/react";

export default function MainPage() {
  const { canVote } = useServerSetting();

  if (!canVote)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-6">
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0.4, y: -20 }}
          transition={{
            duration: 0.3,
          }}
          className="scroll-m-20 border-b font-mono text-4xl font-extrabold tracking-tight text-red-600 drop-shadow-2xl lg:text-5xl"
        >
          Belum Bisa Memilih!
        </motion.h1>
      </div>
    );

  return <ScannerComponent />;
}
