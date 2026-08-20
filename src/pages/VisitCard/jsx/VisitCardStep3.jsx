const CONSULTATION_OPTIONS = [
  {
    value: "accept",
    label: "받을게요",
  },
  {
    value: "alone",
    label: "혼자 둘러볼게요",
  },
  {
    value: "after-tour",
    label: "둘러본 후 받고 싶어요",
  },
];

const DELAY_OPTIONS = [
  {
    value: "15",
    label: "15분 후",
  },
  {
    value: "30",
    label: "30분 후",
  },
  {
    value: "60",
    label: "1시간 후",
  },
];

function VisitCardStep3({
  visitCardData,
  updateVisitCardData,
  onPrevious,
  onNext,
}) {
  const handleTimeChange = (event) => {
    updateVisitCardData({
      visitTime: event.target.value,
    });
  };

  const handleConsultationSelect = (consultationType) => {
    updateVisitCardData({
      consultationType,
      consultationDelay:
        consultationType === "after-tour"
          ? visitCardData.consultationDelay
          : "",
    });
  };

  const handleDelaySelect = (delay) => {
    updateVisitCardData({
      consultationDelay: delay,
    });
  };

  const needsDelay = visitCardData.consultationType === "after-tour";

  const canComplete =
    visitCardData.visitTime &&
    visitCardData.consultationType &&
    (!needsDelay || visitCardData.consultationDelay);

  const handleComplete = () => {
    if (!canComplete) {
      return;
    }

    onNext();
  };

  return (
    <div className="visit-step visit-step-three">
      <button
        type="button"
        className="visit-back-button"
        aria-label="이전 단계로 이동"
        onClick={onPrevious}
      >
        ‹
      </button>

      <div className="visit-progress">
        <span className="visit-progress-bar visit-progress-step-three" />
      </div>

      <p className="visit-step-label">STEP 3</p>

      <h1 className="visit-step-title">방문 예정 시간을 입력해주세요.</h1>

      <p className="visit-step-description">
        도착 시간에 맞춰 질 높은 서비스를 제공해드리겠습니다.
      </p>

      <div className="visit-divider" />

      <section className="visit-choice-section">
        <label className="visit-choice-title" htmlFor="visit-time">
          방문 예정 시간
        </label>

        <input
          id="visit-time"
          className="visit-time-input"
          type="time"
          step="900"
          value={visitCardData.visitTime}
          onInput={handleTimeChange}
        />

        {!visitCardData.visitTime && (
          <p className="visit-input-guide">
            방문 시간을 선택해주세요.
          </p>
        )}
      </section>

      <section className="visit-consultation-section">
        <h2 className="visit-choice-title">직원 상담을 받으시겠어요?</h2>

        <p className="visit-consultation-description">
          Visit Card에 적어주신 내용을 바탕으로 매장 직원이 목적에 맞는 응대를
          해드립니다.
        </p>

        <div className="visit-consultation-options">
          {CONSULTATION_OPTIONS.map((option) => {
            const isSelected = visitCardData.consultationType === option.value;

            return (
              <button
                type="button"
                key={option.value}
                className={`visit-consultation-button ${
                  isSelected ? "is-selected" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => handleConsultationSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {needsDelay && (
        <section className="visit-delay-section">
          <h2 className="visit-choice-title">언제 상담을 받고 싶으세요?</h2>

          <div className="visit-delay-options">
            {DELAY_OPTIONS.map((option) => {
              const isSelected =
                visitCardData.consultationDelay === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  className={`visit-delay-button ${
                    isSelected ? "is-selected" : ""
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => handleDelaySelect(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <button
        type="button"
        className="visit-complete-button"
        disabled={!canComplete}
        onClick={handleComplete}
      >
        다음으로 이동
      </button>
    </div>
  );
}

export default VisitCardStep3;
