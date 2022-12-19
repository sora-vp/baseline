import { useSetting } from "@/context/SettingContext";

import Scanner from "@/components/Scanner";
import { ErrorOcurred, Loading, CantVote, InvalidCandidate } from "@/components/PreScan";

const Main: React.FC = () => {
  const { isLoading, isError, isCandidatesExist, canVoteNow } = useSetting();

  if (isError) return <ErrorOcurred />;

  if (isLoading && !isError) return <Loading />;

  if (!isLoading && !canVoteNow && !isError) return <CantVote />;

  if (!isLoading && canVoteNow && !isCandidatesExist && !isError)
    return <InvalidCandidate />;

  if (!isLoading && canVoteNow && isCandidatesExist && !isError)
    return <Scanner />;

  // Fallback
  return <>ERR:INVALID_ELEMENT</>;
};

export default Main;
