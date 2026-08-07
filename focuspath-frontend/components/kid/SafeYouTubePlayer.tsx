'use client';

import { useEffect, useRef, useState } from 'react';

// Loads the YouTube IFrame API once and reuses it across every player instance.
function loadYouTubeApi(): Promise<any> {
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (w.__ytApiPromise) return w.__ytApiPromise;
  w.__ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    w.onYouTubeIframeAPIReady = () => resolve(w.YT); // global callback fired by the API script
  });
  return w.__ytApiPromise;
}

interface Props {
  youtubeId: string;
  onComplete?: () => void; // fired once when the video finishes
}

// A locked-down YouTube player for Kid's Mode: privacy host, no branding/suggestions,
// a click-blocking overlay, and it hides the video the moment it ends so a child
// never sees YouTube's suggested-video grid or navigates away.
export default function SafeYouTubePlayer({ youtubeId, onComplete }: Props) {
  const holderRef = useRef<HTMLDivElement>(null); // React owns this wrapper
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setEnded(false);
    setPlaying(false);

    loadYouTubeApi().then((YT) => {
      if (cancelled || !holderRef.current) return;
      // YT replaces the node it mounts into, so give it a throwaway child (not our React ref)
      const mount = document.createElement('div');
      holderRef.current.innerHTML = '';
      holderRef.current.appendChild(mount);

      playerRef.current = new YT.Player(mount, {
        width: '100%',
        height: '100%',
        videoId: youtubeId,
        host: 'https://www.youtube-nocookie.com', // privacy-enhanced mode
        playerVars: {
          rel: 0,               // limit end suggestions to the same channel
          modestbranding: 1,    // reduce YouTube logo
          iv_load_policy: 3,    // hide annotations
          fs: 0,                // no fullscreen button
          disablekb: 1,         // ignore keyboard shortcuts
          controls: 0,          // we provide our own play/pause
          playsinline: 1,       // play inline, not native fullscreen
        },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              setEnded(true);
              onComplete && onComplete(); // award stars / mark topic complete
            } else if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
            } else if (e.data === YT.PlayerState.PAUSED) {
              setPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try { playerRef.current && playerRef.current.destroy(); } catch {}
      if (holderRef.current) holderRef.current.innerHTML = '';
    };
  }, [youtubeId]);

  const toggle = () => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-sm">
        {/* the YouTube iframe mounts inside here */}
        <div ref={holderRef} className="absolute inset-0 w-full h-full" />

        {/* transparent layer blocks taps on the YouTube logo/title while playing */}
        {!ended && <div className="absolute inset-0 z-10" onClick={toggle} />}

        {/* our own end screen so no suggested-video grid is ever shown to the child */}
        {ended && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-indigo-600/95 text-white text-center p-6">
            <div>
              <p className="text-2xl font-extrabold">Great job! 🎉</p>
              <p className="text-sm font-semibold mt-1">You finished the lesson.</p>
            </div>
          </div>
        )}
      </div>

      {/* simple kid-friendly control */}
      {!ended && (
        <button
          onClick={toggle}
          className="mt-4 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-sm py-3 px-8 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      )}
    </div>
  );
}
