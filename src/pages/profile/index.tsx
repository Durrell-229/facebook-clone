import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CreatePostBox from '../../components/organisms/post/CreatePostBox';
import PostContainer from '../../components/organisms/post/PostContainer';
import SavedPostsSection from '../../components/organisms/post/SavedPostsSection';
import { TPostView } from '../../types/post';

const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const [postsView, setPostsView] = useState<TPostView>('listView');

  const fullName = profile?.full_name ?? 'Développeur';
  const username = profile?.username ?? 'dev';
  const avatar = profile?.avatar_url ?? 'https://random.imagecdn.app/250/250';
  const banner = profile?.banner_url ?? 'https://random.imagecdn.app/1920/1080';

  return (
    <div className="h-full w-full">
      <div className="h-auto w-full bg-white shadow dark:bg-neutral-800">
        <div className="mx-auto h-full max-w-6xl rounded-md bg-white dark:bg-neutral-800">
          <div
            className="relative h-[12rem] max-h-[28.75rem] w-full rounded-lg sm:h-[20rem] md:h-[28.75rem]"
            style={{
              backgroundImage: `url('${banner}')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="absolute flex w-full items-center justify-center"
              style={{ bottom: '-15px' }}
            >
              <div className="absolute bottom-[30px] right-[30px]">
                <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50 focus:outline-none">
                  <i className="fas fa-camera mr-2"></i>Modifier la photo de couverture
                </button>
              </div>
            </div>
          </div>
          <div className="mx-auto h-full px-3 sm:px-10">
            <div className="flex flex-col gap-3 border-b pb-5 dark:border-stone-700 sm:flex-row sm:items-end sm:gap-5">
              <div className="z-10 -mt-8 h-[7rem] w-[7rem] flex-shrink-0 sm:h-[10.25rem] sm:w-[10.25rem]">
                <img
                  className="h-full w-full rounded-full border-4 border-primary object-cover"
                  src={avatar}
                  alt="dp"
                />
              </div>
              <div className="flex flex-1 flex-col pb-2">
                <p className="text-2xl font-bold text-black dark:text-gray-200 sm:text-[2rem]">
                  {fullName}
                </p>
                <a className="cursor-pointer text-sm font-semibold text-gray-600 hover:underline dark:text-gray-300">
                  @{username}
                </a>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {profile?.title ?? profile?.bio ?? 'Développeur sur SyntaxHub'}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none">
                      <i className="fas fa-pen mr-2"></i>Modifier le profil
                    </button>
                    <button className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-black hover:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600">
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="mb-2 flex items-center space-x-1 overflow-x-auto">
                {['Posts', 'À propos', 'Amis', 'Photos', 'Vidéos'].map((tab) => (
                  <button
                    key={tab}
                    className="flex-shrink-0 rounded-md px-2 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-200 dark:hover:bg-neutral-700"
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="flex-shrink-0 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold text-black hover:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600">
                <i className="fas fa-ellipsis-h"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* After bio content */}
      <div className="mx-auto my-3 h-full max-w-6xl px-3 sm:px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="col-span-1 flex flex-col gap-4 md:col-span-2">
            <div className="flex flex-col gap-4 rounded-lg bg-white p-3 text-gray-600 shadow dark:bg-neutral-800 dark:text-gray-300">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-300">
                Intro
              </p>
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col items-center">
                  <p className="text-sm">
                    {profile?.bio ?? 'Codeur passionné, membre de SyntaxHub.'}
                  </p>
                  {profile?.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-4 text-sm">
                {profile?.title && (
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-briefcase text-[1.25rem] text-gray-400"></i>
                    </span>
                    <p>{profile.title}</p>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-map-marker-alt text-[1.25rem] text-gray-400"></i>
                    </span>
                    <p>
                      Vit à <span className="font-semibold">{profile.location}</span>
                    </p>
                  </div>
                )}
                {profile?.github_username && (
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fab fa-github text-[1.25rem] text-gray-400"></i>
                    </span>
                    <a
                      className="cursor-pointer hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://github.com/${profile.github_username}`}
                    >
                      <p>{profile.github_username}</p>
                    </a>
                  </div>
                )}
              </div>

              {profile?.tech_stack && profile.tech_stack.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Stack technique
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <button className="w-full rounded-md bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:hover:bg-neutral-600">
                  Modifier les détails
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3">
            {/* Create post */}
            <CreatePostBox />
            {/* post filter box */}
            <div className="mt-4 rounded-md bg-white p-2 px-3 text-sm shadow dark:bg-neutral-800">
              <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-700">
                <div>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                    Posts
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-black hover:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600">
                    <i className="fas fa-sliders-h mr-2"></i>Filtres
                  </button>
                </div>
              </div>
              <div className="-mb-1 mt-1 flex space-x-3">
                <button
                  className={`h-8 flex-1 justify-center space-x-2 rounded-md font-semibold text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 ${
                    postsView === 'listView' ? 'bg-gray-200 dark:bg-neutral-700' : undefined
                  }`}
                  onClick={() => setPostsView('listView')}
                >
                  <i className="fas fa-bars mr-2"></i>Vue liste
                </button>
                <button
                  className={`h-8 flex-1 justify-center space-x-2 rounded-md font-semibold text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 ${
                    postsView === 'gridView' ? 'bg-gray-200 dark:bg-neutral-700' : undefined
                  }`}
                  onClick={() => setPostsView('gridView')}
                >
                  <i className="fas fa-th-large mr-2"></i>Vue grille
                </button>
              </div>
            </div>

            {/* user posts */}
            <PostContainer postsView={postsView} />

            {/* saved posts (bookmarks) */}
            <SavedPostsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
