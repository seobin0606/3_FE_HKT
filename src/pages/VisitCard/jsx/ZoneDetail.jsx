import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import BottomNav from "../../../components/jsx/BottomNav";

import visitIconAI from "../../../assets/images/visit_icon_AI.svg";
import backIcon from "../../../assets/images/backBtn_brown.svg";

import "../css/ZoneDetail.css";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


/* =========================
   HEADER
========================= */

const getHeaders = () => {
  const accessToken =
    localStorage.getItem(
      "accessToken"
    );

  return {
    "Content-Type":
      "application/json",

    ...(accessToken && {
      Authorization:
        `Bearer ${accessToken}`,
    }),
  };
};


function ZoneDetail() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* =========================
     VisitCardResult에서 전달받음
  ========================= */

  const visitCardId =
    location.state?.visitCardId ||
    localStorage.getItem(
      "visitCardId"
    );


  const zoneName =
    location.state?.zoneName;


  /* =========================
     STATE
  ========================= */

  const [
    recommendation,
    setRecommendation,
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
     ZONE 추천 조회

     GET
     /api/recommend/routes/{visitCardId}
  ========================= */

  useEffect(() => {

    const fetchZoneRecommendation =
      async () => {

        if (!visitCardId) {
          setErrorMessage(
            "Visit Card ID가 없습니다."
          );

          setIsLoading(false);

          return;
        }


        if (!zoneName) {
          setErrorMessage(
            "선택된 존 정보가 없습니다."
          );

          setIsLoading(false);

          return;
        }


        try {
          setIsLoading(true);

          setErrorMessage("");


          console.log(
            "선택된 존:",
            zoneName
          );


          const response =
            await fetch(
              `${API_BASE_URL}/api/recommend/routes/${visitCardId}`,
              {
                method: "GET",
                headers:
                  getHeaders(),
              }
            );


          if (!response.ok) {
            const errorText =
              await response.text();


            console.error(
              "존 추천 조회 실패:",
              response.status,
              errorText
            );


            throw new Error(
              `존 추천 조회 실패: ${response.status}`
            );
          }


          const data =
            await response.json();


          console.log(
            "추천 동선 API 응답:",
            data
          );


          /* =========================
             API 응답

             {
               recommendedRoutes: [
                 {
                   description,
                   productList: [...],
                   zone
                 }
               ]
             }
          ========================= */


          const routes =
            Array.isArray(
              data.recommendedRoutes
            )
              ? data.recommendedRoutes
              : [];


          /*
            전체 routes 중
            사용자가 클릭한 zoneName과
            동일한 존 찾기
          */

          const selectedRoute =
            routes.find(
              (route) =>
                route.zone ===
                zoneName
            );


          if (!selectedRoute) {

            console.error(
              "선택한 존을 찾지 못했습니다.",
              {
                zoneName,
                routes,
              }
            );


            throw new Error(
              `${zoneName} 추천 정보를 찾을 수 없습니다.`
            );
          }


          const productList =
            Array.isArray(
              selectedRoute.productList
            )
              ? selectedRoute.productList
              : [];


          /*
            존 하나당
            대표 상품 하나 표시
          */

          const product =
            productList[0] || null;


          setRecommendation({

            zoneName:
              selectedRoute.zone ||
              zoneName,


            zoneDescription:
              selectedRoute.description ||
              `${zoneName}에서 고객님께 어울리는 상품을 추천해드립니다.`,


            productId:
              product?.productId ||
              null,


            productName:
              product?.productName ||
              "추천 상품이 없습니다.",


            productDescription:
              product?.productDetail ||
              "",


            location:
              product?.location ||
              "-",


            stock:
              product?.stock ?? 0,


            imageUrl:
              product?.productImg ||
              null,

          });


        } catch (error) {

          console.error(
            "ZoneDetail API 오류:",
            error
          );


          setErrorMessage(
            error.message ||
              "존 추천 정보를 불러오지 못했습니다."
          );


        } finally {

          setIsLoading(false);

        }
      };


    fetchZoneRecommendation();

  }, [
    visitCardId,
    zoneName,
  ]);


  /* =========================
     추천 상품 더보기
  ========================= */

  const handleMoreClick = () => {

    navigate(
      "/recommended-products",
      {
        state: {
          visitCardId,
          zoneName,
        },
      }
    );

  };


  /* =========================
     LOADING
  ========================= */

  if (isLoading) {

    return (

      <main className="page-with-bottom-nav zone-detail-page">

        <section className="page-scroll-content zone-detail-content">


          <header className="zone-detail-header">

            <button
              type="button"
              className="zone-detail-back"
              aria-label="이전 화면으로 이동"
              onClick={() =>
                navigate(-1)
              }
            >

              <img
                src={backIcon}
                alt=""
              />

            </button>


            <h1>
              {zoneName || "추천 존"}
            </h1>


            <p>
              추천 정보를 불러오는 중입니다.
            </p>

          </header>

        </section>


        <BottomNav />

      </main>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (
    errorMessage ||
    !recommendation
  ) {

    return (

      <main className="page-with-bottom-nav zone-detail-page">

        <section className="page-scroll-content zone-detail-content">


          <header className="zone-detail-header">

            <button
              type="button"
              className="zone-detail-back"
              aria-label="이전 화면으로 이동"
              onClick={() =>
                navigate(-1)
              }
            >

              <img
                src={backIcon}
                alt=""
              />

            </button>


            <h1>
              {zoneName || "추천 존"}
            </h1>


            <p>
              {errorMessage ||
                "추천 정보를 불러오지 못했습니다."}
            </p>

          </header>

        </section>


        <BottomNav />

      </main>
    );
  }


  /* =========================
     정상 화면
  ========================= */

  return (

    <main className="page-with-bottom-nav zone-detail-page">

      <section className="page-scroll-content zone-detail-content">


        {/* =========================
            HEADER
        ========================= */}

        <header className="zone-detail-header">

          <button
            type="button"
            className="zone-detail-back"
            aria-label="이전 화면으로 이동"
            onClick={() =>
              navigate(-1)
            }
          >

            <img
              src={backIcon}
              alt=""
            />

          </button>


          <h1>
            {recommendation.zoneName}
          </h1>


          <p>
            {recommendation.zoneDescription}
          </p>

        </header>


        {/* =========================
            더보기
        ========================= */}

        <button
          type="button"
          className="zone-detail-more"
          onClick={
            handleMoreClick
          }
        >

          추천 상품 더보기 &gt;

        </button>


        {/* =========================
            추천 상품
        ========================= */}

        <article className="zone-product-ticket">


          {/* 제품 이미지 */}

          <div className="zone-product-image">

            {recommendation.imageUrl ? (

              <img
                src={
                  recommendation.imageUrl
                }
                alt={
                  recommendation.productName
                }
              />

            ) : (

              <span>
                제품 사진
              </span>

            )}

          </div>


          {/* 제품 정보 */}

          <div className="zone-product-information">


            <div
              className="zone-product-stamp"
              aria-hidden="true"
            >

              <img
                src={visitIconAI}
                alt=""
              />

            </div>


            <h2>
              {recommendation.productName}
            </h2>


            <p>
              {
                recommendation.productDescription ||
                "상품 설명이 없습니다."
              }
            </p>


            <div className="zone-product-divider" />


            <dl>

              <div>

                <dt>
                  위치
                </dt>

                <dd>
                  {recommendation.location}
                </dd>

              </div>


              <div>

                <dt>
                  재고
                </dt>

                <dd>
                  {recommendation.stock}개
                </dd>

              </div>

            </dl>

          </div>

        </article>

      </section>


      <BottomNav />

    </main>
  );
}


export default ZoneDetail;