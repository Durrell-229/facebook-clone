import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSyntaxAI } from '../../../hooks/useSyntaxAI';

const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div
      className="text-[13.5px] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMd(content) }}
    />
  );
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMd(src: string): string {
  const lines = src.split('\n');
  const out: string[] = [];
  let inCode = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      out.push(inCode ? '</code></pre>' : '<pre class="ai-code"><code>');
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      out.push(esc(line));
      continue;
    }
    const bold = esc(line)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="ai-inline">$1</code>');
    out.push(`<p>${bold}</p>`);
  }
  if (inCode) out.push('</code></pre>');
  return out.join('');
}

const SyntaxAIWidget: React.FC = () => {
  const { user } = useAuth();
  const { messages, loading, error, send, reset } = useSyntaxAI();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input;
    setInput('');
    void send(text);
  };

  if (!user) return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[100] flex h-[540px] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f1b2d] shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-primary to-hub-violet px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                <i className="fas fa-robot text-sm" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Syntax AI</p>
                <p className="text-[11px] text-white/70">Assistant développeur</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={reset}
                title="Nouvelle conversation"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/15"
              >
                <i className="fas fa-plus text-sm" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/15"
              >
                <i className="fas fa-times text-sm" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-primary text-white'
                      : 'rounded-bl-sm border border-white/10 bg-[#1a2740] text-gray-100'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="text-[13.5px]">{m.content}</p>
                  ) : (
                    <MarkdownText content={m.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-[#1a2740] px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-hub-cyan [animation-delay:0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-hub-violet [animation-delay:0.2s]" />
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-white/10 bg-[#0b1220] px-3 py-3"
          >
            <div className="flex items-end gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question à Syntax AI…"
                className="flex-1 rounded-xl border border-white/10 bg-[#1a2740] px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
              >
                <i className="fas fa-paper-plane text-sm" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        title="Syntax AI"
        className="fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-hub-violet text-white shadow-xl shadow-primary/40 transition-transform hover:scale-105"
      >
        {open ? (
          <i className="fas fa-times text-lg" />
        ) : (
          <i className="fas fa-robot text-xl" />
        )}
      </button>
    </>
  );
};

export default SyntaxAIWidget;
