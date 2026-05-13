import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { UploadModal } from './components/UploadModal';
import { AdminPanel } from './pages/AdminPanel';
import { Search, Bell, Settings } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';

function AppContent() {
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showUpload, setShowUpload] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    // In a real app, you'd have a notifications collection
    // For demo, we'll just listen to new comments on user's videos (simulated logic)
    const q = query(collection(db, 'videos'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Just a mock way to "see" activity in the app
      console.log("User's videos updated", snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return null;

  const handleTabChange = (tab: string) => {
    if (tab === 'upload') {
      if (!user) {
        signInWithGoogle();
      } else {
        setShowUpload(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'search':
        return (
          <div className="w-full h-screen bg-black pt-12 px-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input 
                  type="text" 
                  placeholder="Search accounts and videos" 
                  className="w-full bg-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
             </div>
             <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Trending</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-[9/16] bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer">
                      <img 
                        src={`https://picsum.photos/seed/trend${i}/300/533`} 
                        alt="Trend" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 text-xs font-bold text-white shadow-sm">
                        #trending_{i}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        );
      case 'upload':
        // This will be a functional button in the Navbar, but for now we show a placeholder
        return (
          <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
            <p className="text-white/60 mb-8">Post a video to your account</p>
            {!user ? (
               <button 
                onClick={signInWithGoogle}
                className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-full transition"
               >
                 Log in to Upload
               </button>
            ) : (
                <button 
                  className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-full transition"
                  onClick={() => alert("Upload feature coming in the next step!")}
                >
                  Select Video
                </button>
            )}
          </div>
        );
      case 'profile':
        if (!user) {
          return (
            <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
               <h2 className="text-2xl font-bold mb-8">Profile</h2>
               <button 
                onClick={signInWithGoogle}
                className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-full transition"
               >
                 Log in with Google
               </button>
            </div>
          );
        }
        return (
          <div className="w-full h-screen bg-black pt-12 overflow-y-auto pb-20">
            <div className="flex flex-col items-center px-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 mb-4">
                <img src={profile?.profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-xl font-bold mb-1">@{profile?.username}</h2>
              <p className="text-sm text-white/60 mb-6">{profile?.bio || 'No bio yet'}</p>
              
              <div className="flex gap-8 mb-8">
                <div className="text-center">
                   <div className="font-bold">{profile?.followingCount || 0}</div>
                   <div className="text-xs text-white/50">Following</div>
                </div>
                <div className="text-center">
                   <div className="font-bold">{profile?.followersCount || 0}</div>
                   <div className="text-xs text-white/50">Followers</div>
                </div>
                <div className="text-center">
                   <div className="font-bold">0</div>
                   <div className="text-xs text-white/50">Likes</div>
                </div>
              </div>

              <button className="w-full max-w-[200px] border border-white/20 font-semibold py-2 rounded-lg hover:bg-white/5 transition mb-8">
                Edit Profile
              </button>

              {user.email === 'ah3334r@gmail.com' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition text-sm"
                >
                  <Settings size={14} /> Admin Dashboard
                </button>
              )}

              <div className="w-full grid grid-cols-3 gap-1">
                 {[1,2,3].map(i => (
                    <div key={i} className="aspect-[3/4] bg-white/5 relative group">
                       <img 
                          src={`https://picsum.photos/seed/user${i}/300/400`} 
                          alt="Video" 
                          className="w-full h-full object-cover opacity-60"
                          referrerPolicy="no-referrer"
                        />
                       <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px]">
                          <span>▶ 0</span>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        );
      case 'admin':
        return <AdminPanel />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-black relative shadow-2xl overflow-hidden">
      {renderContent()}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)} 
          onSuccess={() => {
            setShowUpload(false);
            setActiveTab('home');
          }} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
