import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ChevronRight,
} from "lucide-react";

import "../css/VisitCardResult.css";

import BottomNav from "../../../components/jsx/BottomNav";

import visitIconAI from "../../../assets/images/visit_icon_AI.svg";
import airplaneBlack from "../../../assets/images/airplane_black.svg";
import bagIcon from "../../../assets/images/bag.svg";
import starIcon from "../../../assets/images/star.svg";
import emptyStarIcon from "../../../assets/images/emptystar.svg";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

/* =========================
   CATEGORY MAP
========================= */

const PRODUCT_CATEGORY_MAP = {
  1: "백팩",
  2: "토트백",
  3: "지갑",
  4: "악세서리",
};

const MOOD_CATEGORY_MAP = {
  1: "스트리트",
  2: "클래식",
  3: "모던",
  4: "볼드",
  5: "미니멀",
};

const SUPPORT_STATUS_MAP = {
  1: "받을게요",
  2: "혼자 둘러볼게요",
  3: "둘러본 후에 받고 싶어요",
};


/* =========================
   방문 날짜 형식
========================= */

const formatVisitDate = (visitTime) => {
  if (!visitTime) {
    return "-";
  }

  const date = new Date(visitTime);

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


function VisitCardResult() {
  const navigate =
    useNavigate();

  const location =
    useLocation();


  /* =========================
     VISIT CARD ID
  ========================= */

  const visitCardId =
    location.state?.visitCardId ||
    localStorage.getItem(
      "visitCardId"
    );


  /* =========================
     STATE
  ========================= */

  const [
    visitCard,
    setVisitCard,
  ] = useState(null);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    updatingProductId,
    setUpdatingProductId,
  ] = useState(null);


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


  /* =========================
     API 조회
  ========================= */

  useEffect(() => {
    const fetchResultData =
      async () => {

        if (!visitCardId) {
          setErrorMessage(
            "Visit Card ID가 없습니다."
          );

          setIsLoading(false);

          return;
        }


        try {
          setIsLoading(true);
          setErrorMessage("");


          const [
            visitCardResponse,
            productsResponse,
            wishlistResponse,
          ] =
            await Promise.all([

              fetch(
                `${API_BASE_URL}/api/visitcards/${visitCardId}`,
                {
                  method: "GET",
                  headers:
                    getHeaders(),
                }
              ),

              fetch(
                `${API_BASE_URL}/api/recommend/products/${visitCardId}`,
                {
                  method: "GET",
                  headers:
                    getHeaders(),
                }
              ),

              fetch(
                `${API_BASE_URL}/api/users/wishlist`,
                {
                  method: "GET",
                  headers:
                    getHeaders(),
                }
              ),

            ]);


          if (!visitCardResponse.ok) {
            const errorText =
              await visitCardResponse.text();

            console.error(
              "Visit Card 조회 실패:",
              visitCardResponse.status,
              errorText
            );

            throw new Error(
              `Visit Card 조회 실패: ${visitCardResponse.status}`
            );
          }


          if (!productsResponse.ok) {
            const errorText =
              await productsResponse.text();

            console.error(
              "추천 상품 조회 실패:",
              productsResponse.status,
              errorText
            );

            throw new Error(
              `추천 상품 조회 실패: ${productsResponse.status}`
            );
          }


          if (!wishlistResponse.ok) {
            const errorText =
              await wishlistResponse.text();

            console.error(
              "위시리스트 조회 실패:",
              wishlistResponse.status,
              errorText
            );

            throw new Error(
              `위시리스트 조회 실패: ${wishlistResponse.status}`
            );
          }


          const visitCardData =
            await visitCardResponse.json();

          const productsData =
            await productsResponse.json();

          const wishlistData =
            await wishlistResponse.json();


          console.log(
            "Visit Card 상세:",
            visitCardData
          );

          console.log(
            "추천 상품:",
            productsData
          );

          console.log(
            "위시리스트:",
            wishlistData
          );


          setVisitCard(
            visitCardData
          );


          const productList =
            Array.isArray(
              productsData.productList
            )
              ? productsData.productList
              : [];


          const wishlistProductList =
            Array.isArray(
              wishlistData.productList
            )
              ? wishlistData.productList
              : [];


          const wishlistIds =
            new Set(
              wishlistProductList.map(
                (item) =>
                  Number(
                    item.productId
                  )
              )
            );


          const formattedProducts =
            productList.map(
              (product) => ({
                ...product,

                liked:
                  wishlistIds.has(
                    Number(
                      product.productId
                    )
                  ),
              })
            );


          setProducts(
            formattedProducts
          );


          if (
            visitCardData.visitCardId
          ) {
            localStorage.setItem(
              "visitCardId",
              String(
                visitCardData.visitCardId
              )
            );
          }

        } catch (error) {
          console.error(
            "VisitCardResult API 오류:",
            error
          );

          setErrorMessage(
            error.message ||
            "Visit Card 정보를 불러오지 못했습니다."
          );

        } finally {
          setIsLoading(false);
        }
      };


    fetchResultData();

  }, [visitCardId]);


  /* =========================
     추천 동선
  ========================= */

  const routeItems =
    Array.isArray(
      visitCard?.recommendedRoute
    )
      ? visitCard.recommendedRoute
      : [];


  /* =========================
     방문 정보
  ========================= */

  const visitInfo = [
    {
      label: "방문 매장",
      value:
        visitCard?.storeName ||
        "-",
    },

    {
      label: "방문 목적",
      value:
        visitCard?.purposeText ||
        "-",
    },

    {
      label: "오늘의 무드",
      value:
        MOOD_CATEGORY_MAP[
          visitCard?.moodCategory
        ] ||
        "-",
    },

    {
      label: "원하는 제품",
      value:
        PRODUCT_CATEGORY_MAP[
          visitCard
            ?.findProductCategory
        ] ||
        "-",
    },

    {
      label: "직원 서비스",
      value:
        SUPPORT_STATUS_MAP[
          visitCard?.supportStatus
        ] ||
        "-",
    },
  ];


  /* =========================
     위시 등록
  ========================= */

  const addWishlist =
    async (productId) => {

      const response =
        await fetch(
          `${API_BASE_URL}/api/users/wishlist/${productId}`,
          {
            method: "POST",
            headers:
              getHeaders(),
          }
        );


      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "위시 등록 실패:",
          response.status,
          errorText
        );


        if (
          response.status === 409
        ) {
          throw new Error(
            "이미 위시리스트에 등록된 상품입니다."
          );
        }


        throw new Error(
          `위시 등록 실패: ${response.status}`
        );
      }


      const data =
        await response.json();

      console.log(
        "위시 등록 응답:",
        data
      );
    };


  /* =========================
     위시 삭제
  ========================= */

  const deleteWishlist =
    async (productId) => {

      const response =
        await fetch(
          `${API_BASE_URL}/api/users/wishlist/${productId}`,
          {
            method: "DELETE",
            headers:
              getHeaders(),
          }
        );


      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "위시 삭제 실패:",
          response.status,
          errorText
        );


        throw new Error(
          `위시 삭제 실패: ${response.status}`
        );
      }


      const data =
        await response.json();

      console.log(
        "위시 삭제 응답:",
        data
      );
    };


  /* =========================
     별 클릭
  ========================= */

  const handleStarClick =
    async (productId) => {

      const targetProduct =
        products.find(
          (product) =>
            Number(
              product.productId
            ) ===
            Number(
              productId
            )
        );


      if (!targetProduct) {
        return;
      }


      if (
        updatingProductId ===
        productId
      ) {
        return;
      }


      try {
        setUpdatingProductId(
          productId
        );


        const nextLiked =
          !targetProduct.liked;


        if (nextLiked) {
          await addWishlist(
            productId
          );
        } else {
          await deleteWishlist(
            productId
          );
        }


        setProducts(
          (prevProducts) =>
            prevProducts.map(
              (product) =>
                Number(
                  product.productId
                ) ===
                Number(
                  productId
                )
                  ? {
                      ...product,
                      liked:
                        nextLiked,
                    }
                  : product
            )
        );

      } catch (error) {
        console.error(
          "위시리스트 변경 오류:",
          error
        );

        alert(
          error.message ||
          "위시리스트 변경에 실패했습니다."
        );

      } finally {
        setUpdatingProductId(
          null
        );
      }
    };


  /* =========================
     추천 동선 클릭
  ========================= */

  const handleRouteClick =
    (zoneName) => {

      navigate(
        "/zone-detail",
        {
          state: {
            visitCardId:
              visitCard?.visitCardId,

            zoneName,
          },
        }
      );
    };


  /* =========================
     추천 상품 더보기
  ========================= */

  const handleMoreClick =
    () => {

      navigate(
        "/recommended-products",
        {
          state: {
            visitCardId:
              visitCard?.visitCardId,
          },
        }
      );
    };


  return (
    <div className="visit-result-page">

      <main className="visit-result-main">


        {isLoading && (
          <p className="visit-result-loading">
            Visit Card를 불러오는 중...
          </p>
        )}


        {!isLoading &&
          errorMessage && (

            <p className="visit-result-error">
              {errorMessage}
            </p>

          )}


        {!isLoading &&
          !errorMessage &&
          visitCard && (
            <>

              {/* 인사 영역 */}

              <section className="visit-result-greeting">

                <p className="visit-result-welcome">
                  Welcome to MCM
                </p>


                <h1 className="visit-result-name">

                  {visitCard.userName
                    ? `${visitCard.userName} 고객님`
                    : "고객님"}

                </h1>

              </section>


              <div className="visit-result-divider" />


              {/* Visit Card */}

              <section className="visit-result-card">

                <div className="visit-result-card-top">

                  <div>

                    <h2 className="visit-result-card-title">
                      MCM Visit Card
                    </h2>


                    <p className="visit-result-card-date">
                      Date.{" "}
                      {formatVisitDate(
                        visitCard.visitTime
                      )}
                    </p>

                  </div>


                  <img
                    src={
                      visitIconAI
                    }
                    alt=""
                    className="visit-result-stamp-image"
                  />

                </div>


                <div className="visit-result-info-area">

                  {visitInfo.map(
                    (info) => (

                      <div
                        className="visit-result-info-row"
                        key={
                          info.label
                        }
                      >

                        <span className="visit-result-info-label">
                          {info.label}
                        </span>


                        <span className="visit-result-info-value">
                          {info.value}
                        </span>

                      </div>

                    )
                  )}

                </div>


                {/* Life → MCM */}

                <div className="visit-result-life">

                  <span className="visit-result-life-label">
                    Life
                  </span>


                  <div className="visit-result-life-route">

                    <span className="visit-result-life-dot" />


                    <span className="visit-result-life-line left-line" />


                    <img
                      src={
                        airplaneBlack
                      }
                      alt=""
                      className="visit-result-life-plane"
                    />


                    <span className="visit-result-life-line right-line" />


                    <span className="visit-result-life-dot" />

                  </div>


                  <span className="visit-result-life-label">
                    MCM
                  </span>

                </div>

              </section>


              {/* AI 분석 */}

              <section className="visit-result-ai-section">

                <p className="visit-result-ai-label">
                  AI가 분석한 오늘의 여행
                </p>


                <p className="visit-result-ai-text">
                  {visitCard.aiMood ||
                    "-"}
                </p>

              </section>


              <div className="visit-result-divider visit-result-divider-small" />


              {/* =========================
                  MCM 추천 동선
              ========================= */}

              <section className="visit-result-route-section">

                <h2 className="visit-result-section-title">
                  MCM 추천 동선
                </h2>


                {/* 추가된 설명문 */}

                <p className="visit-result-route-description">
                  클릭하시면 정보에 맞는 추천상품을 보실 수 있습니다.
                </p>


                <div className="visit-result-route-list">

                  {routeItems.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        className="visit-result-route-item"
                        key={`${item}-${index}`}
                      >

                        <button
                          type="button"
                          className="visit-result-route-box"
                          onClick={() =>
                            handleRouteClick(
                              item
                            )
                          }
                        >
                          {item}
                        </button>


                        {index !==
                          routeItems.length -
                            1 && (

                          <span className="visit-result-route-arrow">
                            →
                          </span>

                        )}

                      </div>

                    )
                  )}

                </div>

              </section>


              <div className="visit-result-divider visit-result-divider-small" />


              {/* 추천 상품 */}

              <section className="visit-result-products-section">

                <div className="visit-result-products-header">

                  <div>

                    <h2 className="visit-result-section-title">
                      MCM 추천 상품
                    </h2>


                    <p className="visit-result-products-description">
                      입력해주신 정보와 어울리는 MCM 상품을 추천해드립니다.
                    </p>

                  </div>


                  <button
                    type="button"
                    className="visit-result-more-button"
                    onClick={
                      handleMoreClick
                    }
                  >
                    더보기

                    <ChevronRight
                      size={13}
                      strokeWidth={1.5}
                    />

                  </button>

                </div>


                <div className="visit-result-product-list">

                  {products.length === 0 ? (

                    <p className="visit-result-products-empty">
                      추천 상품이 없습니다.
                    </p>

                  ) : (

                    products
                      .slice(0, 2)
                      .map(
                        (product) => (

                          <div
                            className="visit-result-product-card"
                            key={
                              product.productId
                            }
                          >

                            <img
                              src={
                                bagIcon
                              }
                              alt=""
                              className="visit-result-product-icon"
                            />


                            <span className="visit-result-product-name">
                              {product.productName}
                            </span>


                            <button
                              type="button"
                              className="visit-result-star-button"
                              onClick={() =>
                                handleStarClick(
                                  product.productId
                                )
                              }
                              disabled={
                                updatingProductId ===
                                product.productId
                              }
                              aria-label={
                                product.liked
                                  ? "위시리스트에서 제거"
                                  : "위시리스트에 추가"
                              }
                            >

                              <img
                                src={
                                  product.liked
                                    ? starIcon
                                    : emptyStarIcon
                                }
                                alt=""
                                className="visit-result-star-icon"
                              />

                            </button>

                          </div>

                        )
                      )

                  )}

                </div>

              </section>

            </>
          )}

      </main>


      <BottomNav />

    </div>
  );
}


export default VisitCardResult;