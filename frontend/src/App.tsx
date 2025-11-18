// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './api/services/auth.service';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CarteraPage from './pages/CarteraPage';
import TiendaPage from './pages/TiendaPage';
import TareasPage from './pages/TareasPage';
import MensajesPage from './pages/MensajesPage';
import CalendarioPage from './pages/CalendarioPage';
import FinanzasPage from './pages/FinanzasPage';
import NominaPage from './pages/NominaPage';

// Componente de ruta protegida
interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cartera"
          element={
            <PrivateRoute>
              <CarteraPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tienda"
          element={
            <PrivateRoute>
              <TiendaPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tareas"
          element={
            <PrivateRoute>
              <TareasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mensajes"
          element={
            <PrivateRoute>
              <MensajesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendario"
          element={
            <PrivateRoute>
              <CalendarioPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/finanzas"
          element={
            <PrivateRoute>
              <FinanzasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/nomina"
          element={
            <PrivateRoute>
              <NominaPage />
            </PrivateRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
