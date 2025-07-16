// components/AdminSidebar.js
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Star,
  Bell,
  Settings,
  Wallet,
  FileText,
} from "lucide-react";

export default function AdminSidebar() {
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Applicants", path: "/admin/applicants", icon: ClipboardList },
    { name: "Candidates", path: "/admin/candidates", icon: Star },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    { name: "Transactions", path: "/admin/transactions", icon: FileText },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 hidden md:block">
      <nav className="space-y-2">
        {navItems.map(({ name, path, icon: Icon }) => (
          <Link
            key={path}
            href={path}
            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-rose-100 hover:text-rose-600 ${
              router.pathname === path
                ? "bg-rose-100 text-rose-600"
                : "text-gray-700"
            }`}
          >
            <Icon size={18} />
            {name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
