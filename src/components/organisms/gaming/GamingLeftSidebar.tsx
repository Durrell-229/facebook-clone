import React, { useState } from 'react';

const navItems = [
  { id: 'play', icon: 'fas fa-flag-checkered', label: 'Relever des défis' },
  { id: 'activity', icon: 'fas fa-chart-line', label: 'Mon activité' },
  { id: 'notifications', icon: 'fas fa-bell', label: 'Notifications' },
];

const categories = [
  { label: 'Tous les défis', icon: 'fas fa-th' },
  { label: 'Algorithmes', icon: 'fas fa-sort-amount-up' },
  { label: 'Frontend', icon: 'fas fa-paint-brush' },
  { label: 'Backend', icon: 'fas fa-server' },
  { label: 'Fullstack', icon: 'fas fa-layer-group' },
  { label: 'Cybersécurité', icon: 'fas fa-shield-alt' },
  { label: 'Data & IA', icon: 'fas fa-brain' },
  { label: 'DevOps', icon: 'fas fa-cloud' },
  { label: 'Mobile', icon: 'fas fa-mobile-alt' },
  { label: 'Open Source', icon: 'fas fa-code-branch' },
  { label: 'Hackathon', icon: 'fas fa-rocket' },
];

const GamingLeftSidebar: React.FC = () => {
  const [activeNav, setActiveNav] = useState('play');
  const [activeCategory, setActiveCategory] = useState('Tous les défis');

  return (
    <div className="hub-scrollbar sticky top-14 hidden h-[calc(100vh-56px)] shrink-0 overflow-y-auto border-r border-gray-200 py-4 dark:border-neutral-700 md:flex md:w-16 md:flex-col md:px-1.5 lg:w-72 lg:px-3 xl:w-[360px]">

      {/* Header — visible on lg+ only */}
      <div className="mb-4 hidden items-center justify-between px-2 lg:flex">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Défis</h1>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600">
          <i className="fas fa-cog text-sm"></i>
        </button>
      </div>

      {/* Search — visible on lg+ only */}
      <div className="relative mb-3 hidden lg:block">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400"></i>
        <input
          placeholder="Rechercher un défi"
          className="w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm focus:outline-none dark:bg-neutral-700 dark:text-white dark:placeholder:text-gray-400"
        />
      </div>

      {/* Nav items */}
      <ul className="mb-3 space-y-0.5">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveNav(item.id)}
              title={item.label}
              className={`flex w-full items-center justify-center rounded-lg px-2 py-2 transition-colors lg:justify-start lg:space-x-3 ${
                activeNav === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                  activeNav === item.id
                    ? 'bg-blue-100 dark:bg-blue-800/40'
                    : 'bg-gray-200 dark:bg-neutral-700'
                }`}
              >
                <i
                  className={`${item.icon} text-sm ${
                    activeNav === item.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
                  }`}
                ></i>
              </div>
              <span
                className={`hidden text-sm font-semibold lg:inline ${
                  activeNav === item.id ? 'text-primary' : 'text-gray-900 dark:text-gray-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Your challenges — visible on lg+ only */}
      <div className="mb-3 hidden px-2 lg:block">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Mes défis</span>
          <button className="text-sm font-semibold text-primary hover:underline">Voir tout</button>
        </div>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Enregistrez un défi pour créer un raccourci ici.
        </p>
        <button className="flex w-full items-center space-x-3 rounded-lg px-2 py-2 hover:bg-gray-100 focus:outline-none dark:hover:bg-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700">
            <i className="fas fa-bookmark text-sm text-gray-700 dark:text-gray-200"></i>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">Enregistrer des défis</span>
        </button>
      </div>

      {/* Divider — visible on lg+ only */}
      <hr className="mb-3 hidden border-gray-200 dark:border-neutral-700 lg:block" />

      {/* Categories */}
      <div className="lg:px-2">
        <p className="mb-2 hidden text-sm font-bold text-gray-900 dark:text-white lg:block">Catégories</p>
        <ul className="space-y-0.5">
          {categories.map((cat) => (
            <li key={cat.label}>
              <button
                onClick={() => setActiveCategory(cat.label)}
                title={cat.label}
                className={`flex w-full items-center justify-center rounded-lg px-2 py-2 transition-colors lg:justify-start lg:space-x-3 ${
                  activeCategory === cat.label
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                    activeCategory === cat.label
                      ? 'bg-blue-100 dark:bg-blue-800/40'
                      : 'bg-gray-200 dark:bg-neutral-700'
                  }`}
                >
                  <i
                    className={`${cat.icon} text-sm ${
                      activeCategory === cat.label ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
                    }`}
                  ></i>
                </div>
                <span
                  className={`hidden text-sm font-semibold lg:inline ${
                    activeCategory === cat.label ? 'text-primary' : 'text-gray-900 dark:text-gray-200'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GamingLeftSidebar;
