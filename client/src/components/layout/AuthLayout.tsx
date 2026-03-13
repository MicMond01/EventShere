import { Outlet } from "react-router-dom";

/**
 * Layout for authentication pages (login, register, forgot password).
 * Centered card on a themed background.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Event<span className="text-indigo-600">Shere</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Plan Smarter. Connect Better. Experience More.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
