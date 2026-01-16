import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import Home from "./pages/Home";
import JexactylPage from "./pages/JexactylPage";
import QbittorrentPage from "./pages/QbittorrentPage";
import GlancesPage from "./pages/GlancesPage";
import AlertsConfig from "./pages/AlertsConfig";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Plugins from "./pages/Plugins";

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/jexactyl"} component={JexactylPage} />
            <Route path={"/qbittorrent"} component={QbittorrentPage} />
            <Route path={"/glances"} component={GlancesPage} />
            <Route path={"/alerts"} component={AlertsConfig} />
            <Route path={"/analytics"} component={Analytics} />
            <Route path={"/settings"} component={Settings} />
            <Route path={"/plugins"} component={Plugins} />
            <Route path={"/404"} component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
