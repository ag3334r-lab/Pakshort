import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { analyzeVideoContent } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid video file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    multiple: false,
  } as any);

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // 1. Analyze with Gemini
      const aiData = await analyzeVideoContent(caption);

      // 2. Upload to Firebase Storage
      const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        }, 
        (error) => {
          console.error(error);
          setUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // 3. Save to Firestore
          await addDoc(collection(db, 'videos'), {
            userId: user.uid,
            username: profile?.username || 'user',
            profilePic: profile?.profilePic || '',
            videoUrl: downloadURL,
            thumbnailUrl: '', // In a real app, generate from frame
            caption: caption,
            hashtags: aiData.hashtags,
            tags: aiData.categories,
            likesCount: 0,
            commentsCount: 0,
            createdAt: serverTimestamp(),
          });

          setUploading(false);
          onSuccess();
        }
      );
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col pt-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between px-4 mb-6">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold">New Post</h2>
        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="text-brand font-bold disabled:opacity-50"
        >
          {uploading ? 'Posting...' : 'Post'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`aspect-[9/16] max-h-[500px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors ${
              isDragActive ? 'border-brand bg-brand/5' : 'border-white/10 bg-white/5'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/50">
              <Upload size={32} />
            </div>
            <div className="text-center">
               <p className="font-semibold">Select video to upload</p>
               <p className="text-sm text-white/50 mt-1">Or drag and drop a file</p>
            </div>
            <div className="text-xs text-white/30 space-y-1 text-center">
               <p>MP4 or WebM</p>
               <p>Up to 60 seconds</p>
               <p>Less than 50MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="aspect-[9/16] max-h-[400px] bg-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
               <video src={URL.createObjectURL(file)} className="w-full h-full object-contain" />
               <button 
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
               >
                 <X size={16} />
               </button>
            </div>

            {uploading && (
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Caption</label>
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-brand h-24 resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
