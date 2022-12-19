import { lazy } from "react";
import { useSetting } from "@/context/SettingContext";

const ErrorOcurred = lazy(() => import("@/components/PreScan/ErrorOccured"));
const Loading = lazy(() => import("@/components/PreScan/Loading"));
const CantVote = lazy(() => import("@/components/PreScan/CantVote"));
const InvalidCandidate = lazy(
  () => import("@/components/PreScan/InvalidCandidate")
);

const Scanner = lazy(() => import("@/components/Scanner"));

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
