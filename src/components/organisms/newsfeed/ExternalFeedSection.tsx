import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { fetchExternalFeed, FeedPost, formatCount } from '../../../lib/feeds';

const sourceColors: Record<FeedPost['source'], { badge: string; icon: string }> = {
  github: { badge: 'bg-gray-800 text-white', icon: 'fab fa-github' },
  devto: { badge: 'bg-sky-500 text-white', icon: 'fas fa-code' },
  reddit: { badge: 'bg-orange-500 text-white', icon: 'fab fa-reddit' },
  hackernews: { badge: 'bg-orange-600 text-white', icon: 'fab fa-hacker-news' },
  stackoverflow: { badge: 'bg-[#f48024] text-white', icon: 'fab fa-stack-overflow' },
  hashnode: { badge: 'bg-primary text-white', icon: 'fas fa-hashtag' },
  lobsters: { badge: 'bg-hub-violet text-white', icon: 'fas fa-link' },
};

const sourceLabels: Record<FeedPost['source'], string> = {
  github: 'GitHub',
  devto: 'Dev.to',
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  stackoverflow: 'Stack Overflow',
  hashnode: 'Hashnode',
  lobsters: 'Lobste.rs',
};

const ExternalFeedSection: React.FC = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExternalFeed();
      setPosts(data);
    } catch (e) {
      setError('Impossible de récupérer les sources externes pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <i className="fas fa-globe text-primary"></i>
          Flux dev en direct
        </h2>
        <button
          onClick={() => void load()}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Actualiser
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <i className="fas fa-circle-notch fa-spin text-xl text-primary"></i>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-white p-4 text-sm text-red-500 shadow dark:bg-neutral-800">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {posts.map((post, i) => {
          const sc = sourceColors[post.source];
          return (
            <article
              key={`${post.source}-${i}`}
              className="flex items-start gap-3 rounded-lg bg-white p-3 shadow transition-colors hover:bg-gray-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={post.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-white"
                  >
                    {post.authorName}
                  </a>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${sc.badge}`}
                  >
                    <i className={sc.icon}></i>
                    {post.meta?.subreddit ?? sourceLabels[post.source]}
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {moment(post.created_at).fromNow()}
                  </span>
                </div>
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm font-semibold text-gray-800 hover:text-primary dark:text-gray-200"
                >
                  {post.title}
                </a>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt=""
                    className="mt-2 max-h-48 w-full rounded-lg object-cover"
                  />
                )}
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {post.content}
                </p>
                {post.meta?.stars != null && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ⭐ {formatCount(post.meta.stars)}
                    {post.meta.language ? ` · ${post.meta.language}` : ''}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ExternalFeedSection;
