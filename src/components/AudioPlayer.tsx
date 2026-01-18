import { useState, useRef, useEffect, useMemo } from "react";

interface AudioPlayerProps {
    src: string;
    id: string;
}

// Generate random bar heights for the fake waveform
function generateBars(count: number): number[] {
    const bars: number[] = [];
    for (let i = 0; i < count; i++) {
        // Create a wave-like pattern with some randomness
        const base = Math.sin((i / count) * Math.PI) * 0.5 + 0.5;
        const random = Math.random() * 0.4 + 0.3;
        bars.push(base * 0.6 + random * 0.4);
    }
    return bars;
}

// Custom event for pausing other players
const PAUSE_ALL_EVENT = "audioplayer:pauseall";

export default function AudioPlayer({ src, id }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Generate bar heights once per component instance
    const barHeights = useMemo(() => generateBars(50), []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        const handlePauseAll = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.id !== id) {
                audio.pause();
                setIsPlaying(false);
            }
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);
        window.addEventListener(PAUSE_ALL_EVENT, handlePauseAll);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
            window.removeEventListener(PAUSE_ALL_EVENT, handlePauseAll);
        };
    }, [id]);

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            // Pause all other players
            window.dispatchEvent(
                new CustomEvent(PAUSE_ALL_EVENT, { detail: { id } })
            );
            audio.play();
            setIsPlaying(true);
        }
    };

    const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        audio.currentTime = percentage * duration;
        setProgress(percentage * 100);
    };

    const formatTimeRemaining = (remaining: number): string => {
        if (isNaN(remaining) || remaining <= 0) return "0s";

        const totalSeconds = Math.ceil(remaining);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0 && seconds > 0) {
            return `${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        }
        return `${seconds}s`;
    };

    const remainingTime = duration - currentTime;

    return (
        <div className="react-audio-player">
            <audio ref={audioRef} src={src} preload="metadata" />

            <button
                className="play-pause-btn"
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="icon"
                    >
                        <path
                            fillRule="evenodd"
                            d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="icon"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </button>

            <div className="waveform-container" onClick={handleBarClick}>
                <div className="waveform-bars">
                    {barHeights.map((height, index) => {
                        const barProgress = (index / barHeights.length) * 100;
                        const isActive = barProgress <= progress;
                        return (
                            <div
                                key={index}
                                className={`bar ${isActive ? "active" : ""}`}
                                style={{ height: `${height * 100}%` }}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="time-display">
                <span>{formatTimeRemaining(remainingTime)}</span>
            </div>

            <style>{`
        .react-audio-player {
          display: flex;
          align-items: center;
          gap: var(--space-s, 12px);
          background: var(--mauve-12, #1a1a1a);
          padding: var(--space-xs, 8px) var(--space-s, 12px);
          border-radius: var(--radius-m, 12px);
          width: 100%;
        }

        .play-pause-btn {
          background: var(--pink-9, #d6409f);
          color: white;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .play-pause-btn:hover {
          transform: scale(1.05);
          background: var(--pink-10, #c9357e);
        }

        .play-pause-btn .icon {
          width: 22px;
          height: 22px;
        }

        .waveform-container {
          flex-grow: 1;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .waveform-bars {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          gap: 2px;
        }

        .bar {
          flex: 1;
          min-width: 3px;
          max-width: 6px;
          background: var(--mauve-7, #484848);
          border-radius: 2px;
          transition: background-color 0.1s ease;
        }

        .bar.active {
          background: var(--pink-9, #d6409f);
        }

        .time-display {
          font-size: 13px;
          color: var(--mauve-8, #6b6b6b);
          font-family: monospace;
          white-space: nowrap;
          min-width: 50px;
          text-align: right;
        }
      `}</style>
        </div>
    );
}
