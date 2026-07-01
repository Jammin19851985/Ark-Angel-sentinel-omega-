import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  Trash2Icon, 
  CheckCircle2Icon, 
  CircleIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  Loader2Icon,
  CalendarIcon,
  TagIcon,
  CheckIcon,
  HashIcon,
  SquareCheckIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleTasksManagerProps {
  token: string | null;
}

interface TaskList {
  id: string;
  title: string;
  updated?: string;
}

interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
  completed?: string;
}

export const GoogleTasksManager: React.FC<GoogleTasksManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeList, setActiveList] = useState<TaskList | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  
  const [newListTitle, setNewListTitle] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  
  // Task creator states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all Google Task lists
  const listTaskLists = useCallback(async () => {
    if (!token) return;
    setIsLoadingLists(true);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Google Tasks list query returned status ${res.status}`);
      }
      
      const data = await res.json();
      const loadedLists: TaskList[] = data.items || [];
      setTaskLists(loadedLists);
      
      // Auto-select first list if nothing active
      if (loadedLists.length > 0 && !activeList) {
        setActiveList(loadedLists[0]);
      }
    } catch (err: any) {
      console.error('[G_TASKS] Listing lists failed:', err);
      addLog('ERROR', `Google Tasks folders query failed: ${err.message}`);
    } finally {
      setIsLoadingLists(false);
    }
  }, [token, activeList, addLog]);

  // Fetch tasks for a specific task list
  const fetchTasks = useCallback(async (listId: string) => {
    if (!token) return;
    setIsLoadingTasks(true);
    try {
      // Fetch all tasks (including completed ones for history verification)
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Google Tasks fetch returned status ${res.status}`);
      }
      
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err: any) {
      console.error('[G_TASKS] Fetching tasks failed:', err);
      addLog('ERROR', `Failed to load Tasks in list ID: ${listId}. ${err.message}`);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [token, addLog]);

  useEffect(() => {
    if (token) {
      listTaskLists();
    }
  }, [token, listTaskLists]);

  useEffect(() => {
    if (activeList) {
      fetchTasks(activeList.id);
    }
  }, [activeList, fetchTasks]);

  // Create a new Task List (Container)
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !token) return;

    setIsActionInProgress(true);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newListTitle.trim() })
      });

      if (!res.ok) {
        throw new Error(`Failed to create list: ${res.status}`);
      }

      const freshList = await res.json();
      addLog('SYSTEM', `Created new Task List: "${newListTitle}"`);
      setNewListTitle('');
      setShowListForm(false);
      setTaskLists(prev => [...prev, freshList]);
      setActiveList(freshList);
    } catch (err: any) {
      addLog('ERROR', `Failed to create Tasks List: ${err.message}`);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Create a new Task in the active List
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeList || !token) return;

    setIsActionInProgress(true);
    try {
      const bodyPayload: Record<string, any> = {
        title: taskTitle.trim(),
        notes: taskNotes.trim() || undefined
      };

      if (taskDue) {
        bodyPayload.due = new Date(taskDue).toISOString();
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeList.id}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        throw new Error(`Create task failed with status ${res.status}`);
      }

      const freshTask = await res.json();
      addLog('SYSTEM', `Added mission task "${taskTitle}" to list "${activeList.title}"`);
      setTaskTitle('');
      setTaskNotes('');
      setTaskDue('');
      setShowTaskForm(false);
      
      // Prepend to UI list
      setTasks(prev => [freshTask, ...prev]);
    } catch (err: any) {
      addLog('ERROR', `Failed to create task: ${err.message}`);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Toggle Completion State of a Task
  const handleToggleTaskStatus = async (task: TaskItem) => {
    if (!activeList || !token) return;

    const targetStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? { 
      ...t, 
      status: targetStatus,
      completed: targetStatus === 'completed' ? new Date().toISOString() : undefined 
    } : t));

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeList.id}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: targetStatus,
          completed: targetStatus === 'completed' ? new Date().toISOString() : null
        })
      });

      if (!res.ok) {
        throw new Error(`Toggle failed with status ${res.status}`);
      }

      addLog('SYSTEM', `Task "${task.title}" status updated to ${targetStatus}`);
      fetchTasks(activeList.id);
    } catch (err: any) {
      addLog('ERROR', `Failed to update task state: ${err.message}`);
      // Revert state
      fetchTasks(activeList.id);
    }
  };

  // Safe delete a task (Requires user confirmation)
  const handleDeleteTask = async (task: TaskItem) => {
    if (!activeList || !token) return;

    const confirmed = window.confirm(
      `Sovereign Action Required: Are you sure you want to delete task "${task.title}" permanently? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsActionInProgress(true);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeList.id}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }

      addLog('SYSTEM', `Permanently purged task node: "${task.title}"`);
      setTasks(prev => prev.filter(t => t.id !== task.id));
    } catch (err: any) {
      addLog('ERROR', `Failed to delete task: ${err.message}`);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative animate-fadeIn font-mono">
      
      {/* Sidebar: Task lists collections */}
      <div className="w-full md:w-60 bg-[#010103]/75 border border-slate-900 rounded p-3 flex flex-col gap-3 min-h-[160px] md:min-h-0 flex-shrink-0">
        
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">// MY TASK LISTS</span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={listTaskLists}
              className="p-1 hover:bg-slate-950 hover:text-cyan-400 text-slate-500 border border-slate-950 hover:border-slate-850 rounded transition-colors"
              title="Refresh lists"
            >
              <RefreshCwIcon className={`w-3 h-3 ${isLoadingLists ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button 
              onClick={() => setShowListForm(true)}
              className="p-1 hover:bg-slate-950 hover:text-cyan-400 text-slate-500 border border-slate-950 hover:border-slate-850 rounded transition-colors"
              title="New custom task list"
            >
              <PlusIcon className="w-3" />
            </button>
          </div>
        </div>

        {showListForm && (
          <form onSubmit={handleCreateList} className="bg-slate-950/90 border border-cyan-500/35 p-2 rounded flex flex-col gap-2">
            <span className="text-[8px] text-cyan-400 uppercase font-bold tracking-widest leading-none">New Task List</span>
            <input 
              type="text"
              placeholder="LIST TITLE (E.G. PERSONAL)..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="bg-black text-[10px] px-2 py-1 rounded border border-slate-900 outline-none focus:border-cyan-500 uppercase text-slate-200"
              autoFocus
              disabled={isActionInProgress}
            />
            <button 
              type="submit"
              disabled={isActionInProgress || !newListTitle.trim()}
              className="bg-cyan-900/40 border border-cyan-500/60 hover:bg-cyan-800/50 text-[10px] text-cyan-300 py-1 rounded uppercase cursor-pointer text-center font-bold"
            >
              SPAWN LIST
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {isLoadingLists ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500">
              <Loader2Icon className="w-4 h-4 animate-spin text-cyan-500" />
              <span className="text-[8px] tracking-widest">LOADING LISTS...</span>
            </div>
          ) : taskLists.length === 0 ? (
            <div className="text-[8px] text-slate-600 text-center uppercase py-4">No task lists found</div>
          ) : (
            taskLists.map((list) => {
              const isActive = activeList?.id === list.id;
              return (
                <button
                  key={list.id}
                  onClick={() => setActiveList(list)}
                  className={`w-full text-left px-2 py-1.5 rounded text-[10px] border truncate transition-all flex items-center gap-1.5 cursor-pointer uppercase ${isActive ? 'bg-cyan-950/20 border-cyan-500 text-cyan-400 font-bold' : 'bg-[#030304]/40 border-slate-950 text-slate-500 hover:text-slate-350 hover:bg-slate-950/40'}`}
                >
                  <ClipboardListIcon className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                  <span className="truncate">{list.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Tasks listing and controls */}
      <div className="flex-1 bg-black/60 border border-slate-900 rounded flex flex-col min-h-0">
        
        {/* Top Info Header */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-black/45 px-3 py-2 border-b border-slate-900/50 gap-2">
          <div className="flex items-center gap-2">
            <ClipboardListIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              {activeList ? activeList.title : 'NO TASK LIST SEJECTED'}
            </span>
          </div>

          <div className="relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/50 rounded flex-1 sm:max-w-[200px]">
            <SearchIcon className="w-3 h-3 absolute left-2 text-slate-650" />
            <input 
              type="text" 
              placeholder="SEARCH TASKS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-[9px] text-slate-300 bg-transparent outline-none uppercase"
            />
          </div>

          <button 
            onClick={() => activeList && fetchTasks(activeList.id)}
            disabled={!activeList}
            className="p-1.5 text-slate-500 hover:text-cyan-400 bg-[#0d0d0f]/50 border border-slate-900 hover:border-slate-800 rounded flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            title="Reload items"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Form to insert details inline or over layout */}
        {showTaskForm && (
          <form onSubmit={handleCreateTask} className="m-3 p-3 bg-slate-950 border border-cyan-500/30 rounded flex flex-col gap-2.5 animate-fadeIn relative z-10">
            <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-widest">// ADD TASK FOR TARGET</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input 
                type="text"
                placeholder="TASK TITLE (E.G. SUBMIT QUARTER)..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="bg-black text-[10px] px-2.5 py-1.5 rounded border border-slate-900 outline-none focus:border-cyan-500 uppercase text-slate-200"
                disabled={isActionInProgress}
                required
              />
              <input 
                type="datetime-local"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                className="bg-black text-[10px] px-2.5 py-1.5 rounded border border-slate-900 outline-none focus:border-cyan-500 text-slate-400"
                disabled={isActionInProgress}
              />
            </div>

            <textarea
              placeholder="OPTIONAL TASK NOTES OR STEPS..."
              value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              rows={2}
              className="bg-black text-[10px] px-2.5 py-1.5 rounded border border-slate-900 outline-none focus:border-cyan-500 text-slate-200 resize-none font-sans"
              disabled={isActionInProgress}
            />

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-900/50">
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="px-2.5 py-1.5 rounded hover:bg-slate-900 text-slate-500 text-[10px] uppercase font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActionInProgress || !taskTitle.trim()}
                className="px-3.5 py-1.5 bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-500/40 hover:border-cyan-500 text-[10px] text-cyan-300 font-bold rounded uppercase cursor-pointer"
              >
                {isActionInProgress ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  'COMMIT TASK'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Floating task compiler launcher */}
        {!showTaskForm && activeList && (
          <div className="px-3 py-2 border-b border-slate-900/30 flex justify-end">
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-2.5 py-1.5 bg-cyan-950/15 hover:bg-cyan-900/30 border border-cyan-500/30 hover:border-cyan-500 text-[9px] text-cyan-300 font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>SPAWN TASK ELEMENT</span>
            </button>
          </div>
        )}

        {/* Tasks display bubble scrollboard */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 relative custom-scrollbar">
          {isLoadingTasks ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20">
              <Loader2Icon className="w-5 h-5 animate-spin text-cyan-500" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Awaiting queue synchronization...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-600 text-center py-12">
              <ClipboardListIcon className="w-8 h-8 opacity-15 mb-2" />
              <span className="text-[10px] tracking-widest uppercase">STREAMS CLEAR IN LIST</span>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const dueDateObj = task.due ? new Date(task.due) : null;
              
              return (
                <div 
                  key={task.id} 
                  className={`border rounded-lg p-3 flex justify-between items-start gap-4 transition-all ${isCompleted ? 'bg-[#030305]/20 border-slate-950 text-slate-550' : 'bg-[#050508]/60 border-slate-900 hover:border-slate-850'}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button 
                      onClick={() => handleToggleTaskStatus(task)}
                      className="p-1 hover:bg-cyan-950/10 rounded-full text-slate-600 hover:text-cyan-400 cursor-pointer transition-colors mt-0.5"
                    >
                      {isCompleted ? (
                        <CheckCircle2Icon className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <CircleIcon className="w-4.5 h-4.5 text-slate-650" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold font-sans block truncate uppercase select-text leading-tight ${isCompleted ? 'line-through text-slate-550' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                      
                      {task.notes && (
                        <p className={`text-[11px] font-sans pr-4 mt-1 leading-relaxed select-text ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {task.notes}
                        </p>
                      )}

                      {/* Display coordinates like due bounds */}
                      {dueDateObj && (
                        <div className="flex items-center gap-1.5 text-[8px] text-amber-500 uppercase font-mono mt-1.5">
                          <CalendarIcon className="w-3 h-3 text-amber-500" />
                          <span>Maturity epoch: {dueDateObj.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteTask(task)}
                    className="p-1 text-slate-600 hover:text-danger rounded hover:bg-black/20 focus:outline-none flex-shrink-0 transition-colors"
                    title="Purge Task"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
