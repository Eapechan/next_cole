import ContextConnector from "@/components/ContextConnector";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Admin from "./pages/Admin";
import CarbonSink from "./pages/CarbonSink";
import Dashboard from "./pages/Dashboard";
import EmissionInput from "./pages/EmissionInput";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Strategy from "./pages/Strategy";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
      <Route path="/" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <Dashboard />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/emissions" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <EmissionInput />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/carbon-sink" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <CarbonSink />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/strategy" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <Strategy />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <Reports />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <Admin />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <Leaderboard />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SidebarProvider>
            <Layout>
              <Settings />
            </Layout>
          </SidebarProvider>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <ContextConnector />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
