import { ScannerComponent } from "@/components/scanner";
import { useServerSetting } from "@/context/server-setting";

export default function MainPage() {
  const { canAttend } = useServerSetting();

  if (!canAttend)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-5 p-6">
        <h1 className="scroll-m-20 border-b font-mono text-4xl font-extrabold tracking-tight text-red-600 drop-shadow-2xl lg:text-5xl">
          Belum Bisa Absen!
        </h1>
      </div>
    );

  return <ScannerComponent />;
}
