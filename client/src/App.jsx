import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import AccountSetup from './pages/AccountSetup';
import Settings from './pages/Settings';

// Helper Component: Protects routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Helper Component: Redirects authenticated users away from Login/Register
const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (token) {
    // Once logged in, user either goes to setup (if not completed)
    // or Settings (if completed) – we'll always send to /setup;
    // AccountSetup itself will redirect to /settings if profile exists.
    return <Navigate to="/setup" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes (only if NOT logged in) --- */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* --- Protected Routes --- */}
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <AccountSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Root → login, unknown → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
