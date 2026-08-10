import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  useRealtimeProfiles,
  useRealtimeTrendingHashtags,
} from '../../../hooks/useRealtime';

const sources = [
  { icon: 'fab fa-github', bg: 'bg-gray-900', label: 'GitHub Trending' },
  { icon: 'fas fa-code', bg: 'bg-sky-500', label: 'Dev.to' },
  { icon: 'fab fa-reddit', bg: 'bg-orange-500', label: 'Reddit dev' },
  { icon: 'fab fa-hacker-news', bg: 'bg-orange-600', label: 'Hacker News' },
  { icon: 'fab fa-stack-overflow', bg: 'bg-[#f48024]', label: 'Stack Overflow' },
  { icon: 'fas fa-hashtag', bg: 'bg-primary', label: 'Hashnode' },
  { icon: 'fas fa-link', bg: 'bg-hub-violet', label: 'Lobste.rs' },
];

const RightSidebar: React.FC = () => {
  const { user } = useAuth();
  const profiles = useRealtimeProfiles(user?.id);
  const hashtags = useRealtimeTrendingHashtags();

  return (
    <div className="sticky top-[56px] h-[calc(100vh-56px)] w-[22.5rem] overflow-y-auto px-2 py-3 pr-2">
      <div className="mb-2 w-full border-b-2 border-gray-300 pb-2 dark:border-neutral-700">
        <p className="mb-2 font-semibold text-black dark:text-gray-200">
          Vos sources
        </p>
        {sources.map((s) => (
          <li
            key={s.label}
            className="justify-content -ml-2 mb-2 flex h-12 cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-neutral-800"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${s.bg} text-white`}
            >
              <i className={s.icon}></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-black dark:text-gray-200">
                {s.label}
              </p>
            </div>
          </li>
        ))}
      </div>

      {hashtags.length > 0 && (
        <div className="mb-2 w-full border-b-2 border-gray-300 pb-2 dark:border-neutral-700">
          <p className="mb-2 font-semibold text-black dark:text-gray-200">
            Tendances
          </p>
          <ul>
            {hashtags.map((tag, i) => (
              <li
                key={tag.id}
                className="justify-content -ml-2 mb-1.5 flex h-9 cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                <span className="w-4 text-center text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-black dark:text-gray-200">
                    #{tag.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-black dark:text-gray-200">
              Membres
            </p>
          </div>
          <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-300">
            <button className="h-8 w-8 rounded-full hover:bg-gray-200 focus:outline-none dark:hover:bg-neutral-800">
              <i className="fas fa-search"></i>
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-gray-200 focus:outline-none dark:hover:bg-neutral-800">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
        <div className="-ml-2">
          <ul>
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="justify-content mb-2 flex h-12 cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                <div className="relative">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={profile.avatar_url ?? 'https://random.imagecdn.app/200/200'}
                    alt={profile.full_name ?? profile.username}
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-neutral-900" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-200">
                    {profile.full_name ?? profile.username}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
