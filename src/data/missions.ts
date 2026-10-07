import type { PhotoMission, RankInfo } from '../types';

export const PHOTO_MISSIONS: PhotoMission[] = [
  {
    id: 1,
    title: 'รถไฟ + รูปปั้น',
    icon: '🚂',
    hint: 'หารูปปั้นกับรถไฟที่สถานี',
    relatedPlaceId: 1,
  },
  {
    id: 2,
    title: 'จ่าทวี',
    icon: '🏛️',
    hint: 'หาของเก่าที่ลูกชอบ',
    relatedPlaceId: 2,
  },
  {
    id: 3,
    title: 'แมวตัวโปรด',
    icon: '🐱',
    hint: 'หาแมวที่ลูกชอบ',
    relatedPlaceId: 3,
  },
  {
    id: 4,
    title: 'นักอ่านตัวน้อย',
    icon: '📚',
    hint: 'เลือกหนังสือ 1 เล่ม',
    relatedPlaceId: 4,
  },
  {
    id: 5,
    title: 'Street Art สัตว์',
    icon: '🎨',
    hint: 'หา รูปสัตว์หรือเสือ',
    relatedPlaceId: 6,
  },
  {
    id: 6,
    title: 'Street Art รถไฟ',
    icon: '🚂',
    hint: 'หารูปรถไฟหรือรถ',
    relatedPlaceId: 6,
  },
  {
    id: 7,
    title: 'หอนาฬิกา',
    icon: '🕐',
    hint: 'ถ่ายลูกกับหอนาฬิกา',
    relatedPlaceId: 7,
  },
  {
    id: 8,
    title: 'พระราชวังจันทน์',
    icon: '🏯',
    hint: 'หากำแพงหรือของเก่า',
    relatedPlaceId: 8,
  },
  {
    id: 9,
    title: 'พระนเรศวร',
    icon: '👑',
    hint: 'หารูปพระนเรศวร',
    relatedPlaceId: 8,
  },
  {
    id: 10,
    title: 'พระพุทธชินราช',
    icon: '🙏',
    hint: 'ถ่ายรูปพระพุทธชินราช',
    relatedPlaceId: 9,
  },
  {
    id: 11,
    title: 'พิษณุโลก + ธงไทย',
    icon: '🇹🇭',
    hint: 'หา Street Art คำว่า “พิษณุโลก”',
    isBonus: true,
    relatedPlaceId: 6,
  },
];

export const RANKS: RankInfo[] = [
  {
    minStars: 0,
    maxStars: 9,
    title: 'นักสำรวจเริ่มต้น',
    badge: '🎒',
    description: 'เริ่มออกผจญภัยแล้ว!',
    color: 'from-amber-500 to-orange-500',
  },
  {
    minStars: 10,
    maxStars: 19,
    title: 'นักล่าภาพ',
    badge: '📸',
    description: 'หาเก่งมาก!',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    minStars: 20,
    maxStars: 25,
    title: 'นักผจญภัย',
    badge: '🧭',
    description: 'เก็บได้เยอะมาก!',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    minStars: 26,
    maxStars: 30,
    title: 'Super Explorer',
    badge: '⚡',
    description: 'สุดยอดนักสำรวจ!',
    color: 'from-purple-500 to-pink-500',
  },
  {
    minStars: 31,
    maxStars: 31,
    title: 'Photo Master',
    badge: '👑',
    description: 'ครบ 31 ดาว!',
    color: 'from-amber-400 via-orange-500 to-yellow-500',
  },
];

export function getRank(totalStars: number): RankInfo {
  if (totalStars >= 31) return RANKS[4];
  if (totalStars >= 26) return RANKS[3];
  if (totalStars >= 20) return RANKS[2];
  if (totalStars >= 10) return RANKS[1];
  return RANKS[0];
}
