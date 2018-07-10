(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

// Create variable for app object
var app = {};

app.init = function () {
	// ================================================
	// Similar and OMDB APIs: Get Results and display
	// ================================================
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';

	app.displayNoResultsError = function () {
		// console.log('error function works')
		var $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find results for your search. We might not have results for your search or your spelling is slightly off.');
		console.log($noResultsError);
		$('#error').append($noResultsError);
	};
	console.log(app.displayNoResultsError);

	// Event Listener to cinlude everything that happens on form submission
	$('.media__form').on('submit', function (event) {
		// Prevent default for submit inputs
		event.preventDefault();
		// Get value of the media type the user checked
		var userType = $('input[name=type]:checked').val();
		// Get the value of what the user entered in the search field
		var userInput = $('#media__search').val();
		// Promise for API#1
		app.getMedia = $.ajax({
			url: 'https://tastedive.com/api/similar',
			method: 'GET',
			dataType: 'jsonp',
			data: {
				k: '311267-HackerYo-HR2IP9BD',
				q: '' + userInput,
				type: '' + userType,
				info: 1,
				limit: 10
			}
		});

		// A function that will pass movie titles from Promise#1 into Promise #2
		app.getImdbRating = function (movieTitle) {
			// Return Promise#2 which includes the movie title from Promise#1
			return $.ajax({
				url: 'http://www.omdbapi.com',
				method: 'GET',
				data: {
					apikey: '1661fa9d',
					t: movieTitle
				}
			});
		};
		// Get results for Promise#1
		$.when(app.getMedia).then(function (mediaInfo) {
			var mediaInfoArray = mediaInfo.Similar.Results;
			console.log(mediaInfoArray);

			var noResults = $.isEmptyObject(mediaInfoArray);
			if (noResults === true) {
				app.displayNoResultsError();
				// alert(`Please check your spelling or enter a valid title for your media category`);
			};
			// If the mdeia typeis movies or shows, get results array from Promise #1 and map each movie title result to a promise for Promise #2. This will return an array of promises for API#2.
			if (userType === 'movies' || userType === 'shows') {
				var imdbPromiseArray = mediaInfoArray.map(function (title) {
					return app.getImdbRating(title.Name);
				});
				console.log(imdbPromiseArray);
				// Return a single array from the array of promises and display the results on the page.
				Promise.all(imdbPromiseArray).then(function (imdbResults) {
					console.log(imdbResults);
					app.imdbResultsArray = imdbResults;
					// console.log(app.imdbResultsArray);
					app.displayMedia(mediaInfoArray);
				});
				// For media types that are not movies or shows, display the results on the page
			} else {
				app.displayMedia(mediaInfoArray);
			};
		}).fail(function (err) {
			console.log(err);
		});
		// This is a function to display the API promise results onto the page
		app.displayMedia = function (allMediaArray) {
			// This method removes child nodes from the selected element(s). In this case we remove the div that contains all previous search results.
			$('.media__container').empty();

			allMediaArray.forEach(function (singleMedia) {
				// For each result in the array returned from API#1, create variables for all html elements I'll be appending.
				var $mediaTitle = $('<h2>').addClass('media__title').text(singleMedia.Name);
				var $mediaDescription = $('<p>').addClass('media__description').text(singleMedia.wTeaser);
				var $mediaWiki = $('<a>').addClass('media__wiki').attr('href', singleMedia.wUrl).text('Wiki Page');
				var $mediaYouTube = $('<iframe>', {
					class: 'media__youtube',
					src: singleMedia.yUrl,
					id: singleMedia.yID,
					frameborder: 0,
					allowfullscreen: true,
					height: 315,
					width: 560
				});
				// console.log(app.imdbResultsArray);

				// This matches the movie or show title from API#1 with API#2. It then creates a variable for the IMDB Rating returned from API#2 and appends it to the page.
				if (app.imdbResultsArray !== undefined) {
					app.imdbResultsArray.find(function (element) {
						if (singleMedia.Name === element.Title) {
							var $mediaImdb = $('<p>').addClass('imdb-rating').text(element.imdbRating);
							// This accounts for results that do not have YouTube URLs
							if (singleMedia.yUrl === null) {
								$('.TasteDive__API-container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaImdb);
							} else {
								$('.TasteDive__API-container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube, $mediaImdb);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						$('.TasteDive__API-container').append($mediaTitle, $mediaDescription, $mediaWiki);
					} else {
						$('.TasteDive__API-container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube);
					};
				};
			});
		};
		// This is a function that displays an inline error under the search field when no results are returned from API#1 (empty array) 
	});
	// ================================================
	// Logo Animation
	// ================================================
	var logoAnimate = void 0;

	var getRandomNumber = function getRandomNumber() {
		return Math.floor(Math.random() * 256);
	};

	app.getRandomColour = function () {
		var red = getRandomNumber();
		var blue = getRandomNumber();
		var green = getRandomNumber();
		var rgb = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
		return rgb;
	};

	var canvas = document.getElementById('canvas');

	var ctx = canvas.getContext('2d');

	var topS = function topS() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		ctx.fillStyle = '#000000';
		// TOP PIECE
		ctx.moveTo(100, 100);
		ctx.lineTo(150, 75);
		ctx.lineTo(110, 110);
		// 2ND PIECE
		ctx.moveTo(110, 110);
		ctx.lineTo(120, 90);
		ctx.lineTo(150, 135);
		// 3RD PIECE
		ctx.moveTo(150, 135);
		ctx.lineTo(100, 160);
		ctx.lineTo(140, 125);
		ctx.fill();
	};

	topS();

	var oneLogoInterval = function oneLogoInterval() {
		var _loop = function _loop(i) {
			setTimeout(function () {
				topS = function topS() {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.beginPath();
					// TOP PIECE
					ctx.moveTo(100 + i, 100 - i);
					ctx.lineTo(150 + i, 75 - i);
					ctx.lineTo(110 + i, 110 - i);
					// ctx.arc((200 + i), (200 + i), 100, 1 * Math.PI, 1.7 * Math.PI);
					// 2ND PIECE
					ctx.moveTo(110 + i, 110 + i);
					ctx.lineTo(120 + i, 90 + i);
					ctx.lineTo(150 + i, 135 + i);
					// 3RD PIECE
					ctx.moveTo(150 - i, 135 + i);
					ctx.lineTo(100 - i, 160 + i);
					ctx.lineTo(140 - i, 125 + i);
					ctx.fillStyle = app.getRandomColour();
					ctx.fill();
				};
				topS();
			}, 10 + i);

			setTimeout(function () {
				topS = function topS() {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.beginPath();
					ctx.moveTo(150 - i, 50 + i);
					ctx.lineTo(200 - i, 25 + i);
					ctx.lineTo(160 - i, 60 + i);
					// ctx.arc((290 - i), (290 - i), 100, 1 * Math.PI, 1.7 * Math.PI);
					// MIDDLE PIECE
					ctx.moveTo(160 - i, 160 - i);
					ctx.lineTo(170 - i, 140 - i);
					ctx.lineTo(200 - i, 185 - i);
					// 3RD PIECE
					ctx.moveTo(100 + i, 185 - i);
					ctx.lineTo(50 + i, 210 - i);
					ctx.lineTo(90 + i, 175 - i);
					ctx.fillStyle = app.getRandomColour();
					ctx.fill();
				};

				topS();
			}, 60 + i);
		};

		for (var i = 1; i <= 50; i = i + 1) {
			_loop(i);
		};
	};

	canvas.addEventListener('mouseover', function () {
		logoAnimate = setInterval(oneLogoInterval, 110);
	});

	canvas.addEventListener('mouseout', function () {
		clearInterval(logoAnimate);
	});
};
// This runs the app
$(function () {
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxJQUFKLEdBQVcsWUFBTTtBQUNqQjtBQUNBO0FBQ0E7QUFDQztBQUNBLEtBQUksVUFBSixHQUFpQiwwQkFBakI7O0FBRUE7QUFDQSxLQUFJLE9BQUosR0FBYyxVQUFkOztBQUVBLEtBQUkscUJBQUosR0FBNEIsWUFBTTtBQUNqQztBQUNBLE1BQU0sa0JBQWtCLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0IsY0FBbEIsRUFBa0MsSUFBbEMsQ0FBdUMsbUlBQXZDLENBQXhCO0FBQ0EsVUFBUSxHQUFSLENBQVksZUFBWjtBQUNBLElBQUUsUUFBRixFQUFZLE1BQVosQ0FBbUIsZUFBbkI7QUFDQSxFQUxEO0FBTUEsU0FBUSxHQUFSLENBQVksSUFBSSxxQkFBaEI7O0FBRUE7QUFDQSxHQUFFLGNBQUYsRUFBa0IsRUFBbEIsQ0FBcUIsUUFBckIsRUFBK0IsVUFBUyxLQUFULEVBQWdCO0FBQzlDO0FBQ0EsUUFBTSxjQUFOO0FBQ0E7QUFDQSxNQUFNLFdBQVcsRUFBRSwwQkFBRixFQUE4QixHQUE5QixFQUFqQjtBQUNBO0FBQ0EsTUFBTSxZQUFZLEVBQUUsZ0JBQUYsRUFBb0IsR0FBcEIsRUFBbEI7QUFDQTtBQUNBLE1BQUksUUFBSixHQUNFLEVBQUUsSUFBRixDQUFPO0FBQ0wsUUFBSyxtQ0FEQTtBQUVMLFdBQVEsS0FGSDtBQUdMLGFBQVUsT0FITDtBQUlMLFNBQU07QUFDSixPQUFHLDBCQURDO0FBRUosWUFBTSxTQUZGO0FBR0osZUFBUyxRQUhMO0FBSUosVUFBTSxDQUpGO0FBS0osV0FBTztBQUxIO0FBSkQsR0FBUCxDQURGOztBQWNBO0FBQ0EsTUFBSSxhQUFKLEdBQW9CLFVBQUMsVUFBRCxFQUFnQjtBQUNuQztBQUNHLFVBQU8sRUFB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QUFBQSxTQUEzQixDQUEyQjtBQStDbkM7QUFDRCxFQWpERDs7QUFtREEsUUFBTyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxZQUFXO0FBQy9DLGdCQUFjLFlBQVksZUFBWixFQUE2QixHQUE3QixDQUFkO0FBQ0EsRUFGRDs7QUFJQSxRQUFPLGdCQUFQLENBQXdCLFVBQXhCLEVBQW9DLFlBQVc7QUFDOUMsZ0JBQWMsV0FBZDtBQUNBLEVBRkQ7QUFHQSxDQXJPRDtBQXNPQTtBQUNBLEVBQUUsWUFBVztBQUNaLEtBQUksSUFBSjtBQUNBLENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBDcmVhdGUgdmFyaWFibGUgZm9yIGFwcCBvYmplY3RcbmNvbnN0IGFwcCA9IHt9O1xuXG5hcHAuaW5pdCA9ICgpID0+IHtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2ltaWxhciBhbmQgT01EQiBBUElzOiBHZXQgUmVzdWx0cyBhbmQgZGlzcGxheVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIFNpbWlsYXIgQVBJIEtleVxuXHRhcHAuc2ltaWxhcktleSA9ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnO1xuXG5cdC8vIE9NREIgQVBJIEtleVxuXHRhcHAub21kYktleSA9ICcxNjYxZmE5ZCc7XG5cblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3IgZnVuY3Rpb24gd29ya3MnKVxuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHJlc3VsdHMgZm9yIHlvdXIgc2VhcmNoLiBXZSBtaWdodCBub3QgaGF2ZSByZXN1bHRzIGZvciB5b3VyIHNlYXJjaCBvciB5b3VyIHNwZWxsaW5nIGlzIHNsaWdodGx5IG9mZi4nKTtcblx0XHRjb25zb2xlLmxvZygkbm9SZXN1bHRzRXJyb3IpO1xuXHRcdCQoJyNlcnJvcicpLmFwcGVuZCgkbm9SZXN1bHRzRXJyb3IpO1xuXHR9O1xuXHRjb25zb2xlLmxvZyhhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKTtcblxuXHQvLyBFdmVudCBMaXN0ZW5lciB0byBjaW5sdWRlIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIG9uIGZvcm0gc3VibWlzc2lvblxuXHQkKCcubWVkaWFfX2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIHN1Ym1pdCBpbnB1dHNcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdC8vIEdldCB2YWx1ZSBvZiB0aGUgbWVkaWEgdHlwZSB0aGUgdXNlciBjaGVja2VkXG5cdFx0Y29uc3QgdXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIHR5cGU6IGAke3VzZXJUeXBlfWAsXG5cdFx0ICAgICAgaW5mbzogMSxcblx0XHQgICAgICBsaW1pdDogMTBcblx0XHQgICAgfVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGFzcyBtb3ZpZSB0aXRsZXMgZnJvbSBQcm9taXNlIzEgaW50byBQcm9taXNlICMyXG5cdFx0YXBwLmdldEltZGJSYXRpbmcgPSAobW92aWVUaXRsZSkgPT4ge1xuXHRcdFx0Ly8gUmV0dXJuIFByb21pc2UjMiB3aGljaCBpbmNsdWRlcyB0aGUgbW92aWUgdGl0bGUgZnJvbSBQcm9taXNlIzFcblx0XHQgICAgcmV0dXJuICQuYWpheCh7XG5cdFx0ICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdCAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICAgICAgICAgICBkYXRhOiB7XG5cdFx0ICAgICAgICAgICAgICAgYXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdCAgICAgICAgICAgICAgIHQ6IG1vdmllVGl0bGVcblx0XHQgICAgICAgICAgICAgfVxuXHRcdCAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblxuXHQgICAgICBjb25zdCBub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHQgICAgICBpZiAobm9SZXN1bHRzID09PSB0cnVlKSB7XG5cdCAgICAgIFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXHQgICAgICBcdC8vIGFsZXJ0KGBQbGVhc2UgY2hlY2sgeW91ciBzcGVsbGluZyBvciBlbnRlciBhIHZhbGlkIHRpdGxlIGZvciB5b3VyIG1lZGlhIGNhdGVnb3J5YCk7XG5cblx0ICAgICAgfTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1kZWlhIHR5cGVpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmICh1c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgdXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgfSBlbHNlIHtcblx0XHQgIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0ICAgIGFwcC5kaXNwbGF5TWVkaWEgPSAoYWxsTWVkaWFBcnJheSkgPT4ge1xuXHQgICAgXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIHNlbGVjdGVkIGVsZW1lbnQocykuIEluIHRoaXMgY2FzZSB3ZSByZW1vdmUgdGhlIGRpdiB0aGF0IGNvbnRhaW5zIGFsbCBwcmV2aW91cyBzZWFyY2ggcmVzdWx0cy5cblx0ICAgIFx0JCgnLm1lZGlhX19jb250YWluZXInKS5lbXB0eSgpO1xuXG5cdCAgICBcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0ICAgIFx0XHQvLyBGb3IgZWFjaCByZXN1bHQgaW4gdGhlIGFycmF5IHJldHVybmVkIGZyb20gQVBJIzEsIGNyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nLlxuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVRpdGxlID0gJCgnPGgyPicpLmFkZENsYXNzKCdtZWRpYV9fdGl0bGUnKS50ZXh0KHNpbmdsZU1lZGlhLk5hbWUpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpIFBhZ2UnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZSxcblx0ICAgIFx0XHRcdGhlaWdodDogMzE1LFxuXHQgICAgXHRcdFx0d2lkdGg6IDU2MFxuXHQgICAgXHRcdH0pO1xuXHQgICAgXHRcdC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblxuXHQgICAgXHRcdC8vIFRoaXMgbWF0Y2hlcyB0aGUgbW92aWUgb3Igc2hvdyB0aXRsZSBmcm9tIEFQSSMxIHdpdGggQVBJIzIuIEl0IHRoZW4gY3JlYXRlcyBhIHZhcmlhYmxlIGZvciB0aGUgSU1EQiBSYXRpbmcgcmV0dXJuZWQgZnJvbSBBUEkjMiBhbmQgYXBwZW5kcyBpdCB0byB0aGUgcGFnZS5cblx0ICAgIFx0XHRpZiAoYXBwLmltZGJSZXN1bHRzQXJyYXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdCAgICBcdFx0YXBwLmltZGJSZXN1bHRzQXJyYXkuZmluZCgoZWxlbWVudCkgPT4ge1xuXHRcdCAgICBcdFx0XHRpZiAoc2luZ2xlTWVkaWEuTmFtZSA9PT0gZWxlbWVudC5UaXRsZSkge1xuXHRcdCAgICBcdFx0XHRcdGNvbnN0ICRtZWRpYUltZGIgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW1kYi1yYXRpbmcnKS50ZXh0KGVsZW1lbnQuaW1kYlJhdGluZyk7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdCAgICBcdFx0XHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhSW1kYik7XG5cdFx0ICAgIFx0XHRcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJG1lZGlhSW1kYik7XG5cdFx0ICAgIFx0XHRcdFx0fTtcblx0XHQgICAgXHRcdFx0fTtcblx0XHQgICAgXHRcdH0pO1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhcHBlbmRzIHRoZSByZXN1bHRzIGZyb20gQVBJIzEgZm9yIG5vbi1tb3ZpZS9zaG93IG1lZGlhIHR5cGVzLlxuXHRcdCAgICBcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSk7XG5cdFx0ICAgIFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmFwcGVuZCgkbWVkaWFUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRtZWRpYVlvdVR1YmUpO1xuXHRcdCAgICBcdFx0fTtcblx0XHQgICAgXHR9O1xuXHQgICAgXHR9KTtcblx0ICAgIH07XG5cdCAgICAvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdGhhdCBkaXNwbGF5cyBhbiBpbmxpbmUgZXJyb3IgdW5kZXIgdGhlIHNlYXJjaCBmaWVsZCB3aGVuIG5vIHJlc3VsdHMgYXJlIHJldHVybmVkIGZyb20gQVBJIzEgKGVtcHR5IGFycmF5KSBcblx0fSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExvZ28gQW5pbWF0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0bGV0IGxvZ29BbmltYXRlO1xuXG5cdGNvbnN0IGdldFJhbmRvbU51bWJlciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG5cblx0YXBwLmdldFJhbmRvbUNvbG91ciA9ICgpID0+IHtcblx0XHRjb25zdCByZWQgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBibHVlID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgZ3JlZW4gPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCByZ2IgPSBgcmdiKCR7cmVkfSwgJHtncmVlbn0sICR7Ymx1ZX0pYFxuXHRcdHJldHVybiByZ2I7XG5cdH07XG5cblx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuXHRcblx0Y29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHRvcFMgPSAoKSA9PiB7XG5cdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblx0XHQvLyBUT1AgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDEwMCwgMTAwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdC8vIDJORCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDEzNSk7XG5cdFx0Ly8gM1JEIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0Y3R4LmxpbmVUbygxMDAsIDE2MCk7XG5cdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0Y3R4LmZpbGwoKTtcblx0fTtcblxuXHR0b3BTKCk7XG5cblx0bGV0IG9uZUxvZ29JbnRlcnZhbCA9ICgpID0+IHtcblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSA1MDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTAwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTEwICsgaSksICgxMTAgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gY3R4LmFyYygoMjAwICsgaSksICgyMDAgKyBpKSwgMTAwLCAxICogTWF0aC5QSSwgMS43ICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTEwICsgaSksICgxMTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTIwICsgaSksICg5MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNDAgLSBpKSwgKDEyNSArIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRvcFMoKTtcblx0XHRcdH0sICgxMCArIGkpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDUwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTYwIC0gaSksICg2MCArIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyOTAgLSBpKSwgKDI5MCAtIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyBNSURETEUgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNjAgLSBpKSwgKDE2MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNzAgLSBpKSwgKDE0MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg1MCArIGkpLCAoMjEwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDkwICsgaSksICgxNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0fSwgKDYwICsgaSkpO1xuXHRcdH07XG5cdH07XG5cdFxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG5cdFx0bG9nb0FuaW1hdGUgPSBzZXRJbnRlcnZhbChvbmVMb2dvSW50ZXJ2YWwsIDExMCk7XG5cdH0pO1xuXG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdGNsZWFySW50ZXJ2YWwobG9nb0FuaW1hdGUpO1xuXHR9KTtcbn1cbi8vIFRoaXMgcnVucyB0aGUgYXBwXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
