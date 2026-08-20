import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Tag,
  ArrowRight,
} from "lucide-react";

import "../css/Home.css";

import BottomNav from "../../../components/jsx/BottomNav";

import VisitCardResult
  from "../../VisitCard/jsx/VisitCardResult.jsx";

import starIcon
  from "../../../assets/images/star.svg";

import emptyStarIcon
  from "../../../assets/images/emptystar.svg";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


function Home() {
  const navigate = useNavigate();


  /* =========================
     VISIT CARD ID

     Visit Card 생성 후에는
     localStorage에 저장된 ID 사용
  ========================= */

  const visitCardId =
    localStorage.getItem(
      "visitCardId"
    );


  /* =========================
     STATE
  ========================= */

  const [
    userName,
    setUserName,
  ] = useState("");


  const [
    bestProducts,
    setBestProducts,
  ] = useState([]);


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  const [
    updatingProductId,
    setUpdatingProductId,
  ] = useState(null);


  /* =========================
     공통 HEADER
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
     HOME API 조회

     Visit Card가 없을 때만
     기존 Home 데이터 조회

     GET /api/users/me
     GET /api/products/best
     GET /api/users/wishlist
  ========================= */

  useEffect(() => {

    /*
      이미 Visit Card를 생성했다면
      아래 Home API는 불필요함.

      VisitCardResult가 자체적으로
      필요한 API를 호출함.
    */

    if (visitCardId) {
      setIsLoading(false);

      return;
    }


    const fetchHomeData =
      async () => {

        try {
          setIsLoading(true);


          const [
            userResponse,
            bestResponse,
            wishlistResponse,
          ] =
            await Promise.all([

              /* 사용자 */

              fetch(
                `${API_BASE_URL}/api/users/me`,
                {
                  method: "GET",
                  headers:
                    getHeaders(),
                }
              ),


              /* 베스트 상품 */

              fetch(
                `${API_BASE_URL}/api/products/best`,
                {
                  method: "GET",
                  headers:
                    getHeaders(),
                }
              ),


              /* 위시리스트 */

              fetch(
                `${API_BASE_URL}/api/users/wishlist`,
                {
                  method: "GET",
                  headers:
                    getHeaders(),
                }
              ),

            ]);


          /* =========================
             사용자 이름
          ========================= */

          if (userResponse.ok) {

            const userData =
              await userResponse.json();


            console.log(
              "사용자 API 응답:",
              userData
            );


            setUserName(
              userData.userName || ""
            );

          } else {

            console.error(
              "사용자 조회 실패:",
              userResponse.status
            );

          }


          /* =========================
             위시리스트
          ========================= */

          let wishlistData = {
            productList: [],
          };


          if (
            wishlistResponse.ok
          ) {

            wishlistData =
              await wishlistResponse.json();


            console.log(
              "위시리스트 응답:",
              wishlistData
            );

          } else {

            console.error(
              "위시리스트 조회 실패:",
              wishlistResponse.status
            );

          }


          const wishlistItems =
            Array.isArray(
              wishlistData.productList
            )
              ? wishlistData.productList
              : [];


          const wishlistIds =
            new Set(
              wishlistItems.map(
                (item) =>
                  Number(
                    item.productId
                  )
              )
            );


          /* =========================
             BEST 상품
          ========================= */

          if (bestResponse.ok) {

            const bestData =
              await bestResponse.json();


            console.log(
              "베스트 상품 응답:",
              bestData
            );


            /*
              API 응답이

              [
                {...}
              ]

              또는

              {
                productList: [...]
              }

              둘 다 대응
            */

            const bestList =
              Array.isArray(
                bestData
              )
                ? bestData
                : Array.isArray(
                    bestData.bestProductList
                  )
                  ? bestData.bestProductList
                  : Array.isArray(bestData.productList)
                    ? bestData.productList
                    : [];


            const formattedProducts =
              bestList.map(
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


            setBestProducts(
              formattedProducts
            );

          } else {

            console.error(
              "베스트 상품 조회 실패:",
              bestResponse.status
            );

          }


        } catch (error) {

          console.error(
            "Home API 오류:",
            error
          );

        } finally {

          setIsLoading(false);

        }
      };


    fetchHomeData();

  }, [visitCardId]);


  /* =========================
     Visit Card 생성
  ========================= */

  const handleVisitCard = () => {

    navigate(
      "/visit-card"
    );

  };


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

        throw new Error(
          `위시 삭제 실패: ${response.status}`
        );

      }
    };


  /* =========================
     별 클릭
  ========================= */

  const handleStarClick =
    async (productId) => {

      const targetProduct =
        bestProducts.find(
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


        setBestProducts(
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


  /* =====================================================
     ⭐ 핵심

     Visit Card가 이미 존재하면
     Home 화면 대신 VisitCardResult 화면 표시

     따라서 하단 Home 버튼으로 /home 이동해도
     생성창이 다시 나오지 않음
  ===================================================== */

  if (visitCardId) {

    return (
      <VisitCardResult />
    );

  }


  /* =====================================================
     Visit Card가 없는 경우
     기존 HOME 화면
  ===================================================== */

  return (

    <div className="home-page">

      <main className="home-main">


        {/* =========================
            인사 영역
        ========================= */}

        <section className="home-greeting">

          <p className="home-welcome">
            Welcome to MCM
          </p>


          <h1 className="home-customer-name">

            {isLoading
              ? "고객님"
              : userName
                ? `${userName} 고객님`
                : "고객님"}

          </h1>

        </section>


        <div className="home-divider" />


        {/* =========================
            VISIT CARD 생성 카드

            Visit Card가 없을 때만
            이 화면이 표시됨
        ========================= */}

        <section className="home-visit-card">

          <h2 className="home-visit-title">
            Visit Card
          </h2>


          <div className="home-visit-line" />


          <p className="home-visit-description">

            오늘 찾는 제품과 목적을 입력하면

            <br />

            AI가 맞춤 Visit Card를
            생성해드립니다.

          </p>


          <button
            type="button"
            className="home-visit-button"
            onClick={
              handleVisitCard
            }
          >

            <span>
              Visit Card 생성하러 가기
            </span>


            <ArrowRight
              size={18}
              strokeWidth={1.8}
            />

          </button>

        </section>


        <div
          className="
            home-divider
            home-divider-products
          "
        />


        {/* =========================
            MCM BEST 상품
        ========================= */}

        <section className="home-best-section">

          <h2 className="home-best-title">
            MCM 베스트 상품
          </h2>


          <div className="home-product-list">

            {isLoading ? (

              <p className="home-product-loading">
                불러오는 중...
              </p>

            ) : bestProducts.length === 0 ? (

              <p className="home-product-empty">
                베스트 상품이 없습니다.
              </p>

            ) : (

              bestProducts.map(
                (product) => (

                  <div
                    className="home-product-card"
                    key={
                      product.productId
                    }
                  >

                    <Tag
                      size={29}
                      strokeWidth={1.6}
                      className="home-product-tag"
                    />


                    <span className="home-product-name">

                      {
                        product.productName
                      }

                    </span>


                    <button
                      type="button"
                      className="home-product-star-button"
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
                        className="home-product-star"
                      />

                    </button>

                  </div>

                )
              )

            )}

          </div>

        </section>

      </main>


      <BottomNav />

    </div>
  );
}


export default Home;