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
				}).catch(function (error) {
					return error;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDLE1BQU0sa0JBQWtCLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0IsY0FBbEIsRUFBa0MsSUFBbEMsQ0FBdUMseUhBQXZDLENBQXhCO0FBQ0EsVUFBUSxHQUFSLENBQVksZUFBWjtBQUNBLElBQUUsUUFBRixFQUFZLE1BQVosQ0FBbUIsZUFBbkI7QUFDQSxFQUpEOztBQU1BO0FBQ0EsR0FBRSxjQUFGLEVBQWtCLEVBQWxCLENBQXFC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QUFJLFFBQUosR0FBZSxFQUFFLElBQUYsRUFBUSxJQUFSLEVBQWY7QUFDQSxFQUhEOztBQUtBLEdBQUUsTUFBRixFQUFVLEtBQVYsQ0FBZ0IsWUFBVztBQUMxQixJQUFFLG9CQUFGLEVBQXdCLFFBQXhCLENBQWlDLE1BQWpDO0FBQ0EsTUFBSSxRQUFKLEdBQWUsSUFBZjtBQUNBLEVBSEQ7O0FBS0EsR0FBRSxnQkFBRixFQUFvQixLQUFwQixDQUEwQixZQUFXO0FBQ3BDLElBQUUsb0JBQUYsRUFBd0IsV0FBeEIsQ0FBb0MsTUFBcEM7QUFDQSxFQUZEO0FBSUEsQ0E3WEQ7QUE4WEE7QUFDQSxFQUFFLFlBQVc7QUFDWixLQUFJLE1BQUo7QUFDQSxLQUFJLElBQUo7QUFDQSxDQUhEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ3JlYXRlIHZhcmlhYmxlIGZvciBhcHAgb2JqZWN0XG5jb25zdCBhcHAgPSB7fTtcblxuYXBwLmNvbmZpZyA9ICgpID0+IHsgICBcbiAgICBjb25zdCBjb25maWcgPSB7XG5cdCAgICBhcGlLZXk6IFwiQUl6YVN5QWVfTHFZTFZtLW9Wc2s5R0RFa1o5X0YxcGhXaVNvc0xZXCIsXG5cdCAgICBhdXRoRG9tYWluOiBcImpzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWFwcC5jb21cIixcblx0ICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vanMtc3VtbWVyLXByb2plY3QzLmZpcmViYXNlaW8uY29tXCIsXG5cdCAgICBwcm9qZWN0SWQ6IFwianMtc3VtbWVyLXByb2plY3QzXCIsXG5cdCAgICBzdG9yYWdlQnVja2V0OiBcIlwiLFxuXHQgICAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiMTA0Nzc5MzAzNDE1NVwiXG5cdH07XG4gICAgLy9UaGlzIHdpbGwgaW5pdGlhbGl6ZSBmaXJlYmFzZSB3aXRoIG91ciBjb25maWcgb2JqZWN0XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgIC8vIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgY29ubmVjdGlvbiB0byB0aGUgZGF0YWJhc2VcbiAgICBhcHAuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgIC8vIFRoaXMgY3JlYXRlcyBhIHJlZmVyZW5jZSB0byBhIGxvY2F0aW9uIGluIHRoZSBkYXRhYmFzZS4gSSBvbmx5IG5lZWQgb25lIGZvciB0aGlzIHByb2plY3QgdG8gc3RvcmUgdGhlIG1lZGlhIGxpc3RcbiAgICBhcHAubWVkaWFMaXN0ID0gYXBwLmRhdGFiYXNlLnJlZignL21lZGlhTGlzdCcpO1xufTtcblxuYXBwLmluaXQgPSAoKSA9PiB7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNpbWlsYXIgYW5kIE9NREIgQVBJczogR2V0IFJlc3VsdHMgYW5kIGRpc3BsYXlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBTaW1pbGFyIEFQSSBLZXlcblx0YXBwLnNpbWlsYXJLZXkgPSAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJztcblxuXHQvLyBPTURCIEFQSSBLZXlcblx0YXBwLm9tZGJLZXkgPSAnMTY2MWZhOWQnO1xuXHQvLyBGaXJlYmFzZSB2YXJpYWJsZXNcblx0Y29uc3QgbWVkaWFUeXBlRWxlbWVudCA9ICQoJy5tZWRpYV9fdHlwZScpXG5cdGNvbnN0IG1lZGlhVGl0bGVFbGVtZW50ID0gJCgnLm1lZGlhX190aXRsZScpO1xuXG5cdGNvbnN0IG1lZGlhQ29udGFpbmVyID0gJCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpO1xuXHRjb25zdCBmYXZvdXJpdGVzTGlzdCA9ICQoJy5mYXZvdXJpdGVzLWxpc3RfX2xpc3QnKTtcblx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgYW4gaW5saW5lIGVycm9yIHVuZGVyIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBubyByZXN1bHRzIGFyZSByZXR1cm5lZCBmcm9tIEFQSSMxIChlbXB0eSBhcnJheSlcblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHRjb25zdCAkbm9SZXN1bHRzRXJyb3IgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW5saW5lLWVycm9yJykudGV4dCgnU29ycnksIHdlIGFyZSB1bmFibGUgdG8gZmluZCB5b3VyIHJlc3VsdHMuIFRoZXkgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBvciB5b3VyIHNwZWxsaW5nIGlzIGluY29ycmVjdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHRjb25zb2xlLmxvZygkbm9SZXN1bHRzRXJyb3IpO1xuXHRcdCQoJyNlcnJvcicpLmFwcGVuZCgkbm9SZXN1bHRzRXJyb3IpO1xuXHR9O1xuXG5cdC8vIEV2ZW50IExpc3RlbmVyIHRvIGlubHVkZSBldmVyeXRoaW5nIHRoYXQgaGFwcGVucyBvbiBmb3JtIHN1Ym1pc3Npb25cblx0JCgnLm1lZGlhX19mb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gUHJldmVudCBkZWZhdWx0IGZvciBzdWJtaXQgaW5wdXRzXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcblx0XHRhcHAudXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIHR5cGU6IGAke2FwcC51c2VyVHlwZX1gLFxuXHRcdCAgICAgIGluZm86IDEsXG5cdFx0ICAgICAgbGltaXQ6IDEwXG5cdFx0ICAgIH1cblx0XHR9KTtcblxuXHRcdC8vIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHBhc3MgbW92aWUgdGl0bGVzIGZyb20gUHJvbWlzZSMxIGludG8gUHJvbWlzZSAjMlxuXHRcdGFwcC5nZXRJbWRiUmF0aW5nID0gKG1vdmllVGl0bGUpID0+IHtcblx0XHRcdC8vIFJldHVybiBQcm9taXNlIzIgd2hpY2ggaW5jbHVkZXMgdGhlIG1vdmllIHRpdGxlIGZyb20gUHJvbWlzZSMxXG5cdFx0ICAgIHJldHVybiAkLmFqYXgoe1xuXHRcdCAgICAgICAgICAgICB1cmw6ICdodHRwOi8vd3d3Lm9tZGJhcGkuY29tJyxcblx0XHQgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgICAgICAgICAgZGF0YToge1xuXHRcdCAgICAgICAgICAgICAgIGFwaWtleTogJzE2NjFmYTlkJyxcblx0XHQgICAgICAgICAgICAgICB0OiBtb3ZpZVRpdGxlXG5cdFx0ICAgICAgICAgICAgIH1cblx0XHQgICAgfSk7XG5cdFx0fTtcblx0XHQvLyBHZXQgcmVzdWx0cyBmb3IgUHJvbWlzZSMxXG5cdCAgICAkLndoZW4oYXBwLmdldE1lZGlhKS50aGVuKChtZWRpYUluZm8pID0+IHtcblx0ICAgICAgY29uc3QgbWVkaWFJbmZvQXJyYXkgPSBtZWRpYUluZm8uU2ltaWxhci5SZXN1bHRzO1xuXHQgICAgICBjb25zb2xlLmxvZyhtZWRpYUluZm9BcnJheSk7XG5cblx0ICAgICAgYXBwLm5vUmVzdWx0cyA9ICQuaXNFbXB0eU9iamVjdChtZWRpYUluZm9BcnJheSk7XG5cdCAgICAgIGlmIChhcHAubm9SZXN1bHRzID09PSB0cnVlKSB7XG5cdCAgICAgIFx0JCgnI2Vycm9yJykuZW1wdHkoKTtcblx0ICAgICAgXHRhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKCk7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgIFx0Ly8gRGlzcGxheSBtZWRpYSByZXN1bHRzIGNvbnRhaW5lciB3aXRoIHRoZSByaWdodCBtYXJnaW5zXG5cdCAgICAgIFx0JCgnZm9vdGVyJykuY3NzKCdtYXJnaW4tdG9wJywgJzBweCcpO1xuXHQgICAgICBcdCQoJy5tZWRpYV9fcmVzdWx0cy1jb250YWluZXInKS5jc3MoJ21hcmdpbi1ib3R0b20nLCAnNTBweCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0ICAgICAgfTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1lZGlhIHR5cGUgaXMgbW92aWVzIG9yIHNob3dzLCBnZXQgcmVzdWx0cyBhcnJheSBmcm9tIFByb21pc2UgIzEgYW5kIG1hcCBlYWNoIG1vdmllIHRpdGxlIHJlc3VsdCB0byBhIHByb21pc2UgZm9yIFByb21pc2UgIzIuIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgcHJvbWlzZXMgZm9yIEFQSSMyLlxuXHQgICAgICBpZiAoYXBwLnVzZXJUeXBlID09PSAnbW92aWVzJyB8fCBhcHAudXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdCAgICAgIFx0cmV0dXJuIGVycm9yO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgICB9IGVsc2Uge1xuXHRcdCAgXHRcdGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQvLyBTdHJldGNoIEdvYWw6IFB1dCBzb21ldGhpbmcgaGVyZVxuXHRcdCAgY29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblx0XHQvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gZGlzcGxheSB0aGUgQVBJIHByb21pc2UgcmVzdWx0cyBvbnRvIHRoZSBwYWdlXG5cdCAgICBhcHAuZGlzcGxheU1lZGlhID0gKGFsbE1lZGlhQXJyYXkpID0+IHtcblx0ICAgIFx0Ly8gVGhpcyBtZXRob2QgcmVtb3ZlcyBjaGlsZCBub2RlcyBmcm9tIHRoZSBtZWRpYSByZXN1bHRzIGVsZW1lbnQocHJldmlvdXMgc2VhcmNoIHJlc3VsdHMpLCBidXQgb25seSB3aGVuIHRoZSBzZWFyY2ggcXVlcnkgYnJpbmdzIG5ldyByZXN1bHRzLiBPdGhlcndpc2UgaXQgd2lsbCBrZWVwIHRoZSBjdXJyZW50IHJlc3VsdHMgYW5kIGRpc3BsYXkgYW4gZXJyb3IgbWVzc2FnZS5cblx0ICAgIFx0aWYgKGFwcC5ub1Jlc3VsdHMgPT09IGZhbHNlKSB7XG5cdCAgICBcdFx0JCgnI2Vycm9yJykuZW1wdHkoKTtcblx0ICAgIFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuZW1wdHkoKTtcblx0ICAgIFx0fTtcblxuXHQgICAgXHRhbGxNZWRpYUFycmF5LmZvckVhY2goKHNpbmdsZU1lZGlhKSA9PiB7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGgyIGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTogJHtzaW5nbGVNZWRpYS5OYW1lfTwvaDI+YCk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIgPSAkKCc8aDM+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbi1oZWFkZXInKS50ZXh0KCdEZXNjcmlwdGlvbicpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uID0gJCgnPHA+JykuYWRkQ2xhc3MoJ21lZGlhX19kZXNjcmlwdGlvbicpLnRleHQoc2luZ2xlTWVkaWEud1RlYXNlcik7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpcGVkaWEnKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFZb3VUdWJlID0gJCgnPGlmcmFtZT4nLCB7XG5cdCAgICBcdFx0XHRjbGFzczogJ21lZGlhX195b3V0dWJlJyxcblx0ICAgIFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0ICAgIFx0XHRcdGlkOiBzaW5nbGVNZWRpYS55SUQsXG5cdCAgICBcdFx0XHRmcmFtZWJvcmRlcjogMCxcblx0ICAgIFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZVxuXHQgICAgXHRcdH0pO1x0XG5cdCAgICBcdFx0Y29uc3QgJGFkZEJ1dHRvbiA9ICQoJzxpbnB1dD4nKS5hdHRyKHtcblx0ICAgIFx0XHRcdHR5cGU6ICdidXR0b24nLFxuXHQgICAgXHRcdFx0dmFsdWU6ICdBZGQgdG8gRmF2b3VyaXRlcycsXG5cdCAgICBcdFx0XHRmb3JtOiAnYWRkLWJ1dHRvbi1mb3JtJyxcblx0ICAgIFx0XHRcdGNsYXNzOiAnYWRkLWJ1dHRvbidcblx0ICAgIFx0XHR9KTtcblxuXHQgICAgXHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ICAgIFx0XHRhcHAuaW1kYlJlc3VsdHNBcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG5cdFx0ICAgIFx0XHRcdGlmIChzaW5nbGVNZWRpYS5OYW1lID09PSBlbGVtZW50LlRpdGxlKSB7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoYCR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMGApO1xuXHRcdCAgICBcdFx0XHRcdGNvbnN0ICRpbWRiTG9nb1JhdGluZyA9ICQoYDxkaXYgY2xhc3M9XCJpbWRiLWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJpbWRiLWltYWdlLWNvbnRhaW5lclwiPjxpbWcgc3JjPVwiaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy82LzY5L0lNREJfTG9nb18yMDE2LnN2Z1wiIGFsdD1cIklNREIgTG9nb1wiPjwvZGl2PjxwIGNsYXNzPVwiaW1kYi1yYXRpbmdcIj4ke2VsZW1lbnQuaW1kYlJhdGluZ30vMTA8L3A+PC9kaXY+YCk7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdCAgICBcdFx0XHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkYWRkQnV0dG9uKS5hZGRDbGFzcygncmVzdWx0LWNvbnRhaW5lcicpO1xuXHRcdCAgICBcdFx0XHRcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKG9uZVJlc3VsdENvbnRhaW5lcik7XG5cdFx0ICAgIFx0XHRcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdFx0XHRcdGNvbnN0IG9uZVJlc3VsdENvbnRhaW5lciA9ICQoJzxkaXY+JykuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkaW1kYkxvZ29SYXRpbmcsICRtZWRpYVlvdVR1YmUsICRhZGRCdXR0b24pLmFkZENsYXNzKCdyZXN1bHQtY29udGFpbmVyJyk7XG5cdFx0ICAgIFx0XHRcdFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQob25lUmVzdWx0Q29udGFpbmVyKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdGNvbnN0IG9uZVJlc3VsdENvbnRhaW5lciA9ICQoJzxkaXY+JykuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkYWRkQnV0dG9uKS5hZGRDbGFzcygncmVzdWx0LWNvbnRhaW5lcicpO1xuXHRcdCAgICBcdFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQob25lUmVzdWx0Q29udGFpbmVyKTtcblx0XHQgICAgXHRcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJGFkZEJ1dHRvbikuYWRkQ2xhc3MoJ3Jlc3VsdC1jb250YWluZXInKTtcblx0XHQgICAgXHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZChvbmVSZXN1bHRDb250YWluZXIpO1xuXHRcdCAgICBcdFx0fTtcblx0XHQgICAgXHR9O1xuXHQgICAgXHR9KTtcblx0ICAgIH07XG5cdH0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGaXJlYmFzZTogTWVkaWEgRmF2b3VyaXRlcyBMaXN0XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gRXZlbnQgbGlzdGVuZXIgZm9yIGFkZGluZyBtZWRpYSB0eXBlIGFuZCB0aXRsZSB0byB0aGUgZmF2b3VyaXRlcyBsaXN0XG4gICAgbWVkaWFDb250YWluZXIub24oJ2NsaWNrJywgJy5hZGQtYnV0dG9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgIC8vIFRoaXMgdmFyaWFibGUgc3RvcmVzIHRoZSBlbGVtZW50KHMpIGluIHRoZSBmb3JtIEkgd2FudCB0byBnZXQgdmFsdWUocykgZnJvbS4gSW4gdGhpcyBjYXNlIGl0J3MgdGhlIDxwPiByZXByZXNlbnRpbmcgdGhlIG1lZGlhIHR5cGUgYW5kIG1lZGlhIHRpdGxlLlxuICAgICAgICBjb25zdCB0eXBlQW5kVGl0bGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdHlwZV9fdGl0bGUnKVswXS5pbm5lclRleHRcbiAgICAgIFxuICAgICAgICBjb25zdCBtZWRpYU9iamVjdCA9IHtcbiAgICAgICAgLy8gUmVtZW1iZXI6IFRoaXMgaXMgdGhlIHNhbWUgYXMgdHlwZUFuZFRpdGxlOiB0eXBlQW5kVGl0bGVcbiAgICAgICAgXHR0eXBlQW5kVGl0bGVcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdGhlIGluZm9ybWF0aW9uIHRvIEZpcmViYXNlXG4gICAgICAgIGFwcC5tZWRpYUxpc3QucHVzaChtZWRpYU9iamVjdCk7XG4gICAgfSk7XG4gICAgLy8gR2V0IHRoZSB0eXBlIGFuZCB0aXRsZSBpbmZvcm1hdGlvbiBmcm9tIEZpcmViYXNlXG4gICAgYXBwLm1lZGlhTGlzdC5vbignY2hpbGRfYWRkZWQnLGZ1bmN0aW9uKG1lZGlhSW5mbykge1xuICAgIFx0Y29uc3QgZGF0YSA9IG1lZGlhSW5mby52YWwoKTtcbiAgICBcdFxuICAgIFx0Y29uc3QgbWVkaWFGQiA9IGRhdGEudHlwZUFuZFRpdGxlO1xuICAgIFx0Y29uc3Qga2V5ID0gbWVkaWFJbmZvLmtleTtcbiAgICBcdC8vIENyZWF0ZSBMaXN0IEl0ZW0gdGhhdCBpbmNsdWRlcyB0aGUgdHlwZSBhbmQgdGl0bGVcbiAgICBcdGNvbnN0IGxpID0gYDxsaSBpZD1cImtleS0ke2tleX1cIiBjbGFzcz1cImZhdm91cml0ZXMtbGlzdF9fbGlzdC1pdGVtXCI+XG4gICAgXHRcdFx0XHRcdDxwPiR7bWVkaWFGQn08L3A+XG4gICAgXHRcdFx0XHRcdDxidXR0b24gaWQ9XCIke2tleX1cIiBjbGFzcz1cImRlbGV0ZSBuby1wcmludFwiPjxpIGNsYXNzPVwiZmFzIGZhLXRpbWVzLWNpcmNsZVwiPjwvaT48L2J1dHRvbj5cbiAgICBcdFx0XHRcdDwvbGk+YFxuICAgIFx0ZmF2b3VyaXRlc0xpc3QuYXBwZW5kKGxpKTtcbiAgICBcdGZhdm91cml0ZXNMaXN0WzBdLnNjcm9sbFRvcCA9IGZhdm91cml0ZXNMaXN0WzBdLnNjcm9sbEhlaWdodDtcbiAgICB9KTtcbiAgICAvLyBSZW1vdmUgbGlzdCBpdGVtIGZyb20gRmlyZWJhc2Ugd2hlbiB0aGUgZGVsZXRlIGljb24gaXMgY2xpY2tlZFxuICAgIGZhdm91cml0ZXNMaXN0Lm9uKCdjbGljaycsICcuZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgXHRjb25zdCBpZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICBcdFxuICAgIFx0YXBwLmRhdGFiYXNlLnJlZihgL21lZGlhTGlzdC8ke2lkfWApLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIENsZWFyIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgJCgnLmNsZWFyLWxpc3QnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3RgKS5zZXQobnVsbCk7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIHRoZSBmcm9udCBlbmQgYXBwZW5kXG4gICAgYXBwLm1lZGlhTGlzdC5vbignY2hpbGRfcmVtb3ZlZCcsIGZ1bmN0aW9uIChsaXN0SXRlbXMpIHtcblx0XG5cdGZhdm91cml0ZXNMaXN0LmZpbmQoYCNrZXktJHtsaXN0SXRlbXMua2V5fWApLnJlbW92ZSgpO1xuXHR9KTtcdFxuXHQvLyBNYXhpbWl6ZSBhbmQgTWluaW1pemUgYnV0dG9ucyBmb3IgdGhlIEZhdm91cml0ZXMgTGlzdFxuXHQkKCcuZmF2b3VyaXRlcy1tYXhpbWl6ZScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcblx0XHQkKCcuZmF2b3VyaXRlcy1saXN0LXdpbmRvdycpLnNsaWRlRG93bigyMDApLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG5cblx0JCgnLmZhdm91cml0ZXMtbWluaW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZVVwKDIwMCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHR9KTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTG9nbyBBbmltYXRpb25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHRsZXQgbG9nb0FuaW1hdGU7XG5cblx0Y29uc3QgZ2V0UmFuZG9tTnVtYmVyID0gKCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KTtcblxuXHRhcHAuZ2V0UmFuZG9tQ29sb3VyID0gKCkgPT4ge1xuXHRcdGNvbnN0IHJlZCA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGJsdWUgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBncmVlbiA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IHJnYiA9IGByZ2IoJHtyZWR9LCAke2dyZWVufSwgJHtibHVlfSlgXG5cdFx0cmV0dXJuIHJnYjtcblx0fTtcblxuXHRjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG5cdFxuXHRjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRsZXQgdG9wUyA9ICgpID0+IHtcblx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubGluZVdpZHRoID0gNztcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHQvLyAxU1QgUElFQ0Vcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHQvLyAyTkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdC8vIDNSRCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdGN0eC5maWxsU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0Y3R4LmZpbGwoKTtcblx0fTtcblxuXHR0b3BTKCk7XG5cblx0bGV0IG9uZUxvZ29JbnRlcnZhbCA9ICgpID0+IHtcblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSA1MDsgaSA9IGkgKyAxKSB7XG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmFyYygxMjUsIDExNywgMTEwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHQvLyAxU1QgUElFQ0Vcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTAwICsgaSksICgxMDAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTUwICsgaSksICg3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMTAgKyBpKSwgKDExMCAtIGkpKTtcblx0XHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMTAgKyBpKSwgKDExMCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMjAgKyBpKSwgKDkwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoMTM1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDEwMCAtIGkpLCAoMTYwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE0MCAtIGkpLCAoMTI1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0dG9wUygpO1xuXHRcdFx0fSwgKGkpKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gMVNUIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE1MCAtIGkpLCAoNTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjAwIC0gaSksICgyNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNjAgLSBpKSwgKDYwICsgaSkpO1xuXHRcdFx0XHRcdC8vIDJORCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDE2MCAtIGkpLCAoMTYwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE3MCAtIGkpLCAoMTQwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTg1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDUwICsgaSksICgyMTAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoOTAgKyBpKSwgKDE3NSAtIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dG9wUygpO1xuXG5cdFx0XHR9LCAoNTAgKyBpKSk7XG5cdFx0fTtcblx0fTtcblx0XG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcblx0XHRsb2dvQW5pbWF0ZSA9IHNldEludGVydmFsKG9uZUxvZ29JbnRlcnZhbCwgMTAwKTtcblx0fSk7XG5cblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNjAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjbGVhckludGVydmFsKGxvZ29BbmltYXRlKTtcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5saW5lV2lkdGggPSA3O1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubGluZVdpZHRoID0gNTtcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHQvLyAxU1QgUElFQ0Vcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHR9O1xuXHRcdFx0dG9wUygpO1xuXHRcdH0sIDEwMClcblx0XHRcblx0XHRcblx0fSk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUmVzcG9uc2l2ZSBEZXNpZ25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQkKCcubWVkaWFfX3R5cGUtbGFiZWwnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHQkKCcubWVkaWFfX2Zvcm1fX3R5cGUnKS5hZGRDbGFzcygnaGlkZScpO1xuXHRcdGFwcC51c2VyVHlwZSA9ICQodGhpcykudGV4dCgpO1xuXHR9KTtcblx0XHRcblx0JCgnI2FsbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHRcdCQoJy5tZWRpYV9fZm9ybV9fdHlwZScpLmFkZENsYXNzKCdoaWRlJyk7XG5cdFx0YXBwLnVzZXJUeXBlID0gbnVsbDtcblx0fSk7XG5cblx0JCgnLmJ1cmdlci1idXR0b24nKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHQkKCcubWVkaWFfX2Zvcm1fX3R5cGUnKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuXHR9KTtcblxufVxuLy8gVGhpcyBydW5zIHRoZSBhcHBcbiQoZnVuY3Rpb24oKSB7XG5cdGFwcC5jb25maWcoKTtcblx0YXBwLmluaXQoKTtcbn0pOyJdfQ==
