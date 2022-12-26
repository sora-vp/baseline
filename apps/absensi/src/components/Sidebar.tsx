import { SidebarWrapper } from "ui";

import { FiHome, FiUser, FiSettings } from "react-icons/fi";

const Sidebar = SidebarWrapper([
  { name: "Dashboard", icon: FiHome, href: "/" },
  { name: "Peserta Pemilih", icon: FiUser, href: "/peserta" },
  { name: "Pengaturan", icon: FiSettings, href: "/pengaturan" },
]);

export default Sidebar;
