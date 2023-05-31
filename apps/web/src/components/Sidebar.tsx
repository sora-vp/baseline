import {
  FiHome,
  FiSettings,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { SidebarWrapper } from "ui";

const Sidebar = SidebarWrapper([
  { name: "Beranda", icon: FiHome, href: "/" },
  { name: "Kandidat", icon: FiUser, href: "/kandidat" },
  { name: "Partisipan", icon: FiUsers, href: "/peserta" },
  { name: "Statistik", icon: FiTrendingUp, href: "/statistik" },
  { name: "Pengaturan", icon: FiSettings, href: "/pengaturan" },
]);

export default Sidebar;
