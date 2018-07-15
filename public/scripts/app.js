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
		var $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find your results. They might not be available or your spelling is incorrect. Please try again.');
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

			app.noResults = $.isEmptyObject(mediaInfoArray);
			if (app.noResults === true) {
				$('#error').empty();
				app.displayNoResultsError();
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
			// This method removes child nodes from the media results element(previous search results), but only when the search query brings new results. Otherwise it will keep the current results and display an error message.
			if (app.noResults === false) {
				$('#error').empty();
				$('.TasteDive__API-container').empty();
			};

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

				// const $addForm = `<form id="add-button-form">${$addButton}</form>`;

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
		var li = "<li id=\"key-" + key + "\" class=\"favourites-list__list-item\">\n    \t\t\t\t\t<strong>" + mediaTypeFB + ":</strong>\n    \t\t\t\t\t<p>" + mediaTitleFB + "</p>\n    \t\t\t\t\t<button id=\"" + key + "\" class=\"delete no-print\"><i class=\"fas fa-times-circle\"></i></button>\n    \t\t\t\t</li>";
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
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'rgb(92, 92, 92)';
		ctx.arc(125, 117, 55, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.lineWidth = 10;
		ctx.strokeStyle = '#FFC900';
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
		ctx.fillStyle = '#FFC900';
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
				ctx.lineWidth = 3;
				ctx.strokeStyle = 'rgb(92, 92, 92)';
				ctx.arc(125, 117, 55, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.closePath();
				ctx.beginPath();
				ctx.lineWidth = 10;
				ctx.strokeStyle = '#FFC900';
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
				ctx.fillStyle = '#FFC900';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1Qyx5SEFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixF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LENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsRUFBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0E7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLFNBQUosR0FBZ0IsU0FBaEI7QUFDQSxRQUFJLElBQUo7QUFDQyxJQTlCRDtBQStCQTtBQUNBLEdBbkNELEVBbUNHLEdBbkNIO0FBc0NBLEVBekNEO0FBMkNBLENBblhEO0FBb1hBO0FBQ0EsRUFBRSxZQUFXO0FBQ1osS0FBSSxNQUFKO0FBQ0EsS0FBSSxJQUFKO0FBQ0EsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENyZWF0ZSB2YXJpYWJsZSBmb3IgYXBwIG9iamVjdFxuY29uc3QgYXBwID0ge307XG5cbmFwcC5jb25maWcgPSAoKSA9PiB7ICAgXG4gICAgY29uc3QgY29uZmlnID0ge1xuXHQgICAgYXBpS2V5OiBcIkFJemFTeUFlX0xxWUxWbS1vVnNrOUdERWtaOV9GMXBoV2lTb3NMWVwiLFxuXHQgICAgYXV0aERvbWFpbjogXCJqcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2VhcHAuY29tXCIsXG5cdCAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL2pzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWlvLmNvbVwiLFxuXHQgICAgcHJvamVjdElkOiBcImpzLXN1bW1lci1wcm9qZWN0M1wiLFxuXHQgICAgc3RvcmFnZUJ1Y2tldDogXCJcIixcblx0ICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjEwNDc3OTMwMzQxNTVcIlxuXHR9O1xuICAgIC8vVGhpcyB3aWxsIGluaXRpYWxpemUgZmlyZWJhc2Ugd2l0aCBvdXIgY29uZmlnIG9iamVjdFxuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAvLyBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IGNvbm5lY3Rpb24gdG8gdGhlIGRhdGFiYXNlXG4gICAgYXBwLmRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcbiAgICAvLyBUaGlzIGNyZWF0ZXMgYSByZWZlcmVuY2UgdG8gYSBsb2NhdGlvbiBpbiB0aGUgZGF0YWJhc2UuIEkgb25seSBuZWVkIG9uZSBmb3IgdGhpcyBwcm9qZWN0IHRvIHN0b3JlIHRoZSBtZWRpYSBsaXN0XG4gICAgYXBwLm1lZGlhTGlzdCA9IGFwcC5kYXRhYmFzZS5yZWYoJy9tZWRpYUxpc3QnKTtcbn07XG5cbmFwcC5pbml0ID0gKCkgPT4ge1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTaW1pbGFyIGFuZCBPTURCIEFQSXM6IEdldCBSZXN1bHRzIGFuZCBkaXNwbGF5XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gU2ltaWxhciBBUEkgS2V5XG5cdGFwcC5zaW1pbGFyS2V5ID0gJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCc7XG5cblx0Ly8gT01EQiBBUEkgS2V5XG5cdGFwcC5vbWRiS2V5ID0gJzE2NjFmYTlkJztcblx0Ly8gRmlyZWJhc2UgdmFyaWFibGVzXG5cdGNvbnN0IG1lZGlhVHlwZUVsZW1lbnQgPSAkKCcubWVkaWFfX3R5cGUnKVxuXHRjb25zdCBtZWRpYVRpdGxlRWxlbWVudCA9ICQoJy5tZWRpYV9fdGl0bGUnKTtcblxuXHRjb25zdCBtZWRpYUNvbnRhaW5lciA9ICQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKTtcblx0Y29uc3QgZmF2b3VyaXRlc0xpc3QgPSAkKCcuZmF2b3VyaXRlcy1saXN0X19saXN0Jyk7XG5cdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGRpc3BsYXlzIGFuIGlubGluZSBlcnJvciB1bmRlciB0aGUgc2VhcmNoIGZpZWxkIHdoZW4gbm8gcmVzdWx0cyBhcmUgcmV0dXJuZWQgZnJvbSBBUEkjMSAoZW1wdHkgYXJyYXkpXG5cdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IgPSAoKSA9PiB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2Vycm9yIGZ1bmN0aW9uIHdvcmtzJylcblx0XHRjb25zdCAkbm9SZXN1bHRzRXJyb3IgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW5saW5lLWVycm9yJykudGV4dCgnU29ycnksIHdlIGFyZSB1bmFibGUgdG8gZmluZCB5b3VyIHJlc3VsdHMuIFRoZXkgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBvciB5b3VyIHNwZWxsaW5nIGlzIGluY29ycmVjdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHRjb25zb2xlLmxvZygkbm9SZXN1bHRzRXJyb3IpO1xuXHRcdCQoJyNlcnJvcicpLmFwcGVuZCgkbm9SZXN1bHRzRXJyb3IpO1xuXHR9O1xuXHQvLyBjb25zb2xlLmxvZyhhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKTtcblxuXHQvLyBFdmVudCBMaXN0ZW5lciB0byBjaW5sdWRlIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIG9uIGZvcm0gc3VibWlzc2lvblxuXHQkKCcubWVkaWFfX2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIHN1Ym1pdCBpbnB1dHNcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdC8vIEdldCB2YWx1ZSBvZiB0aGUgbWVkaWEgdHlwZSB0aGUgdXNlciBjaGVja2VkXG5cdFx0Y29uc3QgdXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIHR5cGU6IGAke3VzZXJUeXBlfWAsXG5cdFx0ICAgICAgaW5mbzogMSxcblx0XHQgICAgICBsaW1pdDogMTBcblx0XHQgICAgfVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGFzcyBtb3ZpZSB0aXRsZXMgZnJvbSBQcm9taXNlIzEgaW50byBQcm9taXNlICMyXG5cdFx0YXBwLmdldEltZGJSYXRpbmcgPSAobW92aWVUaXRsZSkgPT4ge1xuXHRcdFx0Ly8gUmV0dXJuIFByb21pc2UjMiB3aGljaCBpbmNsdWRlcyB0aGUgbW92aWUgdGl0bGUgZnJvbSBQcm9taXNlIzFcblx0XHQgICAgcmV0dXJuICQuYWpheCh7XG5cdFx0ICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdCAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICAgICAgICAgICBkYXRhOiB7XG5cdFx0ICAgICAgICAgICAgICAgYXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdCAgICAgICAgICAgICAgIHQ6IG1vdmllVGl0bGVcblx0XHQgICAgICAgICAgICAgfVxuXHRcdCAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblxuXHQgICAgICBhcHAubm9SZXN1bHRzID0gJC5pc0VtcHR5T2JqZWN0KG1lZGlhSW5mb0FycmF5KTtcblx0ICAgICAgaWYgKGFwcC5ub1Jlc3VsdHMgPT09IHRydWUpIHtcblx0ICAgICAgXHQkKCcjZXJyb3InKS5lbXB0eSgpO1xuXHQgICAgICBcdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IoKTtcblx0ICAgICAgfTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1kZWlhIHR5cGVpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmICh1c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgdXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgfSBlbHNlIHtcblx0XHQgIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0ICAgIGFwcC5kaXNwbGF5TWVkaWEgPSAoYWxsTWVkaWFBcnJheSkgPT4ge1xuXHQgICAgXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIG1lZGlhIHJlc3VsdHMgZWxlbWVudChwcmV2aW91cyBzZWFyY2ggcmVzdWx0cyksIGJ1dCBvbmx5IHdoZW4gdGhlIHNlYXJjaCBxdWVyeSBicmluZ3MgbmV3IHJlc3VsdHMuIE90aGVyd2lzZSBpdCB3aWxsIGtlZXAgdGhlIGN1cnJlbnQgcmVzdWx0cyBhbmQgZGlzcGxheSBhbiBlcnJvciBtZXNzYWdlLlxuXHQgICAgXHRpZiAoYXBwLm5vUmVzdWx0cyA9PT0gZmFsc2UpIHtcblx0ICAgIFx0XHQkKCcjZXJyb3InKS5lbXB0eSgpO1xuXHQgICAgXHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5lbXB0eSgpO1xuXHQgICAgXHR9O1xuXG5cdCAgICBcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0ICAgIFx0XHQvLyBGb3IgZWFjaCByZXN1bHQgaW4gdGhlIGFycmF5IHJldHVybmVkIGZyb20gQVBJIzEsIGNyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nLlxuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVR5cGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190eXBlJykudGV4dChzaW5nbGVNZWRpYS5UeXBlKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFUaXRsZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3RpdGxlJykudGV4dChzaW5nbGVNZWRpYS5OYW1lKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbiA9ICQoJzxwPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24nKS50ZXh0KHNpbmdsZU1lZGlhLndUZWFzZXIpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVdpa2kgPSAkKCc8YT4nKS5hZGRDbGFzcygnbWVkaWFfX3dpa2knKS5hdHRyKCdocmVmJywgc2luZ2xlTWVkaWEud1VybCkudGV4dCgnV2lraSBQYWdlJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHQgICAgXHRcdFx0Y2xhc3M6ICdtZWRpYV9feW91dHViZScsXG5cdCAgICBcdFx0XHRzcmM6IHNpbmdsZU1lZGlhLnlVcmwsXG5cdCAgICBcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHQgICAgXHRcdFx0ZnJhbWVib3JkZXI6IDAsXG5cdCAgICBcdFx0XHRhbGxvd2Z1bGxzY3JlZW46IHRydWUsXG5cdCAgICBcdFx0XHRoZWlnaHQ6IDMxNSxcblx0ICAgIFx0XHRcdHdpZHRoOiA1NjBcblx0ICAgIFx0XHR9KTtcdFxuXG5cdCAgICBcdFx0Y29uc3QgJGFkZEJ1dHRvbiA9ICQoJzxpbnB1dD4nKS5hdHRyKHtcblx0ICAgIFx0XHRcdHR5cGU6ICdidXR0b24nLFxuXHQgICAgXHRcdFx0dmFsdWU6ICdBZGQgdG8gTGlzdCcsXG5cdCAgICBcdFx0XHRmb3JtOiAnYWRkLWJ1dHRvbi1mb3JtJyxcblx0ICAgIFx0XHRcdGNsYXNzOiAnYWRkLWJ1dHRvbidcblx0ICAgIFx0XHR9KTtcblx0ICAgIFx0XHQvLyA/Pz9JUyBUSEVSRSBBIFdBWSBUTyBBUFBFTkQgQU4gSU5QVVQgSU5TSURFIE9GIEEgRk9STT8/PyBJRiBOT1Q8IEpVU1QgRE8gSU5QVVQgQU5EIFVTRSAnb25DTGljaycgZXZlbnQgbGlzdGVuZXIgdG8gc3VibWl0IHRoZSBtZWRpYSB0eXBlYW5kIHRpdGxlIHRvIEZpcmViYXNlLlxuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEZvcm0gPSBgPGZvcm0gaWQ9XCJhZGQtYnV0dG9uLWZvcm1cIj4keyRhZGRCdXR0b259PC9mb3JtPmA7XG5cdCAgICBcdFx0XG5cdCAgICBcdFx0Ly8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXG5cdCAgICBcdFx0Ly8gVGhpcyBtYXRjaGVzIHRoZSBtb3ZpZSBvciBzaG93IHRpdGxlIGZyb20gQVBJIzEgd2l0aCBBUEkjMi4gSXQgdGhlbiBjcmVhdGVzIGEgdmFyaWFibGUgZm9yIHRoZSBJTURCIFJhdGluZyByZXR1cm5lZCBmcm9tIEFQSSMyIGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBwYWdlLlxuXHQgICAgXHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ICAgIFx0XHRhcHAuaW1kYlJlc3VsdHNBcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG5cdFx0ICAgIFx0XHRcdGlmIChzaW5nbGVNZWRpYS5OYW1lID09PSBlbGVtZW50LlRpdGxlKSB7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoZWxlbWVudC5pbWRiUmF0aW5nKTtcblx0XHQgICAgXHRcdFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0XHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVHlwZSwgJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFJbWRiLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHRcdC8vICQoJyNhZGQtYnV0dG9uLWZvcm0nKS5hcHBlbmQoJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHRcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVR5cGUsICRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJG1lZGlhSW1kYiwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gJCgnI2FkZC1idXR0b24tZm9ybScpLmFwcGVuZCgkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVHlwZSwgJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0Ly8gJCgnI2FkZC1idXR0b24tZm9ybScpLmFwcGVuZCgkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVR5cGUsICRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHQvLyAkKCcjYWRkLWJ1dHRvbi1mb3JtJykuYXBwZW5kKCRhZGRCdXR0b24pXG5cdFx0ICAgIFx0XHR9O1xuXHRcdCAgICBcdH07XG5cdCAgICBcdH0pO1xuXHQgICAgfTtcblx0ICAgIFxuXHR9KTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRmlyZWJhc2U6IE1lZGlhIEZhdm91cml0ZXMgTGlzdFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIEV2ZW50IGxpc3RlbmVyIGZvciBhZGRpbmcgbWVkaWEgdHlwZSBhbmQgdGl0bGUgdG8gdGhlIGxpc3Qgc3VibWl0dGluZyB0aGUgZm9ybS9wcmludGluZyB0aGUgbGlzdFxuICAgIG1lZGlhQ29udGFpbmVyLm9uKCdjbGljaycsICcuYWRkLWJ1dHRvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAvLyBUaGlzIHZhcmlhYmxlIHN0b3JlcyB0aGUgZWxlbWVudChzKSBpbiB0aGUgZm9ybSBJIHdhbnQgdG8gZ2V0IHZhbHVlKHMpIGZyb20uIEluIHRoaXMgY2FzZSBpdCB0aGUgcCByZXByZXNlbnRpbmcgdGhlIG1lZGlhIHRpdGxlIGFuZCB0aGUgcCByZXByZXNlbnRpbmcgdGhlIG1lZGlhIHR5cGUuXG4gICAgICAgIGNvbnN0IHR5cGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdHlwZScpWzBdLmlubmVyVGV4dDtcbiAgICAgICAgY29uc3QgdGl0bGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdGl0bGUnKVswXS5pbm5lclRleHQ7XG4gICAgICAgIGNvbnNvbGUubG9nKHR5cGUpO1xuXG4gICAgICAgIGNvbnN0IG1lZGlhT2JqZWN0ID0ge1xuICAgICAgICBcdHR5cGUsXG4gICAgICAgIFx0dGl0bGVcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdGhlIGluZm9ybWF0aW9uIHRvIEZpcmViYXNlXG4gICAgICAgIGFwcC5tZWRpYUxpc3QucHVzaChtZWRpYU9iamVjdCk7XG4gICAgfSk7XG4gICAgLy8gY29uc29sZS5sb2coYXBwLm1lZGlhTGlzdCk7XG4gICAgLy8gR2V0IHRoZSB0eXBlIGFuZCB0aXRsZSBpbmZvcm1hdGlvbiBmcm9tIEZpcmViYXNlXG4gICAgYXBwLm1lZGlhTGlzdC5saW1pdFRvTGFzdCgxMCkub24oJ2NoaWxkX2FkZGVkJyxmdW5jdGlvbihtZWRpYUluZm8pIHtcbiAgICBcdC8vIGNvbnNvbGUubG9nKG1lZGlhSW5mbyk7XG4gICAgXHRjb25zdCBkYXRhID0gbWVkaWFJbmZvLnZhbCgpO1xuICAgIFx0Y29uc3QgbWVkaWFUeXBlRkIgPSBkYXRhLnR5cGU7XG4gICAgXHRjb25zdCBtZWRpYVRpdGxlRkIgPSBkYXRhLnRpdGxlO1xuICAgIFx0Y29uc3Qga2V5ID0gbWVkaWFJbmZvLmtleTtcbiAgICBcdC8vIENyZWF0ZSBMaXN0IEl0ZW0gdGFodCBpbmNsdWRlcyB0aGUgdHlwZSBhbmQgdGl0bGVcbiAgICBcdGNvbnN0IGxpID0gYDxsaSBpZD1cImtleS0ke2tleX1cIiBjbGFzcz1cImZhdm91cml0ZXMtbGlzdF9fbGlzdC1pdGVtXCI+XG4gICAgXHRcdFx0XHRcdDxzdHJvbmc+JHttZWRpYVR5cGVGQn06PC9zdHJvbmc+XG4gICAgXHRcdFx0XHRcdDxwPiR7bWVkaWFUaXRsZUZCfTwvcD5cbiAgICBcdFx0XHRcdFx0PGJ1dHRvbiBpZD1cIiR7a2V5fVwiIGNsYXNzPVwiZGVsZXRlIG5vLXByaW50XCI+PGkgY2xhc3M9XCJmYXMgZmEtdGltZXMtY2lyY2xlXCI+PC9pPjwvYnV0dG9uPlxuICAgIFx0XHRcdFx0PC9saT5gXG4gICAgXHRmYXZvdXJpdGVzTGlzdC5hcHBlbmQobGkpO1xuICAgIFx0ZmF2b3VyaXRlc0xpc3RbMF0uc2Nyb2xsVG9wID0gZmF2b3VyaXRlc0xpc3RbMF0uc2Nyb2xsSGVpZ2h0O1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBkZWxldGUgaWNvbiBpcyBjbGlja2VkXG4gICAgZmF2b3VyaXRlc0xpc3Qub24oJ2NsaWNrJywgJy5kZWxldGUnLCBmdW5jdGlvbigpIHtcbiAgICBcdGNvbnN0IGlkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIFx0XG4gICAgXHRhcHAuZGF0YWJhc2UucmVmKGAvbWVkaWFMaXN0LyR7aWR9YCkucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gRmlyZWJhc2Ugd2hlbiB0aGUgQ2xlYXIgYnV0dG9uIGlzIGNsaWNrZWRcbiAgICAkKCcuY2xlYXItbGlzdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIFx0YXBwLmRhdGFiYXNlLnJlZihgL21lZGlhTGlzdGApLnNldChudWxsKTtcbiAgICB9KTtcbiAgICAvLyBSZW1vdmUgbGlzdCBpdGVtIGZyb20gdGhlIGZyb250IGVuZCBhcHBlbmRcbiAgICBhcHAubWVkaWFMaXN0LmxpbWl0VG9MYXN0KDEwKS5vbignY2hpbGRfcmVtb3ZlZCcsIGZ1bmN0aW9uIChsaXN0SXRlbXMpIHtcblx0Ly8gY29uc29sZS5sb2coZmF2b3VyaXRlc0xpc3QuZmluZChsaXN0SXRlbXMua2V5KSk7XG5cdGZhdm91cml0ZXNMaXN0LmZpbmQoYCNrZXktJHtsaXN0SXRlbXMua2V5fWApLnJlbW92ZSgpO1xuXHR9KTtcdFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMb2dvIEFuaW1hdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdGxldCBsb2dvQW5pbWF0ZTtcblxuXHRjb25zdCBnZXRSYW5kb21OdW1iZXIgPSAoKSA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpO1xuXG5cdGFwcC5nZXRSYW5kb21Db2xvdXIgPSAoKSA9PiB7XG5cdFx0Y29uc3QgcmVkID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgYmx1ZSA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGdyZWVuID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgcmdiID0gYHJnYigke3JlZH0sICR7Z3JlZW59LCAke2JsdWV9KWBcblx0XHRyZXR1cm4gcmdiO1xuXHR9O1xuXG5cdGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcblx0XG5cdGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB0b3BTID0gKCkgPT4ge1xuXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5saW5lV2lkdGggPSAzO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICdyZ2IoOTIsIDkyLCA5MiknO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDU1LCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Ly8gVE9QIFBJRUNFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0Ly8gMk5EIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHQvLyAzUkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5maWxsKCk7XG5cdH07XG5cblx0dG9wUygpO1xuXG5cdGxldCBvbmVMb2dvSW50ZXJ2YWwgPSAoKSA9PiB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gNTA7IGkgPSBpICsgMSkge1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTAwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTEwICsgaSksICgxMTAgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gY3R4LmFyYygoMjAwICsgaSksICgyMDAgKyBpKSwgMTAwLCAxICogTWF0aC5QSSwgMS43ICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTEwICsgaSksICgxMTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTIwICsgaSksICg5MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNDAgLSBpKSwgKDEyNSArIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRvcFMoKTtcblx0XHRcdH0sIChpKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDUwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTYwIC0gaSksICg2MCArIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyOTAgLSBpKSwgKDI5MCAtIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyBNSURETEUgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNjAgLSBpKSwgKDE2MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNzAgLSBpKSwgKDE0MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg1MCArIGkpLCAoMjEwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDkwICsgaSksICgxNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0fSwgKDUwICsgaSkpO1xuXHRcdH07XG5cdH07XG5cdFxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG5cdFx0bG9nb0FuaW1hdGUgPSBzZXRJbnRlcnZhbChvbmVMb2dvSW50ZXJ2YWwsIDEwMCk7XG5cdH0pO1xuXG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChsb2dvQW5pbWF0ZSk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdC8vIGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBjdHguYXJjKDEyNSwgMTE3LCA2MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5saW5lV2lkdGggPSAzO1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJ3JnYig5MiwgOTIsIDkyKSc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1NSwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdH07XG5cdFx0XHR0b3BTKCk7XG5cdFx0fSwgMTAwKVxuXHRcdFxuXHRcdFxuXHR9KTtcblx0XG59XG4vLyBUaGlzIHJ1bnMgdGhlIGFwcFxuJChmdW5jdGlvbigpIHtcblx0YXBwLmNvbmZpZygpO1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
