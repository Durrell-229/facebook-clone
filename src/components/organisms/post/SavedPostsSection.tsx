import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeSavedPosts } from '../../../hooks/useRealtime';
import { toPostView } from '../../../lib/postAdapter';
import Post from '.';

/** Posts enregistrés (bookmarks) de l'utilisateur connecté. */
const SavedPostsSection: React.FC = () => {
  const { user } = useAuth();
  const { saved, loading, toggleSave } = useRealtimeSavedPosts(user?.id);

  if (!user) return null;

  return (
    <div className="mt-4 rounded-md bg-white p-3 shadow dark:bg-neutral-800">
      <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-700">
        <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
          <i className="fas fa-bookmark mr-2 text-primary"></i>
          Mes enregistrements
        </p>
        <span className="text-sm text-gray-400">{saved.length} enregistré(s)</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <i className="fas fa-circle-notch fa-spin text-xl text-primary"></i>
          </div>
        ) : saved.length ? (
          saved.map((post) => (
            <div key={post.id} className="relative">
              <button
                onClick={() => void toggleSave(post.id)}
                title="Retirer des enregistrements"
                className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-2 text-sm text-primary shadow hover:bg-white dark:bg-neutral-700/80"
              >
                <i className="fas fa-bookmark"></i>
              </button>
              <Post post={toPostView(post)} />
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun post enregistré pour l’instant. Cliquez sur « Enregistrer » dans
            un post pour le retrouver ici.
          </p>
        )}
      </div>
    </div>
  );
};

export default SavedPostsSection;
