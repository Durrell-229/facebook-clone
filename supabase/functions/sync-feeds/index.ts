// SyntaxHub — Edge Function : synchronise les vraies sources externes
// (GitHub tendances, Dev.to, Reddit, Hacker News, Stack Overflow, Hashnode,
// Lobste.rs) vers les tables posts & news.
//
// Déploiement :
//   supabase functions deploy sync-feeds --no-verify-jwt
// Appel (manuel ou pg_cron) :
//   curl -X POST https://<projet>.supabase.co/functions/v1/sync-feeds \
//     -H "Authorization: Bearer <SERVICE_ROLE_KEY>"

import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const githubToken = Deno.env.get('GITHUB_TOKEN') ?? undefined;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const GITHUB_API = 'https://api.github.com';
const DEVTO_API = 'https://dev.to/api';
const REDDIT_API = 'https://www.reddit.com';
const HN_API = 'https://hn.algolia.com/api/v1';
const SO_API = 'https://api.stackexchange.com/2.3';
const LOBSTERS_API = 'https://lobste.rs';

async function githubTrending(perPage = 10) {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const url = `${GITHUB_API}/search/repositories?q=created:%3E${since}&sort=stars&order=desc&per_page=${perPage}`;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.items ?? []).map((repo: any) => ({
    title: repo.full_name,
    content: `${repo.description ?? repo.full_name}`,
    source_url: repo.html_url,
    author_name: repo.owner.login,
    image_url: null,
    meta: { stars: repo.stargazers_count, language: repo.language, forks: repo.forks_count },
  }));
}

async function devToArticles(perPage = 8) {
  const res = await fetch(`${DEVTO_API}/articles?state=rising&per_page=${perPage}`, {
    headers: { Accept: 'application/vnd.forem.api-v1+json' },
  });
  if (!res.ok) return [];
  const articles = await res.json();
  return (articles ?? []).map((a: any) => ({
    title: a.title,
    content: a.description ?? a.title,
    source_url: a.url,
    author_name: a.user.name,
    image_url: a.cover_image ?? null,
    meta: { tags: a.tag_list },
  }));
}

async function redditPosts(limit = 12) {
  const subs = ['programming', 'webdev', 'devops', 'cybersecurity'];
  const posts: any[] = [];
  await Promise.all(
    subs.map(async (sub) => {
      const res = await fetch(`${REDDIT_API}/r/${sub}/hot.json?limit=${Math.ceil(limit / subs.length)}`, {
        headers: { 'User-Agent': 'SyntaxHub/1.0' },
      });
      if (!res.ok) return;
      const json = await res.json();
      const children = json?.data?.children ?? [];
      for (const child of children) {
        const d = child.data;
        posts.push({
          title: d.title,
          content: (d.selftext || d.title).slice(0, 280),
          source_url: `https://www.reddit.com${d.permalink}`,
          author_name: d.author,
          image_url: d.thumbnail?.startsWith('http') ? d.thumbnail : null,
          meta: { subreddit: `r/${sub}` },
        });
      }
    }),
  );
  return posts;
}

async function hackerNews(perPage = 8) {
  const res = await fetch(`${HN_API}/search?tags=front_page&hitsPerPage=${perPage}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.hits ?? []).map((h: any) => ({
    title: h.title,
    content: `${h.num_comments ?? 0} commentaires · ${h.points ?? 0} points`,
    source_url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
    author_name: h.author,
    image_url: null,
    meta: { points: h.points },
  }));
}

async function stackOverflow(perPage = 8) {
  const res = await fetch(`${SO_API}/questions?site=stackoverflow&sort=hot&pagesize=${perPage}`);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.items ?? []).map((q: any) => ({
    title: q.title,
    content: `${(q.tags ?? []).map((t: string) => `#${t}`).join(' ')} — ${q.answer_count ?? 0} réponses, ${q.view_count ?? 0} vues`,
    source_url: q.link,
    author_name: q.owner?.display_name ?? 'Stack Overflow',
    image_url: null,
    meta: { tags: q.tags },
  }));
}

async function hashnodePosts(perPage = 6) {
  const body = {
    query: `query Feed {
      publication(host: "hashnode.com") {
        posts(page: 0, pageSize: ${perPage}) {
          title url publishedAt brief
          author { name }
          coverImage { url }
        }
      }
    }`,
  };
  const res = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return [];
  const json = await res.json();
  const posts = json?.data?.publication?.posts ?? [];
  return posts.map((p: any) => ({
    title: p.title,
    content: p.brief ?? p.title,
    source_url: p.url,
    author_name: p.author?.name ?? 'Hashnode',
    image_url: p.coverImage?.url ?? null,
    meta: {},
  }));
}

async function lobsters(perPage = 8) {
  const res = await fetch(`${LOBSTERS_API}/newest.json?limit=${perPage}`);
  if (!res.ok) return [];
  const items = await res.json();
  return (items ?? []).map((s: any) => ({
    title: s.title,
    content: `${(s.tags ?? []).map((t: string) => `#${t}`).join(' ')} — ${s.score ?? 0} points`,
    source_url: s.url,
    author_name: s.submitter_user?.username ?? 'Lobste.rs',
    image_url: null,
    meta: { points: s.score },
  }));
}

async function ensureBotProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', 'syntaxhub')
    .maybeSingle();
  if (!error && data) return data.id;

  const { data: auth } = await supabase.auth.admin.createUser({
    email: 'bot@syntaxhub.dev',
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: {
      full_name: 'SyntaxHub Bot',
      user_name: 'syntaxhub',
      avatar_url: 'https://random.imagecdn.app/200/200',
    },
  });
  const id = auth?.user?.id;
  if (id) return id;
  return null;
}

Deno.serve(async () => {
  try {
    const [github, devto, reddit, hn, so, hashnode, lobsters] = await Promise.all([
      githubTrending(),
      devToArticles(),
      redditPosts(),
      hackerNews(),
      stackOverflow(),
      hashnodePosts(),
      lobsters(),
    ]);

    const botId = await ensureBotProfile();
    if (!botId) throw new Error('Impossible de créer le profil bot');

    let inserted = 0;
    const posts = [...github, ...reddit, ...hn, ...so, ...lobsters];
    const news = [...devto, ...hashnode];

    for (const post of posts) {
      const { error } = await supabase.from('posts').insert({
        author_id: botId,
        content: post.content,
        source: post.source_url?.includes('github.com')
          ? 'github'
          : post.source_url?.includes('stackoverflow')
            ? 'stackoverflow'
            : post.source_url?.includes('lobste.rs')
              ? 'lobsters'
              : post.source_url?.includes('news.ycombinator') ||
                  post.source_url?.includes('hackernews')
                ? 'hackernews'
                : 'reddit',
        source_url: post.source_url,
        image_url: post.image_url ?? null,
      });
      if (!error) inserted += 1;
    }

    for (const article of news) {
      const { error } = await supabase.from('news').insert({
        title: article.title,
        summary: article.content,
        image: article.image_url,
        source: article.source_url?.includes('hashnode.com') ? 'hashnode' : 'devto',
        source_url: article.source_url,
        author: article.author_name,
      });
      if (!error) inserted += 1;
    }

    return new Response(
      JSON.stringify({ ok: true, inserted }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
