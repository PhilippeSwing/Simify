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
				// q: 'superman',
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
			} else {
				// Display media results container with the right margins
				$('footer').css('margin-top', '0px');
				$('.media__results-container').css('margin-bottom', '50px').removeClass('hidden');
			};
			// If the media type is movies or shows, get results array from Promise #1 and map each movie title result to a promise for Promise #2. This will return an array of promises for API#2.
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
			// } else if (userType === 'music' || userType === 'books' || userType === 'authors' || userType === 'games'){
			// 	app.displayMedia(mediaInfoArray);
			// };
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
				// KEEPING TYPE AND TITLE SEPARATE
				// const $mediaType = $('<h2>').addClass('media__type').text(singleMedia.Type);
				// const $mediaTitle = $('<h2>').addClass('media__title').text(singleMedia.Name);
				// COMBINING TYPE AND TITLE
				// const $mediaTypeTitle = $(`<div class="media__type__title-container"><h2 class="media__type">${singleMedia.Type}:</h2><h2 class="media__title">${singleMedia.Name}</h2></div>`);
				// COMBINING TYPE AND TITLE IN ONE H2
				var $mediaTypeTitle = $("<h2 class=\"media__type__title\">" + singleMedia.Type + ": " + singleMedia.Name + "</h2>");
				var $mediaDescriptionHeader = $('<h3>').addClass('media__description-header').text('Description');
				var $mediaDescription = $('<p>').addClass('media__description').text(singleMedia.wTeaser);
				var $mediaWiki = $('<a>').addClass('media__wiki').attr('href', singleMedia.wUrl).text('Wikipedia');
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
					value: 'Add to Favourites',
					form: 'add-button-form',
					class: 'add-button'
				});

				// const $addButton = $(`<form><input type="button" value="Add to Favourites" form="add-button-form" class="add-button"></input></form>`);
				// ???IS THERE A WAY TO APPEND AN INPUT INSIDE OF A FORM??? IF NOT< JUST DO INPUT AND USE 'onCLick' event listener to submit the media typeand title to Firebase.

				// const $addForm = `<form id="add-button-form">${$addButton}</form>`;

				// console.log(app.imdbResultsArray);

				// This matches the movie or show title from API#1 with API#2. It then creates a variable for the IMDB Rating returned from API#2 and appends it to the page.
				if (app.imdbResultsArray !== undefined) {
					app.imdbResultsArray.find(function (element) {
						if (singleMedia.Name === element.Title) {
							var $mediaImdb = $('<p>').addClass('imdb-rating').text(element.imdbRating + "/10");
							// const $imdbLogo = $('<img>').addClass('imdb-logo').attr('src', 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg');
							var $imdbLogoRating = $("<div class=\"imdb-container\"><div class=\"imdb-image-container\"><img src=\"https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg\" alt=\"IMDB Logo\"></div><p class=\"imdb-rating\">" + element.imdbRating + "/10</p></div>");
							// This accounts for results that do not have YouTube URLs
							if (singleMedia.yUrl === null) {
								mediaContainer.append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $imdbLogoRating, $addButton);
							} else {
								mediaContainer.append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $imdbLogoRating, $mediaYouTube, $addButton);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						mediaContainer.append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $addButton);
					} else {
						mediaContainer.append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $mediaYouTube, $addButton);
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
		// const type = $(this).prevAll('.media__type')[0].innerText;
		// const title = $(this).prevAll('.media__title')[0].innerText;
		var typeAndTitle = $(this).prevAll('.media__type__title')[0].innerText;

		var mediaObject = {
			// type,
			// title
			typeAndTitle: typeAndTitle
			// Add the information to Firebase
		};app.mediaList.push(mediaObject);
	});
	// console.log(app.mediaList);
	// Get the type and title information from Firebase
	app.mediaList.limitToLast(5).on('child_added', function (mediaInfo) {
		// console.log(mediaInfo);
		var data = mediaInfo.val();
		// const mediaTypeFB = data.type;
		// const mediaTitleFB = data.title;
		var mediaFB = data.typeAndTitle;
		var key = mediaInfo.key;
		// Create List Item taht includes the type and title
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
	app.mediaList.limitToLast(5).on('child_removed', function (listItems) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1Qyx5SEFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixF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QUosQ0FBVyxHQUFYLEVBQWdCLEVBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsRUFBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0E7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLFNBQUosR0FBZ0IsU0FBaEI7QUFDQSxRQUFJLElBQUo7QUFDQyxJQTlCRDtBQStCQTtBQUNBLEdBbkNELEVBbUNHLEdBbkNIO0FBc0NBLEVBekNEO0FBMkNBLENBbFlEO0FBbVlBO0FBQ0EsRUFBRSxZQUFXO0FBQ1osS0FBSSxNQUFKO0FBQ0EsS0FBSSxJQUFKO0FBQ0EsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENyZWF0ZSB2YXJpYWJsZSBmb3IgYXBwIG9iamVjdFxuY29uc3QgYXBwID0ge307XG5cbmFwcC5jb25maWcgPSAoKSA9PiB7ICAgXG4gICAgY29uc3QgY29uZmlnID0ge1xuXHQgICAgYXBpS2V5OiBcIkFJemFTeUFlX0xxWUxWbS1vVnNrOUdERWtaOV9GMXBoV2lTb3NMWVwiLFxuXHQgICAgYXV0aERvbWFpbjogXCJqcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2VhcHAuY29tXCIsXG5cdCAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL2pzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWlvLmNvbVwiLFxuXHQgICAgcHJvamVjdElkOiBcImpzLXN1bW1lci1wcm9qZWN0M1wiLFxuXHQgICAgc3RvcmFnZUJ1Y2tldDogXCJcIixcblx0ICAgIG1lc3NhZ2luZ1NlbmRlcklkOiBcIjEwNDc3OTMwMzQxNTVcIlxuXHR9O1xuICAgIC8vVGhpcyB3aWxsIGluaXRpYWxpemUgZmlyZWJhc2Ugd2l0aCBvdXIgY29uZmlnIG9iamVjdFxuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbiAgICAvLyBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgbmV3IGNvbm5lY3Rpb24gdG8gdGhlIGRhdGFiYXNlXG4gICAgYXBwLmRhdGFiYXNlID0gZmlyZWJhc2UuZGF0YWJhc2UoKTtcbiAgICAvLyBUaGlzIGNyZWF0ZXMgYSByZWZlcmVuY2UgdG8gYSBsb2NhdGlvbiBpbiB0aGUgZGF0YWJhc2UuIEkgb25seSBuZWVkIG9uZSBmb3IgdGhpcyBwcm9qZWN0IHRvIHN0b3JlIHRoZSBtZWRpYSBsaXN0XG4gICAgYXBwLm1lZGlhTGlzdCA9IGFwcC5kYXRhYmFzZS5yZWYoJy9tZWRpYUxpc3QnKTtcbn07XG5cbmFwcC5pbml0ID0gKCkgPT4ge1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBTaW1pbGFyIGFuZCBPTURCIEFQSXM6IEdldCBSZXN1bHRzIGFuZCBkaXNwbGF5XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gU2ltaWxhciBBUEkgS2V5XG5cdGFwcC5zaW1pbGFyS2V5ID0gJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCc7XG5cblx0Ly8gT01EQiBBUEkgS2V5XG5cdGFwcC5vbWRiS2V5ID0gJzE2NjFmYTlkJztcblx0Ly8gRmlyZWJhc2UgdmFyaWFibGVzXG5cdGNvbnN0IG1lZGlhVHlwZUVsZW1lbnQgPSAkKCcubWVkaWFfX3R5cGUnKVxuXHRjb25zdCBtZWRpYVRpdGxlRWxlbWVudCA9ICQoJy5tZWRpYV9fdGl0bGUnKTtcblxuXHRjb25zdCBtZWRpYUNvbnRhaW5lciA9ICQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKTtcblx0Y29uc3QgZmF2b3VyaXRlc0xpc3QgPSAkKCcuZmF2b3VyaXRlcy1saXN0X19saXN0Jyk7XG5cdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGRpc3BsYXlzIGFuIGlubGluZSBlcnJvciB1bmRlciB0aGUgc2VhcmNoIGZpZWxkIHdoZW4gbm8gcmVzdWx0cyBhcmUgcmV0dXJuZWQgZnJvbSBBUEkjMSAoZW1wdHkgYXJyYXkpXG5cdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IgPSAoKSA9PiB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ2Vycm9yIGZ1bmN0aW9uIHdvcmtzJylcblx0XHRjb25zdCAkbm9SZXN1bHRzRXJyb3IgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW5saW5lLWVycm9yJykudGV4dCgnU29ycnksIHdlIGFyZSB1bmFibGUgdG8gZmluZCB5b3VyIHJlc3VsdHMuIFRoZXkgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBvciB5b3VyIHNwZWxsaW5nIGlzIGluY29ycmVjdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHRjb25zb2xlLmxvZygkbm9SZXN1bHRzRXJyb3IpO1xuXHRcdCQoJyNlcnJvcicpLmFwcGVuZCgkbm9SZXN1bHRzRXJyb3IpO1xuXHR9O1xuXHQvLyBjb25zb2xlLmxvZyhhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKTtcblxuXHQvLyBFdmVudCBMaXN0ZW5lciB0byBjaW5sdWRlIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIG9uIGZvcm0gc3VibWlzc2lvblxuXHQkKCcubWVkaWFfX2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIHN1Ym1pdCBpbnB1dHNcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFxuXHRcdGNvbnN0IHVzZXJUeXBlID0gJCgnaW5wdXRbbmFtZT10eXBlXTpjaGVja2VkJykudmFsKCk7XG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiB3aGF0IHRoZSB1c2VyIGVudGVyZWQgaW4gdGhlIHNlYXJjaCBmaWVsZFxuXHRcdGNvbnN0IHVzZXJJbnB1dCA9ICQoJyNtZWRpYV9fc2VhcmNoJykudmFsKCk7XG5cdFx0Ly8gUHJvbWlzZSBmb3IgQVBJIzFcblx0XHRhcHAuZ2V0TWVkaWEgPVxuXHRcdCAgJC5hamF4KHtcblx0XHQgICAgdXJsOiAnaHR0cHM6Ly90YXN0ZWRpdmUuY29tL2FwaS9zaW1pbGFyJyxcblx0XHQgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgZGF0YVR5cGU6ICdqc29ucCcsXG5cdFx0ICAgIGRhdGE6IHtcblx0XHQgICAgICBrOiAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJyxcblx0XHQgICAgICBxOiBgJHt1c2VySW5wdXR9YCxcblx0XHQgICAgICAvLyBxOiAnc3VwZXJtYW4nLFxuXHRcdCAgICAgIHR5cGU6IGAke3VzZXJUeXBlfWAsXG5cdFx0ICAgICAgaW5mbzogMSxcblx0XHQgICAgICBsaW1pdDogMTBcblx0XHQgICAgfVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGFzcyBtb3ZpZSB0aXRsZXMgZnJvbSBQcm9taXNlIzEgaW50byBQcm9taXNlICMyXG5cdFx0YXBwLmdldEltZGJSYXRpbmcgPSAobW92aWVUaXRsZSkgPT4ge1xuXHRcdFx0Ly8gUmV0dXJuIFByb21pc2UjMiB3aGljaCBpbmNsdWRlcyB0aGUgbW92aWUgdGl0bGUgZnJvbSBQcm9taXNlIzFcblx0XHQgICAgcmV0dXJuICQuYWpheCh7XG5cdFx0ICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdCAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICAgICAgICAgICBkYXRhOiB7XG5cdFx0ICAgICAgICAgICAgICAgYXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdCAgICAgICAgICAgICAgIHQ6IG1vdmllVGl0bGVcblx0XHQgICAgICAgICAgICAgfVxuXHRcdCAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblxuXHQgICAgICBhcHAubm9SZXN1bHRzID0gJC5pc0VtcHR5T2JqZWN0KG1lZGlhSW5mb0FycmF5KTtcblx0ICAgICAgaWYgKGFwcC5ub1Jlc3VsdHMgPT09IHRydWUpIHtcblx0ICAgICAgXHQkKCcjZXJyb3InKS5lbXB0eSgpO1xuXHQgICAgICBcdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IoKTtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgXHQvLyBEaXNwbGF5IG1lZGlhIHJlc3VsdHMgY29udGFpbmVyIHdpdGggdGhlIHJpZ2h0IG1hcmdpbnNcblx0ICAgICAgXHQkKCdmb290ZXInKS5jc3MoJ21hcmdpbi10b3AnLCAnMHB4Jyk7XG5cdCAgICAgIFx0JCgnLm1lZGlhX19yZXN1bHRzLWNvbnRhaW5lcicpLmNzcygnbWFyZ2luLWJvdHRvbScsICc1MHB4JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHQgICAgICB9O1xuXHQgIFx0XHQvLyBJZiB0aGUgbWVkaWEgdHlwZSBpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmICh1c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgdXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgICB9IGVsc2Uge1xuXHRcdCAgXHRcdGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICB9O1xuXHRcdCAgLy8gfSBlbHNlIGlmICh1c2VyVHlwZSA9PT0gJ211c2ljJyB8fCB1c2VyVHlwZSA9PT0gJ2Jvb2tzJyB8fCB1c2VyVHlwZSA9PT0gJ2F1dGhvcnMnIHx8IHVzZXJUeXBlID09PSAnZ2FtZXMnKXtcblx0XHQgIC8vIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAvLyB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0ICAgIGFwcC5kaXNwbGF5TWVkaWEgPSAoYWxsTWVkaWFBcnJheSkgPT4ge1xuXHQgICAgXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIG1lZGlhIHJlc3VsdHMgZWxlbWVudChwcmV2aW91cyBzZWFyY2ggcmVzdWx0cyksIGJ1dCBvbmx5IHdoZW4gdGhlIHNlYXJjaCBxdWVyeSBicmluZ3MgbmV3IHJlc3VsdHMuIE90aGVyd2lzZSBpdCB3aWxsIGtlZXAgdGhlIGN1cnJlbnQgcmVzdWx0cyBhbmQgZGlzcGxheSBhbiBlcnJvciBtZXNzYWdlLlxuXHQgICAgXHRpZiAoYXBwLm5vUmVzdWx0cyA9PT0gZmFsc2UpIHtcblx0ICAgIFx0XHQkKCcjZXJyb3InKS5lbXB0eSgpO1xuXHQgICAgXHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5lbXB0eSgpO1xuXHQgICAgXHR9O1xuXG5cdCAgICBcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0ICAgIFx0XHQvLyBGb3IgZWFjaCByZXN1bHQgaW4gdGhlIGFycmF5IHJldHVybmVkIGZyb20gQVBJIzEsIGNyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nLlxuXHQgICAgXHRcdC8vIEtFRVBJTkcgVFlQRSBBTkQgVElUTEUgU0VQQVJBVEVcblx0ICAgIFx0XHQvLyBjb25zdCAkbWVkaWFUeXBlID0gJCgnPGgyPicpLmFkZENsYXNzKCdtZWRpYV9fdHlwZScpLnRleHQoc2luZ2xlTWVkaWEuVHlwZSk7XG5cdCAgICBcdFx0Ly8gY29uc3QgJG1lZGlhVGl0bGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190aXRsZScpLnRleHQoc2luZ2xlTWVkaWEuTmFtZSk7XG5cdCAgICBcdFx0Ly8gQ09NQklOSU5HIFRZUEUgQU5EIFRJVExFXG5cdCAgICBcdFx0Ly8gY29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGRpdiBjbGFzcz1cIm1lZGlhX190eXBlX190aXRsZS1jb250YWluZXJcIj48aDIgY2xhc3M9XCJtZWRpYV9fdHlwZVwiPiR7c2luZ2xlTWVkaWEuVHlwZX06PC9oMj48aDIgY2xhc3M9XCJtZWRpYV9fdGl0bGVcIj4ke3NpbmdsZU1lZGlhLk5hbWV9PC9oMj48L2Rpdj5gKTtcblx0ICAgIFx0XHQvLyBDT01CSU5JTkcgVFlQRSBBTkQgVElUTEUgSU4gT05FIEgyXG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGgyIGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTogJHtzaW5nbGVNZWRpYS5OYW1lfTwvaDI+YCk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIgPSAkKCc8aDM+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbi1oZWFkZXInKS50ZXh0KCdEZXNjcmlwdGlvbicpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpcGVkaWEnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZSxcblx0ICAgIFx0XHRcdGhlaWdodDogMzE1LFxuXHQgICAgXHRcdFx0d2lkdGg6IDU2MFxuXHQgICAgXHRcdH0pO1x0XG5cblx0ICAgIFx0XHRjb25zdCAkYWRkQnV0dG9uID0gJCgnPGlucHV0PicpLmF0dHIoe1xuXHQgICAgXHRcdFx0dHlwZTogJ2J1dHRvbicsXG5cdCAgICBcdFx0XHR2YWx1ZTogJ0FkZCB0byBGYXZvdXJpdGVzJyxcblx0ICAgIFx0XHRcdGZvcm06ICdhZGQtYnV0dG9uLWZvcm0nLFxuXHQgICAgXHRcdFx0Y2xhc3M6ICdhZGQtYnV0dG9uJ1xuXHQgICAgXHRcdH0pO1xuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEJ1dHRvbiA9ICQoYDxmb3JtPjxpbnB1dCB0eXBlPVwiYnV0dG9uXCIgdmFsdWU9XCJBZGQgdG8gRmF2b3VyaXRlc1wiIGZvcm09XCJhZGQtYnV0dG9uLWZvcm1cIiBjbGFzcz1cImFkZC1idXR0b25cIj48L2lucHV0PjwvZm9ybT5gKTtcblx0ICAgIFx0XHQvLyA/Pz9JUyBUSEVSRSBBIFdBWSBUTyBBUFBFTkQgQU4gSU5QVVQgSU5TSURFIE9GIEEgRk9STT8/PyBJRiBOT1Q8IEpVU1QgRE8gSU5QVVQgQU5EIFVTRSAnb25DTGljaycgZXZlbnQgbGlzdGVuZXIgdG8gc3VibWl0IHRoZSBtZWRpYSB0eXBlYW5kIHRpdGxlIHRvIEZpcmViYXNlLlxuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEZvcm0gPSBgPGZvcm0gaWQ9XCJhZGQtYnV0dG9uLWZvcm1cIj4keyRhZGRCdXR0b259PC9mb3JtPmA7XG5cdCAgICBcdFx0XG5cdCAgICBcdFx0Ly8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXG5cdCAgICBcdFx0Ly8gVGhpcyBtYXRjaGVzIHRoZSBtb3ZpZSBvciBzaG93IHRpdGxlIGZyb20gQVBJIzEgd2l0aCBBUEkjMi4gSXQgdGhlbiBjcmVhdGVzIGEgdmFyaWFibGUgZm9yIHRoZSBJTURCIFJhdGluZyByZXR1cm5lZCBmcm9tIEFQSSMyIGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBwYWdlLlxuXHQgICAgXHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ICAgIFx0XHRhcHAuaW1kYlJlc3VsdHNBcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG5cdFx0ICAgIFx0XHRcdGlmIChzaW5nbGVNZWRpYS5OYW1lID09PSBlbGVtZW50LlRpdGxlKSB7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoYCR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMGApO1xuXHRcdCAgICBcdFx0XHRcdC8vIGNvbnN0ICRpbWRiTG9nbyA9ICQoJzxpbWc+JykuYWRkQ2xhc3MoJ2ltZGItbG9nbycpLmF0dHIoJ3NyYycsICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzYvNjkvSU1EQl9Mb2dvXzIwMTYuc3ZnJyk7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJGltZGJMb2dvUmF0aW5nID0gJChgPGRpdiBjbGFzcz1cImltZGItY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cImltZGItaW1hZ2UtY29udGFpbmVyXCI+PGltZyBzcmM9XCJodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzYvNjkvSU1EQl9Mb2dvXzIwMTYuc3ZnXCIgYWx0PVwiSU1EQiBMb2dvXCI+PC9kaXY+PHAgY2xhc3M9XCJpbWRiLXJhdGluZ1wiPiR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMDwvcD48L2Rpdj5gKTtcblx0XHQgICAgXHRcdFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdH07XG5cdFx0ICAgIFx0fTtcblx0ICAgIFx0fSk7XG5cdCAgICB9O1xuXHQgICAgXG5cdH0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGaXJlYmFzZTogTWVkaWEgRmF2b3VyaXRlcyBMaXN0XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gRXZlbnQgbGlzdGVuZXIgZm9yIGFkZGluZyBtZWRpYSB0eXBlIGFuZCB0aXRsZSB0byB0aGUgbGlzdCBzdWJtaXR0aW5nIHRoZSBmb3JtL3ByaW50aW5nIHRoZSBsaXN0XG4gICAgbWVkaWFDb250YWluZXIub24oJ2NsaWNrJywgJy5hZGQtYnV0dG9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgIC8vIFRoaXMgdmFyaWFibGUgc3RvcmVzIHRoZSBlbGVtZW50KHMpIGluIHRoZSBmb3JtIEkgd2FudCB0byBnZXQgdmFsdWUocykgZnJvbS4gSW4gdGhpcyBjYXNlIGl0IHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdGl0bGUgYW5kIHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdHlwZS5cbiAgICAgICAgLy8gY29uc3QgdHlwZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190eXBlJylbMF0uaW5uZXJUZXh0O1xuICAgICAgICAvLyBjb25zdCB0aXRsZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190aXRsZScpWzBdLmlubmVyVGV4dDtcbiAgICAgICAgY29uc3QgdHlwZUFuZFRpdGxlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3R5cGVfX3RpdGxlJylbMF0uaW5uZXJUZXh0XG4gICAgICBcbiAgICAgICAgY29uc3QgbWVkaWFPYmplY3QgPSB7XG4gICAgICAgIFx0Ly8gdHlwZSxcbiAgICAgICAgXHQvLyB0aXRsZVxuICAgICAgICBcdHR5cGVBbmRUaXRsZVxuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCB0aGUgaW5mb3JtYXRpb24gdG8gRmlyZWJhc2VcbiAgICAgICAgYXBwLm1lZGlhTGlzdC5wdXNoKG1lZGlhT2JqZWN0KTtcbiAgICB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhhcHAubWVkaWFMaXN0KTtcbiAgICAvLyBHZXQgdGhlIHR5cGUgYW5kIHRpdGxlIGluZm9ybWF0aW9uIGZyb20gRmlyZWJhc2VcbiAgICBhcHAubWVkaWFMaXN0LmxpbWl0VG9MYXN0KDUpLm9uKCdjaGlsZF9hZGRlZCcsZnVuY3Rpb24obWVkaWFJbmZvKSB7XG4gICAgXHQvLyBjb25zb2xlLmxvZyhtZWRpYUluZm8pO1xuICAgIFx0Y29uc3QgZGF0YSA9IG1lZGlhSW5mby52YWwoKTtcbiAgICBcdC8vIGNvbnN0IG1lZGlhVHlwZUZCID0gZGF0YS50eXBlO1xuICAgIFx0Ly8gY29uc3QgbWVkaWFUaXRsZUZCID0gZGF0YS50aXRsZTtcbiAgICBcdGNvbnN0IG1lZGlhRkIgPSBkYXRhLnR5cGVBbmRUaXRsZTtcbiAgICBcdGNvbnN0IGtleSA9IG1lZGlhSW5mby5rZXk7XG4gICAgXHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRhaHQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG4gICAgXHRjb25zdCBsaSA9IGA8bGkgaWQ9XCJrZXktJHtrZXl9XCIgY2xhc3M9XCJmYXZvdXJpdGVzLWxpc3RfX2xpc3QtaXRlbVwiPlxuICAgIFx0XHRcdFx0XHQ8cD4ke21lZGlhRkJ9PC9wPlxuICAgIFx0XHRcdFx0XHQ8YnV0dG9uIGlkPVwiJHtrZXl9XCIgY2xhc3M9XCJkZWxldGUgbm8tcHJpbnRcIj48aSBjbGFzcz1cImZhcyBmYS10aW1lcy1jaXJjbGVcIj48L2k+PC9idXR0b24+XG4gICAgXHRcdFx0XHQ8L2xpPmBcbiAgICBcdGZhdm91cml0ZXNMaXN0LmFwcGVuZChsaSk7XG4gICAgXHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIGRlbGV0ZSBpY29uIGlzIGNsaWNrZWRcbiAgICBmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIFx0Y29uc3QgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgXHRcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBDbGVhciBidXR0b24gaXMgY2xpY2tlZFxuICAgICQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgXHRhcHAuZGF0YWJhc2UucmVmKGAvbWVkaWFMaXN0YCkuc2V0KG51bGwpO1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSB0aGUgZnJvbnQgZW5kIGFwcGVuZFxuICAgIGFwcC5tZWRpYUxpc3QubGltaXRUb0xhc3QoNSkub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdC8vIGNvbnNvbGUubG9nKGZhdm91cml0ZXNMaXN0LmZpbmQobGlzdEl0ZW1zLmtleSkpO1xuXHRmYXZvdXJpdGVzTGlzdC5maW5kKGAja2V5LSR7bGlzdEl0ZW1zLmtleX1gKS5yZW1vdmUoKTtcblx0fSk7XHRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTG9nbyBBbmltYXRpb25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRsZXQgbG9nb0FuaW1hdGU7XG5cblx0Y29uc3QgZ2V0UmFuZG9tTnVtYmVyID0gKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KTtcblxuXHRhcHAuZ2V0UmFuZG9tQ29sb3VyID0gKCkgPT4ge1xuXHRcdGNvbnN0IHJlZCA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGJsdWUgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBncmVlbiA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IHJnYiA9IGByZ2IoJHtyZWR9LCAke2dyZWVufSwgJHtibHVlfSlgXG5cdFx0cmV0dXJuIHJnYjtcblx0fTtcblxuXHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG5cdFxuXHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgdG9wUyA9ICgpID0+IHtcblx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubGluZVdpZHRoID0gNztcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHQvLyBUT1AgUElFQ0Vcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHQvLyAyTkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdC8vIDNSRCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdGN0eC5maWxsU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0Y3R4LmZpbGwoKTtcblx0fTtcblxuXHR0b3BTKCk7XG5cblx0bGV0IG9uZUxvZ29JbnRlcnZhbCA9ICgpID0+IHtcblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSA1MDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmFyYygxMjUsIDExNywgMTEwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTAwICsgaSksICgxMDAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTUwICsgaSksICg3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMTAgKyBpKSwgKDExMCAtIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyMDAgKyBpKSwgKDIwMCArIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMTAgKyBpKSwgKDExMCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMjAgKyBpKSwgKDkwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDEwMCAtIGkpLCAoMTYwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE0MCAtIGkpLCAoMTI1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dG9wUygpO1xuXHRcdFx0fSwgKGkpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoNTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjAwIC0gaSksICgyNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNjAgLSBpKSwgKDYwICsgaSkpO1xuXHRcdFx0XHRcdC8vIGN0eC5hcmMoKDI5MCAtIGkpLCAoMjkwIC0gaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdC8vIE1JRERMRSBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE2MCAtIGkpLCAoMTYwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE3MCAtIGkpLCAoMTQwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDUwICsgaSksICgyMTAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoOTAgKyBpKSwgKDE3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dG9wUygpO1xuXG5cdFx0XHR9LCAoNTAgKyBpKSk7XG5cdFx0fTtcblx0fTtcblx0XG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcblx0XHRsb2dvQW5pbWF0ZSA9IHNldEludGVydmFsKG9uZUxvZ29JbnRlcnZhbCwgMTAwKTtcblx0fSk7XG5cblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNjAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjbGVhckludGVydmFsKGxvZ29BbmltYXRlKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gY3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdC8vIGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDc7XG5cdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuXHRcdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5saW5lV2lkdGggPSA1O1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdH07XG5cdFx0XHR0b3BTKCk7XG5cdFx0fSwgMTAwKVxuXHRcdFxuXHRcdFxuXHR9KTtcblx0XG59XG4vLyBUaGlzIHJ1bnMgdGhlIGFwcFxuJChmdW5jdGlvbigpIHtcblx0YXBwLmNvbmZpZygpO1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
