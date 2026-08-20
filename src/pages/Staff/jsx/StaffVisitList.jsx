import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import backIcon from "../../../assets/images/backBtn_brown.svg";
import profileIcon from "../../../assets/images/profile.svg";

import "../css/StaffVisitList.css";


/* =========================
   API BASE URL
========================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";


/* =========================
   오늘의 방문 고객 API

   GET /api/staff/visits/today
========================= */

const STAFF_VISITS_API =
  `${API_BASE_URL}/api/staff/visits/today`;


/* =========================
   응대 완료 Visit Card
   sessionStorage KEY
========================= */

const COMPLETED_VISITS_KEY =
  "wtw-staff-completed-visits";


/* =========================
   응대 완료 ID 가져오기
========================= */

function getCompletedVisitIds() {
  try {
    const savedData =
      window.sessionStorage.getItem(
        COMPLETED_VISITS_KEY
      );

    if (!savedData) {
      return [];
    }

    const parsedData =
      JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    /*
      visitCardId가
      숫자/문자열로 섞여도
      비교할 수 있도록 Number 변환
    */

    return parsedData.map(
      (id) => Number(id)
    );

  } catch (error) {
    console.error(
      "응대 완료 목록 조회 오류:",
      error
    );

    return [];
  }
}


/* =========================
   오늘 날짜 표시

   예:
   2026.08.18 (화)
========================= */

function formatTodayDate(date) {
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

  const weekday =
    new Intl.DateTimeFormat(
      "ko-KR",
      {
        weekday: "short",
      }
    ).format(date);

  return `${year}.${month}.${day} (${weekday})`;
}


/* =========================
   방문 시간 표시

   2026-08-16T14:30:00
        ↓
   14:30
========================= */

function formatVisitTime(
  visitTime
) {
  if (!visitTime) {
    return "";
  }

  /*
    백엔드가 보내준
    ISO 형식의 시간에서
    HH:mm만 가져옴

    timezone 변환을 하지 않기 때문에
    서버에서 받은 방문시간 그대로 표시됨
  */

  const timePart =
    visitTime.split("T")[1];

  if (!timePart) {
    return "";
  }

  return timePart.slice(
    0,
    5
  );
}


/* =========================
   방문 고객 정렬

   방문 시간이 빠른 고객부터
========================= */

function sortVisitsByTime(
  visits
) {
  return [...visits].sort(
    (a, b) => {
      if (
        !a.visitTime &&
        !b.visitTime
      ) {
        return 0;
      }

      if (!a.visitTime) {
        return 1;
      }

      if (!b.visitTime) {
        return -1;
      }

      return String(
        a.visitTime
      ).localeCompare(
        String(
          b.visitTime
        )
      );
    }
  );
}


function StaffVisitList() {
  /* =========================
     STATE
  ========================= */

  const [
    visits,
    setVisits,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /* =========================
     오늘 날짜
  ========================= */

  const today =
    formatTodayDate(
      new Date()
    );


  /* =========================
     응대 완료 ID
  ========================= */

  const completedVisitIds =
    getCompletedVisitIds();


  /* =========================
     오늘의 방문 고객 조회

     GET
     /api/staff/visits/today
  ========================= */

  useEffect(() => {

    const fetchTodayVisits =
      async () => {

        try {

          setIsLoading(true);

          setErrorMessage("");


          /* =========================
             로그인 토큰
          ========================= */

          const accessToken =
            localStorage.getItem(
              "accessToken"
            );


          console.log(
            "오늘의 방문 고객 조회 시작"
          );


          /* =========================
             API 요청
          ========================= */

          const response =
            await fetch(
              STAFF_VISITS_API,
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
             API 오류
          ========================= */

          if (!response.ok) {

            const errorText =
              await response.text();


            console.error(
              "오늘의 방문 고객 API 실패:",
              response.status,
              errorText
            );


            throw new Error(
              `오늘의 방문 고객 조회 실패 (${response.status})`
            );
          }


          /* =========================
             API 응답

             [
               {
                 storeName: "...",
                 userId: 1,
                 userName: "WWW",
                 visitCardId: 42,
                 visitTime:
                   "2026-08-16T14:30:00"
               }
             ]
          ========================= */

          const data =
            await response.json();


          console.log(
            "오늘의 방문 고객 API 응답:",
            data
          );


          /* =========================
             배열 확인
          ========================= */

          if (!Array.isArray(data)) {

            console.error(
              "방문 고객 API 응답이 배열이 아닙니다:",
              data
            );


            throw new Error(
              "방문 고객 응답 형식이 올바르지 않습니다."
            );
          }


          /* =========================
             방문시간 순서로 정렬
          ========================= */

          const sortedVisits =
            sortVisitsByTime(
              data
            );


          setVisits(
            sortedVisits
          );


        } catch (error) {

          console.error(
            "오늘의 방문 고객 조회 오류:",
            error
          );


          setVisits([]);


          setErrorMessage(
            "방문 고객 정보를 불러오지 못했습니다."
          );


        } finally {

          setIsLoading(false);

        }
      };


    fetchTodayVisits();

  }, []);


  return (

    <main
      className="
        staff-page
        staff-visit-list-page
      "
    >

      {/* =========================
          뒤로가기
      ========================= */}

      <Link
        className="staff-visit-list-back"
        to="/staff"
        aria-label="직원 홈으로"
      >

        <img
          src={backIcon}
          alt=""
        />

      </Link>


      {/* =========================
          HEADER
      ========================= */}

      <header
        className="staff-visit-list-header"
      >

        <h1>
          오늘의 방문 고객
        </h1>


        <time>
          {today}
        </time>

      </header>


      <div
        className="staff-visit-list-divider"
      />


      {/* =========================
          고객 목록
      ========================= */}

      <section
        className="staff-customer-list"
        aria-label="오늘의 방문 고객 명단"
      >

        {/* =========================
            로딩
        ========================= */}

        {isLoading && (

          <p
            className="
              staff-customer-list-message
            "
          >
            방문 고객을 불러오는 중입니다.
          </p>

        )}


        {/* =========================
            API 오류
        ========================= */}

        {!isLoading &&
          errorMessage && (

            <p
              className="
                staff-customer-list-message
                staff-customer-list-error
              "
            >
              {errorMessage}
            </p>

          )}


        {/* =========================
            오늘 방문 고객 없음
        ========================= */}

        {!isLoading &&
          !errorMessage &&
          visits.length === 0 && (

            <p
              className="
                staff-customer-list-message
              "
            >
              오늘 방문 예정인 고객이 없습니다.
            </p>

          )}


        {/* =========================
            방문 고객 카드
        ========================= */}

        {!isLoading &&
          !errorMessage &&
          visits.map(
            (visit) => {

              const {
                storeName,
                userId,
                userName,
                visitCardId,
                visitTime,
              } = visit;


              /* =====================
                 응대 완료 여부
              ===================== */

              const isCompleted =
                completedVisitIds.includes(
                  Number(
                    visitCardId
                  )
                );


              /* =====================
                 방문 시간

                 14:30
              ===================== */

              const formattedTime =
                formatVisitTime(
                  visitTime
                );


              /* =====================
                 상태 문구

                 응대 완료
                    또는
                 14:30 방문 예정
              ===================== */

              const displayedStatus =
                isCompleted
                  ? "응대 완료"
                  : formattedTime
                    ? `${formattedTime} 방문 예정`
                    : "방문 예정";


              return (

                <Link
                  className="staff-customer-card"

                  to={
                    `/staff/visits/${visitCardId}`
                  }

                  /*
                    상세 페이지에서
                    바로 사용할 수 있도록
                    현재 고객 정보도 전달

                    상세 페이지에서는
                    visitCardId를 이용해
                    다시 API 조회해도 됨
                  */

                  state={{
                    storeName,
                    userId,
                    userName,
                    visitCardId,
                    visitTime,
                  }}

                  key={
                    visitCardId
                  }
                >

                  {/* =====================
                      프로필
                  ===================== */}

                  <img
                    className="
                      staff-customer-profile
                    "
                    src={profileIcon}
                    alt=""
                  />


                  {/* =====================
                      고객 정보
                  ===================== */}

                  <span
                    className="
                      staff-customer-info
                    "
                  >

                    <strong>

                      {userName
                        ? `${userName}님`
                        : "고객님"}

                    </strong>


                    <small>

                      {displayedStatus}

                    </small>

                  </span>


                  {/* =====================
                      오른쪽 화살표
                  ===================== */}

                  <span
                    className="
                      staff-customer-chevron
                    "
                    aria-hidden="true"
                  />

                </Link>

              );
            }
          )}

      </section>

    </main>

  );
}


export default StaffVisitList;