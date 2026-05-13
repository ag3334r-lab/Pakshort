import React, { useState, useEffect, useRef } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Robust fallback sample videos
const FALLBACK_VIDEOS = [
  {
    id: 'sample-1',
    userId: 'system',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40156-large.mp4',
    caption: 'Neon vibes only 🌈 #dance #neon #vibes',
    likesCount: 12400,
    commentsCount: 320,
    username: 'neon_dancer',
  },
  {
    id: 'sample-2',
    userId: 'system',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-on-a-sunny-day-471-large.mp4',
    caption: 'Autumn is here 🍂 Nature is beautiful. #nature #autumn #peace',
    likesCount: 8500,
    commentsCount: 150,
    username: 'nature_lover',
  },
  {
    id: 'sample-3',
    userId: 'system',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-in-front-of-a-wall-40158-large.mp4',
    caption: 'Work hard, dance harder ⚡️ #fitness #dance #lifestyle',
    likesCount: 25000,
    commentsCount: 1200,
    username: 'urban_choreos',
  }
];

export function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (videoData.length > 0) {
        setVideos(videoData);
      } else {
        setVideos(FALLBACK_VIDEOS);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollPos = scrollRef.current.scrollTop;
    const height = scrollRef.current.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="w-full h-screen bg-black snap-y-mandatory overflow-y-scroll overflow-x-hidden scroll-smooth"
    >
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-center items-center z-20 pointer-events-none">
        <div className="flex gap-4">
          <button className="text-white/60 font-bold text-lg pointer-events-auto">Following</button>
          <div className="w-[2px] h-4 bg-white/20 self-center" />
          <button className="text-white font-bold text-lg border-b-2 border-white pointer-events-auto">For You</button>
        </div>
      </div>

      {videos.map((video: any, index: number) => (
        <VideoPlayer 
          key={video.id} 
          video={video} 
          isActive={index === activeIndex} 
        />
      ))}

      {/* Infinite Scroll Bottom Buffer */}
      <div className="h-20 snap-start bg-black" />
    </div>
  );
}
