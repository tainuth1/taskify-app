"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ListTodo,
  Calendar,
  Zap,
  Mail,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  Users,
  Network,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { signOutAsync } from "@/features/auth/authSlice";
import Image from "next/image";

const menuItems = [
  {
    id: "genderal",
    label: "General",
    items: [
      {
        id: "workspace",
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/workspace",
      },
      {
        id: "my-tasks",
        name: "My Tasks",
        icon: ListTodo,
        badge: 5,
        href: "/tasks",
      },
      {
        id: "invite",
        name: "Invitations",
        icon: Users,
        badge: 3,
        href: "/invitations",
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    items: [
      { id: "calendar", name: "Calendar", icon: Calendar, href: "/calendar" },
      { id: "projects", name: "Projects", icon: Network, badge: 7, href: "/projects" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    items: [
      {
        id: "notifications",
        name: "Notifications",
        icon: Bell,
        badge: 10,
        href: "/notifications",
      },
      { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
      { id: "log-out", name: "Log out", icon: LogOut, href: null },
    ],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  return (
    <>
      {isOpen && (
        <div className="w-72 fixed top-0 h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="w-full flex justify-center">
              <Image
                src={"/taskify-logo-light.png"}
                alt="Taskify"
                width={110}
                height={80}
                className="object-cover"
              />
            </div>
            {/* <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button> */}
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* General Section */}
            {menuItems.map((menu) => (
              <div key={menu.id} className="mb-8">
                <h3 className="text-xs font-normal tracking-widest text-gray-500 mb-1 uppercase">
                  {menu.label}
                </h3>
                <div className="space-y-[2px]">
                  {menu.items.length > 0 &&
                    menu.items.map((submenu) => {
                      const isActive =
                        submenu.href && pathname === submenu.href;
                      return submenu.href ? (
                        <Link
                          href={submenu.href}
                          key={submenu.id}
                          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all relative ${
                            isActive
                              ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              : "hover:bg-gray-50 text-gray-900"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-600 rounded-r-full" />
                          )}
                          <submenu.icon
                            className={`w-5 h-5 ${
                              isActive ? "text-blue-600" : "text-gray-600"
                            }`}
                          />
                          <span
                            className={`font-medium flex-1 text-sm ${
                              isActive ? "text-blue-700" : "text-gray-600"
                            }`}
                          >
                            {submenu.name}
                          </span>
                          {submenu.badge && (
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                isActive
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {submenu.badge}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div
                          key={submenu.id}
                          onClick={() =>
                            submenu.id === "log-out" && dispatch(signOutAsync())
                          }
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                        >
                          <submenu.icon className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-600 font-medium flex-1 text-sm">
                            {submenu.name}
                          </span>
                          {submenu.badge && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {submenu.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profile || ""} alt="User" />
                <AvatarFallback>
                  {user?.username?.charAt(0).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180 shrink-0" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
