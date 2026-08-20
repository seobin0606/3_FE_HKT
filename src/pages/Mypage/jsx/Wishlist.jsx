import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronLeft,
  Tag,
} from "lucide-react";

import "../css/Wishlist.css";

import BottomNav from "../../../components/jsx/BottomNav";

import starIcon from "../../../assets/images/star.svg";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

function Wishlist() {
  const navigate = useNavigate();


  /* =========================
     STATE
  ========================= */

  const [wishlistItems, setWishlistItems] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [deletingProductId, setDeletingProductId] =
    useState(null);


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
     위시리스트 조회
     GET /api/users/wishlist
  ========================= */

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${API_BASE_URL}/api/users/wishlist`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );


        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            "위시리스트 조회 실패:",
            response.status,
            errorText
          );

          throw new Error(
            `위시리스트 조회 실패: ${response.status}`
          );
        }


        const data =
          await response.json();


        console.log(
          "위시리스트 조회 응답:",
          data
        );


        const productList =
          Array.isArray(
            data.productList
          )
            ? data.productList
            : [];


        setWishlistItems(
          productList
        );

      } catch (error) {
        console.error(
          "위시리스트 조회 API 오류:",
          error
        );

        setErrorMessage(
          "위시리스트를 불러오지 못했습니다."
        );

      } finally {
        setIsLoading(false);
      }
    };


    fetchWishlist();

  }, []);


  /* =========================
     위시상품 삭제
     DELETE /api/users/wishlist/{productId}
  ========================= */

  const handleDeleteWishlist =
    async (productId) => {

      if (
        deletingProductId ===
        productId
      ) {
        return;
      }


      try {
        setDeletingProductId(
          productId
        );


        const response = await fetch(
          `${API_BASE_URL}/api/users/wishlist/${productId}`,
          {
            method: "DELETE",
            headers: getHeaders(),
          }
        );


        /* =========================
           실패
        ========================= */

        if (!response.ok) {
          const errorText =
            await response.text();


          console.error(
            "위시상품 삭제 실패:",
            response.status,
            errorText
          );


          if (
            response.status === 401
          ) {
            throw new Error(
              "로그인이 필요합니다."
            );
          }


          if (
            response.status === 400
          ) {
            throw new Error(
              "올바르지 않은 상품 ID입니다."
            );
          }


          if (
            response.status === 404
          ) {
            throw new Error(
              "위시리스트에 해당 상품이 존재하지 않습니다."
            );
          }


          if (
            response.status === 403
          ) {
            throw new Error(
              "해당 요청에 대한 권한이 없습니다."
            );
          }


          throw new Error(
            `위시상품 삭제 실패: ${response.status}`
          );
        }


        /* =========================
           성공
           200 OK
        ========================= */

        const data =
          await response.json();


        console.log(
          "위시상품 삭제 응답:",
          data
        );


        /* =========================
           삭제 성공 후
           화면에서도 해당 상품 제거
        ========================= */

        setWishlistItems(
          (prevItems) =>
            prevItems.filter(
              (item) =>
                item.productId !==
                productId
            )
        );

      } catch (error) {
        console.error(
          "위시상품 삭제 API 오류:",
          error
        );


        alert(
          error.message ||
          "위시리스트 삭제에 실패했습니다."
        );

      } finally {
        setDeletingProductId(
          null
        );
      }
    };


  return (
    <div className="wishlist-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="wishlist-header">

        <button
          type="button"
          className="wishlist-back"
          onClick={() =>
            navigate(-1)
          }
          aria-label="뒤로가기"
        >

          <ChevronLeft
            size={28}
            strokeWidth={1.7}
          />

        </button>

      </header>


      {/* =========================
          MAIN
      ========================= */}

      <main className="wishlist-main">

        <h1 className="wishlist-title">
          위시리스트
        </h1>


        <section className="wishlist-list">

          {/* =========================
              LOADING
          ========================= */}

          {isLoading && (

            <p className="wishlist-loading">
              불러오는 중...
            </p>

          )}


          {/* =========================
              ERROR
          ========================= */}

          {!isLoading &&
            errorMessage && (

              <p className="wishlist-error">
                {errorMessage}
              </p>

            )}


          {/* =========================
              EMPTY
          ========================= */}

          {!isLoading &&
            !errorMessage &&
            wishlistItems.length === 0 && (

              <p className="wishlist-empty">
                위시리스트가 없습니다.
              </p>

            )}


          {/* =========================
              WISHLIST LIST
          ========================= */}

          {!isLoading &&
            !errorMessage &&
            wishlistItems.map(
              (item) => (

                <div
                  className="wishlist-card"
                  key={item.productId}
                >

                  {/* 왼쪽 영역 */}
                  <div className="wishlist-card-left">

                    <Tag
                      className="wishlist-tag-icon"
                      size={32}
                      strokeWidth={1.7}
                    />


                    <span className="wishlist-product-name">
                      {item.productName}
                    </span>

                  </div>


                  {/* =========================
                      삭제 별 버튼
                  ========================= */}

                  <button
                    type="button"
                    className="wishlist-star-button"
                    onClick={() =>
                      handleDeleteWishlist(
                        item.productId
                      )
                    }
                    disabled={
                      deletingProductId ===
                      item.productId
                    }
                    aria-label="위시리스트에서 제거"
                  >

                    <img
                      src={starIcon}
                      alt=""
                      className="wishlist-star-icon"
                    />

                  </button>

                </div>

              )
            )}

        </section>

      </main>


      <BottomNav />

    </div>
  );
}


export default Wishlist;