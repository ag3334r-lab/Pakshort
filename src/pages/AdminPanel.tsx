import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { Trash2, TrendingUp, Users, Video } from 'lucide-react';

export function AdminPanel() {
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalVideos: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const vSnap = await getDocs(query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(50)));
      setVideos(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const uSnap = await getDocs(collection(db, 'users'));
      setStats({
        totalUsers: uSnap.size,
        totalVideos: vSnap.size
      });
    };
    fetchData();
  }, []);

  const handleDelete = async (vid: string) => {
    if (window.confirm('Delete this video?')) {
      await deleteDoc(doc(db, 'videos', vid));
      setVideos(videos.filter(v => v.id !== vid));
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <TrendingUp className="text-brand" /> VibeShorts Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 text-white/60 mb-2">
            <Users size={20} />
            <span className="text-sm font-semibold uppercase">Total Users</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 text-white/60 mb-2">
            <Video size={20} />
            <span className="text-sm font-semibold uppercase">Total Videos</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalVideos}</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
      <div className="space-y-4">
        {videos.map(v => (
          <div key={v.id} className="bg-white/5 p-4 rounded-lg flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded overflow-hidden">
                <video src={v.videoUrl} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium">@{v.username}</p>
                <p className="text-xs text-white/40">{v.caption.slice(0, 50)}...</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(v.id)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
