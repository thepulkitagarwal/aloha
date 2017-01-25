(function() {
var elements = {
	clock: document.getElementById('clock'),
	quote: document.getElementById('quote'),
	author: document.getElementById('author'),
	period: document.getElementById('period'),
	name: document.getElementById('name'),
	bgContainer: document.getElementById('bg-container'),
	settings: document.getElementById('settings'),
	settingsPopup: document.getElementById('settings-popup'),
	settingsName: document.getElementById('settings-name'),
	settingsCropContainer: document.getElementById('settings-crop-container'),
	settingsCropButton: document.getElementById('settings-crop-button'),
	imageToCrop: document.getElementById('image-to-crop')
}

var periodElementContent = elements.period.innerHTML;
var defaultQuote = "The man who does not read good books has no advantage over the man who cannot read them.";
var defaultAuthor = "Mark Twain";

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

function storeName(name) {
	localStorage.name = name.trim();
}

function setName(name) {
	if(name) elements.name.innerHTML = ', ' + name;
	else elements.name.innerHTML = '';
}

function setBackground(dataURI, origURI) {
	if(dataURI) elements.bgContainer.style['background-image'] = 'url(' + dataURI + ')';
	if(origURI) elements.imageToCrop.src = origURI;
}

window.setBackground = setBackground;

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/jpg");

    // return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return dataURL;
}

function loadImage(file) {
	var fr;

	if (typeof window.FileReader !== 'function') {
		console.log("The file API isn't supported on this browser yet.");
		return;
	}
	else {
		fr = new FileReader();
		fr.onload = function() {
			// var img = document.createElement('img');
			// img.src = fr.result;
			// localStorage.setItem("imgData", fr.result);
			store.storeImage(fr.result);
			setBackground(fr.result, fr.result);
		};
		fr.readAsDataURL(file);
	}
}

setTimeAndPeriod();
setQuote();

setName(localStorage.name);

if(localStorage.name) {
	elements.settingsName.value = localStorage.name;
}

// if(localStorage.imgData) {
// 	setBackground(localStorage.imgData);
// }

store.getImage(function(img) {
	if(img) {
		setBackground(img.dataURI, img.origURI);
		var image = document.createElement('img');
		image.src = img.origURI;
		if(!image.src) {
			elements.bgContainer.classList.remove('hide');
		}
		image.onload = image.onerror = function () {
			elements.bgContainer.classList.remove('hide');
		};
	}
});

$(elements.settingsName).on('input', function(e) {
	var name = e.target.value;
	setName(name);
	localStorage.name = name;
});

$(elements.settings).click(function(e) {
	e.preventDefault();
	elements.settingsPopup.classList.toggle('show');
});


$(document).on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
	e.preventDefault();
	e.stopPropagation();
})
.on('drop', function(e) {
	if(!$(elements.bgContainer).hasClass('hide')) {
		var file = e.originalEvent.dataTransfer.files[0];
		if(file && file.type.match(/^image\/(jpe?g|png)$/i)){
			loadImage(e.originalEvent.dataTransfer.files[0]);
		}
	}
});

$('#settings-crop-button').click(function() {
	elements.bgContainer.classList.toggle('hide');
	$('.crop-container').toggleClass('hide');
	elements.settingsPopup.classList.toggle('show');

	initializeCropper();
});

}());


