import { useSetting } from "@/context/SettingContext";

import Scanner from "@/components/Scanner";
import { Loading, CantVote, InvalidCandidate } from "@/components/PreScan";

const Main = () => {
  const { isLoading, isCandidatesExist, canVoteNow } = useSetting();

  return <></>

  if (isLoading) return <Loading />;

  if (!isLoading && !canVoteNow) return <CantVote />;

  if (!isLoading && canVoteNow && !isCandidatesExist)
    return <InvalidCandidate />;

  if (!isLoading && canVoteNow && isCandidatesExist) return <Scanner />;
};

export default Main;
