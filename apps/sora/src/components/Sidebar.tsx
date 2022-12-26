import { SidebarWrapper } from "ui";

import { FiHome, FiUser, FiTrendingUp, FiSettings } from "react-icons/fi";

const Sidebar = SidebarWrapper([
  { name: "Dashboard", icon: FiHome, href: "/" },
  { name: "Paslon", icon: FiUser, href: "/paslon" },
  { name: "Statistik", icon: FiTrendingUp, href: "/statistik" },
  { name: "Pengaturan", icon: FiSettings, href: "/pengaturan" },
]);

export default Sidebar;
