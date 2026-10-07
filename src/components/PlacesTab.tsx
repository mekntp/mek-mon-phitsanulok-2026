import type { Place } from '../types';
import { CheckCircle2, Circle, Heart, Navigation, Map } from 'lucide-react';
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-4 text-white shadow-md">
        <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-1">
          <Map className="w-4 h-4" />
          <span>🗺️ แผนเที่ยว</span>
        </div>
        <h3 className="text-base font-bold">เดินเที่ยวเมืองพิษณุโลก</h3>
        <p className="text-xs text-blue-100 mt-1">
          11 จุด • เริ่มและจบที่สถานีรถไฟ
        </p>

        <a
          href={FULL_ROUNDTRIP_GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white text-blue-900 font-bold text-xs"
        >
          <Navigation className="w-4 h-4 text-blue-600 fill-blue-600" />
          <span>เปิด Google Maps</span>
        </a>
      </div>

      <div className="bg-amber-100 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900">
        💛 <strong>ไม่ต้องครบทุกจุด</strong> — ลูกสนุกตรงไหน อยู่ตรงนั้นได้เลย
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-bold text-slate-500">
          📍 เส้นทาง {places.length} จุด
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
          {visitedCount}/{places.length} จุด
        </div>
      </div>

      <div className="space-y-3 relative">
        {places.map((place, index) => {
          const isVisited = visitedPlaces.includes(place.id);
          const isLast = index === places.length - 1;

          return (
            <div key={place.id} className="relative">
              {!isLast && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 -mb-3 bg-amber-200 -z-0" />
              )}

              <div
                className={`relative z-10 rounded-2xl p-4 border ${
                  isVisited
                    ? 'bg-amber-50 border-emerald-300'
                    : 'bg-white border-amber-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                        isVisited
                          ? 'bg-emerald-100 border border-emerald-300'
                          : 'bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {place.icon}
                    </div>
                    <span className="absolute -top-1.5 -left-1.5 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base">
                            {place.name}
                          </h3>
                          {place.isFavoriteForKids && (
                            <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                              เด็กชอบ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-700 font-medium mt-0.5">
                          {place.tagline}
                        </p>
                      </div>

                      <button
                        onClick={() => onToggleVisited(place.id)}
                        className={`p-1.5 rounded-xl ${
                          isVisited ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                        title={isVisited ? 'เอาออก' : 'ถึงแล้ว'}
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

                    {place.highlights?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {place.highlights.map((item, hIdx) => (
                          <span
                            key={hIdx}
                            className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            • {item}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Maps
                      </a>

                      <button
                        onClick={() => onJumpToPhotoHunt(place.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 ml-auto"
                      >
                        📸 ภารกิจ
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
