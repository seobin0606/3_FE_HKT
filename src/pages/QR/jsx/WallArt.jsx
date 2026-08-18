import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";

import "../css/WallArt.css";
import BackBtn from "../../../components/jsx/BackBtn";
import backgroundExample from "../../../assets/images/background_example.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function WallArt() {
  const navigate = useNavigate();
  const location = useLocation();

  // 캡처할 영역 지정 (이미지 저장용)
  const captureRef = useRef(null);

  // 기본 문구 및 수정 여부 상태
  const [displayText, setDisplayText] = useState("A Story Worth Carrying.");
  const [artLayout, setArtLayout] = useState({
    x: 34,
    y: 140,
    width: 320,
    height: 120,
  });
  const [artStyle, setArtStyle] = useState({
    fontFamily: '"Libre Caslon Text", serif',
    fontWeight: 400,
    fontSize: 36,
  });
  const [bgPositionX, setBgPositionX] = useState(
    location.state?.bgPositionX ?? 50,
  );
  const [isEdited, setIsEdited] = useState(false);

  // 💡 알림 메시지 상태 관리 (공유 알림 / 저장 알림)
  const [shareAlert, setShareAlert] = useState(false);
  const [saveAlert, setSaveAlert] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    location.state?.backgroundImage ||
      location.state?.backgroundImageUrl ||
      location.state?.imageUrl ||
      backgroundExample,
  );

  useEffect(() => {
    const fetchWallArt = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/wall-art`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("월아트 조회 실패:", response.status, errorText);
          return;
        }

        const data = await response.json();

        if (data.wallartId) {
          localStorage.setItem("wallartId", String(data.wallartId));
        }

        if (data.wallartText) {
          setDisplayText(data.wallartText);
        }

        if (data.wallartImg) {
          const imageUrl = data.wallartImg.startsWith("http")
            ? data.wallartImg
            : `${API_BASE_URL}/${data.wallartImg.replace(/^\/+/, "")}`;
          setBackgroundImage(imageUrl);
        }
      } catch (error) {
        console.error("월아트 조회 중 오류:", error);
      }
    };

    fetchWallArt();
  }, []);

  useEffect(() => {
    if (location.state?.updatedText) {
      setDisplayText(location.state.updatedText);
      setIsEdited(true);
    }

    if (location.state?.artLayout) {
      setArtLayout(location.state.artLayout);
    }

    if (location.state?.artStyle) {
      setArtStyle(location.state.artStyle);
    }

    const nextBackgroundImage =
      location.state?.backgroundImage ||
      location.state?.backgroundImageUrl ||
      location.state?.imageUrl ||
      backgroundExample;

    if (nextBackgroundImage) {
      setBackgroundImage(nextBackgroundImage);
    }

    if (location.state?.bgPositionX !== undefined) {
      setBgPositionX(location.state.bgPositionX);
    }
  }, [location.state]);

  const handleOpenEditor = () => {
    navigate("/wall-art/edit", {
      state: {
        artText: displayText,
        artLayout,
        artStyle,
        backgroundImage,
        bgPositionX,
      },
    });
  };

  // 📸 [이미지로 저장] 기능
  const handleSaveImage = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: null,
        // 캡처 시 화면 구도는 유지하되 UI 요소만 감춤
        onclone: (clonedDoc) => {
          const header = clonedDoc.querySelector(".WallArt-header");
          const btnGroup = clonedDoc.querySelector(".WallArt-btn-group");
          const alerts = clonedDoc.querySelectorAll(".image-alert-text");

          if (header) header.style.visibility = "hidden";
          if (btnGroup) btnGroup.style.visibility = "hidden";
          // 알림 텍스트들도 캡처에서 완전히 제외
          alerts.forEach((alert) => (alert.style.visibility = "hidden"));
        },
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "wall-art.png";
      link.click();

      // 저장 성공 알림 띄우기 (2.5초)
      triggerSaveAlert();
    } catch (error) {
      console.error("이미지 저장 실패:", error);
    }
  };

  // 🔗 [공유하기] 기능
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Wall Art",
          text: displayText,
          url: window.location.href,
        });
        triggerShareAlert();
      } else {
        await navigator.clipboard.writeText(window.location.href);
        triggerShareAlert();
      }
    } catch (error) {
      console.log("공유 취소 또는 실패", error);
    }
  };

  // ⏱️ 공유 알림 타이머 (2.5초)
  const triggerShareAlert = () => {
    setShareAlert(true);
    setTimeout(() => {
      setShareAlert(false);
    }, 2500);
  };

  // ⏱️ 저장 알림 타이머 (2.5초)
  const triggerSaveAlert = () => {
    setSaveAlert(true);
    setTimeout(() => {
      setSaveAlert(false);
    }, 2500);
  };

  return (
    <div
      className="WallArt-page"
      ref={captureRef}
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: `${bgPositionX}% center`,
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <header className="WallArt-header">
        <BackBtn />
      </header>

      <main className="WallArt-main">
        {/* 캡처할 콘텐츠 영역 */}
        <div className="WallArt-content">
          <div
            className="WallArt-content-text"
            style={{
              position: "absolute",
              left: `${artLayout.x}px`,
              top: `${artLayout.y}px`,
              width: `${artLayout.width}px`,
              height: `${artLayout.height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "left",
              wordBreak: "break-word",
              whiteSpace: "normal",
              fontFamily: artStyle.fontFamily,
              fontWeight: artStyle.fontWeight,
              fontSize: `${artStyle.fontSize}px`,
            }}
          >
            <p>“{displayText}”</p>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="WallArt-btn-group">
          {isEdited ? (
            /* 1. 수정 후: [이미지 저장], [공유하기] 버튼 */
            <div className="archiving-btn-wrapper">
              {/* 토스트 알림 메시지 영역 */}
              {saveAlert && (
                <div className="image-alert-text">
                  <p>저장이 완료되었습니다.</p>
                </div>
              )}
              {shareAlert && (
                <div className="share-alert-text">
                  <p>링크가 복사되었습니다!</p>
                </div>
              )}
              <button
                type="button"
                className="WallArt-edit-btn white-btn"
                onClick={handleSaveImage}
              >
                이미지 저장
              </button>
              <button
                type="button"
                className="WallArt-edit-btn share-btn brown-btn"
                onClick={handleShare}
              >
                공유하기
              </button>
            </div>
          ) : (
            /* 2. 처음 진입 시: [수정하기] 버튼 */
            <button
              type="button"
              className="WallArt-edit-btn yellow-btn"
              onClick={handleOpenEditor}
            >
              수정하기
            </button>
          )}

          {/* 백엔드 연결시 삭제!! */}
          <button type="button" onClick={() => navigate("/wall-art/end")}>
            임시 종료
          </button>
        </div>
      </main>
    </div>
  );
}

export default WallArt;
