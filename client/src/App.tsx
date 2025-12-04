import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/public/landingPage";
import LoginPage from "@/pages/public/loginPage";
import RegisterPage from "@/pages/public/registerPage";
import DashboardPage from "@/pages/authenticated/dashboardPage";
import SettingsPage from "@/pages/authenticated/settingsPage";
import TasksPage from "@/pages/authenticated/tasksPage";
import SharedPage from "@/pages/authenticated/SharedPage";
import ContactsPage from "@/pages/public/contactsPage";
import ProtectedRoute from "@/components/auth/protectedRoute";
import Footer from "@/components/footer";
import AppMenubar from "@/components/appMenubar";

export default function App() {
  const { isAuthenticated } = useAuth();
  const publicRoute = (Page: React.ComponentType) =>
    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Page />;

  const protectedRoute = (Page: React.ComponentType) => (
    <ProtectedRoute>
      <Page />
    </ProtectedRoute>
  );

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-background via-background to-muted/30 px-4 sm:px-6 md:px-8">
      <AppMenubar />

      <main className="flex-1 w-full py-4 sm:py-8 md:py-10 mt-10 md:mt-16">
        <Routes>
          <Route path="/" element={publicRoute(LandingPage)} />
          <Route path="/login" element={publicRoute(LoginPage)} />
          <Route path="/register" element={publicRoute(RegisterPage)} />

          <Route path="/dashboard" element={protectedRoute(DashboardPage)} />
          <Route path="/tasks" element={protectedRoute(TasksPage)} />
          <Route path="/shared" element={protectedRoute(SharedPage)} />
          <Route path="/settings" element={protectedRoute(SettingsPage)} />

          <Route path="/contacts" element={<ContactsPage />} />

          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
