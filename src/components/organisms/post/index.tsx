import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import moment from 'moment';
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeLike } from '../../../hooks/useRealtime';
import { supabase } from '../../../lib/supabase';
import { IPost } from '../../../types/post';
import PostModal from './PostModal';
import SharesModal from './SharesModal';

interface IProps {
  post: IPost;
}

interface IMenuAction {
  icon: string;
  iconColor?: string;
  label: string;
  description?: string;
}

const menuGroups: IMenuAction[][] = [
  [
    { icon: 'fas fa-plus-circle', label: 'Intéressé', description: 'Vos posts seront davantage de ce type.' },
    { icon: 'fas fa-minus-circle', label: 'Pas intéressé', description: 'Moins de posts de ce type.' },
  ],
  [
    { icon: 'fas fa-bookmark', label: 'Enregistrer le post', description: 'Ajouter à vos éléments enregistrés.' },
  ],
  [
    { icon: 'fas fa-bell', label: 'Activer les notifications pour ce post' },
    { icon: 'fas fa-info-circle', label: 'Pourquoi voir ce post ?' },
    { icon: 'fas fa-code', label: 'Intégrer (embed)' },
  ],
  [
    { icon: 'fas fa-times-circle', iconColor: 'text-red-500', label: 'Masquer le post', description: 'Voir moins de posts de ce type.' },
    { icon: 'fas fa-clock', label: 'Mettre en pause 30 jours', description: 'Arrêter temporairement de voir ces posts.' },
    { icon: 'fas fa-user-slash', iconColor: 'text-red-500', label: 'Ne plus suivre', description: 'Ne plus voir les posts de ce membre. Il ne sera pas notifié.' },
    { icon: 'fas fa-exclamation-circle', iconColor: 'text-red-500', label: 'Signaler le post', description: 'Nous ne les informerons pas de ce signalement.' },
    { icon: 'fas fa-user-times', iconColor: 'text-red-500', label: 'Bloquer le profil', description: 'Vous ne pourrez plus vous voir ou vous contacter.' },
  ],
];

const CAPTION_LIMIT = 120;

const Post: React.FC<IProps> = ({ post }) => {
  const { user: authUser } = useAuth();
  const { user } = post;
  const { liked, toggleLike } = useRealtimeLike(post._id, authUser?.id);
  const [modalOpen, setModalOpen] = useState(false);
  const [sharesOpen, setSharesOpen] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const toggleSave = async () => {
    if (!authUser) return;
    const { data: existing } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', authUser.id)
      .eq('post_id', post._id)
      .maybeSingle();
    if (existing) {
      await supabase.from('saved_posts').delete().eq('id', existing.id);
    } else {
      await supabase.from('saved_posts').insert({
        user_id: authUser.id,
        post_id: post._id,
      });
    }
  };

  return (
    <>
    <div className="h-auto w-full rounded-md bg-white shadow dark:bg-neutral-800">
      <div className="flex items-center space-x-2 p-2.5 px-4">
        <div className="h-10 w-10">
          <img src={user.dp} className="h-full w-full rounded-full" alt="dp" />
        </div>
        <div className="flex flex-grow flex-col">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {user.fullName}
          </p>
          <span className="text-xs font-thin text-gray-400">
            {moment(post.createdAt).fromNow()}
          </span>
        </div>

        {/* Menu */}
        <Menu as="div" className="relative">
          <MenuButton className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-neutral-700">
            <i className="fas fa-ellipsis-h"></i>
          </MenuButton>

          <MenuItems
            anchor="bottom end"
            className="z-50 mt-1 w-72 overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.18)] focus:outline-none dark:bg-neutral-800 dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:w-80"
          >
            <div className="hub-scrollbar max-h-[80vh] overflow-y-auto py-1">
              {menuGroups.map((group, gi) => (
                <div key={gi}>
                  {gi > 0 && (
                    <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />
                  )}
                  {group.map((item) => (
                    <MenuItem key={item.label}>
                      {({ focus }) => (
                        <button
                          onClick={() => {
                            if (item.label === 'Enregistrer le post') {
                              void toggleSave();
                            }
                          }}
                          className={`flex w-full items-start gap-3 px-3 py-2 text-left ${
                            focus
                              ? 'bg-gray-100 dark:bg-neutral-700'
                              : ''
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-base dark:bg-neutral-600 ${
                              item.iconColor ?? 'text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            <i className={item.icon}></i>
                          </span>
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.description}
                              </span>
                            )}
                          </span>
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </div>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      {post.caption ? (
        <div className="mb-2 px-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {captionExpanded || post.caption.length <= CAPTION_LIMIT
              ? post.caption
              : post.caption.slice(0, CAPTION_LIMIT).trimEnd() + '...'}
          </p>
          {post.caption.length > CAPTION_LIMIT && (
            <button
              onClick={() => setCaptionExpanded((v) => !v)}
              className="text-sm font-semibold text-gray-500 hover:underline dark:text-gray-400"
            >
              {captionExpanded ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>
      ) : null}
      {post.image ? (
        <div className="h-76 max-h-100 w-full">
          <img
            src={post.image}
            alt="postImage"
            className="h-76 max-h-100 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="flex w-full flex-col space-y-2 p-2 px-4">
        <div className="flex items-center justify-between border-b border-gray-300 pb-2 text-sm dark:border-neutral-700">
          <div className="flex items-center">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
              <i style={{ fontSize: 10 }} className="fas fa-heart"></i>
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
              <i style={{ fontSize: 10 }} className="fas fa-thumbs-up"></i>
            </span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-white">
              <i style={{ fontSize: 10 }} className="fas fa-surprise"></i>
            </span>
            <p className="ml-1 text-gray-500 dark:text-gray-300">{post.likes}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setModalOpen(true)}
              className="text-gray-500 hover:underline dark:text-gray-300"
            >
              {post.comments} commentaires
            </button>
            <button
              onClick={() => setSharesOpen(true)}
              className="text-gray-500 hover:underline dark:text-gray-300"
            >
              {post.shares} partages
            </button>
          </div>
        </div>
        <div className="flex space-x-3 text-sm font-thin text-gray-500">
          <button
            onClick={() => void toggleLike()}
            className={`flex h-8 flex-1 items-center justify-center space-x-2 rounded-md hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${
              liked ? 'text-primary' : ''
            }`}
          >
            <i className={liked ? 'fas fa-thumbs-up' : 'far fa-thumbs-up'}></i>
            <p className="font-semibold">J’aime</p>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
          >
            <i className="fas fa-comment"></i>
            <p className="font-semibold">Commenter</p>
          </button>
          <button className="flex h-8 flex-1 items-center justify-center space-x-2 rounded-md hover:bg-gray-100 focus:bg-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700">
            <i className="fas fa-share"></i>
            <p className="font-semibold">Partager</p>
          </button>
        </div>
      </div>
    </div>

    <PostModal
      post={post}
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
    />
    <SharesModal
      post={post}
      isOpen={sharesOpen}
      onClose={() => setSharesOpen(false)}
    />
    </>
  );
};

export default Post;
