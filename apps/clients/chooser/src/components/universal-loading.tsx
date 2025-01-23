import { Loader } from "lucide-react";
import { motion } from "motion/react";

export function UniversalLoading(props: {
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: "-250px" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-250px" }}
      className="flex h-screen w-screen flex-col items-center justify-center"
    >
      <Loader
        size={78}
        strokeWidth={1.5}
        className="animate-pulse animate-spin"
      />

      <div>
        <h3 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
          {props.title}
        </h3>
        <p className="text-xl font-light leading-7">{props.description}</p>
      </div>
    </motion.div>
  );
}
