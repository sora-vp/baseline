// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { electronAPI } from "@electron-toolkit/preload";
import { create } from "zustand";

type Props = Pick<typeof electronAPI, "ipcRenderer">;

interface DesktopSettingsState {
  trpcLink: null | string;
  updateLink: (link: string, electronAPI: Props) => void;
}

export const useStore = create<DesktopSettingsState>()((set) => ({
  trpcLink: null,
  updateLink: async (link, electron) => {
    const serverURL = new URL(url);

    await electron.ipcRenderer.invoke("set-server-url", serverURL.origin);

    set(() => ({ trpcLink: link }));
  },
}));
