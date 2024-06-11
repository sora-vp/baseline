import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sora-vp/ui/card";

import { Behaviour } from "~/app/_components/settings/behaviour";
import { Duration } from "~/app/_components/settings/duration";

export default function SettingsPage() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Perilaku Pemilihan</CardTitle>
          <CardDescription>
            Atur perilaku pemilihan dengan mengubah switch di bawah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Behaviour />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Waktu Pemilihan</CardTitle>
          <CardDescription>
            Tetapkan kapan lama durasi pemilihan ini berlangsung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Duration />
        </CardContent>
      </Card>
    </div>
  );
}