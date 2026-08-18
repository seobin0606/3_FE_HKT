import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/WallArtEnd.css";
import BackBtn from "../../../components/jsx/BackBtn";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function WallArtEnd() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(true);
  const [leaveError, setLeaveError] = useState("");

  useEffect(() => {
    const leaveStoreMode = async () => {
      const visitCardId = Number(localStorage.getItem("visitCardId"));

      if (!visitCardId) {
        setLeaveError("Visit Card ID가 없어 매장모드를 종료할 수 없습니다.");
        setIsLeaving(false);
        return;
      }

      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(
          `${API_BASE_URL}/api/store-mode/${visitCardId}/leave`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken && {
                Authorization: `Bearer ${accessToken}`,
              }),
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("매장 모드 종료 실패:", {
            status: response.status,
            response: errorText,
          });
          throw new Error(`매장 모드 종료 실패: ${response.status}`);
        }

        console.log("매장 모드 종료 완료:", await response.json());
      } catch (error) {
        console.error("매장 모드 종료 중 오류:", error);
        setLeaveError(error.message || "매장모드 종료에 실패했습니다.");
      } finally {
        setIsLeaving(false);
      }
    };

    leaveStoreMode();
  }, []);

  return (
    <div className="WallArtEnd-page">
      <header className="WallArtEnd-header">
        <BackBtn />
      </header>
      <main className="WallArtEnd-main">
        <div className="WallArtEnd-content">
          <p>
            아트월이 종료되었습니다.
            <br />
            편안한 쇼핑 되시길 바랍니다.
          </p>
          {isLeaving && <p>매장모드를 종료하는 중...</p>}
          {leaveError && <p>{leaveError}</p>}
        </div>
        <div className="WallArtEnd-btn-group">
          <button
            type="button"
            className="WallArtEnd-close-btn yellow-btn"
            onClick={() => navigate("/")}
            disabled={isLeaving}
          >
            {isLeaving ? "종료 중..." : "홈으로 가기"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default WallArtEnd;
