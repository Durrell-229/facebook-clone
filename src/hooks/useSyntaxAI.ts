import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

const FUNCTION_URL =
  `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/syntax-ai`;

/** Appelle l'edge function Syntax AI (clé API côté serveur, jamais exposée). */
export function useSyntaxAI() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je suis **Syntax AI**, votre assistant développeur. Posez-moi des questions sur le code, la sécurité, les carrières tech…',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (content: string) => {
    if (!content.trim() || loading) return;
    setError(null);

    const userMsg: AIMessage = { role: 'user', content: content.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Session expirée. Reconnectez-vous.');

      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
        body: JSON.stringify({
          messages: history
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer ?? '' }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return { messages, loading, error, send, reset };
}
