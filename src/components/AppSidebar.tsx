import {
    BarChart,
    FileText,
    Home,
    Leaf,
    Settings,
    Target,
    Trophy,
    Users
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: Home, color: "text-blue-500" },
  { title: "Emissions Input", url: "/emissions", icon: BarChart, color: "text-red-500" },
  { title: "Carbon Sink", url: "/carbon-sink", icon: Leaf, color: "text-green-500" },
  { title: "Strategy", url: "/strategy", icon: Target, color: "text-purple-500" },
  { title: "Reports", url: "/reports", icon: FileText, color: "text-orange-500" },
  { title: "Admin Panel", url: "/admin", icon: Users, color: "text-gray-500" },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy, color: "text-yellow-500" },
  { title: "Settings", url: "/settings", icon: Settings, color: "text-gray-600" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} carbon-neutral-bg text-white border-r-0 shadow-xl`}
      collapsible="icon"
    >
      <SidebarContent className="bg-transparent">
        <div className="p-4 border-b border-green-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl sustainability-gradient flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🌱</span>
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full sustainability-gradient flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NC</span>
                  </div>
                  <h2 className="font-bold text-lg">NextCoal Initiative</h2>
                </div>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-green-200 px-4 text-xs uppercase tracking-wider">
            {!collapsed && "Main Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 group animate-slide-left ${
                          isActive 
                            ? "bg-white/20 text-white font-medium shadow-lg backdrop-blur-sm" 
                            : "hover:bg-white/10 text-green-100 hover:text-white"
                        }`
                      }
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-white' : item.color} transition-colors`} />
                      {!collapsed && (
                        <span className="transition-all duration-200 group-hover:translate-x-1">
                          {item.title}
                        </span>
                      )}
                      {!collapsed && isActive(item.url) && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse-green"></div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 border-t border-green-700/30 animate-fade-in">
            <div className="text-xs text-green-200 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-green"></div>
                <span>System Status: Online</span>
              </div>
              <p className="leading-relaxed">Made for Indian Coal Mines</p>
              <p className="text-green-300 font-medium">Carbon Neutrality Mission 2070</p>
              <div className="mt-3 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-xs">
                  <div className="flex justify-between">
                    <span>CO₂ Tracked:</span>
                    <span className="text-green-300">24.5k tonnes</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Offset:</span>
                    <span className="text-green-300">8.2k tonnes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}