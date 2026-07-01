import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileSpreadsheetIcon, 
  PlusIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon,
  Loader2Icon,
  PlayIcon,
  LayoutGridIcon,
  TableIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleSheetsManagerProps {
  token: string;
}

interface SheetFile {
  id: string;
  name: string;
  createdTime?: string;
  webViewLink?: string;
}

export const GoogleSheetsManager: React.FC<GoogleSheetsManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Lists & loader
  const [sheets, setSheets] = useState<SheetFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected spreadsheet states
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | null>(null);
  const [selectedSpreadsheetTitle, setSelectedSpreadsheetTitle] = useState<string>('');
  
  // Tab/Sheet state
  const [sheetTabs, setSheetTabs] = useState<string[]>([]);
  const [activeTabName, setActiveTabName] = useState<string>('');
  const [isSyncingMeta, setIsSyncingMeta] = useState(false);
  
  // Data Grid content state
  const [gridData, setGridData] = useState<string[][]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);

  // Appending Data Form State
  const [newRowData, setNewRowData] = useState<string>('');
  const [isAppending, setIsAppending] = useState(false);

  // New Sheet Creator State
  const [isCreating, setIsCreating] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query Spreadsheet files from Google Drive
  const listSpreadsheets = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    try {
      let query = `mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
      if (searchQuery.trim() !== '') {
        query += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
      }
      
      const fields = 'files(id, name, createdTime, webViewLink)';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=20&orderBy=createdTime%20desc`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`List spreadsheets failed: ${response.status}`);
      const data = await response.json();
      setSheets(data.files || []);
    } catch (err: any) {
      console.error('[G_SHEETS] List failed:', err);
      addLog('ERROR', `Google Sheets initialization failed: ${err.message}`);
    } finally {
      setIsLoadingList(false);
    }
  }, [token, searchQuery, addLog]);

  useEffect(() => {
    listSpreadsheets();
  }, [token, listSpreadsheets]);

  // Load sub-tabs available in spreadsheet
  const fetchSpreadsheetMetadata = async (spreadsheetId: string, title: string) => {
    setSelectedSpreadsheetId(spreadsheetId);
    setSelectedSpreadsheetTitle(title);
    setSheetTabs([]);
    setActiveTabName('');
    setGridData([]);
    setIsSyncingMeta(true);

    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Fetch tabs status: ${response.status}`);
      const data = await response.json();
      
      const tabNames = data.sheets?.map((s: any) => s.properties?.title).filter(Boolean) || [];
      setSheetTabs(tabNames);
      
      if (tabNames.length > 0) {
        setActiveTabName(tabNames[0]);
        fetchGridValues(spreadsheetId, tabNames[0]);
      }
      addLog('SYSTEM', `Retrieved spreadsheet tabs schema for: ${title}`);
    } catch (err: any) {
      addLog('ERROR', `Sheets ledger schema read error: ${err.message}`);
    } finally {
      setIsSyncingMeta(false);
    }
  };

  // Fetch actual grids of values from chosen sheet and range
  const fetchGridValues = async (spreadsheetId: string, sheetName: string) => {
    setIsLoadingGrid(true);
    setGridData([]);
    try {
      const range = `${encodeURIComponent(sheetName)}!A1:Z50`;
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Grid fetch status: ${response.status}`);
      const data = await response.json();
      setGridData(data.values || []);
    } catch (err: any) {
      addLog('ERROR', `Grid values parsing issue: ${err.message}`);
    } finally {
      setIsLoadingGrid(false);
    }
  };

  // Triggers when sub-tab switches
  const handleTabChange = (tab: string) => {
    if (!selectedSpreadsheetId) return;
    setActiveTabName(tab);
    fetchGridValues(selectedSpreadsheetId, tab);
  };

  // Create Google Spreadsheet
  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetTitle.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: newSheetTitle }
        })
      });

      if (!createResponse.ok) throw new Error(`Create status: ${createResponse.status}`);
      const newSheet = await createResponse.json();
      
      addLog('SYSTEM', `Dispatched Ledger spreadsheet: ${newSheetTitle} [ID: ${newSheet.spreadsheetId}]`);
      setNewSheetTitle('');
      setIsCreating(false);
      listSpreadsheets();
      
      // Auto-load metadata of spreadsheet
      fetchSpreadsheetMetadata(newSheet.spreadsheetId, newSheetTitle);
    } catch (err: any) {
      addLog('ERROR', `Spreadsheet initialization failure: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Append new row
  const handleAppendRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedSpreadsheetId || !activeTabName || !newRowData.trim()) return;

    setIsAppending(true);
    try {
      // Freeform comma separated columns
      const valuesArray = newRowData.split(',').map(v => v.trim());
      const range = `${encodeURIComponent(activeTabName)}!A1`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${selectedSpreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [valuesArray]
        })
      });

      if (!response.ok) throw new Error(`Append status: ${response.status}`);
      addLog('SYSTEM', `Injected row payload into tab [${activeTabName}]: ${JSON.stringify(valuesArray)}`);
      setNewRowData('');
      fetchGridValues(selectedSpreadsheetId, activeTabName);
    } catch (err: any) {
      addLog('ERROR', `Failed to inject record: ${err.message}`);
    } finally {
      setIsAppending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
      
      {/* Left List Pane */}
      <div className="w-full md:w-80 flex flex-col min-h-0 bg-black/40 border border-slate-900 rounded p-3">
        
        {/* Search & Actions Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
            <SearchIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Filter Spreadsheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
            />
          </div>
          <button 
            onClick={listSpreadsheets}
            className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-900 rounded bg-[#010102]"
            title="Refresh List"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`p-1 flex items-center justify-center rounded border transition-colors ${isCreating ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' : 'border-slate-800 text-slate-400 hover:text-cyan-400 bg-[#010102]'}`}
            title="Create Spreadsheet"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create Spreadsheet form inline */}
        {isCreating && (
          <form onSubmit={handleCreateSheet} className="mb-3 bg-[#0a101f]/35 border border-cyan-500/35 p-2.5 rounded font-mono flex flex-col gap-2 animate-fadeIn">
            <span className="text-[9px] text-cyan-400 font-bold tracking-wider uppercase flex items-center gap-1">
              <PlusIcon className="w-3 h-3" /> // COMPILE SPREADSHEET
            </span>
            <input 
              type="text"
              placeholder="SHEET TITLE..."
              value={newSheetTitle}
              onChange={(e) => setNewSheetTitle(e.target.value)}
              required
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-cyan-500 font-mono uppercase"
            />
            <div className="flex justify-end gap-1.5 text-[9px] mt-1">
              <button 
                type="button" 
                onClick={() => { setIsCreating(false); setNewSheetTitle(''); }}
                className="px-2 py-1 border border-slate-800 hover:bg-slate-900 rounded text-slate-400 uppercase font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-3 py-1 bg-cyan-900/40 border border-cyan-500 hover:bg-cyan-800/55 text-cyan-300 rounded uppercase font-bold flex items-center gap-1"
              >
                {isSubmitting && <Loader2Icon className="w-2.5 h-2.5 animate-spin" />}
                Init
              </button>
            </div>
          </form>
        )}

        {/* Spreadsheet list files render */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-[10px] gap-2 font-mono">
              <Loader2Icon className="w-5 h-5 animate-spin text-cyan-400" />
              <span>SYNCING SHEET ASSET NODES...</span>
            </div>
          ) : sheets.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-[9px] uppercase font-mono">
              No Spreadsheet assets found
            </div>
          ) : (
            sheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => fetchSpreadsheetMetadata(sheet.id, sheet.name)}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 border rounded transition-all ${selectedSpreadsheetId === sheet.id ? 'border-cyan-500 bg-cyan-950/15' : 'border-slate-900 hover:border-slate-800 bg-[#050507]/40'}`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <FileSpreadsheetIcon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedSpreadsheetId === sheet.id ? 'text-green-400 font-bold' : 'text-slate-500'}`} />
                  <span className={`text-[11px] font-mono uppercase truncate ${selectedSpreadsheetId === sheet.id ? 'text-green-400 font-bold font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {sheet.name}
                  </span>
                </div>
                <LayoutGridIcon className={`w-3 h-3 text-green-500/70 ${selectedSpreadsheetId === sheet.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content / Spreadsheet Grid view */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-slate-900 rounded p-4 font-mono">
        {selectedSpreadsheetId ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header section */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-900 mb-3.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheetIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-widest">{selectedSpreadsheetTitle}</span>
              </div>
              
              {/* External weblink button */}
              {sheets.find(s => s.id === selectedSpreadsheetId)?.webViewLink && (
                <a 
                  href={sheets.find(s => s.id === selectedSpreadsheetId)?.webViewLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[9px] font-bold text-green-400 hover:text-green-300 uppercase bg-green-950/10 px-2 py-1 rounded border border-green-800/40"
                >
                  <span>Open spreadsheet</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Inner Spreadsheet Tab Selector Row */}
            {sheetTabs.length > 0 && (
              <div className="flex gap-1 overflow-x-auto pb-2 border-b border-slate-900/50 mb-3 cursor-pointer">
                {sheetTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded border transition-all ${activeTabName === tab ? 'bg-green-950/25 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Live Data Grid area */}
            <div className="flex-1 overflow-auto bg-black/40 border border-slate-900/60 rounded mb-4 custom-scrollbar">
              {isLoadingGrid ? (
                <div className="flex flex-col h-full items-center justify-center gap-3 text-slate-500 text-[10px]">
                  <Loader2Icon className="w-5 h-5 animate-spin text-green-400" />
                  <span>DECRYPTING GRID VALUES & BOUNDARIES...</span>
                </div>
              ) : gridData.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center py-12 text-slate-600 gap-1.5 text-center">
                  <TableIcon className="w-8 h-8 text-slate-800" />
                  <span className="text-[10px] uppercase">No values populated in active sheet range</span>
                </div>
              ) : (
                <table className="w-full border-collapse font-mono text-xs text-slate-300">
                  <thead>
                    <tr className="bg-black/60 sticky top-0 border-b border-slate-800 text-[9px] text-slate-500 uppercase tracking-wider select-none text-left">
                      <th className="px-3.5 py-1.5 border-r border-slate-900 text-center text-cyan-600/60 w-10">#</th>
                      {gridData[0].map((_, index) => (
                        <th key={index} className="px-3 py-1.5 border-r border-slate-900 font-bold min-w-[100px]">
                          {String.fromCharCode(65 + (index % 26))}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gridData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-slate-900 hover:bg-slate-900/20">
                        <td className="px-3.5 py-2 border-r border-slate-900 text-center text-[9px] text-slate-600 bg-black/30 w-10 select-none">
                          {rowIndex + 1}
                        </td>
                        {row.map((cellValue, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 border-r border-slate-900 text-slate-300 truncate max-w-[200px]" title={cellValue}>
                            {cellValue}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Row Injector form */}
            <form onSubmit={handleAppendRow} className="bg-[#050c05]/30 border border-green-500/30 p-3 rounded font-mono flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="block text-[8px] text-green-400 uppercase font-bold tracking-widest mb-1.5">// COLUMN INJECTOR (COMMA SEPARATED)</label>
                <input 
                  type="text"
                  placeholder="e.g. Timestamp, Asset ID, Security Hash, Status..."
                  value={newRowData}
                  onChange={(e) => setNewRowData(e.target.value)}
                  required
                  className="w-full bg-black border border-slate-900 focus:border-green-500 text-slate-200 text-xs px-3 py-2 rounded outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isAppending || !newRowData.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-green-900/40 border border-green-500 hover:bg-green-800/60 text-green-300 rounded text-xs uppercase font-bold flex items-center justify-center gap-1.5 self-end"
              >
                {isAppending ? (
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin text-green-400" />
                ) : (
                  <PlayIcon className="w-3.5 h-3.5" />
                )}
                <span>Append row</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 p-8">
            <FileSpreadsheetIcon className="w-12 h-12 text-slate-900 mb-2 animate-pulse" />
            <span className="text-[10px] tracking-widest font-mono uppercase">Select a spreadsheet asset ledger from the node pool to parse grid values.</span>
          </div>
        )}
      </div>

    </div>
  );
};
