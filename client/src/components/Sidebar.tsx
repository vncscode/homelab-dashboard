import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Server,
  Download,
  Activity,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";

/**
 * Sidebar navigation component
 */
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [location] = useLocation();
  const { logout } = useAuth();

  const navigationItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      description: "Resumo geral",
    },
    {
      label: "Jexactyl",
      href: "/jexactyl",
      icon: Server,
      description: "Gerenciamento de servidores",
    },
    {
      label: "qBittorrent",
      href: "/qbittorrent",
      icon: Download,
      description: "Gerenciamento de torrents",
    },
    {
      label: "Glances",
      href: "/glances",
      icon: Activity,
      description: "Monitoramento de recursos",
    },
    {
      label: "Análise",
      href: "/analytics",
      icon: BarChart3,
      description: "Gráficos históricos",
    },
    {
      label: "Alertas",
      href: "/alerts",
      icon: Bell,
      description: "Configuração de alertas",
    },
    {
      label: "Configurações",
      href: "/settings",
      icon: Settings,
      description: "Configurações gerais",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transition-transform duration-300 z-40",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-accent">HomeLab</h1>
            <p className="text-xs text-muted-foreground mt-1">Control Center</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 rounded-lg transition-colors duration-200 block",
                    active
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                logout();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main content spacer */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
