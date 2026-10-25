import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import LocationModal from '../location/LocationModal';
import AccessDeniedBanner from '../common/AccessDeniedBanner';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cine-900 text-slate-100 selection:bg-violet-600 selection:text-white relative">
      <Navbar />
      <AccessDeniedBanner />
      <main className="flex-1 w-full">{children || <Outlet />}</main>
      <Footer />
      <LocationModal />
    </div>
  );
};

export default AppLayout;
