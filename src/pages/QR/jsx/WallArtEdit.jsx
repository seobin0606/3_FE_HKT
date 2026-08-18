import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Rnd } from "react-rnd";

import "../css/WallArtEdit.css";
import BackBtn from "../../../components/jsx/BackBtn";
import backgroundExample from "../../../assets/images/background_example.png";

const defaultLayout = {
  x: 34,
  y: 110,
  width: 320,
  height: 120,
};

const defaultStyle = {
  fontFamily: '"Libre Caslon Text", serif',
  fontWeight: 400,
  fontSize: 32,
};

function WallArtEdit() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};

  const [artText, setArtText] = useState(
    state.artText || "A Story Worth Carrying.",
  );
  const [artLayout, setArtLayout] = useState(state.artLayout || defaultLayout);
  const [artStyle, setArtStyle] = useState(state.artStyle || defaultStyle);
  const [backgroundImage, setBackgroundImage] = useState(
    state.backgroundImage ||
      state.backgroundImageUrl ||
      state.imageUrl ||
      backgroundExample,
  );
  const [selected, setSelected] = useState(true);

  // 💡 배경 가로 드래그를 위한 상태 및 Ref
  const [bgPositionX, setBgPositionX] = useState(state.bgPositionX || 50); // % 단위
  const isDraggingBg = useRef(false);
  const startX = useRef(0);
  const startBgX = useRef(50);

  useEffect(() => {
    if (state.artText) setArtText(state.artText);
    if (state.artLayout) setArtLayout(state.artLayout);
    if (state.artStyle) setArtStyle(state.artStyle);

    const nextBg =
      state.backgroundImage || state.backgroundImageUrl || state.imageUrl;

    if (nextBg) setBackgroundImage(nextBg);
    if (state.bgPositionX !== undefined) setBgPositionX(state.bgPositionX);
  }, [
    state.artText,
    state.artLayout,
    state.artStyle,
    state.backgroundImage,
    state.backgroundImageUrl,
    state.imageUrl,
    state.bgPositionX,
  ]);

  // 💡 배경 가로 드래그 마우스/터치 이벤트 핸들러
  const handleMouseDown = (e) => {
    setSelected(false);
    isDraggingBg.current = true;
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startBgX.current = bgPositionX;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingBg.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = currentX - startX.current;

    // 감도 조절 (픽셀 이동량을 %로 변환, 민감하면 0.1을 조절하세요)
    let newBgX = startBgX.current - deltaX * 0.1;
    newBgX = Math.max(0, Math.min(100, newBgX)); // 0% ~ 100% 범위 제한

    setBgPositionX(newBgX);
  };

  const handleMouseUp = () => {
    isDraggingBg.current = false;
  };

  const handleTextEdit = () => {
    navigate("/wall-art/edit/text", {
      state: {
        returnTo: "/wall-art/edit",
        artText,
        artLayout,
        artStyle,
        backgroundImage,
        bgPositionX,
      },
    });
  };

  const handleSave = () => {
    navigate("/wall-art", {
      state: {
        updatedText: artText,
        artLayout,
        artStyle,
        backgroundImage,
        bgPositionX,
      },
    });
  };

  return (
    <div
      className="WallArtEdit-page"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      style={
        backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: `${bgPositionX}% center`, // 💡 가로 위치 반영
              backgroundRepeat: "no-repeat",
              cursor: "grab",
            }
          : undefined
      }
    >
      <header className="WallArtEdit-header">
        <BackBtn />
      </header>

      <main className="WallArtEdit-main">
        <Rnd
          bounds="parent"
          size={{ width: artLayout.width, height: artLayout.height }}
          position={{ x: artLayout.x, y: artLayout.y }}
          onMouseDown={(e) => {
            e.stopPropagation(); // 텍스트 클릭 시 배경 드래그 막기
            setSelected(true);
          }}
          onDragStart={(e) => {
            e.stopPropagation();
            setSelected(true);
          }}
          onResizeStart={(e) => {
            e.stopPropagation();
            setSelected(true);
          }}
          onDragStop={(event, data) => {
            setArtLayout((prev) => ({
              ...prev,
              x: data.x,
              y: data.y,
            }));
          }}
          onResizeStop={(event, direction, ref, delta, position) => {
            setArtLayout({
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            });
          }}
          minWidth={120}
          minHeight={60}
          enableResizing={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
          resizeHandleClasses={
            selected
              ? {
                  topLeft: "rnd-handle rnd-handle-tl",
                  topRight: "rnd-handle rnd-handle-tr",
                  bottomLeft: "rnd-handle rnd-handle-bl",
                  bottomRight: "rnd-handle rnd-handle-br",
                  top: "rnd-edge rnd-edge-t",
                  right: "rnd-edge rnd-edge-r",
                  bottom: "rnd-edge rnd-edge-b",
                  left: "rnd-edge rnd-edge-l",
                }
              : {}
          }
        >
          <div
            className={`WallArtEdit-text-box ${selected ? "is-selected" : ""}`}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              cursor: "move",
              userSelect: "none",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#ffffff",
                fontFamily: artStyle.fontFamily,
                fontWeight: artStyle.fontWeight,
                fontSize: `${artStyle.fontSize}px`,
                lineHeight: 1.2,
                wordBreak: "keep-all",
                userSelect: "none",
              }}
            >
              “{artText}”
            </p>
          </div>
        </Rnd>

        {/* 하단 버튼 영역 */}
        <div
          className="WallArtEdit-btn-group"
          onMouseDown={(e) => e.stopPropagation()} // 버튼 영역 클릭 시 배경 드래그 막기
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="WallArtEdit-save-btn white-btn"
            onClick={handleTextEdit}
          >
            문구 변경
          </button>

          <button
            type="button"
            className="WallArtEdit-save-btn primary-btn"
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </main>
    </div>
  );
}

export default WallArtEdit;
