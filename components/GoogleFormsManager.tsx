import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon,
  Loader2Icon,
  BookOpenIcon,
  UsersIcon,
  FileQuestionIcon,
  InboxIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleFormsManagerProps {
  token: string;
}

interface FormFile {
  id: string;
  name: string;
  createdTime?: string;
  webViewLink?: string;
}

interface FormQuestionItem {
  itemId: string;
  title: string;
  description?: string;
  questionItem?: {
    question?: {
      questionId: string;
      choiceQuestion?: {
        type: string;
        options: { value: string }[];
      };
    };
  };
}

interface FormDetail {
  formId: string;
  title: string;
  description?: string;
  items?: FormQuestionItem[];
}

export const GoogleFormsManager: React.FC<GoogleFormsManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Lists state & loader
  const [formsArr, setFormsArr] = useState<FormFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Form elements
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormTitle, setSelectedFormTitle] = useState<string>('');
  const [formDetail, setFormDetail] = useState<FormDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  // Responses view block
  const [formResponses, setFormResponses] = useState<any[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Form Creator states
  const [isCreating, setIsCreating] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Drive files for the mimeType of Google Forms
  const listForms = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    try {
      let query = `mimeType = 'application/vnd.google-apps.form' and trashed = false`;
      if (searchQuery.trim() !== '') {
        query += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
      }
      
      const fields = 'files(id, name, createdTime, webViewLink)';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=20&orderBy=createdTime%20desc`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`List forms failed: ${response.status}`);
      const data = await response.json();
      setFormsArr(data.files || []);
    } catch (err: any) {
      console.error('[G_FORMS] List failed:', err);
      addLog('ERROR', `Google Forms index read failed: ${err.message}`);
    } finally {
      setIsLoadingList(false);
    }
  }, [token, searchQuery, addLog]);

  useEffect(() => {
    listForms();
  }, [token, listForms]);

  // Load detailed properties of selected form
  const fetchFormDetails = async (formId: string, title: string) => {
    setSelectedFormId(formId);
    setSelectedFormTitle(title);
    setFormDetail(null);
    setFormResponses([]);
    setIsLoadingDetail(true);

    try {
      const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Fetch form failed: ${response.status}`);
      const data = await response.json();
      setFormDetail({
        formId: data.formId,
        title: data.info?.title || title,
        description: data.info?.description || '',
        items: data.items || []
      });
      addLog('SYSTEM', `Successfully synchronized form schema for: ${title}`);
      
      // Attempt responses extraction in parallel (read-only)
      fetchFormResponses(formId);
    } catch (err: any) {
      addLog('ERROR', `Forms schema decoder error: ${err.message}`);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Extract Form submissions / responses
  const fetchFormResponses = async (formId: string) => {
    setIsLoadingResponses(true);
    try {
      const response = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFormResponses(data.responses || []);
        addLog('SYSTEM', `Extracted ${data.responses?.length || 0} user submissions for structural form: ${selectedFormTitle}`);
      } else {
        // Safe skip, forms API responses require separate scopes which we already requested!
        setFormResponses([]);
      }
    } catch (err) {
      console.warn('[G_FORMS] responses fetching skipped', err);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  // Create Google Form
  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const createResponse = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: newFormTitle,
            description: newFormDesc || 'Form initialized by Oracle systems.'
          }
        })
      });

      if (!createResponse.ok) throw new Error(`Form init returned status: ${createResponse.status}`);
      const info = await createResponse.json();

      addLog('SYSTEM', `Assembled Google Form node: ${newFormTitle} [ID: ${info.formId}]`);
      setNewFormTitle('');
      setNewFormDesc('');
      setIsCreating(false);
      listForms();

      // Load form details
      fetchFormDetails(info.formId, newFormTitle);
    } catch (err: any) {
      addLog('ERROR', `Form construction aborted: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
      
      {/* Left List Pane: Existing Form documents */}
      <div className="w-full md:w-80 flex flex-col min-h-0 bg-black/40 border border-slate-900 rounded p-3">
        
        {/* Search & Action Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
            <SearchIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Find form node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
            />
          </div>
          <button 
            onClick={listForms}
            className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-900 rounded bg-[#010102]"
            title="Refresh List"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`p-1 flex items-center justify-center rounded border transition-colors ${isCreating ? 'border-sky-500 text-sky-400 bg-sky-950/20' : 'border-slate-800 text-slate-400 hover:text-sky-400 bg-[#010102]'}`}
            title="Create Form Structure"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create Form inline card */}
        {isCreating && (
          <form onSubmit={handleCreateForm} className="mb-3 bg-[#050d18]/30 border border-sky-500/30 p-2.5 rounded font-mono flex flex-col gap-2">
            <span className="text-[9px] text-sky-400 font-bold tracking-wider uppercase flex items-center gap-1">
              <PlusIcon className="w-3 h-3" /> // INITIALIZE DOCUMENT STRUCT
            </span>
            <input 
              type="text"
              placeholder="FORM TITLE..."
              value={newFormTitle}
              onChange={(e) => setNewFormTitle(e.target.value)}
              required
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-sky-500 font-mono uppercase"
            />
            <input 
              type="text"
              placeholder="OPTIONAL DESCRIPTION..."
              value={newFormDesc}
              onChange={(e) => setNewFormDesc(e.target.value)}
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-sky-500 font-mono uppercase"
            />
            <div className="flex justify-end gap-1.5 text-[9px] mt-1">
              <button 
                type="button" 
                onClick={() => { setIsCreating(false); setNewFormTitle(''); setNewFormDesc(''); }}
                className="px-2 py-1 border border-slate-800 hover:bg-slate-900 rounded text-slate-400 uppercase font-bold"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-3 py-1 bg-sky-900/40 border border-sky-500 hover:bg-sky-800/50 text-sky-300 rounded uppercase font-bold flex items-center gap-1"
              >
                {isSubmitting && <Loader2Icon className="w-2.5 h-2.5 animate-spin" />}
                Publish
              </button>
            </div>
          </form>
        )}

        {/* Existing forms rendered */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-[10px] gap-2 font-mono">
              <Loader2Icon className="w-5 h-5 animate-spin text-sky-400" />
              <span>SYNCING SURVEY SCHEMAS...</span>
            </div>
          ) : formsArr.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-[9px] uppercase font-mono">
              No Survey configurations found
            </div>
          ) : (
            formsArr.map((form) => (
              <button
                key={form.id}
                onClick={() => fetchFormDetails(form.id, form.name)}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 border rounded transition-all ${selectedFormId === form.id ? 'border-sky-500 bg-sky-950/15' : 'border-slate-900 hover:border-slate-800 bg-[#050507]/40'}`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <ClipboardListIcon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedFormId === form.id ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className={`text-[11px] font-mono uppercase truncate ${selectedFormId === form.id ? 'text-sky-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {form.name}
                  </span>
                </div>
                <BookOpenIcon className={`w-3 h-3 text-sky-500/70 ${selectedFormId === form.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content Sheet: Question and Responses review */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-[#1e293b] rounded p-4 font-mono">
        {selectedFormId ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header section with Workspace webview link */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-900 mb-3.5">
              <div className="flex items-center gap-2">
                <ClipboardListIcon className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-widest">{selectedFormTitle}</span>
              </div>
              
              {formsArr.find(f => f.id === selectedFormId)?.webViewLink && (
                <a 
                  href={formsArr.find(f => f.id === selectedFormId)?.webViewLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[9px] font-bold text-sky-400 hover:text-sky-300 uppercase bg-sky-950/10 px-2 py-1 rounded border border-sky-800/40"
                >
                  <span>Build / view Form</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Split viewport for visual items mapping vs responses counter */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 text-slate-350">
              
              {/* Question list visualizer */}
              <div className="flex flex-col min-h-0 bg-black/35 border border-slate-900 rounded p-3">
                <span className="text-[9.5px] text-sky-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileQuestionIcon className="w-3.5 h-3.5 text-sky-400" /> INDEXED SURVEY QUESTIONS
                </span>
                
                {isLoadingDetail ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                    <Loader2Icon className="w-4 h-4 animate-spin text-sky-400 mb-1.5" />
                    <span>PARSING SURVEY OBJECT INDEX...</span>
                  </div>
                ) : !formDetail || !formDetail.items || formDetail.items.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-650 text-[9px] uppercase">
                    No Questions configured. Create a question structure in the workspace.
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 custom-scrollbar">
                    {formDetail.items.map((item, index) => (
                      <div key={item.itemId || index} className="p-2.5 border border-slate-900 bg-[#060608]/50 rounded mb-1 select-text">
                        <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wide">
                          {index + 1}. {item.title}
                        </div>
                        {item.description && (
                          <div className="text-[10px] text-slate-500 mt-1 font-sans">{item.description}</div>
                        )}
                        {item.questionItem?.question?.choiceQuestion && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {item.questionItem.question.choiceQuestion.options?.map((opt, i) => (
                              <span key={i} className="px-1.5 py-0.5 border border-slate-900 rounded bg-black/40 text-[9px] text-slate-400 uppercase">
                                [ ] {opt.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submissions count / stats module */}
              <div className="flex flex-col min-h-0 bg-black/35 border border-slate-900 rounded p-3">
                <span className="text-[9.5px] text-sky-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <InboxIcon className="w-3.5 h-3.5 text-sky-400" /> RESPONDENTS DATA FEED ({formResponses.length})
                </span>

                {isLoadingResponses ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                    <Loader2Icon className="w-4 h-4 animate-spin text-sky-400 mb-1.5" />
                    <span>PARSING RESPONDENTS STREAM...</span>
                  </div>
                ) : formResponses.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-600 gap-1 select-none">
                    <UsersIcon className="w-8 h-8 text-slate-800 mb-1 animate-pulse" />
                    <span className="text-[9.5px] uppercase">No submissions detected yet.</span>
                    <span className="text-[8.5px] text-slate-700 max-w-xs leading-relaxed">Share the live link in Workspace to gather answers.</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar select-text">
                    {formResponses.map((resItem, idx) => (
                      <div key={resItem.responseId || idx} className="p-2.5 border border-slate-900 bg-[#060608]/50 rounded">
                        <div className="flex justify-between text-[8px] text-slate-600 uppercase mb-1">
                          <span>Sender ID: {resItem.responseId?.substring(0, 8) || 'Unknown'}</span>
                          <span>{resItem.submittedTime ? new Date(resItem.submittedTime).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-350 space-y-1 mt-1 font-mono">
                          {resItem.answers ? Object.entries(resItem.answers).map(([key, val]: any, kIdx) => {
                            // Map matching form questions title
                            const qTitle = formDetail?.items?.find(it => it.questionItem?.question?.questionId === key)?.title || `Question [${key.substring(0,6)}]`;
                            const ansStr = val.textAnswers?.answers?.map((a: any) => a.value).join(', ') || '';
                            return (
                              <div key={kIdx} className="border-t border-slate-950 pt-1 select-text">
                                <span className="text-slate-500 block text-[9px] uppercase font-bold">{qTitle}:</span>
                                <span className="text-cyan-400 pl-1.5 font-sans break-words">{ansStr}</span>
                              </div>
                            );
                          }) : (
                            <span className="text-slate-600 text-[10px]">Blank submission details payload.</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 p-8">
            <ClipboardListIcon className="w-12 h-12 text-slate-900 mb-2 animate-pulse" />
            <span className="text-[10px] tracking-widest font-mono uppercase">Select a surveys forms layout config to begin analyzing responses feed.</span>
          </div>
        )}
      </div>

    </div>
  );
};
