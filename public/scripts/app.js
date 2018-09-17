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

		$('#error').append($noResultsError);
	};

	// Event Listener to inlude everything that happens on form submission
	$('.header-container').on('submit', function (event) {
		// Prevent default for submit inputs
		event.preventDefault();

		$(".search__form-section").append("<svg class=\"lds-spinner loader\" width=\"100px\"  height=\"100px\"  xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\" style=\"background: none;\"><g transform=\"rotate(0 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.9166666666666666s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(30 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.8333333333333334s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(60 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.75s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(90 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.6666666666666666s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(120 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.5833333333333334s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(150 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.5s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(180 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.4166666666666667s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(210 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.3333333333333333s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(240 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.25s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(270 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.16666666666666666s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(300 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.08333333333333333s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(330 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"0s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g></svg>");

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

				$('.loader').remove();
			} else {
				// Display media results container with the right margins
				$('footer').css('margin-top', '0px');
				$('.media__results-container').removeClass('hidden');
				$("html").stop().animate({ scrollTop: $(".media__results-container").offset().top }, 1500, "swing");
				$('.loader').remove();
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
			}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNsQixLQUFNLFNBQVM7QUFDZCxVQUFRLHlDQURNO0FBRWQsY0FBWSxvQ0FGRTtBQUdkLGVBQWEsMkNBSEM7QUFJZCxhQUFXLG9CQUpHO0FBS2QsaUJBQWUsRUFMRDtBQU1kLHFCQUFtQjtBQU5MLEVBQWY7QUFRQTtBQUNBLFVBQVMsYUFBVCxDQUF1QixNQUF2QjtBQUNBO0FBQ0EsS0FBSSxRQUFKLEdBQWUsU0FBUyxRQUFULEVBQWY7QUFDQTtBQUNBLEtBQUksU0FBSixHQUFnQixJQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLFlBQWpCLENBQWhCO0FBQ0EsQ0FmRDs7QUFpQkEsSUFBSSxJQUFKLEdBQVcsWUFBTTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUksVUFBSixHQUFpQiwwQkFBakI7O0FBRUE7QUFDQSxLQUFJLE9BQUosR0FBYyxVQUFkO0FBQ0E7QUFDQSxLQUFNLG1CQUFtQixFQUFFLGNBQUYsQ0FBekI7QUFDQSxLQUFNLG9CQUFvQixFQUFFLGVBQUYsQ0FBMUI7O0FBRUEsS0FBTSxpQkFBaUIsRUFBRSwyQkFBRixDQUF2QjtBQUNBLEtBQU0saUJBQWlCLEVBQUUsd0JBQUYsQ0FBdkI7QUFDQTtBQUNBLEtBQUkscUJBQUosR0FBNEIsWUFBTTtBQUNqQyxNQUFNLGtCQUFrQixFQUFFLEtBQUYsRUFBUyxRQUFULENBQWtCLGNBQWxCLEVBQWtDLElBQWxDLENBQXVDLHlIQUF2QyxDQUF4Qjs7QUFFQSxJQUFFLFFBQUYsRUFBWSxNQUFaLENBQW1CLGVBQW5CO0FBQ0EsRUFKRDs7QUFNQTtBQUNBLEdBQUUsbUJBQUYsRUFBdUIsRUFBdkIsQ0FBMEIsUUFBMUIsRUFBb0MsVUFBVSxLQUFW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LElBOUJEO0FBK0JBO0FBQ0EsR0FqQ0QsRUFpQ0csR0FqQ0g7QUFvQ0EsRUF2Q0Q7O0FBeUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUUsb0JBQUYsRUFBd0IsS0FBeEIsQ0FBOEIsWUFBWTtBQUN6QyxJQUFFLG9CQUFGLEVBQXdCLFFBQXhCLENBQWlDLE1BQWpDO0FBQ0EsTUFBSSxRQUFKLEdBQWUsRUFBRSxJQUFGLEVBQVEsSUFBUixFQUFmO0FBQ0EsRUFIRDs7QUFLQSxHQUFFLE1BQUYsRUFBVSxLQUFWLENBQWdCLFlBQVk7QUFDM0IsSUFBRSxvQkFBRixFQUF3QixRQUF4QixDQUFpQyxNQUFqQztBQUNBLE1BQUksUUFBSixHQUFlLElBQWY7QUFDQSxFQUhEOztBQUtBLEdBQUUsZ0JBQUYsRUFBb0IsS0FBcEIsQ0FBMEIsWUFBWTtBQUNyQyxJQUFFLG9CQUFGLEVBQXdCLFdBQXhCLENBQW9DLE1BQXBDO0FBQ0EsRUFGRDtBQUlBLENBdllEO0FBd1lBO0FBQ0EsRUFBRSxZQUFZO0FBQ2IsS0FBSSxNQUFKO0FBQ0EsS0FBSSxJQUFKO0FBQ0EsQ0FIRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENyZWF0ZSB2YXJpYWJsZSBmb3IgYXBwIG9iamVjdFxuY29uc3QgYXBwID0ge307XG5cbmFwcC5jb25maWcgPSAoKSA9PiB7XG5cdGNvbnN0IGNvbmZpZyA9IHtcblx0XHRhcGlLZXk6IFwiQUl6YVN5QWVfTHFZTFZtLW9Wc2s5R0RFa1o5X0YxcGhXaVNvc0xZXCIsXG5cdFx0YXV0aERvbWFpbjogXCJqcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2VhcHAuY29tXCIsXG5cdFx0ZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9qcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2Vpby5jb21cIixcblx0XHRwcm9qZWN0SWQ6IFwianMtc3VtbWVyLXByb2plY3QzXCIsXG5cdFx0c3RvcmFnZUJ1Y2tldDogXCJcIixcblx0XHRtZXNzYWdpbmdTZW5kZXJJZDogXCIxMDQ3NzkzMDM0MTU1XCJcblx0fTtcblx0Ly9UaGlzIHdpbGwgaW5pdGlhbGl6ZSBmaXJlYmFzZSB3aXRoIG91ciBjb25maWcgb2JqZWN0XG5cdGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcblx0Ly8gVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBjb25uZWN0aW9uIHRvIHRoZSBkYXRhYmFzZVxuXHRhcHAuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuXHQvLyBUaGlzIGNyZWF0ZXMgYSByZWZlcmVuY2UgdG8gYSBsb2NhdGlvbiBpbiB0aGUgZGF0YWJhc2UuIEkgb25seSBuZWVkIG9uZSBmb3IgdGhpcyBwcm9qZWN0IHRvIHN0b3JlIHRoZSBtZWRpYSBsaXN0XG5cdGFwcC5tZWRpYUxpc3QgPSBhcHAuZGF0YWJhc2UucmVmKCcvbWVkaWFMaXN0Jyk7XG59O1xuXG5hcHAuaW5pdCA9ICgpID0+IHtcblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIFNpbWlsYXIgYW5kIE9NREIgQVBJczogR2V0IFJlc3VsdHMgYW5kIGRpc3BsYXlcblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIFNpbWlsYXIgQVBJIEtleVxuXHRhcHAuc2ltaWxhcktleSA9ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnO1xuXG5cdC8vIE9NREIgQVBJIEtleVxuXHRhcHAub21kYktleSA9ICcxNjYxZmE5ZCc7XG5cdC8vIEZpcmViYXNlIHZhcmlhYmxlc1xuXHRjb25zdCBtZWRpYVR5cGVFbGVtZW50ID0gJCgnLm1lZGlhX190eXBlJylcblx0Y29uc3QgbWVkaWFUaXRsZUVsZW1lbnQgPSAkKCcubWVkaWFfX3RpdGxlJyk7XG5cblx0Y29uc3QgbWVkaWFDb250YWluZXIgPSAkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJyk7XG5cdGNvbnN0IGZhdm91cml0ZXNMaXN0ID0gJCgnLmZhdm91cml0ZXMtbGlzdF9fbGlzdCcpO1xuXHQvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdGhhdCBkaXNwbGF5cyBhbiBpbmxpbmUgZXJyb3IgdW5kZXIgdGhlIHNlYXJjaCBmaWVsZCB3aGVuIG5vIHJlc3VsdHMgYXJlIHJldHVybmVkIGZyb20gQVBJIzEgKGVtcHR5IGFycmF5KVxuXHRhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yID0gKCkgPT4ge1xuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHlvdXIgcmVzdWx0cy4gVGhleSBtaWdodCBub3QgYmUgYXZhaWxhYmxlIG9yIHlvdXIgc3BlbGxpbmcgaXMgaW5jb3JyZWN0LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXG5cdFx0JCgnI2Vycm9yJykuYXBwZW5kKCRub1Jlc3VsdHNFcnJvcik7XG5cdH07XG5cblx0Ly8gRXZlbnQgTGlzdGVuZXIgdG8gaW5sdWRlIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIG9uIGZvcm0gc3VibWlzc2lvblxuXHQkKCcuaGVhZGVyLWNvbnRhaW5lcicpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIHN1Ym1pdCBpbnB1dHNcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0JChcIi5zZWFyY2hfX2Zvcm0tc2VjdGlvblwiKS5hcHBlbmQoXCI8c3ZnIGNsYXNzPVxcXCJsZHMtc3Bpbm5lciBsb2FkZXJcXFwiIHdpZHRoPVxcXCIxMDBweFxcXCIgIGhlaWdodD1cXFwiMTAwcHhcXFwiICB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiIHhtbG5zOnhsaW5rPVxcXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXFxcIiB2aWV3Qm94PVxcXCIwIDAgMTAwIDEwMFxcXCIgcHJlc2VydmVBc3BlY3RSYXRpbz1cXFwieE1pZFlNaWRcXFwiIHN0eWxlPVxcXCJiYWNrZ3JvdW5kOiBub25lO1xcXCI+PGcgdHJhbnNmb3JtPVxcXCJyb3RhdGUoMCA1MCA1MClcXFwiPlxcbiAgPHJlY3QgeD1cXFwiNDdcXFwiIHk9XFxcIjI0XFxcIiByeD1cXFwiOS40XFxcIiByeT1cXFwiNC44XFxcIiB3aWR0aD1cXFwiNlxcXCIgaGVpZ2h0PVxcXCIxMlxcXCIgZmlsbD1cXFwiI0ZGQzkwMFxcXCI+XFxuICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9XFxcIm9wYWNpdHlcXFwiIHZhbHVlcz1cXFwiMTswXFxcIiBrZXlUaW1lcz1cXFwiMDsxXFxcIiBkdXI9XFxcIjFzXFxcIiBiZWdpbj1cXFwiLTAuOTE2NjY2NjY2NjY2NjY2NnNcXFwiIHJlcGVhdENvdW50PVxcXCJpbmRlZmluaXRlXFxcIj48L2FuaW1hdGU+XFxuICA8L3JlY3Q+XFxuPC9nPjxnIHRyYW5zZm9ybT1cXFwicm90YXRlKDMwIDUwIDUwKVxcXCI+XFxuICA8cmVjdCB4PVxcXCI0N1xcXCIgeT1cXFwiMjRcXFwiIHJ4PVxcXCI5LjRcXFwiIHJ5PVxcXCI0LjhcXFwiIHdpZHRoPVxcXCI2XFxcIiBoZWlnaHQ9XFxcIjEyXFxcIiBmaWxsPVxcXCIjRkZDOTAwXFxcIj5cXG4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT1cXFwib3BhY2l0eVxcXCIgdmFsdWVzPVxcXCIxOzBcXFwiIGtleVRpbWVzPVxcXCIwOzFcXFwiIGR1cj1cXFwiMXNcXFwiIGJlZ2luPVxcXCItMC44MzMzMzMzMzMzMzMzMzM0c1xcXCIgcmVwZWF0Q291bnQ9XFxcImluZGVmaW5pdGVcXFwiPjwvYW5pbWF0ZT5cXG4gIDwvcmVjdD5cXG48L2c+PGcgdHJhbnNmb3JtPVxcXCJyb3RhdGUoNjAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjc1c1xcXCIgcmVwZWF0Q291bnQ9XFxcImluZGVmaW5pdGVcXFwiPjwvYW5pbWF0ZT5cXG4gIDwvcmVjdD5cXG48L2c+PGcgdHJhbnNmb3JtPVxcXCJyb3RhdGUoOTAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjY2NjY2NjY2NjY2NjY2NjZzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48ZyB0cmFuc2Zvcm09XFxcInJvdGF0ZSgxMjAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjU4MzMzMzMzMzMzMzMzMzRzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48ZyB0cmFuc2Zvcm09XFxcInJvdGF0ZSgxNTAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjVzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48ZyB0cmFuc2Zvcm09XFxcInJvdGF0ZSgxODAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjQxNjY2NjY2NjY2NjY2NjdzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48ZyB0cmFuc2Zvcm09XFxcInJvdGF0ZSgyMTAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjMzMzMzMzMzMzMzMzMzMzNzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48ZyB0cmFuc2Zvcm09XFxcInJvdGF0ZSgyNDAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIi0wLjI1c1xcXCIgcmVwZWF0Q291bnQ9XFxcImluZGVmaW5pdGVcXFwiPjwvYW5pbWF0ZT5cXG4gIDwvcmVjdD5cXG48L2c+PGcgdHJhbnNmb3JtPVxcXCJyb3RhdGUoMjcwIDUwIDUwKVxcXCI+XFxuICA8cmVjdCB4PVxcXCI0N1xcXCIgeT1cXFwiMjRcXFwiIHJ4PVxcXCI5LjRcXFwiIHJ5PVxcXCI0LjhcXFwiIHdpZHRoPVxcXCI2XFxcIiBoZWlnaHQ9XFxcIjEyXFxcIiBmaWxsPVxcXCIjRkZDOTAwXFxcIj5cXG4gICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT1cXFwib3BhY2l0eVxcXCIgdmFsdWVzPVxcXCIxOzBcXFwiIGtleVRpbWVzPVxcXCIwOzFcXFwiIGR1cj1cXFwiMXNcXFwiIGJlZ2luPVxcXCItMC4xNjY2NjY2NjY2NjY2NjY2NnNcXFwiIHJlcGVhdENvdW50PVxcXCJpbmRlZmluaXRlXFxcIj48L2FuaW1hdGU+XFxuICA8L3JlY3Q+XFxuPC9nPjxnIHRyYW5zZm9ybT1cXFwicm90YXRlKDMwMCA1MCA1MClcXFwiPlxcbiAgPHJlY3QgeD1cXFwiNDdcXFwiIHk9XFxcIjI0XFxcIiByeD1cXFwiOS40XFxcIiByeT1cXFwiNC44XFxcIiB3aWR0aD1cXFwiNlxcXCIgaGVpZ2h0PVxcXCIxMlxcXCIgZmlsbD1cXFwiI0ZGQzkwMFxcXCI+XFxuICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9XFxcIm9wYWNpdHlcXFwiIHZhbHVlcz1cXFwiMTswXFxcIiBrZXlUaW1lcz1cXFwiMDsxXFxcIiBkdXI9XFxcIjFzXFxcIiBiZWdpbj1cXFwiLTAuMDgzMzMzMzMzMzMzMzMzMzNzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48ZyB0cmFuc2Zvcm09XFxcInJvdGF0ZSgzMzAgNTAgNTApXFxcIj5cXG4gIDxyZWN0IHg9XFxcIjQ3XFxcIiB5PVxcXCIyNFxcXCIgcng9XFxcIjkuNFxcXCIgcnk9XFxcIjQuOFxcXCIgd2lkdGg9XFxcIjZcXFwiIGhlaWdodD1cXFwiMTJcXFwiIGZpbGw9XFxcIiNGRkM5MDBcXFwiPlxcbiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPVxcXCJvcGFjaXR5XFxcIiB2YWx1ZXM9XFxcIjE7MFxcXCIga2V5VGltZXM9XFxcIjA7MVxcXCIgZHVyPVxcXCIxc1xcXCIgYmVnaW49XFxcIjBzXFxcIiByZXBlYXRDb3VudD1cXFwiaW5kZWZpbml0ZVxcXCI+PC9hbmltYXRlPlxcbiAgPC9yZWN0PlxcbjwvZz48L3N2Zz5cIik7XG5cblxuXHRcdGFwcC51c2VyVHlwZSA9ICQoJ2lucHV0W25hbWU9dHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuXHRcdC8vIEdldCB0aGUgdmFsdWUgb2Ygd2hhdCB0aGUgdXNlciBlbnRlcmVkIGluIHRoZSBzZWFyY2ggZmllbGRcblx0XHRjb25zdCB1c2VySW5wdXQgPSAkKCcjbWVkaWFfX3NlYXJjaCcpLnZhbCgpO1xuXHRcdC8vIFByb21pc2UgZm9yIEFQSSMxXG5cdFx0YXBwLmdldE1lZGlhID1cblx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdHVybDogJ2h0dHBzOi8vdGFzdGVkaXZlLmNvbS9hcGkvc2ltaWxhcicsXG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdGRhdGFUeXBlOiAnanNvbnAnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0azogJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCcsXG5cdFx0XHRcdFx0cTogYCR7dXNlcklucHV0fWAsXG5cdFx0XHRcdFx0dHlwZTogYCR7YXBwLnVzZXJUeXBlfWAsXG5cdFx0XHRcdFx0aW5mbzogMSxcblx0XHRcdFx0XHRsaW1pdDogMTBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHQvLyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBwYXNzIG1vdmllIHRpdGxlcyBmcm9tIFByb21pc2UjMSBpbnRvIFByb21pc2UgIzJcblx0XHRhcHAuZ2V0SW1kYlJhdGluZyA9IChtb3ZpZVRpdGxlKSA9PiB7XG5cdFx0XHQvLyBSZXR1cm4gUHJvbWlzZSMyIHdoaWNoIGluY2x1ZGVzIHRoZSBtb3ZpZSB0aXRsZSBmcm9tIFByb21pc2UjMVxuXHRcdFx0cmV0dXJuICQuYWpheCh7XG5cdFx0XHRcdHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHRkYXRhOiB7XG5cdFx0XHRcdFx0YXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdFx0XHRcdHQ6IG1vdmllVGl0bGVcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHQvLyBHZXQgcmVzdWx0cyBmb3IgUHJvbWlzZSMxXG5cdFx0JC53aGVuKGFwcC5nZXRNZWRpYSkudGhlbigobWVkaWFJbmZvKSA9PiB7XG5cdFx0XHRjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdFx0XHRjb25zb2xlLmxvZyhtZWRpYUluZm9BcnJheSk7XG5cblx0XHRcdGFwcC5ub1Jlc3VsdHMgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFJbmZvQXJyYXkpO1xuXHRcdFx0aWYgKGFwcC5ub1Jlc3VsdHMgPT09IHRydWUpIHtcblx0XHRcdFx0JCgnI2Vycm9yJykuZW1wdHkoKTtcblx0XHRcdFx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcigpO1xuXG5cdFx0XHRcdCQoJy5sb2FkZXInKS5yZW1vdmUoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIERpc3BsYXkgbWVkaWEgcmVzdWx0cyBjb250YWluZXIgd2l0aCB0aGUgcmlnaHQgbWFyZ2luc1xuXHRcdFx0XHQkKCdmb290ZXInKS5jc3MoJ21hcmdpbi10b3AnLCAnMHB4Jyk7XG5cdFx0XHRcdCQoJy5tZWRpYV9fcmVzdWx0cy1jb250YWluZXInKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdFx0XHRcdCQoXCJodG1sXCIpXG5cdFx0XHRcdFx0LnN0b3AoKVxuXHRcdFx0XHRcdC5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkKFwiLm1lZGlhX19yZXN1bHRzLWNvbnRhaW5lclwiKS5vZmZzZXQoKS50b3AgfSwgMTUwMCwgXCJzd2luZ1wiKTtcblx0XHRcdFx0JCgnLmxvYWRlcicpLnJlbW92ZSgpO1xuXHRcdFx0fTtcblx0XHRcdC8vIElmIHRoZSBtZWRpYSB0eXBlIGlzIG1vdmllcyBvciBzaG93cywgZ2V0IHJlc3VsdHMgYXJyYXkgZnJvbSBQcm9taXNlICMxIGFuZCBtYXAgZWFjaCBtb3ZpZSB0aXRsZSByZXN1bHQgdG8gYSBwcm9taXNlIGZvciBQcm9taXNlICMyLiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHByb21pc2VzIGZvciBBUEkjMi5cblx0XHRcdGlmIChhcHAudXNlclR5cGUgPT09ICdtb3ZpZXMnIHx8IGFwcC51c2VyVHlwZSA9PT0gJ3Nob3dzJykge1xuXHRcdFx0XHRjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBhcHAuZ2V0SW1kYlJhdGluZyh0aXRsZS5OYW1lKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdFx0XHQvLyBSZXR1cm4gYSBzaW5nbGUgYXJyYXkgZnJvbSB0aGUgYXJyYXkgb2YgcHJvbWlzZXMgYW5kIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2UuXG5cdFx0XHRcdFByb21pc2UuYWxsKGltZGJQcm9taXNlQXJyYXkpLnRoZW4oKGltZGJSZXN1bHRzKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdFx0XHRcdGFwcC5pbWRiUmVzdWx0c0FycmF5ID0gaW1kYlJlc3VsdHM7XG5cdFx0XHRcdFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0XHRcdH0pLmNhdGNoKChlcnJvcikgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vIEZvciBtZWRpYSB0eXBlcyB0aGF0IGFyZSBub3QgbW92aWVzIG9yIHNob3dzLCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHRcdH07XG5cdFx0fSkuZmFpbChmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHQvLyBTdHJldGNoIEdvYWw6IFB1dCBzb21ldGhpbmcgaGVyZVxuXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblxuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0XHRhcHAuZGlzcGxheU1lZGlhID0gKGFsbE1lZGlhQXJyYXkpID0+IHtcblx0XHRcdC8vIFRoaXMgbWV0aG9kIHJlbW92ZXMgY2hpbGQgbm9kZXMgZnJvbSB0aGUgbWVkaWEgcmVzdWx0cyBlbGVtZW50KHByZXZpb3VzIHNlYXJjaCByZXN1bHRzKSwgYnV0IG9ubHkgd2hlbiB0aGUgc2VhcmNoIHF1ZXJ5IGJyaW5ncyBuZXcgcmVzdWx0cy4gT3RoZXJ3aXNlIGl0IHdpbGwga2VlcCB0aGUgY3VycmVudCByZXN1bHRzIGFuZCBkaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UuXG5cdFx0XHRpZiAoYXBwLm5vUmVzdWx0cyA9PT0gZmFsc2UpIHtcblx0XHRcdFx0JCgnI2Vycm9yJykuZW1wdHkoKTtcblx0XHRcdFx0JCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpLmVtcHR5KCk7XG5cdFx0XHR9XG5cblx0XHRcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0XHRcdFx0Y29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGgyIGNsYXNzPVwibWVkaWFfX3R5cGVfX3RpdGxlXCI+JHtzaW5nbGVNZWRpYS5UeXBlfTogJHtzaW5nbGVNZWRpYS5OYW1lfTwvaDI+YCk7XG5cdFx0XHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyID0gJCgnPGgzPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24taGVhZGVyJykudGV4dCgnRGVzY3JpcHRpb24nKTtcblx0XHRcdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb24gPSAkKCc8cD4nKS5hZGRDbGFzcygnbWVkaWFfX2Rlc2NyaXB0aW9uJykudGV4dChzaW5nbGVNZWRpYS53VGVhc2VyKTtcblx0XHRcdFx0Y29uc3QgJG1lZGlhV2lraSA9ICQoJzxhPicpLmFkZENsYXNzKCdtZWRpYV9fd2lraScpLmF0dHIoJ2hyZWYnLCBzaW5nbGVNZWRpYS53VXJsKS50ZXh0KCdXaWtpcGVkaWEnKTtcblx0XHRcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHRcdFx0XHRcdGNsYXNzOiAnbWVkaWFfX3lvdXR1YmUnLFxuXHRcdFx0XHRcdHNyYzogc2luZ2xlTWVkaWEueVVybCxcblx0XHRcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHRcdFx0XHRcdGZyYW1lYm9yZGVyOiAwLFxuXHRcdFx0XHRcdGFsbG93ZnVsbHNjcmVlbjogdHJ1ZVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y29uc3QgJGFkZEJ1dHRvbiA9ICQoJzxpbnB1dD4nKS5hdHRyKHtcblx0XHRcdFx0XHR0eXBlOiAnYnV0dG9uJyxcblx0XHRcdFx0XHR2YWx1ZTogJ0FkZCB0byBGYXZvdXJpdGVzJyxcblx0XHRcdFx0XHRmb3JtOiAnYWRkLWJ1dHRvbi1mb3JtJyxcblx0XHRcdFx0XHRjbGFzczogJ2FkZC1idXR0b24nXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YXBwLmltZGJSZXN1bHRzQXJyYXkuZmluZCgoZWxlbWVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHNpbmdsZU1lZGlhLk5hbWUgPT09IGVsZW1lbnQuVGl0bGUpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoYCR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMGApO1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkaW1kYkxvZ29SYXRpbmcgPSAkKGA8ZGl2IGNsYXNzPVwiaW1kYi1jb250YWluZXJcIj48ZGl2IGNsYXNzPVwiaW1kYi1pbWFnZS1jb250YWluZXJcIj48aW1nIHNyYz1cImh0dHBzOi8vdXBsb2FkLndpa2ltZWRpYS5vcmcvd2lraXBlZGlhL2NvbW1vbnMvNi82OS9JTURCX0xvZ29fMjAxNi5zdmdcIiBhbHQ9XCJJTURCIExvZ29cIj48L2Rpdj48cCBjbGFzcz1cImltZGItcmF0aW5nXCI+JHtlbGVtZW50LmltZGJSYXRpbmd9LzEwPC9wPjwvZGl2PmApO1xuXHRcdFx0XHRcdFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0XHRcdFx0XHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb25lUmVzdWx0Q29udGFpbmVyID0gJCgnPGRpdj4nKS5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRpbWRiTG9nb1JhdGluZywgJGFkZEJ1dHRvbikuYWRkQ2xhc3MoJ3Jlc3VsdC1jb250YWluZXInKTtcblx0XHRcdFx0XHRcdFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQob25lUmVzdWx0Q29udGFpbmVyKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKS5hZGRDbGFzcygncmVzdWx0LWNvbnRhaW5lcicpO1xuXHRcdFx0XHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZChvbmVSZXN1bHRDb250YWluZXIpO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdFx0XHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGFkZEJ1dHRvbikuYWRkQ2xhc3MoJ3Jlc3VsdC1jb250YWluZXInKTtcblx0XHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZChvbmVSZXN1bHRDb250YWluZXIpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvbmVSZXN1bHRDb250YWluZXIgPSAkKCc8ZGl2PicpLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJGFkZEJ1dHRvbikuYWRkQ2xhc3MoJ3Jlc3VsdC1jb250YWluZXInKTtcblx0XHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZChvbmVSZXN1bHRDb250YWluZXIpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHR9O1xuXHR9KTtcblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIEZpcmViYXNlOiBNZWRpYSBGYXZvdXJpdGVzIExpc3Rcblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIEV2ZW50IGxpc3RlbmVyIGZvciBhZGRpbmcgbWVkaWEgdHlwZSBhbmQgdGl0bGUgdG8gdGhlIGZhdm91cml0ZXMgbGlzdFxuXHRtZWRpYUNvbnRhaW5lci5vbignY2xpY2snLCAnLmFkZC1idXR0b24nLCBmdW5jdGlvbiAoZSkge1xuXHRcdC8vIFRoaXMgdmFyaWFibGUgc3RvcmVzIHRoZSBlbGVtZW50KHMpIGluIHRoZSBmb3JtIEkgd2FudCB0byBnZXQgdmFsdWUocykgZnJvbS4gSW4gdGhpcyBjYXNlIGl0J3MgdGhlIDxwPiByZXByZXNlbnRpbmcgdGhlIG1lZGlhIHR5cGUgYW5kIG1lZGlhIHRpdGxlLlxuXHRcdGNvbnN0IHR5cGVBbmRUaXRsZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190eXBlX190aXRsZScpWzBdLmlubmVyVGV4dFxuXG5cdFx0Y29uc3QgbWVkaWFPYmplY3QgPSB7XG5cdFx0XHQvLyBSZW1lbWJlcjogVGhpcyBpcyB0aGUgc2FtZSBhcyB0eXBlQW5kVGl0bGU6IHR5cGVBbmRUaXRsZVxuXHRcdFx0dHlwZUFuZFRpdGxlXG5cdFx0fVxuXHRcdC8vIEFkZCB0aGUgaW5mb3JtYXRpb24gdG8gRmlyZWJhc2Vcblx0XHRhcHAubWVkaWFMaXN0LnB1c2gobWVkaWFPYmplY3QpO1xuXHR9KTtcblx0Ly8gR2V0IHRoZSB0eXBlIGFuZCB0aXRsZSBpbmZvcm1hdGlvbiBmcm9tIEZpcmViYXNlXG5cdGFwcC5tZWRpYUxpc3Qub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24gKG1lZGlhSW5mbykge1xuXHRcdGNvbnN0IGRhdGEgPSBtZWRpYUluZm8udmFsKCk7XG5cblx0XHRjb25zdCBtZWRpYUZCID0gZGF0YS50eXBlQW5kVGl0bGU7XG5cdFx0Y29uc3Qga2V5ID0gbWVkaWFJbmZvLmtleTtcblx0XHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRoYXQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG5cdFx0Y29uc3QgbGkgPSBgPGxpIGlkPVwia2V5LSR7a2V5fVwiIGNsYXNzPVwiZmF2b3VyaXRlcy1saXN0X19saXN0LWl0ZW1cIj5cbiAgICBcdFx0XHRcdFx0PHA+JHttZWRpYUZCfTwvcD5cbiAgICBcdFx0XHRcdFx0PGJ1dHRvbiBpZD1cIiR7a2V5fVwiIGNsYXNzPVwiZGVsZXRlIG5vLXByaW50XCI+PGkgY2xhc3M9XCJmYXMgZmEtdGltZXMtY2lyY2xlXCI+PC9pPjwvYnV0dG9uPlxuICAgIFx0XHRcdFx0PC9saT5gXG5cdFx0ZmF2b3VyaXRlc0xpc3QuYXBwZW5kKGxpKTtcblx0XHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG5cdH0pO1xuXHQvLyBSZW1vdmUgbGlzdCBpdGVtIGZyb20gRmlyZWJhc2Ugd2hlbiB0aGUgZGVsZXRlIGljb24gaXMgY2xpY2tlZFxuXHRmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uICgpIHtcblx0XHRjb25zdCBpZCA9ICQodGhpcykuYXR0cignaWQnKTtcblxuXHRcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcblx0fSk7XG5cblx0Ly8gUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIENsZWFyIGJ1dHRvbiBpcyBjbGlja2VkXG5cdCQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3RgKS5zZXQobnVsbCk7XG5cdH0pO1xuXHQvLyBSZW1vdmUgbGlzdCBpdGVtIGZyb20gdGhlIGZyb250IGVuZCBhcHBlbmRcblx0YXBwLm1lZGlhTGlzdC5vbignY2hpbGRfcmVtb3ZlZCcsIGZ1bmN0aW9uIChsaXN0SXRlbXMpIHtcblxuXHRcdGZhdm91cml0ZXNMaXN0LmZpbmQoYCNrZXktJHtsaXN0SXRlbXMua2V5fWApLnJlbW92ZSgpO1xuXHR9KTtcblx0Ly8gTWF4aW1pemUgYW5kIE1pbmltaXplIGJ1dHRvbnMgZm9yIHRoZSBGYXZvdXJpdGVzIExpc3Rcblx0JCgnLmZhdm91cml0ZXMtbWF4aW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZURvd24oMjAwKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdH0pO1xuXG5cdCQoJy5mYXZvdXJpdGVzLW1pbmltaXplJykuY2xpY2soZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5mYXZvdXJpdGVzLWxpc3Qtd2luZG93Jykuc2xpZGVVcCgyMDApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBMb2dvIEFuaW1hdGlvblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0bGV0IGxvZ29BbmltYXRlO1xuXG5cdGNvbnN0IGdldFJhbmRvbU51bWJlciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG5cblx0YXBwLmdldFJhbmRvbUNvbG91ciA9ICgpID0+IHtcblx0XHRjb25zdCByZWQgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBibHVlID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgZ3JlZW4gPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCByZ2IgPSBgcmdiKCR7cmVkfSwgJHtncmVlbn0sICR7Ymx1ZX0pYFxuXHRcdHJldHVybiByZ2I7XG5cdH07XG5cblx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuXG5cdGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB0b3BTID0gKCkgPT4ge1xuXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDc7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5saW5lV2lkdGggPSA1O1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Ly8gMVNUIFBJRUNFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0Ly8gMk5EIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHQvLyAzUkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5maWxsKCk7XG5cdH07XG5cblx0dG9wUygpO1xuXG5cdGxldCBvbmVMb2dvSW50ZXJ2YWwgPSAoKSA9PiB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gNTA7IGkgPSBpICsgMSkge1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gMVNUIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTAwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTEwICsgaSksICgxMTAgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTEwICsgaSksICgxMTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTIwICsgaSksICg5MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNDAgLSBpKSwgKDEyNSArIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRvcFMoKTtcblx0XHRcdH0sIChpKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIDFTVCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDUwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTYwIC0gaSksICg2MCArIGkpKTtcblx0XHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNjAgLSBpKSwgKDE2MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNzAgLSBpKSwgKDE0MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg1MCArIGkpLCAoMjEwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDkwICsgaSksICgxNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0fSwgKDUwICsgaSkpO1xuXHRcdH07XG5cdH07XG5cblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uICgpIHtcblx0XHRsb2dvQW5pbWF0ZSA9IHNldEludGVydmFsKG9uZUxvZ29JbnRlcnZhbCwgMTAwKTtcblx0fSk7XG5cblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3V0JywgZnVuY3Rpb24gKCkge1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChsb2dvQW5pbWF0ZSk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdGN0eC5saW5lV2lkdGggPSA3O1xuXHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuXHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRjdHgubGluZVdpZHRoID0gNTtcblx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0Ly8gMVNUIFBJRUNFXG5cdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0Y3R4Lm1vdmVUbygxMDAsIDEwMCk7XG5cdFx0XHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0XHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdFx0XHQvLyAyTkQgUElFQ0Vcblx0XHRcdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0XHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0XHRcdGN0eC5saW5lVG8oMTUwLCAxMzUpO1xuXHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0XHRcdGN0eC5saW5lVG8oMTAwLCAxNjApO1xuXHRcdFx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdH07XG5cdFx0XHR0b3BTKCk7XG5cdFx0fSwgMTAwKVxuXG5cblx0fSk7XG5cblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIFJlc3BvbnNpdmUgRGVzaWduXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQkKCcubWVkaWFfX3R5cGUtbGFiZWwnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLm1lZGlhX19mb3JtX190eXBlJykuYWRkQ2xhc3MoJ2hpZGUnKTtcblx0XHRhcHAudXNlclR5cGUgPSAkKHRoaXMpLnRleHQoKTtcblx0fSk7XG5cblx0JCgnI2FsbCcpLmNsaWNrKGZ1bmN0aW9uICgpIHtcblx0XHQkKCcubWVkaWFfX2Zvcm1fX3R5cGUnKS5hZGRDbGFzcygnaGlkZScpO1xuXHRcdGFwcC51c2VyVHlwZSA9IG51bGw7XG5cdH0pO1xuXG5cdCQoJy5idXJnZXItYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5tZWRpYV9fZm9ybV9fdHlwZScpLnJlbW92ZUNsYXNzKCdoaWRlJyk7XG5cdH0pO1xuXG59XG4vLyBUaGlzIHJ1bnMgdGhlIGFwcFxuJChmdW5jdGlvbiAoKSB7XG5cdGFwcC5jb25maWcoKTtcblx0YXBwLmluaXQoKTtcbn0pOyJdfQ==
