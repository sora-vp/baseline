import { useCallback, useEffect, useMemo, useState } from "react";
import { UniversalError } from "@/components/universal-error";
import { ensureQRIDExist, useParticipant } from "@/context/participant-context";
import { env } from "@/env";
import { api } from "@/utils/api";
import { successTimeoutAtom } from "@/utils/atom";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";

import { cn } from "@sora-vp/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@sora-vp/ui/alert-dialog";
import { Button } from "@sora-vp/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sora-vp/ui/card";
import { Skeleton } from "@sora-vp/ui/skeleton";

const CurrentParticipantInfo = (props: { isSuccess?: boolean }) => {
  const { name, subpart, qrId } = useParticipant();

  return (
    <>
      <div className="absolute left-4 top-4 select-none">
        {name ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "text-lg font-medium leading-none",
              props.isSuccess && "text-stone-200",
            )}
          >
            {name}
          </motion.p>
        ) : null}
        {subpart ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: 0.2,
            }}
            className={cn(
              "text-sm leading-none",
              props.isSuccess ? "text-stone-50/80" : "text-muted-foreground",
            )}
          >
            {subpart}
          </motion.p>
        ) : null}
      </div>
      <div className="absolute right-4 top-4">
        {qrId ? (
          <motion.small
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
            }}
            className={cn(
              "select-none font-mono",
              props.isSuccess && "text-stone-200",
            )}
          >
            {qrId}
          </motion.small>
        ) : null}
      </div>
    </>
  );
};

function VotePage() {
  const { qrId, setQRCode, setVotedSuccessfully } = useParticipant();

  const successTimeout = useAtomValue(successTimeoutAtom);

  const [errorMessage, setErrorMessage] = useState("");

  // Untuk keperluan pemilihan
  const [alertOpen, setAlertOpen] = useState(false);
  const [currentID, setID] = useState<number | null>(null);

  const candidateList = api.clientConsumer.getCandidates.useQuery();
  const upvoteCandidate = api.clientConsumer.upvote.useMutation({
    onSuccess() {
      setVotedSuccessfully(true);

      setTimeout(() => {
        setQRCode(null);

        setVotedSuccessfully(false);
      }, successTimeout);
    },
    onError() {
      setAlertOpen(false);
      setID(null);
    },
  });

  const candidateName = useMemo(
    () =>
      currentID
        ? candidateList.data?.find((c) => c.id === currentID)?.name
        : "N/A",
    [currentID, candidateList.data],
  );

  const chooseCandidate = useCallback(() => {
    if (qrId && currentID) {
      upvoteCandidate.mutate({
        id: currentID,
        qrId,
      });
    }
  }, [currentID, qrId]);

  useEffect(() => {
    if (candidateList.error) setErrorMessage(candidateList.error.message);
  }, [candidateList.error]);

  if (upvoteCandidate.isSuccess)
    return (
      <>
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-green-600 p-6">
          <div className="w-[80%] text-center">
            <motion.h1
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{
                duration: 0.3,
              }}
              className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-100 lg:text-5xl"
            >
              Data berhasil terekam!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{
                duration: 0.3,
                delay: 0.2,
              }}
              className="text-center text-xl leading-7 text-red-100/90 [&:not(:first-child)]:mt-4"
            >
              Silahkan keluar dari bilik suara dan melakukan cap jari.
            </motion.p>
          </div>
        </div>
        <CurrentParticipantInfo isSuccess />
      </>
    );

  if (upvoteCandidate.isError)
    return (
      <>
        <UniversalError
          title="Gagal Melakukan Pemilihan"
          description={upvoteCandidate.error.message}
        />
        <CurrentParticipantInfo />
      </>
    );

  if (candidateList.errorUpdateCount > 0)
    return (
      <>
        <UniversalError
          title="Gagal Mengambil Data Kandidat"
          description="Perangkat yang anda gunakan mengalami masalah. Mohon informasikan panitia terkait dan coba lagi."
          errorMessage={errorMessage}
        />
        <CurrentParticipantInfo />
      </>
    );

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center gap-10 pt-14">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Pilih Kandidat Anda.
        </h1>

        {candidateList.isLoading ? (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[55vh] w-60 bg-stone-700" />
            ))}
          </div>
        ) : (
          <>
            {candidateList.data && candidateList.data?.length < 2 ? (
              <div className="flex h-full -translate-y-16 flex-col items-center justify-center">
                <motion.h1
                  initial={{ opacity: 0, y: -25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="scroll-m-20 font-mono text-4xl font-extrabold tracking-tight text-red-600 lg:text-5xl"
                >
                  Belum Ada Kandidat
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: -25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -25 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                  }}
                  className="text-center text-xl leading-7 [&:not(:first-child)]:mt-6"
                >
                  Mohon informasikan administrator untuk menambahkan data
                  kandidat supaya anda dan yang lain bisa memilih.
                </motion.p>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-3",
                  `grid-cols-${candidateList.data?.length ?? 5}`,
                )}
              >
                {candidateList.data?.map((candidate, idx) => (
                  <Card className="w-60" key={candidate.id}>
                    <CardHeader className="min-h-60 border-b p-0">
                      <img
                        className="rounded-l-xl rounded-r-xl"
                        src={`${env.VITE_IMAGE_RETRIEVER ?? "/uploads"}/${candidate.image}`}
                      />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3 p-6">
                      <CardTitle className="w-[85%] text-center text-3xl">
                        Kandidat Nomor {idx + 1}
                      </CardTitle>
                      <CardDescription className="text-center text-lg text-stone-950">
                        {candidate.name}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="p-0 px-4 pb-4">
                      <Button
                        className="w-full bg-green-600 text-lg hover:bg-green-700 hover:text-green-50/90"
                        onClick={() => {
                          setID(candidate.id);
                          setAlertOpen(true);
                        }}
                      >
                        Pilih
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog
        open={alertOpen || (upvoteCandidate.isPending && !!qrId)}
        onOpenChange={() => setAlertOpen((prev) => !prev)}
      >
        <AlertDialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-4xl gap-7"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl">
              Sebelum anda melanjutkan...
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xl text-stone-950">
              Apakah anda yakin memilih kandidat atas nama{" "}
              <b>{candidateName}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="w-1/2 bg-red-600 p-4 text-lg text-red-50/95 hover:bg-red-700 hover:text-red-50/90"
              disabled={upvoteCandidate.isPending}
              onClick={() => setID(null)}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="w-1/2 bg-green-600 p-4 text-lg hover:bg-green-700 hover:text-green-50/90"
              disabled={upvoteCandidate.isPending}
              onClick={chooseCandidate}
            >
              {upvoteCandidate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CurrentParticipantInfo />
    </>
  );
}

export default ensureQRIDExist(VotePage);
