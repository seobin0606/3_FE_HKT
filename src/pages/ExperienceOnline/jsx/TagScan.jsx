import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Tesseract from "tesseract.js";

import "../css/TagScan.css";

import BottomNav from "../../../components/jsx/BottomNav";
import backIcon from "../../../assets/images/backBtn_brown.svg";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


/* =========================
   OCR 문자열 정리
========================= */

const cleanText = (text) => {
  if (!text) {
    return "";
  }

  return text
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[=:|·\-~_]+/, "")
    .trim();
};


/* =========================
   정보 라벨 확인
========================= */

const isInfoLabel = (text) => {
  if (!text) {
    return false;
  }

  return (
    /가\s*격|가격/i.test(text) ||
    /사\s*이\s*즈|사이즈/i.test(text) ||
    /소\s*재|소재/i.test(text) ||
    /모\s*델|모델/i.test(text) ||
    /원산지/i.test(text) ||
    /Made\s+in/i.test(text)
  );
};


/* =========================
   제품명 추출
========================= */

const extractProductName = (rawText) => {
  if (!rawText) {
    return "";
  }

  console.log(
    "========== 제품명 추출 시작 =========="
  );

  console.log(
    "OCR 원본:",
    rawText
  );


  const normalizedText =
    rawText
      .replace(/\r/g, "")
      .trim();


  /* =========================
     방법 1

     제품명 ~ 가격 사이
  ========================= */

  const productMatch =
    normalizedText.match(
      /(?:제\s*품\s*명|제품명|상품명)\s*[:：\-]?\s*([\s\S]*?)(?=\s*(?:가\s*격|가격|사\s*이\s*즈|사이즈|소\s*재|소재|모\s*델|모델|원산지|Made\s+in|$))/i
    );


  if (
    productMatch &&
    productMatch[1]
  ) {
    const productName =
      cleanText(
        productMatch[1]
      );


    if (
      productName.length >= 2
    ) {
      console.log(
        "방법 1 제품명:",
        productName
      );

      return productName;
    }
  }


  /* =========================
     줄 단위 분석
  ========================= */

  const lines =
    normalizedText
      .split("\n")
      .map((line) =>
        line.trim()
      )
      .filter(Boolean);


  console.log(
    "OCR 줄 목록:",
    lines
  );


  /* =========================
     방법 2

     제품명 라벨 기준
  ========================= */

  for (
    let i = 0;
    i < lines.length;
    i += 1
  ) {
    const line =
      lines[i];


    if (
      /제\s*품\s*명|제품명|상품명/i.test(
        line
      )
    ) {

      /* =========================
         같은 줄
      ========================= */

      const sameLine =
        line
          .replace(
            /.*?(?:제\s*품\s*명|제품명|상품명)\s*[:：\-]?\s*/i,
            ""
          )
          .trim();


      if (
        sameLine &&
        sameLine.length >= 2
      ) {
        console.log(
          "방법 2 같은 줄:",
          sameLine
        );

        return sameLine;
      }


      /* =========================
         다음 줄
      ========================= */

      if (
        lines[i + 1]
      ) {
        const nextLine =
          cleanText(
            lines[i + 1]
          );


        if (
          nextLine &&
          !isInfoLabel(
            nextLine
          )
        ) {
          console.log(
            "방법 2 다음 줄:",
            nextLine
          );

          return nextLine;
        }
      }
    }
  }


  /* =========================
     방법 3

     제품명 라벨은 틀렸지만
     가격 라벨은 읽은 경우

     가격 바로 앞 줄 사용
  ========================= */

  for (
    let i = 0;
    i < lines.length;
    i += 1
  ) {
    if (
      /가\s*격|가격/i.test(
        lines[i]
      )
    ) {
      if (
        i > 0
      ) {
        let previousLine =
          cleanText(
            lines[i - 1]
          );


        /*
          잘못 인식된
          제품명 한글 라벨 제거
        */

        previousLine =
          previousLine.replace(
            /^[가-힣]{2,4}\s+/,
            ""
          );


        if (
          previousLine &&
          previousLine.length >= 2
        ) {
          console.log(
            "방법 3 가격 앞 줄:",
            previousLine
          );

          return previousLine;
        }
      }
    }
  }


  console.log(
    "제품명 추출 실패"
  );


  return "";
};


/* =========================
   영문 보정이 필요한지 확인

   예)

   01101/AR 다이아몬드...
   → true

   OTTOMAR 다이아몬드...
   → false

   Pina 비세토스...
   → false
========================= */

const needsEnglishCorrection = (
  productName
) => {

  if (!productName) {
    return false;
  }


  /*
    최초 한글이 나오는 위치
  */

  const koreanIndex =
    productName.search(
      /[가-힣]/
    );


  /*
    한글 앞부분만 확인
  */

  const prefix =
    koreanIndex === -1
      ? productName
      : productName.slice(
          0,
          koreanIndex
        );


  /*
    영문이어야 할 부분에
    숫자 / 슬래시 / | 등이 있으면
    영어 오인식으로 판단
  */

  return /[0-9\/\\|]/.test(
    prefix
  );
};


/* =========================
   영어 OCR 결과에서
   가장 그럴듯한
   영문 단어 하나만 선택

   예)

   B OTTOMAR CIOI0tR CE B

   ↓

   OTTOMAR
========================= */

const cleanEnglishResult = (
  rawText
) => {

  if (!rawText) {
    return "";
  }


  console.log(
    "영어 OCR 원본:",
    rawText
  );


  /*
    알파벳으로만 이루어진
    단어 후보 추출
  */

  const words =
    rawText.match(
      /[A-Za-z]+/g
    ) || [];


  /*
    너무 짧은 잡음 제거

    B
    CE
    BY

    같은 건 제거
  */

  const candidates =
    words.filter(
      (word) =>
        word.length >= 4
    );


  if (
    candidates.length === 0
  ) {
    return "";
  }


  /*
    가장 긴 영문 단어 선택

    예:
    OTTOMAR
  */

  const bestWord =
    candidates.reduce(
      (longest, current) =>
        current.length >
        longest.length
          ? current
          : longest,
      candidates[0]
    );


  console.log(
    "선택된 영문 단어:",
    bestWord
  );


  return bestWord;
};


/* =========================
   영어 앞부분만 교체

   중요:
   한글 부분은
   kor+eng 결과를 그대로 유지

   예)

   01101/AR 다이아몬드 퀼팅 레더 위켄더
   +
   OTTOMAR

   ↓

   OTTOMAR 다이아몬드 퀼팅 레더 위켄더
========================= */

const mergeEnglishPrefix = (
  mixedProductName,
  englishWord
) => {

  if (
    !mixedProductName ||
    !englishWord
  ) {
    return mixedProductName;
  }


  /* =========================
     최초 한글 위치
  ========================= */

  const koreanIndex =
    mixedProductName.search(
      /[가-힣]/
    );


  /*
    한글이 아예 없는 제품이면
    기존 결과 유지
  */

  if (
    koreanIndex === -1
  ) {
    return mixedProductName;
  }


  /* =========================
     한글 부분을 그대로 보존

     예:
     다이아몬드 퀼팅 레더 위켄더
  ========================= */

  const koreanPart =
    mixedProductName
      .slice(
        koreanIndex
      )
      .trim();


  /*
    영어 OCR에서는
    단어 하나만 사용
  */

  const englishPart =
    englishWord.trim();


  const corrected =
    `${englishPart} ${koreanPart}`
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  console.log(
    "영문 앞부분만 보정한 결과:",
    corrected
  );


  return corrected;
};


function TagScan() {
  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);


  const [
    ocrText,
    setOcrText,
  ] = useState("");


  const [
    isScanning,
    setIsScanning,
  ] = useState(false);


  const [
    isSending,
    setIsSending,
  ] = useState(false);


  /* =========================
     카메라 열기
  ========================= */

  const handleOpenCamera = () => {
    fileInputRef.current?.click();
  };


  /* =========================
     사진 촬영 / 선택
  ========================= */

  const handleImageChange =
    async (event) => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      /* 기존 이미지 URL 해제 */

      if (selectedImage) {
        URL.revokeObjectURL(
          selectedImage
        );
      }


      const imageUrl =
        URL.createObjectURL(
          file
        );


      setSelectedImage(
        imageUrl
      );


      setOcrText("");


      await runOCR(
        file
      );
    };


  /* =========================
     제품 정보 영역 Crop

     확대 X
     흑백 X
  ========================= */

  const cropProductInfo =
    (imageFile) => {

      return new Promise(
        (resolve, reject) => {

          const imageUrl =
            URL.createObjectURL(
              imageFile
            );


          const image =
            new Image();


          image.onload = () => {

            try {

              const canvas =
                document.createElement(
                  "canvas"
                );


              const ctx =
                canvas.getContext(
                  "2d"
                );


              if (!ctx) {
                throw new Error(
                  "Canvas 생성 실패"
                );
              }


              /*
                제품명 / 가격 /
                사이즈 / 소재 영역
              */

              const cropX =
                image.width * 0.10;

              const cropY =
                image.height * 0.37;

              const cropWidth =
                image.width * 0.85;

              const cropHeight =
                image.height * 0.48;


              canvas.width =
                Math.round(
                  cropWidth
                );


              canvas.height =
                Math.round(
                  cropHeight
                );


              ctx.drawImage(
                image,

                cropX,
                cropY,
                cropWidth,
                cropHeight,

                0,
                0,

                canvas.width,
                canvas.height
              );


              const croppedImage =
                canvas.toDataURL(
                  "image/png"
                );


              URL.revokeObjectURL(
                imageUrl
              );


              resolve(
                croppedImage
              );

            } catch (error) {

              URL.revokeObjectURL(
                imageUrl
              );


              reject(
                error
              );
            }
          };


          image.onerror = () => {

            URL.revokeObjectURL(
              imageUrl
            );


            reject(
              new Error(
                "이미지를 불러오지 못했습니다."
              )
            );
          };


          image.src =
            imageUrl;
        }
      );
    };


  /* =========================
     영문 제품명 영역 Crop

     제품명 값 부분만
     비교적 좁게 자름
  ========================= */

  const cropEnglishProductName =
    (imageFile) => {

      return new Promise(
        (resolve, reject) => {

          const imageUrl =
            URL.createObjectURL(
              imageFile
            );


          const image =
            new Image();


          image.onload = () => {

            try {

              const canvas =
                document.createElement(
                  "canvas"
                );


              const ctx =
                canvas.getContext(
                  "2d"
                );


              if (!ctx) {
                throw new Error(
                  "Canvas 생성 실패"
                );
              }


              /*
                "제품명" 라벨은 제외하고
                제품명 값 영역만 Crop
              */

              const cropX =
                image.width * 0.27;

              const cropY =
                image.height * 0.39;

              const cropWidth =
                image.width * 0.68;

              const cropHeight =
                image.height * 0.15;


              canvas.width =
                Math.round(
                  cropWidth
                );


              canvas.height =
                Math.round(
                  cropHeight
                );


              ctx.drawImage(
                image,

                cropX,
                cropY,
                cropWidth,
                cropHeight,

                0,
                0,

                canvas.width,
                canvas.height
              );


              const croppedImage =
                canvas.toDataURL(
                  "image/png"
                );


              URL.revokeObjectURL(
                imageUrl
              );


              resolve(
                croppedImage
              );

            } catch (error) {

              URL.revokeObjectURL(
                imageUrl
              );


              reject(
                error
              );
            }
          };


          image.onerror = () => {

            URL.revokeObjectURL(
              imageUrl
            );


            reject(
              new Error(
                "이미지를 불러오지 못했습니다."
              )
            );
          };


          image.src =
            imageUrl;
        }
      );
    };


  /* =========================
     kor + eng OCR
  ========================= */

  const recognizeCroppedImage =
    async (imageFile) => {

      const croppedImage =
        await cropProductInfo(
          imageFile
        );


      console.log(
        "제품 정보 영역 Crop 완료"
      );


      const result =
        await Tesseract.recognize(
          croppedImage,
          "kor+eng",
          {
            logger: (message) => {

              console.log(
                "kor+eng OCR 진행:",
                message
              );

            },
          }
        );


      return (
        result.data.text ||
        ""
      );
    };


  /* =========================
     영어 전용 OCR

     제품명 값 영역만
     영어로 다시 읽음
  ========================= */

  const recognizeEnglishProductName =
    async (imageFile) => {

      const croppedImage =
        await cropEnglishProductName(
          imageFile
        );


      console.log(
        "영문 제품명 Crop 완료"
      );


      const result =
        await Tesseract.recognize(
          croppedImage,
          "eng",
          {
            logger: (message) => {

              console.log(
                "영문 OCR 진행:",
                message
              );

            },


            /*
              숫자를 후보에서 제외해서
              O → 0
              T → 1

              같은 오인식을 조금 줄임
            */

            tessedit_char_whitelist:
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",

          }
        );


      const rawText =
        result.data.text ||
        "";


      return cleanEnglishResult(
        rawText
      );
    };


  /* =========================
     원본 전체 OCR

     Crop OCR이
     제품명을 못 찾았을 때 사용
  ========================= */

  const recognizeOriginalImage =
    async (imageFile) => {

      console.log(
        "원본 전체 OCR 시작"
      );


      const result =
        await Tesseract.recognize(
          imageFile,
          "kor+eng",
          {
            logger: (message) => {

              console.log(
                "전체 OCR 진행:",
                message
              );

            },
          }
        );


      return (
        result.data.text ||
        ""
      );
    };


  /* =========================
     최종 영문 보정 함수
  ========================= */

  const correctEnglishPrefix =
    async (
      productName,
      imageFile
    ) => {

      /*
        영문 앞부분이 정상이라면
        그대로 사용
      */

      if (
        !needsEnglishCorrection(
          productName
        )
      ) {

        return productName;

      }


      console.log(
        "영문 앞부분 오인식 감지:",
        productName
      );


      const englishWord =
        await recognizeEnglishProductName(
          imageFile
        );


      console.log(
        "영어 전용 OCR 선택 결과:",
        englishWord
      );


      if (!englishWord) {

        console.log(
          "영어 보정 실패 → 기존 제품명 유지"
        );


        return productName;
      }


      return mergeEnglishPrefix(
        productName,
        englishWord
      );
    };


  /* =========================
     OCR 실행
  ========================= */

  const runOCR =
    async (imageFile) => {

      try {

        setIsScanning(true);
        setOcrText("");


        /* =========================
           1차 OCR
           제품 정보 Crop
        ========================= */

        const croppedText =
          await recognizeCroppedImage(
            imageFile
          );


        console.log(
          "========== Crop kor+eng 결과 =========="
        );


        console.log(
          croppedText
        );


        let productName =
          extractProductName(
            croppedText
          );


        /* =========================
           Crop 결과 성공
        ========================= */

        if (productName) {

          console.log(
            "Crop 제품명:",
            productName
          );


          /*
            영문 앞부분만
            필요한 경우 보정
          */

          productName =
            await correctEnglishPrefix(
              productName,
              imageFile
            );


          console.log(
            "최종 제품명:",
            productName
          );


          setOcrText(
            productName
          );


          return;
        }


        /* =========================
           Crop 실패

           → 원본 전체 OCR
        ========================= */

        console.log(
          "Crop에서 제품명 추출 실패"
        );


        console.log(
          "원본 전체 OCR 재시도"
        );


        const originalText =
          await recognizeOriginalImage(
            imageFile
          );


        console.log(
          "========== 원본 OCR 결과 =========="
        );


        console.log(
          originalText
        );


        productName =
          extractProductName(
            originalText
          );


        /* =========================
           최종 실패
        ========================= */

        if (!productName) {

          console.log(
            "최종 제품명 추출 실패"
          );


          setOcrText("");


          alert(
            "제품명을 정확히 인식하지 못했습니다.\n제품 태그가 프레임 안에 크게 보이도록 다시 촬영해주세요."
          );


          return;
        }


        /* =========================
           영문 앞부분 보정
        ========================= */

        productName =
          await correctEnglishPrefix(
            productName,
            imageFile
          );


        console.log(
          "최종 제품명:",
          productName
        );


        setOcrText(
          productName
        );


      } catch (error) {

        console.error(
          "OCR 오류:",
          error
        );


        setOcrText("");


        alert(
          "제품 태그 인식에 실패했습니다."
        );


      } finally {

        setIsScanning(false);

      }
    };


  /* =========================
     스캔 완료

     POST /api/products/qr
  ========================= */

  const handleScanComplete =
    async () => {

      if (!ocrText) {

        alert(
          "먼저 제품 태그를 촬영해주세요."
        );


        return;
      }


      try {

        setIsSending(true);


        const accessToken =
          localStorage.getItem(
            "accessToken"
          );


        console.log(
          "백엔드에 보낼 제품명:",
          ocrText
        );


        /* =========================
           상품 스캔 API
        ========================= */

        const response =
          await fetch(
            `${API_BASE_URL}/api/products/qr`,
            {
              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                ...(accessToken && {

                  Authorization:
                    `Bearer ${accessToken}`,

                }),
              },


              body:
                JSON.stringify({

                  productName:
                    ocrText,

                }),
            }
          );


        /* =========================
           요청 실패
        ========================= */

        if (!response.ok) {

          const errorText =
            await response.text();


          console.error(
            "상품 스캔 API 실패:",
            response.status,
            errorText
          );


          throw new Error(
            `상품 스캔 실패: ${response.status}`
          );
        }


        /* =========================
           백엔드 응답
        ========================= */

        const product =
          await response.json();


        console.log(
          "상품 스캔 API 응답:",
          product
        );


        /* =========================
           응답 검증
        ========================= */

        if (
          !product.productId ||
          !product.productName
        ) {

          console.error(
            "상품 응답 형식 오류:",
            product
          );


          throw new Error(
            "상품 정보가 올바르지 않습니다."
          );
        }


        /* =========================
           ScanConfirm 이동

           백엔드에서 받은
           productId
           productName
           productImg 전달
        ========================= */

        navigate(
          "/scan/confirm",
          {
            state: {

              productId:
                product.productId,

              productName:
                product.productName,

              productImg:
                product.productImg,

            },
          }
        );


      } catch (error) {

        console.error(
          "상품 스캔 API 오류:",
          error
        );


        alert(
          "제품 정보를 등록하지 못했습니다."
        );


      } finally {

        setIsSending(false);

      }
    };


  return (

    <div className="tag-scan-page">


      {/* =========================
          HEADER
      ========================= */}

      <header className="tag-scan-header">

        <button
          type="button"
          className="tag-scan-back-button"
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

      <main className="tag-scan-main">


        {/* =========================
            설명
        ========================= */}

        <section className="tag-scan-text-section">

          <h1 className="tag-scan-title">

            제품 태그를 프레임에 맞춰
            <br />
            스캔해주세요.

          </h1>


          <p className="tag-scan-description">

            *그림자가 지지 않게 밝은 곳에서 스캔해주시기 바랍니다.

            <br />

            *스캔이 완료될 때까지 태그를 프레임에 고정해주시기를

            <br />

            바랍니다.

          </p>

        </section>


        {/* =========================
            카메라 영역
        ========================= */}

        <section className="tag-scan-camera-wrapper">

          <div
            className="tag-scan-camera"
            onClick={
              handleOpenCamera
            }
          >


            {selectedImage && (

              <img
                src={
                  selectedImage
                }
                alt="촬영된 제품 태그"
                className="tag-scan-preview"
              />

            )}


            <span className="scan-corner top-left" />

            <span className="scan-corner top-right" />

            <span className="scan-corner bottom-left" />

            <span className="scan-corner bottom-right" />


            {!selectedImage && (

              <span className="tag-scan-camera-guide">

                제품 태그를 촬영해주세요

              </span>

            )}

          </div>

        </section>


        {/* =========================
            FILE INPUT
        ========================= */}

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept="image/*"
          capture="environment"
          onChange={
            handleImageChange
          }
          style={{
            display: "none",
          }}
        />


        {/* =========================
            OCR 진행
        ========================= */}

        {isScanning && (

          <p className="tag-scan-status">

            제품명을 인식하고 있습니다...

          </p>

        )}


        {/* =========================
            OCR 결과
        ========================= */}

        {ocrText &&
          !isScanning && (

            <div className="tag-scan-ocr-result">

              <p>
                인식된 제품명
              </p>


              <strong>
                {ocrText}
              </strong>

            </div>

          )}


        {/* =========================
            스캔 완료
        ========================= */}

        <button
          type="button"
          className="tag-scan-complete-button"
          onClick={
            handleScanComplete
          }
          disabled={
            isScanning ||
            isSending ||
            !ocrText
          }
        >

          {isScanning
            ? "인식 중..."
            : isSending
              ? "제품 등록 중..."
              : "스캔 완료"}

        </button>


      </main>


      <BottomNav />


    </div>
  );
}


export default TagScan;