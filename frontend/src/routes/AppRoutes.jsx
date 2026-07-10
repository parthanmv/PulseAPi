import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Apis from '../pages/Apis';
import ApiDetails from '../pages/ApiDetails';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes - Without Dashboard Shell */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard Routes - With Sidebar Navigation and Top Header */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="apis" element={<Apis />} />
        <Route path="apis/:id" element={<ApiDetails />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Wildcard 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
