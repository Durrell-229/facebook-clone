import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type PostRow = Database['public']['Tables']['posts']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface PostWithAuthor extends PostRow {
  author: ProfileRow | null;
  likedByMe: boolean;
}

export interface CommentWithAuthor extends CommentRow {
  author: ProfileRow | null;
}

/** Profils réels (membres) pour la sidebar contacts, hors utilisateur courant. */
export function useRealtimeProfiles(excludeId?: string): ProfileRow[] {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(30);
      if (excludeId) query = query.neq('id', excludeId);
      const { data } = await query;
      setProfiles(data ?? []);
    };
    void fetchProfiles();

    const channel = supabase
      .channel('realtime-profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const row = payload.new as ProfileRow;
        if (row.id === excludeId) return;
        setProfiles((prev) => [row, ...prev.filter((p) => p.id !== row.id)].slice(0, 30));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [excludeId]);

  return profiles;
}

/** Conversations de l'utilisateur connecté (avec dernier message) en temps réel. */
export interface ConversationPreview {
  conversation_id: string;
  title: string | null;
  is_group: boolean;
  otherUser: ProfileRow | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unread: boolean;
}

export function useRealtimeConversations(userId: string | undefined): ConversationPreview[] {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      const { data: memberships } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userId);

      const convIds = (memberships ?? []).map((m) => m.conversation_id);
      if (convIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', convIds);

      const { data: otherMembers } = await supabase
        .from('conversation_members')
        .select('user_id, conversation_id')
        .in('conversation_id', convIds)
        .neq('user_id', userId);

      const otherProfileIds = (otherMembers ?? []).map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', otherProfileIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const memberMap = new Map<string, string>();
      (otherMembers ?? []).forEach((m) => memberMap.set(m.conversation_id, m.user_id));

      const previews: ConversationPreview[] = await Promise.all(
        (convs ?? []).map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          const otherId = memberMap.get(conv.id);
          return {
            conversation_id: conv.id,
            title: conv.title,
            is_group: conv.is_group,
            otherUser: otherId ? (profileMap.get(otherId) ?? null) : null,
            lastMessage: lastMsg?.content ?? null,
            lastMessageAt: lastMsg?.created_at ?? null,
            unread: false,
          };
        }),
      );

      previews.sort((a, b) =>
        (a.lastMessageAt ?? '') < (b.lastMessageAt ?? '') ? 1 : -1,
      );
      setConversations(previews);
    };

    void fetchConversations();

    const channel = supabase
      .channel(`realtime-conversations-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as Database['public']['Tables']['messages']['Row'];
          setConversations((prev) => {
            const existing = prev.find((c) => c.conversation_id === row.conversation_id);
            if (!existing) return prev;
            const updated = {
              ...existing,
              lastMessage: row.content,
              lastMessageAt: row.created_at,
              unread: row.sender_id !== userId,
            };
            return [updated, ...prev.filter((c) => c.conversation_id !== row.conversation_id)];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return conversations;
}

/** Actualités tech réelles depuis la table news (peuplée par l'edge function sync-feeds). */
export function useRealtimeNews(): Database['public']['Tables']['news']['Row'][] {
  const [news, setNews] = useState<Database['public']['Tables']['news']['Row'][]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);
      setNews(data ?? []);
    };
    void fetchNews();

    const channel = supabase
      .channel('realtime-news')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, (payload) => {
        setNews((prev) => [
          payload.new as Database['public']['Tables']['news']['Row'],
          ...prev,
        ].slice(0, 15));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return news;
}

/** Offres d'emploi réelles depuis la table jobs. */
export function useRealtimeJobs(): {
  jobs: {
    _id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    category: string | null;
    contractType: string | null;
    salaryMax: number | null;
    isFree: boolean;
    description: string | null;
    isRemote: boolean;
    listedAgo: string;
    created_at: string;
  }[];
  loading: boolean;
} {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      setJobs(data ?? []);
      setLoading(false);
    };
    void fetchJobs();

    const channel = supabase
      .channel('realtime-jobs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
        setJobs((prev) => [payload.new as never, ...prev].slice(0, 30));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const jobsView = jobs.map((j: Database['public']['Tables']['jobs']['Row']) => ({
    _id: j.id,
    title: j.title,
    company: j.company,
    companyLogo: j.company_logo,
    location: j.location,
    category: j.category,
    contractType: j.contract_type,
    salaryMax: j.salary_max,
    isFree: j.is_free,
    description: j.description,
    isRemote: j.is_remote,
    listedAgo: j.listed_ago ?? 'Récent',
    created_at: j.created_at,
  }));

  return { jobs: jobsView, loading };
}

/** Communautés réelles depuis la table communities. */
export function useRealtimeCommunities(): {
  communities: {
    _id: string;
    name: string;
    image: string;
    description: string | null;
    members: number;
  }[];
} {
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      const { data } = await supabase
        .from('communities')
        .select('*')
        .order('members_count', { ascending: false });
      setCommunities(data ?? []);
    };
    void fetchCommunities();

    const channel = supabase
      .channel('realtime-communities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communities' }, (payload) => {
        setCommunities((prev) => [payload.new as never, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const view = communities.map((c: Database['public']['Tables']['communities']['Row']) => ({
    _id: c.id,
    name: c.name,
    image: c.image ?? 'https://random.imagecdn.app/200/200',
    description: c.description,
    members: c.members_count,
  }));

  return { communities: view };
}

/** Posts de communautés réels. */
export function useRealtimeCommunityPosts(): {
  posts: {
    _id: string;
    group: { _id: string; name: string; image: string; isPublic: boolean };
    user: { _id: string; fullName: string; dp?: string };
    content: string;
    createdAt: Date;
    likes: number;
    commentsCount: number;
    sharesCount: number;
  }[];
} {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: rows } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!rows) return;

      const communityIds = [...new Set(rows.map((r) => r.community_id))];
      const authorIds = [...new Set(rows.map((r) => r.author_id))];

      const [communitiesRes, profilesRes] = await Promise.all([
        supabase.from('communities').select('*').in('id', communityIds),
        supabase.from('profiles').select('*').in('id', authorIds),
      ]);

      const communityMap = new Map((communitiesRes.data ?? []).map((c) => [c.id, c]));
      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));

      const view = rows.map((r) => {
        const community = communityMap.get(r.community_id);
        const author = profileMap.get(r.author_id);
        return {
          _id: r.id,
          group: {
            _id: community?.id ?? r.community_id,
            name: community?.name ?? 'Communauté',
            image: community?.image ?? 'https://random.imagecdn.app/200/200',
            isPublic: community?.is_public ?? true,
          },
          user: {
            _id: author?.id ?? r.author_id,
            fullName: author?.full_name ?? 'Membre',
            dp: author?.avatar_url ?? 'https://random.imagecdn.app/200/200',
          },
          content: r.content,
          createdAt: new Date(r.created_at),
          likes: r.likes_count,
          commentsCount: r.comments_count,
          sharesCount: r.shares_count,
        };
      });
      setPosts(view);
    };
    void fetchPosts();
  }, []);

  return { posts };
}

/** Défis réels depuis la table challenges. */
export function useRealtimeChallenges(): {
  challenges: {
    _id: string;
    title: string;
    image: string;
    category: string;
    participantsCount: number;
    difficulty: string | null;
  }[];
  events: {
    _id: string;
    challengeTitle: string;
    challengeIcon: string;
    eventImage: string;
    title: string;
    description: string;
    endsInDays: number;
  }[];
} {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      setChallenges(data ?? []);
    };
    void fetchChallenges();

    const channel = supabase
      .channel('realtime-challenges')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenges' }, (payload) => {
        setChallenges((prev) => [payload.new as never, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const rows = challenges as Database['public']['Tables']['challenges']['Row'][];

  const challengesView = rows.map((c) => ({
    _id: c.id,
    title: c.title,
    image: c.image ?? 'https://random.imagecdn.app/300/400',
    category: c.category ?? 'Divers',
    participantsCount: c.participants_count,
    difficulty: c.difficulty,
  }));

  const eventsView = rows
    .filter((c) => c.ends_at)
    .map((c) => ({
      _id: c.id,
      challengeTitle: c.title,
      challengeIcon: c.image ?? 'https://random.imagecdn.app/200/200',
      eventImage: c.image ?? 'https://random.imagecdn.app/300/400',
      title: c.title,
      description: c.description ?? '',
      endsInDays: Math.max(1, Math.ceil((new Date(c.ends_at as string).getTime() - Date.now()) / 86400000)),
    }));

  return { challenges: challengesView, events: eventsView };
}

/** Shorts / tutoriels réels depuis la table shorts. */
export function useRealtimeShorts(): {
  shorts: {
    _id: string;
    user: { _id: string; fullName: string; dp?: string; isVerified?: boolean; isFollowing?: boolean };
    videoUrl: string;
    poster?: string;
    caption: string;
    audio: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: Date;
  }[];
} {
  const [shorts, setShorts] = useState<any[]>([]);

  useEffect(() => {
    const fetchShorts = async () => {
      const { data: rows } = await supabase
        .from('shorts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (!rows) return;

      const creatorIds = rows.map((r) => r.created_by).filter(Boolean) as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', creatorIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const view = rows.map((r) => {
        const creator = r.created_by ? profileMap.get(r.created_by) : null;
        return {
          _id: r.id,
          user: {
            _id: creator?.id ?? r.created_by ?? 'system',
            fullName: creator?.full_name ?? 'SyntaxHub',
            dp: creator?.avatar_url ?? 'https://random.imagecdn.app/200/200',
            isVerified: false,
            isFollowing: false,
          },
          videoUrl: r.video_url ?? '',
          poster: r.poster ?? undefined,
          caption: r.description ?? r.title,
          audio: r.audio ?? 'Son original',
          likes: r.likes_count,
          comments: r.comments_count,
          shares: r.shares_count,
          createdAt: new Date(r.created_at),
        };
      });
      setShorts(view);
    };
    void fetchShorts();
  }, []);

  return { shorts };
}

/** Récupère les posts du fil + abonnement temps réel (INSERT/UPDATE/DELETE). */
export function useRealtimePosts(): { posts: PostWithAuthor[]; loading: boolean; refresh: () => Promise<void> } {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data: rows } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!rows) return;
    const authorIds = [...new Set(rows.map((r) => r.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const withAuthor: PostWithAuthor[] = rows.map((row) => ({
      ...row,
      author: profileMap.get(row.author_id) ?? null,
      likedByMe: false,
    }));
    setPosts(withAuthor);
    setLoading(false);
  };

  useEffect(() => {
    void fetchPosts();

    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          const row = payload.new as PostRow;
          const { data: author } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', row.author_id)
            .maybeSingle();
          setPosts((prev) => [
            { ...row, author: author ?? null, likedByMe: false },
            ...prev.filter((p) => p.id !== row.id),
          ]);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as PostRow;
          setPosts((prev) => prev.map((p) => (p.id === row.id ? { ...p, ...row } : p)));
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          const id = payload.old.id as string;
          setPosts((prev) => prev.filter((p) => p.id !== id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading, refresh: fetchPosts };
}

/** Récupère les commentaires d'un post + abonnement temps réel. */
export function useRealtimeComments(postId: string): {
  comments: CommentWithAuthor[];
  loading: boolean;
} {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      const { data: rows } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!rows) return;
      const authorIds = [...new Set(rows.map((r) => r.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      setComments(
        rows.map((row) => ({ ...row, author: profileMap.get(row.author_id) ?? null })),
      );
      setLoading(false);
    };
    void fetchComments();

    const channel = supabase
      .channel(`realtime-comments-${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        async (payload) => {
          const row = payload.new as CommentRow;
          const { data: author } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', row.author_id)
            .maybeSingle();
          setComments((prev) => [
            ...prev.filter((c) => c.id !== row.id),
            { ...row, author: author ?? null },
          ]);
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const id = payload.old.id as string;
          setComments((prev) => prev.filter((c) => c.id !== id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return { comments, loading };
}

/** Vérifie si l'utilisateur a liké un post (en temps réel). */
export function useRealtimeLike(postId: string, userId: string | undefined): {
  liked: boolean;
  toggleLike: () => Promise<void>;
} {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!postId || !userId) return;
    const check = async () => {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();
      setLiked(!!data);
    };
    void check();

    const channel = supabase
      .channel(`realtime-like-${postId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${postId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.user_id === userId) setLiked(true);
          if (payload.eventType === 'DELETE' && payload.old.user_id === userId) setLiked(false);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, userId]);

  const toggleLike = async () => {
    if (!postId || !userId) return;
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
      await supabase.rpc('increment_post_likes', { post_id: postId, delta: -1 });
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: userId });
      await supabase.rpc('increment_post_likes', { post_id: postId, delta: 1 });
    }
  };

  return { liked, toggleLike };
}

/** Notifications temps réel pour l'utilisateur connecté. */
export function useRealtimeNotifications(userId: string | undefined): {
  notifications: Database['public']['Tables']['notifications']['Row'][];
  unread: number;
  markAllRead: () => Promise<void>;
} {
  const [notifications, setNotifications] = useState<
    Database['public']['Tables']['notifications']['Row'][]
  >([]);

  useEffect(() => {
    if (!userId) return;
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      setNotifications(data ?? []);
    };
    void fetchNotifs();

    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as never, ...prev]);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as Database['public']['Tables']['notifications']['Row'];
          setNotifications((prev) => prev.map((n) => (n.id === row.id ? row : n)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .is('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return { notifications, unread, markAllRead };
}

/** Messages d'une conversation en temps réel. */
export function useRealtimeMessages(
  conversationId: string | undefined,
  senderId: string | undefined,
): {
  messages: Database['public']['Tables']['messages']['Row'][];
  sendMessage: (content: string) => Promise<void>;
} {
  const [messages, setMessages] = useState<Database['public']['Tables']['messages']['Row'][]>([]);

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(200);
      setMessages(data ?? []);
    };
    void fetchMessages();

    const channel = supabase
      .channel(`realtime-messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [
            ...prev,
            payload.new as Database['public']['Tables']['messages']['Row'],
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !senderId || !content.trim()) return;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    });
  };

  return { messages, sendMessage };
}

/** Posts enregistrés (bookmarks) de l'utilisateur connecté, en temps réel. */
export function useRealtimeSavedPosts(
  userId: string | undefined,
): { saved: PostWithAuthor[]; loading: boolean; toggleSave: (postId: string) => Promise<void> } {
  const [saved, setSaved] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!userId) return;
    const { data: rows } = await supabase
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const postIds = (rows ?? []).map((r) => r.post_id);
    if (postIds.length === 0) {
      setSaved([]);
      setLoading(false);
      return;
    }

    const { data: list } = await supabase
      .from('posts')
      .select('*')
      .in('id', postIds);

    const ordered = (list ?? []).sort(
      (a, b) => postIds.indexOf(a.id) - postIds.indexOf(b.id),
    );

    const authorIds = [...new Set(ordered.map((p) => p.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', authorIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    setSaved(
      ordered.map((row) => ({
        ...row,
        author: profileMap.get(row.author_id) ?? null,
        likedByMe: false,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    void fetchSaved();
    if (!userId) return;

    const channel = supabase
      .channel(`realtime-saved-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'saved_posts', filter: `user_id=eq.${userId}` },
        () => void fetchSaved(),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'saved_posts', filter: `user_id=eq.${userId}` },
        () => void fetchSaved(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toggleSave = async (postId: string) => {
    if (!userId) return;
    const { data: existing } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    if (existing) {
      await supabase.from('saved_posts').delete().eq('id', existing.id);
    } else {
      await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
    }
    void fetchSaved();
  };

  return { saved, loading, toggleSave };
}

/** Hashtags les plus populaires (tendances). */
export function useRealtimeTrendingHashtags(): Database['public']['Tables']['trending_hashtags']['Row'][] {
  const [tags, setTags] = useState<Database['public']['Tables']['trending_hashtags']['Row'][]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase
        .from('trending_hashtags')
        .select('*')
        .order('count', { ascending: false })
        .limit(10);
      setTags(data ?? []);
    };
    void fetchTags();

    const channel = supabase
      .channel('realtime-hashtags')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trending_hashtags' },
        () => void fetchTags(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trending_hashtags' },
        () => void fetchTags(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return tags;
}
