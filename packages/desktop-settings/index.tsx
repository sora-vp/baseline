// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { electronAPI } from "@electron-toolkit/preload";
import { create } from "zustand";

type Props = Pick<typeof electronAPI, "ipcRenderer">;

interface DesktopSettingsState {
  trpcLink: null | string;
  updateLink: (link: string, ipcRenderer: Props) => void;
}

export const useStore = create<DesktopSettingsState>()((set) => ({
  trpcLink: null,
  updateLink: async (link, ipcRenderer) => {
    const serverURL = new URL(link);

    await ipcRenderer.invoke("set-server-url", serverURL.origin);

    set(() => ({ trpcLink: link }));
  },
}));
