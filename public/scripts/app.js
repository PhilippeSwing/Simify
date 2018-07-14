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
		// ================================================
		// Firebase: Media Favourites List
		// ================================================
		// This variable stores the element(s) in the form I want to get value(s) from. In this case it the h2 representing the media title and the h2 representing the media type.


		// const title = mediaTitleElement.text();
		// console.log(title);
		// Event listener for adding media type and title to the list submitting the form/printing the list
		mediaContainer.on('click', '.add-button', function (e) {
			// e.preventDefault();

			// console.log($(this).prevAll('.media__title')[0].innerText);

			var type = $(this).prevAll('.media__type')[0].innerText;
			var title = $(this).prevAll('.media__title')[0].innerText;
			console.log(type);

			var mediaObject = {
				type: type,
				title: title
				// Add the information to Firebase
			};app.mediaList.push(mediaObject);
		});
		console.log(app.mediaList);
		// Get the type and title information from Firebase
		app.mediaList.limitToLast(10).on('child_added', function (mediaInfo) {
			console.log(mediaInfo);
			var data = mediaInfo.val();
			var mediaTypeFB = data.type;
			var mediaTitleFB = data.title;
			var key = mediaInfo.key;
			// Create List Item taht includes the type and title
			var li = "<li id=\"key-" + key + "\">\n\t    \t\t\t\t\t<strong>" + mediaTypeFB + ":</strong>\n\t    \t\t\t\t\t<p>" + mediaTitleFB + "</p>\n\t    \t\t\t\t\t<button id=\"" + key + "\" class=\"delete\"><i class=\"fas fa-times-circle\"></i></button>\n\t    \t\t\t\t</li>";
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
		// **Click button on list form to print favourites list
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1QyxtSUFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixF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Q0EsRUFBRSxZQUFXO0FBQ1osS0FBSSxNQUFKO0FBQ0EsS0FBSSxJQUFKO0FBQ0EsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENyZWF0ZSB2YXJpYWJsZSBmb3IgYXBwIG9iamVjdFxuY29uc3QgYXBwID0ge307XG5cbmFwcC5jb25maWcgPSAoKSA9PiB7ICAgXG4gICAgY29uc3QgY29uZmlnID0ge1xuXHQgICAgYXBpS2V5OiBcIkFJemFTeUFlX0xxWUxWbS1vVnNrOUdERWtaOV9GMXBoV2lTb3NMWVwiLFxuXHQgICAgYXV0aERvbWFpbjogXCJqcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2VhcHAuY29tXCIsXG5cdCAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL2pzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWlvLmNvbVwiLFxuXHQgICAgcHJvamVjdElkOiBcImpzLXN1bW1lci1wcm9qZWN0M1wiLFxuXHQgICAgc3RvcmFnZUJ1Y2tldDogXCJcIixcblx0ICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjEwNDc3OTMwMzQxNTVcIlxuXHR9O1xuICAgIC8vVGhpcyB3aWxsIGluaXRpYWxpemUgZmlyZWJhc2Ugd2l0aCBvdXIgY29uZmlnIG9iamVjdFxuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAvLyBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IGNvbm5lY3Rpb24gdG8gdGhlIGRhdGFiYXNlXG4gICAgYXBwLmRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcbiAgICAvLyBUaGlzIGNyZWF0ZXMgYSByZWZlcmVuY2UgdG8gYSBsb2NhdGlvbiBpbiB0aGUgZGF0YWJhc2UuIEkgb25seSBuZWVkIG9uZSBmb3IgdGhpcyBwcm9qZWN0IHRvIHN0b3JlIHRoZSBtZWRpYSBsaXN0XG4gICAgYXBwLm1lZGlhTGlzdCA9IGFwcC5kYXRhYmFzZS5yZWYoJy9tZWRpYUxpc3QnKTtcbn07XG5cbmFwcC5pbml0ID0gKCkgPT4ge1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTaW1pbGFyIGFuZCBPTURCIEFQSXM6IEdldCBSZXN1bHRzIGFuZCBkaXNwbGF5XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gU2ltaWxhciBBUEkgS2V5XG5cdGFwcC5zaW1pbGFyS2V5ID0gJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCc7XG5cblx0Ly8gT01EQiBBUEkgS2V5XG5cdGFwcC5vbWRiS2V5ID0gJzE2NjFmYTlkJztcblx0Ly8gRmlyZWJhc2UgdmFyaWFibGVzXG5cdGNvbnN0IG1lZGlhVHlwZUVsZW1lbnQgPSAkKCcubWVkaWFfX3R5cGUnKVxuXHRjb25zdCBtZWRpYVRpdGxlRWxlbWVudCA9ICQoJy5tZWRpYV9fdGl0bGUnKTtcblxuXHRjb25zdCBtZWRpYUNvbnRhaW5lciA9ICQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKTtcblx0Y29uc3QgZmF2b3VyaXRlc0xpc3QgPSAkKCcuZmF2b3VyaXRlcy1saXN0X19saXN0Jyk7XG5cdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGRpc3BsYXlzIGFuIGlubGluZSBlcnJvciB1bmRlciB0aGUgc2VhcmNoIGZpZWxkIHdoZW4gbm8gcmVzdWx0cyBhcmUgcmV0dXJuZWQgZnJvbSBBUEkjMSAoZW1wdHkgYXJyYXkpXG5cdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IgPSAoKSA9PiB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2Vycm9yIGZ1bmN0aW9uIHdvcmtzJylcblx0XHRjb25zdCAkbm9SZXN1bHRzRXJyb3IgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW5saW5lLWVycm9yJykudGV4dCgnU29ycnksIHdlIGFyZSB1bmFibGUgdG8gZmluZCByZXN1bHRzIGZvciB5b3VyIHNlYXJjaC4gV2UgbWlnaHQgbm90IGhhdmUgcmVzdWx0cyBmb3IgeW91ciBzZWFyY2ggb3IgeW91ciBzcGVsbGluZyBpcyBzbGlnaHRseSBvZmYuJyk7XG5cdFx0Y29uc29sZS5sb2coJG5vUmVzdWx0c0Vycm9yKTtcblx0XHQkKCcjZXJyb3InKS5hcHBlbmQoJG5vUmVzdWx0c0Vycm9yKTtcblx0fTtcblx0Ly8gY29uc29sZS5sb2coYXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcik7XG5cblx0Ly8gRXZlbnQgTGlzdGVuZXIgdG8gY2lubHVkZSBldmVyeXRoaW5nIHRoYXQgaGFwcGVucyBvbiBmb3JtIHN1Ym1pc3Npb25cblx0JCgnLm1lZGlhX19mb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gUHJldmVudCBkZWZhdWx0IGZvciBzdWJtaXQgaW5wdXRzXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHQvLyBHZXQgdmFsdWUgb2YgdGhlIG1lZGlhIHR5cGUgdGhlIHVzZXIgY2hlY2tlZFxuXHRcdGNvbnN0IHVzZXJUeXBlID0gJCgnaW5wdXRbbmFtZT10eXBlXTpjaGVja2VkJykudmFsKCk7XG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiB3aGF0IHRoZSB1c2VyIGVudGVyZWQgaW4gdGhlIHNlYXJjaCBmaWVsZFxuXHRcdGNvbnN0IHVzZXJJbnB1dCA9ICQoJyNtZWRpYV9fc2VhcmNoJykudmFsKCk7XG5cdFx0Ly8gUHJvbWlzZSBmb3IgQVBJIzFcblx0XHRhcHAuZ2V0TWVkaWEgPVxuXHRcdCAgJC5hamF4KHtcblx0XHQgICAgdXJsOiAnaHR0cHM6Ly90YXN0ZWRpdmUuY29tL2FwaS9zaW1pbGFyJyxcblx0XHQgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgZGF0YVR5cGU6ICdqc29ucCcsXG5cdFx0ICAgIGRhdGE6IHtcblx0XHQgICAgICBrOiAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJyxcblx0XHQgICAgICBxOiBgJHt1c2VySW5wdXR9YCxcblx0XHQgICAgICB0eXBlOiBgJHt1c2VyVHlwZX1gLFxuXHRcdCAgICAgIGluZm86IDEsXG5cdFx0ICAgICAgbGltaXQ6IDEwXG5cdFx0ICAgIH1cblx0XHR9KTtcblxuXHRcdC8vIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHBhc3MgbW92aWUgdGl0bGVzIGZyb20gUHJvbWlzZSMxIGludG8gUHJvbWlzZSAjMlxuXHRcdGFwcC5nZXRJbWRiUmF0aW5nID0gKG1vdmllVGl0bGUpID0+IHtcblx0XHRcdC8vIFJldHVybiBQcm9taXNlIzIgd2hpY2ggaW5jbHVkZXMgdGhlIG1vdmllIHRpdGxlIGZyb20gUHJvbWlzZSMxXG5cdFx0ICAgIHJldHVybiAkLmFqYXgoe1xuXHRcdCAgICAgICAgICAgICB1cmw6ICdodHRwOi8vd3d3Lm9tZGJhcGkuY29tJyxcblx0XHQgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgICAgICAgICAgZGF0YToge1xuXHRcdCAgICAgICAgICAgICAgIGFwaWtleTogJzE2NjFmYTlkJyxcblx0XHQgICAgICAgICAgICAgICB0OiBtb3ZpZVRpdGxlXG5cdFx0ICAgICAgICAgICAgIH1cblx0XHQgICAgfSk7XG5cdFx0fTtcblx0XHQvLyBHZXQgcmVzdWx0cyBmb3IgUHJvbWlzZSMxXG5cdCAgICAkLndoZW4oYXBwLmdldE1lZGlhKS50aGVuKChtZWRpYUluZm8pID0+IHtcblx0ICAgICAgY29uc3QgbWVkaWFJbmZvQXJyYXkgPSBtZWRpYUluZm8uU2ltaWxhci5SZXN1bHRzO1xuXHQgICAgICBjb25zb2xlLmxvZyhtZWRpYUluZm9BcnJheSk7XG5cblx0ICAgICAgY29uc3Qgbm9SZXN1bHRzID0gJC5pc0VtcHR5T2JqZWN0KG1lZGlhSW5mb0FycmF5KTtcblx0ICAgICAgaWYgKG5vUmVzdWx0cyA9PT0gdHJ1ZSkge1xuXHQgICAgICBcdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IoKTtcblx0ICAgICAgXHQvLyBhbGVydChgUGxlYXNlIGNoZWNrIHlvdXIgc3BlbGxpbmcgb3IgZW50ZXIgYSB2YWxpZCB0aXRsZSBmb3IgeW91ciBtZWRpYSBjYXRlZ29yeWApO1xuXG5cdCAgICAgIH07XG5cdCAgXHRcdC8vIElmIHRoZSBtZGVpYSB0eXBlaXMgbW92aWVzIG9yIHNob3dzLCBnZXQgcmVzdWx0cyBhcnJheSBmcm9tIFByb21pc2UgIzEgYW5kIG1hcCBlYWNoIG1vdmllIHRpdGxlIHJlc3VsdCB0byBhIHByb21pc2UgZm9yIFByb21pc2UgIzIuIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgcHJvbWlzZXMgZm9yIEFQSSMyLlxuXHQgICAgICBpZiAodXNlclR5cGUgPT09ICdtb3ZpZXMnIHx8IHVzZXJUeXBlID09PSAnc2hvd3MnKSB7XG5cdFx0ICAgICAgY29uc3QgaW1kYlByb21pc2VBcnJheSA9IG1lZGlhSW5mb0FycmF5Lm1hcCgodGl0bGUpID0+IHtcblx0XHQgICAgICAgIHJldHVybiBhcHAuZ2V0SW1kYlJhdGluZyh0aXRsZS5OYW1lKTtcblx0XHQgICAgICB9KTtcblx0XHQgICAgICBjb25zb2xlLmxvZyhpbWRiUHJvbWlzZUFycmF5KTtcblx0XHQgICAgICAvLyBSZXR1cm4gYSBzaW5nbGUgYXJyYXkgZnJvbSB0aGUgYXJyYXkgb2YgcHJvbWlzZXMgYW5kIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2UuXG5cdFx0ICAgICAgUHJvbWlzZS5hbGwoaW1kYlByb21pc2VBcnJheSkudGhlbigoaW1kYlJlc3VsdHMpID0+IHtcblx0XHQgICAgICAgIGNvbnNvbGUubG9nKGltZGJSZXN1bHRzKTtcblx0XHQgICAgICAgIGFwcC5pbWRiUmVzdWx0c0FycmF5ID0gaW1kYlJlc3VsdHM7XG5cdFx0ICAgICAgICAvLyBjb25zb2xlLmxvZyhhcHAuaW1kYlJlc3VsdHNBcnJheSk7XG5cdFx0ICAgICAgICBhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHQgICAgICB9KTtcblx0XHQgICAgLy8gRm9yIG1lZGlhIHR5cGVzIHRoYXQgYXJlIG5vdCBtb3ZpZXMgb3Igc2hvd3MsIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2Vcblx0XHQgIH0gZWxzZSB7XG5cdFx0ICBcdGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgfTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKGVycikge1xuXHRcdCAgY29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblx0XHQvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gZGlzcGxheSB0aGUgQVBJIHByb21pc2UgcmVzdWx0cyBvbnRvIHRoZSBwYWdlXG5cdCAgICBhcHAuZGlzcGxheU1lZGlhID0gKGFsbE1lZGlhQXJyYXkpID0+IHtcblx0ICAgIFx0Ly8gVGhpcyBtZXRob2QgcmVtb3ZlcyBjaGlsZCBub2RlcyBmcm9tIHRoZSBzZWxlY3RlZCBlbGVtZW50KHMpLiBJbiB0aGlzIGNhc2Ugd2UgcmVtb3ZlIHRoZSBkaXYgdGhhdCBjb250YWlucyBhbGwgcHJldmlvdXMgc2VhcmNoIHJlc3VsdHMuXG5cdCAgICBcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5lbXB0eSgpO1xuXG5cdCAgICBcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0ICAgIFx0XHQvLyBGb3IgZWFjaCByZXN1bHQgaW4gdGhlIGFycmF5IHJldHVybmVkIGZyb20gQVBJIzEsIGNyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nLlxuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVR5cGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190eXBlJykudGV4dChzaW5nbGVNZWRpYS5UeXBlKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFUaXRsZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3RpdGxlJykudGV4dChzaW5nbGVNZWRpYS5OYW1lKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbiA9ICQoJzxwPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24nKS50ZXh0KHNpbmdsZU1lZGlhLndUZWFzZXIpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVdpa2kgPSAkKCc8YT4nKS5hZGRDbGFzcygnbWVkaWFfX3dpa2knKS5hdHRyKCdocmVmJywgc2luZ2xlTWVkaWEud1VybCkudGV4dCgnV2lraSBQYWdlJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHQgICAgXHRcdFx0Y2xhc3M6ICdtZWRpYV9feW91dHViZScsXG5cdCAgICBcdFx0XHRzcmM6IHNpbmdsZU1lZGlhLnlVcmwsXG5cdCAgICBcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHQgICAgXHRcdFx0ZnJhbWVib3JkZXI6IDAsXG5cdCAgICBcdFx0XHRhbGxvd2Z1bGxzY3JlZW46IHRydWUsXG5cdCAgICBcdFx0XHRoZWlnaHQ6IDMxNSxcblx0ICAgIFx0XHRcdHdpZHRoOiA1NjBcblx0ICAgIFx0XHR9KTtcdFxuXG5cdCAgICBcdFx0Y29uc3QgJGFkZEJ1dHRvbiA9ICQoJzxpbnB1dD4nKS5hdHRyKHtcblx0ICAgIFx0XHRcdHR5cGU6ICdidXR0b24nLFxuXHQgICAgXHRcdFx0dmFsdWU6ICdBZGQgdG8gTGlzdCcsXG5cdCAgICBcdFx0XHRmb3JtOiAnYWRkLWJ1dHRvbi1mb3JtJyxcblx0ICAgIFx0XHRcdGNsYXNzOiAnYWRkLWJ1dHRvbidcblx0ICAgIFx0XHR9KTtcblx0ICAgIFx0XHQvLyA/Pz9JUyBUSEVSRSBBIFdBWSBUTyBBUFBFTkQgQU4gSU5QVVQgSU5TSURFIE9GIEEgRk9STT8/PyBJRiBOT1Q8IEpVU1QgRE8gSU5QVVQgQU5EIFVTRSAnb25DTGljaycgZXZlbnQgbGlzdGVuZXIgdG8gc3VibWl0IHRoZSBtZWRpYSB0eXBlYW5kIHRpdGxlIHRvIEZpcmViYXNlLlxuXG5cdCAgICBcdFx0Y29uc3QgJGFkZEZvcm0gPSBgPGZvcm0gaWQ9XCJhZGQtYnV0dG9uLWZvcm1cIj4keyRhZGRCdXR0b259PC9mb3JtPmA7XG5cdCAgICBcdFx0XG5cdCAgICBcdFx0Ly8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXG5cdCAgICBcdFx0Ly8gVGhpcyBtYXRjaGVzIHRoZSBtb3ZpZSBvciBzaG93IHRpdGxlIGZyb20gQVBJIzEgd2l0aCBBUEkjMi4gSXQgdGhlbiBjcmVhdGVzIGEgdmFyaWFibGUgZm9yIHRoZSBJTURCIFJhdGluZyByZXR1cm5lZCBmcm9tIEFQSSMyIGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBwYWdlLlxuXHQgICAgXHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ICAgIFx0XHRhcHAuaW1kYlJlc3VsdHNBcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG5cdFx0ICAgIFx0XHRcdGlmIChzaW5nbGVNZWRpYS5OYW1lID09PSBlbGVtZW50LlRpdGxlKSB7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoZWxlbWVudC5pbWRiUmF0aW5nKTtcblx0XHQgICAgXHRcdFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0XHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVHlwZSwgJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFJbWRiLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHRcdC8vICQoJyNhZGQtYnV0dG9uLWZvcm0nKS5hcHBlbmQoJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHRcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVR5cGUsICRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJG1lZGlhSW1kYiwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gJCgnI2FkZC1idXR0b24tZm9ybScpLmFwcGVuZCgkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVHlwZSwgJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0Ly8gJCgnI2FkZC1idXR0b24tZm9ybScpLmFwcGVuZCgkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVR5cGUsICRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHQvLyAkKCcjYWRkLWJ1dHRvbi1mb3JtJykuYXBwZW5kKCRhZGRCdXR0b24pXG5cdFx0ICAgIFx0XHR9O1xuXHRcdCAgICBcdH07XG5cdCAgICBcdH0pO1xuXHQgICAgfTtcblx0ICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQgICAgLy8gRmlyZWJhc2U6IE1lZGlhIEZhdm91cml0ZXMgTGlzdFxuXHQgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdCAgICAvLyBUaGlzIHZhcmlhYmxlIHN0b3JlcyB0aGUgZWxlbWVudChzKSBpbiB0aGUgZm9ybSBJIHdhbnQgdG8gZ2V0IHZhbHVlKHMpIGZyb20uIEluIHRoaXMgY2FzZSBpdCB0aGUgaDIgcmVwcmVzZW50aW5nIHRoZSBtZWRpYSB0aXRsZSBhbmQgdGhlIGgyIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdHlwZS5cblx0ICAgIFxuXG5cdCAgICAvLyBjb25zdCB0aXRsZSA9IG1lZGlhVGl0bGVFbGVtZW50LnRleHQoKTtcblx0ICAgIC8vIGNvbnNvbGUubG9nKHRpdGxlKTtcblx0ICAgIC8vIEV2ZW50IGxpc3RlbmVyIGZvciBhZGRpbmcgbWVkaWEgdHlwZSBhbmQgdGl0bGUgdG8gdGhlIGxpc3Qgc3VibWl0dGluZyB0aGUgZm9ybS9wcmludGluZyB0aGUgbGlzdFxuXHQgICAgbWVkaWFDb250YWluZXIub24oJ2NsaWNrJywgJy5hZGQtYnV0dG9uJywgZnVuY3Rpb24oZSkge1xuXHQgICAgICAgIC8vIGUucHJldmVudERlZmF1bHQoKTtcblxuXHQgICAgICAgIC8vIGNvbnNvbGUubG9nKCQodGhpcykucHJldkFsbCgnLm1lZGlhX190aXRsZScpWzBdLmlubmVyVGV4dCk7XG5cdCAgICAgICBcblx0ICAgICAgICBjb25zdCB0eXBlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3R5cGUnKVswXS5pbm5lclRleHQ7XG5cdCAgICAgICAgY29uc3QgdGl0bGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdGl0bGUnKVswXS5pbm5lclRleHQ7XG5cdCAgICAgICAgY29uc29sZS5sb2codHlwZSk7XG5cblx0ICAgICAgICBjb25zdCBtZWRpYU9iamVjdCA9IHtcblx0ICAgICAgICBcdHR5cGUsXG5cdCAgICAgICAgXHR0aXRsZVxuXHQgICAgICAgIH1cblx0ICAgICAgICAvLyBBZGQgdGhlIGluZm9ybWF0aW9uIHRvIEZpcmViYXNlXG5cdCAgICAgICAgYXBwLm1lZGlhTGlzdC5wdXNoKG1lZGlhT2JqZWN0KTtcblx0ICAgIH0pO1xuXHQgICAgY29uc29sZS5sb2coYXBwLm1lZGlhTGlzdCk7XG5cdCAgICAvLyBHZXQgdGhlIHR5cGUgYW5kIHRpdGxlIGluZm9ybWF0aW9uIGZyb20gRmlyZWJhc2Vcblx0ICAgIGFwcC5tZWRpYUxpc3QubGltaXRUb0xhc3QoMTApLm9uKCdjaGlsZF9hZGRlZCcsZnVuY3Rpb24obWVkaWFJbmZvKSB7XG5cdCAgICBcdGNvbnNvbGUubG9nKG1lZGlhSW5mbyk7XG5cdCAgICBcdGNvbnN0IGRhdGEgPSBtZWRpYUluZm8udmFsKCk7XG5cdCAgICBcdGNvbnN0IG1lZGlhVHlwZUZCID0gZGF0YS50eXBlO1xuXHQgICAgXHRjb25zdCBtZWRpYVRpdGxlRkIgPSBkYXRhLnRpdGxlO1xuXHQgICAgXHRjb25zdCBrZXkgPSBtZWRpYUluZm8ua2V5O1xuXHQgICAgXHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRhaHQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG5cdCAgICBcdGNvbnN0IGxpID0gYDxsaSBpZD1cImtleS0ke2tleX1cIj5cblx0ICAgIFx0XHRcdFx0XHQ8c3Ryb25nPiR7bWVkaWFUeXBlRkJ9Ojwvc3Ryb25nPlxuXHQgICAgXHRcdFx0XHRcdDxwPiR7bWVkaWFUaXRsZUZCfTwvcD5cblx0ICAgIFx0XHRcdFx0XHQ8YnV0dG9uIGlkPVwiJHtrZXl9XCIgY2xhc3M9XCJkZWxldGVcIj48aSBjbGFzcz1cImZhcyBmYS10aW1lcy1jaXJjbGVcIj48L2k+PC9idXR0b24+XG5cdCAgICBcdFx0XHRcdDwvbGk+YFxuXHQgICAgXHRmYXZvdXJpdGVzTGlzdC5hcHBlbmQobGkpO1xuXHQgICAgXHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG5cdCAgICB9KTtcblx0ICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBkZWxldGUgaWNvbiBpcyBjbGlja2VkXG5cdCAgICBmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRjb25zdCBpZCA9ICQodGhpcykuYXR0cignaWQnKTtcblx0ICAgIFx0XG5cdCAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcblx0ICAgIH0pO1xuXG5cdCAgICAvLyBSZW1vdmUgYWxsIGl0ZW1zIGZyb20gRmlyZWJhc2Ugd2hlbiB0aGUgQ2xlYXIgYnV0dG9uIGlzIGNsaWNrZWRcblx0ICAgICQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdCAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3RgKS5zZXQobnVsbCk7XG5cdCAgICB9KTtcblx0ICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSB0aGUgZnJvbnQgZW5kIGFwcGVuZFxuXHQgICAgYXBwLm1lZGlhTGlzdC5saW1pdFRvTGFzdCgxMCkub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coZmF2b3VyaXRlc0xpc3QuZmluZChsaXN0SXRlbXMua2V5KSk7XG5cdFx0ZmF2b3VyaXRlc0xpc3QuZmluZChgI2tleS0ke2xpc3RJdGVtcy5rZXl9YCkucmVtb3ZlKCk7XG5cdFx0fSk7XG5cdCAgICAvLyAqKkNsaWNrIGJ1dHRvbiBvbiBsaXN0IGZvcm0gdG8gcHJpbnQgZmF2b3VyaXRlcyBsaXN0XG5cdCAgICBcblx0fSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExvZ28gQW5pbWF0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0bGV0IGxvZ29BbmltYXRlO1xuXG5cdGNvbnN0IGdldFJhbmRvbU51bWJlciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG5cblx0YXBwLmdldFJhbmRvbUNvbG91ciA9ICgpID0+IHtcblx0XHRjb25zdCByZWQgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBibHVlID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgZ3JlZW4gPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCByZ2IgPSBgcmdiKCR7cmVkfSwgJHtncmVlbn0sICR7Ymx1ZX0pYFxuXHRcdHJldHVybiByZ2I7XG5cdH07XG5cblx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuXHRcblx0Y29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHRvcFMgPSAoKSA9PiB7XG5cdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Ly8gVE9QIFBJRUNFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0Ly8gMk5EIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHQvLyAzUkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuXHRcdGN0eC5maWxsKCk7XG5cdH07XG5cblx0dG9wUygpO1xuXG5cdGxldCBvbmVMb2dvSW50ZXJ2YWwgPSAoKSA9PiB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gNTA7IGkgPSBpICsgMSkge1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTAwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTEwICsgaSksICgxMTAgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gY3R4LmFyYygoMjAwICsgaSksICgyMDAgKyBpKSwgMTAwLCAxICogTWF0aC5QSSwgMS43ICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTEwICsgaSksICgxMTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTIwICsgaSksICg5MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNDAgLSBpKSwgKDEyNSArIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRvcFMoKTtcblx0XHRcdH0sIChpKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDUwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTYwIC0gaSksICg2MCArIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyOTAgLSBpKSwgKDI5MCAtIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyBNSURETEUgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNjAgLSBpKSwgKDE2MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNzAgLSBpKSwgKDE0MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg1MCArIGkpLCAoMjEwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDkwICsgaSksICgxNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0fSwgKDUwICsgaSkpO1xuXHRcdH07XG5cdH07XG5cdFxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG5cdFx0bG9nb0FuaW1hdGUgPSBzZXRJbnRlcnZhbChvbmVMb2dvSW50ZXJ2YWwsIDEwMCk7XG5cdH0pO1xuXG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChsb2dvQW5pbWF0ZSk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdC8vIGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBjdHguYXJjKDEyNSwgMTE3LCA2MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwJztcblx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICcjMDAwJztcblx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHR9O1xuXHRcdFx0dG9wUygpO1xuXHRcdH0sIDEwMClcblx0XHRcblx0XHRcblx0fSk7XG5cdFxufVxuLy8gVGhpcyBydW5zIHRoZSBhcHBcbiQoZnVuY3Rpb24oKSB7XG5cdGFwcC5jb25maWcoKTtcblx0YXBwLmluaXQoKTtcbn0pOyJdfQ==
