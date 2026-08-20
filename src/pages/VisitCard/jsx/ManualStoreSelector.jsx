import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import "../css/ManualStoreSelector.css";

const REGION_FILTERS = ["전체", "서울", "경기", "부산", "대구"];

const FALLBACK_STORES = [
  {
    id: 1,
    name: "MCM 신세계 강남점",
    region: "서울",
    fullRegion: "서울특별시",
    type: "백화점",
  },
  {
    id: 2,
    name: "MCM 롯데 본점",
    region: "서울",
    fullRegion: "서울특별시",
    type: "백화점",
  },
  {
    id: 3,
    name: "MCM 현대 판교점",
    region: "경기",
    fullRegion: "경기도",
    type: "백화점",
  },
  {
    id: 4,
    name: "MCM 신세계 센텀시티점",
    region: "부산",
    fullRegion: "부산광역시",
    type: "백화점",
  },
  {
    id: 5,
    name: "MCM 대구 신세계점",
    region: "대구",
    fullRegion: "대구광역시",
    type: "백화점",
  },
];

function ManualStoreSelector({
  visitCardData,
  updateVisitCardData,
  onBack,
  onNext,
  stores = FALLBACK_STORES,
  isSubmitting = false,
  submitError = "",
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");

  const filteredStores = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLocaleLowerCase("ko-KR");

    return stores.filter((store) => {
      const matchesRegion =
        selectedRegion === "전체" || store.region === selectedRegion;
      const matchesKeyword = store.name
        .toLocaleLowerCase("ko-KR")
        .includes(normalizedKeyword);

      return matchesRegion && matchesKeyword;
    });
  }, [searchKeyword, selectedRegion, stores]);

  const handleStoreSelect = (store) => {
    updateVisitCardData({
      region: store.fullRegion,
      storeId: store.storeId ?? store.id,
      store: store.name,
      storeType: store.type,
    });
  };

  const handleConfirm = () => {
    if (!visitCardData.store) {
      return;
    }

    onNext();
  };

  return (
    <div className="visit-step manual-store-selector">
      <button
        type="button"
        className="visit-back-button"
        aria-label="추천 매장 화면으로 돌아가기"
        onClick={onBack}
      >
        ‹
      </button>

      <div className="visit-progress manual-store-progress">
        <span className="visit-progress-bar" />
      </div>

      <p className="visit-step-label manual-store-step-label">STEP 4</p>

      <h1 className="visit-step-title">방문할 매장을 선택해주세요.</h1>
      <p className="visit-step-description">
        고객님이 원하시는 매장을 선택해주세요.
      </p>

      <div className="visit-divider" />

      <label className="manual-store-search-label" htmlFor="store-search">
        매장명 검색
      </label>
      <input
        id="store-search"
        type="search"
        className="manual-store-search"
        value={searchKeyword}
        placeholder="매장명을 검색해주세요."
        autoComplete="off"
        onChange={(event) => setSearchKeyword(event.target.value)}
      />

      <div className="manual-store-filters" aria-label="지역 필터">
        {REGION_FILTERS.map((region) => {
          const isSelected = selectedRegion === region;

          return (
            <button
              type="button"
              key={region}
              className={`manual-store-filter ${
                isSelected ? "is-selected" : ""
              }`}
              aria-pressed={isSelected}
              onClick={() => setSelectedRegion(region)}
            >
              {region}
            </button>
          );
        })}
      </div>

      <p className="manual-store-result-count" aria-live="polite">
        검색 결과 {filteredStores.length}개
      </p>

      <div className="manual-store-list">
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => {
            const isSelected = visitCardData.store === store.name;

            return (
              <button
                type="button"
                key={store.id}
                className={`manual-store-item ${
                  isSelected ? "is-selected" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => handleStoreSelect(store)}
              >
                <MapPin aria-hidden="true" size={20} strokeWidth={2} />
                <span>{store.name}</span>
                <small>{store.region}</small>
              </button>
            );
          })
        ) : (
          <div className="manual-store-empty" role="status">
            조건에 맞는 매장이 없습니다.
            <br />
            검색어나 지역을 변경해주세요.
          </div>
        )}
      </div>

      <button
        type="button"
        className="manual-store-confirm"
        disabled={!visitCardData.store || isSubmitting}
        onClick={handleConfirm}
      >
        {isSubmitting ? "Visit Card 생성 중..." : "매장 선택하기"}
      </button>

      {submitError && (
        <p className="visit-submit-error" role="alert">
          {submitError}
        </p>
      )}
    </div>
  );
}

export default ManualStoreSelector;
