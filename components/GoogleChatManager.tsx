import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquareIcon, 
  SendIcon, 
  PlusIcon, 
  RefreshCwIcon, 
  SearchIcon, 
  HashIcon, 
  UsersIcon, 
  Loader2Icon,
  SparklesIcon,
  XIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleChatManagerProps {
  token: string | null;
}

interface ChatSpace {
  name: string; // e.g. "spaces/AAAAMMM"
  displayName?: string;
  spaceType?: string; // "SPACE" or "DIRECT_MESSAGE"
  singleUserOnly?: boolean;
}

interface ChatMessage {
  name: string;
  sender?: {
    displayName?: string;
    avatarUrl?: string;
    email?: string;
  };
  text: string;
  createTime?: string;
}

export const GoogleChatManager: React.FC<GoogleChatManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [activeSpace, setActiveSpace] = useState<ChatSpace | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  
  const [newSpaceName, setNewSpaceName] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dual-mode support: If there's no native spaces (as consumer accounts start with 0 chat spaces),
  // we provide a sandbox visual simulation channel alongside the actual API channels.
  const [sandboxMessages, setSandboxMessages] = useState<ChatMessage[]>([
    {
      name: 'sandbox/m1',
      sender: { displayName: 'Sentinel Core Alpha', email: 'sentinel@g-pi.finance' },
      text: 'ARCHANGEL OMEGA UPLINK STABLE. This is a local sandbox companion space representing an active Google Chat channel.',
      createTime: new Date().toISOString()
    }
  ]);

  // Fetch list of Spaces (Google Chat Rooms/DMs)
  const listSpaces = useCallback(async () => {
    if (!token) return;
    setIsLoadingSpaces(true);
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 404) {
          // This happens when Google Chat API is not enabled or for consumer accounts without Chat
          console.warn('[G_CHAT] Google Chat API returned 404. Falling back to sandbox mode.');
          setSpaces([{ name: 'sandbox/m1', displayName: 'Sandbox Space' }]);
          return;
        }
        throw new Error(`Google Chat gateway returned status ${res.status}`);
      }
      
      const data = await res.json();
      const loadedSpaces: ChatSpace[] = data.spaces || [];
      setSpaces(loadedSpaces);
      
      // Auto-select first space if available
      if (loadedSpaces.length > 0 && !activeSpace) {
        setActiveSpace(loadedSpaces[0]);
      }
    } catch (err: any) {
      console.error('[G_CHAT] List failed:', err);
      addLog('ERROR', `Google Chat spaces query failed: ${err.message}`);
    } finally {
      setIsLoadingSpaces(false);
    }
  }, [token, activeSpace, addLog]);

  // Fetch messages from a specific Space
  const fetchMessages = useCallback(async (spaceName: string) => {
    if (!token) return;
    setIsLoadingMessages(true);
    try {
      // Endpoint syntax: GET https://chat.googleapis.com/v1/spaces/{spaceId}/messages
      const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Google Chat message stream failed: ${res.status}`);
      }
      
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      console.error('[G_CHAT] Messages fetch failed:', err);
      addLog('ERROR', `Failed to retrieve Chat messages for ${spaceName}: ${err.message}`);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [token, addLog]);

  useEffect(() => {
    if (token) {
      listSpaces();
    }
  }, [token, listSpaces]);

  useEffect(() => {
    if (activeSpace && !activeSpace.name.startsWith('sandbox/')) {
      fetchMessages(activeSpace.name);
    }
  }, [activeSpace, fetchMessages]);

  // Send message to active group space
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeSpace) return;
    
    const textToSend = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    if (activeSpace.name.startsWith('sandbox/')) {
      // Handle sandbox local companion flow with AI response
      const newUserMsg: ChatMessage = {
        name: `sandbox/m_${Date.now()}`,
        sender: { displayName: 'You (Sovereign Owner)' },
        text: textToSend,
        createTime: new Date().toISOString()
      };
      setSandboxMessages(prev => [...prev, newUserMsg]);
      
      setTimeout(() => {
        const aiReplies = [
          "Alpha Engine fully operational. Swarm telemetry parameters updated in real-time.",
          "Acknowledged, Sovereign Executive Optimizer. Financial resonance filters have been aligned.",
          "Understood. Command ledger logged on our Local Spanner nodes.",
          "Synchronized. Shall I draft a meeting plan or run an index simulation based on this code?"
        ];
        const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
        setSandboxMessages(prev => [...prev, {
          name: `sandbox/m_reply_${Date.now()}`,
          sender: { displayName: 'Sentinel Core Alpha', email: 'sentinel@g-pi.finance' },
          text: `[REPL] ${randomReply}`,
          createTime: new Date().toISOString()
        }]);
      }, 900);
      setIsSending(false);
      return;
    }

    try {
      // Endpoint design: POST https://chat.googleapis.com/v1/{spaceName}/messages
      const res = await fetch(`https://chat.googleapis.com/v1/${activeSpace.name}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textToSend })
      });
      
      if (!res.ok) throw new Error(`Status ${res.status}`);
      addLog('SYSTEM', `Dispatched secure room message to space ID: ${activeSpace.name}`);
      fetchMessages(activeSpace.name);
    } catch (err: any) {
      addLog('ERROR', `Failed to send Google Chat message: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Create Google Chat Space room
  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !token) return;

    try {
      // Endpoint: POST https://chat.googleapis.com/v1/spaces
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          space: {
            spaceType: 'SPACE',
            displayName: newSpaceName
          }
        })
      });

      if (!res.ok) throw new Error(`Constructor status: ${res.status}`);
      const data = await res.json();
      addLog('SYSTEM', `Constructed active Chat Space Room: "${newSpaceName}"`);
      setNewSpaceName('');
      setIsCreatingSpace(false);
      listSpaces();
    } catch (err: any) {
      addLog('ERROR', `Failed to spawn Chat space: ${err.message}`);
    }
  };

  const activeSpaceMessages = activeSpace?.name.startsWith('sandbox/') 
    ? sandboxMessages 
    : messages;

  const filteredSpaces = spaces.filter(s => 
    s.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative animate-fadeIn font-mono">
      
      {/* Sidebar: Chat spaces list */}
      <div className="w-full md:w-64 bg-[#010103]/75 border border-slate-900 rounded p-2 lg:p-3 flex flex-col gap-3 min-h-[180px] md:min-h-0 flex-shrink-0">
        
        {/* Search header & action */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">// CHANNELS</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={listSpaces}
              className="p-1 hover:bg-slate-950 hover:text-cyan-400 text-slate-500 border border-slate-950 hover:border-slate-800 rounded transition-colors cursor-pointer"
              title="Refresh spaces"
            >
              <RefreshCwIcon className={`w-3 h-3 ${isLoadingSpaces ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button 
              onClick={() => setIsCreatingSpace(true)}
              className="p-1 hover:bg-slate-950 hover:text-cyan-400 text-slate-500 border border-slate-950 hover:border-slate-800 rounded transition-colors cursor-pointer"
              title="Spawn Space Room"
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/50 rounded">
          <SearchIcon className="w-3 h-3 absolute left-2 text-slate-600" />
          <input 
            type="text" 
            placeholder="FILTER ROOMS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-[9px] text-slate-350 bg-transparent outline-none uppercase font-mono"
          />
        </div>

        {/* Space creation form Overlay/Inline */}
        {isCreatingSpace && (
          <form onSubmit={handleCreateSpace} className="bg-slate-950 border border-cyan-500/35 p-2 rounded flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-cyan-400 uppercase font-bold tracking-widest">New Room</span>
              <button 
                type="button" 
                onClick={() => setIsCreatingSpace(false)}
                className="text-slate-500 hover:text-white"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
            <input 
              type="text"
              placeholder="ROOM TITLE (e.g. general)..."
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              className="bg-black text-[10px] px-2 py-1 rounded border border-slate-900 outline-none focus:border-cyan-500 uppercase text-slate-200"
              autoFocus
            />
            <button 
              type="submit"
              className="bg-cyan-900/40 border border-cyan-500/60 hover:bg-cyan-800/50 text-[10px] text-cyan-300 py-1 rounded uppercase cursor-pointer text-center font-bold"
            >
              SPAWN ROOM
            </button>
          </form>
        )}

        {/* Channels scroll container */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {/* Static Sandbox companion space in light-emerald or deep blue */}
          <button
            onClick={() => setActiveSpace({ name: 'sandbox/companion', displayName: 'Sentinel Sandbox (AI Companion)', spaceType: 'SPACE' })}
            className={`w-full text-left px-2 py-2 rounded text-[10px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer uppercase select-none ${activeSpace?.name === 'sandbox/companion' ? 'bg-cyan-950/20 border-cyan-500 text-cyan-400 font-bold' : 'bg-slate-950/25 border-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-950/50'}`}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
            <span className="truncate">Sentinel Sandbox</span>
          </button>

          <div className="h-[1px] bg-slate-900/60 my-2" />

          {isLoadingSpaces ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
              <Loader2Icon className="w-4 h-4 animate-spin text-cyan-500" />
              <span className="text-[8px] tracking-widest">LOADING GRIDS...</span>
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="text-[8px] text-slate-600 text-center uppercase py-4">
              {token ? 'No active Google rooms found' : 'Connect auth to retrieve'}
            </div>
          ) : (
            filteredSpaces.map((space) => {
              const isActive = activeSpace?.name === space.name;
              return (
                <button
                  key={space.name}
                  onClick={() => setActiveSpace(space)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[10px] font-mono border truncate transition-all flex items-center gap-1.5 cursor-pointer uppercase ${isActive ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400 font-bold' : 'bg-[#030304]/40 border-slate-950 text-slate-500 hover:text-slate-350 hover:bg-slate-950/40'}`}
                >
                  {space.spaceType === 'DIRECT_MESSAGE' ? (
                    <UsersIcon className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <HashIcon className="w-3.5 h-3.5 text-cyan-600" />
                  )}
                  <span className="truncate">{space.displayName || space.name.replace('spaces/', 'room_')}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat view right panel */}
      <div className="flex-1 bg-black/60 border border-slate-900 rounded flex flex-col min-h-0">
        
        {/* Active room info bar */}
        <div className="flex justify-between items-center bg-black/45 px-3 py-2 border-b border-slate-900/50">
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              {activeSpace ? (activeSpace.displayName || activeSpace.name.replace('spaces/', 'room_')) : 'AWAITING SELECTION...'}
            </span>
          </div>
          <span className="text-[8px] text-slate-550 tracking-wider">
            {activeSpace?.name.startsWith('sandbox/') ? 'SANDBOX SECURE CHANNEL' : 'NATIVE WORKSPACE CHANNEL'}
          </span>
        </div>

        {/* Chat message display bubble board */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar relative flex flex-col">
          {isLoadingMessages ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20">
              <Loader2Icon className="w-5 h-5 animate-spin text-cyan-500" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Retrieving channel signals...</span>
            </div>
          ) : activeSpaceMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center p-3">
              <MessageSquareIcon className="w-8 h-8 opacity-15 mb-2" />
              <span className="text-[9px] tracking-wide uppercase">No messages recorded in this channel grid.</span>
              <span className="text-[8px] text-slate-700 uppercase mt-0.5">Publish a message to initiate synchronization feed blocks.</span>
            </div>
          ) : (
            activeSpaceMessages.map((msg, idx) => {
              const dateStr = msg.createTime ? new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={msg.name || idx} className="flex flex-col gap-1 items-start max-w-full">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold text-cyan-400 select-all font-mono">
                      {msg.sender?.displayName || 'Unknown Terminal'}
                    </span>
                    {msg.sender?.email && (
                      <span className="text-[8px] text-slate-600 select-all font-mono">
                        &lt;{msg.sender.email}&gt;
                      </span>
                    )}
                    <span className="text-[8px] text-slate-600 select-none">
                      {dateStr}
                    </span>
                  </div>
                  <div className="bg-[#030305]/60 hover:bg-[#07070a]/70 border border-slate-900 rounded p-2 text-xs text-slate-300 font-sans break-all select-text leading-relaxed w-full">
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form message sender input box */}
        <form onSubmit={handleSendMessage} className="border-t border-slate-900 bg-black/80 p-2.5 flex items-center gap-2 relative z-10">
          <input 
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={activeSpace ? `WRITE SECURE DISPATCH TO ${activeSpace.displayName || 'CHAT'}...` : 'SELECT AN ACTIVE SPACE CHANNEL...'}
            disabled={!activeSpace || isSending}
            className="flex-1 bg-transparent hover:bg-slate-950/20 px-2.5 py-1.5 border border-slate-900 rounded text-xs text-slate-200 font-mono focus:border-cyan-500 focus:bg-slate-950/40 outline-none uppercase placeholder:text-slate-650"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="p-1.5 text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-500/80 hover:bg-cyan-950/45 rounded transition-all transition-colors cursor-pointer disabled:text-slate-600 disabled:border-slate-900 disabled:bg-transparent"
          >
            {isSending ? (
              <Loader2Icon className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
          </button>
        </form>

      </div>
      
    </div>
  );
};
