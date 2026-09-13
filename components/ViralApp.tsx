"use client";

import { useMemo, useState } from "react";
import { gachaItems, voteGames, type VoteGame } from "@/lib/games";

type Tab = "vote" | "gacha" | "room";

type VoteResult = {
  gameSlug: string;
  optionId: string;
};

function formatCompact(value: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function resultFor(game: VoteGame, selected: string) {
  const votes = game.options.map((option) => ({
    ...option,
    votes: option.seedVotes + (option.id === selected ? 1 : 0)
  }));
  const total = votes.reduce((sum, option) => sum + option.votes, 0);
  return votes.map((option) => ({
    ...option,
    percent: Math.round((option.votes / total) * 100)
  }));
}

function VoteArena() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [result, setResult] = useState<VoteResult | null>(null);
  const game = voteGames[activeIndex];
  const percentages = result?.gameSlug === game.slug ? resultFor(game, result.optionId) : null;
  const chosen = percentages?.find((item) => item.id === result?.optionId);

  const shareResult = async () => {
    if (!chosen) return;
    const text = `Tôi thuộc ${chosen.percent}% người chọn ${chosen.emoji} ${chosen.label} trên CHỐT! Bạn thuộc phe nào?`;
    if (navigator.share) {
      await navigator.share({ title: "CHỐT!", text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Đã copy kết quả để bạn quăng vào group 😎");
    }
  };

  return (
    <section className="arena" aria-label="Vote cộng đồng">
      <div className="arena-topline">
        <span className="eyebrow">{game.eyebrow}</span>
        <span className="counter">{formatCompact(game.participants)} lượt demo</span>
      </div>
      <h2>{game.question}</h2>
      <p>{game.description}</p>

      {!percentages ? (
        <div className="vote-grid">
          {game.options.map((option) => (
            <button
              className="vote-option"
              key={option.id}
              onClick={() => setResult({ gameSlug: game.slug, optionId: option.id })}
            >
              <span>{option.emoji}</span>
              <strong>{option.label}</strong>
              <small>CHỌN PHE</small>
            </button>
          ))}
        </div>
      ) : (
        <div className="result-panel">
          <div className="result-kicker">BẠN ĐÃ CHỐT</div>
          <div className="chosen-line">
            <span>{chosen?.emoji}</span>
            <strong>{chosen?.label}</strong>
          </div>
          <p className="crowd-copy">
            Bạn thuộc <b>{chosen?.percent}%</b> người chọn phe này.
          </p>
          <div className="bars">
            {percentages.map((item) => (
              <div className="bar-row" key={item.id}>
                <div className="bar-label">
                  <span>{item.emoji} {item.label}</span>
                  <b>{item.percent}%</b>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${item.percent}%`, background: game.accent }} />
                </div>
              </div>
            ))}
          </div>
          <div className="result-actions">
            <button className="primary" onClick={shareResult}>Quăng vào group ↗</button>
            <button className="ghost" onClick={() => setResult(null)}>Chọn lại</button>
          </div>
          <small className="demo-note">Số lượt hiện tại là dữ liệu mẫu cho MVP, chưa phải realtime.</small>
        </div>
      )}

      <div className="pager">
        {voteGames.map((item, index) => (
          <button
            key={item.slug}
            className={index === activeIndex ? "active" : ""}
            aria-label={`Mở câu hỏi ${index + 1}`}
            onClick={() => { setActiveIndex(index); setResult(null); }}
          />
        ))}
      </div>
    </section>
  );
}

function Gacha() {
  const [result, setResult] = useState(gachaItems[0]);
  const [rolling, setRolling] = useState(false);
  const [budget, setBudget] = useState("50K");

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const timer = window.setInterval(() => {
      setResult(gachaItems[Math.floor(Math.random() * gachaItems.length)]);
      ticks += 1;
      if (ticks > 12) {
        window.clearInterval(timer);
        setRolling(false);
      }
    }, 90);
  };

  return (
    <section className="arena gacha-arena">
      <div className="arena-topline">
        <span className="eyebrow">🎁 TRƯA NAY ĂN GÌ?</span>
        <span className="counter">Gacha mode</span>
      </div>
      <h2>Đừng nghĩ nữa. Mở hòm đi.</h2>
      <p>Chọn ngân sách rồi để định mệnh quyết định bữa trưa.</p>
      <div className="budget-row">
        {["30K", "50K", "100K", "Tất tay"].map((item) => (
          <button className={budget === item ? "active" : ""} onClick={() => setBudget(item)} key={item}>{item}</button>
        ))}
      </div>
      <div className={`gacha-box ${rolling ? "rolling" : ""}`}>
        <span className="rarity">{result.rarity}</span>
        <div className="food-emoji">{result.emoji}</div>
        <strong>{result.name}</strong>
        <small>Ngân sách {budget}</small>
      </div>
      <button className="roll-button" onClick={roll} disabled={rolling}>
        {rolling ? "Đang quay..." : "QUAY NGAY ✦"}
      </button>
      <p className="microcopy">Chụp màn hình kết quả rồi tag đứa hay nói “ăn gì cũng được”.</p>
    </section>
  );
}

function GroupRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const roomUrl = useMemo(() => roomCode ? `${typeof window !== "undefined" ? window.location.origin : ""}/?room=${roomCode}` : "", [roomCode]);

  const createRoom = () => {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();
    setRoomCode(code);
    setCopied(false);
  };

  const shareRoom = async () => {
    if (!roomCode) return;
    const text = `Vào room ${roomCode} trên CHỐT! rồi vote kín. Đủ người mới reveal 😈`;
    if (navigator.share) {
      await navigator.share({ title: `Room ${roomCode}`, text, url: roomUrl });
    } else {
      await navigator.clipboard.writeText(`${text} ${roomUrl}`);
      setCopied(true);
    }
  };

  return (
    <section className="arena room-arena">
      <div className="arena-topline">
        <span className="eyebrow">👥 GROUP ROOM</span>
        <span className="counter">Kéo hội bạn vào</span>
      </div>
      <h2>Vote kín. Đủ người. Reveal cùng lúc.</h2>
      <p>Format dành cho group chat: ai cũng chọn trước, không ai bị dắt theo số đông.</p>

      {!roomCode ? (
        <div className="room-empty">
          <div className="avatar-stack" aria-hidden="true"><span>😎</span><span>👀</span><span>🤡</span><span>+?</span></div>
          <button className="roll-button" onClick={createRoom}>TẠO ROOM MỚI ✦</button>
        </div>
      ) : (
        <div className="room-card">
          <span className="room-label">MÃ PHÒNG</span>
          <strong className="room-code">{roomCode}</strong>
          <div className="room-status"><span className="pulse" /> 1/5 người đã vào</div>
          <button className="primary" onClick={shareRoom}>{copied ? "Đã copy link ✓" : "Mời hội bạn ↗"}</button>
          <button className="ghost" onClick={createRoom}>Tạo mã khác</button>
          <small className="demo-note">MVP hiện tạo/share room ở phía client. Realtime sync sẽ nối backend ở bước kế tiếp.</small>
        </div>
      )}
    </section>
  );
}

export default function ViralApp() {
  const [tab, setTab] = useState<Tab>("vote");

  return (
    <main>
      <div className="noise" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CHỐT! trang chủ"><span>CHỐT!</span><b>beta</b></a>
        <nav>
          <a href="#trending">Đang hot</a>
          <a href="#how">Cách chơi</a>
        </nav>
        <button className="header-cta" onClick={() => setTab("room")}>+ Tạo room</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-badge"><span className="pulse" /> Internet đang cãi nhau</div>
        <h1>Khó chọn?<br /><em>Để Internet chốt.</em></h1>
        <p>Mini game cho những quyết định tưởng nhỏ nhưng có thể cãi tới tối. Chọn phe trước — xem đám đông sau.</p>
        <div className="hero-actions">
          <button className="primary big" onClick={() => { setTab("vote"); document.getElementById("play")?.scrollIntoView({ behavior: "smooth" }); }}>CHƠI NGAY ↓</button>
          <span>Không login · 5 giây là chơi</span>
        </div>
        <div className="float-card float-left"><span>🚩</span><b>73%</b><small>RED FLAG</small></div>
        <div className="float-card float-right"><span>🍜</span><b>50K</b><small>ĂN GÌ?</small></div>
      </section>

      <section className="ticker" aria-label="Xu hướng">
        <div>🔥 RED FLAG HAY GREEN FLAG?　 ✦　 🍜 TRƯA NAY ĂN GÌ?　 ✦　 💸 15 TRIỆU ĐỦ SỐNG?　 ✦　 📱 IPHONE HAY ANDROID?　 ✦</div>
      </section>

      <section className="play-section" id="play">
        <div className="section-heading" id="trending">
          <div><span className="section-number">01</span><span>PLAYGROUND</span></div>
          <h2>Hôm nay<br />chốt gì?</h2>
        </div>
        <div className="tab-list">
          <button className={tab === "vote" ? "active" : ""} onClick={() => setTab("vote")}>🔥 Vote cộng đồng</button>
          <button className={tab === "gacha" ? "active" : ""} onClick={() => setTab("gacha")}>🎁 Gacha</button>
          <button className={tab === "room" ? "active" : ""} onClick={() => setTab("room")}>👥 Group Room</button>
        </div>
        {tab === "vote" && <VoteArena />}
        {tab === "gacha" && <Gacha />}
        {tab === "room" && <GroupRoom />}
      </section>

      <section className="how" id="how">
        <div className="section-heading compact">
          <div><span className="section-number">02</span><span>VIRAL LOOP</span></div>
          <h2>Chơi → sốc → share.</h2>
        </div>
        <div className="steps">
          <article><b>01</b><span>👆</span><h3>Chọn trước</h3><p>Không thấy kết quả trước. Không để đám đông dắt mũi.</p></article>
          <article><b>02</b><span>🤯</span><h3>Reveal sau</h3><p>Biết mình thuộc số đông hay là “1% khác người”.</p></article>
          <article><b>03</b><span>↗</span><h3>Quăng vào group</h3><p>Kết quả được viết sẵn để share, kéo người tiếp theo vào chơi.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><span>CHỐT!</span></a>
        <p>Khó chọn? Để Internet chốt.</p>
        <span>Prototype MVP · 2026</span>
      </footer>
    </main>
  );
}
