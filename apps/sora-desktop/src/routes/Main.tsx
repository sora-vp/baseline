import { useSetting } from "@/context/SettingContext";

import Loading from "@/components/PreScan/Loading";

import ErrorOcurred from "@/components/PreScan/ErrorOccured";
import CantVote from "@/components/PreScan/CantVote";
import InvalidCandidate from "@/components/PreScan/InvalidCandidate";

import Scanner from "@/components/Scanner";

const Main: React.FC = () => {
  const { isLoading, isError, isCandidatesExist, canVoteNow } = useSetting();

  if (isError) return <ErrorOcurred />;

  if (isLoading && !isError) return <Loading />;

  if (!isLoading && !canVoteNow && !isError) return <CantVote />;

  if (!isLoading && canVoteNow && !isCandidatesExist && !isError)
    return <InvalidCandidate />;

  return <Scanner />;
};

export default Main;
