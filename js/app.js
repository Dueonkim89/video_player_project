const video = document.querySelector('video');
let timer;
const paragraphElements = document.querySelectorAll('p');
let numberOfDelays = [];
let eventCatcher = [];
let flag = false;

const videoPlayer = new MediaElementPlayer(video, {
	features: ['playpause', 'current', 'progress', 'volume', 'duration', 'fullscreen'],
	stretching: 'responsive'
});


function resetBackgroundColor() {
	for (let i = 0; i < paragraphElements.length; i++) {
			paragraphElements[i].style.backgroundColor = '';
			paragraphElements[i].style.color = '';
	}
}

//THIS FUNCTION USED TO STOP ALL INSTANCES OF setDelay FROM RUNNING.
function stopDelay(theDelays) {
	for (let i = 0; i < theDelays.length; i++) {
		clearTimeout(theDelays[i]);
	}
	console.log(numberOfDelays.length );
	numberOfDelays.length = 0;
}

//CLEVER FUNCTION I INVENTED TO INVOKE stopDelay FOR THE PARAGRAPH ELEMENTS BEING CLICKED. 
function paragraphClickResetter(theEvents) {
	for (let i = 0; i < theEvents.length; i++) {
		//if more than one event is logged from clicking paragraph elements. 
		if (theEvents[i + 1]) {
			//invoke stopDelay function
			stopDelay(numberOfDelays);
			eventCatcher.splice(1, 1);
		}
	}
}

function highlightText(element, previousElement) {
	if (previousElement) {
		previousElement.style.backgroundColor = '';
		previousElement.style.color = '';
		element.style.backgroundColor = "#259e96";
		element.style.color = "#993723";
	} else {
		element.style.backgroundColor = "#259e96";
		element.style.color = "#993723";
	}	
}

function setDelay(element, previousElement, delay) {
	//timer is global undefined variable. IT MUST BE DONE THIS WAY.
	timer = setTimeout(function(){
		highlightText(element, previousElement);
  }, delay);
  // push timer function into empty array called numberOfDelays.
	numberOfDelays.push(timer);
}

function findProperParagraph(currentTime) {
	for (let i = 0; i < paragraphElements.length; i++) {
		//the argument for this function must always be in between these two variables so we can find the proper paragraph
		let firstParagraph = paragraphElements[i];
		let secondParagraph = paragraphElements[i + 1];
		
		// if secondParagraph is undefined, we know it must be the last index in the array. 
		if (secondParagraph === undefined) {
			//invoke setDelay function.
			setDelay(firstParagraph, firstParagraph.previousElementSibling, 0);
			//return the last index of array.
			return paragraphElements.length - 1;
			// if argument is between the first and second paragraph
		} else if (parseInt(firstParagraph.dataset.timeframe) <= currentTime && currentTime < parseInt(secondParagraph.dataset.timeframe)) {
			console.log(firstParagraph);
			console.log(secondParagraph);
			//interesting prototype object method. Thx god for stack overflow.
			let index = Array.prototype.indexOf.call(paragraphElements, firstParagraph); 
			setDelay(firstParagraph, firstParagraph.previousElementSibling, 0);	
			// get the index of the element that was just highlighted. 
			return index;
		}
	}
}


//ORIGINAL FUNCTION ASSUMING VIDEO ALWAYS PLAYS AT STARTING POINT OF 0:00:00
//video.addEventListener('playing', (event) => {
//	for (let i = 0; i < paragraphElements.length; i++) {
//		const delayTime = parseInt(paragraphElements[i].dataset.timeframe);
//		setDelay(paragraphElements[i], paragraphElements[i - 1], delayTime);
//	}
//});



video.addEventListener('playing', (event) => {
	//multiply by 1000 because the data attributes in html file are in this format. 
	let currentTime = video.getCurrentTime() * 1000;
	console.log(currentTime);
	//run the function to see which paragraph to begin with. 
	const referenceIndex = findProperParagraph(currentTime);
	//change the data attribute to the time we logged. 
	paragraphElements[referenceIndex].dataset.timeframe =  currentTime;
	//remember the first starting index has already been ran, so we need to start from the second index.
	const firstStartingIndex = referenceIndex + 1;
	for (let i = firstStartingIndex; i < paragraphElements.length; i++) {
		let startingTimeInterval = paragraphElements[referenceIndex].dataset.timeframe;
		let secondTimeInterval = paragraphElements[i].dataset.timeframe;
		let delayTime = secondTimeInterval - startingTimeInterval;
		setDelay(paragraphElements[i], paragraphElements[i - 1], delayTime);
	}
	flag = true;
});


video.addEventListener('ended', (event) => {
	resetBackgroundColor();
});

video.addEventListener('pause', (event) => {
	stopDelay(numberOfDelays);
	resetBackgroundColor();
});


// loop thu all the paragraph elements to be able to play video by clicking on them.
for (let i = 0; i < paragraphElements.length; i++) {
	paragraphElements[i].addEventListener('click', (event) => {
		// retrieve boolean flag if video is playing
		if (flag) {
		// if video is playing, invoke the stopDelay function.	
			stopDelay(numberOfDelays);
		}
		//clever way to set up the stop function by collecting the number of events running. 
		eventCatcher.push(event);
		let timeInterval = (paragraphElements[i].dataset.timeframe / 1000);
		//set the video time to the time interval
		video.setCurrentTime(timeInterval);
		resetBackgroundColor();
		//if multiple instances of setDelay running, we need to be able to cancel it. 
		paragraphClickResetter(eventCatcher);
		resetBackgroundColor();
		video.play();
	});
}


	