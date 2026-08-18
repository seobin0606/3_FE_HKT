import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/ScreenSharing.css";
import BackBtn from "../../../components/jsx/BackBtn";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ScreenSharing() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleAgree = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch(`${API_BASE_URL}/api/wall-art`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("월아트 생성 실패:", response.status, errorText);
        throw new Error(`월아트 생성 실패: ${response.status}`);
      }

      const data = await response.json();

      if (!data.wallartId) {
        throw new Error("응답에 wallartId가 없습니다.");
      }

      localStorage.setItem("wallartId", String(data.wallartId));
      navigate("/wall-art", {
        state: { wallartId: data.wallartId },
      });
    } catch (error) {
      console.error("월아트 생성 중 오류:", error);
      alert(error.message || "월아트 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="ScreenSharing-page">
      <header className="ScreenSharing-header">
        <BackBtn />
      </header>
      <main className="ScreenSharing-main">
        <div className="ScreenSharing-content">
          <p>
            제작하신 이미지는 MCM 매장 아트월에 약 2분 동안 공유됩니다. 이에
            동의하십니까?
          </p>
          <p className="ScreenSharing-subtext">
            *아트월 이미지는 고객님이 입력하신 정보를 바탕으로 생성됩니다.
          </p>
        </div>
        <div className="ScreenSharing-btn-group">
          <button
            type="button"
            className="ScreenSharing-close-btn"
            onClick={() => navigate("/qr")}
          >
            아니오
          </button>
          <button
            type="button"
            className="ScreenSharing-confirm-btn"
            onClick={handleAgree}
            disabled={isCreating}
          >
            {isCreating ? "생성 중..." : "예"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default ScreenSharing;
