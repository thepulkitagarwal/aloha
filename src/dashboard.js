(function() {
var elements = {
	clock: document.getElementById('clock'),
	quote: document.getElementById('quote'),
	author: document.getElementById('author'),
	period: document.getElementById('period'),
	name: document.getElementById('name'),
	bgContainer: document.getElementById('bg-container')
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
	var time = hours % 12 + ':' + mins;
	elements.clock.innerHTML = time;

	if(hours >= 3 && hours < 12 && periodElementContent != 'morning') {
		periodElementContent = elements.period.innerHTML = 'morning';
	}
	else if(hours >= 12 && hours < 17 && periodElementContent != 'afternoon') {
		periodElementContent = elements.period.innerHTML = 'afternoon';
	}
	else if(periodElementContent != 'evening') {
		periodElementContent = elements.period.innerHTML = 'evening';
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

setTimeAndPeriod();
setQuote();

}());
