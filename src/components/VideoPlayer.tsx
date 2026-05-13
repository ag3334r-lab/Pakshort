import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music2, UserPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatNumber } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface VideoPlayerProps {
  key?: React.Key;
  video: {
    id: string;
    userId: string;
    videoUrl: string;
    caption: string;
    likesCount: number;
    commentsCount: number;
    username?: string;
    profilePic?: string;
  };
  isActive: boolean;
}

export function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  useEffect(() => {
    // Check if user liked this video
    if (user) {
      const checkLike = async () => {
        const likeDoc = await getDoc(doc(db, 'videos', video.id, 'likes', user.uid));
        setLiked(likeDoc.exists());
      };
      checkLike();
    }
  }, [user, video.id]);

  const handleLike = async () => {
    if (!user) return; // Should prompt login

    const videoRef = doc(db, 'videos', video.id);
    const likeRef = doc(db, 'videos', video.id, 'likes', user.uid);

    if (liked) {
      setLiked(false);
      setLikesCount(prev => prev - 1);
      await deleteDoc(likeRef);
      await updateDoc(videoRef, { likesCount: increment(-1) });
    } else {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      await setDoc(likeRef, { createdAt: new Date().toISOString() });
      await updateDoc(videoRef, { likesCount: increment(1) });
    }
  };

  return (
    <div className="relative w-full h-full snap-start bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={!isActive}
        onClick={(e) => {
          const video = e.currentTarget;
          if (video.paused) video.play();
          else video.pause();
        }}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white/10">
            <img 
              src={video.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.userId}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-brand rounded-full flex items-center justify-center border-2 border-black"
            onClick={() => setFollowing(!following)}
          >
            {following ? <Check size={12} className="text-white" /> : <UserPlus size={12} className="text-white" />}
          </button>
        </div>

        <button 
          className="flex flex-col items-center gap-1"
          onClick={handleLike}
        >
          <motion.div
            whileTap={{ scale: 1.5 }}
            className={cn(
              "p-3 rounded-full transition-colors",
              liked ? "text-brand" : "text-white"
            )}
          >
            <Heart size={32} fill={liked ? "currentColor" : "none"} />
          </motion.div>
          <span className="text-xs font-semibold">{formatNumber(likesCount)}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="p-3 text-white">
            <MessageCircle size={32} />
          </div>
          <span className="text-xs font-semibold">{formatNumber(video.commentsCount)}</span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="p-3 text-white">
            <Share2 size={32} />
          </div>
          <span className="text-xs font-semibold">Share</span>
        </button>

        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 flex items-center justify-center mt-4 border-4 border-white/10"
        >
           <Music2 size={24} className="text-white/70" />
        </motion.div>
      </div>

      {/* Bottom Content */}
      <div className="absolute left-4 bottom-24 right-20 z-10 pointer-events-none">
        <h3 className="font-bold text-lg mb-2">@{video.username || 'user_' + video.userId.slice(0, 5)}</h3>
        <p className="text-sm line-clamp-2 mb-3 max-w-[80%]">{video.caption}</p>
        <div className="flex items-center gap-2">
          <Music2 size={16} />
          <div className="overflow-hidden w-full">
            <motion.p 
              animate={{ x: [-20, -200] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-sm whitespace-nowrap"
            >
              Original Sound - {video.username || 'user'} • Original Sound - {video.username || 'user'}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
