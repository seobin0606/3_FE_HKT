import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/qr.css";

import BackBtn from "../../../components/jsx/BackBtn";
import BottomNav from "../../../components/jsx/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const STORE_ID_MAP = {
  "MCM 신세계 강남점": 1,
  "MCM 롯데 본점": 2,
  "MCM 현대 판교점": 3,
  "MCM 신세계 센텀시티점": 4,
  "MCM 대구 신세계점": 5,
  "MCM 신세계본점": 1,
  "MCM HAUS": 2,
};

const getStoreIdFromSavedVisitCard = () => {
  try {
    const raw = localStorage.getItem("wtw-visit-card");
    if (!raw) return 5;

    const savedData = JSON.parse(raw);
    const selectedStoreName = savedData?.store;

    if (!selectedStoreName) return 5;

    return STORE_ID_MAP[selectedStoreName] ?? 5;
  } catch (error) {
    console.warn(
      "저장된 방문카드 데이터를 읽지 못해 기본 storeId=5를 사용합니다.",
      error,
    );
    return 5;
  }
};

function QR() {
  const navigate = useNavigate();

  // 팝업바 체크용(백엔드 연동 전까지 임시로 사용)
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const handleStoreModeActivate = async () => {
    const visitCardId = Number(localStorage.getItem("visitCardId"));
    const accessToken = localStorage.getItem("accessToken");

    if (!visitCardId) {
      alert("Visit Card ID가 없습니다. 먼저 Visit Card를 생성해주세요.");
      return;
    }

    const storeId = getStoreIdFromSavedVisitCard();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/store-mode/${visitCardId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && {
              Authorization: `Bearer ${accessToken}`,
            }),
          },
          body: JSON.stringify({ storeId }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("매장 모드 활성화 실패:", {
          status: response.status,
          payload: { storeId },
          response: errorText,
        });
        throw new Error(`매장 모드 활성화 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("매장 모드 활성화 완료:", result);
      navigate("/screen-sharing");
    } catch (error) {
      console.error("매장 모드 활성화 중 오류:", error);
      alert(error.message || "매장 모드 활성화에 실패했습니다.");
    }
  };

  return (
    <div className="QR-page">
      <header className="QR-header">
        <BackBtn />
      </header>
      <main className="QR-main">
        <div className="QR-content">
          <span>QR code</span>
        </div>
        <div className="QR-code-container">
          <div>QR code</div>
          {/* 임시로 스캔 했다고 할 때.. 사용 */}
          <button type="button" className="QR-scan-button" onClick={openPopup}>
            스캔 완료
          </button>
        </div>
      </main>
      <footer className="QR-footer">
        <BottomNav />
      </footer>
      {/* 하단 팝업 바 UI (isPopupOpen이 true일 때만 출력) */}
      {isPopupOpen && (
        <div className="popup-overlay" onClick={closePopup}>
          {/* stopPropagation: 팝업 내부를 클릭할 때는 배경 클릭(닫기) 이벤트 방지 */}
          <div className="popup-bar" onClick={(e) => e.stopPropagation()}>
            <div className="popup-handle"></div>

            <div className="popup-content">
              <p>
                AI가 오늘의 Visit Card를 불러와 아트월 및 직원 태블릿에
                반영하며, 매장모드를 실행합니다
              </p>

              <div className="popup-btn-group">
                <button
                  type="button"
                  className="popup-confirm-btn"
                  onClick={handleStoreModeActivate}
                >
                  동의합니다
                </button>
                <button
                  type="button"
                  className="popup-close-btn"
                  onClick={closePopup}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QR;
