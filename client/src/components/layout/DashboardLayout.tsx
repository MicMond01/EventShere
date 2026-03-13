import { Link, Outlet, useLocation } from "react-router-dom";
import { useSidebarStore } from "@/store/useSidebarStore";
import { cn } from "@/lib/cn";

/**
 * Authenticated dashboard layout with sidebar and top bar.
 * Used by Planner, Venue Owner, Guest, and Admin dashboards.
 */
export function DashboardLayout() {
  const { isCollapsed } = useSidebarStore();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="text-lg font-bold text-gray-900 dark:text-white">
            {isCollapsed ? "E" : "EventShere"}
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {/* Sidebar navigation items will be injected per role */}
          <p className="text-xs text-gray-400">
            {isCollapsed ? "" : "Navigation will render here"}
          </p>
        </nav>
      </aside>

      {/* ── Main area ── */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {location.pathname}
          </div>
          <div className="flex items-center gap-4">
            {/* Notification bell, user avatar etc. will go here */}
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
