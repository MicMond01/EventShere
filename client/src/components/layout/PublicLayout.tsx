import { Link, Outlet } from "react-router-dom";
import { ROUTE_PATHS } from "@/router/routePaths";

/**
 * Layout for public-facing pages (landing, venue search, pricing, etc.).
 * Includes a top navbar and footer.
 */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link
            to={ROUTE_PATHS.HOME}
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Event<span className="text-indigo-600">Shere</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              to={ROUTE_PATHS.VENUES}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Venues
            </Link>
            <Link
              to={ROUTE_PATHS.EVENTS}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Events
            </Link>
            <Link
              to={ROUTE_PATHS.PRICING}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Log in
            </Link>
            <Link
              to={ROUTE_PATHS.REGISTER}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} EventShere. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
