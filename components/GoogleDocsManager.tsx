import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileTextIcon, 
  PlusIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon,
  BookOpenIcon,
  Loader2Icon,
  ChevronRightIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleDocsManagerProps {
  token: string;
}

interface DocFile {
  id: string;
  name: string;
  createdTime?: string;
  webViewLink?: string;
}

export const GoogleDocsManager: React.FC<GoogleDocsManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Lists & loader
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected doc content display
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocTitle, setSelectedDocTitle] = useState<string>('');
  const [docBody, setDocBody] = useState<string>('');
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);

  // Document creation form State
  const [isCreating, setIsCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List Docs via Drive MIME type filter
  const listDocs = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    try {
      let query = `mimeType = 'application/vnd.google-apps.document' and trashed = false`;
      if (searchQuery.trim() !== '') {
        query += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
      }
      
      const fields = 'files(id, name, createdTime, webViewLink)';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=20&orderBy=createdTime%20desc`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`List documents failed code: ${response.status}`);
      const data = await response.json();
      setDocs(data.files || []);
    } catch (err: any) {
      console.error('[G_DOCS] List failed:', err);
      addLog('ERROR', `Google Docs synchronization failed: ${err.message}`);
    } finally {
      setIsLoadingList(false);
    }
  }, [token, searchQuery, addLog]);

  useEffect(() => {
    listDocs();
  }, [token, listDocs]);

  // Read structural content of selected doc
  const fetchDocContent = async (docId: string, title: string) => {
    setSelectedDocId(docId);
    setSelectedDocTitle(title);
    setIsLoadingDoc(true);
    setDocBody('');
    
    try {
      const response = await fetch(`https://docs.googleapis.com/v1/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Docs reader failed: ${response.status}`);
      const data = await response.json();
      
      // Extract pure text from structural elements
      let docText = '';
      if (data.body && data.body.content) {
        data.body.content.forEach((element: any) => {
          if (element.paragraph) {
            element.paragraph.elements?.forEach((elementPart: any) => {
              if (elementPart.textRun && elementPart.textRun.content) {
                docText += elementPart.textRun.content;
              }
            });
          } else if (element.table) {
            element.table.tableRows?.forEach((row: any) => {
              row.tableCells?.forEach((cell: any) => {
                cell.content?.forEach((cellEl: any) => {
                  cellEl.paragraph?.elements?.forEach((cellElPart: any) => {
                    if (cellElPart.textRun && cellElPart.textRun.content) {
                      docText += ` [Tabular: ${cellElPart.textRun.content.trim()}] `;
                    }
                  });
                });
              });
              docText += '\n';
            });
          }
        });
      }
      
      setDocBody(docText || 'No printable content found inside document node.');
      addLog('SYSTEM', `Retrieved cryptographic elements for Google Doc: ${title}`);
    } catch (err: any) {
      setDocBody(`Error accessing file blocks: ${err.message}`);
      addLog('ERROR', `Failed to load Document structured data: ${err.message}`);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Create Google Doc
  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !token) return;
    
    setIsSubmitting(true);
    try {
      // 1. Create document container
      const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newDocTitle })
      });
      
      if (!createResponse.ok) throw new Error(`Docs Creation status: ${createResponse.status}`);
      const newDoc = await createResponse.json();
      const documentId = newDoc.documentId;
      
      // 2. Insert initial content if provided
      if (initialContent.trim()) {
        await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: [
              {
                insertText: {
                  location: { index: 1 },
                  text: initialContent
                }
              }
            ]
          })
        });
      }
      
      addLog('SYSTEM', `Assembles document structure node: ${newDocTitle} [ID: ${documentId}]`);
      setNewDocTitle('');
      setInitialContent('');
      setIsCreating(false);
      listDocs();
      
      // Auto-load newly created document
      fetchDocContent(documentId, newDocTitle);
    } catch (err: any) {
      addLog('ERROR', `Doc construction sequence aborted: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
      
      {/* Left List Pane */}
      <div className="w-full md:w-80 flex flex-col min-h-0 bg-black/40 border border-slate-900 rounded p-3">
        
        {/* Search & Actions heading */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
            <SearchIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Filter Documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
            />
          </div>
          <button 
            onClick={listDocs}
            className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-900 rounded bg-[#010102]"
            title="Refresh Docs List"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`p-1 flex items-center justify-center rounded border transition-colors ${isCreating ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-slate-800 text-slate-400 hover:text-cyan-400 bg-[#010102]'}`}
            title="Compile New Doc"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline Create Doc Form */}
        {isCreating && (
          <form onSubmit={handleCreateDoc} className="mb-3 bg-[#050c07]/30 border border-emerald-500/30 p-2.5 rounded font-mono flex flex-col gap-2">
            <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1">
              <PlusIcon className="w-3 h-3" /> // CONSTRUCT DOCUMENT
            </span>
            <input 
              type="text"
              placeholder="DOC TITLE..."
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              required
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1 rounded outline-none focus:border-emerald-500 font-mono uppercase"
            />
            <textarea 
              placeholder="DOC CONTENT (OPTIONAL)..."
              value={initialContent}
              onChange={(e) => setInitialContent(e.target.value)}
              rows={3}
              className="bg-black border border-slate-900 text-slate-300 text-xs p-1.5 rounded outline-none focus:border-emerald-500 font-mono resize-none"
            />
            <div className="flex justify-end gap-1.5 text-[9px] mt-1">
              <button 
                type="button" 
                onClick={() => { setIsCreating(false); setNewDocTitle(''); setInitialContent(''); }}
                className="px-2 py-1 border border-slate-800 hover:bg-slate-900 rounded text-slate-400 uppercase font-bold"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-3 py-1 bg-emerald-900/40 border border-emerald-500 hover:bg-emerald-800/50 text-emerald-300 rounded uppercase font-bold flex items-center gap-1"
              >
                {isSubmitting && <Loader2Icon className="w-2.5 h-2.5 animate-spin" />}
                Publish
              </button>
            </div>
          </form>
        )}

        {/* Document list render */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-[10px] gap-2 font-mono">
              <Loader2Icon className="w-5 h-5 animate-spin text-cyan-400" />
              <span>SYNCING DOCUMENT RECORDS...</span>
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-[9px] uppercase font-mono">
              No Docs Nodes Found
            </div>
          ) : (
            docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => fetchDocContent(doc.id, doc.name)}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 border rounded transition-all ${selectedDocId === doc.id ? 'border-cyan-500 bg-cyan-950/15' : 'border-slate-900 hover:border-slate-800 bg-[#050507]/40'}`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <FileTextIcon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedDocId === doc.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className={`text-[11px] font-mono uppercase truncate ${selectedDocId === doc.id ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {doc.name}
                  </span>
                </div>
                <BookOpenIcon className={`w-3 h-3 text-slate-600 ${selectedDocId === doc.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content / Reading Pane */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-slate-900 rounded p-4 font-mono">
        {selectedDocId ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header / Meta */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-900 mb-3.5">
              <div className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-widest">{selectedDocTitle}</span>
              </div>
              {docs.find(d => d.id === selectedDocId)?.webViewLink && (
                <a 
                  href={docs.find(d => d.id === selectedDocId)?.webViewLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[9px] font-bold text-cyan-500 hover:text-cyan-400 uppercase bg-cyan-950/10 px-2 py-1 rounded border border-cyan-800/40"
                >
                  <span>Open in Workspace</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Structured Page Sheet view */}
            <div className="flex-1 overflow-y-auto bg-black/45 border border-slate-900 rounded p-4.5 font-sans text-stone-300 select-text text-sm leading-relaxed max-w-4xl mx-auto w-full custom-scrollbar">
              {isLoadingDoc ? (
                <div className="flex flex-col h-full items-center justify-center gap-3 font-mono text-slate-500 text-[10px]">
                  <Loader2Icon className="w-6 h-6 animate-spin text-cyan-400" />
                  <span>PARSING ENCRYPTED GOOGLE DOC TEXT RUNS...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans tracking-wide">
                  {docBody}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 p-8">
            <FileTextIcon className="w-12 h-12 text-slate-900 mb-2 animate-pulse" />
            <span className="text-[10px] tracking-widest font-mono uppercase">Select a document from the decrypt node registry to edit or inspect.</span>
          </div>
        )}
      </div>

    </div>
  );
};
