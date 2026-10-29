export default function MusicPlayer() {
  return (
    <footer className="music-player" aria-label="Trình phát nhạc">
      <div className="current-track">
        <div className="track-cover" aria-hidden="true">
          ♫
        </div>
        <div>
          <p className="track-title">Chưa có bài hát</p>
          <p className="track-artist">Chọn bài hát để bắt đầu</p>
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <button type="button" disabled title="Bài trước">
            |◀
          </button>
          <button
            className="play-button"
            type="button"
            disabled
            title="Phát nhạc"
          >
            ▶
          </button>
          <button type="button" disabled title="Bài tiếp">
            ▶|
          </button>
        </div>

        <div className="progress-row">
          <span>0:00</span>
          <div className="progress-track">
            <div className="progress-value" />
          </div>
          <span>0:00</span>
        </div>
      </div>

      <div className="player-volume">
        <span aria-hidden="true">♪</span>
        <div className="volume-track">
          <div />
        </div>
      </div>
    </footer>
  );
}
