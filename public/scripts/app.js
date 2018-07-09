(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

// Create variable for app object
var app = {};

app.init = function () {
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
				}).fail(function (err) {
					console.log(err);
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
								$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaImdb);
							} else {
								$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube, $mediaImdb);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki);
					} else {
						$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube);
					};
				};
			});
		};
		// This is a function that displays an inline error under the search field when no results are returned from API#1 (empty array)
	});

	app.logo = function () {
		var logoAnimate = void 0;

		var getRandomNumber = function getRandomNumber() {
			return Math.floor(Math.random() * 256);
		};

		getRandomColour = function getRandomColour() {
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
						ctx.fillStyle = getRandomColour();
						ctx.fill();
					};
					topS();
				}, 10 + i);

				setTimeout(function () {
					topS = function topS() {
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctx.beginPath();
						ctx.moveTo(175 - i, 25 + i);
						ctx.lineTo(225 - i, 0 + i);
						ctx.lineTo(185 - i, 35 + i);
						// ctx.arc((290 - i), (290 - i), 100, 1 * Math.PI, 1.7 * Math.PI);
						// MIDDLE PIECE
						ctx.moveTo(185 - i, 185 - i);
						ctx.lineTo(195 - i, 165 - i);
						ctx.lineTo(225 - i, 210 - i);
						// 3RD PIECE
						ctx.moveTo(75 + i, 210 - i);
						ctx.lineTo(25 + i, 235 - i);
						ctx.lineTo(65 + i, 200 - i);
						ctx.fillStyle = getRandomColour();
						ctx.fill();
					};

					topS();
				}, 85 + i);
			};

			for (var i = 5; i <= 75; i = i + 5) {
				_loop(i);
			};
		};

		canvas.addEventListener('mouseover', function () {
			logoAnimate = setInterval(oneLogoInterval, 160);
		});

		canvas.addEventListener('mouseout', function () {
			clearInterval(logoAnimate);
			// ctx.fillStyle = '#000000';
			topS();
		});
	};

	app.logo();
};
// This runs the app
$(function () {
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxJQUFKLEdBQVcsWUFBTTtBQUNoQjtBQUNBLEtBQUksVUFBSixHQUFpQiwwQkFBakI7O0FBRUE7QUFDQSxLQUFJLE9BQUosR0FBYyxVQUFkOztBQUVBLEtBQUkscUJBQUosR0FBNEIsWUFBTTtBQUNqQztBQUNBLE1BQU0sa0JBQWtCLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0IsY0FBbEIsRUFBa0MsSUFBbEMsQ0FBdUMsbUlBQXZDLENBQXhCO0FBQ0EsVUFBUSxHQUFSLENBQVksZUFBWjtBQUNBLElBQUUsUUFBRixFQUFZLE1BQVosQ0FBbUIsZUFBbkI7QUFDQSxFQUxEO0FBTUEsU0FBUSxHQUFSLENBQVksSUFBSSxxQkFBaEI7O0FBRUE7QUFDQSxHQUFFLGNBQUYsRUFBa0IsRUFBbEIsQ0FBcUIsUUFBckIsRUFBK0IsVUFBUyxLQUFULEVBQWdCO0FBQzlDO0FBQ0EsUUFBTSxjQUFOO0FBQ0E7QUFDQSxNQUFNLFdBQVcsRUFBRSwwQkFBRixFQUE4QixHQUE5QixFQUFqQjtBQUNBO0FBQ0EsTUFBTSxZQUFZLEVBQUUsZ0JBQUYsRUFBb0IsR0FBcEIsRUFBbEI7QUFDQTtBQUNBLE1BQUksUUFBSixHQUNFLEVBQUUsSUFBRixDQUFPO0FBQ0wsUUFBSyxtQ0FEQTtBQUVMLFdBQVEsS0FGSDtBQUdMLGFBQVUsT0FITDtBQUlMLFNBQU07QUFDSixPQUFHLDBCQURDO0FBRUosWUFBTSxTQUZGO0FBR0osZUFBUyxRQUhMO0FBSUosVUFBTSxDQUpGO0FBS0osV0FBTztBQUxIO0FBSkQsR0FBUCxDQURGOztBQWNBO0FBQ0EsTUFBSSxhQUFKLEdBQW9CLFVBQUMsVUFBRCxFQUFnQjtBQUNuQztBQUNHLFVBQU8sRUFBRSxJQUFGLENBQU87QUFD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QUssRUFBckIsRUFBeUIsSUFBSSxJQUFJLENBQWpDLEVBQW9DO0FBQUEsVUFBM0IsQ0FBMkI7QUErQ25DO0FBQ0QsR0FqREQ7O0FBbURBLFNBQU8sZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBcUMsWUFBVztBQUMvQyxpQkFBYyxZQUFZLGVBQVosRUFBNkIsR0FBN0IsQ0FBZDtBQUNBLEdBRkQ7O0FBSUEsU0FBTyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxZQUFXO0FBQzlDLGlCQUFjLFdBQWQ7QUFDQTtBQUNBO0FBQ0EsR0FKRDtBQUtBLEVBbEdEOztBQW9HQSxLQUFJLElBQUo7QUFDQSxDQXpPRDtBQTBPQTtBQUNBLEVBQUUsWUFBVztBQUNaLEtBQUksSUFBSjtBQUNBLENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBDcmVhdGUgdmFyaWFibGUgZm9yIGFwcCBvYmplY3RcbmNvbnN0IGFwcCA9IHt9O1xuXG5hcHAuaW5pdCA9ICgpID0+IHtcblx0Ly8gU2ltaWxhciBBUEkgS2V5XG5cdGFwcC5zaW1pbGFyS2V5ID0gJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCc7XG5cblx0Ly8gT01EQiBBUEkgS2V5XG5cdGFwcC5vbWRiS2V5ID0gJzE2NjFmYTlkJztcblxuXHRhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yID0gKCkgPT4ge1xuXHRcdC8vIGNvbnNvbGUubG9nKCdlcnJvciBmdW5jdGlvbiB3b3JrcycpXG5cdFx0Y29uc3QgJG5vUmVzdWx0c0Vycm9yID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2lubGluZS1lcnJvcicpLnRleHQoJ1NvcnJ5LCB3ZSBhcmUgdW5hYmxlIHRvIGZpbmQgcmVzdWx0cyBmb3IgeW91ciBzZWFyY2guIFdlIG1pZ2h0IG5vdCBoYXZlIHJlc3VsdHMgZm9yIHlvdXIgc2VhcmNoIG9yIHlvdXIgc3BlbGxpbmcgaXMgc2xpZ2h0bHkgb2ZmLicpO1xuXHRcdGNvbnNvbGUubG9nKCRub1Jlc3VsdHNFcnJvcik7XG5cdFx0JCgnI2Vycm9yJykuYXBwZW5kKCRub1Jlc3VsdHNFcnJvcik7XG5cdH07XG5cdGNvbnNvbGUubG9nKGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IpO1xuXG5cdC8vIEV2ZW50IExpc3RlbmVyIHRvIGNpbmx1ZGUgZXZlcnl0aGluZyB0aGF0IGhhcHBlbnMgb24gZm9ybSBzdWJtaXNzaW9uXG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIFByZXZlbnQgZGVmYXVsdCBmb3Igc3VibWl0IGlucHV0c1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Ly8gR2V0IHZhbHVlIG9mIHRoZSBtZWRpYSB0eXBlIHRoZSB1c2VyIGNoZWNrZWRcblx0XHRjb25zdCB1c2VyVHlwZSA9ICQoJ2lucHV0W25hbWU9dHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuXHRcdC8vIEdldCB0aGUgdmFsdWUgb2Ygd2hhdCB0aGUgdXNlciBlbnRlcmVkIGluIHRoZSBzZWFyY2ggZmllbGRcblx0XHRjb25zdCB1c2VySW5wdXQgPSAkKCcjbWVkaWFfX3NlYXJjaCcpLnZhbCgpO1xuXHRcdC8vIFByb21pc2UgZm9yIEFQSSMxXG5cdFx0YXBwLmdldE1lZGlhID1cblx0XHQgICQuYWpheCh7XG5cdFx0ICAgIHVybDogJ2h0dHBzOi8vdGFzdGVkaXZlLmNvbS9hcGkvc2ltaWxhcicsXG5cdFx0ICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuXHRcdCAgICBkYXRhOiB7XG5cdFx0ICAgICAgazogJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCcsXG5cdFx0ICAgICAgcTogYCR7dXNlcklucHV0fWAsXG5cdFx0ICAgICAgdHlwZTogYCR7dXNlclR5cGV9YCxcblx0XHQgICAgICBpbmZvOiAxLFxuXHRcdCAgICAgIGxpbWl0OiAxMFxuXHRcdCAgICB9XG5cdFx0fSk7XG5cblx0XHQvLyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBwYXNzIG1vdmllIHRpdGxlcyBmcm9tIFByb21pc2UjMSBpbnRvIFByb21pc2UgIzJcblx0XHRhcHAuZ2V0SW1kYlJhdGluZyA9IChtb3ZpZVRpdGxlKSA9PiB7XG5cdFx0XHQvLyBSZXR1cm4gUHJvbWlzZSMyIHdoaWNoIGluY2x1ZGVzIHRoZSBtb3ZpZSB0aXRsZSBmcm9tIFByb21pc2UjMVxuXHRcdCAgICByZXR1cm4gJC5hamF4KHtcblx0XHQgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5vbWRiYXBpLmNvbScsXG5cdFx0ICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgICAgICAgICAgIGRhdGE6IHtcblx0XHQgICAgICAgICAgICAgICBhcGlrZXk6ICcxNjYxZmE5ZCcsXG5cdFx0ICAgICAgICAgICAgICAgdDogbW92aWVUaXRsZVxuXHRcdCAgICAgICAgICAgICB9XG5cdFx0ICAgICAgICAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblxuXHQgICAgICBjb25zdCBub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHQgICAgICBpZiAobm9SZXN1bHRzID09PSB0cnVlKSB7XG5cdCAgICAgIFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXHQgICAgICBcdC8vIGFsZXJ0KGBQbGVhc2UgY2hlY2sgeW91ciBzcGVsbGluZyBvciBlbnRlciBhIHZhbGlkIHRpdGxlIGZvciB5b3VyIG1lZGlhIGNhdGVnb3J5YCk7XG5cblx0ICAgICAgfTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1kZWlhIHR5cGVpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmICh1c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgdXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICAgICAgXHRjb25zb2xlLmxvZyhlcnIpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgfSBlbHNlIHtcblx0XHQgIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0ICAgIGFwcC5kaXNwbGF5TWVkaWEgPSAoYWxsTWVkaWFBcnJheSkgPT4ge1xuXHQgICAgXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIHNlbGVjdGVkIGVsZW1lbnQocykuIEluIHRoaXMgY2FzZSB3ZSByZW1vdmUgdGhlIGRpdiB0aGF0IGNvbnRhaW5zIGFsbCBwcmV2aW91cyBzZWFyY2ggcmVzdWx0cy5cblx0ICAgIFx0JCgnLm1lZGlhX19jb250YWluZXInKS5lbXB0eSgpO1xuXG5cdCAgICBcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0ICAgIFx0XHQvLyBGb3IgZWFjaCByZXN1bHQgaW4gdGhlIGFycmF5IHJldHVybmVkIGZyb20gQVBJIzEsIGNyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nLlxuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVRpdGxlID0gJCgnPGgyPicpLmFkZENsYXNzKCdtZWRpYV9fdGl0bGUnKS50ZXh0KHNpbmdsZU1lZGlhLk5hbWUpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpIFBhZ2UnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZSxcblx0ICAgIFx0XHRcdGhlaWdodDogMzE1LFxuXHQgICAgXHRcdFx0d2lkdGg6IDU2MFxuXHQgICAgXHRcdH0pO1xuXHQgICAgXHRcdC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblxuXHQgICAgXHRcdC8vIFRoaXMgbWF0Y2hlcyB0aGUgbW92aWUgb3Igc2hvdyB0aXRsZSBmcm9tIEFQSSMxIHdpdGggQVBJIzIuIEl0IHRoZW4gY3JlYXRlcyBhIHZhcmlhYmxlIGZvciB0aGUgSU1EQiBSYXRpbmcgcmV0dXJuZWQgZnJvbSBBUEkjMiBhbmQgYXBwZW5kcyBpdCB0byB0aGUgcGFnZS5cblx0ICAgIFx0XHRpZiAoYXBwLmltZGJSZXN1bHRzQXJyYXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdCAgICBcdFx0YXBwLmltZGJSZXN1bHRzQXJyYXkuZmluZCgoZWxlbWVudCkgPT4ge1xuXHRcdCAgICBcdFx0XHRpZiAoc2luZ2xlTWVkaWEuTmFtZSA9PT0gZWxlbWVudC5UaXRsZSkge1xuXHRcdCAgICBcdFx0XHRcdGNvbnN0ICRtZWRpYUltZGIgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW1kYi1yYXRpbmcnKS50ZXh0KGVsZW1lbnQuaW1kYlJhdGluZyk7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdCAgICBcdFx0XHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdFx0XHQkKCcubWVkaWFfX2NvbnRhaW5lcicpLmFwcGVuZCgkbWVkaWFUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRtZWRpYUltZGIpO1xuXHRcdCAgICBcdFx0XHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHRcdFx0JCgnLm1lZGlhX19jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlLCAkbWVkaWFJbWRiKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSk7XG5cdFx0ICAgIFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0JCgnLm1lZGlhX19jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlKTtcblx0XHQgICAgXHRcdH07XG5cdFx0ICAgIFx0fTtcblx0ICAgIFx0fSk7XG5cdCAgICB9O1xuXHQgICAgLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgYW4gaW5saW5lIGVycm9yIHVuZGVyIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBubyByZXN1bHRzIGFyZSByZXR1cm5lZCBmcm9tIEFQSSMxIChlbXB0eSBhcnJheSlcblx0ICAgIFxuXHR9KTtcblx0XG5cdGFwcC5sb2dvID0gKCkgPT4ge1xuXHRcdGxldCBsb2dvQW5pbWF0ZTtcblxuXHRcdGNvbnN0IGdldFJhbmRvbU51bWJlciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG5cblx0XHRnZXRSYW5kb21Db2xvdXIgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCByZWQgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRcdGNvbnN0IGJsdWUgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRcdGNvbnN0IGdyZWVuID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0XHRjb25zdCByZ2IgPSBgcmdiKCR7cmVkfSwgJHtncmVlbn0sICR7Ymx1ZX0pYFxuXHRcdFx0cmV0dXJuIHJnYjtcblx0XHR9O1xuXG5cdFx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuXHRcdFxuXHRcdGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdFx0bGV0IHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0XHRjdHguZmlsbCgpO1xuXHRcdH07XG5cblx0XHR0b3BTKCk7XG5cblx0XHRsZXQgb25lTG9nb0ludGVydmFsID0gKCkgPT4ge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDU7IGkgPD0gNzU7IGkgPSBpICsgNSkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDEwMCAtIGkpKTtcblx0XHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0XHRjdHgubGluZVRvKCgxMTAgKyBpKSwgKDExMCAtIGkpKTtcblx0XHRcdFx0XHRcdC8vIGN0eC5hcmMoKDIwMCArIGkpLCAoMjAwICsgaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMTAgKyBpKSwgKDExMCArIGkpKTtcblx0XHRcdFx0XHRcdGN0eC5saW5lVG8oKDEyMCArIGkpLCAoOTAgKyBpKSk7XG5cdFx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTUwIC0gaSksICgxMzUgKyBpKSk7XG5cdFx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRcdGN0eC5saW5lVG8oKDE0MCAtIGkpLCAoMTI1ICsgaSkpO1xuXHRcdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdHRvcFMoKTtcblx0XHRcdFx0fSwgKDEwICsgaSkpO1xuXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNzUgLSBpKSwgKDI1ICsgaSkpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjI1IC0gaSksICgwICsgaSkpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTg1IC0gaSksICgzNSArIGkpKTtcblx0XHRcdFx0XHRcdC8vIGN0eC5hcmMoKDI5MCAtIGkpLCAoMjkwIC0gaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdFx0Ly8gTUlERExFIFBJRUNFXG5cdFx0XHRcdFx0XHRjdHgubW92ZVRvKCgxODUgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRcdGN0eC5saW5lVG8oKDE5NSAtIGkpLCAoMTY1IC0gaSkpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjI1IC0gaSksICgyMTAgLSBpKSk7XG5cdFx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDc1ICsgaSksICgyMTAgLSBpKSk7XG5cdFx0XHRcdFx0XHRjdHgubGluZVRvKCgyNSArIGkpLCAoMjM1IC0gaSkpO1xuXHRcdFx0XHRcdFx0Y3R4LmxpbmVUbygoNjUgKyBpKSwgKDIwMCAtIGkpKTtcblx0XHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBnZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0XHR9LCAoODUgKyBpKSk7XG5cdFx0XHR9O1xuXHRcdH07XG5cdFx0XG5cdFx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuXHRcdFx0bG9nb0FuaW1hdGUgPSBzZXRJbnRlcnZhbChvbmVMb2dvSW50ZXJ2YWwsIDE2MCk7XG5cdFx0fSk7XG5cblx0XHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRcdGNsZWFySW50ZXJ2YWwobG9nb0FuaW1hdGUpO1xuXHRcdFx0Ly8gY3R4LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcblx0XHRcdHRvcFMoKTtcblx0XHR9KTtcblx0fTtcblxuXHRhcHAubG9nbygpO1xufVxuLy8gVGhpcyBydW5zIHRoZSBhcHBcbiQoZnVuY3Rpb24oKSB7XG5cdGFwcC5pbml0KCk7XG59KTsiXX0=
