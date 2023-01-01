import { useSetting } from "@/context/SettingContext";

import Loading from "@/components/PreScan/Loading";

import ErrorOcurred from "@/components/PreScan/ErrorOccured";
import CantAttend from "@/components/PreScan/CantAttend";

import Scanner from "@/components/Scanner";

const Main: React.FC = () => {
  const { isLoading, isError, canAttend } = useSetting();

  if (isError) return <ErrorOcurred />;

  if (isLoading && !isError) return <Loading />;

  if (!isLoading && !canAttend && !isError) return <CantAttend />;

  return <Scanner />;
};

export default Main;
