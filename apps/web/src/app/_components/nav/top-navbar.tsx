"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

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
import { Avatar, AvatarFallback } from "@sora-vp/ui/avatar";
import { Button } from "@sora-vp/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sora-vp/ui/dropdown-menu";
import { toast } from "@sora-vp/ui/toast";

export interface Props {
  name: string;
  email: string;
  nameFallback: string;
}

export function TopNavbar({ name, email, nameFallback }: Props) {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative ml-auto h-8 w-8 rounded-full"
          >
            <Avatar>
              <AvatarFallback className="uppercase">
                {nameFallback}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link
                href={"/admin/profile"}
                className="w-full hover:cursor-pointer"
              >
                Profil Anda
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={"/about"} className="w-full hover:cursor-pointer">
                Tentang sora
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:cursor-pointer focus:text-red-700 dark:text-red-500 focus:dark:text-red-600"
            onClick={() => setLogoutDialogOpen(true)}
          >
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={() => {
          if (logoutLoading) return;

          setLogoutDialogOpen((prev) => !prev);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin Untuk Logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan keluar dari akun ini, anda bisa login kembali di halaman
              login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={logoutLoading}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                setLogoutLoading(true);

                void signOut({ redirect: false })
                  .then(() => {
                    toast.success("Berhasil logout!");
                    setLogoutLoading(false);
                    router.replace("/login");
                  })
                  .catch(() => {
                    toast.error("Gagal logout", {
                      description: "Mohon coba lagi nanti.",
                    });
                    setLogoutLoading(false);
                  });
              }}
              disabled={logoutLoading}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
