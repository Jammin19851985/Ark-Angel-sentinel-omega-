import React, { useState, useEffect } from 'react';
import { 
  FolderPlusIcon, 
  ExternalLinkIcon, 
  DownloadIcon, 
  SearchIcon, 
  FileTextIcon, 
  Loader2Icon,
  PlayIcon,
  FileIcon,
  CheckIcon,
  CopyIcon,
  Trash2Icon,
  HardDriveIcon,
  SparklesIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GooglePickerManagerProps {
  token: string | null;
}

interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  pickedAt: string;
}

export const GooglePickerManager: React.FC<GooglePickerManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  const [selectedFiles, setSelectedFiles] = useState<PickedFile[]>(() => {
    const saved = localStorage.getItem('sovereign_picker_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [manualIdInput, setManualIdInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync picked history to local storage
  useEffect(() => {
    localStorage.setItem('sovereign_picker_history', JSON.stringify(selectedFiles));
  }, [selectedFiles]);

  // Load a remote script dynamically
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script loading failure: ${src}`));
      document.head.appendChild(script);
    });
  };

  // Launch standard Google Picker overlay dynamically
  const launchGooglePicker = async () => {
    if (!token) return;
    setIsLoading(true);
    addLog('SYSTEM', 'Initiating dynamic script injection for Google Picker & Identity Libraries...');
    
    try {
      // 1. Ingress both prerequisite libraries
      await loadScript('https://apis.google.com/js/api.js');
      await loadScript('https://accounts.google.com/gsi/client');
      
      const gapi = (window as any).gapi;
      if (!gapi) {
        throw new Error('GAPI library failed to define in global namespaces.');
      }

      // 2. Load Picker component
      gapi.load('picker', {
        callback: () => {
          try {
            const google = (window as any).google;
            if (!google || !google.picker) {
              throw new Error('Google Picker namespace is unavailable.');
            }

            // 3. Formulate and launch PickerBuilder
            const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
              .setSelectFolderEnabled(true)
              .setParent('root');

            const picker = new google.picker.PickerBuilder()
              .addView(view)
              .setOAuthToken(token)
              .setCallback((data: any) => {
                if (data.action === google.picker.Action.PICKED) {
                  const doc = data.docs[0];
                  if (doc) {
                    const freshPick: PickedFile = {
                      id: doc.id,
                      name: doc.name || 'UNTITLED GOOGLE DOCUMENT',
                      mimeType: doc.mimeType || 'unknown',
                      webViewLink: doc.url || `https://docs.google.com/document/d/${doc.id}`,
                      size: doc.sizeBytes ? doc.sizeBytes.toString() : undefined,
                      pickedAt: new Date().toISOString()
                    };

                    setSelectedFiles(prev => [freshPick, ...prev]);
                    addLog('SYSTEM', `Google Picker successfully imported file node: "${freshPick.name}" (${freshPick.id})`);
                  }
                }
              })
              .build();

            picker.setVisible(true);
            setIsLoading(false);
            addLog('SYSTEM', 'Active Google Picker dialog context active on browser windows.');
          } catch (e: any) {
            console.error('[PICKER_LOAD] Callback failed:', e);
            addLog('ERROR', `Google Picker library config initialization failed: ${e.message}`);
            setIsLoading(false);
          }
        },
        onerror: (err: any) => {
          throw new Error(`Google GAPI picker load failed: ${err}`);
        }
      });
    } catch (err: any) {
      console.error('[PICKER_INGRESS] Failed:', err);
      addLog('ERROR', `Failed to inject or construct Google Picker widget: ${err.message}. Running fallback metadata compiler instead.`);
      setIsLoading(false);
    }
  };

  // Fallback Manual File Import Logic (Resolves exact file specs via REST endpoints)
  const handleManualImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIdInput.trim() || !token) return;

    let targetFileId = manualIdInput.trim();
    
    // Auto-extract File ID from Google Docs/Drive URLs
    // E.g. https://docs.google.com/document/d/1A-bc_defG/edit
    if (targetFileId.includes('/d/')) {
      const match = targetFileId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        targetFileId = match[1];
      }
    } else if (targetFileId.toLowerCase().includes('id=')) {
      const match = targetFileId.match(/id=([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        targetFileId = match[1];
      }
    }

    setIsLoading(true);
    addLog('SYSTEM', `Resolving manual Google Document coordinates: "${targetFileId}"`);

    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${targetFileId}?fields=id,name,mimeType,size,webViewLink`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Drive metadata lookup failed: status ${res.status}`);
      }

      const doc = await res.json();
      const freshImport: PickedFile = {
        id: doc.id,
        name: doc.name || 'UNTITLED SECURE FILE',
        mimeType: doc.mimeType || 'unknown',
        webViewLink: doc.webViewLink || `https://drive.google.com/file/d/${doc.id}/view`,
        size: doc.size,
        pickedAt: new Date().toISOString()
      };

      setSelectedFiles(prev => [freshImport, ...prev]);
      setManualIdInput('');
      addLog('SYSTEM', `Successfully cataloged Google document coordinates: "${freshImport.name}"`);
    } catch (err: any) {
      addLog('ERROR', `Failed to resolve manual Google File coordinates: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const removePickedFile = (id: string) => {
    const file = selectedFiles.find(f => f.id === id);
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
    if (file) {
      addLog('SYSTEM', `Removed picked file entry tracker: "${file.name}"`);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 animate-fadeIn font-mono">
      
      {/* Selector Launcher left col */}
      <div className="flex-1 bg-[#010103]/65 border border-slate-900 rounded p-4 flex flex-col gap-4">
        
        <div className="flex items-center gap-2.5 border-b border-slate-900 pb-2">
          <SparklesIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">// GOOGLE PICKER RELAY</span>
        </div>

        <p className="text-[11px] text-slate-500 font-sans leading-relaxed uppercase tracking-wider">
          Dynamically summon Google's native secure document selector. Safely search, sort, and pickup sheets, presentation slide decks, images, or folder assets across your general Cloud Drive.
        </p>

        {/* Trigger button */}
        <button
          onClick={launchGooglePicker}
          disabled={isLoading || !token}
          style={{ cursor: 'pointer' }}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 text-xs tracking-widest font-bold uppercase rounded-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin text-cyan-400" />
              <span>COMMUNICATING WITH GOOGLE AUTH...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>LAUNCH GOOGLE PICKER OVERLAY</span>
            </>
          )}
        </button>

        {/* Fallback Manual Loader */}
        <form onSubmit={handleManualImport} className="border-t border-slate-900/60 pt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">// MANUAL ID/URL COUPLING</span>
            <span className="text-[9px] text-slate-600 font-sans uppercase">Does your browser security policy block overlays? Submit any Google Doc/Drive URL or plain File ID coordinates below instead.</span>
          </div>

          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="PASTE GOOGLE DRIVE URL OR FILE ID..."
              value={manualIdInput}
              onChange={(e) => setManualIdInput(e.target.value)}
              className="flex-1 bg-black text-[10px] px-2.5 py-1.5 rounded border border-slate-900 focus:border-cyan-500 outline-none uppercase text-slate-250 placeholder:text-slate-700"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !manualIdInput.trim()}
              style={{ cursor: 'pointer' }}
              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 hover:text-cyan-400 border border-slate-900 text-[10px] uppercase font-bold text-slate-500 rounded transition-colors"
            >
              RESOLVE
            </button>
          </div>
        </form>

      </div>

      {/* Selected Items Log List right col */}
      <div className="w-full md:w-85 bg-[#000000]/65 border border-slate-900 rounded p-4 flex flex-col gap-3 overflow-hidden">
        
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
            <HardDriveIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>PICKED TELEMETRY REGISTRY</span>
          </span>
          <span className="text-[8px] bg-cyan-950/20 border border-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-400 font-bold">
            {selectedFiles.length}
          </span>
        </div>

        {/* History of picked files */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
          {selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-900 rounded-lg text-slate-750 h-full">
              <FileIcon className="w-6 h-6 opacity-10 mb-2" />
              <span className="text-[9px] uppercase tracking-wide">Registry is empty.</span>
            </div>
          ) : (
            selectedFiles.map((file) => (
              <div 
                key={file.id}
                className="p-3 bg-[#050508]/80 border border-slate-900 rounded-lg flex flex-col gap-1.5 animate-fadeIn group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileTextIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-slate-200 select-all truncate block uppercase">{file.name}</span>
                  </div>

                  <button
                    onClick={() => removePickedFile(file.id)}
                    className="text-slate-650 hover:text-danger p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove item tracker"
                  >
                    <Trash2Icon className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-0.5 text-[8px] uppercase text-slate-500">
                  <span className="truncate select-all">ID: {file.id}</span>
                  <span className="truncate">Type: {file.mimeType.replace('application/vnd.google-apps.', '')}</span>
                </div>

                {/* Controls - URL copy */}
                <div className="h-[1.5px] bg-slate-950/80 my-1" />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => copyToClipboard(file.id)}
                    style={{ cursor: 'pointer' }}
                    className="flex items-center gap-1 text-[8px] text-slate-550 hover:text-cyan-400 uppercase font-mono cursor-pointer"
                  >
                    {copiedId === file.id ? (
                      <>
                        <CheckIcon className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">COPIED ID</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-3 h-3" />
                        <span>COPY FILE ID</span>
                      </>
                    )}
                  </button>

                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[8px] text-slate-550 hover:text-cyan-400 uppercase font-mono"
                    >
                      <span>LAUNCH DRIVE</span>
                      <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
