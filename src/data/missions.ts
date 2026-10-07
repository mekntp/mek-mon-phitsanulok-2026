import type { PhotoMission, RankInfo } from '../types';

export const PHOTO_MISSIONS: PhotoMission[] = [
  {
    id: 1,
    title: 'รถไฟ + รูปปั้นหน้าสถานี',
    icon: '🚂',
    hint: 'หาองค์ประกอบที่มีทั้ง “รถไฟ” และ “รูปปั้น” ในบริเวณสถานี',
    relatedPlaceId: 1,
  },
  {
    id: 2,
    title: 'พิพิธภัณฑ์จ่าทวี',
    icon: '🏛️',
    hint: 'ถ่ายรูปกับของเก่าที่ลูกคิดว่า “แปลกที่สุด”',
    relatedPlaceId: 2,
  },
  {
    id: 3,
    title: 'แมวตัวโปรด',
    icon: '🐱',
    hint: 'หาแมวที่ลูกชอบที่สุด แล้วถ่ายรูปด้วยกัน',
    relatedPlaceId: 3,
  },
  {
    id: 4,
    title: 'นักอ่านตัวน้อย',
    icon: '📚',
    hint: 'เลือกหนังสือ 1 เล่มในห้องสมุด แล้วถ่ายรูป',
    relatedPlaceId: 4,
  },
  {
    id: 5,
    title: 'Street Art – สัตว์',
    icon: '🎨',
    hint: 'หา Street Art รูปสัตว์/เสือ',
    relatedPlaceId: 6,
  },
  {
    id: 6,
    title: 'Street Art – รถไฟ',
    icon: '🚂',
    hint: 'หา Street Art ที่มีรถไฟ/สถานี/ยานพาหนะ',
    relatedPlaceId: 6,
  },
  {
    id: 7,
    title: 'หอนาฬิกา',
    icon: '🕐',
    hint: 'ถ่ายให้เห็นทั้งลูกและหอนาฬิกา',
    relatedPlaceId: 7,
  },
  {
    id: 8,
    title: 'พระราชวังจันทน์',
    icon: '🏯',
    hint: 'ถ่ายรูปกับโบราณสถาน/กำแพงเก่า',
    relatedPlaceId: 8,
  },
  {
    id: 9,
    title: 'สมเด็จพระนเรศวร',
    icon: '👑',
    hint: 'หาอนุสาวรีย์/พระราชานุสาวรีย์สมเด็จพระนเรศวร',
    relatedPlaceId: 8,
  },
  {
    id: 10,
    title: 'พระพุทธชินราช',
    icon: '🙏',
    hint: 'ถ่ายรูปกับวัด/พระพุทธชินราช',
    relatedPlaceId: 9,
  },
  {
    id: 11,
    title: '“พิษณุโลก” + ธงชาติไทย',
    icon: '🇹🇭',
    hint: 'หา Street Art ที่มีคำว่า “พิษณุโลก” และธงชาติไทย',
    isBonus: true,
    relatedPlaceId: 6,
  },
];

export const RANKS: RankInfo[] = [
  {
    minStars: 0,
    maxStars: 9,
    title: 'Explorer เริ่มต้น',
    badge: '🎒',
    description: 'ก้าวแรกของการผจญภัยสองพ่อลูก!',
    color: 'from-amber-500 to-orange-500',
  },
  {
    minStars: 10,
    maxStars: 19,
    title: 'นักล่าภาพ',
    badge: '📸',
    description: 'เริ่มจับตามองสิ่งรอบตัวและถ่ายรูปสนุกสนาน',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    minStars: 20,
    maxStars: 25,
    title: 'นักผจญภัย',
    badge: '🧭',
    description: 'สายตาแหลมคม เก็บภารกิจไปได้เยอะมาก!',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    minStars: 26,
    maxStars: 30,
    title: 'Super Explorer',
    badge: '⚡',
    description: 'สุดยอดนักสำรวจเมืองพิษณุโลก!',
    color: 'from-purple-500 to-pink-500',
  },
  {
    minStars: 31,
    maxStars: 31,
    title: 'Phitsanulok Photo Master',
    badge: '👑',
    description: 'ปรมาจารย์แห่งภาพถ่ายพิษณุโลก พิชิตครบ 31 ดาว!',
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
