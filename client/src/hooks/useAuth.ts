import { useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

/** Typed useDispatch hook */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Typed useSelector hook */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Convenience hook for common auth checks */
export function useAuth() {
  const { user, isAuthenticated, accessToken } = useAppSelector(
    (state) => state.auth
  );

  return {
    user,
    isAuthenticated,
    accessToken,
  };
}
