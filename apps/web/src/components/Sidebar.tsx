import {
  FiHome,
  FiSettings,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { SidebarWrapper } from "@sora/ui";

export default SidebarWrapper([
  { name: "Beranda", icon: FiHome, href: "/" },
  { name: "Kandidat", icon: FiUser, href: "/kandidat" },
  { name: "Partisipan", icon: FiUsers, href: "/peserta" },
  { name: "Statistik", icon: FiTrendingUp, href: "/statistik" },
  { name: "Pengaturan", icon: FiSettings, href: "/pengaturan" },
]);
