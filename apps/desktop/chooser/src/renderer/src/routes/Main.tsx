import CantVote from "@renderer/components/PreScan/CantVote";
import ErrorOcurred from "@renderer/components/PreScan/ErrorOccured";
import InvalidCandidate from "@renderer/components/PreScan/InvalidCandidate";
import Scanner from "@renderer/components/Scanner";
import { useSetting } from "@renderer/context/SettingContext";

import { Loading } from "@sora/ui/Loading";

const Main: React.FC = () => {
  const { isLoading, isError, isCandidatesExist, canVoteNow } = useSetting();

  if (isError) return <ErrorOcurred />;

  if (isLoading && !isError)
    return <Loading headingText="Mengambil data terbaru..." />;

  if (!isLoading && !canVoteNow && !isError) return <CantVote />;

  if (!isLoading && canVoteNow && !isCandidatesExist && !isError)
    return <InvalidCandidate />;

  return <Scanner />;
};

export default Main;
