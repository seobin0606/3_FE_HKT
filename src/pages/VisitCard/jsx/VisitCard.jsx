import { useState } from "react";
import { useNavigate } from "react-router-dom";

import VisitCardStep1 from "./VisitCardStep1";
import VisitCardStep2 from "./VisitCardStep2";
import VisitCardStep3 from "./VisitCardStep3";
import VisitCardStep4 from "./VisitCardStep4";

import BottomNav from "../../../components/jsx/BottomNav";
import { createVisitCard } from "../../../services/visitCardApi";
import "../css/VisitCard.css";

const VISIT_CARD_STORAGE_KEY = "wtw-visit-card";
const VISIT_CARD_ID_STORAGE_KEY = "visitCardId";

const GENDER_CATEGORY = {
  여성: 1,
  남성: 2,
  기타: 3,
};

const PRODUCT_CATEGORY = {
  백팩: 1,
  토트백: 2,
  지갑: 3,
  액세서리: 4,
};

const MOOD_CATEGORY = {
  스트리트: 1,
  클래식: 2,
  모던: 3,
  볼드: 4,
  미니멀: 5,
};

const SUPPORT_STATUS = {
  accept: 1,
  alone: 2,
  "after-tour": 3,
};

const formatVisitDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
};

const formatVisitTime = (time) => {
  if (!time) {
    return null;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T${time}:00`;
};

const getVisitCardId = (responseData) =>
  responseData?.visitCardId ?? responseData?.data?.visitCardId ?? null;

function VisitCard() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [visitCardData, setVisitCardData] = useState({
    gender: "",
    region: "",
    storeId: null,
    store: "",
    storeType: "",
    products: [],
    moods: [],
    shoppingPurpose: "",
    visitTime: "",
    consultationType: "",
    consultationDelay: "",
  });

  const updateVisitCardData = (newData) => {
    setVisitCardData((previousData) => ({
      ...previousData,
      ...newData,
    }));
  };

  const goToNextStep = () => {
    setCurrentStep((previousStep) =>
      Math.min(previousStep + 1, 4)
    );
  };

  const goToPreviousStep = () => {
    setCurrentStep((previousStep) =>
      Math.max(previousStep - 1, 1)
    );
  };

  /* =========================
     Visit Card 생성 완료
  ========================= */
  const handleVisitCardComplete = async () => {
    if (isSubmitting) {
      return;
    }

    const completedVisitCardData = {
      ...visitCardData,
      visitDate: formatVisitDate(new Date()),
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      if (!visitCardData.storeId) {
        throw new Error("선택한 매장의 ID가 없습니다. 매장을 다시 선택해주세요.");
      }

      const requestBody = {
        userId: Number(localStorage.getItem("userId")) || 1,
        storeId: Number(visitCardData.storeId),
        findProductCategory: visitCardData.products[0]
          ? PRODUCT_CATEGORY[visitCardData.products[0]]
          : null,
        moodCategory: MOOD_CATEGORY[visitCardData.moods[0]],
        purposeText: visitCardData.shoppingPurpose.trim(),
        visitTime: formatVisitTime(visitCardData.visitTime),
        supportStatus: SUPPORT_STATUS[visitCardData.consultationType],
        gender: GENDER_CATEGORY[visitCardData.gender],
      };

      const responseData = await createVisitCard(requestBody);
      const visitCardId = getVisitCardId(responseData);

      if (!visitCardId) {
        throw new Error("서버 응답에 Visit Card ID가 없습니다.");
      }

      const savedVisitCardData = {
        ...completedVisitCardData,
        ...responseData,
        visitCardId,
      };

      localStorage.setItem(
        VISIT_CARD_STORAGE_KEY,
        JSON.stringify(savedVisitCardData)
      );
      localStorage.setItem(VISIT_CARD_ID_STORAGE_KEY, String(visitCardId));

      navigate("/visit-card-result", {
        state: {
          visitCardId,
          visitCardData: savedVisitCardData,
        },
      });
    } catch (error) {
      console.error("Visit Card 생성 실패:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Visit Card 생성에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VisitCardStep1
            visitCardData={visitCardData}
            updateVisitCardData={updateVisitCardData}
            onNext={goToNextStep}
          />
        );

      case 2:
        return (
          <VisitCardStep2
            visitCardData={visitCardData}
            updateVisitCardData={updateVisitCardData}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        );

      case 3:
        return (
          <VisitCardStep3
            visitCardData={visitCardData}
            updateVisitCardData={updateVisitCardData}
            onPrevious={goToPreviousStep}
            onNext={goToNextStep}
          />
        );

      case 4:
        return (
          <VisitCardStep4
            visitCardData={visitCardData}
            updateVisitCardData={updateVisitCardData}
            onPrevious={goToPreviousStep}
            onComplete={handleVisitCardComplete}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="page-with-bottom-nav visit-card-page">
      <section className="page-scroll-content visit-card-content">
        {renderCurrentStep()}
      </section>

      <BottomNav />
    </main>
  );
}

export default VisitCard;
