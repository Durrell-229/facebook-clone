import React, { ElementType, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LOGIN } from './routes';

interface IProps {
  layout: ElementType;
}

const PrivateRoute: React.FC<PropsWithChildren<IProps>> = (props) => {
  const { children, layout: Layout } = props;
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1220]">
        <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
      </div>
    );
  }

  const isAuthenticated = !!user;

  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate
      to={{
        pathname: LOGIN,
        search:
          pathname && pathname !== '/' ? `?redirect=${pathname}` : undefined,
      }}
    />
  );
};

export { PrivateRoute };
