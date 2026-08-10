/**
 * Service d'alimentation du flux avec de vraies données externes.
 * Sources publiques : GitHub API, Dev.to API, Reddit (JSON), Hacker News (Algolia),
 * Stack Overflow (StackExchange), Hashnode (GraphQL), Lobste.rs (JSON).
 */

interface GitHubRepo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  owner: { login: string; avatar_url: string };
  topics: string[];
  created_at: string;
}

export type FeedSource =
  | 'github'
  | 'devto'
  | 'reddit'
  | 'hackernews'
  | 'stackoverflow'
  | 'hashnode'
  | 'lobsters';

export interface FeedPost {
  source: FeedSource;
  source_url: string;
  authorName: string;
  authorAvatar: string;
  authorUrl?: string;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  meta?: { stars?: number; language?: string | null; subreddit?: string; points?: number };
}

const GITHUB_API = 'https://api.github.com';
const DEVTO_API = (import.meta.env.VITE_DEVTO_API_URL as string) ?? 'https://dev.to/api';
const REDDIT_API = (import.meta.env.VITE_REDDIT_API_URL as string) ?? 'https://www.reddit.com';
const HN_API = 'https://hn.algolia.com/api/v1';
const SO_API = 'https://api.stackexchange.com/2.3';
const LOBSTERS_API = 'https://lobste.rs';

const GITHUB_TOKEN = (import.meta.env.VITE_GITHUB_TOKEN as string) ?? undefined;

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

/** Dépôts GitHub tendance (créés le mois dernier, triés par étoiles). */
export async function fetchGithubTrending(perPage = 12): Promise<FeedPost[]> {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const url = `${GITHUB_API}/search/repositories?q=created:%3E${since}&sort=stars&order=desc&per_page=${perPage}`;

  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = (await res.json()) as { items: GitHubRepo[] };

  return json.items.map((repo) => ({
    source: 'github',
    source_url: repo.html_url,
    authorName: repo.owner.login,
    authorAvatar: repo.owner.avatar_url,
    authorUrl: `https://github.com/${repo.owner.login}`,
    title: repo.full_name,
    content: `🚀 Nouveau repo tendance : **${repo.full_name}**\n${repo.description ?? ''}\n⭐ ${fmt(repo.stargazers_count)} · 🍴 ${fmt(repo.forks_count)}${repo.language ? ` · ${repo.language}` : ''}`,
    created_at: repo.created_at,
    meta: { stars: repo.stargazers_count, language: repo.language },
  }));
}

/** Activité GitHub d'un utilisateur réel (événements publics). */
export async function fetchGithubUserActivity(
  username: string,
  perPage = 20,
): Promise<FeedPost[]> {
  const url = `${GITHUB_API}/users/${username}/events/public?per_page=${perPage}`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const events = (await res.json()) as Array<{
    type: string;
    created_at: string;
    repo: { name: string; url: string };
    actor: { login: string; avatar_url: string };
    payload: { action?: string; ref?: string; size?: number };
  }>;

  const actionLabels: Record<string, string> = {
    PushEvent: 'a poussé du code vers',
    CreateEvent: 'a créé la branche',
    PullRequestEvent: 'a ouvert une pull request sur',
    IssuesEvent: 'a interagi avec les issues de',
    WatchEvent: 'a mis en vedette',
    ForkEvent: 'a forké',
    ReleaseEvent: 'a publié une release sur',
    IssueCommentEvent: 'a commenté une issue de',
  };

  return events
    .filter((e) => e.repo)
    .map((e) => ({
      source: 'github',
      source_url: `https://github.com/${e.repo.name}`,
      authorName: e.actor.login,
      authorAvatar: e.actor.avatar_url,
      authorUrl: `https://github.com/${e.actor.login}`,
      title: e.repo.name,
      content: `${actionLabels[e.type] ?? 'a eu une activité sur'} **${e.repo.name}**${e.payload.ref ? ` (${e.payload.ref.replace('refs/heads/', '')})` : ''}`,
      created_at: e.created_at,
    }));
}

/** Articles tech réels depuis Dev.to. */
export async function fetchDevToArticles(perPage = 10): Promise<FeedPost[]> {
  const res = await fetch(`${DEVTO_API}/articles?state=rising&per_page=${perPage}`, {
    headers: { Accept: 'application/vnd.forem.api-v1+json' },
  });
  if (!res.ok) throw new Error(`Dev.to API ${res.status}`);
  const articles = (await res.json()) as Array<{
    title: string;
    url: string;
    description: string;
    user: { name: string; username: string; profile_image: string };
    cover_image: string | null;
    published_at: string;
  }>;

  return articles.map((a) => ({
    source: 'devto',
    source_url: a.url,
    authorName: a.user.name,
    authorAvatar: a.user.profile_image,
    authorUrl: `https://dev.to/${a.user.username}`,
    title: a.title,
    content: a.description,
    image_url: a.cover_image,
    created_at: a.published_at,
  }));
}

/** Posts dev réels depuis Reddit (r/programming, r/webdev…). */
export async function fetchRedditDevPosts(
  subreddits = ['programming', 'webdev', 'devops', 'cybersecurity'],
  limit = 25,
): Promise<FeedPost[]> {
  const posts: FeedPost[] = [];
  await Promise.all(
    subreddits.map(async (sub) => {
      const res = await fetch(`${REDDIT_API}/r/${sub}/hot.json?limit=${Math.ceil(limit / subreddits.length)}`, {
        headers: { 'User-Agent': 'SyntaxHub/1.0' },
      });
      if (!res.ok) return;
      const json = await res.json();
      const children = json?.data?.children ?? [];
      children.forEach((child: { data: { title: string; url: string; selftext: string; author: string; num_comments: number; score: number; permalink: string; created_utc: number; thumbnail: string } }) => {
        const d = child.data;
        posts.push({
          source: 'reddit',
          source_url: `https://www.reddit.com${d.permalink}`,
          authorName: d.author,
          authorAvatar: `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${Math.floor(Math.random() * 6)}.png`,
          authorUrl: `https://www.reddit.com/u/${d.author}`,
          title: d.title,
          content: d.selftext?.slice(0, 300) || d.title,
          image_url: d.thumbnail?.startsWith('http') ? d.thumbnail : null,
          created_at: new Date(d.created_utc * 1000).toISOString(),
          meta: { subreddit: `r/${sub}` },
        });
      });
    }),
  );
  return posts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

/** Articles dev réels depuis Hacker News (Algolia search). */
export async function fetchHackerNews(perPage = 10): Promise<FeedPost[]> {
  const url = `${HN_API}/search?tags=front_page&hitsPerPage=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HN API ${res.status}`);
  const json = (await res.json()) as {
    hits: Array<{
      title: string;
      url: string | null;
      points: number;
      num_comments: number;
      author: string;
      created_at: string;
      objectID: string;
    }>;
  };

  return json.hits.map((h) => ({
    source: 'hackernews',
    source_url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
    authorName: h.author,
    authorAvatar: 'https://news.ycombinator.com/favicon.ico',
    authorUrl: `https://news.ycombinator.com/user?id=${h.author}`,
    title: h.title,
    content: `Discussion sur Hacker News — ${h.num_comments} commentaires, ${h.points} points.`,
    created_at: h.created_at,
    meta: { points: h.points },
  }));
}

/** Questions Stack Overflow populaires (site "stackoverflow"). */
export async function fetchStackOverflow(perPage = 10): Promise<FeedPost[]> {
  const url = `${SO_API}/questions?site=stackoverflow&sort=hot&pagesize=${perPage}&filter=withbody`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`StackExchange API ${res.status}`);
  const json = (await res.json()) as {
    items: Array<{
      title: string;
      link: string;
      owner: { display_name: string; profile_image: string | null; link: string };
      answer_count: number;
      view_count: number;
      score: number;
      creation_date: number;
      tags: string[];
    }>;
  };

  return json.items.map((q) => ({
    source: 'stackoverflow',
    source_url: q.link,
    authorName: q.owner.display_name,
    authorAvatar: q.owner.profile_image ?? 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
    authorUrl: q.owner.link,
    title: q.title,
    content: `${q.tags.map((t) => `#${t}`).join(' ')} — ${q.answer_count} réponses, ${fmt(q.view_count)} vues, ${q.score} votes.`,
    created_at: new Date(q.creation_date * 1000).toISOString(),
    meta: { language: q.tags[0] ?? null },
  }));
}

/** Articles Hashnode (GraphQL public). */
export async function fetchHashnode(perPage = 10): Promise<FeedPost[]> {
  const query = {
    query: `query Feed($page: Int!) {
      publication(host: "hashnode.com") {
        posts(page: $page, pageSize: 10) {
          title url publishedAt brief
          author { name username profilePicture }
          coverImage { url }
        }
      }
    }`,
    variables: { page: 0 },
  };
  const res = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!res.ok) throw new Error(`Hashnode API ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      publication?: {
        posts: Array<{
          title: string;
          url: string;
          publishedAt: string;
          brief: string;
          author: { name: string; username: string; profilePicture: string };
          coverImage: { url: string } | null;
        }>;
      };
    };
  };

  const posts = json?.data?.publication?.posts ?? [];
  return posts.slice(0, perPage).map((p) => ({
    source: 'hashnode',
    source_url: p.url,
    authorName: p.author.name,
    authorAvatar: p.author.profilePicture,
    authorUrl: `https://hashnode.com/@${p.author.username}`,
    title: p.title,
    content: p.brief,
    image_url: p.coverImage?.url ?? null,
    created_at: p.publishedAt,
  }));
}

/** Histoires Lobste.rs (nouveautés / nouvelles du jour). */
export async function fetchLobsters(perPage = 10): Promise<FeedPost[]> {
  const url = `${LOBSTERS_API}/newest.json?limit=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Lobste.rs API ${res.status}`);
  const items = (await res.json()) as Array<{
    title: string;
    url: string;
    short_id: string;
    score: number;
    comment_count: number;
    submitter_user: { username: string; avatar_url?: string };
    created_at: string;
    tags: string[];
  }>;

  return items.map((s) => ({
    source: 'lobsters',
    source_url: s.url,
    authorName: s.submitter_user.username,
    authorAvatar: s.submitter_user.avatar_url ?? 'https://lobste.rs/apple-touch-icon.png',
    authorUrl: `https://lobste.rs/u/${s.submitter_user.username}`,
    title: s.title,
    content: `${s.tags.map((t) => `#${t}`).join(' ')} — ${s.score} points, ${s.comment_count} commentaires.`,
    created_at: s.created_at,
    meta: { points: s.score },
  }));
}

/** Agrège le flux externe réel toutes sources confondues. */
export async function fetchExternalFeed(): Promise<FeedPost[]> {
  const [github, devto, reddit, hn, so, hashnode, lobsters] = await Promise.all([
    fetchGithubTrending().catch(() => []),
    fetchDevToArticles().catch(() => []),
    fetchRedditDevPosts().catch(() => []),
    fetchHackerNews().catch(() => []),
    fetchStackOverflow().catch(() => []),
    fetchHashnode().catch(() => []),
    fetchLobsters().catch(() => []),
  ]);
  return [...github, ...devto, ...reddit, ...hn, ...so, ...hashnode, ...lobsters].sort(
    (a, b) => (a.created_at < b.created_at ? 1 : -1),
  );
}

export const formatCount = fmt;
