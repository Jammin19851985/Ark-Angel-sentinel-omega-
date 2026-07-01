import React, { useState, useEffect, useCallback } from 'react';
import { 
  MailIcon, 
  SendIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  Loader2Icon,
  UserIcon,
  ClockIcon,
  PlusIcon,
  ChevronRightIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GmailManagerProps {
  token: string;
}

interface ThreadMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  sender: string;
  date: string;
  bodyText?: string;
}

export const GmailManager: React.FC<GmailManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Gmail state lists
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected message detail
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [activeMsg, setActiveMsg] = useState<ThreadMessage | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Compose / send state
  const [isComposing, setIsComposing] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Helper utility to parse Gmail headers list safely
  const extractHeader = (headers: { name: string; value: string }[], keyName: string): string => {
    const found = headers?.find(h => h.name.toLowerCase() === keyName.toLowerCase());
    return found ? found.value : '';
  };

  // Helper utility to decode email parts or full body recursively
  const decodeMessagePayload = (payload: any): string => {
    if (!payload) return '';
    
    // Check if body data exists directly
    if (payload.body && payload.body.data) {
      try {
        const decodedBytes = Uint8Array.from(
          atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/')),
          c => c.charCodeAt(0)
        );
        return new TextDecoder().decode(decodedBytes);
      } catch (e) {
        console.warn('Decode payload issue', e);
      }
    }
    
    // Recurse into message subparts
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          try {
            const decodedBytes = Uint8Array.from(
              atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/')),
              c => c.charCodeAt(0)
            );
            return new TextDecoder().decode(decodedBytes);
          } catch (e) {
            console.warn('Decode text part failure', e);
          }
        }
      }
      
      // Fallback first part
      return decodeMessagePayload(payload.parts[0]);
    }
    
    return '';
  };

  // Fetch email listing from user Gmail
  const loadEmails = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    setMessages([]);
    try {
      let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10';
      if (searchQuery.trim() !== '') {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Fetch message index status: ${response.status}`);
      const data = await response.json();
      const rawMessagesList = data.messages || [];

      // Sequentially fetch detailed subject and headers for each message
      const detailedMessagesList: ThreadMessage[] = [];
      for (const msg of rawMessagesList) {
        try {
          const detailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (detailResponse.ok) {
            const detail = await detailResponse.json();
            detailedMessagesList.push({
              id: detail.id,
              threadId: detail.threadId,
              snippet: detail.snippet || '',
              subject: extractHeader(detail.payload?.headers, 'Subject') || '(No Subject)',
              sender: extractHeader(detail.payload?.headers, 'From') || 'Unknown',
              date: extractHeader(detail.payload?.headers, 'Date') || ''
            });
          }
        } catch (detailErr) {
          console.error('Fetch message detail row skipped:', detailErr);
        }
      }

      setMessages(detailedMessagesList);
    } catch (err: any) {
      addLog('ERROR', `Gmail index synchronization failure: ${err.message}`);
    } finally {
      setIsLoadingList(false);
    }
  }, [token, searchQuery, addLog]);

  useEffect(() => {
    loadEmails();
  }, [token, loadEmails]);

  // Load complete email body
  const fetchMessageDetails = async (msg: ThreadMessage) => {
    setActiveMessageId(msg.id);
    setIsLoadingDetails(true);
    setActiveMsg(null);
    try {
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Fetch message envelope returned ${response.status}`);
      const info = await response.json();
      
      const fullText = decodeMessagePayload(info.payload);
      
      setActiveMsg({
        ...msg,
        bodyText: fullText || info.snippet || 'Blank body content.'
      });
      addLog('SYSTEM', `Analyzed inbound email node subject: ${msg.subject}`);
    } catch (err: any) {
      addLog('ERROR', `Failed to decrypt email content: ${err.message}`);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Compose and send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) return;

    setIsSending(true);
    try {
      // Craft standard MIME RFC 822 compliance email envelope
      const mimeMessage = [
        `To: ${emailTo.trim()}`,
        `Subject: ${emailSubject.trim()}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        emailBody
      ].join('\r\n');

      // Safe Base64URL encoding compliant with Gmail requirements
      const encodedMsg = btoa(new StellaEncoder().encode(mimeMessage))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMsg })
      });

      if (!response.ok) throw new Error(`Send returned status code ${response.status}`);
      
      addLog('SYSTEM', `Successfully dispatched outgoing email node to ${emailTo}: [${emailSubject}]`);
      
      // Cleanup compose state
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setIsComposing(false);
      
      // Reload inbox to catch sent item
      loadEmails();
    } catch (err: any) {
      addLog('ERROR', `Disruptions in SMTP outbox channel: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Helper StellaEncoder for safe utf8 values
  class StellaEncoder {
    encode(str: string): string {
      const utf8 = unescape(encodeURIComponent(str));
      return utf8;
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
      
      {/* Left List Pane */}
      <div className="w-full md:w-85 flex flex-col min-h-0 bg-black/40 border border-slate-900 rounded p-3">
        
        {/* Search header & Actions config */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
            <SearchIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search Mail (in:inbox)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
            />
          </div>
          <button 
            onClick={loadEmails}
            className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-900 rounded bg-[#010102]"
            title="Refresh Inbox"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsComposing(!isComposing)}
            className={`p-1 flex items-center justify-center rounded border transition-colors ${isComposing ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-950/20' : 'border-slate-800 text-slate-400 hover:text-fuchsia-400 bg-[#010102]'}`}
            title="Compose Email"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline Create Mail Compose Form */}
        {isComposing && (
          <form onSubmit={handleSendEmail} className="mb-3 bg-[#1e0717]/20 border border-fuchsia-500/30 p-3 rounded font-mono flex flex-col gap-2 animate-fadeIn">
            <span className="text-[9px] text-fuchsia-400 font-bold tracking-wider uppercase flex items-center gap-1">
              <MailIcon className="w-3 h-3" /> // DISPATCH COMPLIANT PAYLOAD
            </span>
            <input 
              type="email"
              placeholder="RECIPIENT EMAIL..."
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              required
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-fuchsia-500 font-mono"
            />
            <input 
              type="text"
              placeholder="SUBJECT HEADER..."
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              required
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-fuchsia-500 font-mono"
            />
            <textarea 
              placeholder="ENTER SECURE EMAIL DISPATCH DATA BODY..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={4}
              required
              className="bg-black border border-slate-900 text-slate-300 text-xs p-2 rounded outline-none focus:border-fuchsia-500 font-mono resize-none"
            />
            <div className="flex justify-end gap-1.5 text-[9px] mt-1">
              <button 
                type="button" 
                onClick={() => { setIsComposing(false); setEmailTo(''); setEmailSubject(''); setEmailBody(''); }}
                className="px-2 py-1 border border-slate-800 hover:bg-slate-900 rounded text-slate-400 uppercase font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSending}
                className="px-3.5 py-1 bg-fuchsia-900/40 border border-fuchsia-500 hover:bg-fuchsia-800/50 text-fuchsia-300 rounded uppercase font-bold flex items-center gap-1.5"
              >
                {isSending ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <SendIcon className="w-3 h-3" />}
                Transmit
              </button>
            </div>
          </form>
        )}

        {/* Inbox Email list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-[10px] gap-2 font-mono">
              <Loader2Icon className="w-5 h-5 animate-spin text-fuchsia-400" />
              <span>SYNCHRONIZING INBOUND MAILBOX...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-[9px] uppercase font-mono">
              Clear incoming queue
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => fetchMessageDetails(msg)}
                className={`w-full flex flex-col text-left px-3 py-2 border rounded transition-all ${activeMessageId === msg.id ? 'border-fuchsia-500 bg-fuchsia-950/15' : 'border-slate-950 bg-[#060608]/60 hover:border-slate-800'}`}
              >
                <div className="flex justify-between items-start gap-1 w-full mb-1">
                  <span className={`text-[10px] font-mono font-bold truncate max-w-[120px] ${activeMessageId === msg.id ? 'text-fuchsia-400' : 'text-slate-300'}`}>
                    {msg.sender.split('<')[0]}
                  </span>
                  <span className="text-[8px] font-mono text-slate-600 flex-shrink-0">
                    {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                  </span>
                </div>
                <span className={`text-[11px] font-mono leading-tight truncate w-full uppercase ${activeMessageId === msg.id ? 'text-fuchsia-300' : 'text-slate-400'}`}>
                  {msg.subject}
                </span>
                <span className="text-[10px] text-slate-600 truncate w-full font-sans mt-0.5 select-none">
                  {msg.snippet}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content / Message Reader pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-slate-900 rounded p-4 font-mono">
        {activeMsg ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header envelope structure */}
            <div className="border-b border-slate-900 pb-3.5 mb-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <MailIcon className="w-4 h-4 text-fuchsia-400" />
                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-widest leading-snug">{activeMsg.subject}</h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 font-mono text-[9px] text-slate-500 uppercase">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-slate-600" />
                  <span className="text-slate-400 select-all font-sans">{activeMsg.sender}</span>
                </div>
                <div className="hidden sm:block text-slate-850">|</div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3 h-3 text-slate-600" />
                  <span className="text-slate-400">{activeMsg.date}</span>
                </div>
              </div>
            </div>

            {/* Email Body decryption area */}
            <div className="flex-1 overflow-y-auto bg-black/45 border border-slate-900/75 rounded p-4 select-text text-slate-300 text-xs leading-relaxed font-sans custom-scrollbar">
              {isLoadingDetails ? (
                <div className="flex h-full flex-col items-center justify-center gap-2.5 text-slate-500 text-[10px] font-mono">
                  <Loader2Icon className="w-5 h-5 animate-spin text-fuchsia-400" />
                  <span>DECRYPTING SMTP CORRESPONDENCE BLOCK...</span>
                </div>
              ) : (
                <div className="whitespace-pre-line tracking-wide font-sans">
                  {activeMsg.bodyText}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 p-8">
            <MailIcon className="w-12 h-12 text-slate-900 mb-2 animate-pulse" />
            <span className="text-[10px] tracking-widest font-mono uppercase">Select an email message package to decipher communications.</span>
          </div>
        )}
      </div>

    </div>
  );
};
