import Essential from "~/app/_components/statistic/essential";

export default function StatisticPage() {
  return (
    <div className="h-screen md:h-max">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Essential />
      </div>
    </div>
  );
}
