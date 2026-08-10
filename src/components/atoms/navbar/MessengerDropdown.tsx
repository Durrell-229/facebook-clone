import moment from 'moment';
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeConversations } from '../../../hooks/useRealtime';

const tabs = ['Tous', 'Non lus', 'Groupes', 'Communautés'];

function ChatItem({
  title,
  avatar,
  lastMessage,
  lastMessageAt,
  isGroup,
}: {
  title: string;
  avatar?: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  isGroup: boolean;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#1a2740] focus:outline-none">
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={title}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-hub-cyan text-white">
            <i className={`fas ${isGroup ? 'fa-users' : 'fa-user'} text-lg`} />
          </div>
        )}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0f1b2d] bg-green-500" />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[15px] font-semibold text-white">{title}</p>
        <div className="flex items-center gap-1">
          <p className="truncate text-[13px] text-gray-400">
            {lastMessage ?? 'Aucun message'}
          </p>
          {lastMessageAt && (
            <span className="flex-shrink-0 text-[12px] text-gray-400">
              · {moment(lastMessageAt).fromNow()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

const MessengerDropdown: React.FC = () => {
  const { user } = useAuth();
  const conversations = useRealtimeConversations(user?.id);
  const [activeTab, setActiveTab] = useState('Tous');

  const visible = conversations.filter((c) => {
    if (activeTab === 'Tous') return true;
    if (activeTab === 'Non lus') return c.unread;
    if (activeTab === 'Groupes') return c.is_group;
    return !c.is_group;
  });

  return (
    <div className="absolute right-0 top-12 w-[360px] rounded-2xl bg-[#0f1b2d] shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-2xl font-bold text-white">Messages</h2>
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a2740] text-white hover:bg-[#2a3b5a] focus:outline-none">
            <i className="fas fa-th text-[14px]" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a2740] text-white hover:bg-[#2a3b5a] focus:outline-none">
            <i className="fas fa-expand-alt text-[14px]" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a2740] text-white hover:bg-[#2a3b5a] focus:outline-none">
            <i className="fas fa-edit text-[14px]" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-full bg-[#1a2740] px-3 py-2">
          <i className="fas fa-search text-[13px] text-gray-400" />
          <input
            placeholder="Rechercher des messages"
            className="flex-1 bg-transparent text-[14px] text-white placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3 py-1 text-[14px] font-medium focus:outline-none ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-[#1a2740] text-white hover:bg-[#2a3b5a]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="overflow-y-auto px-2" style={{ maxHeight: '80vh' }}>
        {visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Aucune conversation pour l’instant.
          </p>
        ) : (
          visible.map((c) => (
            <ChatItem
              key={c.conversation_id}
              title={c.is_group && c.title ? c.title : (c.otherUser?.full_name ?? c.otherUser?.username ?? 'Membre')}
              avatar={c.otherUser?.avatar_url}
              lastMessage={c.lastMessage}
              lastMessageAt={c.lastMessageAt}
              isGroup={c.is_group}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#1a2740] px-4 py-3 text-center">
        <button className="text-[15px] font-semibold text-primary hover:underline focus:outline-none">
          Voir tous les messages
        </button>
      </div>
    </div>
  );
};

export default MessengerDropdown;
