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
		var $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find your results. They might not be available or your spelling is incorrect. Please try again.');
		console.log($noResultsError);
		$('#error').append($noResultsError);
	};

	// Event Listener to inlude everything that happens on form submission
	$('.media__form').on('submit', function (event) {
		// Prevent default for submit inputs
		event.preventDefault();

		app.userType = $('input[name=type]:checked').val();
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
				type: "" + app.userType,
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
			} else {
				// Display media results container with the right margins
				$('footer').css('margin-top', '0px');
				$('.media__results-container').css('margin-bottom', '50px').removeClass('hidden');
			};
			// If the media type is movies or shows, get results array from Promise #1 and map each movie title result to a promise for Promise #2. This will return an array of promises for API#2.
			if (app.userType === 'movies' || app.userType === 'shows') {
				var imdbPromiseArray = mediaInfoArray.map(function (title) {
					return app.getImdbRating(title.Name);
				});
				console.log(imdbPromiseArray);
				// Return a single array from the array of promises and display the results on the page.
				Promise.all(imdbPromiseArray).then(function (imdbResults) {
					console.log(imdbResults);
					app.imdbResultsArray = imdbResults;
					app.displayMedia(mediaInfoArray);
				});
				// For media types that are not movies or shows, display the results on the page
			} else {
				app.displayMedia(mediaInfoArray);
			};
		}).fail(function (err) {
			// Stretch Goal: Put something here
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
				var $mediaTypeTitle = $("<h2 class=\"media__type__title\">" + singleMedia.Type + ": " + singleMedia.Name + "</h2>");
				var $mediaDescriptionHeader = $('<h3>').addClass('media__description-header').text('Description');
				var $mediaDescription = $('<p>').addClass('media__description').text(singleMedia.wTeaser);
				var $mediaWiki = $('<a>').addClass('media__wiki').attr('href', singleMedia.wUrl).text('Wikipedia');
				var $mediaYouTube = $('<iframe>', {
					class: 'media__youtube',
					src: singleMedia.yUrl,
					id: singleMedia.yID,
					frameborder: 0,
					allowfullscreen: true
				});
				var $addButton = $('<input>').attr({
					type: 'button',
					value: 'Add to Favourites',
					form: 'add-button-form',
					class: 'add-button'
				});

				if (app.imdbResultsArray !== undefined) {
					app.imdbResultsArray.find(function (element) {
						if (singleMedia.Name === element.Title) {
							var $mediaImdb = $('<p>').addClass('imdb-rating').text(element.imdbRating + "/10");
							var $imdbLogoRating = $("<div class=\"imdb-container\"><div class=\"imdb-image-container\"><img src=\"https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg\" alt=\"IMDB Logo\"></div><p class=\"imdb-rating\">" + element.imdbRating + "/10</p></div>");
							// This accounts for results that do not have YouTube URLs
							if (singleMedia.yUrl === null) {
								var oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $imdbLogoRating, $addButton).addClass('result-container');
								mediaContainer.append(oneResultContainer);
							} else {
								var _oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $imdbLogoRating, $mediaYouTube, $addButton).addClass('result-container');
								mediaContainer.append(_oneResultContainer);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						var oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $addButton).addClass('result-container');
						mediaContainer.append(oneResultContainer);
					} else {
						var _oneResultContainer2 = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $mediaYouTube, $addButton).addClass('result-container');
						mediaContainer.append(_oneResultContainer2);
					};
				};
			});
		};
	});
	// ================================================
	// Firebase: Media Favourites List
	// ================================================
	// Event listener for adding media type and title to the favourites list
	mediaContainer.on('click', '.add-button', function (e) {
		// This variable stores the element(s) in the form I want to get value(s) from. In this case it's the <p> representing the media type and media title.
		var typeAndTitle = $(this).prevAll('.media__type__title')[0].innerText;

		var mediaObject = {
			// Remember: This is the same as typeAndTitle: typeAndTitle
			typeAndTitle: typeAndTitle
			// Add the information to Firebase
		};app.mediaList.push(mediaObject);
	});
	// Get the type and title information from Firebase
	app.mediaList.on('child_added', function (mediaInfo) {
		var data = mediaInfo.val();

		var mediaFB = data.typeAndTitle;
		var key = mediaInfo.key;
		// Create List Item that includes the type and title
		var li = "<li id=\"key-" + key + "\" class=\"favourites-list__list-item\">\n    \t\t\t\t\t<p>" + mediaFB + "</p>\n    \t\t\t\t\t<button id=\"" + key + "\" class=\"delete no-print\"><i class=\"fas fa-times-circle\"></i></button>\n    \t\t\t\t</li>";
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
	app.mediaList.on('child_removed', function (listItems) {

		favouritesList.find("#key-" + listItems.key).remove();
	});
	// Maximize and Minimize buttons for the Favourites List
	$('.favourites-maximize').click(function () {
		$('.favourites-list-window').slideDown(200).removeClass('hidden');
	});

	$('.favourites-minimize').click(function () {
		$('.favourites-list-window').slideUp(200).addClass('hidden');
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
		ctx.lineWidth = 7;
		ctx.strokeStyle = 'black';
		ctx.arc(125, 117, 50, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#FFC900';
		ctx.arc(125, 117, 50, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.closePath();
		// 1ST PIECE
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
					// 1ST PIECE
					ctx.beginPath();
					ctx.moveTo(100 + i, 100 - i);
					ctx.lineTo(150 + i, 75 - i);
					ctx.lineTo(110 + i, 110 - i);
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
					// 1ST PIECE
					ctx.beginPath();
					ctx.moveTo(150 - i, 50 + i);
					ctx.lineTo(200 - i, 25 + i);
					ctx.lineTo(160 - i, 60 + i);
					// 2ND PIECE
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
			topS = function topS() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				// OUTER CIRCLE
				ctx.beginPath();
				ctx.lineWidth = 7;
				ctx.strokeStyle = 'black';
				ctx.arc(125, 117, 50, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.closePath();
				ctx.beginPath();
				ctx.lineWidth = 5;
				ctx.strokeStyle = '#FFC900';
				ctx.arc(125, 117, 50, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.closePath();
				// 1ST PIECE
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

	// ================================================
	// Responsive Design
	// ================================================
	$('.media__type-label').click(function () {
		$('.media__form__type').addClass('hide');
		app.userType = $(this).text();
	});

	$('#all').click(function () {
		$('.media__form__type').addClass('hide');
		app.userType = null;
	});

	$('.burger-button').click(function () {
		$('.media__form__type').removeClass('hide');
	});
};
// This runs the app
$(function () {
	app.config();
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDLE1BQU0sa0JBQWtCLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0IsY0FBbEIsRUFBa0MsSUFBbEMsQ0FBdUMseUhBQXZDLENBQXhCO0FBQ0EsVUFBUSxHQUFSLENBQVksZUFBWjtBQUNBLElBQUUsUUFBRixFQUFZLE1BQVosQ0FBbUIsZUFBbkI7QUFDQSxFQUpEOztBQU1BO0FBQ0EsR0FBRSxjQUFGLEVBQWtCLEVBQWxCLENBQXFC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QUFFLE1BQUYsRUFBVSxLQUFWLENBQWdCLFlBQVc7QUFDMUIsSUFBRSxvQkFBRixFQUF3QixRQUF4QixDQUFpQyxNQUFqQztBQUNBLE1BQUksUUFBSixHQUFlLElBQWY7QUFDQSxFQUhEOztBQUtBLEdBQUUsZ0JBQUYsRUFBb0IsS0FBcEIsQ0FBMEIsWUFBVztBQUNwQyxJQUFFLG9CQUFGLEVBQXdCLFdBQXhCLENBQW9DLE1BQXBDO0FBQ0EsRUFGRDtBQUlBLENBM1hEO0FBNFhBO0FBQ0EsRUFBRSxZQUFXO0FBQ1osS0FBSSxNQUFKO0FBQ0EsS0FBSSxJQUFKO0FBQ0EsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENyZWF0ZSB2YXJpYWJsZSBmb3IgYXBwIG9iamVjdFxuY29uc3QgYXBwID0ge307XG5cbmFwcC5jb25maWcgPSAoKSA9PiB7ICAgXG4gICAgY29uc3QgY29uZmlnID0ge1xuXHQgICAgYXBpS2V5OiBcIkFJemFTeUFlX0xxWUxWbS1vVnNrOUdERWtaOV9GMXBoV2lTb3NMWVwiLFxuXHQgICAgYXV0aERvbWFpbjogXCJqcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2VhcHAuY29tXCIsXG5cdCAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL2pzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWlvLmNvbVwiLFxuXHQgICAgcHJvamVjdElkOiBcImpzLXN1bW1lci1wcm9qZWN0M1wiLFxuXHQgICAgc3RvcmFnZUJ1Y2tldDogXCJcIixcblx0ICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjEwNDc3OTMwMzQxNTVcIlxuXHR9O1xuICAgIC8vVGhpcyB3aWxsIGluaXRpYWxpemUgZmlyZWJhc2Ugd2l0aCBvdXIgY29uZmlnIG9iamVjdFxuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAvLyBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IGNvbm5lY3Rpb24gdG8gdGhlIGRhdGFiYXNlXG4gICAgYXBwLmRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcbiAgICAvLyBUaGlzIGNyZWF0ZXMgYSByZWZlcmVuY2UgdG8gYSBsb2NhdGlvbiBpbiB0aGUgZGF0YWJhc2UuIEkgb25seSBuZWVkIG9uZSBmb3IgdGhpcyBwcm9qZWN0IHRvIHN0b3JlIHRoZSBtZWRpYSBsaXN0XG4gICAgYXBwLm1lZGlhTGlzdCA9IGFwcC5kYXRhYmFzZS5yZWYoJy9tZWRpYUxpc3QnKTtcbn07XG5cbmFwcC5pbml0ID0gKCkgPT4ge1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTaW1pbGFyIGFuZCBPTURCIEFQSXM6IEdldCBSZXN1bHRzIGFuZCBkaXNwbGF5XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gU2ltaWxhciBBUEkgS2V5XG5cdGFwcC5zaW1pbGFyS2V5ID0gJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCc7XG5cblx0Ly8gT01EQiBBUEkgS2V5XG5cdGFwcC5vbWRiS2V5ID0gJzE2NjFmYTlkJztcblx0Ly8gRmlyZWJhc2UgdmFyaWFibGVzXG5cdGNvbnN0IG1lZGlhVHlwZUVsZW1lbnQgPSAkKCcubWVkaWFfX3R5cGUnKVxuXHRjb25zdCBtZWRpYVRpdGxlRWxlbWVudCA9ICQoJy5tZWRpYV9fdGl0bGUnKTtcblxuXHRjb25zdCBtZWRpYUNvbnRhaW5lciA9ICQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKTtcblx0Y29uc3QgZmF2b3VyaXRlc0xpc3QgPSAkKCcuZmF2b3VyaXRlcy1saXN0X19saXN0Jyk7XG5cdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGRpc3BsYXlzIGFuIGlubGluZSBlcnJvciB1bmRlciB0aGUgc2VhcmNoIGZpZWxkIHdoZW4gbm8gcmVzdWx0cyBhcmUgcmV0dXJuZWQgZnJvbSBBUEkjMSAoZW1wdHkgYXJyYXkpXG5cdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IgPSAoKSA9PiB7XG5cdFx0Y29uc3QgJG5vUmVzdWx0c0Vycm9yID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2lubGluZS1lcnJvcicpLnRleHQoJ1NvcnJ5LCB3ZSBhcmUgdW5hYmxlIHRvIGZpbmQgeW91ciByZXN1bHRzLiBUaGV5IG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgb3IgeW91ciBzcGVsbGluZyBpcyBpbmNvcnJlY3QuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0Y29uc29sZS5sb2coJG5vUmVzdWx0c0Vycm9yKTtcblx0XHQkKCcjZXJyb3InKS5hcHBlbmQoJG5vUmVzdWx0c0Vycm9yKTtcblx0fTtcblxuXHQvLyBFdmVudCBMaXN0ZW5lciB0byBpbmx1ZGUgZXZlcnl0aGluZyB0aGF0IGhhcHBlbnMgb24gZm9ybSBzdWJtaXNzaW9uXG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIFByZXZlbnQgZGVmYXVsdCBmb3Igc3VibWl0IGlucHV0c1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XG5cdFx0YXBwLnVzZXJUeXBlID0gJCgnaW5wdXRbbmFtZT10eXBlXTpjaGVja2VkJykudmFsKCk7XG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiB3aGF0IHRoZSB1c2VyIGVudGVyZWQgaW4gdGhlIHNlYXJjaCBmaWVsZFxuXHRcdGNvbnN0IHVzZXJJbnB1dCA9ICQoJyNtZWRpYV9fc2VhcmNoJykudmFsKCk7XG5cdFx0Ly8gUHJvbWlzZSBmb3IgQVBJIzFcblx0XHRhcHAuZ2V0TWVkaWEgPVxuXHRcdCAgJC5hamF4KHtcblx0XHQgICAgdXJsOiAnaHR0cHM6Ly90YXN0ZWRpdmUuY29tL2FwaS9zaW1pbGFyJyxcblx0XHQgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgZGF0YVR5cGU6ICdqc29ucCcsXG5cdFx0ICAgIGRhdGE6IHtcblx0XHQgICAgICBrOiAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJyxcblx0XHQgICAgICBxOiBgJHt1c2VySW5wdXR9YCxcblx0XHQgICAgICB0eXBlOiBgJHthcHAudXNlclR5cGV9YCxcblx0XHQgICAgICBpbmZvOiAxLFxuXHRcdCAgICAgIGxpbWl0OiAxMFxuXHRcdCAgICB9XG5cdFx0fSk7XG5cblx0XHQvLyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBwYXNzIG1vdmllIHRpdGxlcyBmcm9tIFByb21pc2UjMSBpbnRvIFByb21pc2UgIzJcblx0XHRhcHAuZ2V0SW1kYlJhdGluZyA9IChtb3ZpZVRpdGxlKSA9PiB7XG5cdFx0XHQvLyBSZXR1cm4gUHJvbWlzZSMyIHdoaWNoIGluY2x1ZGVzIHRoZSBtb3ZpZSB0aXRsZSBmcm9tIFByb21pc2UjMVxuXHRcdCAgICByZXR1cm4gJC5hamF4KHtcblx0XHQgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5vbWRiYXBpLmNvbScsXG5cdFx0ICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgICAgICAgICAgIGRhdGE6IHtcblx0XHQgICAgICAgICAgICAgICBhcGlrZXk6ICcxNjYxZmE5ZCcsXG5cdFx0ICAgICAgICAgICAgICAgdDogbW92aWVUaXRsZVxuXHRcdCAgICAgICAgICAgICB9XG5cdFx0ICAgIH0pO1xuXHRcdH07XG5cdFx0Ly8gR2V0IHJlc3VsdHMgZm9yIFByb21pc2UjMVxuXHQgICAgJC53aGVuKGFwcC5nZXRNZWRpYSkudGhlbigobWVkaWFJbmZvKSA9PiB7XG5cdCAgICAgIGNvbnN0IG1lZGlhSW5mb0FycmF5ID0gbWVkaWFJbmZvLlNpbWlsYXIuUmVzdWx0cztcblx0ICAgICAgY29uc29sZS5sb2cobWVkaWFJbmZvQXJyYXkpO1xuXG5cdCAgICAgIGFwcC5ub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHQgICAgICBpZiAoYXBwLm5vUmVzdWx0cyA9PT0gdHJ1ZSkge1xuXHQgICAgICBcdCQoJyNlcnJvcicpLmVtcHR5KCk7XG5cdCAgICAgIFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICBcdC8vIERpc3BsYXkgbWVkaWEgcmVzdWx0cyBjb250YWluZXIgd2l0aCB0aGUgcmlnaHQgbWFyZ2luc1xuXHQgICAgICBcdCQoJ2Zvb3RlcicpLmNzcygnbWFyZ2luLXRvcCcsICcwcHgnKTtcblx0ICAgICAgXHQkKCcubWVkaWFfX3Jlc3VsdHMtY29udGFpbmVyJykuY3NzKCdtYXJnaW4tYm90dG9tJywgJzUwcHgnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdCAgICAgIH07XG5cdCAgXHRcdC8vIElmIHRoZSBtZWRpYSB0eXBlIGlzIG1vdmllcyBvciBzaG93cywgZ2V0IHJlc3VsdHMgYXJyYXkgZnJvbSBQcm9taXNlICMxIGFuZCBtYXAgZWFjaCBtb3ZpZSB0aXRsZSByZXN1bHQgdG8gYSBwcm9taXNlIGZvciBQcm9taXNlICMyLiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHByb21pc2VzIGZvciBBUEkjMi5cblx0ICAgICAgaWYgKGFwcC51c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgYXBwLnVzZXJUeXBlID09PSAnc2hvd3MnKSB7XG5cdFx0ICAgICAgY29uc3QgaW1kYlByb21pc2VBcnJheSA9IG1lZGlhSW5mb0FycmF5Lm1hcCgodGl0bGUpID0+IHtcblx0XHQgICAgICAgIHJldHVybiBhcHAuZ2V0SW1kYlJhdGluZyh0aXRsZS5OYW1lKTtcblx0XHQgICAgICB9KTtcblx0XHQgICAgICBjb25zb2xlLmxvZyhpbWRiUHJvbWlzZUFycmF5KTtcblx0XHQgICAgICAvLyBSZXR1cm4gYSBzaW5nbGUgYXJyYXkgZnJvbSB0aGUgYXJyYXkgb2YgcHJvbWlzZXMgYW5kIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2UuXG5cdFx0ICAgICAgUHJvbWlzZS5hbGwoaW1kYlByb21pc2VBcnJheSkudGhlbigoaW1kYlJlc3VsdHMpID0+IHtcblx0XHQgICAgICAgIGNvbnNvbGUubG9nKGltZGJSZXN1bHRzKTtcblx0XHQgICAgICAgIGFwcC5pbWRiUmVzdWx0c0FycmF5ID0gaW1kYlJlc3VsdHM7XG5cdFx0ICAgICAgICBhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHQgICAgICB9KTtcblx0XHQgICAgLy8gRm9yIG1lZGlhIHR5cGVzIHRoYXQgYXJlIG5vdCBtb3ZpZXMgb3Igc2hvd3MsIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2Vcblx0XHQgICAgfSBlbHNlIHtcblx0XHQgIFx0XHRhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHQgICAgfTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKGVycikge1xuXHRcdFx0Ly8gU3RyZXRjaCBHb2FsOiBQdXQgc29tZXRoaW5nIGhlcmVcblx0XHQgIGNvbnNvbGUubG9nKGVycik7XG5cdFx0fSk7XG5cdFx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIGRpc3BsYXkgdGhlIEFQSSBwcm9taXNlIHJlc3VsdHMgb250byB0aGUgcGFnZVxuXHQgICAgYXBwLmRpc3BsYXlNZWRpYSA9IChhbGxNZWRpYUFycmF5KSA9PiB7XG5cdCAgICBcdC8vIFRoaXMgbWV0aG9kIHJlbW92ZXMgY2hpbGQgbm9kZXMgZnJvbSB0aGUgbWVkaWEgcmVzdWx0cyBlbGVtZW50KHByZXZpb3VzIHNlYXJjaCByZXN1bHRzKSwgYnV0IG9ubHkgd2hlbiB0aGUgc2VhcmNoIHF1ZXJ5IGJyaW5ncyBuZXcgcmVzdWx0cy4gT3RoZXJ3aXNlIGl0IHdpbGwga2VlcCB0aGUgY3VycmVudCByZXN1bHRzIGFuZCBkaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UuXG5cdCAgICBcdGlmIChhcHAubm9SZXN1bHRzID09PSBmYWxzZSkge1xuXHQgICAgXHRcdCQoJyNlcnJvcicpLmVtcHR5KCk7XG5cdCAgICBcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmVtcHR5KCk7XG5cdCAgICBcdH07XG5cblx0ICAgIFx0YWxsTWVkaWFBcnJheS5mb3JFYWNoKChzaW5nbGVNZWRpYSkgPT4ge1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVR5cGVUaXRsZSA9ICQoYDxoMiBjbGFzcz1cIm1lZGlhX190eXBlX190aXRsZVwiPiR7c2luZ2xlTWVkaWEuVHlwZX06ICR7c2luZ2xlTWVkaWEuTmFtZX08L2gyPmApO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyID0gJCgnPGgzPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24taGVhZGVyJykudGV4dCgnRGVzY3JpcHRpb24nKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbiA9ICQoJzxwPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24nKS50ZXh0KHNpbmdsZU1lZGlhLndUZWFzZXIpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVdpa2kgPSAkKCc8YT4nKS5hZGRDbGFzcygnbWVkaWFfX3dpa2knKS5hdHRyKCdocmVmJywgc2luZ2xlTWVkaWEud1VybCkudGV4dCgnV2lraXBlZGlhJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHQgICAgXHRcdFx0Y2xhc3M6ICdtZWRpYV9feW91dHViZScsXG5cdCAgICBcdFx0XHRzcmM6IHNpbmdsZU1lZGlhLnlVcmwsXG5cdCAgICBcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHQgICAgXHRcdFx0ZnJhbWVib3JkZXI6IDAsXG5cdCAgICBcdFx0XHRhbGxvd2Z1bGxzY3JlZW46IHRydWVcblx0ICAgIFx0XHR9KTtcdFxuXHQgICAgXHRcdGNvbnN0ICRhZGRCdXR0b24gPSAkKCc8aW5wdXQ+JykuYXR0cih7XG5cdCAgICBcdFx0XHR0eXBlOiAnYnV0dG9uJyxcblx0ICAgIFx0XHRcdHZhbHVlOiAnQWRkIHRvIEZhdm91cml0ZXMnLFxuXHQgICAgXHRcdFx0Zm9ybTogJ2FkZC1idXR0b24tZm9ybScsXG5cdCAgICBcdFx0XHRjbGFzczogJ2FkZC1idXR0b24nXG5cdCAgICBcdFx0fSk7XG5cblx0ICAgIFx0XHRpZiAoYXBwLmltZGJSZXN1bHRzQXJyYXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdCAgICBcdFx0YXBwLmltZGJSZXN1bHRzQXJyYXkuZmluZCgoZWxlbWVudCkgPT4ge1xuXHRcdCAgICBcdFx0XHRpZiAoc2luZ2xlTWVkaWEuTmFtZSA9PT0gZWxlbWVudC5UaXRsZSkge1xuXHRcdCAgICBcdFx0XHRcdGNvbnN0ICRtZWRpYUltZGIgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW1kYi1yYXRpbmcnKS50ZXh0KGAke2VsZW1lbnQuaW1kYlJhdGluZ30vMTBgKTtcblx0XHQgICAgXHRcdFx0XHRjb25zdCAkaW1kYkxvZ29SYXRpbmcgPSAkKGA8ZGl2IGNsYXNzPVwiaW1kYi1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwiaW1kYi1pbWFnZS1jb250YWluZXJcIj48aW1nIHNyYz1cImh0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvNi82OS9JTURCX0xvZ29fMjAxNi5zdmdcIiBhbHQ9XCJJTURCIExvZ29cIj48L2Rpdj48cCBjbGFzcz1cImltZGItcmF0aW5nXCI+JHtlbGVtZW50LmltZGJSYXRpbmd9LzEwPC9wPjwvZGl2PmApO1xuXHRcdCAgICBcdFx0XHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRcdFx0Y29uc3Qgb25lUmVzdWx0Q29udGFpbmVyID0gJCgnPGRpdj4nKS5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRpbWRiTG9nb1JhdGluZywgJGFkZEJ1dHRvbikuYWRkQ2xhc3MoJ3Jlc3VsdC1jb250YWluZXInKTtcblx0XHQgICAgXHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZChvbmVSZXN1bHRDb250YWluZXIpO1xuXHRcdCAgICBcdFx0XHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHRcdFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKS5hZGRDbGFzcygncmVzdWx0LWNvbnRhaW5lcicpO1xuXHRcdCAgICBcdFx0XHRcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKG9uZVJlc3VsdENvbnRhaW5lcik7XG5cdFx0ICAgIFx0XHRcdFx0fTtcblx0XHQgICAgXHRcdFx0fTtcblx0XHQgICAgXHRcdH0pO1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhcHBlbmRzIHRoZSByZXN1bHRzIGZyb20gQVBJIzEgZm9yIG5vbi1tb3ZpZS9zaG93IG1lZGlhIHR5cGVzLlxuXHRcdCAgICBcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGFkZEJ1dHRvbikuYWRkQ2xhc3MoJ3Jlc3VsdC1jb250YWluZXInKTtcblx0XHQgICAgXHRcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKG9uZVJlc3VsdENvbnRhaW5lcik7XG5cdFx0ICAgIFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0Y29uc3Qgb25lUmVzdWx0Q29udGFpbmVyID0gJCgnPGRpdj4nKS5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRtZWRpYVlvdVR1YmUsICRhZGRCdXR0b24pLmFkZENsYXNzKCdyZXN1bHQtY29udGFpbmVyJyk7XG5cdFx0ICAgIFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQob25lUmVzdWx0Q29udGFpbmVyKTtcblx0XHQgICAgXHRcdH07XG5cdFx0ICAgIFx0fTtcblx0ICAgIFx0fSk7XG5cdCAgICB9O1xuXHR9KTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRmlyZWJhc2U6IE1lZGlhIEZhdm91cml0ZXMgTGlzdFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIEV2ZW50IGxpc3RlbmVyIGZvciBhZGRpbmcgbWVkaWEgdHlwZSBhbmQgdGl0bGUgdG8gdGhlIGZhdm91cml0ZXMgbGlzdFxuICAgIG1lZGlhQ29udGFpbmVyLm9uKCdjbGljaycsICcuYWRkLWJ1dHRvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAvLyBUaGlzIHZhcmlhYmxlIHN0b3JlcyB0aGUgZWxlbWVudChzKSBpbiB0aGUgZm9ybSBJIHdhbnQgdG8gZ2V0IHZhbHVlKHMpIGZyb20uIEluIHRoaXMgY2FzZSBpdCdzIHRoZSA8cD4gcmVwcmVzZW50aW5nIHRoZSBtZWRpYSB0eXBlIGFuZCBtZWRpYSB0aXRsZS5cbiAgICAgICAgY29uc3QgdHlwZUFuZFRpdGxlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3R5cGVfX3RpdGxlJylbMF0uaW5uZXJUZXh0XG4gICAgICBcbiAgICAgICAgY29uc3QgbWVkaWFPYmplY3QgPSB7XG4gICAgICAgIC8vIFJlbWVtYmVyOiBUaGlzIGlzIHRoZSBzYW1lIGFzIHR5cGVBbmRUaXRsZTogdHlwZUFuZFRpdGxlXG4gICAgICAgIFx0dHlwZUFuZFRpdGxlXG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRoZSBpbmZvcm1hdGlvbiB0byBGaXJlYmFzZVxuICAgICAgICBhcHAubWVkaWFMaXN0LnB1c2gobWVkaWFPYmplY3QpO1xuICAgIH0pO1xuICAgIC8vIEdldCB0aGUgdHlwZSBhbmQgdGl0bGUgaW5mb3JtYXRpb24gZnJvbSBGaXJlYmFzZVxuICAgIGFwcC5tZWRpYUxpc3Qub24oJ2NoaWxkX2FkZGVkJyxmdW5jdGlvbihtZWRpYUluZm8pIHtcbiAgICBcdGNvbnN0IGRhdGEgPSBtZWRpYUluZm8udmFsKCk7XG4gICAgXHRcbiAgICBcdGNvbnN0IG1lZGlhRkIgPSBkYXRhLnR5cGVBbmRUaXRsZTtcbiAgICBcdGNvbnN0IGtleSA9IG1lZGlhSW5mby5rZXk7XG4gICAgXHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRoYXQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG4gICAgXHRjb25zdCBsaSA9IGA8bGkgaWQ9XCJrZXktJHtrZXl9XCIgY2xhc3M9XCJmYXZvdXJpdGVzLWxpc3RfX2xpc3QtaXRlbVwiPlxuICAgIFx0XHRcdFx0XHQ8cD4ke21lZGlhRkJ9PC9wPlxuICAgIFx0XHRcdFx0XHQ8YnV0dG9uIGlkPVwiJHtrZXl9XCIgY2xhc3M9XCJkZWxldGUgbm8tcHJpbnRcIj48aSBjbGFzcz1cImZhcyBmYS10aW1lcy1jaXJjbGVcIj48L2k+PC9idXR0b24+XG4gICAgXHRcdFx0XHQ8L2xpPmBcbiAgICBcdGZhdm91cml0ZXNMaXN0LmFwcGVuZChsaSk7XG4gICAgXHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIGRlbGV0ZSBpY29uIGlzIGNsaWNrZWRcbiAgICBmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIFx0Y29uc3QgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgXHRcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBDbGVhciBidXR0b24gaXMgY2xpY2tlZFxuICAgICQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgXHRhcHAuZGF0YWJhc2UucmVmKGAvbWVkaWFMaXN0YCkuc2V0KG51bGwpO1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSB0aGUgZnJvbnQgZW5kIGFwcGVuZFxuICAgIGFwcC5tZWRpYUxpc3Qub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdFxuXHRmYXZvdXJpdGVzTGlzdC5maW5kKGAja2V5LSR7bGlzdEl0ZW1zLmtleX1gKS5yZW1vdmUoKTtcblx0fSk7XHRcblx0Ly8gTWF4aW1pemUgYW5kIE1pbmltaXplIGJ1dHRvbnMgZm9yIHRoZSBGYXZvdXJpdGVzIExpc3Rcblx0JCgnLmZhdm91cml0ZXMtbWF4aW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZURvd24oMjAwKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdH0pO1xuXG5cdCQoJy5mYXZvdXJpdGVzLW1pbmltaXplJykuY2xpY2soZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5mYXZvdXJpdGVzLWxpc3Qtd2luZG93Jykuc2xpZGVVcCgyMDApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExvZ28gQW5pbWF0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0bGV0IGxvZ29BbmltYXRlO1xuXG5cdGNvbnN0IGdldFJhbmRvbU51bWJlciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG5cblx0YXBwLmdldFJhbmRvbUNvbG91ciA9ICgpID0+IHtcblx0XHRjb25zdCByZWQgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBibHVlID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgZ3JlZW4gPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCByZ2IgPSBgcmdiKCR7cmVkfSwgJHtncmVlbn0sICR7Ymx1ZX0pYFxuXHRcdHJldHVybiByZ2I7XG5cdH07XG5cblx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuXHRcblx0Y29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHRvcFMgPSAoKSA9PiB7XG5cdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDc7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5saW5lV2lkdGggPSA1O1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Ly8gMVNUIFBJRUNFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0Ly8gMk5EIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHQvLyAzUkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5maWxsKCk7XG5cdH07XG5cblx0dG9wUygpO1xuXG5cdGxldCBvbmVMb2dvSW50ZXJ2YWwgPSAoKSA9PiB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gNTA7IGkgPSBpICsgMSkge1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gMVNUIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTAwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTEwICsgaSksICgxMTAgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTEwICsgaSksICgxMTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTIwICsgaSksICg5MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNDAgLSBpKSwgKDEyNSArIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRvcFMoKTtcblx0XHRcdH0sIChpKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIDFTVCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDUwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTYwIC0gaSksICg2MCArIGkpKTtcblx0XHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNjAgLSBpKSwgKDE2MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNzAgLSBpKSwgKDE0MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg1MCArIGkpLCAoMjEwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDkwICsgaSksICgxNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0fSwgKDUwICsgaSkpO1xuXHRcdH07XG5cdH07XG5cdFxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG5cdFx0bG9nb0FuaW1hdGUgPSBzZXRJbnRlcnZhbChvbmVMb2dvSW50ZXJ2YWwsIDEwMCk7XG5cdH0pO1xuXG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChsb2dvQW5pbWF0ZSk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubGluZVdpZHRoID0gNztcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Ly8gMVNUIFBJRUNFXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubW92ZVRvKDEwMCwgMTAwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHRcdC8vIDJORCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNTAsIDEzNSk7XG5cdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMDAsIDE2MCk7XG5cdFx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRcdGN0eC5maWxsU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0fTtcblx0XHRcdHRvcFMoKTtcblx0XHR9LCAxMDApXG5cdFx0XG5cdFx0XG5cdH0pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFJlc3BvbnNpdmUgRGVzaWduXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0JCgnLm1lZGlhX190eXBlLWxhYmVsJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0JCgnLm1lZGlhX19mb3JtX190eXBlJykuYWRkQ2xhc3MoJ2hpZGUnKTtcblx0XHRhcHAudXNlclR5cGUgPSAkKHRoaXMpLnRleHQoKTtcblx0fSk7XG5cdFx0XG5cdCQoJyNhbGwnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHQkKCcubWVkaWFfX2Zvcm1fX3R5cGUnKS5hZGRDbGFzcygnaGlkZScpO1xuXHRcdGFwcC51c2VyVHlwZSA9IG51bGw7XG5cdH0pO1xuXG5cdCQoJy5idXJnZXItYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0JCgnLm1lZGlhX19mb3JtX190eXBlJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblx0fSk7XG5cbn1cbi8vIFRoaXMgcnVucyB0aGUgYXBwXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuY29uZmlnKCk7XG5cdGFwcC5pbml0KCk7XG59KTsiXX0=
