import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { BookOpen, Upload, File as FileIcon, X, CheckCircle, AlertCircle } from "lucide-react";

type LectureNote = {
  _id: string;
  title: string;
  module: string;
  fileUrl: string;
  uploadedAt: string;
};

export default function AddLectureNotesPage() {
  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [title, setTitle] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title || !moduleName || !file) {
      setError("Please fill all fields and select a file.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("module", moduleName);
    formData.append("file", file);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/lecture-notes`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      setSuccess(true);
      setTitle("");
      setModuleName("");
      setFile(null);
      fetchNotes(); // refresh the list
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-teal-100 p-2 rounded-xl">
            <BookOpen className="text-teal-600" size={24} />
          </div>
          Add Lecture Notes
        </h2>
        <p className="text-gray-500 text-sm mt-2">Upload and manage course materials for your students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-6">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="text-gray-400" size={20} /> Upload New Note
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2">
                <CheckCircle size={16} className="mt-0.5" />
                <span>Note uploaded successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Module Name / Code</label>
                <input 
                  type="text" 
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. OOP, SE, DB"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lecture 01 - Introduction"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileIcon className="text-teal-500 mb-2" size={32} />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="bg-teal-50 p-3 rounded-full mb-3">
                        <Upload className="text-teal-600" size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Click or drag file to upload</span>
                      <span className="text-xs text-gray-400 mt-1">PDF, PPT, DOCX (Max 20MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-md mt-4 ${
                  isSubmitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Note'}
              </button>
            </form>
          </div>
        </div>

        {/* Uploaded Notes List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
              <FileIcon className="text-gray-400" size={20} /> Previously Uploaded Notes
            </h3>
            
            {notes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <BookOpen size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No Notes Uploaded</h3>
                <p className="text-gray-500 mt-2">You haven't uploaded any lecture notes yet.</p>
              </div>
            ) : (
              notes.map((note) => {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const fileUrl = `${API_BASE}${note.fileUrl}`;
                
                return (
                  <div key={note._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                        <FileIcon className="text-teal-600" size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded border border-gray-200">
                            {note.module}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(note.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{note.title}</h4>
                      </div>
                    </div>
                    
                    <a 
                      href={fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium text-sm rounded-lg border border-gray-200 transition-colors text-center"
                    >
                      View / Download
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
