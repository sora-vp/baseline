import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

import { Button } from "@sora-vp/ui/button";

export function UniversalError(props: {
  title: string;
  description: string;
  errorMessage?: string;
}) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-6">
      <div className="w-[80%] text-center">
        <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{
            duration: 0.3,
          }}
          className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-600 lg:text-5xl"
        >
          {props.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{
            duration: 0.3,
            delay: 0.2,
          }}
          className="text-center text-xl leading-7 [&:not(:first-child)]:mt-6"
        >
          {props.description}
        </motion.p>
      </div>

      {props.errorMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{
            duration: 0.3,
            delay: 0.4,
          }}
          className="flex flex-col items-center"
        >
          <p>Pesan Error:</p>
          <pre className="w-full border p-2 font-mono">{}</pre>
        </motion.div>
      ) : null}

      <Button onDoubleClick={() => location.reload()}>
        <motion.div
          initial={{ rotate: -95 }}
          animate={{ rotate: 0 }}
          transition={{
            type: "spring",
            delay: 0.7,
          }}
          className="mr-2"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.div>
        Muat Ulang
      </Button>
    </div>
  );
}
