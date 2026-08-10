import { IPost } from '../types/post';
import { PostWithAuthor } from '../hooks/useRealtime';

/** Convertit une ligne Supabase (avec auteur) en vue IPost pour les composants existants. */
export function toPostView(p: PostWithAuthor): IPost {
  return {
    _id: p.id,
    user: {
      _id: p.author?.id ?? p.author_id,
      fullName: p.author?.full_name ?? 'Membre SyntaxHub',
      username: p.author?.username ?? 'membre',
      dp: p.author?.avatar_url ?? 'https://random.imagecdn.app/200/200',
    },
    caption: p.content,
    image: p.image_url ?? undefined,
    likes: p.likes_count,
    comments: p.comments_count,
    commentsData: [],
    shares: p.shares_count,
    sharesData: [],
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at ?? p.created_at),
  };
}
