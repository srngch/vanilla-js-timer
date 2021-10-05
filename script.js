const $ = (selector) => document.querySelector(selector);

function convertTimeToSeconds(hours, minutes, seconds) {
	return hours * 3600 + minutes * 60 + seconds;
}

function convertSecondsToTime(totalSeconds) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
	const seconds = Math.floor(totalSeconds - hours * 3600 - minutes * 60);
	return { hours, minutes, seconds };
}

class Timer {
	constructor(
		time = {
			hours: 0,
			minutes: 0,
			seconds: 0,
		},
		option = {
			tickCallback() {},
		}
	) {
		this._inputTime = time;
		this._inputTotalSeconds = convertTimeToSeconds(
			time.hours,
			time.minutes,
			time.seconds
		);
		this._state = {
			id: undefined,
			remainingSeconds: this._inputTotalSeconds,
			status: 'Start',
		};
		this.tickCallback = option.tickCallback;
	}

	_go(seconds) {
		const timeStart = Date.now();
		const timeEnd = timeStart + seconds * 1000;

		this._state.id = setInterval(() => {
			const timeLeft = timeEnd - Date.now();
			this._state.remainingSeconds = Math.round(timeLeft / 1000);
			if (timeLeft < 0) {
				this._state.remainingSeconds = 0;
				this._state.status = 'Finish';
				this._clear(this._state.id);
				return;
			}
			this.tickCallback(this._state.remainingSeconds, this._inputTotalSeconds);
		}, 1000);
	}

	get inputTime() {
		return this._inputTime;
	}

	set inputTime(time = { hours: 0, minutes: 0, seconds: 0 }) {
		this._inputTime = time;
		this._inputTotalSeconds = convertTimeToSeconds(
			time.hours,
			time.minutes,
			time.seconds
		);
	}

	get status() {
		return this._state.status;
	}

	start(time = this._inputTime) {
		clearInterval(this._state.id);
		this._state.status = 'Pause';
		this._go(this._inputTotalSeconds);
	}

	pause() {
		clearInterval(this._state.id);
		this._state.status = 'Resume';
	}

	resume() {
		this._go(this._state.remainingSeconds);
		this._state.status = 'Pause';
	}

	reset() {
		clearInterval(this._state.id);
		this._state.remainingSeconds = this._inputTotalSeconds;
		this._state.status = 'Start';
		this.tickCallback(this._state.remainingSeconds, this._inputTotalSeconds);
	}

	_clear() {
		clearInterval(this._state.id);
		this._state.status = 'Start';
		this.tickCallback(this._state.remainingSeconds, this._inputTotalSeconds);
	}
}

function App() {
	const timer = new Timer();
	timer.tickCallback = tickCallback;
	const formTime = document.timeForm;
	const divDisplayHour = $('.display_hour');
	const divDisplayMin = $('.display_min');
	const divDisplaySec = $('.display_sec');
	const buttonStartPauseResume = $('#startPauseResume');
	const buttonReset = $('#reset');
	const divTimeBar = $('#timeBar-left');

	function tickCallback(remainingSeconds, totalSeconds) {
		const remainingTime = convertSecondsToTime(remainingSeconds);

		displayTimeText(
			remainingTime.hours,
			remainingTime.minutes,
			remainingTime.seconds
		);
		displayTimeBar(remainingSeconds, totalSeconds);
	}

	function displayTimeText(hours, minutes, seconds) {
		divDisplayHour.textContent = String(hours).padStart(2, '0');
		divDisplayMin.textContent = String(minutes).padStart(2, '0');
		divDisplaySec.textContent = String(seconds).padStart(2, '0');
	}

	function displayTimeBar(remainingSeconds, totalSeconds) {
		divTimeBar.style.width = `${(remainingSeconds * 100) / totalSeconds}%`;
	}

	function setInputTime() {
		const hours = Number(formTime.hours.value);
		const minutes = Number(formTime.minutes.value);
		const seconds = Number(formTime.seconds.value);

		timer.inputTime = { hours, minutes, seconds };
		displayTimeText(hours, minutes, seconds);
	}

	function controlTimerState() {
		const status = timer._state.status;
		if (status !== 'Finish') {
			switch (status) {
				case 'Start':
					timer.start();
					buttonStartPauseResume.textContent = '일시정지';
					break;
				case 'Pause':
					timer.pause();
					buttonStartPauseResume.textContent = '계속';
					break;
				case 'Resume':
					timer.resume();
					buttonStartPauseResume.textContent = '일시정지';
					break;
			}
		}
	}

	formTime.addEventListener('submit', (event) => {
		event.preventDefault();
		timer.reset();
		setInputTime();
		buttonStartPauseResume.textContent = '시작';
	});

	formTime.addEventListener('keyup', (event) => {
		const target = event.target;
		if (
			target.value.length === 0 &&
			target.previousElementSibling &&
			event.key == 'Backspace'
		) {
			target.previousElementSibling.focus();
			return;
		}
		if (event.key === ' ' || isNaN(Number(event.key))) {
			return;
		}
		if (target.value.length >= target.maxLength) {
			target.nextElementSibling.focus();
		}
	});

	formTime.addEventListener('keydown', (event) => {
		if (event.key === ' ' || isNaN(Number(event.key))) {
			return;
		}
		const target = event.target;
		if (target.value.length >= target.maxLength) {
			target.nextElementSibling.focus();
		}
	});

	buttonStartPauseResume.addEventListener('click', (event) => {
		controlTimerState();
	});

	buttonReset.addEventListener('click', (e) => {
		timer.reset();
		buttonStartPauseResume.textContent = '시작';
	});
}

App();
