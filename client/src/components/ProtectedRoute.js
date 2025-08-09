import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) {
    return <div className="text-center py-20">Loading...</div>; // Or a spinner component
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    // If a non-admin user tries to access an admin route, redirect them away.
    return <Navigate to="/products" replace />;
  }

  return children;
};

// Make sure this line is at the bottom of the file!
export default ProtectedRoute;
