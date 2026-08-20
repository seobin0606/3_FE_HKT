import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import airplaneIcon from "../../../assets/images/airplane_black.svg";
import backIcon from "../../../assets/images/backBtn_brown.svg";
import visitStamp from "../../../assets/images/visit_icon_AI.svg";

import "../css/StaffVisitDetail.css";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


/* =========================
   방문 날짜 포맷

   2026-08-16T14:30:00
   ↓
   2026.08.16
========================= */

function formatVisitDate(
  visitTime
) {
  if (!visitTime) {
    return "-";
  }

  const datePart =
    visitTime.split("T")[0];

  if (!datePart) {
    return "-";
  }

  return datePart.replace(
    /-/g,
    "."
  );
}


/* =========================
   방문 시간 포맷

   2026-08-16T14:30:00
   ↓
   14:30
========================= */

function formatVisitTime(
  visitTime
) {
  if (!visitTime) {
    return "-";
  }

  const timePart =
    visitTime.split("T")[1];

  if (!timePart) {
    return "-";
  }

  return timePart.slice(
    0,
    5
  );
}


function StaffVisitDetail() {
  /* =========================
     URL PARAM

     /staff/visits/44
     ↓
     visitCardId = 44
  ========================= */

  const {
    visitCardId,
  } = useParams();


  /* =========================
     STATE
  ========================= */

  const [
    visitData,
    setVisitData,
  ] = useState(null);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /* =========================
     방문 고객 상세 조회

     GET
     /api/staff/visits/{visitCardId}
  ========================= */

  useEffect(() => {
    const fetchVisitDetail =
      async () => {

        try {
          setIsLoading(true);
          setErrorMessage("");


          /* =========================
             ACCESS TOKEN
          ========================= */

          const accessToken =
            localStorage.getItem(
              "accessToken"
            );


          console.log(
            "방문 고객 상세 조회 ID:",
            visitCardId
          );


          /* =========================
             API REQUEST
          ========================= */

          const response =
            await fetch(
              `${API_BASE_URL}/api/staff/visits/${visitCardId}`,
              {
                method: "GET",

                headers: {
                  "Content-Type":
                    "application/json",

                  ...(accessToken && {
                    Authorization:
                      `Bearer ${accessToken}`,
                  }),
                },
              }
            );


          /* =========================
             API ERROR
          ========================= */

          if (!response.ok) {
            const errorText =
              await response.text();


            console.error(
              "방문 고객 상세 API 실패:",
              response.status,
              errorText
            );


            throw new Error(
              `방문 고객 상세 조회 실패 (${response.status})`
            );
          }


          /* =========================
             API RESPONSE
          ========================= */

          const data =
            await response.json();


          console.log(
            "방문 고객 상세 API 응답:",
            data
          );


          setVisitData(
            data
          );


        } catch (error) {

          console.error(
            "방문 고객 상세 조회 오류:",
            error
          );


          setVisitData(null);


          setErrorMessage(
            "방문 고객 정보를 불러오지 못했습니다."
          );


        } finally {

          setIsLoading(false);

        }
      };


    if (visitCardId) {
      fetchVisitDetail();
    }

  }, [visitCardId]);


  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <main className="staff-visit-detail-page">

        <Link
          className="staff-detail-back"
          to="/staff/visits"
          aria-label="방문 고객 목록으로"
        >
          <img
            src={backIcon}
            alt=""
          />
        </Link>


        <p className="staff-detail-message">
          방문 고객 정보를 불러오는 중입니다.
        </p>

      </main>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (
    errorMessage ||
    !visitData
  ) {
    return (
      <main className="staff-visit-detail-page">

        <Link
          className="staff-detail-back"
          to="/staff/visits"
          aria-label="방문 고객 목록으로"
        >
          <img
            src={backIcon}
            alt=""
          />
        </Link>


        <p className="staff-detail-message">
          {errorMessage ||
            "방문 고객 정보를 불러오지 못했습니다."}
        </p>

      </main>
    );
  }


  /* =========================
     API DATA
  ========================= */

  const {
    aiMood,
    findProductCategory,
    gender,
    moodCategory,
    purposeText,
    recommendedRoute,
    staffGuidance,
    startRecommendedProducts,
    storeName,
    userId,
    userName,
    visitTime,
  } = visitData;


  /* =========================
     방문 정보
  ========================= */

  const visitDetails = [
    {
      label: "방문 매장",
      value:
        storeName ||
        "-",
    },

    {
      label: "방문 목적",
      value:
        purposeText ||
        "-",
    },

    {
      label: "오늘의 무드",
      value:
        moodCategory ||
        "-",
    },

    {
      label: "원하는 제품",
      value:
        findProductCategory ||
        "-",
    },

    {
      label: "성별",
      value:
        gender ||
        "-",
    },

    {
      label: "방문 시간",
      value:
        formatVisitTime(
          visitTime
        ),
    },
  ];


  const visitDate =
    formatVisitDate(
      visitTime
    );


  return (
    <main className="staff-visit-detail-page">


      {/* =========================
          BACK BUTTON
      ========================= */}

      <Link
        className="staff-detail-back"
        to="/staff/visits"
        aria-label="방문 고객 목록으로"
      >
        <img
          src={backIcon}
          alt=""
        />
      </Link>


      {/* =========================
          TITLE
      ========================= */}

      <h1 className="staff-detail-title">

        {userName
          ? `${userName}님의 Visit Card`
          : "고객님의 Visit Card"}

      </h1>


      {/* =========================
          VISIT CARD
      ========================= */}

      <article className="staff-visit-card">


        {/* =========================
            CARD HEADER
        ========================= */}

        <header className="staff-visit-card-header">

          <div>

            <h2>
              MCM Visit Card
            </h2>


            <p>
              Date. {visitDate}
            </p>

          </div>


          <img
            className="staff-visit-stamp"
            src={visitStamp}
            alt="AI 분석 완료"
          />

        </header>


        {/* =========================
            VISIT INFORMATION
        ========================= */}

        <dl className="staff-visit-information">

          {visitDetails.map(
            ({
              label,
              value,
            }) => (

              <div
                className="staff-visit-information-row"
                key={label}
              >

                <dt>
                  {label}
                </dt>


                <dd>
                  {value}
                </dd>

              </div>

            )
          )}

        </dl>


        {/* =========================
            LIFE → MCM
        ========================= */}

        <div
          className="staff-visit-route-line"
          aria-label="Life에서 MCM으로 향하는 여정"
        >

          <span>
            Life
          </span>


          <i />


          <img
            src={airplaneIcon}
            alt=""
          />


          <i />


          <span>
            MCM
          </span>

        </div>

      </article>


      {/* =========================
          AI SUMMARY
      ========================= */}

      <p className="staff-ai-summary">

        AI가 분석한 오늘의 여행


        <strong>

          {aiMood ||
            "AI 분석 정보가 없습니다."}

        </strong>

      </p>


      {/* =========================
          추천 동선
      ========================= */}

      {Array.isArray(
        recommendedRoute
      ) &&
        recommendedRoute.length >
          0 && (

          <section className="staff-detail-route-preview">

            <h2>
              추천 동선
            </h2>


            <div className="staff-detail-route-list">

              {recommendedRoute.map(
                (
                  route,
                  index
                ) => (

                  <span
                    className="staff-detail-route-item"
                    key={`${route}-${index}`}
                  >

                    {route}


                    {index <
                      recommendedRoute.length -
                        1 && (

                      <strong>
                        →
                      </strong>

                    )}

                  </span>

                )
              )}

            </div>

          </section>

        )}


      {/* =========================
          직원 응대 가이드
      ========================= */}

      {staffGuidance && (

        <section className="staff-guidance-section">

          <h2>
            직원 응대 가이드
          </h2>


          <p>
            {staffGuidance}
          </p>

        </section>

      )}


      {/* =========================
          추천 상품
      ========================= */}

      {Array.isArray(
        startRecommendedProducts
      ) &&
        startRecommendedProducts.length >
          0 && (

          <section className="staff-recommended-products">

            <h2>
              추천 상품
            </h2>


            <div className="staff-recommended-product-list">

              {startRecommendedProducts.map(
                (product) => (

                  <article
                    className="staff-recommended-product-card"
                    key={
                      product.productId
                    }
                  >

                    {/* =========================
                        상품 이미지
                    ========================= */}

                    {product.productImg && (

                      <img
                        src={
                          product.productImg
                        }
                        alt={
                          product.productName
                        }
                        className="staff-recommended-product-image"
                      />

                    )}


                    {/* =========================
                        상품 정보
                    ========================= */}

                    <div className="staff-recommended-product-info">

                      <strong>
                        {product.productName}
                      </strong>


                      <span>
                        {product.zone}
                      </span>


                      <p>
                        {product.productDetail}
                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          </section>

        )}


      {/* =========================
          추천 동선 상세 이동
      ========================= */}

      <Link
        className="staff-route-button"
        to={
          `/staff/visits/${visitCardId}/route`
        }
        state={{
          visitCardId:
            Number(
              visitCardId
            ),

          userId,

          userName,

          storeName,

          visitTime,

          recommendedRoute,

          staffGuidance,

          startRecommendedProducts,

          aiMood,
        }}
      >

        추천 동선 보러가기

      </Link>


    </main>
  );
}


export default StaffVisitDetail;