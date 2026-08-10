import moment from 'moment';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRealtimeNews } from '../../hooks/useRealtime';

const REACTIONS = ['👍', '❤️', '😍', '😄', '😮', '😢', '😡'];

const sourceIcon: Record<string, string> = {
  github: 'fab fa-github',
  devto: 'fas fa-code',
  reddit: 'fab fa-reddit',
  manual: 'fas fa-newspaper',
};

const NewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const news = useRealtimeNews();

  const currentIndex = Math.max(0, news.findIndex((s) => s.id === id));
  const currentStory = news[currentIndex];

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < news.length - 1;

  if (!currentStory) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1220]">
        <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ── Left sidebar ── */}
      <aside className="hub-scrollbar hidden h-full w-[360px] flex-shrink-0 flex-col overflow-y-auto bg-[#0f1b2d] shadow-xl md:flex">
        {/* Header */}
        <div className="px-4 pt-5">
          <h2 className="text-xl font-bold text-gray-100">Actus</h2>
          <div className="mt-1 flex gap-2 text-sm text-primary">
            <button className="hover:underline focus:outline-none">
              Favoris
            </button>
            <span className="text-gray-500">·</span>
            <button className="hover:underline focus:outline-none">
              Paramètres
            </button>
          </div>
        </div>

        {/* Your news */}
        <div className="mt-4 px-3">
          <p className="mb-2 px-1 text-sm font-semibold text-gray-400">
            Votre actu
          </p>
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-neutral-700 focus:outline-none">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-neutral-600">
              <i className="fas fa-plus text-lg text-primary"></i>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-100">
                Publier une actu
              </p>
              <p className="text-xs text-gray-400">
                Partagez une actualité tech.
              </p>
            </div>
          </button>
        </div>

        <div className="mx-4 my-3 border-t border-neutral-600" />

        {/* All news */}
        <div className="px-3 pb-4">
          <p className="mb-2 px-1 text-sm font-semibold text-gray-400">
            Toutes les actus
          </p>
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
                item.id === id ? 'bg-[#1a2740]' : 'hover:bg-neutral-700'
              }`}
            >
              <div className="relative flex flex-shrink-0 items-center justify-center">
                <img
                  src={item.image ?? 'https://random.imagecdn.app/200/200'}
                  className="h-12 w-12 rounded-full border-2 border-primary object-cover"
                  alt={item.title}
                />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] text-white">
                  <i className={sourceIcon[item.source] ?? 'fas fa-newspaper'}></i>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-tight text-gray-100">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400">
                  {item.author ?? item.source} · {moment(item.created_at).fromNow(true)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── News viewer ── */}
      <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-[#0b1220]">
        {/* Prev button */}
        {hasPrev && (
          <button
            onClick={() => navigate(`/news/${news[currentIndex - 1].id}`)}
            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 focus:outline-none"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
        )}

        {/* Next button */}
        {hasNext && (
          <button
            onClick={() => navigate(`/news/${news[currentIndex + 1].id}`)}
            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 focus:outline-none"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        )}

        {/* Card area — fills all vertical space above the bottom bar */}
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-2 pt-4">
          {/* News card — height fills this area; width derived from aspect-ratio */}
          <div
            className="relative h-full max-h-[620px] overflow-hidden rounded-2xl shadow-2xl"
            style={{ aspectRatio: '9 / 16' }}
          >
            {/* Background image */}
            <img
              src={currentStory.image ?? 'https://random.imagecdn.app/500/800'}
              alt="news"
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Top gradient overlay */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent" />

            {/* Top controls */}
            <div className="absolute inset-x-0 top-0 p-3">
              {/* Progress bar */}
              <div className="flex gap-1">
                {news.map((s, i) => (
                  <div
                    key={s.id}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/40"
                  >
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{
                        width:
                          i < currentIndex
                            ? '100%'
                            : i === currentIndex
                              ? '45%'
                              : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* User row */}
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-primary/80 text-white">
                  <i
                    className={`${sourceIcon[currentStory.source] ?? 'fas fa-newspaper'} text-sm`}
                  ></i>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentStory.author ?? currentStory.source}
                  </p>
                  <p className="text-xs text-white/70">
                    {moment(currentStory.created_at).fromNow()} ·{' '}
                    <i className="fas fa-globe-asia text-[10px]"></i>
                  </p>
                </div>
                <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 focus:outline-none">
                  <i className="fas fa-volume-mute text-sm"></i>
                </button>
                <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 focus:outline-none">
                  <i className="fas fa-pause text-sm"></i>
                </button>
                <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10 focus:outline-none">
                  <i className="fas fa-ellipsis-h text-sm"></i>
                </button>
              </div>
            </div>

            {/* Title overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 pt-16">
              <p className="text-xl font-bold leading-tight text-white drop-shadow">
                {currentStory.title}
              </p>
              {currentStory.summary && (
                <p className="mt-2 text-sm text-white/85">{currentStory.summary}</p>
              )}
              {currentStory.source_url && (
                <a
                  href={currentStory.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Lire l’article
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom controls — pinned, fixed height */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2">
          <div className="mx-auto flex w-full max-w-[340px] flex-col gap-2">
            {/* Send message */}
            <div className="flex items-center rounded-full border border-white/30 px-4 py-2">
              <input
                type="text"
                placeholder="Envoyer un message..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
              />
            </div>

            {/* Emoji reactions */}
            <div className="flex items-center justify-center gap-3">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsPage;
