import React, { useState, useEffect } from 'react';
import { BookOpenIcon, ExternalLinkIcon, UsersIcon, SearchIcon, PlusIcon, FileTextIcon, BellIcon, RefreshCw, X, FolderOpenIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleClassroomManagerProps {
  token: string | null;
}

interface Course {
  id: string;
  name: string;
  section: string;
  descriptionHeading: string;
  room: string;
  ownerId: string;
  creationTime: string;
  courseState: string;
  alternateLink: string;
}

interface Coursework {
  id: string;
  courseId: string;
  title: string;
  description: string;
  materials: any[];
  state: string;
  alternateLink: string;
  creationTime: string;
}

export const GoogleClassroomManager: React.FC<GoogleClassroomManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [coursework, setCoursework] = useState<Coursework[]>([]);
  
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingCoursework, setIsLoadingCoursework] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCourses = async () => {
    if (!token) return;
    setIsLoadingCourses(true);
    setErrorMsg('');
    try {
      const res = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch courses');
      setCourses(data.courses || []);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message);
      addLog('ERROR', `Classroom Sync Failed: ${e.message}`);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchCoursework = async (courseId: string) => {
    if (!token) return;
    setIsLoadingCoursework(true);
    try {
      const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch coursework');
      setCoursework(data.courseWork || []);
    } catch (e: any) {
      console.error(e);
      addLog('ERROR', `Coursework Fetch Failed: ${e.message}`);
    } finally {
      setIsLoadingCoursework(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCoursework(selectedCourse.id);
    }
  }, [selectedCourse, token]);

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]/80 p-2 lg:p-4 rounded border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4 text-emerald-400" />
          Google Classroom Array
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCourses} 
            disabled={isLoadingCourses}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingCourses ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-200 p-2 rounded-lg text-xs font-mono relative">
          <span className="font-bold">ERROR:</span> {errorMsg}
          <button onClick={() => setErrorMsg('')} className="absolute top-2 right-2 p-1 hover:bg-red-500/20 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!selectedCourse ? (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="bg-slate-900 border border-slate-700 hover:border-emerald-500/50 p-4 rounded-xl flex flex-col gap-2 transition-colors cursor-pointer group"
              onClick={() => selectCourse(course)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">{course.name}</h3>
                <FolderOpenIcon className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-400">{course.section || 'No section'}</p>
              
              <div className="mt-auto pt-4 flex justify-between items-center text-[10px] text-slate-500">
                <span>{course.room ? `Room: ${course.room}` : 'Virtual'}</span>
                <a 
                   href={course.alternateLink} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   onClick={(e) => e.stopPropagation()}
                   className="flex items-center gap-1 hover:text-emerald-300"
                >
                  View <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
          {courses.length === 0 && !isLoadingCourses && (
            <div className="col-span-full py-8 text-center text-slate-500 font-mono text-xs">
              NO ACTIVE COURSES IN REGISTRY
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950 border border-slate-800 rounded p-4">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="text-xs font-mono text-slate-400 hover:text-emerald-400 uppercase tracking-widest px-2 py-1 bg-slate-900 rounded"
            >
              ← Back
            </button>
            <h3 className="text-lg font-bold text-slate-200">{selectedCourse.name}</h3>
            <span className="text-xs text-slate-500">{selectedCourse.section}</span>
            <a 
              href={selectedCourse.alternateLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 px-2 py-1 bg-emerald-950/30 rounded"
            >
              Open in Classroom <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
             {isLoadingCoursework ? (
               <div className="flex justify-center items-center py-12">
                 <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
               </div>
             ) : coursework.length > 0 ? (
               coursework.map(cw => (
                 <div key={cw.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg flex items-start gap-4">
                   <div className="p-2 bg-slate-800 rounded text-emerald-400 shrink-0">
                     <FileTextIcon className="w-5 h-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-slate-200 mb-1">{cw.title}</h4>
                     <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                       {cw.description || 'No description provided.'}
                     </p>
                     <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
                       <span className="text-slate-500">Status: {cw.state}</span>
                       <a 
                         href={cw.alternateLink} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded"
                       >
                         View Details <ExternalLinkIcon className="w-3 h-3" />
                       </a>
                     </div>
                   </div>
                 </div>
               ))
             ) : (
               <div className="py-8 text-center text-slate-500 font-mono text-xs">
                 NO COURSEWORK PUBLISHED
               </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
};
