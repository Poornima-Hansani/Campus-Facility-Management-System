import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { BookOpen, File as FileIcon, Search } from "lucide-react";

type LectureNote = {
  _id: string;
  title: string;
  module: string;
  fileUrl: string;
  uploadedAt: string;
};

export default function LectureNotesPage() {
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/lecture-notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-blue-100 p-2 rounded-xl">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          Lecture Notes
        </h2>
        <p className="text-gray-500 text-sm mt-2">Access and download materials provided by your lecturers.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search notes by module or title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <FileIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No notes found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery ? "Try adjusting your search query." : "There are currently no notes uploaded for your modules."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const fileUrl = `${API_BASE}${note.fileUrl}`;
            
            return (
              <div key={note._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <FileIcon className="text-blue-600" size={24} />
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                    {note.module}
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {note.title}
                </h4>
                
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  Uploaded on {new Date(note.uploadedAt).toLocaleDateString()}
                </p>
                
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white font-bold rounded-xl transition-colors"
                >
                  View Note
                </a>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
