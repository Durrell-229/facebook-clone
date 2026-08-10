// SyntaxHub — Edge Function : Syntax AI
// Proxie les requêtes vers un fournisseur IA compatible OpenAI (OpenAI, Mistral,
// Groq, OpenRouter, Ollama…). La clé API est gardée côté serveur, jamais exposée.
//
// Variables d'environnement requises (Secrets) :
//   AI_API_KEY   — clé API du fournisseur IA
//   AI_BASE_URL  — ex. https://api.openai.com/v1 (OpenAI compatible)
//   AI_MODEL     — ex. gpt-4o-mini | mistral-small-latest | groq/llama-3.1-70b
// Déploiement :
//   supabase functions deploy syntax-ai

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Tu es "Syntax AI", l'assistant IA intégré de SyntaxHub, le réseau social des développeurs.
Tu aides les développeurs sur : la programmation (React, TypeScript, Node, Python…), la cybersécurité,
le DevOps, les bases de données, les carrières tech et la communauté dev.
Réponds de façon concise, précise et utile. Utilise du Markdown pour le code.`;

const allowedOrigins = ['syntaxhub.com', 'vercel.app'];

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  try {
    const url = new URL(origin);
    const okOrigin =
      !origin || allowedOrigins.some((o) => url.hostname === o || url.hostname.endsWith(`.${o}`));
    if (!okOrigin) {
      return new Response(JSON.stringify({ error: 'Origin non autorisée' }), {
        status: 403,
        headers: corsHeaders,
      });
    }
  } catch {
    // origin absente (curl) : on autorise, la clé reste serveur
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('AI_API_KEY');
  const baseUrl = Deno.env.get('AI_BASE_URL') ?? 'https://api.openai.com/v1';
  const model = Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini';

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Syntax AI non configuré (clé API manquante).' }),
      { status: 503, headers: corsHeaders },
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${anonKey}` } },
    });

    // Vérifie que l'appelant est authentifié (le JWT est validé par la gateway).
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentification requise' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: user } = await supabase.auth.getUser(jwt);
    if (!user.user) {
      return new Response(JSON.stringify({ error: 'Session invalide' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { messages, max_tokens } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages invalides' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const payload = {
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: max_tokens ?? 600,
      temperature: 0.4,
    };

    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return new Response(
        JSON.stringify({ error: `Erreur fournisseur IA (${upstream.status})`, detail }),
        { status: upstream.status, headers: corsHeaders },
      );
    }

    const data = await upstream.json();
    const answer = data?.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: corsHeaders },
    );
  }
});
