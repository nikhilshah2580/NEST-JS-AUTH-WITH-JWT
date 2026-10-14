import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import { ToastProvider } from "./components/ToastProvider";

function AppLayout() {
  const { status } = useAuth();

  return (
    <div className="min-h-screen min-w-0 bg-[#f6f7f3] font-['DM_Sans'] text-[#202820] antialiased selection:bg-[#dce8d6]">
      <div className="mx-auto flex min-h-screen w-[calc(100%-48px)] max-w-330 flex-col max-sm:w-[calc(100%-36px)]">
        <Navbar />
        <main
          className="flex flex-1 flex-col justify-center"
        >
          <Outlet />
        </main>
        <footer className="flex min-h-15.25 items-center justify-between border-t border-[#e4e8df] text-[11px] text-[#9ba196]">
          <span>&copy; 2026 Northstar</span>
          <span>
            Built for a fresh start{" "}
            <span className="ml-1 text-[#8da77d]">✳</span>
          </span>
        </footer>
        {status === "loading" && (
          <span className="sr-only" role="status">
            Restoring your session
          </span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signin" element={<SigninPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
