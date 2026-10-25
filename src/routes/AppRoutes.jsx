import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';
import TheatreLayout from '../components/layout/TheatreLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import MoviesPage from '../pages/customer/MoviesPage';
import MovieDetailsPage from '../pages/customer/MovieDetailsPage';
import TheatresPage from '../pages/customer/TheatresPage';
import TheatreDetailsPage from '../pages/customer/TheatreDetailsPage';
import SeatBookingPage from '../pages/customer/SeatBookingPage';
import SnacksSelectionPage from '../pages/customer/SnacksSelectionPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import DemoPaymentPage from '../pages/customer/DemoPaymentPage';
import TicketPage from '../pages/customer/TicketPage';
import MyBookingsPage from '../pages/customer/MyBookingsPage';
import WatchlistPage from '../pages/customer/WatchlistPage';
import RewardsPage from '../pages/customer/RewardsPage';
import GroupBookingPage from '../pages/customer/GroupBookingPage';
import ProfilePage from '../pages/customer/ProfilePage';
import HelpPage from '../pages/customer/HelpPage';
import WatchMoviePage from '../pages/customer/WatchMoviePage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminMoviesPage from '../pages/admin/AdminMoviesPage';
import AdminTheatresPage from '../pages/admin/AdminTheatresPage';
import AdminShowsPage from '../pages/admin/AdminShowsPage';
import AdminCouponsPage from '../pages/admin/AdminCouponsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminTrailersPage from '../pages/admin/AdminTrailersPage';
import AdminSnacksPage from '../pages/admin/AdminSnacksPage';

// Theatre Pages
import TheatreDashboardPage from '../pages/theatre/TheatreDashboardPage';
import TicketScannerPage from '../pages/theatre/TicketScannerPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Pages under AppLayout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/:movieId" element={<MovieDetailsPage />} />
        <Route path="theatres" element={<TheatresPage />} />
        <Route path="theatres/:theatreId" element={<TheatreDetailsPage />} />
        <Route path="watch" element={<WatchMoviePage />} />
        <Route path="trailers" element={<WatchMoviePage />} />
        <Route path="help" element={<HelpPage />} />

        {/* Protected Customer Routes (Restricted: Admins cannot book tickets) */}
        <Route
          path="booking/:showId/seats"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <SeatBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking/:bookingId/snacks"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <SnacksSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout/:bookingId"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:bookingId"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <DemoPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ticket/:bookingId"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <TicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="watchlist"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="rewards"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <RewardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="group-booking"
          element={
            <ProtectedRoute
              allowedRoles={['user']}
              forbiddenMessage="Admins are not allowed to book movie tickets. Please use a customer account."
            >
              <GroupBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Standalone Routes (Primary and common route aliases) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/theatre/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin Portal Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={['admin']}
            forbiddenMessage="Access denied. Administrator privileges are required to access management pages."
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="theatres" element={<AdminTheatresPage />} />
        <Route path="shows" element={<AdminShowsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="trailers" element={<AdminTrailersPage />} />
        <Route path="snacks" element={<AdminSnacksPage />} />
      </Route>

      {/* Theatre Partner Protected Routes */}
      <Route
        path="/theatre"
        element={
          <ProtectedRoute allowedRoles={['theatre', 'admin']}>
            <TheatreLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/theatre/dashboard" replace />} />
        <Route path="dashboard" element={<TheatreDashboardPage />} />
        <Route path="verify-ticket" element={<TicketScannerPage />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
