import React from 'react';
import { Route, Routes } from 'react-router-dom';
import GamingPageLayout from '../components/layouts/GamingPageLayout';
import GroupPageLayout from '../components/layouts/GroupPageLayout';
import MarketplacePageLayout from '../components/layouts/MarketplacePageLayout';
import NewsFeedLayout from '../components/layouts/NewsFeedLayout';
import ProfilePageLayout from '../components/layouts/ProfilePageLayout';
import ReelPageLayout from '../components/layouts/ReelPageLayout';
import StoriesLayout from '../components/layouts/StoriesLayout';
import GamingPage from '../pages/gaming';
import GroupPage from '../pages/group';
import LandingPage from '../pages/landing';
import LoginPage from '../pages/login';
import MarketplacePage from '../pages/marketplace';
import NewsFeedPage from '../pages/newsfeed';
import PageNotFound from '../pages/notfound';
import ProfilePage from '../pages/profile';
import RegisterPage from '../pages/signup';
import ReelPage from '../pages/reel';
import StoriesPage from '../pages/stories';
import { PrivateRoute } from './PrivateRoute';
import {
  CHALLENGES,
  COMMUNITIES,
  FEED,
  JOBS,
  LANDING,
  LOGIN,
  NEWS,
  PROFILE,
  REGISTER,
  SHORTS,
} from './routes';

const Routers: React.FC = () => {
  return (
    <Routes>
      <Route path={LANDING} element={<LandingPage />} />
      <Route path={LOGIN} element={<LoginPage />} />
      <Route path={REGISTER} element={<RegisterPage />} />

      <Route
        path={FEED}
        element={
          <PrivateRoute layout={NewsFeedLayout}>
            <NewsFeedPage />
          </PrivateRoute>
        }
      />

      <Route
        path={SHORTS}
        element={
          <PrivateRoute layout={ReelPageLayout}>
            <ReelPage />
          </PrivateRoute>
        }
      />

      <Route
        path={JOBS}
        element={
          <PrivateRoute layout={MarketplacePageLayout}>
            <MarketplacePage />
          </PrivateRoute>
        }
      />

      <Route
        path={COMMUNITIES}
        element={
          <PrivateRoute layout={GroupPageLayout}>
            <GroupPage />
          </PrivateRoute>
        }
      />

      <Route
        path={CHALLENGES}
        element={
          <PrivateRoute layout={GamingPageLayout}>
            <GamingPage />
          </PrivateRoute>
        }
      />

      <Route
        path={PROFILE}
        element={
          <PrivateRoute layout={ProfilePageLayout}>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      <Route
        path={NEWS}
        element={
          <PrivateRoute layout={StoriesLayout}>
            <StoriesPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default Routers;
