import React from 'react';
import Post from '.';
import { useRealtimePosts } from '../../../hooks/useRealtime';
import { toPostView } from '../../../lib/postAdapter';
import { TPostView } from '../../../types/post';
import { cn } from '../../../utils';

interface IProps {
  postsView?: TPostView;
}

const PostContainer: React.FC<IProps> = (props) => {
  const { postsView } = props;
  const { posts, loading, refresh } = useRealtimePosts();

  return (
    <div className="mt-4 h-full w-full">
      <div
        className={cn(
          'grid gap-2',
          postsView === 'gridView' ? 'grid-cols-2' : 'grid-cols-1',
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <i className="fas fa-circle-notch fa-spin text-xl text-primary"></i>
          </div>
        ) : posts.length ? (
          posts.map((post) => <Post key={post.id} post={toPostView(post)} />)
        ) : (
          <div className="rounded-lg bg-white p-6 text-center shadow dark:bg-neutral-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun post pour l’instant. Cliquez sur « Actualiser » pour récupérer
              les dernières actualités GitHub, Dev.to et Reddit.
            </p>
            <button
              onClick={() => void refresh()}
              className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Actualiser le fil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContainer;
