import { useEffect, useRef, useState } from "react";

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const seconds = Math.floor(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function MusicPlayer({
  currentSong,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(0);
    setDuration(0);
    setError("");
    setPlaying(false);

    if (!currentSong?.audio_url) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (currentSong) setError("Bài hát chưa có đường dẫn âm thanh.");
      return;
    }

    audio.src = currentSong.audio_url;
    audio.load();

    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        setPlaying(false);
        setError(
          "Không thể phát bài hát. Hãy kiểm tra URL âm thanh hoặc nhấn Phát để thử lại.",
        );
      });
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) {
      setError("Bài hát chưa có đường dẫn âm thanh.");
      return;
    }

    setError("");
    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setPlaying(false);
      setError("Không thể phát file âm thanh này.");
    }
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Number(event.target.value);
    setCurrentTime(audio.currentTime);
  }

  function handleEnded() {
    setPlaying(false);
    if (hasNext) onNext?.();
  }

  return (
    <footer className="music-player" aria-label="Trình phát nhạc">
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onError={() => {
          setPlaying(false);
          if (currentSong?.audio_url)
            setError("Không tải được âm thanh. Kiểm tra đường dẫn file.");
        }}
      />

      <div className="current-track">
        {currentSong?.cover_url ? (
          <img className="track-cover" src={currentSong.cover_url} alt="" />
        ) : (
          <div className="track-cover" aria-hidden="true">
            ♫
          </div>
        )}
        <div className="current-track-info">
          <p className="track-title">
            {currentSong?.title || "Chưa có bài hát"}
          </p>
          <p className="track-artist">
            {currentSong?.artist || "Chọn bài hát để bắt đầu"}
          </p>
          {error && (
            <p className="player-error" role="status">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button
            type="button"
            disabled={!hasPrevious}
            onClick={onPrevious}
            title="Bài trước"
            aria-label="Bài trước"
          >
            |◀
          </button>
          <button
            className="play-button"
            type="button"
            disabled={!currentSong}
            onClick={togglePlayback}
            title={playing ? "Tạm dừng" : "Phát nhạc"}
            aria-label={playing ? "Tạm dừng" : "Phát nhạc"}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={onNext}
            title="Bài tiếp"
            aria-label="Bài tiếp"
          >
            ▶|
          </button>
        </div>

        <div className="progress-row">
          <span>{formatTime(currentTime)}</span>
          <input
            className="progress-slider"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={seek}
            disabled={!duration}
            aria-label="Tiến độ phát nhạc"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <button
          type="button"
          className="volume-toggle"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
          title={muted ? "Bật tiếng" : "Tắt tiếng"}
        >
          {muted || volume === 0 ? "🔇" : "♪"}
        </button>
        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Âm lượng"
        />
      </div>
    </footer>
  );
}
