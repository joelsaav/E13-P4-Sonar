import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/public/landingPage";
import LoginPage from "@/pages/public/loginPage";
import RegisterPage from "@/pages/public/registerPage";
import DashboardPage from "@/pages/authenticated/dashboardPage";
import SettingsPage from "@/pages/authenticated/settingsPage";
import TasksPage from "@/pages/authenticated/tasksPage";
import SharedPage from "@/pages/authenticated/sharedPage";
import ContactsPage from "@/pages/public/contactsPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/layout/Footer";
import AppMenubar from "@/components/layout/AppMenubar";
import { useSocket } from "@/hooks/useSocket";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChatWithSuggestions } from "@/components/chat/ChatWithSuggestions";
import { Button } from "@/components/ui/button";

export default function App() {
  useSocket();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [openChat, setOpenChat] = useState(false);

  const publicRoute = (Page: React.ComponentType) =>
    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Page />;

  const protectedRoute = (Page: React.ComponentType) => (
    <ProtectedRoute>
      <Page />
    </ProtectedRoute>
  );

  return (
    <div className="flex min-h-screen flex-col px-4 sm:px-6 md:px-8">
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

      <Button
        onClick={() => setOpenChat(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full text-3xl shadow-lg p-4"
        aria-label="Abrir chat bot"
        leftIcon="IconMessageChatbotFilled"
        size="icon-xl"
      />

      <Sheet open={openChat} onOpenChange={setOpenChat}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col h-full p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{t("chat.title")}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
            <ChatWithSuggestions />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
