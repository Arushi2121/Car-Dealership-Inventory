import { Route, Routes } from 'react-router';
import { GuestOnly, LoginPage, RegisterPage, RequireAuth } from '../features/auth';
import { LandingPage } from '../features/landing';
import { SiteHeader } from './layouts/SiteHeader';
import { NotFoundPage } from './NotFoundPage';
import { ShowroomPlaceholder } from './ShowroomPlaceholder';
import { SlowStartBanner } from './SlowStartBanner';
import { StyleguidePage } from './StyleguidePage';

export function App() {
  return (
    <>
      <SlowStartBanner />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SiteHeader transparent />
              <LandingPage />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route
          path="/showroom"
          element={
            <RequireAuth>
              <ShowroomPlaceholder />
            </RequireAuth>
          }
        />
        {import.meta.env.DEV && <Route path="/styleguide" element={<StyleguidePage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
