(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

// Create variable for app object
var app = {};

app.config = function () {
	var config = {
		apiKey: "AIzaSyAe_LqYLVm-oVsk9GDEkZ9_F1phWiSosLY",
		authDomain: "js-summer-project3.firebaseapp.com",
		databaseURL: "https://js-summer-project3.firebaseio.com",
		projectId: "js-summer-project3",
		storageBucket: "",
		messagingSenderId: "1047793034155"
	};
	//This will initialize firebase with our config object
	firebase.initializeApp(config);
	// This method creates a new connection to the database
	app.database = firebase.database();
	// This creates a reference to a location in the database. I only need one for this project to store the media list
	app.mediaList = app.database.ref('/mediaList');
};

app.init = function () {
	// ================================================
	// Similar and OMDB APIs: Get Results and display
	// ================================================
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';
	// Firebase variables
	var mediaTypeElement = $('.media__type');
	var mediaTitleElement = $('.media__title');

	var mediaContainer = $('.TasteDive__API-container');
	var favouritesList = $('.favourites-list__list');
	// This is a function that displays an inline error under the search field when no results are returned from API#1 (empty array)
	app.displayNoResultsError = function () {
		// console.log('error function works')
		var $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find results for your search. We might not have results for your search or your spelling is slightly off.');
		console.log($noResultsError);
		$('#error').append($noResultsError);
	};
	// console.log(app.displayNoResultsError);

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
				q: "" + userInput,
				type: "" + userType,
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
			$('.TasteDive__API-container').empty();

			allMediaArray.forEach(function (singleMedia) {
				// For each result in the array returned from API#1, create variables for all html elements I'll be appending.
				var $mediaType = $('<h2>').addClass('media__type').text(singleMedia.Type);
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

				var $addButton = $('<input>').attr({
					type: 'button',
					value: 'Add to List',
					form: 'add-button-form',
					class: 'add-button'
				});
				// ???IS THERE A WAY TO APPEND AN INPUT INSIDE OF A FORM??? IF NOT< JUST DO INPUT AND USE 'onCLick' event listener to submit the media typeand title to Firebase.

				var $addForm = "<form id=\"add-button-form\">" + $addButton + "</form>";

				// console.log(app.imdbResultsArray);

				// This matches the movie or show title from API#1 with API#2. It then creates a variable for the IMDB Rating returned from API#2 and appends it to the page.
				if (app.imdbResultsArray !== undefined) {
					app.imdbResultsArray.find(function (element) {
						if (singleMedia.Name === element.Title) {
							var $mediaImdb = $('<p>').addClass('imdb-rating').text(element.imdbRating);
							// This accounts for results that do not have YouTube URLs
							if (singleMedia.yUrl === null) {
								$('.TasteDive__API-container').append($mediaType, $mediaTitle, $mediaDescription, $mediaWiki, $mediaImdb, $addButton);
								// $('#add-button-form').append($addButton);
							} else {
								$('.TasteDive__API-container').append($mediaType, $mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube, $mediaImdb, $addButton);
								// $('#add-button-form').append($addButton);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						$('.TasteDive__API-container').append($mediaType, $mediaTitle, $mediaDescription, $mediaWiki, $addButton);
						// $('#add-button-form').append($addButton);
					} else {
						$('.TasteDive__API-container').append($mediaType, $mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube, $addButton);
						// $('#add-button-form').append($addButton)
					};
				};
			});
		};
	});
	// ================================================
	// Firebase: Media Favourites List
	// ================================================
	// Event listener for adding media type and title to the list submitting the form/printing the list
	mediaContainer.on('click', '.add-button', function (e) {
		// This variable stores the element(s) in the form I want to get value(s) from. In this case it the p representing the media title and the p representing the media type.
		var type = $(this).prevAll('.media__type')[0].innerText;
		var title = $(this).prevAll('.media__title')[0].innerText;
		console.log(type);

		var mediaObject = {
			type: type,
			title: title
			// Add the information to Firebase
		};app.mediaList.push(mediaObject);
	});
	// console.log(app.mediaList);
	// Get the type and title information from Firebase
	app.mediaList.limitToLast(10).on('child_added', function (mediaInfo) {
		// console.log(mediaInfo);
		var data = mediaInfo.val();
		var mediaTypeFB = data.type;
		var mediaTitleFB = data.title;
		var key = mediaInfo.key;
		// Create List Item taht includes the type and title
		var li = "<li id=\"key-" + key + "\">\n    \t\t\t\t\t<strong>" + mediaTypeFB + ":</strong>\n    \t\t\t\t\t<p>" + mediaTitleFB + "</p>\n    \t\t\t\t\t<button id=\"" + key + "\" class=\"delete\"><i class=\"fas fa-times-circle\"></i></button>\n    \t\t\t\t</li>";
		favouritesList.append(li);
		favouritesList[0].scrollTop = favouritesList[0].scrollHeight;
	});
	// Remove list item from Firebase when the delete icon is clicked
	favouritesList.on('click', '.delete', function () {
		var id = $(this).attr('id');

		app.database.ref("/mediaList/" + id).remove();
	});

	// Remove all items from Firebase when the Clear button is clicked
	$('.clear-list').on('click', function () {
		app.database.ref("/mediaList").set(null);
	});
	// Remove list item from the front end append
	app.mediaList.limitToLast(10).on('child_removed', function (listItems) {
		// console.log(favouritesList.find(listItems.key));
		favouritesList.find("#key-" + listItems.key).remove();
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
		var rgb = "rgb(" + red + ", " + green + ", " + blue + ")";
		return rgb;
	};

	var canvas = document.getElementById('canvas');

	var ctx = canvas.getContext('2d');

	var topS = function topS() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// OUTER CIRCLE
		ctx.beginPath();
		ctx.lineWidth = 10;
		ctx.strokeStyle = '#000';
		ctx.arc(125, 117, 50, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.closePath();
		// TOP PIECE
		ctx.beginPath();
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
		ctx.fillStyle = '#000';
		ctx.fill();
	};

	topS();

	var oneLogoInterval = function oneLogoInterval() {
		var _loop = function _loop(i) {
			setTimeout(function () {
				topS = function topS() {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					// OUTER CIRCLE
					ctx.beginPath();
					ctx.lineWidth = 10;
					ctx.strokeStyle = app.getRandomColour();
					ctx.arc(125, 117, 110, 0, 2 * Math.PI);
					ctx.stroke();
					ctx.closePath();
					// TOP PIECE
					ctx.beginPath();
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
			}, i);

			setTimeout(function () {
				topS = function topS() {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					// OUTER CIRCLE
					ctx.beginPath();
					ctx.lineWidth = 10;
					ctx.strokeStyle = app.getRandomColour();
					ctx.arc(125, 117, 110, 0, 2 * Math.PI);
					ctx.stroke();
					ctx.closePath();
					// TOP PIECE
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
			}, 50 + i);
		};

		for (var i = 1; i <= 50; i = i + 1) {
			_loop(i);
		};
	};

	canvas.addEventListener('mouseover', function () {
		logoAnimate = setInterval(oneLogoInterval, 100);
	});

	canvas.addEventListener('mouseout', function () {
		ctx.arc(125, 117, 60, 0, 2 * Math.PI);
		clearInterval(logoAnimate);
		setTimeout(function () {
			// ctx.clearRect(0, 0,  canvas.width, canvas.height);
			// ctx.arc(125, 117, 60, 0, 2 * Math.PI);
			topS = function topS() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				// OUTER CIRCLE
				ctx.beginPath();
				ctx.lineWidth = 10;
				ctx.strokeStyle = '#000';
				ctx.arc(125, 117, 50, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.closePath();
				// TOP PIECE
				ctx.beginPath();
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
				ctx.fillStyle = '#000';
				ctx.fill();
			};
			topS();
		}, 100);
	});
};
// This runs the app
$(function () {
	app.config();
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1QyxtSUFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixF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InNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ3JlYXRlIHZhcmlhYmxlIGZvciBhcHAgb2JqZWN0XG5jb25zdCBhcHAgPSB7fTtcblxuYXBwLmNvbmZpZyA9ICgpID0+IHsgICBcbiAgICBjb25zdCBjb25maWcgPSB7XG5cdCAgICBhcGlLZXk6IFwiQUl6YVN5QWVfTHFZTFZtLW9Wc2s5R0RFa1o5X0YxcGhXaVNvc0xZXCIsXG5cdCAgICBhdXRoRG9tYWluOiBcImpzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWFwcC5jb21cIixcblx0ICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vanMtc3VtbWVyLXByb2plY3QzLmZpcmViYXNlaW8uY29tXCIsXG5cdCAgICBwcm9qZWN0SWQ6IFwianMtc3VtbWVyLXByb2plY3QzXCIsXG5cdCAgICBzdG9yYWdlQnVja2V0OiBcIlwiLFxuXHQgICAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiMTA0Nzc5MzAzNDE1NVwiXG5cdH07XG4gICAgLy9UaGlzIHdpbGwgaW5pdGlhbGl6ZSBmaXJlYmFzZSB3aXRoIG91ciBjb25maWcgb2JqZWN0XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgIC8vIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgY29ubmVjdGlvbiB0byB0aGUgZGF0YWJhc2VcbiAgICBhcHAuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgIC8vIFRoaXMgY3JlYXRlcyBhIHJlZmVyZW5jZSB0byBhIGxvY2F0aW9uIGluIHRoZSBkYXRhYmFzZS4gSSBvbmx5IG5lZWQgb25lIGZvciB0aGlzIHByb2plY3QgdG8gc3RvcmUgdGhlIG1lZGlhIGxpc3RcbiAgICBhcHAubWVkaWFMaXN0ID0gYXBwLmRhdGFiYXNlLnJlZignL21lZGlhTGlzdCcpO1xufTtcblxuYXBwLmluaXQgPSAoKSA9PiB7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNpbWlsYXIgYW5kIE9NREIgQVBJczogR2V0IFJlc3VsdHMgYW5kIGRpc3BsYXlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBTaW1pbGFyIEFQSSBLZXlcblx0YXBwLnNpbWlsYXJLZXkgPSAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJztcblxuXHQvLyBPTURCIEFQSSBLZXlcblx0YXBwLm9tZGJLZXkgPSAnMTY2MWZhOWQnO1xuXHQvLyBGaXJlYmFzZSB2YXJpYWJsZXNcblx0Y29uc3QgbWVkaWFUeXBlRWxlbWVudCA9ICQoJy5tZWRpYV9fdHlwZScpXG5cdGNvbnN0IG1lZGlhVGl0bGVFbGVtZW50ID0gJCgnLm1lZGlhX190aXRsZScpO1xuXG5cdGNvbnN0IG1lZGlhQ29udGFpbmVyID0gJCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpO1xuXHRjb25zdCBmYXZvdXJpdGVzTGlzdCA9ICQoJy5mYXZvdXJpdGVzLWxpc3RfX2xpc3QnKTtcblx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgYW4gaW5saW5lIGVycm9yIHVuZGVyIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBubyByZXN1bHRzIGFyZSByZXR1cm5lZCBmcm9tIEFQSSMxIChlbXB0eSBhcnJheSlcblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3IgZnVuY3Rpb24gd29ya3MnKVxuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHJlc3VsdHMgZm9yIHlvdXIgc2VhcmNoLiBXZSBtaWdodCBub3QgaGF2ZSByZXN1bHRzIGZvciB5b3VyIHNlYXJjaCBvciB5b3VyIHNwZWxsaW5nIGlzIHNsaWdodGx5IG9mZi4nKTtcblx0XHRjb25zb2xlLmxvZygkbm9SZXN1bHRzRXJyb3IpO1xuXHRcdCQoJyNlcnJvcicpLmFwcGVuZCgkbm9SZXN1bHRzRXJyb3IpO1xuXHR9O1xuXHQvLyBjb25zb2xlLmxvZyhhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKTtcblxuXHQvLyBFdmVudCBMaXN0ZW5lciB0byBjaW5sdWRlIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIG9uIGZvcm0gc3VibWlzc2lvblxuXHQkKCcubWVkaWFfX2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIHN1Ym1pdCBpbnB1dHNcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdC8vIEdldCB2YWx1ZSBvZiB0aGUgbWVkaWEgdHlwZSB0aGUgdXNlciBjaGVja2VkXG5cdFx0Y29uc3QgdXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIHR5cGU6IGAke3VzZXJUeXBlfWAsXG5cdFx0ICAgICAgaW5mbzogMSxcblx0XHQgICAgICBsaW1pdDogMTBcblx0XHQgICAgfVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGFzcyBtb3ZpZSB0aXRsZXMgZnJvbSBQcm9taXNlIzEgaW50byBQcm9taXNlICMyXG5cdFx0YXBwLmdldEltZGJSYXRpbmcgPSAobW92aWVUaXRsZSkgPT4ge1xuXHRcdFx0Ly8gUmV0dXJuIFByb21pc2UjMiB3aGljaCBpbmNsdWRlcyB0aGUgbW92aWUgdGl0bGUgZnJvbSBQcm9taXNlIzFcblx0XHQgICAgcmV0dXJuICQuYWpheCh7XG5cdFx0ICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdCAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICAgICAgICAgICBkYXRhOiB7XG5cdFx0ICAgICAgICAgICAgICAgYXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdCAgICAgICAgICAgICAgIHQ6IG1vdmllVGl0bGVcblx0XHQgICAgICAgICAgICAgfVxuXHRcdCAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblxuXHQgICAgICBjb25zdCBub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHQgICAgICBpZiAobm9SZXN1bHRzID09PSB0cnVlKSB7XG5cdCAgICAgIFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXHQgICAgICBcdC8vIGFsZXJ0KGBQbGVhc2UgY2hlY2sgeW91ciBzcGVsbGluZyBvciBlbnRlciBhIHZhbGlkIHRpdGxlIGZvciB5b3VyIG1lZGlhIGNhdGVnb3J5YCk7XG5cblx0ICAgICAgfTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1kZWlhIHR5cGVpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmICh1c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgdXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgfSBlbHNlIHtcblx0XHQgIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0ICAgIGFwcC5kaXNwbGF5TWVkaWEgPSAoYWxsTWVkaWFBcnJheSkgPT4ge1xuXHQgICAgXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIHNlbGVjdGVkIGVsZW1lbnQocykuIEluIHRoaXMgY2FzZSB3ZSByZW1vdmUgdGhlIGRpdiB0aGF0IGNvbnRhaW5zIGFsbCBwcmV2aW91cyBzZWFyY2ggcmVzdWx0cy5cblx0ICAgIFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmVtcHR5KCk7XG5cblx0ICAgIFx0YWxsTWVkaWFBcnJheS5mb3JFYWNoKChzaW5nbGVNZWRpYSkgPT4ge1xuXHQgICAgXHRcdC8vIEZvciBlYWNoIHJlc3VsdCBpbiB0aGUgYXJyYXkgcmV0dXJuZWQgZnJvbSBBUEkjMSwgY3JlYXRlIHZhcmlhYmxlcyBmb3IgYWxsIGh0bWwgZWxlbWVudHMgSSdsbCBiZSBhcHBlbmRpbmcuXG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhVHlwZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3R5cGUnKS50ZXh0KHNpbmdsZU1lZGlhLlR5cGUpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVRpdGxlID0gJCgnPGgyPicpLmFkZENsYXNzKCdtZWRpYV9fdGl0bGUnKS50ZXh0KHNpbmdsZU1lZGlhLk5hbWUpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpIFBhZ2UnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZSxcblx0ICAgIFx0XHRcdGhlaWdodDogMzE1LFxuXHQgICAgXHRcdFx0d2lkdGg6IDU2MFxuXHQgICAgXHRcdH0pO1x0XG5cblx0ICAgIFx0XHRjb25zdCAkYWRkQnV0dG9uID0gJCgnPGlucHV0PicpLmF0dHIoe1xuXHQgICAgXHRcdFx0dHlwZTogJ2J1dHRvbicsXG5cdCAgICBcdFx0XHR2YWx1ZTogJ0FkZCB0byBMaXN0Jyxcblx0ICAgIFx0XHRcdGZvcm06ICdhZGQtYnV0dG9uLWZvcm0nLFxuXHQgICAgXHRcdFx0Y2xhc3M6ICdhZGQtYnV0dG9uJ1xuXHQgICAgXHRcdH0pO1xuXHQgICAgXHRcdC8vID8/P0lTIFRIRVJFIEEgV0FZIFRPIEFQUEVORCBBTiBJTlBVVCBJTlNJREUgT0YgQSBGT1JNPz8/IElGIE5PVDwgSlVTVCBETyBJTlBVVCBBTkQgVVNFICdvbkNMaWNrJyBldmVudCBsaXN0ZW5lciB0byBzdWJtaXQgdGhlIG1lZGlhIHR5cGVhbmQgdGl0bGUgdG8gRmlyZWJhc2UuXG5cblx0ICAgIFx0XHRjb25zdCAkYWRkRm9ybSA9IGA8Zm9ybSBpZD1cImFkZC1idXR0b24tZm9ybVwiPiR7JGFkZEJ1dHRvbn08L2Zvcm0+YDtcblx0ICAgIFx0XHRcblx0ICAgIFx0XHQvLyBjb25zb2xlLmxvZyhhcHAuaW1kYlJlc3VsdHNBcnJheSk7XG5cblx0ICAgIFx0XHQvLyBUaGlzIG1hdGNoZXMgdGhlIG1vdmllIG9yIHNob3cgdGl0bGUgZnJvbSBBUEkjMSB3aXRoIEFQSSMyLiBJdCB0aGVuIGNyZWF0ZXMgYSB2YXJpYWJsZSBmb3IgdGhlIElNREIgUmF0aW5nIHJldHVybmVkIGZyb20gQVBJIzIgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIHBhZ2UuXG5cdCAgICBcdFx0aWYgKGFwcC5pbWRiUmVzdWx0c0FycmF5ICE9PSB1bmRlZmluZWQpIHtcblx0XHQgICAgXHRcdGFwcC5pbWRiUmVzdWx0c0FycmF5LmZpbmQoKGVsZW1lbnQpID0+IHtcblx0XHQgICAgXHRcdFx0aWYgKHNpbmdsZU1lZGlhLk5hbWUgPT09IGVsZW1lbnQuVGl0bGUpIHtcblx0XHQgICAgXHRcdFx0XHRjb25zdCAkbWVkaWFJbWRiID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2ltZGItcmF0aW5nJykudGV4dChlbGVtZW50LmltZGJSYXRpbmcpO1xuXHRcdCAgICBcdFx0XHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmFwcGVuZCgkbWVkaWFUeXBlLCAkbWVkaWFUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRtZWRpYUltZGIsICRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0XHRcdFx0Ly8gJCgnI2FkZC1idXR0b24tZm9ybScpLmFwcGVuZCgkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0XHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVHlwZSwgJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlLCAkbWVkaWFJbWRiLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHQvLyAkKCcjYWRkLWJ1dHRvbi1mb3JtJykuYXBwZW5kKCRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0XHRcdH07XG5cdFx0ICAgIFx0XHRcdH07XG5cdFx0ICAgIFx0XHR9KTtcblx0XHQgICAgXHRcdC8vIFRoaXMgYXBwZW5kcyB0aGUgcmVzdWx0cyBmcm9tIEFQSSMxIGZvciBub24tbW92aWUvc2hvdyBtZWRpYSB0eXBlcy5cblx0XHQgICAgXHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdCAgICBcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmFwcGVuZCgkbWVkaWFUeXBlLCAkbWVkaWFUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0XHQvLyAkKCcjYWRkLWJ1dHRvbi1mb3JtJykuYXBwZW5kKCRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVHlwZSwgJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdC8vICQoJyNhZGQtYnV0dG9uLWZvcm0nKS5hcHBlbmQoJGFkZEJ1dHRvbilcblx0XHQgICAgXHRcdH07XG5cdFx0ICAgIFx0fTtcblx0ICAgIFx0fSk7XG5cdCAgICB9O1xuXHQgICAgXG5cdH0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGaXJlYmFzZTogTWVkaWEgRmF2b3VyaXRlcyBMaXN0XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gRXZlbnQgbGlzdGVuZXIgZm9yIGFkZGluZyBtZWRpYSB0eXBlIGFuZCB0aXRsZSB0byB0aGUgbGlzdCBzdWJtaXR0aW5nIHRoZSBmb3JtL3ByaW50aW5nIHRoZSBsaXN0XG4gICAgbWVkaWFDb250YWluZXIub24oJ2NsaWNrJywgJy5hZGQtYnV0dG9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgIC8vIFRoaXMgdmFyaWFibGUgc3RvcmVzIHRoZSBlbGVtZW50KHMpIGluIHRoZSBmb3JtIEkgd2FudCB0byBnZXQgdmFsdWUocykgZnJvbS4gSW4gdGhpcyBjYXNlIGl0IHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdGl0bGUgYW5kIHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdHlwZS5cbiAgICAgICAgY29uc3QgdHlwZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190eXBlJylbMF0uaW5uZXJUZXh0O1xuICAgICAgICBjb25zdCB0aXRsZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190aXRsZScpWzBdLmlubmVyVGV4dDtcbiAgICAgICAgY29uc29sZS5sb2codHlwZSk7XG5cbiAgICAgICAgY29uc3QgbWVkaWFPYmplY3QgPSB7XG4gICAgICAgIFx0dHlwZSxcbiAgICAgICAgXHR0aXRsZVxuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCB0aGUgaW5mb3JtYXRpb24gdG8gRmlyZWJhc2VcbiAgICAgICAgYXBwLm1lZGlhTGlzdC5wdXNoKG1lZGlhT2JqZWN0KTtcbiAgICB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhhcHAubWVkaWFMaXN0KTtcbiAgICAvLyBHZXQgdGhlIHR5cGUgYW5kIHRpdGxlIGluZm9ybWF0aW9uIGZyb20gRmlyZWJhc2VcbiAgICBhcHAubWVkaWFMaXN0LmxpbWl0VG9MYXN0KDEwKS5vbignY2hpbGRfYWRkZWQnLGZ1bmN0aW9uKG1lZGlhSW5mbykge1xuICAgIFx0Ly8gY29uc29sZS5sb2cobWVkaWFJbmZvKTtcbiAgICBcdGNvbnN0IGRhdGEgPSBtZWRpYUluZm8udmFsKCk7XG4gICAgXHRjb25zdCBtZWRpYVR5cGVGQiA9IGRhdGEudHlwZTtcbiAgICBcdGNvbnN0IG1lZGlhVGl0bGVGQiA9IGRhdGEudGl0bGU7XG4gICAgXHRjb25zdCBrZXkgPSBtZWRpYUluZm8ua2V5O1xuICAgIFx0Ly8gQ3JlYXRlIExpc3QgSXRlbSB0YWh0IGluY2x1ZGVzIHRoZSB0eXBlIGFuZCB0aXRsZVxuICAgIFx0Y29uc3QgbGkgPSBgPGxpIGlkPVwia2V5LSR7a2V5fVwiPlxuICAgIFx0XHRcdFx0XHQ8c3Ryb25nPiR7bWVkaWFUeXBlRkJ9Ojwvc3Ryb25nPlxuICAgIFx0XHRcdFx0XHQ8cD4ke21lZGlhVGl0bGVGQn08L3A+XG4gICAgXHRcdFx0XHRcdDxidXR0b24gaWQ9XCIke2tleX1cIiBjbGFzcz1cImRlbGV0ZVwiPjxpIGNsYXNzPVwiZmFzIGZhLXRpbWVzLWNpcmNsZVwiPjwvaT48L2J1dHRvbj5cbiAgICBcdFx0XHRcdDwvbGk+YFxuICAgIFx0ZmF2b3VyaXRlc0xpc3QuYXBwZW5kKGxpKTtcbiAgICBcdGZhdm91cml0ZXNMaXN0WzBdLnNjcm9sbFRvcCA9IGZhdm91cml0ZXNMaXN0WzBdLnNjcm9sbEhlaWdodDtcbiAgICB9KTtcbiAgICAvLyBSZW1vdmUgbGlzdCBpdGVtIGZyb20gRmlyZWJhc2Ugd2hlbiB0aGUgZGVsZXRlIGljb24gaXMgY2xpY2tlZFxuICAgIGZhdm91cml0ZXNMaXN0Lm9uKCdjbGljaycsICcuZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgXHRjb25zdCBpZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICBcdFxuICAgIFx0YXBwLmRhdGFiYXNlLnJlZihgL21lZGlhTGlzdC8ke2lkfWApLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIENsZWFyIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgJCgnLmNsZWFyLWxpc3QnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3RgKS5zZXQobnVsbCk7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIHRoZSBmcm9udCBlbmQgYXBwZW5kXG4gICAgYXBwLm1lZGlhTGlzdC5saW1pdFRvTGFzdCgxMCkub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdC8vIGNvbnNvbGUubG9nKGZhdm91cml0ZXNMaXN0LmZpbmQobGlzdEl0ZW1zLmtleSkpO1xuXHRmYXZvdXJpdGVzTGlzdC5maW5kKGAja2V5LSR7bGlzdEl0ZW1zLmtleX1gKS5yZW1vdmUoKTtcblx0fSk7XHRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTG9nbyBBbmltYXRpb25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRsZXQgbG9nb0FuaW1hdGU7XG5cblx0Y29uc3QgZ2V0UmFuZG9tTnVtYmVyID0gKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KTtcblxuXHRhcHAuZ2V0UmFuZG9tQ29sb3VyID0gKCkgPT4ge1xuXHRcdGNvbnN0IHJlZCA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGJsdWUgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBncmVlbiA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IHJnYiA9IGByZ2IoJHtyZWR9LCAke2dyZWVufSwgJHtibHVlfSlgXG5cdFx0cmV0dXJuIHJnYjtcblx0fTtcblxuXHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG5cdFxuXHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgdG9wUyA9ICgpID0+IHtcblx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyMwMDAnO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHQvLyBUT1AgUElFQ0Vcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHQvLyAyTkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdC8vIDNSRCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdGN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG5cdFx0Y3R4LmZpbGwoKTtcblx0fTtcblxuXHR0b3BTKCk7XG5cblx0bGV0IG9uZUxvZ29JbnRlcnZhbCA9ICgpID0+IHtcblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSA1MDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmFyYygxMjUsIDExNywgMTEwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTAwICsgaSksICgxMDAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTUwICsgaSksICg3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMTAgKyBpKSwgKDExMCAtIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyMDAgKyBpKSwgKDIwMCArIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMTAgKyBpKSwgKDExMCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMjAgKyBpKSwgKDkwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDEwMCAtIGkpLCAoMTYwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE0MCAtIGkpLCAoMTI1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dG9wUygpO1xuXHRcdFx0fSwgKGkpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoNTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjAwIC0gaSksICgyNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNjAgLSBpKSwgKDYwICsgaSkpO1xuXHRcdFx0XHRcdC8vIGN0eC5hcmMoKDI5MCAtIGkpLCAoMjkwIC0gaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdC8vIE1JRERMRSBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE2MCAtIGkpLCAoMTYwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE3MCAtIGkpLCAoMTQwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDUwICsgaSksICgyMTAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoOTAgKyBpKSwgKDE3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dG9wUygpO1xuXG5cdFx0XHR9LCAoNTAgKyBpKSk7XG5cdFx0fTtcblx0fTtcblx0XG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcblx0XHRsb2dvQW5pbWF0ZSA9IHNldEludGVydmFsKG9uZUxvZ29JbnRlcnZhbCwgMTAwKTtcblx0fSk7XG5cblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNjAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjbGVhckludGVydmFsKGxvZ29BbmltYXRlKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gY3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdC8vIGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyMwMDAnO1xuXHRcdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0XHRjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuXHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdH07XG5cdFx0XHR0b3BTKCk7XG5cdFx0fSwgMTAwKVxuXHRcdFxuXHRcdFxuXHR9KTtcblx0XG59XG4vLyBUaGlzIHJ1bnMgdGhlIGFwcFxuJChmdW5jdGlvbigpIHtcblx0YXBwLmNvbmZpZygpO1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
