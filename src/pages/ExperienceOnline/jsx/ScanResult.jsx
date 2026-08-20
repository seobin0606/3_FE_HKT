import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Tag,
} from "lucide-react";

import "../css/ScanResult.css";

import BottomNav from "../../../components/jsx/BottomNav";

import starIcon from "../../../assets/images/star.svg";
import emptyStarIcon from "../../../assets/images/emptystar.svg";
import backIcon from "../../../assets/images/backBtn_brown.svg";


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
    Accept: "application/json",
    "Content-Type": "application/json",

    ...(accessToken && {
      Authorization:
        `Bearer ${accessToken}`,
    }),
  };
};


function ScanResult() {
  const navigate =
    useNavigate();


  /* =========================
     STATE
  ========================= */

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
     스캔 히스토리 + 위시리스트 조회

     GET /api/products/qr/history
     GET /api/users/wishlist
  ========================= */

  useEffect(() => {

    const fetchScanHistory =
      async () => {

        try {
          setIsLoading(true);

          setErrorMessage("");


          const [
            historyResponse,
            wishlistResponse,
          ] =
            await Promise.all([

              /* =========================
                 상품 스캔 히스토리
              ========================= */

              fetch(
                `${API_BASE_URL}/api/products/qr/history`,
                {
                  method: "GET",

                  headers:
                    getHeaders(),
                }
              ),


              /* =========================
                 위시리스트
              ========================= */

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
             스캔 히스토리 응답 확인
          ========================= */

          if (!historyResponse.ok) {

            const errorText =
              await historyResponse.text();


            console.error(
              "상품 스캔 히스토리 조회 실패:",
              historyResponse.status,
              errorText
            );


            throw new Error(
              `상품 스캔 히스토리 조회 실패: ${historyResponse.status}`
            );
          }


          const historyData =
            await historyResponse.json();


          console.log(
            "상품 스캔 히스토리 응답:",
            historyData
          );


          /* =========================
             위시리스트 응답
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


          /* =========================
             productList 추출
          ========================= */

          const historyList =
            Array.isArray(
              historyData.productList
            )
              ? historyData.productList
              : [];


          const wishlistList =
            Array.isArray(
              wishlistData.productList
            )
              ? wishlistData.productList
              : [];


          /* =========================
             위시리스트 ID 목록
          ========================= */

          const wishlistIds =
            new Set(
              wishlistList.map(
                (item) =>
                  Number(
                    item.productId
                  )
              )
            );


          /* =========================
             중복 상품 제거

             같은 productId가 여러 번
             스캔된 경우 화면에는
             한 번만 표시
          ========================= */

          const uniqueHistoryList =
            Array.from(
              new Map(
                historyList.map(
                  (product) => [
                    Number(
                      product.productId
                    ),
                    product,
                  ]
                )
              ).values()
            );


          console.log(
            "중복 제거 후 스캔 상품:",
            uniqueHistoryList
          );


          /* =========================
             화면용 데이터 가공
          ========================= */

          const formattedProducts =
            uniqueHistoryList.map(
              (product) => ({

                id:
                  product.productId,

                name:
                  product.productName,

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


        } catch (error) {

          console.error(
            "ScanResult API 오류:",
            error
          );


          setErrorMessage(
            error.message ||
              "상품 스캔 기록을 불러오지 못했습니다."
          );


        } finally {

          setIsLoading(false);

        }
      };


    fetchScanHistory();

  }, []);


  /* =========================
     위시 등록

     POST
     /api/users/wishlist/{productId}
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
    };


  /* =========================
     위시 삭제

     DELETE
     /api/users/wishlist/{productId}
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
              product.id
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
                  product.id
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
     태그 다시 스캔
  ========================= */

  const handleScanAgain = () => {

    navigate(
      "/scan"
    );

  };


  /* =========================
     RENDER
  ========================= */

  return (

    <div className="scan-result-page">


      {/* =========================
          HEADER
      ========================= */}

      <header className="scan-result-header">

        <button
          type="button"
          className="scan-result-back"
          onClick={() =>
            navigate(-1)
          }
          aria-label="뒤로가기"
        >

          <img
            src={backIcon}
            alt=""
          />

        </button>

      </header>


      {/* =========================
          MAIN
      ========================= */}

      <main className="scan-result-main">


        {/* 제목 */}

        <section className="scan-result-title-section">

          <h1 className="scan-result-title">
            제품 기록하기
          </h1>


          <p className="scan-result-description">

            마음에 드는 제품 태그를 스캔해주세요.

            <br />

            스캔된 제품은 서비스에 기록으로 추가됩니다.

          </p>

        </section>


        {/* =========================
            제품 목록
        ========================= */}

        <section className="scan-result-product-scroll">

          <div className="scan-result-list">


            {isLoading ? (

              <p className="scan-result-loading">
                스캔 기록을 불러오는 중...
              </p>

            ) : errorMessage ? (

              <p className="scan-result-error">
                {errorMessage}
              </p>

            ) : products.length === 0 ? (

              <p className="scan-result-empty">
                아직 스캔한 상품이 없습니다.
              </p>

            ) : (

              products.map(
                (product) => (

                  <div
                    className="scan-result-product-card"
                    key={
                      product.id
                    }
                  >


                    <Tag
                      className="scan-result-tag-icon"
                      size={29}
                      strokeWidth={1.6}
                    />


                    <span className="scan-result-product-name">
                      {product.name}
                    </span>


                    <button
                      type="button"
                      className="scan-result-star-button"
                      onClick={() =>
                        handleStarClick(
                          product.id
                        )
                      }
                      disabled={
                        updatingProductId ===
                        product.id
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
                        className="scan-result-star-icon"
                      />

                    </button>

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* =========================
            태그 다시 스캔
        ========================= */}

        <button
          type="button"
          className="scan-result-scan-button"
          onClick={
            handleScanAgain
          }
        >
          태그 스캔하기
        </button>


        <div className="scan-result-divider" />


      </main>


      <BottomNav />


    </div>
  );
}


export default ScanResult;