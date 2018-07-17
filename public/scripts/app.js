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
					allowfullscreen: true
					// height: 315
					// max-width: 560
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
	app.mediaList.limitToLast(10).on('child_added', function (mediaInfo) {
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

	$(function () {
		$('#video').css({ width: $(window).innerWidth() + 'px', height: $(window).innerHeight() + 'px' });

		$(window).resize(function () {
			$('#video').css({ width: $(window).innerWidth() + 'px', height: $(window).innerHeight() + 'px' });
		});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1Qyx5SEFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixF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Q0QsRUFtQ0csR0FuQ0g7QUFzQ0EsRUF6Q0Q7QUEyQ0EsQ0FwWkQ7QUFxWkE7QUFDQSxFQUFFLFlBQVc7QUFDWixLQUFJLE1BQUo7QUFDQSxLQUFJLElBQUo7QUFDQSxDQUhEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ3JlYXRlIHZhcmlhYmxlIGZvciBhcHAgb2JqZWN0XG5jb25zdCBhcHAgPSB7fTtcblxuYXBwLmNvbmZpZyA9ICgpID0+IHsgICBcbiAgICBjb25zdCBjb25maWcgPSB7XG5cdCAgICBhcGlLZXk6IFwiQUl6YVN5QWVfTHFZTFZtLW9Wc2s5R0RFa1o5X0YxcGhXaVNvc0xZXCIsXG5cdCAgICBhdXRoRG9tYWluOiBcImpzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWFwcC5jb21cIixcblx0ICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vanMtc3VtbWVyLXByb2plY3QzLmZpcmViYXNlaW8uY29tXCIsXG5cdCAgICBwcm9qZWN0SWQ6IFwianMtc3VtbWVyLXByb2plY3QzXCIsXG5cdCAgICBzdG9yYWdlQnVja2V0OiBcIlwiLFxuXHQgICAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiMTA0Nzc5MzAzNDE1NVwiXG5cdH07XG4gICAgLy9UaGlzIHdpbGwgaW5pdGlhbGl6ZSBmaXJlYmFzZSB3aXRoIG91ciBjb25maWcgb2JqZWN0XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgIC8vIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgY29ubmVjdGlvbiB0byB0aGUgZGF0YWJhc2VcbiAgICBhcHAuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgIC8vIFRoaXMgY3JlYXRlcyBhIHJlZmVyZW5jZSB0byBhIGxvY2F0aW9uIGluIHRoZSBkYXRhYmFzZS4gSSBvbmx5IG5lZWQgb25lIGZvciB0aGlzIHByb2plY3QgdG8gc3RvcmUgdGhlIG1lZGlhIGxpc3RcbiAgICBhcHAubWVkaWFMaXN0ID0gYXBwLmRhdGFiYXNlLnJlZignL21lZGlhTGlzdCcpO1xufTtcblxuYXBwLmluaXQgPSAoKSA9PiB7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNpbWlsYXIgYW5kIE9NREIgQVBJczogR2V0IFJlc3VsdHMgYW5kIGRpc3BsYXlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBTaW1pbGFyIEFQSSBLZXlcblx0YXBwLnNpbWlsYXJLZXkgPSAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJztcblxuXHQvLyBPTURCIEFQSSBLZXlcblx0YXBwLm9tZGJLZXkgPSAnMTY2MWZhOWQnO1xuXHQvLyBGaXJlYmFzZSB2YXJpYWJsZXNcblx0Y29uc3QgbWVkaWFUeXBlRWxlbWVudCA9ICQoJy5tZWRpYV9fdHlwZScpXG5cdGNvbnN0IG1lZGlhVGl0bGVFbGVtZW50ID0gJCgnLm1lZGlhX190aXRsZScpO1xuXG5cdGNvbnN0IG1lZGlhQ29udGFpbmVyID0gJCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpO1xuXHRjb25zdCBmYXZvdXJpdGVzTGlzdCA9ICQoJy5mYXZvdXJpdGVzLWxpc3RfX2xpc3QnKTtcblx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgYW4gaW5saW5lIGVycm9yIHVuZGVyIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBubyByZXN1bHRzIGFyZSByZXR1cm5lZCBmcm9tIEFQSSMxIChlbXB0eSBhcnJheSlcblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3IgZnVuY3Rpb24gd29ya3MnKVxuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHlvdXIgcmVzdWx0cy4gVGhleSBtaWdodCBub3QgYmUgYXZhaWxhYmxlIG9yIHlvdXIgc3BlbGxpbmcgaXMgaW5jb3JyZWN0LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdGNvbnNvbGUubG9nKCRub1Jlc3VsdHNFcnJvcik7XG5cdFx0JCgnI2Vycm9yJykuYXBwZW5kKCRub1Jlc3VsdHNFcnJvcik7XG5cdH07XG5cdC8vIGNvbnNvbGUubG9nKGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IpO1xuXG5cdC8vIEV2ZW50IExpc3RlbmVyIHRvIGNpbmx1ZGUgZXZlcnl0aGluZyB0aGF0IGhhcHBlbnMgb24gZm9ybSBzdWJtaXNzaW9uXG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIFByZXZlbnQgZGVmYXVsdCBmb3Igc3VibWl0IGlucHV0c1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XG5cdFx0Y29uc3QgdXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIC8vIHE6ICdzdXBlcm1hbicsXG5cdFx0ICAgICAgdHlwZTogYCR7dXNlclR5cGV9YCxcblx0XHQgICAgICBpbmZvOiAxLFxuXHRcdCAgICAgIGxpbWl0OiAxMFxuXHRcdCAgICB9XG5cdFx0fSk7XG5cblx0XHQvLyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBwYXNzIG1vdmllIHRpdGxlcyBmcm9tIFByb21pc2UjMSBpbnRvIFByb21pc2UgIzJcblx0XHRhcHAuZ2V0SW1kYlJhdGluZyA9IChtb3ZpZVRpdGxlKSA9PiB7XG5cdFx0XHQvLyBSZXR1cm4gUHJvbWlzZSMyIHdoaWNoIGluY2x1ZGVzIHRoZSBtb3ZpZSB0aXRsZSBmcm9tIFByb21pc2UjMVxuXHRcdCAgICByZXR1cm4gJC5hamF4KHtcblx0XHQgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5vbWRiYXBpLmNvbScsXG5cdFx0ICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgICAgICAgICAgIGRhdGE6IHtcblx0XHQgICAgICAgICAgICAgICBhcGlrZXk6ICcxNjYxZmE5ZCcsXG5cdFx0ICAgICAgICAgICAgICAgdDogbW92aWVUaXRsZVxuXHRcdCAgICAgICAgICAgICB9XG5cdFx0ICAgIH0pO1xuXHRcdH07XG5cdFx0Ly8gR2V0IHJlc3VsdHMgZm9yIFByb21pc2UjMVxuXHQgICAgJC53aGVuKGFwcC5nZXRNZWRpYSkudGhlbigobWVkaWFJbmZvKSA9PiB7XG5cdCAgICAgIGNvbnN0IG1lZGlhSW5mb0FycmF5ID0gbWVkaWFJbmZvLlNpbWlsYXIuUmVzdWx0cztcblx0ICAgICAgY29uc29sZS5sb2cobWVkaWFJbmZvQXJyYXkpO1xuXG5cdCAgICAgIGFwcC5ub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHQgICAgICBpZiAoYXBwLm5vUmVzdWx0cyA9PT0gdHJ1ZSkge1xuXHQgICAgICBcdCQoJyNlcnJvcicpLmVtcHR5KCk7XG5cdCAgICAgIFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICBcdC8vIERpc3BsYXkgbWVkaWEgcmVzdWx0cyBjb250YWluZXIgd2l0aCB0aGUgcmlnaHQgbWFyZ2luc1xuXHQgICAgICBcdCQoJ2Zvb3RlcicpLmNzcygnbWFyZ2luLXRvcCcsICcwcHgnKTtcblx0ICAgICAgXHQkKCcubWVkaWFfX3Jlc3VsdHMtY29udGFpbmVyJykuY3NzKCdtYXJnaW4tYm90dG9tJywgJzUwcHgnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdCAgICAgIH07XG5cdCAgXHRcdC8vIElmIHRoZSBtZWRpYSB0eXBlIGlzIG1vdmllcyBvciBzaG93cywgZ2V0IHJlc3VsdHMgYXJyYXkgZnJvbSBQcm9taXNlICMxIGFuZCBtYXAgZWFjaCBtb3ZpZSB0aXRsZSByZXN1bHQgdG8gYSBwcm9taXNlIGZvciBQcm9taXNlICMyLiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHByb21pc2VzIGZvciBBUEkjMi5cblx0ICAgICAgaWYgKHVzZXJUeXBlID09PSAnbW92aWVzJyB8fCB1c2VyVHlwZSA9PT0gJ3Nob3dzJykge1xuXHRcdCAgICAgIGNvbnN0IGltZGJQcm9taXNlQXJyYXkgPSBtZWRpYUluZm9BcnJheS5tYXAoKHRpdGxlKSA9PiB7XG5cdFx0ICAgICAgICByZXR1cm4gYXBwLmdldEltZGJSYXRpbmcodGl0bGUuTmFtZSk7XG5cdFx0ICAgICAgfSk7XG5cdFx0ICAgICAgY29uc29sZS5sb2coaW1kYlByb21pc2VBcnJheSk7XG5cdFx0ICAgICAgLy8gUmV0dXJuIGEgc2luZ2xlIGFycmF5IGZyb20gdGhlIGFycmF5IG9mIHByb21pc2VzIGFuZCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlLlxuXHRcdCAgICAgIFByb21pc2UuYWxsKGltZGJQcm9taXNlQXJyYXkpLnRoZW4oKGltZGJSZXN1bHRzKSA9PiB7XG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyhpbWRiUmVzdWx0cyk7XG5cdFx0ICAgICAgICBhcHAuaW1kYlJlc3VsdHNBcnJheSA9IGltZGJSZXN1bHRzO1xuXHRcdCAgICAgICAgLy8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXHRcdCAgICAgICAgYXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAgICAgfSk7XG5cdFx0ICAgIC8vIEZvciBtZWRpYSB0eXBlcyB0aGF0IGFyZSBub3QgbW92aWVzIG9yIHNob3dzLCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlXG5cdFx0ICAgIH0gZWxzZSB7XG5cdFx0ICBcdFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAgIH07XG5cdFx0ICAvLyB9IGVsc2UgaWYgKHVzZXJUeXBlID09PSAnbXVzaWMnIHx8IHVzZXJUeXBlID09PSAnYm9va3MnIHx8IHVzZXJUeXBlID09PSAnYXV0aG9ycycgfHwgdXNlclR5cGUgPT09ICdnYW1lcycpe1xuXHRcdCAgLy8gXHRhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHQgIC8vIH07XG5cdFx0fSkuZmFpbChmdW5jdGlvbihlcnIpIHtcblx0XHQgIGNvbnNvbGUubG9nKGVycik7XG5cdFx0fSk7XG5cdFx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIGRpc3BsYXkgdGhlIEFQSSBwcm9taXNlIHJlc3VsdHMgb250byB0aGUgcGFnZVxuXHQgICAgYXBwLmRpc3BsYXlNZWRpYSA9IChhbGxNZWRpYUFycmF5KSA9PiB7XG5cdCAgICBcdC8vIFRoaXMgbWV0aG9kIHJlbW92ZXMgY2hpbGQgbm9kZXMgZnJvbSB0aGUgbWVkaWEgcmVzdWx0cyBlbGVtZW50KHByZXZpb3VzIHNlYXJjaCByZXN1bHRzKSwgYnV0IG9ubHkgd2hlbiB0aGUgc2VhcmNoIHF1ZXJ5IGJyaW5ncyBuZXcgcmVzdWx0cy4gT3RoZXJ3aXNlIGl0IHdpbGwga2VlcCB0aGUgY3VycmVudCByZXN1bHRzIGFuZCBkaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UuXG5cdCAgICBcdGlmIChhcHAubm9SZXN1bHRzID09PSBmYWxzZSkge1xuXHQgICAgXHRcdCQoJyNlcnJvcicpLmVtcHR5KCk7XG5cdCAgICBcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmVtcHR5KCk7XG5cdCAgICBcdH07XG5cblx0ICAgIFx0YWxsTWVkaWFBcnJheS5mb3JFYWNoKChzaW5nbGVNZWRpYSkgPT4ge1xuXHQgICAgXHRcdC8vIEZvciBlYWNoIHJlc3VsdCBpbiB0aGUgYXJyYXkgcmV0dXJuZWQgZnJvbSBBUEkjMSwgY3JlYXRlIHZhcmlhYmxlcyBmb3IgYWxsIGh0bWwgZWxlbWVudHMgSSdsbCBiZSBhcHBlbmRpbmcuXG5cdCAgICBcdFx0Ly8gS0VFUElORyBUWVBFIEFORCBUSVRMRSBTRVBBUkFURVxuXHQgICAgXHRcdC8vIGNvbnN0ICRtZWRpYVR5cGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190eXBlJykudGV4dChzaW5nbGVNZWRpYS5UeXBlKTtcblx0ICAgIFx0XHQvLyBjb25zdCAkbWVkaWFUaXRsZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3RpdGxlJykudGV4dChzaW5nbGVNZWRpYS5OYW1lKTtcblx0ICAgIFx0XHQvLyBDT01CSU5JTkcgVFlQRSBBTkQgVElUTEVcblx0ICAgIFx0XHQvLyBjb25zdCAkbWVkaWFUeXBlVGl0bGUgPSAkKGA8ZGl2IGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlLWNvbnRhaW5lclwiPjxoMiBjbGFzcz1cIm1lZGlhX190eXBlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTo8L2gyPjxoMiBjbGFzcz1cIm1lZGlhX190aXRsZVwiPiR7c2luZ2xlTWVkaWEuTmFtZX08L2gyPjwvZGl2PmApO1xuXHQgICAgXHRcdC8vIENPTUJJTklORyBUWVBFIEFORCBUSVRMRSBJTiBPTkUgSDJcblx0ICAgIFx0XHQvLyBhcHAubWVkaWFUeXBlID0gc2luZ2xlTWVkaWEuVHlwZTtcblx0ICAgIFx0XHQvLyBhcHAubWVkaWFUaXRsZSA9IHNpbmdsZU1lZGlhLk5hbWU7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGgyIGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTogJHtzaW5nbGVNZWRpYS5OYW1lfTwvaDI+YCk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIgPSAkKCc8aDM+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbi1oZWFkZXInKS50ZXh0KCdEZXNjcmlwdGlvbicpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpcGVkaWEnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZVxuXHQgICAgXHRcdFx0Ly8gaGVpZ2h0OiAzMTVcblx0ICAgIFx0XHRcdC8vIG1heC13aWR0aDogNTYwXG5cdCAgICBcdFx0fSk7XHRcblxuXHQgICAgXHRcdGNvbnN0ICRhZGRCdXR0b24gPSAkKCc8aW5wdXQ+JykuYXR0cih7XG5cdCAgICBcdFx0XHR0eXBlOiAnYnV0dG9uJyxcblx0ICAgIFx0XHRcdHZhbHVlOiAnQWRkIHRvIEZhdm91cml0ZXMnLFxuXHQgICAgXHRcdFx0Zm9ybTogJ2FkZC1idXR0b24tZm9ybScsXG5cdCAgICBcdFx0XHRjbGFzczogJ2FkZC1idXR0b24nXG5cdCAgICBcdFx0fSk7XG5cblx0ICAgIFx0XHQvLyBjb25zdCAkYWRkQnV0dG9uID0gJChgPGZvcm0+PGlucHV0IHR5cGU9XCJidXR0b25cIiB2YWx1ZT1cIkFkZCB0byBGYXZvdXJpdGVzXCIgZm9ybT1cImFkZC1idXR0b24tZm9ybVwiIGNsYXNzPVwiYWRkLWJ1dHRvblwiPjwvaW5wdXQ+PC9mb3JtPmApO1xuXHQgICAgXHRcdC8vID8/P0lTIFRIRVJFIEEgV0FZIFRPIEFQUEVORCBBTiBJTlBVVCBJTlNJREUgT0YgQSBGT1JNPz8/IElGIE5PVDwgSlVTVCBETyBJTlBVVCBBTkQgVVNFICdvbkNMaWNrJyBldmVudCBsaXN0ZW5lciB0byBzdWJtaXQgdGhlIG1lZGlhIHR5cGVhbmQgdGl0bGUgdG8gRmlyZWJhc2UuXG5cblx0ICAgIFx0XHQvLyBjb25zdCAkYWRkRm9ybSA9IGA8Zm9ybSBpZD1cImFkZC1idXR0b24tZm9ybVwiPiR7JGFkZEJ1dHRvbn08L2Zvcm0+YDtcblx0ICAgIFx0XHRcblx0ICAgIFx0XHQvLyBjb25zb2xlLmxvZyhhcHAuaW1kYlJlc3VsdHNBcnJheSk7XG5cblx0ICAgIFx0XHQvLyBUaGlzIG1hdGNoZXMgdGhlIG1vdmllIG9yIHNob3cgdGl0bGUgZnJvbSBBUEkjMSB3aXRoIEFQSSMyLiBJdCB0aGVuIGNyZWF0ZXMgYSB2YXJpYWJsZSBmb3IgdGhlIElNREIgUmF0aW5nIHJldHVybmVkIGZyb20gQVBJIzIgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIHBhZ2UuXG5cdCAgICBcdFx0aWYgKGFwcC5pbWRiUmVzdWx0c0FycmF5ICE9PSB1bmRlZmluZWQpIHtcblx0XHQgICAgXHRcdGFwcC5pbWRiUmVzdWx0c0FycmF5LmZpbmQoKGVsZW1lbnQpID0+IHtcblx0XHQgICAgXHRcdFx0aWYgKHNpbmdsZU1lZGlhLk5hbWUgPT09IGVsZW1lbnQuVGl0bGUpIHtcblx0XHQgICAgXHRcdFx0XHRjb25zdCAkbWVkaWFJbWRiID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2ltZGItcmF0aW5nJykudGV4dChgJHtlbGVtZW50LmltZGJSYXRpbmd9LzEwYCk7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gY29uc3QgJGltZGJMb2dvID0gJCgnPGltZz4nKS5hZGRDbGFzcygnaW1kYi1sb2dvJykuYXR0cignc3JjJywgJ2h0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvNi82OS9JTURCX0xvZ29fMjAxNi5zdmcnKTtcblx0XHQgICAgXHRcdFx0XHRjb25zdCAkaW1kYkxvZ29SYXRpbmcgPSAkKGA8ZGl2IGNsYXNzPVwiaW1kYi1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwiaW1kYi1pbWFnZS1jb250YWluZXJcIj48aW1nIHNyYz1cImh0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvNi82OS9JTURCX0xvZ29fMjAxNi5zdmdcIiBhbHQ9XCJJTURCIExvZ29cIj48L2Rpdj48cCBjbGFzcz1cImltZGItcmF0aW5nXCI+JHtlbGVtZW50LmltZGJSYXRpbmd9LzEwPC9wPjwvZGl2PmApO1xuXHRcdCAgICBcdFx0XHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkaW1kYkxvZ29SYXRpbmcsICRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0XHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHRcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkaW1kYkxvZ29SYXRpbmcsICRtZWRpYVlvdVR1YmUsICRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0XHRcdH07XG5cdFx0ICAgIFx0XHRcdH07XG5cdFx0ICAgIFx0XHR9KTtcblx0XHQgICAgXHRcdC8vIFRoaXMgYXBwZW5kcyB0aGUgcmVzdWx0cyBmcm9tIEFQSSMxIGZvciBub24tbW92aWUvc2hvdyBtZWRpYSB0eXBlcy5cblx0XHQgICAgXHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdCAgICBcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRtZWRpYVlvdVR1YmUsICRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0fTtcblx0XHQgICAgXHR9O1xuXHQgICAgXHR9KTtcblx0ICAgIH07XG5cdCAgICBcblx0fSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIEZpcmViYXNlOiBNZWRpYSBGYXZvdXJpdGVzIExpc3Rcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBFdmVudCBsaXN0ZW5lciBmb3IgYWRkaW5nIG1lZGlhIHR5cGUgYW5kIHRpdGxlIHRvIHRoZSBsaXN0IHN1Ym1pdHRpbmcgdGhlIGZvcm0vcHJpbnRpbmcgdGhlIGxpc3RcbiAgICBtZWRpYUNvbnRhaW5lci5vbignY2xpY2snLCAnLmFkZC1idXR0b24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgLy8gVGhpcyB2YXJpYWJsZSBzdG9yZXMgdGhlIGVsZW1lbnQocykgaW4gdGhlIGZvcm0gSSB3YW50IHRvIGdldCB2YWx1ZShzKSBmcm9tLiBJbiB0aGlzIGNhc2UgaXQgdGhlIHAgcmVwcmVzZW50aW5nIHRoZSBtZWRpYSB0aXRsZSBhbmQgdGhlIHAgcmVwcmVzZW50aW5nIHRoZSBtZWRpYSB0eXBlLlxuICAgICAgICAvLyBjb25zdCB0eXBlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3R5cGUnKVswXS5pbm5lclRleHQ7XG4gICAgICAgIC8vIGNvbnN0IHRpdGxlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3RpdGxlJylbMF0uaW5uZXJUZXh0O1xuICAgICAgICBjb25zdCB0eXBlQW5kVGl0bGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdHlwZV9fdGl0bGUnKVswXS5pbm5lclRleHRcbiAgICAgIFxuICAgICAgICBjb25zdCBtZWRpYU9iamVjdCA9IHtcbiAgICAgICAgXHQvLyB0eXBlLFxuICAgICAgICBcdC8vIHRpdGxlXG4gICAgICAgIFx0dHlwZUFuZFRpdGxlXG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRoZSBpbmZvcm1hdGlvbiB0byBGaXJlYmFzZVxuICAgICAgICBhcHAubWVkaWFMaXN0LnB1c2gobWVkaWFPYmplY3QpO1xuICAgIH0pO1xuICAgIC8vIGNvbnNvbGUubG9nKGFwcC5tZWRpYUxpc3QpO1xuICAgIC8vIEdldCB0aGUgdHlwZSBhbmQgdGl0bGUgaW5mb3JtYXRpb24gZnJvbSBGaXJlYmFzZVxuICAgIGFwcC5tZWRpYUxpc3QubGltaXRUb0xhc3QoMTApLm9uKCdjaGlsZF9hZGRlZCcsZnVuY3Rpb24obWVkaWFJbmZvKSB7XG4gICAgXHQvLyBjb25zb2xlLmxvZyhtZWRpYUluZm8pO1xuICAgIFx0Y29uc3QgZGF0YSA9IG1lZGlhSW5mby52YWwoKTtcbiAgICBcdC8vIGNvbnN0IG1lZGlhVHlwZUZCID0gZGF0YS50eXBlO1xuICAgIFx0Ly8gY29uc3QgbWVkaWFUaXRsZUZCID0gZGF0YS50aXRsZTtcbiAgICBcdGNvbnN0IG1lZGlhRkIgPSBkYXRhLnR5cGVBbmRUaXRsZTtcbiAgICBcdGNvbnN0IGtleSA9IG1lZGlhSW5mby5rZXk7XG4gICAgXHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRhaHQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG4gICAgXHRjb25zdCBsaSA9IGA8bGkgaWQ9XCJrZXktJHtrZXl9XCIgY2xhc3M9XCJmYXZvdXJpdGVzLWxpc3RfX2xpc3QtaXRlbVwiPlxuICAgIFx0XHRcdFx0XHQ8cD4ke21lZGlhRkJ9PC9wPlxuICAgIFx0XHRcdFx0XHQ8YnV0dG9uIGlkPVwiJHtrZXl9XCIgY2xhc3M9XCJkZWxldGUgbm8tcHJpbnRcIj48aSBjbGFzcz1cImZhcyBmYS10aW1lcy1jaXJjbGVcIj48L2k+PC9idXR0b24+XG4gICAgXHRcdFx0XHQ8L2xpPmBcbiAgICBcdGZhdm91cml0ZXNMaXN0LmFwcGVuZChsaSk7XG4gICAgXHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIGRlbGV0ZSBpY29uIGlzIGNsaWNrZWRcbiAgICBmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIFx0Y29uc3QgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgXHRcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBDbGVhciBidXR0b24gaXMgY2xpY2tlZFxuICAgICQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgXHRhcHAuZGF0YWJhc2UucmVmKGAvbWVkaWFMaXN0YCkuc2V0KG51bGwpO1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSB0aGUgZnJvbnQgZW5kIGFwcGVuZFxuICAgIGFwcC5tZWRpYUxpc3QubGltaXRUb0xhc3QoNSkub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdC8vIGNvbnNvbGUubG9nKGZhdm91cml0ZXNMaXN0LmZpbmQobGlzdEl0ZW1zLmtleSkpO1xuXHRmYXZvdXJpdGVzTGlzdC5maW5kKGAja2V5LSR7bGlzdEl0ZW1zLmtleX1gKS5yZW1vdmUoKTtcblx0fSk7XHRcblx0Ly8gTWF4aW1pemUgYW5kIE1pbmltaXplIGJ1dHRvbnMgZm9yIHRoZSBGYXZvdXJpdGVzIExpc3Rcblx0JCgnLmZhdm91cml0ZXMtbWF4aW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZURvd24oMjAwKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdH0pO1xuXG5cdCQoJy5mYXZvdXJpdGVzLW1pbmltaXplJykuY2xpY2soZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5mYXZvdXJpdGVzLWxpc3Qtd2luZG93Jykuc2xpZGVVcCgyMDApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG5cdFxuXHQkKGZ1bmN0aW9uKCl7XG4kKCcjdmlkZW8nKS5jc3MoeyB3aWR0aDogJCh3aW5kb3cpLmlubmVyV2lkdGgoKSArICdweCcsIGhlaWdodDogJCh3aW5kb3cpLmlubmVySGVpZ2h0KCkgKyAncHgnIH0pO1xuXG4kKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7XG4kKCcjdmlkZW8nKS5jc3MoeyB3aWR0aDogJCh3aW5kb3cpLmlubmVyV2lkdGgoKSArICdweCcsIGhlaWdodDogJCh3aW5kb3cpLmlubmVySGVpZ2h0KCkgKyAncHgnIH0pO1xuICB9KTtcbn0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMb2dvIEFuaW1hdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdGxldCBsb2dvQW5pbWF0ZTtcblxuXHRjb25zdCBnZXRSYW5kb21OdW1iZXIgPSAoKSA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpO1xuXG5cdGFwcC5nZXRSYW5kb21Db2xvdXIgPSAoKSA9PiB7XG5cdFx0Y29uc3QgcmVkID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgYmx1ZSA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGdyZWVuID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgcmdiID0gYHJnYigke3JlZH0sICR7Z3JlZW59LCAke2JsdWV9KWBcblx0XHRyZXR1cm4gcmdiO1xuXHR9O1xuXG5cdGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcblx0XG5cdGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB0b3BTID0gKCkgPT4ge1xuXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5saW5lV2lkdGggPSA3O1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubGluZVdpZHRoID0gNTtcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdC8vIFRPUCBQSUVDRVxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubW92ZVRvKDEwMCwgMTAwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdC8vIDJORCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDEzNSk7XG5cdFx0Ly8gM1JEIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0Y3R4LmxpbmVUbygxMDAsIDE2MCk7XG5cdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0Y3R4LmZpbGxTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRjdHguZmlsbCgpO1xuXHR9O1xuXG5cdHRvcFMoKTtcblxuXHRsZXQgb25lTG9nb0ludGVydmFsID0gKCkgPT4ge1xuXHRcdGZvciAobGV0IGkgPSAxOyBpIDw9IDUwOyBpID0gaSArIDEpIHtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDEwMCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDc1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDExMCArIGkpLCAoMTEwIC0gaSkpO1xuXHRcdFx0XHRcdC8vIGN0eC5hcmMoKDIwMCArIGkpLCAoMjAwICsgaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdC8vIDJORCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDExMCArIGkpLCAoMTEwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDEyMCArIGkpLCAoOTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTUwICsgaSksICgxMzUgKyBpKSk7XG5cdFx0XHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTUwIC0gaSksICgxMzUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTAwIC0gaSksICgxNjAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTQwIC0gaSksICgxMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR0b3BTKCk7XG5cdFx0XHR9LCAoaSkpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmFyYygxMjUsIDExNywgMTEwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTUwIC0gaSksICg1MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDI1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE2MCAtIGkpLCAoNjAgKyBpKSk7XG5cdFx0XHRcdFx0Ly8gY3R4LmFyYygoMjkwIC0gaSksICgyOTAgLSBpKSwgMTAwLCAxICogTWF0aC5QSSwgMS43ICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Ly8gTUlERExFIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTYwIC0gaSksICgxNjAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTcwIC0gaSksICgxNDAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjAwIC0gaSksICgxODUgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTAwICsgaSksICgxODUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoNTAgKyBpKSwgKDIxMCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg5MCArIGkpLCAoMTc1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0b3BTKCk7XG5cblx0XHRcdH0sICg1MCArIGkpKTtcblx0XHR9O1xuXHR9O1xuXHRcblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuXHRcdGxvZ29BbmltYXRlID0gc2V0SW50ZXJ2YWwob25lTG9nb0ludGVydmFsLCAxMDApO1xuXHR9KTtcblxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA2MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNsZWFySW50ZXJ2YWwobG9nb0FuaW1hdGUpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0Ly8gY3R4LmFyYygxMjUsIDExNywgNjAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubGluZVdpZHRoID0gNztcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubW92ZVRvKDEwMCwgMTAwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHRcdC8vIDJORCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNTAsIDEzNSk7XG5cdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMDAsIDE2MCk7XG5cdFx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRcdGN0eC5maWxsU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0fTtcblx0XHRcdHRvcFMoKTtcblx0XHR9LCAxMDApXG5cdFx0XG5cdFx0XG5cdH0pO1xuXHRcbn1cbi8vIFRoaXMgcnVucyB0aGUgYXBwXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuY29uZmlnKCk7XG5cdGFwcC5pbml0KCk7XG59KTsiXX0=
