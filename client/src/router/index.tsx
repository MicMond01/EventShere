import { createBrowserRouter } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Auth pages
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";

// Public pages
import { LandingPage } from "@/features/public/pages/LandingPage";
import { VenueSearchPage } from "@/features/public/pages/VenueSearchPage";
import { VenueProfilePage } from "@/features/public/pages/VenueProfilePage";
import { EventDiscoveryPage } from "@/features/public/pages/EventDiscoveryPage";
import { EventPublicPage } from "@/features/public/pages/EventPublicPage";
import { PricingPage } from "@/features/public/pages/PricingPage";
import { AboutPage } from "@/features/public/pages/AboutPage";

// Planner pages
import { PlannerDashboardPage } from "@/features/planner/pages/PlannerDashboardPage";
import { CreateEventPage } from "@/features/planner/pages/CreateEventPage";
import { EventDetailPage } from "@/features/planner/pages/EventDetailPage";
import { GuestManagementPage } from "@/features/planner/pages/GuestManagementPage";
import { VendorManagementPage } from "@/features/planner/pages/VendorManagementPage";
import { RunsheetPage } from "@/features/planner/pages/RunsheetPage";
import { InvitationDesignerPage } from "@/features/planner/pages/InvitationDesignerPage";
import { EventSettingsPage } from "@/features/planner/pages/EventSettingsPage";

// Venue Owner pages
import { VenueDashboardPage } from "@/features/venue/pages/VenueDashboardPage";
import { VenueListingPage } from "@/features/venue/pages/VenueListingPage";
import { CreateVenuePage } from "@/features/venue/pages/CreateVenuePage";
import { EditVenuePage } from "@/features/venue/pages/EditVenuePage";
import { BookingManagementPage } from "@/features/venue/pages/BookingManagementPage";
import { VenueAnalyticsPage } from "@/features/venue/pages/VenueAnalyticsPage";

// Guest pages
import { GuestDashboardPage } from "@/features/guest/pages/GuestDashboardPage";
import { MyEventsPage } from "@/features/guest/pages/MyEventsPage";
import { GuestProfilePage } from "@/features/guest/pages/GuestProfilePage";
import { SeatFinderPage } from "@/features/guest/pages/SeatFinderPage";
import { RatingPage } from "@/features/guest/pages/RatingPage";
import { EventRegistrationPage } from "@/features/guest/pages/EventRegistrationPage";

// Admin pages
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { UserManagementPage } from "@/features/admin/pages/UserManagementPage";
import { VenueApprovalPage } from "@/features/admin/pages/VenueApprovalPage";
import { EventModerationPage } from "@/features/admin/pages/EventModerationPage";
import { RatingModerationPage } from "@/features/admin/pages/RatingModerationPage";
import { FinancialOverviewPage } from "@/features/admin/pages/FinancialOverviewPage";
import { SystemHealthPage } from "@/features/admin/pages/SystemHealthPage";
import { KYCReviewPage } from "@/features/admin/pages/KYCReviewPage";

// Layout Planner pages
import { LayoutEditorPage } from "@/features/layout-planner/pages/LayoutEditorPage";
import { LayoutPreviewPage } from "@/features/layout-planner/pages/LayoutPreviewPage";

// Route guard
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  /* ── Public routes ── */
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/venues", element: <VenueSearchPage /> },
      { path: "/venues/:id", element: <VenueProfilePage /> },
      { path: "/events", element: <EventDiscoveryPage /> },
      { path: "/events/:slug", element: <EventPublicPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/about", element: <AboutPage /> },
    ],
  },

  /* ── Auth routes ── */
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/verify-email/:token", element: <VerifyEmailPage /> },
    ],
  },

  /* ── Planner routes ── */
  {
    element: (
      <ProtectedRoute allowedRoles={["planner"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/planner/dashboard", element: <PlannerDashboardPage /> },
      { path: "/planner/events/create", element: <CreateEventPage /> },
      { path: "/planner/events/:id", element: <EventDetailPage /> },
      { path: "/planner/events/:id/guests", element: <GuestManagementPage /> },
      {
        path: "/planner/events/:id/vendors",
        element: <VendorManagementPage />,
      },
      { path: "/planner/events/:id/runsheet", element: <RunsheetPage /> },
      {
        path: "/planner/events/:id/invitations",
        element: <InvitationDesignerPage />,
      },
      {
        path: "/planner/events/:id/settings",
        element: <EventSettingsPage />,
      },
    ],
  },

  /* ── Layout Planner (full-screen, no dashboard shell) ── */
  {
    element: (
      <ProtectedRoute allowedRoles={["planner"]}>
        <LayoutEditorPage />
      </ProtectedRoute>
    ),
    path: "/planner/events/:id/layout",
  },
  {
    element: (
      <ProtectedRoute allowedRoles={["planner"]}>
        <LayoutPreviewPage />
      </ProtectedRoute>
    ),
    path: "/planner/events/:id/layout/preview",
  },

  /* ── Venue Owner routes ── */
  {
    element: (
      <ProtectedRoute allowedRoles={["venue_owner"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/venue-owner/dashboard", element: <VenueDashboardPage /> },
      { path: "/venue-owner/venues", element: <VenueListingPage /> },
      { path: "/venue-owner/venues/create", element: <CreateVenuePage /> },
      { path: "/venue-owner/venues/:id/edit", element: <EditVenuePage /> },
      { path: "/venue-owner/bookings", element: <BookingManagementPage /> },
      { path: "/venue-owner/analytics", element: <VenueAnalyticsPage /> },
    ],
  },

  /* ── Guest routes ── */
  {
    element: (
      <ProtectedRoute allowedRoles={["guest"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/guest/dashboard", element: <GuestDashboardPage /> },
      { path: "/guest/events", element: <MyEventsPage /> },
      { path: "/guest/profile", element: <GuestProfilePage /> },
      { path: "/guest/events/:eventId/seat", element: <SeatFinderPage /> },
      { path: "/guest/events/:eventId/rate", element: <RatingPage /> },
      {
        path: "/guest/events/:eventId/register",
        element: <EventRegistrationPage />,
      },
    ],
  },

  /* ── Admin routes ── */
  {
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/admin/dashboard", element: <AdminDashboardPage /> },
      { path: "/admin/users", element: <UserManagementPage /> },
      { path: "/admin/venues/approval", element: <VenueApprovalPage /> },
      { path: "/admin/events", element: <EventModerationPage /> },
      { path: "/admin/ratings", element: <RatingModerationPage /> },
      { path: "/admin/financials", element: <FinancialOverviewPage /> },
      { path: "/admin/system", element: <SystemHealthPage /> },
      { path: "/admin/kyc", element: <KYCReviewPage /> },
    ],
  },
]);
