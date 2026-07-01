import React, { useState, useEffect, useCallback } from 'react';
import { 
  UsersIcon, 
  PlusIcon, 
  Trash2Icon, 
  SearchIcon, 
  RefreshCwIcon, 
  Loader2Icon,
  MailIcon,
  PhoneIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleContactsManagerProps {
  token: string | null;
}

interface ContactPerson {
  resourceName: string; // e.g. "people/c1234567"
  etag: string;
  names?: Array<{ displayName: string; givenName?: string; familyName?: string }>;
  emailAddresses?: Array<{ value: string; type?: string }>;
  phoneNumbers?: Array<{ value: string; type?: string }>;
  photos?: Array<{ url: string; default?: boolean }>;
}

export const GoogleContactsManager: React.FC<GoogleContactsManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Contact form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Fetch Google Connections
  const fetchContacts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Endpoint: GET https://people.googleapis.com/v1/people/me/connections
      const res = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=100', 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        throw new Error(`Google Connections error: status ${res.status}`);
      }

      const data = await res.json();
      setContacts(data.connections || []);
    } catch (err: any) {
      console.error('[G_PEOPLE] Fetch connections failed:', err);
      addLog('ERROR', `Google Contacts sync failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, addLog]);

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token, fetchContacts]);

  // Handle Create Contact
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!givenName.trim() && !familyName.trim()) return;

    setIsSubmitting(true);
    try {
      // Assemble Person Payload
      const payload: Record<string, any> = {
        names: [
          {
            givenName: givenName.trim(),
            familyName: familyName.trim()
          }
        ]
      };

      if (emailAddress.trim()) {
        payload.emailAddresses = [{ value: emailAddress.trim(), type: 'work' }];
      }

      if (phoneNumber.trim()) {
        payload.phoneNumbers = [{ value: phoneNumber.trim(), type: 'mobile' }];
      }

      // Endpoint: POST https://people.googleapis.com/v1/people:createContact
      const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Google Contacts creation rejected client with status ${res.status}`);
      }

      const freshContact = await res.json();
      const formatName = [givenName, familyName].filter(Boolean).join(' ');
      addLog('SYSTEM', `Created Google Contact connection: "${formatName}"`);
      
      // Clean up interface state
      setGivenName('');
      setFamilyName('');
      setEmailAddress('');
      setPhoneNumber('');
      setShowCreateForm(false);
      
      // Push into state list
      setContacts(prev => [freshContact, ...prev]);
    } catch (err: any) {
      addLog('ERROR', `Google Contact formulation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Safe Remove connection
  const handleDeleteContact = async (contact: ContactPerson) => {
    if (!token) return;
    const displayName = contact.names?.[0]?.displayName || 'Unidentified Connection';
    
    const confirmed = window.confirm(
      `Sovereign Action Requested: Do you intend to delete "${displayName}" permanently from your Google Contacts? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      // Endpoint: DELETE https://people.googleapis.com/v1/{resourceName}:deleteContact
      const res = await fetch(`https://people.googleapis.com/v1/${contact.resourceName}:deleteContact`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Delete request failed with status: ${res.status}`);
      }

      addLog('SYSTEM', `Successfully deleted contact connection: "${displayName}"`);
      setContacts(prev => prev.filter(c => c.resourceName !== contact.resourceName));
    } catch (err: any) {
      addLog('ERROR', `Failed to purge Google Contact: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMonogram = (contact: ContactPerson) => {
    const nameObj = contact.names?.[0];
    if (nameObj?.displayName) {
      return nameObj.displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    return '?';
  };

  const filteredContacts = contacts.filter(c => {
    const nameMatch = c.names?.some(n => n.displayName?.toLowerCase().includes(searchQuery.toLowerCase()));
    const emailMatch = c.emailAddresses?.some(e => e.value.toLowerCase().includes(searchQuery.toLowerCase()));
    const phoneMatch = c.phoneNumbers?.some(p => p.value.includes(searchQuery));
    return nameMatch || emailMatch || phoneMatch;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 animate-fadeIn font-mono">
      
      {/* Search / Control panel left side */}
      <div className="w-full md:w-80 bg-[#010103]/65 border border-slate-900 rounded p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">// CONNECTIONS INDEX</span>
          <button 
            onClick={fetchContacts}
            style={{ cursor: 'pointer' }}
            disabled={isLoading}
            className="p-1 hover:bg-slate-950 text-slate-500 hover:text-cyan-400 border border-slate-950 hover:border-slate-800 rounded transition-colors"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 font-sans leading-relaxed uppercase tracking-wider">
          Query connections, search address credentials, and formulation profiles on your Google Cloud profile securely linked with sovereign tokens.
        </p>

        {/* Search */}
        <div className="relative flex items-center bg-[#050508] border border-slate-900 focus-within:border-cyan-500/50 rounded-lg">
          <SearchIcon className="w-3.5 h-3.5 text-slate-650 absolute left-3" />
          <input 
            type="text"
            placeholder="SEARCH CONNECTIONS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none uppercase placeholder:text-slate-650"
          />
        </div>

        {/* Add Contact Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{ cursor: 'pointer' }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            <UserPlusIcon className="w-4 h-4 text-cyan-400" />
            <span>Formulate Contact Connection</span>
          </button>
        )}

        {/* Show add form if expanding */}
        {showCreateForm && (
          <form onSubmit={handleCreateContact} className="bg-slate-950/80 border border-cyan-500/30 p-3 rounded-lg flex flex-col gap-3.5 animate-fadeIn">
            <div className="flex justify-between items-center bg-transparent">
              <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest leading-none">// FORMULATE PROFILE</span>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="text-slate-500 hover:text-white text-xs font-bold leading-none"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-2 text-left">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 uppercase tracking-wide">First Name</label>
                  <input 
                    type="text" 
                    placeholder="GIVEN..."
                    value={givenName} 
                    onChange={e => setGivenName(e.target.value)}
                    className="w-full bg-black text-[9px] px-2 py-1.5 rounded border border-slate-900 focus:border-cyan-500 outline-none uppercase text-slate-200" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-slate-500 uppercase tracking-wide">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="FAMILY..." 
                    value={familyName} 
                    onChange={e => setFamilyName(e.target.value)}
                    className="w-full bg-black text-[9px] px-2 py-1.5 rounded border border-slate-900 focus:border-cyan-500 outline-none uppercase text-slate-200" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] text-slate-500 uppercase tracking-wide">Email Coordinates</label>
                <input 
                  type="email" 
                  placeholder="USER@HOST.COM..." 
                  value={emailAddress} 
                  onChange={e => setEmailAddress(e.target.value)}
                  className="w-full bg-black text-[9px] px-2.5 py-1.5 rounded border border-slate-900 focus:border-cyan-500 outline-none uppercase text-slate-200" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] text-slate-500 uppercase tracking-wide">Telephone Connection</label>
                <input 
                  type="text" 
                  placeholder="+1 (555) 555-5555..." 
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full bg-black text-[9px] px-2.5 py-1.5 rounded border border-slate-900 focus:border-cyan-500 outline-none uppercase text-slate-200" 
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ cursor: 'pointer' }}
              disabled={isSubmitting || (!givenName.trim() && !familyName.trim())}
              className="w-full py-2 bg-cyan-900/40 border border-cyan-500/60 hover:bg-cyan-850 text-[10px] text-cyan-300 rounded font-bold uppercase cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2Icon className="w-3 h-3 animate-spin mx-auto text-cyan-400" />
              ) : (
                'COMPILE PROFILE'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Grid listing profile records (Right side) */}
      <div className="flex-1 bg-black/60 border border-slate-900 rounded p-4 flex flex-col min-h-0 relative">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 select-none">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-slate-500" />
            <span>SYNCHRONIZED CONTACT FEEDS</span>
          </span>
          <span className="text-[8px] bg-cyan-950/25 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-400 font-bold uppercase tracking-wider">
            {contacts.length} connections
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20">
              <Loader2Icon className="w-6 h-6 animate-spin text-cyan-500" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Querying global directory connections...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-900 rounded-lg text-slate-650 h-full">
              <UsersIcon className="w-8 h-8 opacity-10 mb-1" />
              <span className="text-[10px] uppercase tracking-wide">No Connections Registered.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredContacts.map((contact) => {
                const displayName = contact.names?.[0]?.displayName || 'Unidentified connection';
                const mainEmail = contact.emailAddresses?.[0]?.value;
                const mainPhone = contact.phoneNumbers?.[0]?.value;
                const photoSrc = contact.photos?.find(p => !p.default)?.url;

                return (
                  <div 
                    key={contact.resourceName}
                    className="p-3 bg-[#050508]/60 hover:bg-[#08080c]/80 border border-slate-900 rounded-lg flex items-center justify-between gap-3 group animate-fadeIn transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      
                      {/* Photo / initials */}
                      {photoSrc ? (
                        <img 
                          src={photoSrc} 
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-slate-800 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                          {getMonogram(contact)}
                        </div>
                      )}

                      {/* Info coordinates */}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-200 uppercase truncate block select-all font-mono leading-tight pr-1">
                          {displayName}
                        </span>
                        
                        {mainEmail && (
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-450 uppercase truncate leading-none mt-1.5 select-all">
                            <MailIcon className="w-3 h-3 text-cyan-500/75 flex-shrink-0" />
                            <span className="truncate">{mainEmail}</span>
                          </div>
                        )}

                        {mainPhone && (
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-450 uppercase truncate leading-none mt-1 select-all">
                            <PhoneIcon className="w-3 h-3 text-emerald-500/75 flex-shrink-0" />
                            <span className="truncate">{mainPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteContact(contact)}
                      className="p-1.5 text-slate-600 hover:text-danger rounded hover:bg-black/20 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title="Purge Connection"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
