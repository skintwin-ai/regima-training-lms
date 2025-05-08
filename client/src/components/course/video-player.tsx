import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface VideoPlayerProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
  duration: string;
}

export function VideoPlayer({ title, description, thumbnailUrl, videoUrl, duration }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    
    const handleDurationChange = () => {
      setVideoDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const video = videoRef.current;
    if (!progressBar || !video) return;
    
    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    
    video.currentTime = position * video.duration;
  };
  
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="relative aspect-video bg-gray-900">
        {!isPlaying ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
              >
                <Play className="h-8 w-8 text-white ml-1" />
              </button>
            </div>
          </>
        ) : (
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            src={videoUrl}
            onClick={togglePlay}
          />
        )}
        
        <div className="absolute bottom-4 left-4 right-4 flex items-center text-white">
          <span className="text-sm">
            {formatTime(currentTime)} / {videoDuration ? formatTime(videoDuration) : duration}
          </span>
          <div 
            ref={progressBarRef}
            className="mx-3 flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-primary" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <button 
            className="text-white hover:text-primary-light transition mx-1"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button 
            className="text-white hover:text-primary-light transition mx-1"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">⏱️</span>
            <span>Video Length: {duration}</span>
          </div>
          <div className="flex">
            <button className="text-muted-foreground hover:text-foreground transition mr-4">
              <span className="mr-2">📄</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
