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
				// app.mediaType = singleMedia.Type;
				// app.mediaTitle = singleMedia.Name;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1Qyx5SEFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixF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LFFBQUksU0FBSjtBQUNBLFFBQUksU0FBSixHQUFnQixDQUFoQjtBQUNBLFFBQUksV0FBSixHQUFrQixTQUFsQjtBQUNBLFFBQUksR0FBSixDQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWtCLEVBQWxCLEVBQXNCLENBQXRCLEVBQXlCLElBQUksS0FBSyxFQUFsQztBQUNBLFFBQUksTUFBSjtBQUNBLFFBQUksU0FBSjtBQUNBO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsRUFBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0E7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixFQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQTtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksU0FBSixHQUFnQixTQUFoQjtBQUNBLFFBQUksSUFBSjtBQUNDLElBOUJEO0FBK0JBO0FBQ0EsR0FuQ0QsRUFtQ0csR0FuQ0g7QUFzQ0EsRUF6Q0Q7QUEyQ0EsQ0E5WUQ7QUErWUE7QUFDQSxFQUFFLFlBQVc7QUFDWixLQUFJLE1BQUo7QUFDQSxLQUFJLElBQUo7QUFDQSxDQUhEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ3JlYXRlIHZhcmlhYmxlIGZvciBhcHAgb2JqZWN0XG5jb25zdCBhcHAgPSB7fTtcblxuYXBwLmNvbmZpZyA9ICgpID0+IHsgICBcbiAgICBjb25zdCBjb25maWcgPSB7XG5cdCAgICBhcGlLZXk6IFwiQUl6YVN5QWVfTHFZTFZtLW9Wc2s5R0RFa1o5X0YxcGhXaVNvc0xZXCIsXG5cdCAgICBhdXRoRG9tYWluOiBcImpzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWFwcC5jb21cIixcblx0ICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vanMtc3VtbWVyLXByb2plY3QzLmZpcmViYXNlaW8uY29tXCIsXG5cdCAgICBwcm9qZWN0SWQ6IFwianMtc3VtbWVyLXByb2plY3QzXCIsXG5cdCAgICBzdG9yYWdlQnVja2V0OiBcIlwiLFxuXHQgICAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiMTA0Nzc5MzAzNDE1NVwiXG5cdH07XG4gICAgLy9UaGlzIHdpbGwgaW5pdGlhbGl6ZSBmaXJlYmFzZSB3aXRoIG91ciBjb25maWcgb2JqZWN0XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgIC8vIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgY29ubmVjdGlvbiB0byB0aGUgZGF0YWJhc2VcbiAgICBhcHAuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgIC8vIFRoaXMgY3JlYXRlcyBhIHJlZmVyZW5jZSB0byBhIGxvY2F0aW9uIGluIHRoZSBkYXRhYmFzZS4gSSBvbmx5IG5lZWQgb25lIGZvciB0aGlzIHByb2plY3QgdG8gc3RvcmUgdGhlIG1lZGlhIGxpc3RcbiAgICBhcHAubWVkaWFMaXN0ID0gYXBwLmRhdGFiYXNlLnJlZignL21lZGlhTGlzdCcpO1xufTtcblxuYXBwLmluaXQgPSAoKSA9PiB7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNpbWlsYXIgYW5kIE9NREIgQVBJczogR2V0IFJlc3VsdHMgYW5kIGRpc3BsYXlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBTaW1pbGFyIEFQSSBLZXlcblx0YXBwLnNpbWlsYXJLZXkgPSAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJztcblxuXHQvLyBPTURCIEFQSSBLZXlcblx0YXBwLm9tZGJLZXkgPSAnMTY2MWZhOWQnO1xuXHQvLyBGaXJlYmFzZSB2YXJpYWJsZXNcblx0Y29uc3QgbWVkaWFUeXBlRWxlbWVudCA9ICQoJy5tZWRpYV9fdHlwZScpXG5cdGNvbnN0IG1lZGlhVGl0bGVFbGVtZW50ID0gJCgnLm1lZGlhX190aXRsZScpO1xuXG5cdGNvbnN0IG1lZGlhQ29udGFpbmVyID0gJCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpO1xuXHRjb25zdCBmYXZvdXJpdGVzTGlzdCA9ICQoJy5mYXZvdXJpdGVzLWxpc3RfX2xpc3QnKTtcblx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgYW4gaW5saW5lIGVycm9yIHVuZGVyIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBubyByZXN1bHRzIGFyZSByZXR1cm5lZCBmcm9tIEFQSSMxIChlbXB0eSBhcnJheSlcblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3IgZnVuY3Rpb24gd29ya3MnKVxuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHlvdXIgcmVzdWx0cy4gVGhleSBtaWdodCBub3QgYmUgYXZhaWxhYmxlIG9yIHlvdXIgc3BlbGxpbmcgaXMgaW5jb3JyZWN0LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdGNvbnNvbGUubG9nKCRub1Jlc3VsdHNFcnJvcik7XG5cdFx0JCgnI2Vycm9yJykuYXBwZW5kKCRub1Jlc3VsdHNFcnJvcik7XG5cdH07XG5cdC8vIGNvbnNvbGUubG9nKGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IpO1xuXG5cdC8vIEV2ZW50IExpc3RlbmVyIHRvIGNpbmx1ZGUgZXZlcnl0aGluZyB0aGF0IGhhcHBlbnMgb24gZm9ybSBzdWJtaXNzaW9uXG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIFByZXZlbnQgZGVmYXVsdCBmb3Igc3VibWl0IGlucHV0c1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XG5cdFx0Y29uc3QgdXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIC8vIHE6ICdzdXBlcm1hbicsXG5cdFx0ICAgICAgdHlwZTogYCR7dXNlclR5cGV9YCxcblx0XHQgICAgICBpbmZvOiAxLFxuXHRcdCAgICAgIGxpbWl0OiAxMFxuXHRcdCAgICB9XG5cdFx0fSk7XG5cblx0XHQvLyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBwYXNzIG1vdmllIHRpdGxlcyBmcm9tIFByb21pc2UjMSBpbnRvIFByb21pc2UgIzJcblx0XHRhcHAuZ2V0SW1kYlJhdGluZyA9IChtb3ZpZVRpdGxlKSA9PiB7XG5cdFx0XHQvLyBSZXR1cm4gUHJvbWlzZSMyIHdoaWNoIGluY2x1ZGVzIHRoZSBtb3ZpZSB0aXRsZSBmcm9tIFByb21pc2UjMVxuXHRcdCAgICByZXR1cm4gJC5hamF4KHtcblx0XHQgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5vbWRiYXBpLmNvbScsXG5cdFx0ICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgICAgICAgICAgIGRhdGE6IHtcblx0XHQgICAgICAgICAgICAgICBhcGlrZXk6ICcxNjYxZmE5ZCcsXG5cdFx0ICAgICAgICAgICAgICAgdDogbW92aWVUaXRsZVxuXHRcdCAgICAgICAgICAgICB9XG5cdFx0ICAgIH0pO1xuXHRcdH07XG5cdFx0Ly8gR2V0IHJlc3VsdHMgZm9yIFByb21pc2UjMVxuXHQgICAgJC53aGVuKGFwcC5nZXRNZWRpYSkudGhlbigobWVkaWFJbmZvKSA9PiB7XG5cdCAgICAgIGNvbnN0IG1lZGlhSW5mb0FycmF5ID0gbWVkaWFJbmZvLlNpbWlsYXIuUmVzdWx0cztcblx0ICAgICAgY29uc29sZS5sb2cobWVkaWFJbmZvQXJyYXkpO1xuXG5cdCAgICAgIGFwcC5ub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHQgICAgICBpZiAoYXBwLm5vUmVzdWx0cyA9PT0gdHJ1ZSkge1xuXHQgICAgICBcdCQoJyNlcnJvcicpLmVtcHR5KCk7XG5cdCAgICAgIFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICBcdC8vIERpc3BsYXkgbWVkaWEgcmVzdWx0cyBjb250YWluZXIgd2l0aCB0aGUgcmlnaHQgbWFyZ2luc1xuXHQgICAgICBcdCQoJ2Zvb3RlcicpLmNzcygnbWFyZ2luLXRvcCcsICcwcHgnKTtcblx0ICAgICAgXHQkKCcubWVkaWFfX3Jlc3VsdHMtY29udGFpbmVyJykuY3NzKCdtYXJnaW4tYm90dG9tJywgJzUwcHgnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdCAgICAgIH07XG5cdCAgXHRcdC8vIElmIHRoZSBtZWRpYSB0eXBlIGlzIG1vdmllcyBvciBzaG93cywgZ2V0IHJlc3VsdHMgYXJyYXkgZnJvbSBQcm9taXNlICMxIGFuZCBtYXAgZWFjaCBtb3ZpZSB0aXRsZSByZXN1bHQgdG8gYSBwcm9taXNlIGZvciBQcm9taXNlICMyLiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHByb21pc2VzIGZvciBBUEkjMi5cblx0ICAgICAgaWYgKHVzZXJUeXBlID09PSAnbW92aWVzJyB8fCB1c2VyVHlwZSA9PT0gJ3Nob3dzJykge1xuXHRcdCAgICAgIGNvbnN0IGltZGJQcm9taXNlQXJyYXkgPSBtZWRpYUluZm9BcnJheS5tYXAoKHRpdGxlKSA9PiB7XG5cdFx0ICAgICAgICByZXR1cm4gYXBwLmdldEltZGJSYXRpbmcodGl0bGUuTmFtZSk7XG5cdFx0ICAgICAgfSk7XG5cdFx0ICAgICAgY29uc29sZS5sb2coaW1kYlByb21pc2VBcnJheSk7XG5cdFx0ICAgICAgLy8gUmV0dXJuIGEgc2luZ2xlIGFycmF5IGZyb20gdGhlIGFycmF5IG9mIHByb21pc2VzIGFuZCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlLlxuXHRcdCAgICAgIFByb21pc2UuYWxsKGltZGJQcm9taXNlQXJyYXkpLnRoZW4oKGltZGJSZXN1bHRzKSA9PiB7XG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyhpbWRiUmVzdWx0cyk7XG5cdFx0ICAgICAgICBhcHAuaW1kYlJlc3VsdHNBcnJheSA9IGltZGJSZXN1bHRzO1xuXHRcdCAgICAgICAgLy8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXHRcdCAgICAgICAgYXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAgICAgfSk7XG5cdFx0ICAgIC8vIEZvciBtZWRpYSB0eXBlcyB0aGF0IGFyZSBub3QgbW92aWVzIG9yIHNob3dzLCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlXG5cdFx0ICAgIH0gZWxzZSB7XG5cdFx0ICBcdFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAgIH07XG5cdFx0ICAvLyB9IGVsc2UgaWYgKHVzZXJUeXBlID09PSAnbXVzaWMnIHx8IHVzZXJUeXBlID09PSAnYm9va3MnIHx8IHVzZXJUeXBlID09PSAnYXV0aG9ycycgfHwgdXNlclR5cGUgPT09ICdnYW1lcycpe1xuXHRcdCAgLy8gXHRhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHQgIC8vIH07XG5cdFx0fSkuZmFpbChmdW5jdGlvbihlcnIpIHtcblx0XHQgIGNvbnNvbGUubG9nKGVycik7XG5cdFx0fSk7XG5cdFx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIGRpc3BsYXkgdGhlIEFQSSBwcm9taXNlIHJlc3VsdHMgb250byB0aGUgcGFnZVxuXHQgICAgYXBwLmRpc3BsYXlNZWRpYSA9IChhbGxNZWRpYUFycmF5KSA9PiB7XG5cdCAgICBcdC8vIFRoaXMgbWV0aG9kIHJlbW92ZXMgY2hpbGQgbm9kZXMgZnJvbSB0aGUgbWVkaWEgcmVzdWx0cyBlbGVtZW50KHByZXZpb3VzIHNlYXJjaCByZXN1bHRzKSwgYnV0IG9ubHkgd2hlbiB0aGUgc2VhcmNoIHF1ZXJ5IGJyaW5ncyBuZXcgcmVzdWx0cy4gT3RoZXJ3aXNlIGl0IHdpbGwga2VlcCB0aGUgY3VycmVudCByZXN1bHRzIGFuZCBkaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UuXG5cdCAgICBcdGlmIChhcHAubm9SZXN1bHRzID09PSBmYWxzZSkge1xuXHQgICAgXHRcdCQoJyNlcnJvcicpLmVtcHR5KCk7XG5cdCAgICBcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmVtcHR5KCk7XG5cdCAgICBcdH07XG5cblx0ICAgIFx0YWxsTWVkaWFBcnJheS5mb3JFYWNoKChzaW5nbGVNZWRpYSkgPT4ge1xuXHQgICAgXHRcdC8vIEZvciBlYWNoIHJlc3VsdCBpbiB0aGUgYXJyYXkgcmV0dXJuZWQgZnJvbSBBUEkjMSwgY3JlYXRlIHZhcmlhYmxlcyBmb3IgYWxsIGh0bWwgZWxlbWVudHMgSSdsbCBiZSBhcHBlbmRpbmcuXG5cdCAgICBcdFx0Ly8gS0VFUElORyBUWVBFIEFORCBUSVRMRSBTRVBBUkFURVxuXHQgICAgXHRcdC8vIGNvbnN0ICRtZWRpYVR5cGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190eXBlJykudGV4dChzaW5nbGVNZWRpYS5UeXBlKTtcblx0ICAgIFx0XHQvLyBjb25zdCAkbWVkaWFUaXRsZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3RpdGxlJykudGV4dChzaW5nbGVNZWRpYS5OYW1lKTtcblx0ICAgIFx0XHQvLyBDT01CSU5JTkcgVFlQRSBBTkQgVElUTEVcblx0ICAgIFx0XHQvLyBjb25zdCAkbWVkaWFUeXBlVGl0bGUgPSAkKGA8ZGl2IGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlLWNvbnRhaW5lclwiPjxoMiBjbGFzcz1cIm1lZGlhX190eXBlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTo8L2gyPjxoMiBjbGFzcz1cIm1lZGlhX190aXRsZVwiPiR7c2luZ2xlTWVkaWEuTmFtZX08L2gyPjwvZGl2PmApO1xuXHQgICAgXHRcdC8vIENPTUJJTklORyBUWVBFIEFORCBUSVRMRSBJTiBPTkUgSDJcblx0ICAgIFx0XHQvLyBhcHAubWVkaWFUeXBlID0gc2luZ2xlTWVkaWEuVHlwZTtcblx0ICAgIFx0XHQvLyBhcHAubWVkaWFUaXRsZSA9IHNpbmdsZU1lZGlhLk5hbWU7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGgyIGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTogJHtzaW5nbGVNZWRpYS5OYW1lfTwvaDI+YCk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIgPSAkKCc8aDM+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbi1oZWFkZXInKS50ZXh0KCdEZXNjcmlwdGlvbicpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpcGVkaWEnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZSxcblx0ICAgIFx0XHRcdGhlaWdodDogMzE1LFxuXHQgICAgXHRcdFx0d2lkdGg6IDU2MFxuXHQgICAgXHRcdH0pO1x0XG5cblx0ICAgIFx0XHRjb25zdCAkYWRkQnV0dG9uID0gJCgnPGlucHV0PicpLmF0dHIoe1xuXHQgICAgXHRcdFx0dHlwZTogJ2J1dHRvbicsXG5cdCAgICBcdFx0XHR2YWx1ZTogJ0FkZCB0byBGYXZvdXJpdGVzJyxcblx0ICAgIFx0XHRcdGZvcm06ICdhZGQtYnV0dG9uLWZvcm0nLFxuXHQgICAgXHRcdFx0Y2xhc3M6ICdhZGQtYnV0dG9uJ1xuXHQgICAgXHRcdH0pO1xuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEJ1dHRvbiA9ICQoYDxmb3JtPjxpbnB1dCB0eXBlPVwiYnV0dG9uXCIgdmFsdWU9XCJBZGQgdG8gRmF2b3VyaXRlc1wiIGZvcm09XCJhZGQtYnV0dG9uLWZvcm1cIiBjbGFzcz1cImFkZC1idXR0b25cIj48L2lucHV0PjwvZm9ybT5gKTtcblx0ICAgIFx0XHQvLyA/Pz9JUyBUSEVSRSBBIFdBWSBUTyBBUFBFTkQgQU4gSU5QVVQgSU5TSURFIE9GIEEgRk9STT8/PyBJRiBOT1Q8IEpVU1QgRE8gSU5QVVQgQU5EIFVTRSAnb25DTGljaycgZXZlbnQgbGlzdGVuZXIgdG8gc3VibWl0IHRoZSBtZWRpYSB0eXBlYW5kIHRpdGxlIHRvIEZpcmViYXNlLlxuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEZvcm0gPSBgPGZvcm0gaWQ9XCJhZGQtYnV0dG9uLWZvcm1cIj4keyRhZGRCdXR0b259PC9mb3JtPmA7XG5cdCAgICBcdFx0XG5cdCAgICBcdFx0Ly8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXG5cdCAgICBcdFx0Ly8gVGhpcyBtYXRjaGVzIHRoZSBtb3ZpZSBvciBzaG93IHRpdGxlIGZyb20gQVBJIzEgd2l0aCBBUEkjMi4gSXQgdGhlbiBjcmVhdGVzIGEgdmFyaWFibGUgZm9yIHRoZSBJTURCIFJhdGluZyByZXR1cm5lZCBmcm9tIEFQSSMyIGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBwYWdlLlxuXHQgICAgXHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ICAgIFx0XHRhcHAuaW1kYlJlc3VsdHNBcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG5cdFx0ICAgIFx0XHRcdGlmIChzaW5nbGVNZWRpYS5OYW1lID09PSBlbGVtZW50LlRpdGxlKSB7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoYCR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMGApO1xuXHRcdCAgICBcdFx0XHRcdC8vIGNvbnN0ICRpbWRiTG9nbyA9ICQoJzxpbWc+JykuYWRkQ2xhc3MoJ2ltZGItbG9nbycpLmF0dHIoJ3NyYycsICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzYvNjkvSU1EQl9Mb2dvXzIwMTYuc3ZnJyk7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJGltZGJMb2dvUmF0aW5nID0gJChgPGRpdiBjbGFzcz1cImltZGItY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cImltZGItaW1hZ2UtY29udGFpbmVyXCI+PGltZyBzcmM9XCJodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzYvNjkvSU1EQl9Mb2dvXzIwMTYuc3ZnXCIgYWx0PVwiSU1EQiBMb2dvXCI+PC9kaXY+PHAgY2xhc3M9XCJpbWRiLXJhdGluZ1wiPiR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMDwvcD48L2Rpdj5gKTtcblx0XHQgICAgXHRcdFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdH07XG5cdFx0ICAgIFx0fTtcblx0ICAgIFx0fSk7XG5cdCAgICB9O1xuXHQgICAgXG5cdH0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGaXJlYmFzZTogTWVkaWEgRmF2b3VyaXRlcyBMaXN0XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gRXZlbnQgbGlzdGVuZXIgZm9yIGFkZGluZyBtZWRpYSB0eXBlIGFuZCB0aXRsZSB0byB0aGUgbGlzdCBzdWJtaXR0aW5nIHRoZSBmb3JtL3ByaW50aW5nIHRoZSBsaXN0XG4gICAgbWVkaWFDb250YWluZXIub24oJ2NsaWNrJywgJy5hZGQtYnV0dG9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgIC8vIFRoaXMgdmFyaWFibGUgc3RvcmVzIHRoZSBlbGVtZW50KHMpIGluIHRoZSBmb3JtIEkgd2FudCB0byBnZXQgdmFsdWUocykgZnJvbS4gSW4gdGhpcyBjYXNlIGl0IHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdGl0bGUgYW5kIHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdHlwZS5cbiAgICAgICAgLy8gY29uc3QgdHlwZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190eXBlJylbMF0uaW5uZXJUZXh0O1xuICAgICAgICAvLyBjb25zdCB0aXRsZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190aXRsZScpWzBdLmlubmVyVGV4dDtcbiAgICAgICAgY29uc3QgdHlwZUFuZFRpdGxlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3R5cGVfX3RpdGxlJylbMF0uaW5uZXJUZXh0XG4gICAgICBcbiAgICAgICAgY29uc3QgbWVkaWFPYmplY3QgPSB7XG4gICAgICAgIFx0Ly8gdHlwZSxcbiAgICAgICAgXHQvLyB0aXRsZVxuICAgICAgICBcdHR5cGVBbmRUaXRsZVxuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCB0aGUgaW5mb3JtYXRpb24gdG8gRmlyZWJhc2VcbiAgICAgICAgYXBwLm1lZGlhTGlzdC5wdXNoKG1lZGlhT2JqZWN0KTtcbiAgICB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhhcHAubWVkaWFMaXN0KTtcbiAgICAvLyBHZXQgdGhlIHR5cGUgYW5kIHRpdGxlIGluZm9ybWF0aW9uIGZyb20gRmlyZWJhc2VcbiAgICBhcHAubWVkaWFMaXN0LmxpbWl0VG9MYXN0KDUpLm9uKCdjaGlsZF9hZGRlZCcsZnVuY3Rpb24obWVkaWFJbmZvKSB7XG4gICAgXHQvLyBjb25zb2xlLmxvZyhtZWRpYUluZm8pO1xuICAgIFx0Y29uc3QgZGF0YSA9IG1lZGlhSW5mby52YWwoKTtcbiAgICBcdC8vIGNvbnN0IG1lZGlhVHlwZUZCID0gZGF0YS50eXBlO1xuICAgIFx0Ly8gY29uc3QgbWVkaWFUaXRsZUZCID0gZGF0YS50aXRsZTtcbiAgICBcdGNvbnN0IG1lZGlhRkIgPSBkYXRhLnR5cGVBbmRUaXRsZTtcbiAgICBcdGNvbnN0IGtleSA9IG1lZGlhSW5mby5rZXk7XG4gICAgXHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRhaHQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG4gICAgXHRjb25zdCBsaSA9IGA8bGkgaWQ9XCJrZXktJHtrZXl9XCIgY2xhc3M9XCJmYXZvdXJpdGVzLWxpc3RfX2xpc3QtaXRlbVwiPlxuICAgIFx0XHRcdFx0XHQ8cD4ke21lZGlhRkJ9PC9wPlxuICAgIFx0XHRcdFx0XHQ8YnV0dG9uIGlkPVwiJHtrZXl9XCIgY2xhc3M9XCJkZWxldGUgbm8tcHJpbnRcIj48aSBjbGFzcz1cImZhcyBmYS10aW1lcy1jaXJjbGVcIj48L2k+PC9idXR0b24+XG4gICAgXHRcdFx0XHQ8L2xpPmBcbiAgICBcdGZhdm91cml0ZXNMaXN0LmFwcGVuZChsaSk7XG4gICAgXHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIGRlbGV0ZSBpY29uIGlzIGNsaWNrZWRcbiAgICBmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIFx0Y29uc3QgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgXHRcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBDbGVhciBidXR0b24gaXMgY2xpY2tlZFxuICAgICQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgXHRhcHAuZGF0YWJhc2UucmVmKGAvbWVkaWFMaXN0YCkuc2V0KG51bGwpO1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSB0aGUgZnJvbnQgZW5kIGFwcGVuZFxuICAgIGFwcC5tZWRpYUxpc3QubGltaXRUb0xhc3QoNSkub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdC8vIGNvbnNvbGUubG9nKGZhdm91cml0ZXNMaXN0LmZpbmQobGlzdEl0ZW1zLmtleSkpO1xuXHRmYXZvdXJpdGVzTGlzdC5maW5kKGAja2V5LSR7bGlzdEl0ZW1zLmtleX1gKS5yZW1vdmUoKTtcblx0fSk7XHRcblx0Ly8gTWF4aW1pemUgYW5kIE1pbmltaXplIGJ1dHRvbnMgZm9yIHRoZSBGYXZvdXJpdGVzIExpc3Rcblx0JCgnLmZhdm91cml0ZXMtbWF4aW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZURvd24oMjAwKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdH0pO1xuXG5cdCQoJy5mYXZvdXJpdGVzLW1pbmltaXplJykuY2xpY2soZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5mYXZvdXJpdGVzLWxpc3Qtd2luZG93Jykuc2xpZGVVcCgyMDApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG5cdFxuXHRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTG9nbyBBbmltYXRpb25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRsZXQgbG9nb0FuaW1hdGU7XG5cblx0Y29uc3QgZ2V0UmFuZG9tTnVtYmVyID0gKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KTtcblxuXHRhcHAuZ2V0UmFuZG9tQ29sb3VyID0gKCkgPT4ge1xuXHRcdGNvbnN0IHJlZCA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGJsdWUgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBncmVlbiA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IHJnYiA9IGByZ2IoJHtyZWR9LCAke2dyZWVufSwgJHtibHVlfSlgXG5cdFx0cmV0dXJuIHJnYjtcblx0fTtcblxuXHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG5cdFxuXHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgdG9wUyA9ICgpID0+IHtcblx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubGluZVdpZHRoID0gNztcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHQvLyBUT1AgUElFQ0Vcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHQvLyAyTkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdC8vIDNSRCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdGN0eC5maWxsU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0Y3R4LmZpbGwoKTtcblx0fTtcblxuXHR0b3BTKCk7XG5cblx0bGV0IG9uZUxvZ29JbnRlcnZhbCA9ICgpID0+IHtcblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSA1MDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmFyYygxMjUsIDExNywgMTEwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTAwICsgaSksICgxMDAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTUwICsgaSksICg3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMTAgKyBpKSwgKDExMCAtIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyMDAgKyBpKSwgKDIwMCArIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMTAgKyBpKSwgKDExMCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMjAgKyBpKSwgKDkwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDEwMCAtIGkpLCAoMTYwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE0MCAtIGkpLCAoMTI1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dG9wUygpO1xuXHRcdFx0fSwgKGkpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoNTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjAwIC0gaSksICgyNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNjAgLSBpKSwgKDYwICsgaSkpO1xuXHRcdFx0XHRcdC8vIGN0eC5hcmMoKDI5MCAtIGkpLCAoMjkwIC0gaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdC8vIE1JRERMRSBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE2MCAtIGkpLCAoMTYwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE3MCAtIGkpLCAoMTQwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDUwICsgaSksICgyMTAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoOTAgKyBpKSwgKDE3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dG9wUygpO1xuXG5cdFx0XHR9LCAoNTAgKyBpKSk7XG5cdFx0fTtcblx0fTtcblx0XG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcblx0XHRsb2dvQW5pbWF0ZSA9IHNldEludGVydmFsKG9uZUxvZ29JbnRlcnZhbCwgMTAwKTtcblx0fSk7XG5cblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNjAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjbGVhckludGVydmFsKGxvZ29BbmltYXRlKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gY3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdC8vIGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDc7XG5cdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuXHRcdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5saW5lV2lkdGggPSA1O1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdH07XG5cdFx0XHR0b3BTKCk7XG5cdFx0fSwgMTAwKVxuXHRcdFxuXHRcdFxuXHR9KTtcblx0XG59XG4vLyBUaGlzIHJ1bnMgdGhlIGFwcFxuJChmdW5jdGlvbigpIHtcblx0YXBwLmNvbmZpZygpO1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
