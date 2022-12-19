import { Suspense, lazy } from "react";
import { useSetting } from "@/context/SettingContext";

import Loading from "@/components/PreScan/Loading";

const ErrorOcurred = lazy(() => import("@/components/PreScan/ErrorOccured"));
const CantVote = lazy(() => import("@/components/PreScan/CantVote"));
const InvalidCandidate = lazy(
  () => import("@/components/PreScan/InvalidCandidate")
);

const Scanner = lazy(() => import("@/components/Scanner"));

const Main: React.FC = () => {
  const { isLoading, isError, isCandidatesExist, canVoteNow } = useSetting();

  if (isError)
    return (
      <Suspense fallback={<Loading />}>
        <ErrorOcurred />
      </Suspense>
    );

  if (isLoading && !isError) return <Loading />;

  if (!isLoading && !canVoteNow && !isError)
    return (
      <Suspense fallback={<Loading />}>
        <CantVote />
      </Suspense>
    );

  if (!isLoading && canVoteNow && !isCandidatesExist && !isError)
    return (
      <Suspense fallback={<Loading />}>
        <InvalidCandidate />
      </Suspense>
    );

  if (!isLoading && canVoteNow && isCandidatesExist && !isError)
    return (
      <Suspense fallback={<Loading />}>
        <Scanner />
      </Suspense>
    );

  // Fallback
  return <>ERR:INVALID_ELEMENT</>;
};

export default Main;
