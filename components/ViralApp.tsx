"use client";

import { useEffect, useMemo, useState } from "react";
import { gachaItems, voteGames, type VoteGame } from "@/lib/games";

type Tab = "vote" | "gacha" | "room";
type Budget = "30K" | "50K" | "100K" | "Tất tay";
type ShareStatus = "idle" | "shared" | "copied" | "cancelled" | "manual";

type VoteResult = {
  gameSlug: string;
  optionId: string;
};

const BUDGET_LIMITS: Record<Budget, number> = {
  "30K": 30,
  "50K": 50,
  "100K": 100,
  "Tất tay": Number.POSITIVE_INFINITY
};

function formatCompact(value: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
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

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the legacy copy path for browsers/webviews that expose
      // navigator.clipboard but deny permission at runtime.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) throw new Error("Clipboard unavailable");
}

async function shareOrCopy(title: string, text: string, url: string): Promise<ShareStatus> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }

  const payload = `${text} ${url}`;
  try {
    await copyText(payload);
    return "copied";
  } catch {
    window.prompt("Copy link này để chia sẻ:", payload);
    return "manual";
  }
}

function VoteArena() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [result, setResult] = useState<VoteResult | null>(null);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const game = voteGames[activeIndex];
  const percentages = result?.gameSlug === game.slug ? resultFor(game, result.optionId) : null;
  const chosen = percentages?.find((item) => item.id === result?.optionId);

  const shareResult = async () => {
    if (!chosen) return;
    const text = `Tôi thuộc ${chosen.percent}% người chọn ${chosen.emoji} ${chosen.label} trên CHỐT! Bạn thuộc phe nào?`;
    const status = await shareOrCopy("CHỐT!", text, window.location.href);
    setShareStatus(status);
  };

  const shareLabel = shareStatus === "copied"
    ? "Đã copy ✓"
    : shareStatus === "manual"
      ? "Link đã hiện để copy"
      : "Quăng vào group ↗";

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
              onClick={() => {
                setResult({ gameSlug: game.slug, optionId: option.id });
                setShareStatus("idle");
              }}
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
            <button className="primary" onClick={shareResult}>{shareLabel}</button>
            <button className="ghost" onClick={() => { setResult(null); setShareStatus("idle"); }}>Chọn lại</button>
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
            onClick={() => { setActiveIndex(index); setResult(null); setShareStatus("idle"); }}
          />
        ))}
      </div>
    </section>
  );
}

function Gacha() {
  const [budget, setBudget] = useState<Budget>("50K");
  const eligibleItems = useMemo(
    () => gachaItems.filter((item) => item.priceK <= BUDGET_LIMITS[budget]),
    [budget]
  );
  const [result, setResult] = useState(() => gachaItems.find((item) => item.priceK <= 50) ?? gachaItems[0]);
  const [rolling, setRolling] = useState(false);

  const chooseBudget = (nextBudget: Budget) => {
    if (rolling) return;
    const pool = gachaItems.filter((item) => item.priceK <= BUDGET_LIMITS[nextBudget]);
    setBudget(nextBudget);
    setResult(pool[Math.floor(Math.random() * pool.length)] ?? gachaItems[0]);
  };

  const roll = () => {
    if (rolling || eligibleItems.length === 0) return;
    setRolling(true);
    let ticks = 0;
    const timer = window.setInterval(() => {
      setResult(eligibleItems[Math.floor(Math.random() * eligibleItems.length)]);
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
        {(["30K", "50K", "100K", "Tất tay"] as Budget[]).map((item) => (
          <button
            className={budget === item ? "active" : ""}
            onClick={() => chooseBudget(item)}
            key={item}
            disabled={rolling}
          >
            {item}
          </button>
        ))}
      </div>
      <div className={`gacha-box ${rolling ? "rolling" : ""}`}>
        <span className="rarity">{result.rarity}</span>
        <div className="food-emoji">{result.emoji}</div>
        <strong>{result.name}</strong>
        <small>{budget === "Tất tay" ? `Khoảng ${result.priceK}K+` : `Hợp kèo ${budget} · khoảng ${result.priceK}K`}</small>
      </div>
      <button className="roll-button" onClick={roll} disabled={rolling}>
        {rolling ? "Đang quay..." : "QUAY NGAY ✦"}
      </button>
      <p className="microcopy">Chụp màn hình kết quả rồi tag đứa hay nói “ăn gì cũng được”.</p>
    </section>
  );
}

type GroupRoomProps = {
  roomCode: string;
  onCreateRoom: () => void;
};

function GroupRoom({ roomCode, onCreateRoom }: GroupRoomProps) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const roomUrl = useMemo(() => {
    if (!roomCode || typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    url.hash = "";
    return url.toString();
  }, [roomCode]);

  useEffect(() => {
    setShareStatus("idle");
  }, [roomCode]);

  const shareRoom = async () => {
    if (!roomCode) return;
    const text = `Vào room ${roomCode} trên CHỐT! rồi vote kín. Đủ người mới reveal 😈`;
    const status = await shareOrCopy(`Room ${roomCode}`, text, roomUrl);
    setShareStatus(status);
  };

  const shareLabel = shareStatus === "copied"
    ? "Đã copy link ✓"
    : shareStatus === "manual"
      ? "Copy link trong popup ✓"
      : "Mời hội bạn ↗";

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
          <button className="roll-button" onClick={onCreateRoom}>TẠO ROOM MỚI ✦</button>
        </div>
      ) : (
        <div className="room-card">
          <span className="room-label">MÃ PHÒNG</span>
          <strong className="room-code">{roomCode}</strong>
          <div className="room-status"><span className="pulse" /> Bạn đang ở room này · 1/5 người</div>
          <button className="primary" onClick={shareRoom}>{shareLabel}</button>
          <button className="ghost" onClick={onCreateRoom}>Tạo mã khác</button>
          <small className="demo-note">MVP hiện tạo/share room ở phía client. Realtime sync sẽ nối backend ở bước kế tiếp.</small>
        </div>
      )}
    </section>
  );
}

export default function ViralApp() {
  const [tab, setTab] = useState<Tab>("vote");
  const [roomCode, setRoomCode] = useState("");

  const createRoom = () => {
    setRoomCode(makeRoomCode());
  };

  const openRoom = () => {
    setTab("room");
    setRoomCode((current) => current || makeRoomCode());
    window.setTimeout(() => {
      document.getElementById("play")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  useEffect(() => {
    const invitedCode = new URLSearchParams(window.location.search)
      .get("room")
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);

    if (!invitedCode) return;

    setRoomCode(invitedCode);
    setTab("room");
    window.requestAnimationFrame(() => {
      document.getElementById("play")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <main>
      <div className="noise" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="CHỐT! trang chủ"><span>CHỐT!</span><b>beta</b></a>
        <nav>
          <a href="#trending">Đang hot</a>
          <a href="#how">Cách chơi</a>
        </nav>
        <button className="header-cta" onClick={openRoom}>+ Tạo room</button>
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
        {tab === "room" && <GroupRoom roomCode={roomCode} onCreateRoom={createRoom} />}
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
