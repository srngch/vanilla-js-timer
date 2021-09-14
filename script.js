"use strict";

document.addEventListener("DOMContentLoaded", function () {
  App();
});

const $ = (selector) => document.querySelector(selector);

function App() {
  let myTimer = {
    inputSeconds: undefined,
    leftSeconds: undefined,
    id: undefined,
    state: "Start",
  };

  const formTime = document.timeForm;
  const divDisplayHour = $(".display_hour");
  const divDisplayMin = $(".display_min");
  const divDisplaySec = $(".display_sec");
  const buttonStartPauseResume = $("#startPauseResume");
  const buttonReset = $("#reset");
  const divTimeBar = $("#timeBar-left");

  function timer(seconds) {
    const timeStart = Date.now();
    const timeEnd = timeStart + seconds * 1000;

    myTimer.id = setInterval(() => {
      const timeLeft = timeEnd - Date.now();
      myTimer.leftSeconds = Math.round(timeLeft / 1000);
      if (timeLeft < 0) {
        clearTimer(myTimer.id);
        myTimer.leftSeconds = 0;
        return;
      }
      displayTime(myTimer.leftSeconds, myTimer.inputSeconds);
    }, 1000);
  }

  function startTimer(seconds) {
    clearInterval(myTimer.id);
    timer(seconds);
  }

  function pauseTimer(timerId) {
    clearInterval(timerId);
  }

  function resumeTimer(seconds) {
    timer(seconds);
  }

  function resetTimer() {
    myTimer.leftSeconds = myTimer.inputSeconds;
    clearTimer(myTimer.id);
  }

  function clearTimer(timerId) {
    clearInterval(timerId);
    myTimer.state = "Start";
    buttonStartPauseResume.textContent = "시작";
    displayTime(myTimer.leftSeconds, myTimer.inputSeconds);
  }

  function displayTime(leftSeconds, inputSeconds) {
    const remaining_hour = Math.floor(leftSeconds / 3600);
    const remaining_min = Math.floor(
      (leftSeconds - remaining_hour * 3600) / 60
    );
    const remaining_sec = Math.floor(
      leftSeconds - remaining_hour * 3600 - remaining_min * 60
    );
    divDisplayHour.textContent = String(remaining_hour).padStart(2, "0");
    divDisplayMin.textContent = String(remaining_min).padStart(2, "0");
    divDisplaySec.textContent = String(remaining_sec).padStart(2, "0");
    divTimeBar.style.width = `${(leftSeconds * 100) / inputSeconds}%`;
  }

  function inputTime(event) {
    event.preventDefault();
    if (myTimer.id !== undefined) clearInterval(myTimer.id);
    myTimer.state = "Start";
    buttonStartPauseResume.textContent = "시작";
    const hours = Number(formTime.hours.value);
    const minutes = Number(formTime.minutes.value);
    const seconds = Number(formTime.seconds.value);

    myTimer.inputSeconds = hours * 3600 + minutes * 60 + seconds;
    myTimer.leftSeconds = myTimer.inputSeconds;
    displayTime(myTimer.leftSeconds, myTimer.inputSeconds);
    console.log(
      `input hours: ${hours}\n` +
        `input minutes: ${minutes}\n` +
        `input seconds: ${seconds}\n` +
        `\t-> total seconds: ${myTimer.leftSeconds}`
    );
  }

  function controlTimerState(event) {
    if (myTimer.leftSeconds) {
      displayTime(myTimer.leftSeconds, myTimer.inputSeconds);
      switch (myTimer.state) {
        case "Start":
          startTimer(myTimer.inputSeconds);
          myTimer.state = "Pause";
          buttonStartPauseResume.textContent = "일시정지";
          break;
        case "Pause":
          pauseTimer(myTimer.id);
          myTimer.state = "Resume";
          buttonStartPauseResume.textContent = "재시작";
          break;
        case "Resume":
          resumeTimer(myTimer.leftSeconds);
          myTimer.state = "Pause";
          buttonStartPauseResume.textContent = "일시정지";
          break;
        default:
          break;
      }
    }
  }

  formTime.addEventListener("submit", (event) => {
    inputTime(event);
  });

  buttonStartPauseResume.addEventListener("click", (event) => {
    controlTimerState(event);
  });

  buttonReset.addEventListener("click", (e) => {
    resetTimer();
  });
}
