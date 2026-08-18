import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../css/WallArtTextEdit.css";
import BackBtn from "../../../components/jsx/BackBtn";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function WallArtTextEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 상태 관리 (하드코딩 대신 백엔드에서 받아올 배열)
  const [recommendations, setRecommendations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();
  const [isLoading, setIsLoading] = useState(true); // 추천 목록 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("accessToken");

  // 2. [GET] 페이지가 열릴 때 AI 추천 문구 목록 5개 불러오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) {
        alert("로그인이 필요합니다.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/wall-art/text-recommendation`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`목록 조회 실패: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data.textList)) {
          throw new Error("응답에 textList 배열이 없습니다.");
        }

        setRecommendations(data.textList);
      } catch (error) {
        console.error("추천 문구 조회 에러:", error);
        alert("추천 문구를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [token]);

  // 문구 선택 클릭
  const handleSelect = (index) => {
    setSelectedIndex(index);
  };

  // 선택한 문구를 백엔드에 저장
  const handleComplete = async () => {
    if (selectedIndex === undefined || !recommendations[selectedIndex]) {
      alert("문구를 선택해주세요.");
      return;
    }

    const selectedText = recommendations[selectedIndex];

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/wall-art`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: selectedText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("월아트 문구 수정 실패:", response.status, errorText);
        throw new Error(`월아트 문구 수정 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("월아트 문구 수정 완료:", data.message);

      const returnTo = location.state?.returnTo || "/wall-art";

      navigate(returnTo, {
        state: {
          ...(location.state || {}),
          updatedText: selectedText,
          artText: selectedText,
          artLayout: location.state?.artLayout,
          artStyle: location.state?.artStyle,
          backgroundImage: location.state?.backgroundImage,
          bgPositionX: location.state?.bgPositionX,
          wallartId: location.state?.wallartId,
        },
      });
    } catch (error) {
      console.error("월아트 문구 수정 중 오류:", error);
      alert(error.message || "월아트 문구 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="WallArtTextEdit-page">
      <header className="WallArtTextEdit-header">
        <BackBtn />
      </header>

      <main className="WallArtTextEdit-main">
        <div className="WallArtTextEdit-title">
          <p>
            지금 무드에 맞는 문구를 다시
            <br /> 선택해보세요.
          </p>
        </div>

        {/* 로딩 중 및 추천 문구 목록 영역 */}
        <div className="WallArtTextEdit-list">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              AI 추천 문구를 불러오는 중입니다...
            </div>
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              추천 문구가 없습니다.
            </div>
          ) : (
            recommendations.map((text, index) => (
              <button
                key={index}
                type="button"
                className={`WallArtTextEdit-option ${
                  selectedIndex === index ? "selected" : ""
                }`}
                onClick={() => handleSelect(index)}
              >
                {text}
              </button>
            ))
          )}
        </div>

        {/* 하단 변경 완료 버튼 */}
        <div className="WallArtTextEdit-btn-group">
          <button
            type="button"
            className="WallArtTextEdit-submit-btn"
            onClick={handleComplete}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? "변경 중..." : "변경 완료"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default WallArtTextEdit;
