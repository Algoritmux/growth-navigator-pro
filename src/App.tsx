import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BlogAdminPage from "./pages/BlogAdminPage";
import ServicesPage from "./pages/ServicesPage";
import NotFound from "./pages/NotFound";
import Biblioteca from "./pages/Biblioteca";
import BibliotecaAdminPage from "./pages/BibliotecaAdminPage";
import AdminPage from "./pages/AdminPage";
import MaterialPage from "./pages/MaterialPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />

        {/* Blog */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog"
          element={
            <ProtectedRoute>
              <BlogAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Serviços */}
        <Route path="/servicos" element={<ServicesPage />} />

        {/* Biblioteca */}
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route
          path="/admin/biblioteca"
          element={
            <ProtectedRoute>
              <BibliotecaAdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/biblioteca/:slug" element={<MaterialPage />} />

        {/* 404 (sempre por último) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}