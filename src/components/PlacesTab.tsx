import type { Place } from '../types';
import { CheckCircle2, Circle, Heart, Sparkles, Navigation, Map } from 'lucide-react';
import { FULL_ROUNDTRIP_GOOGLE_MAPS_URL } from '../data/places';

interface PlacesTabProps {
  places: Place[];
  visitedPlaces: number[];
  onToggleVisited: (placeId: number) => void;
  onJumpToPhotoHunt: (placeId?: number) => void;
}

export const PlacesTab: React.FC<PlacesTabProps> = ({
  places,
  visitedPlaces,
  onToggleVisited,
  onJumpToPhotoHunt,
}) => {
  const visitedCount = visitedPlaces.length;

  return (
    <div className="space-y-4">
      {/* Full Roundtrip Google Maps Navigation Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-4 text-white shadow-md shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
            <Map className="w-4 h-4 text-blue-200" />
            <span>แผนที่นำทางฉบับเต็ม (Full Route)</span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug">
            เส้นทางเดินวนรอบเมืองพิษณุโลก (Round-Trip)
          </h3>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            เชื่อมต่อ 11 จุด เริ่มต้นจากวงเวียนสถานีรถไฟ วนรอบเมือง และกลับมายังสถานีรถไฟ
          </p>

          <a
            href={FULL_ROUNDTRIP_GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 active:scale-98 text-blue-900 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>เปิด Google Maps นำทางตลอดเส้นทาง</span>
          </a>
        </div>
      </div>

      {/* Principle Banner */}
      <div className="bg-amber-100/70 border border-amber-300/70 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-950">💡 คำแนะนำทริปพ่อลูก:</p>
          <p>
            ไม่จำเป็นต้องไปครบทุกจุดครับ! ถ้าลูกสนุกกับที่ไหนเป็นพิเศษ ให้ใช้เวลากับตรงนั้นได้เต็มที่เลย โดยเฉพาะ{' '}
            <strong className="text-orange-950 underline decoration-amber-400">Cat Cafe / สนามเด็กเล่น / Street Art / สวนชมน่าน</strong>
          </p>
        </div>
      </div>

      {/* Visited Summary Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          เส้นทางตามลำดับ (11 จุด)
        </div>
        <div className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
          เช็คอินแล้ว: <span className="font-bold text-amber-600">{visitedCount}</span> / {places.length}
        </div>
      </div>

      {/* Route Cards */}
      <div className="space-y-3 relative">
        {places.map((place, index) => {
          const isVisited = visitedPlaces.includes(place.id);
          const isLast = index === places.length - 1;

          return (
            <div key={place.id} className="relative">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 -mb-3 bg-gradient-to-b from-amber-300 to-amber-200 -z-0" />
              )}

              <div
                className={`relative z-10 rounded-2xl p-4 transition-all duration-200 border ${
                  isVisited
                    ? 'bg-amber-50/70 border-emerald-300/80 shadow-xs'
                    : 'bg-white border-amber-100/90 shadow-xs hover:border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Step Number & Icon Badge */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-colors ${
                        isVisited
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-slate-800 border border-amber-200'
                      }`}
                    >
                      {place.icon}
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {index + 1}
                    </span>
                  </div>

                  {/* Place Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base leading-snug">
                            {place.name}
                          </h3>
                          {place.isFavoriteForKids && (
                            <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                              เด็กชอบมาก
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-700 font-medium mt-0.5">{place.tagline}</p>
                      </div>

                      {/* Visited Toggle Button */}
                      <button
                        onClick={() => onToggleVisited(place.id)}
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isVisited
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'
                        }`}
                        title={isVisited ? 'ยกเลิกเช็คอิน' : 'เช็คอินว่าถึงแล้ว'}
                      >
                        {isVisited ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-100 text-emerald-600" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {place.description}
                    </p>

                    {/* Highlights Tags */}
                    {place.highlights && place.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {place.highlights.map((item, hIdx) => (
                          <span
                            key={hIdx}
                            className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            • {item}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition-all border border-blue-200 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                      </a>

                      <button
                        onClick={() => onJumpToPhotoHunt(place.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 active:scale-95 transition-all border border-orange-200 cursor-pointer ml-auto"
                      >
                        <span>📸 ส่องภารกิจรูป</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
