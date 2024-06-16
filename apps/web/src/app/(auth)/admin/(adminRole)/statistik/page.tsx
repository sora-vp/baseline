import Essential from "~/app/_components/statistic/essential";
import { Graphic } from "~/app/_components/statistic/graphic";

export default function StatisticPage() {
  return (
    <div className="h-screen space-y-3 md:h-max">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Essential />
      </div>
      <div className="w-full rounded-xl border p-6">
        <Graphic />
      </div>

      {/* for scrollable purpose */}
      <div className="sm:pb-62 pb-28" />
    </div>
  );
}
