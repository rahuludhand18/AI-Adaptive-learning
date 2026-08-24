'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Maximize2, Minimize2, RotateCcw, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

// Loads the YouTube IFrame API once and reuses it across every player instance.
// Rejects if the script itself fails to load (network block, ad-blocker, offline) instead of
// hanging forever — that silent hang was the "video just stays black" bug.
function loadYouTubeApi(): Promise<any> {
  const w = window as any;
  if (w.YT && w.YT.Player) return Promise.resolve(w.YT);
  if (w.__ytApiPromise) return w.__ytApiPromise;
  w.__ytApiPromise = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = () => reject(new Error('Could not load the YouTube player. Check your internet connection or ad-blocker.'));
    document.head.appendChild(tag);
    w.onYouTubeIframeAPIReady = () => resolve(w.YT); // global callback fired by the API script
  });
  return w.__ytApiPromise;
}

// YouTube player onError codes: https://developers.google.com/youtube/iframe_api_reference#onError
function errorMessage(code: number): string {
  if (code === 2) return 'This video link looks invalid.';
  if (code === 5) return 'This video cannot be played in this format.';
  if (code === 100) return 'This video was removed or is private.';
  if (code === 101 || code === 150) return 'The video owner has disabled playback outside YouTube.';
  return 'This video could not be played.';
}

interface Props {
  youtubeId: string;
  onComplete?: () => void; // fired once when the video finishes
}

// A locked-down, kid-friendly YouTube player with Maximize / Minimize screen controls,
// privacy host, distraction-free overlays, and completion rewards.
export default function SafeYouTubePlayer({ youtubeId, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsMaximized(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Initialize player
  useEffect(() => {
    let cancelled = false;
    setEnded(false);
    setPlaying(false);
    setStatus('loading');
    setErrorMsg('');

    // if nothing responds within 10s (API blocked, network stalled), show a real error
    // instead of leaving the child staring at a black box forever
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setStatus('error');
        setErrorMsg('This is taking too long to load. Check your internet connection and try again.');
      }
    }, 10000);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !holderRef.current) return;
        const mount = document.createElement('div');
        holderRef.current.innerHTML = '';
        holderRef.current.appendChild(mount);

        playerRef.current = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          videoId: youtubeId,
          host: 'https://www.youtube-nocookie.com', // privacy-enhanced mode
          playerVars: {
            rel: 0,               // limit suggestions to same channel
            modestbranding: 1,    // reduce branding
            iv_load_policy: 3,    // hide annotations
            fs: 0,                // hide native fullscreen in favor of our kid-friendly overlay
            disablekb: 1,         // ignore keyboard navigation
            controls: 0,          // our own clean controls
            playsinline: 1,
          },
          events: {
            onReady: () => {
              window.clearTimeout(timeoutId);
              if (!cancelled) setStatus('ready');
            },
            onError: (e: any) => {
              window.clearTimeout(timeoutId);
              if (!cancelled) {
                setStatus('error');
                setErrorMsg(errorMessage(e?.data));
              }
            },
            onStateChange: (e: any) => {
              if (e.data === YT.PlayerState.ENDED) {
                setPlaying(false);
                setEnded(true);
                onComplete && onComplete();
              } else if (e.data === YT.PlayerState.PLAYING) {
                setPlaying(true);
                setEnded(false);
              } else if (e.data === YT.PlayerState.PAUSED) {
                setPlaying(false);
              }
            },
          },
        });
      })
      .catch((err) => {
        window.clearTimeout(timeoutId);
        if (!cancelled) {
          setStatus('error');
          setErrorMsg(err?.message || 'Could not load the video player.');
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      try { playerRef.current && playerRef.current.destroy(); } catch {}
      if (holderRef.current) holderRef.current.innerHTML = '';
    };
  }, [youtubeId, retryKey]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    playing ? p.pauseVideo() : p.playVideo();
  };

  const restartVideo = () => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(0);
    p.playVideo();
    setEnded(false);
  };

  const toggleMaximize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const isFs = Boolean(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (!isFs) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => setIsMaximized(true));
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen();
      } else {
        setIsMaximized(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => setIsMaximized(false));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsMaximized(false);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all duration-300 ${
        isMaximized
          ? 'fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between p-6'
          : 'relative'
      }`}
    >
      {/* Top Floating Control Bar in Maximized Mode */}
      {isMaximized && (
        <div className="flex items-center justify-between z-30 pb-3 text-white">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">FocusPath Safe Learning Mode</span>
          </div>

          <button
            onClick={toggleMaximize}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold py-2 px-5 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
          >
            <Minimize2 className="h-4 w-4" />
            <span>Minimize Screen (Esc)</span>
          </button>
        </div>
      )}

      {/* Main Video Frame */}
      <div
        className={`relative w-full overflow-hidden bg-black shadow-sm ${
          isMaximized
            ? 'flex-1 rounded-[28px] max-h-[calc(100vh-140px)] aspect-video mx-auto'
            : 'aspect-video rounded-2xl'
        }`}
      >
        {/* YouTube Iframe Mount Node */}
        <div ref={holderRef} className="absolute inset-0 w-full h-full" />

        {/* Loading state — replaces the silent black box while the player boots */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-xs font-semibold text-slate-300">Loading video…</p>
          </div>
        )}

        {/* Error state — tells the child/parent exactly why playback failed, with a retry */}
        {status === 'error' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900 text-white text-center gap-3 p-6">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <p className="text-sm font-bold">Video unavailable</p>
            <p className="text-xs text-slate-300 max-w-xs">{errorMsg}</p>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="mt-1 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs py-2 px-5 rounded-full transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Tap overlay to play/pause */}
        {status === 'ready' && !ended && <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} />}

        {/* Floating Top-Right Maximize / Minimize Button Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMaximize();
          }}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all shadow-md hover:scale-105 cursor-pointer"
          title={isMaximized ? 'Minimize Screen' : 'Maximize Screen'}
        >
          {isMaximized ? (
            <Minimize2 className="h-4.5 w-4.5" />
          ) : (
            <Maximize2 className="h-4.5 w-4.5" />
          )}
        </button>

        {/* Custom End Celebration Screen */}
        {ended && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary/95 text-white text-center p-6 space-y-4 animate-in fade-in duration-300">
            <div className="space-y-1">
              <span className="text-4xl">🎉</span>
              <p className="text-2xl font-bold tracking-tight">Great job!</p>
              <p className="text-xs font-medium text-white/90">You completed this lesson (+10 Stars earned!)</p>
            </div>

            <button
              onClick={restartVideo}
              className="bg-white text-primary hover:bg-slate-100 font-bold text-xs py-2.5 px-6 rounded-full shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Watch Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className={`flex items-center justify-between pt-3.5 ${isMaximized ? 'text-white' : ''}`}>
        <div className="flex items-center gap-3">
          {/* Play / Pause Toggle Button */}
          {!ended ? (
            <button
              onClick={togglePlay}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              {playing ? (
                <>
                  <Pause className="h-4 w-4 fill-white" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Play</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={restartVideo}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Replay</span>
            </button>
          )}

          {/* Maximize / Minimize Button in Controls Bar */}
          <button
            onClick={toggleMaximize}
            className={`font-bold text-xs py-2.5 px-5 rounded-full border transition-all flex items-center gap-2 cursor-pointer ${
              isMaximized
                ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:text-primary'
            }`}
          >
            {isMaximized ? (
              <>
                <Minimize2 className="h-4 w-4" />
                <span>Minimize Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                <span>Maximize Screen</span>
              </>
            )}
          </button>
        </div>

        {/* Distraction-Free Pill */}
        <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${isMaximized ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Distraction-Free Player</span>
        </span>
      </div>
    </div>
  );
}
