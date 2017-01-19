(function() {
var elements = {
	clock: document.getElementById('clock'),
	quote: document.getElementById('quote'),
	author: document.getElementById('author'),
	period: document.getElementById('period'),
	name: document.getElementById('name'),
	bgContainer: document.getElementById('bg-container'),
	inputImg: document.getElementById('input-img')
}

var periodElementContent = elements.period.innerHTML;
var defaultQuote = "The man who does not read good books has no advantage over the man who cannot read them.";
var defaultAuthor = "Mark Twain";
var defaultBgLocation = "../res/wallpaper.jpg";

function setTimeAndPeriod() {
	var now = new Date();
	var hours = now.getHours();
	var mins = now.getMinutes();
	var secs = now.getSeconds();
	mins = mins < 10 ? '0' + mins : mins;
	var time = (hours <= 12 ? hours: hours % 12) + ':' + mins;
	elements.clock.innerHTML = time;
	
	if(hours >= 3 && hours < 12) {
		if(periodElementContent != 'morning') {
			periodElementContent = elements.period.innerHTML = 'morning';
		}
	}
	else if(hours >= 12 && hours < 17) {
		if(periodElementContent != 'afternoon') {
			periodElementContent = elements.period.innerHTML = 'afternoon';
		}
	}
	else {
		if(periodElementContent != 'evening') {
			periodElementContent = elements.period.innerHTML = 'evening';
		}
	}
	
	setTimeout(setTimeAndPeriod, (60 - secs) * 1000);
}

function setQuote() {
	var quoteData = JSON.parse(localStorage.getItem("quoteData"));
	if(quoteData && (new Date().getTime() - quoteData.time < 24 * 3600 * 1000)) {
		// if time now - saved time < 24 hours
		elements.quote.innerHTML = quoteData.quote;
		elements.author.innerHTML = quoteData.author;
	}
	else {
		elements.quote.innerHTML = (quoteData && quoteData.quote) || defaultQuote;
		elements.author.innerHTML = (quoteData && quoteData.author) || defaultAuthor;

		$.ajax({
		   url: 'https://www.goodreads.com/quotes_of_the_day/rss',
		   type: 'GET',
		   success: function(data){
		   		var xml = $(data);
		   		var item = xml.find("item")[0];
				var quotehtml = $.parseHTML(item.childNodes[9].textContent);
				var quoteDataNew = {
					"time": Date.parse(item.childNodes[3].textContent),
					"quote": $.trim(quotehtml[1].textContent),
					"author": $.trim(quotehtml[3].textContent.replace('-', ''))
				}
				elements.quote.innerHTML = quoteDataNew.quote;
				elements.author.innerHTML = quoteDataNew.author;
				localStorage.setItem("quoteData", JSON.stringify(quoteDataNew));
		   }
		});
	}
}

function setBackground(bgLocation) {
	elements.bgContainer.style['background-image'] = 'url(' + bgLocation + ')';
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return dataURL;
}

function loadImage() {
	var file, fr;

	if (typeof window.FileReader !== 'function') {
		console.log("The file API isn't supported on this browser yet.");
		return;
	}

	else if (!elements.inputImg.files) {
		console.log("This browser doesn't seem to support the `files` property of file inputs.");
	}
	else if (!elements.inputImg.files[0]) {
		console.log("Please select a file before clicking 'Load'");
	}
	else {
		file = elements.inputImg.files[0];
		fr = new FileReader();
		fr.onload = function() {
			setBackground(fr.result);
			var img = document.createElement('img');
			img.src = fr.result;
			localStorage.setItem("imgData", getBase64Image(img));
		};
		fr.readAsDataURL(file);
	}
}

setTimeAndPeriod();
setQuote();

if(localStorage.imgData) {
	setBackground(localStorage.imgData);
}

elements.inputImg.addEventListener('change', loadImage, false);
}());
