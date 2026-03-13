import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "@/redux/store";
import { router } from "@/router";
import { useTheme } from "@/hooks/useTheme";

function ThemeSync() {
  useTheme();
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeSync />
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
          },
        }}
      />
    </Provider>
  );
}

export default App;
