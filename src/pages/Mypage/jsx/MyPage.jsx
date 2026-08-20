import { useEffect, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../css/MyPage.css";

import BottomNav from "../../../components/jsx/BottomNav";

import starIcon from "../../../assets/images/star.svg";
import visitIcon from "../../../assets/images/visit_icon.svg";
import airplaneWhite from "../../../assets/images/airplane_white.svg";
import profileIcon from "../../../assets/images/profile.svg";
import shareIcon from "../../../assets/images/share.svg";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


/* =========================
   LOCAL STORAGE
========================= */

const VISIT_CARD_STORAGE_KEY =
  "wtw-visit-card";


const getSavedVisitCardData = () => {
  try {
    const savedData =
      localStorage.getItem(
        VISIT_CARD_STORAGE_KEY
      );

    return savedData
      ? JSON.parse(savedData)
      : null;

  } catch {
    return null;
  }
};


/* =========================
   방문 날짜 포맷

   2026-06-15T14:30:00
   ↓
   2026.06.15
========================= */

const formatVisitDate = (visitTime) => {
  if (!visitTime) {
    return "-";
  }

  const date =
    new Date(visitTime);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}.${month}.${day}`;
};


/* =========================
   방문 시간 포맷

   2026-06-15T14:30:00
   ↓
   14:30
========================= */

const formatVisitTime = (visitTime) => {
  if (!visitTime) {
    return null;
  }

  const date =
    new Date(visitTime);

  const hour =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${hour}:${minute}`;
};


function MyPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* =========================
     API STATE
  ========================= */

  const [
    userName,
    setUserName,
  ] = useState("");


  const [
    styleBoard,
    setStyleBoard,
  ] = useState([]);


  const [
    stores,
    setStores,
  ] = useState([]);


  const [
    wishlistItems,
    setWishlistItems,
  ] = useState([]);


  /* =========================
     Visit Card 상세
  ========================= */

  const [
    visitCardDetail,
    setVisitCardDetail,
  ] = useState(null);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    apiError,
    setApiError,
  ] = useState("");


  /* =========================
     VISIT CARD DATA
     기존 localStorage 데이터
  ========================= */

  const visitCardData =
    location.state?.visitCardData ??
    getSavedVisitCardData() ??
    {};


  /* =========================
     VISIT CARD ID

     1. 페이지 state
     2. localStorage

     순서대로 확인
  ========================= */

  const visitCardId =
    location.state?.visitCardId ??
    localStorage.getItem(
      "visitCardId"
    );


  /* =========================
     API
     
     GET /api/users/me
     GET /api/stores
     GET /api/users/wishlist
     GET /api/visitcards/{visitCardId}
  ========================= */

  useEffect(() => {
    const fetchMyPageData =
      async () => {

        try {
          setIsLoading(true);
          setApiError("");


          /* =========================
             ACCESS TOKEN
          ========================= */

          const accessToken =
            localStorage.getItem(
              "accessToken"
            );


          const headers = {
            "Content-Type":
              "application/json",

            ...(accessToken && {
              Authorization:
                `Bearer ${accessToken}`,
            }),
          };


          /* =========================
             기본 API 동시 호출
          ========================= */

          const [
            myPageResponse,
            storesResponse,
            wishlistResponse,
          ] =
            await Promise.all([

              fetch(
                `${API_BASE_URL}/api/users/me`,
                {
                  method: "GET",
                  headers,
                }
              ),

              fetch(
                `${API_BASE_URL}/api/stores`,
                {
                  method: "GET",
                  headers,
                }
              ),

              fetch(
                `${API_BASE_URL}/api/users/wishlist`,
                {
                  method: "GET",
                  headers,
                }
              ),

            ]);


          /* =========================
             MY PAGE 오류
          ========================= */

          if (!myPageResponse.ok) {
            const errorText =
              await myPageResponse.text();

            console.error(
              "마이페이지 API 오류:",
              myPageResponse.status,
              errorText
            );

            throw new Error(
              `마이페이지 조회 실패: ${myPageResponse.status}`
            );
          }


          /* =========================
             STORE 오류
          ========================= */

          if (!storesResponse.ok) {
            const errorText =
              await storesResponse.text();

            console.error(
              "매장 API 오류:",
              storesResponse.status,
              errorText
            );

            throw new Error(
              `매장 조회 실패: ${storesResponse.status}`
            );
          }


          /* =========================
             WISHLIST 오류
          ========================= */

          if (!wishlistResponse.ok) {
            const errorText =
              await wishlistResponse.text();

            console.error(
              "위시리스트 API 오류:",
              wishlistResponse.status,
              errorText
            );

            throw new Error(
              `위시리스트 조회 실패: ${wishlistResponse.status}`
            );
          }


          /* =========================
             JSON 변환
          ========================= */

          const myPageData =
            await myPageResponse.json();

          const storesData =
            await storesResponse.json();

          const wishlistData =
            await wishlistResponse.json();


          console.log(
            "마이페이지 API 응답:",
            myPageData
          );

          console.log(
            "매장 API 응답:",
            storesData
          );

          console.log(
            "위시리스트 API 응답:",
            wishlistData
          );


          /* =========================
             USER
          ========================= */

          setUserName(
            myPageData.userName ||
            ""
          );


          /* =========================
             STYLE BOARD
          ========================= */

          setStyleBoard(
            Array.isArray(
              myPageData.styleBoard
            )
              ? myPageData.styleBoard
              : []
          );


          /* =========================
             STORES
          ========================= */

          setStores(
            Array.isArray(
              storesData
            )
              ? storesData
              : []
          );


          /* =========================
             WISHLIST
          ========================= */

          setWishlistItems(
            Array.isArray(
              wishlistData.productList
            )
              ? wishlistData.productList
              : []
          );


          /* =========================
             VISIT CARD 상세 조회

             GET
             /api/visitcards/{visitCardId}
          ========================= */

          if (visitCardId) {

            const visitCardResponse =
              await fetch(
                `${API_BASE_URL}/api/visitcards/${visitCardId}`,
                {
                  method: "GET",
                  headers,
                }
              );


            if (!visitCardResponse.ok) {
              const errorText =
                await visitCardResponse.text();

              console.error(
                "Visit Card 상세 조회 실패:",
                visitCardResponse.status,
                errorText
              );

            } else {

              const visitCardDetailData =
                await visitCardResponse.json();


              console.log(
                "Visit Card 상세 API 응답:",
                visitCardDetailData
              );


              setVisitCardDetail(
                visitCardDetailData
              );


              /*
                새로고침 이후에도
                VisitCard ID 유지
              */

              if (
                visitCardDetailData
                  .visitCardId
              ) {

                localStorage.setItem(
                  "visitCardId",
                  String(
                    visitCardDetailData
                      .visitCardId
                  )
                );
              }
            }
          }


        } catch (error) {

          console.error(
            "MyPage API 오류:",
            error
          );


          

        } finally {

          setIsLoading(false);

        }
      };


    fetchMyPageData();

  }, [visitCardId]);


  /* =========================
     STYLE BOARD
  ========================= */

  const latestStyleBoard =
    styleBoard.length > 0
      ? styleBoard[0]
      : null;


  /* =========================
     STORE ID
  ========================= */

  const storeId =
    latestStyleBoard?.storeId;


  /* =========================
     STORE NAME
  ========================= */

  const matchedStore =
    stores.find(
      (store) =>
        Number(
          store.storeId
        ) ===
        Number(
          storeId
        )
    );


  /*
    우선순위

    1. Visit Card 상세 API의 storeName
    2. styleBoard storeId로 찾은 매장명
    3. localStorage
    4. 기본값
  */

  const selectedStore =
    visitCardDetail?.storeName ||
    matchedStore?.storeName ||
    visitCardData.store ||
    "MCM Cheongdam";


  /* =========================
     방문 날짜

     Visit Card 상세 API의
     visitTime 사용
  ========================= */

  const visitDate =
    visitCardDetail?.visitTime
      ? formatVisitDate(
          visitCardDetail.visitTime
        )
      : visitCardData.visitDate ||
        "-";


  /* =========================
     BOARDING TIME

     1. styleBoard enterTime
     2. Visit Card visitTime
     3. localStorage
  ========================= */

  const boardingTime =
    latestStyleBoard?.enterTime ||
    formatVisitTime(
      visitCardDetail?.visitTime
    ) ||
    visitCardData.visitTime ||
    "15:00";


  /* =========================
     SNS 공유
  ========================= */

  const handleShare = async () => {

    const shareUrl =
      window.location.href;


    const shareData = {
      title:
        "MCM Style Storyboard",

      text:
        `${
          userName
            ? `${userName}님의`
            : "나의"
        } MCM Style Storyboard를 확인해보세요.`,

      url:
        shareUrl,
    };


    try {

      /* =========================
         모바일 / 지원 브라우저
      ========================= */

      if (navigator.share) {

        await navigator.share(
          shareData
        );

        console.log(
          "공유 성공"
        );

        return;
      }


      /* =========================
         navigator.share 미지원
         → 링크 복사
      ========================= */

      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator.clipboard.writeText(
          shareUrl
        );

        alert(
          "공유 링크가 복사되었습니다."
        );

        return;
      }


      /* =========================
         Clipboard API 미지원
      ========================= */

      const textArea =
        document.createElement(
          "textarea"
        );


      textArea.value =
        shareUrl;


      textArea.style.position =
        "fixed";


      textArea.style.opacity =
        "0";


      document.body.appendChild(
        textArea
      );


      textArea.focus();
      textArea.select();


      document.execCommand(
        "copy"
      );


      document.body.removeChild(
        textArea
      );


      alert(
        "공유 링크가 복사되었습니다."
      );


    } catch (error) {

      if (
        error.name ===
        "AbortError"
      ) {
        return;
      }


      console.error(
        "SNS 공유 오류:",
        error
      );


      alert(
        "공유에 실패했습니다."
      );
    }
  };


  return (
    <div className="mypage-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="mypage-header">

        <button
          type="button"
          className="mypage-back"
          onClick={() =>
            navigate("/")
          }
          aria-label="홈으로 이동"
        >

          <ChevronLeft
            size={26}
            strokeWidth={1.7}
          />

        </button>

      </header>


      <main className="mypage-main">


        {/* =========================
            PASSPORT
        ========================= */}

        <section className="mypage-passport-card">

          <p className="mypage-passport-label">
            My passport
          </p>


          <button
            type="button"
            className="mypage-more-button mypage-passport-edit"
            onClick={() =>
              navigate(
                "/visit-card/reset"
              )
            }
            aria-label="프로필 편집 페이지로 이동"
          >

            Edit


            <ChevronRight
              size={14}
              strokeWidth={1.5}
            />

          </button>


          <div className="mypage-passport-user">

            <img
              src={profileIcon}
              alt=""
              className="mypage-passport-user-icon"
            />


            <span className="mypage-username">

              {isLoading
                ? "불러오는 중..."
                : userName
                  ? `${userName} 고객님`
                  : "고객님"}

            </span>

          </div>

        </section>


        {/* =========================
            API ERROR
        ========================= */}

        {apiError && (

          <p className="mypage-api-error">
            {apiError}
          </p>

        )}


        <div className="mypage-divider" />


        {/* =========================
            STORYBOARD
        ========================= */}

        <section className="mypage-storyboard">

          <div className="mypage-storyboard-title">
            MCM Style Storyboard
          </div>


          <div className="mypage-ticket">

            <div className="mypage-ticket-top">

              <div>

                <p className="mypage-ticket-name">

                  {isLoading
                    ? "..."
                    : userName
                      ? `${userName} 고객님`
                      : "고객님"}

                </p>


                {/* =========================
                    방문 날짜
                    API visitTime 사용
                ========================= */}

                <p className="mypage-ticket-date">

                  {isLoading
                    ? "----.--.--"
                    : visitDate}

                </p>

              </div>


              <img
                src={visitIcon}
                alt=""
                className="mypage-ticket-visit-icon"
              />

            </div>


            <div className="mypage-ticket-line" />


            {/* =========================
                STORE NAME
            ========================= */}

            <h3 className="mypage-ticket-store">

              {isLoading
                ? "매장 정보를 불러오는 중..."
                : selectedStore}

            </h3>


            {/* =========================
                BOARDING TIME
            ========================= */}

            <div className="mypage-ticket-info">

              <div>

                <span>
                  Boarding Time
                </span>


                <strong>

                  {isLoading
                    ? "--:--"
                    : boardingTime}

                </strong>

              </div>

            </div>

          </div>


          {/* =========================
              LIFE → MCM
          ========================= */}

          <div className="mypage-life-card">

            <span className="mypage-life-label">
              Life
            </span>


            <div className="mypage-life-route">

              <span className="mypage-life-dot" />


              <span className="mypage-life-route-line left-line" />


              <img
                src={airplaneWhite}
                alt=""
                className="mypage-life-plane"
              />


              <span className="mypage-life-route-line right-line" />


              <span className="mypage-life-dot" />

            </div>


            <span className="mypage-life-label">
              MCM
            </span>

          </div>

        </section>


        {/* =========================
            SNS SHARE
        ========================= */}

        <button
          type="button"
          className="mypage-share-button"
          onClick={handleShare}
        >

          <span>
            SNS 공유하기
          </span>


          <img
            src={shareIcon}
            alt=""
            className="mypage-share-icon"
          />

        </button>


        <div className="mypage-divider mypage-divider-small" />


        {/* =========================
            WISHLIST
        ========================= */}

        <section className="mypage-wishlist-section">

          <div className="mypage-section-header">

            <h2>
              위시리스트
            </h2>


            <button
              type="button"
              className="mypage-more-button"
              onClick={() =>
                navigate(
                  "/mypage/wishlist"
                )
              }
            >

              더보기


              <ChevronRight
                size={13}
                strokeWidth={1.6}
              />

            </button>

          </div>


          <div className="mypage-wishlist-list">

            {isLoading ? (

              <p className="mypage-wishlist-loading">
                불러오는 중...
              </p>

            ) : wishlistItems.length ===
              0 ? (

              <p className="mypage-wishlist-empty">
                위시리스트가 없습니다.
              </p>

            ) : (

              wishlistItems
                .slice(0, 2)
                .map(
                  (item) => (

                    <div
                      className="mypage-wishlist-card"
                      key={
                        item.productId
                      }
                    >

                      <Tag
                        size={29}
                        strokeWidth={1.6}
                        className="mypage-wishlist-tag"
                      />


                      <span className="mypage-wishlist-name">
                        {item.productName}
                      </span>


                      <img
                        src={starIcon}
                        alt=""
                        className="mypage-wishlist-star"
                      />

                    </div>

                  )
                )

            )}

          </div>

        </section>


        {/* =========================
            MCM HOMEPAGE
        ========================= */}

        <button
          type="button"
          className="mypage-homepage-link"
          onClick={() => {
            window.location.href =
              "https://kr.mcmworldwide.com/";
          }}
        >
          MCM 홈페이지 가기
        </button>


        <div className="mypage-divider mypage-divider-small" />


        {/* =========================
            TRAVELER
        ========================= */}

        <button
          type="button"
          className="mypage-traveler-button"
          onClick={() =>
            navigate(
              "/mypage/traveler-guide"
            )
          }
        >

          <span>
            여행객이신가요?
          </span>


          <ChevronRight
            size={22}
            strokeWidth={1.5}
          />

        </button>

      </main>


      <BottomNav />

    </div>
  );
}


export default MyPage;
