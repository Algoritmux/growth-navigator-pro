import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import App from "./App";
import { captureAttribution, installClickTracking } from "./lib/analytics";
import "./index.css";

captureAttribution();
installClickTracking();

// O provedor do login do Google fica só na página /login (LoginPage.tsx),
// para o script do Google não carregar nas páginas públicas.
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
