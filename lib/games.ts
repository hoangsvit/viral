export type VoteOption = {
  id: string;
  label: string;
  emoji: string;
  seedVotes: number;
};

export type VoteGame = {
  slug: string;
  eyebrow: string;
  question: string;
  description: string;
  accent: string;
  participants: number;
  options: VoteOption[];
};

export type GachaItem = {
  name: string;
  emoji: string;
  rarity: string;
  priceK: number;
};

export const voteGames: VoteGame[] = [
  {
    slug: "red-flag-nguoi-yeu-cu",
    eyebrow: "🔥 Đang tranh cãi",
    question: "Người yêu đi ăn riêng với người yêu cũ — ổn không?",
    description: "Chọn trước rồi mới được xem Internet đứng về phe nào.",
    accent: "#ff5d8f",
    participants: 18472,
    options: [
      { id: "red", label: "Red flag", emoji: "🚩", seedVotes: 13490 },
      { id: "fine", label: "Bình thường", emoji: "🟢", seedVotes: 4982 }
    ]
  },
  {
    slug: "luong-15-trieu-sai-gon",
    eyebrow: "💸 Dân văn phòng",
    question: "Lương 15 triệu ở Sài Gòn: đủ sống thoải mái chưa?",
    description: "Một câu hỏi, hai phe, không né tránh.",
    accent: "#ffd84d",
    participants: 9621,
    options: [
      { id: "yes", label: "Đủ nếu biết tiêu", emoji: "😎", seedVotes: 5526 },
      { id: "no", label: "Khó nha bro", emoji: "🥲", seedVotes: 4095 }
    ]
  },
  {
    slug: "iphone-hay-android",
    eyebrow: "📱 Kèo kinh điển",
    question: "Chỉ được dùng một hệ máy 5 năm tới?",
    description: "Chọn team rồi xem mình có đang đi ngược đám đông không.",
    accent: "#7cf6ff",
    participants: 24103,
    options: [
      { id: "iphone", label: "iPhone", emoji: "🍎", seedVotes: 14744 },
      { id: "android", label: "Android", emoji: "🤖", seedVotes: 9359 }
    ]
  }
];

export const gachaItems: GachaItem[] = [
  { name: "Bánh mì", emoji: "🥖", rarity: "QUỐC DÂN", priceK: 30 },
  { name: "Xôi mặn", emoji: "🍚", rarity: "QUỐC DÂN", priceK: 30 },
  { name: "Cơm tấm", emoji: "🍖", rarity: "QUỐC DÂN", priceK: 50 },
  { name: "Bún bò", emoji: "🍜", rarity: "QUỐC DÂN", priceK: 50 },
  { name: "Phở", emoji: "🥢", rarity: "HIẾM", priceK: 50 },
  { name: "Cơm gà", emoji: "🍗", rarity: "QUỐC DÂN", priceK: 50 },
  { name: "Sushi", emoji: "🍣", rarity: "CỰC PHẨM", priceK: 100 },
  { name: "Lẩu", emoji: "🍲", rarity: "HIẾM", priceK: 100 },
  { name: "Steak", emoji: "🥩", rarity: "TỐI MẬT", priceK: 200 }
];
