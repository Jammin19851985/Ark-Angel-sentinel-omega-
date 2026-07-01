import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderIcon, 
  FileIcon, 
  FileTextIcon, 
  PlusIcon, 
  FolderPlusIcon,
  Trash2Icon, 
  SearchIcon, 
  RefreshCwIcon, 
  LogOutIcon, 
  UploadIcon, 
  ChevronRightIcon, 
  ExternalLinkIcon,
  HardDriveIcon,
  FileCodeIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  ShieldIcon,
  ClockIcon,
  MailIcon,
  CalendarIcon,
  ClipboardListIcon,
  PresentationIcon,
  MessageSquareIcon,
  VideoIcon,
  BookOpenIcon,
  UsersIcon,
  SparklesIcon
} from 'lucide-react';
import { googleSignIn, logout, getAccessToken, initAuth } from '../services/gdriveAuthService';
import { useAppContext } from '../contexts/AppContext';

// Import subcomponents for multi-module Google Workspace integration
import { GoogleDocsManager } from './GoogleDocsManager';
import { GoogleSheetsManager } from './GoogleSheetsManager';
import { GmailManager } from './GmailManager';
import { GoogleCalendarManager } from './GoogleCalendarManager';
import { GoogleFormsManager } from './GoogleFormsManager';
import { GoogleSlidesManager } from './GoogleSlidesManager';
import { GoogleChatManager } from './GoogleChatManager';
import { GoogleMeetManager } from './GoogleMeetManager';
import { GoogleKeepManager } from './GoogleKeepManager';
import { GooglePickerManager } from './GooglePickerManager';
import { GoogleTasksManager } from './GoogleTasksManager';
import { GoogleContactsManager } from './GoogleContactsManager';
import { GoogleClassroomManager } from './GoogleClassroomManager';

interface GoogleDriveManagerProps {
  id?: string;
}

interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
  owners?: Array<{ displayName: string; photoLink?: string }>;
}

type WorkspaceTab = 'drive' | 'docs' | 'sheets' | 'gmail' | 'calendar' | 'forms' | 'slides' | 'chat' | 'meet' | 'keep' | 'picker' | 'tasks' | 'contacts' | 'classroom';

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({ id }) => {
  const { addLog } = useAppContext();
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active workspace tab selection state
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>('drive');

  // File explorer states
  const [files, setFiles] = useState<GDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([
    { id: 'root', name: 'Sovereign Root' }
  ]);
  
  // Creation States
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isCompilingDoc, setIsCompilingDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  
  // Custom dialogs & confirmation
  const [destructiveConfirm, setDestructiveConfirm] = useState<{
    id: string;
    name: string;
    mimeType: string;
  } | null>(null);
  const [isProcessingDestructive, setIsProcessingDestructive] = useState(false);

  // Drag over states
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync session and retrieve access tokens with silent authentication check
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, cachedToken) => {
        setUser(currentUser);
        setToken(cachedToken);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // API Client methods
  const listDriveFiles = useCallback(async (folderId: string, search: string = '') => {
    let currentToken = token;
    if (!currentToken) {
      currentToken = await getAccessToken();
    }
    if (!currentToken) return;

    setIsLoading(true);
    try {
      let query = `trashed = false`;
      
      if (search.trim() !== '') {
        // Broad search across Drive
        query += ` and name contains '${search.replace(/'/g, "\\'")}'`;
      } else {
        // Strict child-of-parent list
        query += ` and '${folderId}' in parents`;
      }

      const fields = 'files(id, name, mimeType, size, createdTime, webViewLink, owners), nextPageToken';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=50`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or access revoked
          setNeedsAuth(true);
          return;
        }
        throw new Error(`Cloud Drive query failed with status code ${response.status}`);
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('[GDRIVE_EXPLORER] Listing failure:', err);
      addLog('ERROR', `Drive sync failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, addLog]);

  // Sync file explorer on route, search query or folder navigation changes
  useEffect(() => {
    if (token && !needsAuth && activeWorkspaceTab === 'drive') {
      listDriveFiles(currentFolderId, searchQuery);
    }
  }, [token, needsAuth, currentFolderId, searchQuery, activeWorkspaceTab, listDriveFiles]);

  // Auth Operations
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        addLog('AUTH', 'Uplink established with Google Cryptographic Core Workspace Suite.');
      }
    } catch (err: any) {
      if (err?.message?.includes('popup-closed-by-user') || err?.code === 'auth/popup-closed-by-user') {
        addLog('ERROR', `Uplink aborted: Popup blocked or closed by user. Please allow popups or open the app in a new tab.`);
      } else {
        addLog('ERROR', `Uplink initialization aborted: ${err.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setFiles([]);
      setBreadcrumbs([{ id: 'root', name: 'Sovereign Root' }]);
      setCurrentFolderId('root');
      addLog('AUTH', 'Uplink severed cleanly. Local tokens erased from active memory.');
    } catch (err: any) {
      addLog('ERROR', `Uplink shutdown failed: ${err.message}`);
    }
  };

  // Directory Folder drill-down
  const handleFolderClick = (id: string, name: string) => {
    // Prevent drilling into search files if hierarchy isn't set, reset search
    if (searchQuery !== '') {
      setSearchQuery('');
    }
    setBreadcrumbs(prev => [...prev, { id, name }]);
    setCurrentFolderId(id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === breadcrumbs.length - 1) return;
    const target = breadcrumbs[index];
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  // Folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !token) return;

    try {
      const metadata = {
        name: newFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: currentFolderId !== 'root' ? [currentFolderId] : undefined
      };

      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      
      const newFolder = await response.json();
      addLog('SYSTEM', `Created directory: ${newFolderName} in secure storage node [ID: ${newFolder.id}]`);
      setNewFolderName('');
      setIsCreatingFolder(false);
      // Re-list folder contents
      listDriveFiles(currentFolderId, searchQuery);
    } catch (err: any) {
      addLog('ERROR', `Failed to construct folder: ${err.message}`);
    }
  };

  // File destruction WITH CONSENT DIALOG (Satisfies explicit mandated security requirements)
  const handleRequestDeletion = (file: GDriveFile) => {
    setDestructiveConfirm(file);
  };

  const executeDeletion = async () => {
    if (!destructiveConfirm || !token) return;
    setIsProcessingDestructive(true);
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${destructiveConfirm.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      
      addLog('SYSTEM', `Archived & Deleted sovereign node: ${destructiveConfirm.name}`);
      setDestructiveConfirm(null);
      listDriveFiles(currentFolderId, searchQuery);
    } catch (err: any) {
      addLog('ERROR', `Atomic file deletion rejected: ${err.message}`);
    } finally {
      setIsProcessingDestructive(false);
    }
  };

  // File compiling & writing (Text snippets / manifests)
  const handleCompileDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !token) return;

    try {
      const boundary = '314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const metadata = {
        name: docName.endsWith('.txt') ? docName : `${docName}.txt`,
        mimeType: 'text/plain',
        parents: currentFolderId !== 'root' ? [currentFolderId] : undefined
      };

      const body = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: text/plain\r\n\r\n' +
        docContent +
        close_delim;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: body
      });

      if (!response.ok) throw new Error(`Upload returned status ${response.status}`);

      const result = await response.json();
      addLog('SYSTEM', `Sovereign record compiled successfully: ${metadata.name} [ID: ${result.id}]`);
      setDocName('');
      setDocContent('');
      setIsCompilingDoc(false);
      listDriveFiles(currentFolderId, searchQuery);
    } catch (err: any) {
      addLog('ERROR', `Compiling stream failure: ${err.message}`);
    }
  };

  // Native files uploading via selection or drop-zone
  const uploadBinaryBlob = async (file: File) => {
    if (!token) return;
    addLog('SYSTEM', `Initiating file stream injection: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    try {
      const boundary = '314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const metadata = {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        parents: currentFolderId !== 'root' ? [currentFolderId] : undefined
      };

      const metadataPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + delimiter + `Content-Type: ${metadata.mimeType}\r\n\r\n`;
      const endPart = close_delim;

      const arrayBuffer = await file.arrayBuffer();
      const contentBuffer = new Uint8Array(arrayBuffer);

      const parts = [
        new TextEncoder().encode(metadataPart),
        contentBuffer,
        new TextEncoder().encode(endPart)
      ];

      const partsBlob = new Blob(parts);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: partsBlob
      });

      if (!response.ok) throw new Error(`Upload system rejected with status ${response.status}`);
      
      const uploadedInfo = await response.json();
      addLog('SYSTEM', `File fully synchronized with Cloud Hub: ${file.name} [ID: ${uploadedInfo.id}]`);
      listDriveFiles(currentFolderId, searchQuery);
    } catch (err: any) {
      addLog('ERROR', `File transfer disrupted: ${err.message}`);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(uploadBinaryBlob);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach(uploadBinaryBlob);
    }
  };

  // Helper file size calculations
  const formatSize = (bytesStr?: string) => {
    if (!bytesStr) return '--';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '--';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Dynamic file type classification icons
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <FolderIcon className="w-4.5 h-4.5 text-cyan-400 select-none" />;
    }
    if (mimeType.includes('text') || mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileTextIcon className="w-4.5 h-4.5 text-emerald-400 select-none" />;
    }
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('typescript')) {
      return <FileCodeIcon className="w-4.5 h-4.5 text-yellow-400 select-none" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return <FileSpreadsheetIcon className="w-4.5 h-4.5 text-green-400 select-none" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-4.5 h-4.5 text-pink-400 select-none" />;
    }
    return <FileIcon className="w-4.5 h-4.5 text-slate-400 select-none" />;
  };

  // Navigation tab bar configuration
  const workspaceTabs = [
    { id: 'drive' as const, name: 'Drive / Files', icon: <HardDriveIcon className="w-3.5 h-3.5" />, color: 'text-cyan-400 active-cyan' },
    { id: 'docs' as const, name: 'Google Docs', icon: <FileTextIcon className="w-3.5 h-3.5" />, color: 'text-sky-400 active-sky' },
    { id: 'sheets' as const, name: 'Google Sheets', icon: <FileSpreadsheetIcon className="w-3.5 h-3.5" />, color: 'text-emerald-400 active-emerald' },
    { id: 'gmail' as const, name: 'Gmail', icon: <MailIcon className="w-3.5 h-3.5" />, color: 'text-fuchsia-400 active-fuchsia' },
    { id: 'calendar' as const, name: 'Calendar', icon: <CalendarIcon className="w-3.5 h-3.5" />, color: 'text-amber-400 active-amber' },
    { id: 'forms' as const, name: 'Google Forms', icon: <ClipboardListIcon className="w-3.5 h-3.5" />, color: 'text-sky-400 active-sky' },
    { id: 'slides' as const, name: 'Google Slides', icon: <PresentationIcon className="w-3.5 h-3.5" />, color: 'text-orange-400 active-orange' },
    { id: 'chat' as const, name: 'Google Chat', icon: <MessageSquareIcon className="w-3.5 h-3.5" />, color: 'text-cyan-400 active-cyan' },
    { id: 'meet' as const, name: 'Google Meet', icon: <VideoIcon className="w-3.5 h-3.5" />, color: 'text-cyan-400 active-cyan' },
    { id: 'keep' as const, name: 'Google Keep', icon: <BookOpenIcon className="w-3.5 h-3.5" />, color: 'text-yellow-400 active-yellow' },
    { id: 'picker' as const, name: 'Google Picker', icon: <SparklesIcon className="w-3.5 h-3.5" />, color: 'text-cyan-400 active-cyan' },
    { id: 'tasks' as const, name: 'Google Tasks', icon: <ClipboardListIcon className="w-3.5 h-3.5" />, color: 'text-amber-400 active-amber' },
    { id: 'contacts' as const, name: 'Contacts', icon: <UsersIcon className="w-3.5 h-3.5" />, color: 'text-emerald-400 active-emerald' },
    { id: 'classroom' as const, name: 'Classroom', icon: <BookOpenIcon className="w-3.5 h-3.5" />, color: 'text-emerald-400 active-emerald' },
  ];

  return (
    <div id={id} className="tech-panel p-3 lg:p-4 flex flex-col h-full bg-[#030304]/80 backdrop-blur-md relative overflow-hidden">
      
      {/* Visual background indicator */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/35 flex items-center justify-center">
            <HardDriveIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-widest text-cyan-400 font-mono uppercase">// GOOGLE WORKSPACE SUITE</h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">SOVEREIGN CORE CORE COLLABORATION & TELEMETRY EXCHANGE</p>
          </div>
        </div>

        {/* User login/logout states */}
        {!needsAuth && user && (
          <div className="flex items-center gap-2 bg-[#020203]/80 border border-slate-800 rounded px-2.5 py-1 text-xs">
            <ShieldIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-300 max-w-[120px] truncate">{user.displayName || user.email}</span>
            <div className="w-[1.5px] h-3 bg-slate-800 mx-1" />
            <button 
              onClick={handleLogout} 
              className="text-slate-500 hover:text-danger flex items-center gap-1 transition-colors uppercase font-mono text-[9px] font-bold cursor-pointer"
              title="Terminate Uplink"
            >
              <LogOutIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* If Google account login is required */}
      {needsAuth ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-5 bg-black/40 border border-dashed border-slate-900 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <HardDriveIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-slate-200 font-bold font-mono tracking-wider text-sm uppercase mb-2">Workspace Synapse Offline</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans mb-4">
              Connect Google Workspace to this application. Manage your emails, sync live spreadsheets, review document nodes, build surveys, track slide decks and keep calendar timelines aligned.
            </p>
          </div>

          <button 
            type="button"
            disabled={isLoggingIn}
            onClick={handleLogin}
            className="gsi-material-button transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper font-mono">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-mono font-bold">Sign in with Google</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Sub-Navigation pill bar for Workspace Suite */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-slate-900/50 custom-scrollbar relative z-10 select-none">
            {workspaceTabs.map((tab) => {
              const isActive = activeWorkspaceTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkspaceTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded border transition-all cursor-pointer ${isActive ? 'bg-cyan-950/15 border-cyan-500 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.15)] glow-text-cyan' : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-350 hover:border-slate-800'}`}
                >
                  <span className={isActive ? tab.color : 'text-slate-500'}>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Workspace Module rendering */}
          <div className="flex-1 flex flex-col min-h-0">
            {activeWorkspaceTab === 'drive' && (
              <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative">
                
                {/* Left panel: File Explorer list and search */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-slate-900 rounded p-2 lg:p-3">
                  
                  {/* Search, Action bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3">
                    <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
                      <SearchIcon className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="SEARCH SECURE STORAGE DRIVES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => listDriveFiles(currentFolderId, searchQuery)}
                        className="p-1.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-400 rounded transition-colors cursor-pointer"
                        title="Force Refresh Data"
                      >
                        <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                      </button>
                      <div className="w-[1px] h-6 bg-slate-900 mx-0.5" />
                      
                      <button 
                        onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                        className={`px-2.5 py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 rounded transition-all cursor-pointer ${isCreatingFolder ? 'bg-cyan-900/40 border border-cyan-500 text-cyan-400' : 'bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300'}`}
                      >
                        <FolderPlusIcon className="w-3.5 h-3.5" />
                        <span>+ Dir</span>
                      </button>

                      <button 
                        onClick={() => setIsCompilingDoc(!isCompilingDoc)}
                        className={`px-2.5 py-1.5 text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 rounded transition-all cursor-pointer ${isCompilingDoc ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-400' : 'bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300'}`}
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>+ Draft</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-form to Create Folder Inline */}
                  {isCreatingFolder && (
                    <form onSubmit={handleCreateFolder} className="grid grid-cols-12 gap-2 mb-3 bg-[#0a0a0f] border border-cyan-500/30 p-2.5 rounded font-mono animate-fadeIn">
                      <input 
                        type="text"
                        placeholder="NEW DIRECTORY NAME..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="col-span-8 bg-black border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded outline-none focus:border-cyan-500 font-mono uppercase"
                        autoFocus
                      />
                      <button type="submit" className="col-span-2 bg-cyan-900/30 border border-cyan-500/50 hover:bg-cyan-900/70 text-cyan-300 text-[10px] tracking-wider rounded uppercase cursor-pointer">Create</button>
                      <button type="button" onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }} className="col-span-2 border border-slate-800 hover:bg-slate-900 text-[10px] tracking-wider text-slate-400 rounded uppercase">Cancel</button>
                    </form>
                  )}

                  {/* Sub-form to Create File Draft Inline */}
                  {isCompilingDoc && (
                    <form onSubmit={handleCompileDocument} className="flex flex-col gap-2 mb-3 bg-[#0a200f]/10 border border-emerald-500/30 p-3 rounded font-mono animate-fadeIn">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="DOCUMENT TITLE (e.g. quantum_manifesto)..."
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="flex-1 bg-black border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded outline-none focus:border-emerald-500 font-mono uppercase"
                          autoFocus
                        />
                        <button type="submit" className="px-3 py-1 bg-emerald-990/40 border border-emerald-500/60 hover:bg-emerald-900/60 text-emerald-300 text-[10px] tracking-wider rounded uppercase cursor-pointer">Compile</button>
                        <button type="button" onClick={() => { setIsCompilingDoc(false); setDocName(''); setDocContent(''); }} className="px-3 py-1 border border-slate-800 hover:bg-slate-900 text-[10px] tracking-wider text-slate-400 rounded uppercase font-bold">Cancel</button>
                      </div>
                      <textarea 
                        placeholder="ENTER SECURE LEDGER ENTRY DATA SUMMARY..."
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        rows={4}
                        className="bg-black border border-slate-800 text-slate-300 text-xs p-2 rounded outline-none focus:border-emerald-500 font-mono resize-none"
                      />
                    </form>
                  )}

                  {/* Navigation Breadcrumb trail */}
                  {searchQuery === '' && (
                    <div className="flex items-center gap-1 flex-wrap font-mono text-[9px] text-slate-500 mb-2.5 bg-black/35 px-2 py-1 rounded">
                      <ClockIcon className="w-3 h-3 text-slate-600 mr-1" />
                      {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.id}>
                          {idx > 0 && <ChevronRightIcon className="w-2.5 h-2.5 text-slate-700" />}
                          <button 
                            onClick={() => handleBreadcrumbClick(idx)}
                            className={`uppercase tracking-wider hover:text-cyan-400 cursor-pointer ${idx === breadcrumbs.length - 1 ? 'text-cyan-500 hover:text-cyan-500 pointer-events-none' : ''}`}
                          >
                            {crumb.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Folder / File ListView */}
                  <div className="flex-1 min-h-0 flex flex-col relative">
                    
                    {/* Table Column headers */}
                    <div className="grid grid-cols-12 bg-black/50 border-b border-slate-900 font-mono text-[8px] text-slate-600 px-2 py-1 uppercase tracking-widest mb-1 select-none">
                      <span className="col-span-6 pl-1">Node Title</span>
                      <span className="col-span-3 text-right">Scope Size</span>
                      <span className="col-span-2 text-center">Timestamp</span>
                      <span className="col-span-1 text-center font-bold">🗑️</span>
                    </div>

                    {/* Table body content */}
                    <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
                      {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/20">
                          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-mono text-cyan-500/80 animate-pulse uppercase tracking-widest">QUERYING CLOUD HUB...</span>
                        </div>
                      ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500 font-mono text-[10px] border border-dashed border-slate-900/60 rounded">
                          NO ACTIVE SECURE DATA NODES AVAILABLE
                        </div>
                      ) : (
                        files.map((file) => {
                          const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                          const displaySize = isFolder ? 'DIR_NODE' : formatSize(file.size);
                          const fileDate = file.createdTime ? new Date(file.createdTime).toLocaleDateString() : '--';

                          return (
                            <div 
                              key={file.id}
                              onDoubleClick={() => isFolder && handleFolderClick(file.id, file.name)}
                              className={`grid grid-cols-12 items-center px-2 py-2 border border-slate-950/60 bg-[#060608]/50 hover:bg-slate-900/40 rounded transition-all duration-155 group`}
                            >
                              {/* File Name + Icon */}
                              <div className="col-span-6 flex items-center gap-2 min-w-0 pr-2">
                                <div className="flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                                {isFolder ? (
                                  <button 
                                    onClick={() => handleFolderClick(file.id, file.name)}
                                    className="text-slate-200 text-xs font-mono font-medium hover:text-cyan-400 text-left truncate uppercase tracking-wide select-none cursor-pointer"
                                  >
                                    {file.name}
                                  </button>
                                ) : (
                                  <span className="text-slate-300 text-xs font-sans truncate font-medium uppercase tracking-wide select-text">
                                    {file.name}
                                  </span>
                                )}
                              </div>

                              {/* File Size */}
                              <span className={`col-span-3 text-right font-mono text-[10px] ${isFolder ? 'text-cyan-500/40' : 'text-slate-400'}`}>
                                {displaySize}
                              </span>

                              {/* File Date / Links */}
                              <div className="col-span-2 text-center font-mono text-[9px] text-slate-500 flex items-center justify-center gap-1 select-none">
                                <span>{fileDate}</span>
                                {file.webViewLink && (
                                  <a 
                                    href={file.webViewLink} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-slate-600 hover:text-cyan-400 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="External Node Explorer"
                                  >
                                    <ExternalLinkIcon className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>

                              {/* Delete action trigger */}
                              <div className="col-span-1 flex items-center justify-center">
                                <button 
                                  onClick={() => handleRequestDeletion(file)}
                                  className="text-slate-700 hover:text-danger p-1 border border-transparent hover:border-danger/30 rounded transition-all transition-colors cursor-pointer"
                                  title="Purge Sovereign Storage Block"
                                >
                                  <Trash2Icon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Right panel: File Upload Zone & Information */}
                <div className="w-full md:w-60 flex flex-col gap-3 flex-shrink-0">
                  
                  {/* Native Drag and Drop Drag Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    className={`flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-lg transition-all min-h-[160px] cursor-pointer ${isDragOver ? 'border-cyan-500 bg-cyan-950/15 text-cyan-400' : 'border-slate-800 bg-[#040406]/70 hover:border-cyan-600/40 text-slate-500'}`}
                    onClick={() => document.getElementById('manual-file-io')?.click()}
                  >
                    <UploadIcon className={`w-8 h-8 mb-2 transition-transform duration-200 ${isDragOver ? 'scale-110 text-cyan-400 animate-bounce' : 'text-slate-600'}`} />
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1">Drag Asset Payload Here</p>
                    <p className="text-[9px] text-slate-500 uppercase font-sans">Or click to browse device</p>
                    
                    <input 
                      id="manual-file-io"
                      type="file" 
                      multiple
                      className="hidden" 
                      onChange={handleManualUpload} 
                    />
                  </div>

                  {/* Quick telemetry card */}
                  <div className="bg-[#050507]/80 border border-slate-900 rounded p-2.5 lg:p-3 font-mono text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest">
                    <span className="text-slate-400 font-bold font-mono text-[10px] block mb-1.5 border-b border-slate-900 pb-1">// NODE TELEMETRY</span>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span className="text-cyan-400 font-medium font-bold">Uplinked</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cloud Server:</span>
                        <span className="text-slate-400 select-all">arc.gdrive.v3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Secure Path:</span>
                        <span className="text-emerald-500 max-w-[120px] truncate">{breadcrumbs.map(b => b.name).join('/')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crypt Status:</span>
                        <span className="text-[#00ff9d] font-bold">Encrypted (TLS)</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Secure destructive action popup dialog (Absolute visual Overlay) */}
                {destructiveConfirm && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
                    <div className="max-w-md w-full bg-slate-950 border border-red-500/40 rounded-lg p-5 shadow-[0_0_30px_rgba(239,68,68,0.15)] font-mono flex flex-col gap-4 relative">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-950/20 rounded border border-red-500/40 text-red-500 flex items-center justify-center">
                          <Trash2Icon className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-red-500 tracking-wider">MANDATED DESTRUCTIVE ACTION VERIFICATION</h4>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">Are you sure you want to completely erase the following node?</p>
                        </div>
                      </div>

                      {/* Confirm details card */}
                      <div className="bg-[#0a0606] border border-red-950 rounded p-3 text-slate-300 animate-pulse">
                        <div className="text-[10px] text-slate-500 uppercase">IDENTIFIED STORAGE PAYLOAD_ID:</div>
                        <div className="text-[11px] font-mono break-all font-bold text-slate-200 mt-0.5">{destructiveConfirm.name}</div>
                        <div className="text-[8px] text-slate-650 mt-1 uppercase">Node ID: {destructiveConfirm.id}</div>
                      </div>

                      <div className="text-[9px] text-[#ff0044] bg-[#ff0044]/5 border border-[#ff0044]/20 p-2 rounded leading-relaxed uppercase tracking-wider">
                        Caution: This action instantly purges the file blocks from your Google Drive account forever. It cannot be recovered.
                      </div>

                      <div className="flex justify-end gap-2 text-xs">
                        <button 
                          onClick={() => setDestructiveConfirm(null)}
                          disabled={isProcessingDestructive}
                          className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded hover:text-white transition uppercase font-bold cursor-pointer"
                        >
                          Abort Pure
                        </button>
                        <button 
                          onClick={executeDeletion}
                          disabled={isProcessingDestructive}
                          className="px-4 py-1.5 bg-[#4c0519] border border-red-500/70 hover:bg-[#881337] text-red-100 rounded transition flex items-center gap-1.5 uppercase font-bold cursor-pointer"
                        >
                          {isProcessingDestructive ? (
                            <div className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          ) : null}
                          <span>Destroy Payload</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {activeWorkspaceTab === 'docs' && <GoogleDocsManager token={token} />}
            
            {activeWorkspaceTab === 'sheets' && <GoogleSheetsManager token={token} />}

            {activeWorkspaceTab === 'gmail' && <GmailManager token={token} />}

            {activeWorkspaceTab === 'calendar' && <GoogleCalendarManager token={token} />}

            {activeWorkspaceTab === 'forms' && <GoogleFormsManager token={token} />}

            {activeWorkspaceTab === 'slides' && <GoogleSlidesManager token={token} />}

            {activeWorkspaceTab === 'chat' && <GoogleChatManager token={token} />}

            {activeWorkspaceTab === 'meet' && <GoogleMeetManager token={token} />}

            {activeWorkspaceTab === 'keep' && <GoogleKeepManager token={token} />}

            {activeWorkspaceTab === 'picker' && <GooglePickerManager token={token} />}

            {activeWorkspaceTab === 'tasks' && <GoogleTasksManager token={token} />}

            {activeWorkspaceTab === 'contacts' && <GoogleContactsManager token={token} />}

            {activeWorkspaceTab === 'classroom' && <GoogleClassroomManager token={token} />}
          </div>

        </div>
      )}
    </div>
  );
};
