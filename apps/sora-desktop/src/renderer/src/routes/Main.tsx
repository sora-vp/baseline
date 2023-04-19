import { useSetting } from "@renderer/context/SettingContext";

import Loading from "@renderer/components/Loading";

import ErrorOcurred from "@renderer/components/PreScan/ErrorOccured";
import CantVote from "@renderer/components/PreScan/CantVote";
import InvalidCandidate from "@renderer/components/PreScan/InvalidCandidate";

import Scanner from "@renderer/components/Scanner";

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
