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
				// q: 'superman',
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
					// console.log(app.imdbResultsArray);
					app.displayMedia(mediaInfoArray);
				});
				// For media types that are not movies or shows, display the results on the page
			} else {
				app.displayMedia(mediaInfoArray);
			};
			// } else if (app.userType === 'music' || app.userType === 'books' || app.userType === 'authors' || app.userType === 'games'){
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
		};
		console.log(mediaObject);
		// Add the information to Firebase
		app.mediaList.push(mediaObject);
	});
	// console.log(app.mediaList);
	// Get the type and title information from Firebase
	app.mediaList.on('child_added', function (mediaInfo) {
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
		console.log(favouritesList[0]);
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

	// $(function(){
	// $('#video').css({ width: $(window).innerWidth() + 'px', height: $(window).innerHeight() + 'px' });

	// $(window).resize(function(){
	// $('#video').css({ width: $(window).innerWidth() + 'px', height: $(window).innerHeight() + 'px' });
	//   });
	// });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1Qyx5SEFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixFQUFsQixDQUFxQixRQUFyQixFQUErQixVQUFTLEtBQVQsRUFBZ0I7QUFDOUM7QUFDQSxRQUFNLGNBQU47O0FBRUEsTUFBSSxRQUFKLEdBQWUsRUFBRSwwQkFBRixFQUE4QixHQUE5QixFQUFmO0FBQ0E7QUFDQSxNQUFNLFlBQVksRUFBRSxnQkFBRixFQUFvQixHQUFwQixFQUFsQjtBQUNBO0FBQ0EsTUFBSSxRQUFKLEdBQ0UsRUFBRSxJQUFGLENBQU87QUFDTCxRQUFLLG1DQURBO0FBRUwsV0FBUSxLQUZIO0FBR0wsYUFBVSxPQUhMO0FBSUwsU0FBTTtBQUNKLE9BQUcsMEJBREM7QUFFSixZQUFNLFNBRkY7QUFHSjtBQUNBLGVBQVMsSUFBSSxRQUpUO0FBS0osVUFBTSxDQUxGO0FBTUosV0FBTztBQU5IO0FBSkQsR0FBUCxDQURGOztBQWVBO0FBQ0EsTUFBSSxhQUFKLEdBQW9CLFVBQUMsVUFBRCxFQUFnQjtBQUNuQztBQUNHLFVBQU8sRUFBRSxJQUFGLENBQU87QUFDTCxTQUFLLHdCQURBO0FBRUwsWUFBUSxLQUZIO0FBR0wsVUFBTTtBQUNKLGFBQVEsVUFESjtBQUVKLFFBQUc7QUFGQztBQUhELElBQVAsQ0FBUDtBQVFILEdBVkQ7QUFXQTtBQUNHLElBQUUsSUFBRixDQUFPLElBQUksUUFBWCxFQUFxQixJQUFyQixDQUEwQixVQUFDLFNBQUQsRUFBZTtBQUN2QyxPQUFNLGlCQUFpQixVQUFVLE9BQVYsQ0FBa0IsT0FBekM7QUFDQSxXQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVBLE9BQUksU0FBSixHQUFnQixFQUFFLGFBQUYsQ0FBZ0IsY0FBaEIsQ0FBaEI7QUFDQSxPQUFJLElBQUksU0FBSixLQUFrQixJQUF0QixFQUE0QjtBQUMzQixNQUFFLFFBQUYsRUFBWSxLQUFaO0FBQ0EsUUFBSSxxQkFBSjtBQUNBLElBSEQsTUFHTztBQUNOO0FBQ0EsTUFBRSxRQUFGLEVBQVksR0FBWixDQUFnQixZQUFoQixFQUE4QixLQUE5QjtBQUNBLE1BQUUsMkJBQUYsRUFBK0IsR0FBL0IsQ0FBbUMsZUFBbkMsRUFBb0QsTUFBcEQsRUFBNEQsV0FBNUQsQ0FBd0UsUUFBeEU7QUFDQTtBQUNIO0FBQ0UsT0FBSSxJQUFJLFFBQUosS0FBaUIsUUFBakIsSUFBNkIsSUFBSSxRQUFKLEtBQWlCLE9BQWxELEVBQTJEO0FBQzFELFFBQU0sbUJBQW1CLGVBQWUsR0FBZixDQUFtQixVQUFDLEtBQUQsRUFBVztBQUNyRCxZQUFPLElBQUksYUFBSixDQUFrQixNQUFNLElBQXhCLENBQVA7QUFDRCxLQUZ3QixDQUF6QjtBQUdBLFlBQVEsR0FBUixDQUFZLGdCQUFaO0FBQ0E7QUFDQSxZQUFRLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixJQUE5QixDQUFtQyxVQUFDLFdBQUQsRUFBaUI7QUFDbEQsYUFBUSxHQUFSLENBQVksV0FBWjtBQUNBLFNBQUksZ0JBQUosR0FBdUIsV0FBdkI7QUFDQTtBQUNBLFNBQUksWUFBSixDQUFpQixjQUFqQjtBQUNELEtBTEQ7QUFNRjtBQUNDLElBYkEsTUFhTTtBQUNQLFFBQUksWUFBSixDQUFpQixjQUFqQjtBQUNDO0FBQ0g7QUFDQTtBQUNBO0FBQ0QsR0FqQ0UsRUFpQ0EsSUFqQ0EsQ0FpQ0ssVUFBUyxHQUFULEVBQWM7QUFDcEIsV0FBUSxHQUFSLENBQVksR0FBWjtBQUNELEdBbkNFO0FBb0NIO0FBQ0csTUFBSSxZQUFKLEdBQW1CLFVBQUMsYUFBRCxFQUFtQjtBQUNyQztBQUNBLE9BQUksSUFBSSxTQUFKLEtBQWtCLEtBQXRCLEVBQTZCO0FBQzVCLE1BQUUsUUFBRixFQUFZLEtBQVo7QUFDQSxNQUFFLDJCQUFGLEVBQStCLEtBQS9CO0FBQ0E7O0FBRUQsaUJBQWMsT0FBZCxDQUFzQixVQUFDLFdBQUQsRUFBaUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTSxrQkFBa0Isd0NBQW9DLFlBQVksSUFBaEQsVUFBeUQsWUFBWSxJQUFyRSxXQUF4QjtBQUNBLFFBQU0sMEJBQTBCLEVBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsMkJBQW5CLEVBQWdELElBQWhELENBQXFELGFBQXJELENBQWhDO0FBQ0EsUUFBTSxvQkFBb0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixvQkFBbEIsRUFBd0MsSUFBeEMsQ0FBNkMsWUFBWSxPQUF6RCxDQUExQjtBQUNBLFFBQU0sYUFBYSxFQUFFLEtBQUYsRUFBUyxRQUFULENBQWtCLGFBQWxCLEVBQWlDLElBQWpDLENBQXNDLE1BQXRDLEVBQThDLFlBQVksSUFBMUQsRUFBZ0UsSUFBaEUsQ0FBcUUsV0FBckUsQ0FBbkI7QUFDQSxRQUFNLGdCQUFnQixFQUFFLFVBQUYsRUFBYztBQUNuQyxZQUFPLGdCQUQ0QjtBQUVuQyxVQUFLLFlBQVksSUFGa0I7QUFHbkMsU0FBSSxZQUFZLEdBSG1CO0FBSW5DLGtCQUFhLENBSnNCO0FBS25DLHNCQUFpQjtBQUNqQjtBQUNBO0FBUG1DLEtBQWQsQ0FBdEI7O0FBVUEsUUFBTSxhQUFhLEVBQUUsU0FBRixFQUFhLElBQWIsQ0FBa0I7QUFDcEMsV0FBTSxRQUQ4QjtBQUVwQyxZQUFPLG1CQUY2QjtBQUdwQyxXQUFNLGlCQUg4QjtBQUlwQyxZQUFPO0FBSjZCLEtBQWxCLENBQW5COztBQU9BO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSxRQUFJLElBQUksZ0JBQUosS0FBeUIsU0FBN0IsRUFBd0M7QUFDdkMsU0FBSSxnQkFBSixDQUFxQixJQUFyQixDQUEwQixVQUFDLE9BQUQsRUFBYTtBQUN0QyxVQUFJLFlBQVksSUFBWixLQUFxQixRQUFRLEtBQWpDLEVBQXdDO0FBQ3ZDLFdBQU0sYUFBYSxFQUFFLEtBQUYsRUFBUyxRQUFULENBQWtCLGFBQWxCLEVBQWlDLElBQWpDLENBQXlDLFFBQVEsVUFBakQsU0FBbkI7QUFDQTtBQUNBLFdBQU0sa0JBQWtCLDhNQUFrTSxRQUFRLFVBQTFNLG1CQUF4QjtBQUNBO0FBQ0EsV0FBSSxZQUFZLElBQVosS0FBcUIsSUFBekIsRUFBK0I7QUFDOUIsdUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLGVBQS9GLEVBQWdILFVBQWhIO0FBQ0EsUUFGRCxNQUVPO0FBQ1AsdUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLGVBQS9GLEVBQWdILGFBQWhILEVBQStILFVBQS9IO0FBQ0M7QUFDRDtBQUNELE1BWkQ7QUFhQTtBQUNBLEtBZkQsTUFlTztBQUNOO0FBQ0EsU0FBSSxZQUFZLElBQVosS0FBcUIsSUFBekIsRUFBK0I7QUFDOUIscUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLFVBQS9GO0FBQ0EsTUFGRCxNQUVPO0FBQ1AscUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLGFBQS9GLEVBQThHLFVBQTlHO0FBQ0M7QUFDRDtBQUNELElBOUREO0FBK0RBLEdBdEVEO0FBd0VILEVBakpEO0FBa0pEO0FBQ0E7QUFDQTtBQUNDO0FBQ0csZ0JBQWUsRUFBZixDQUFrQixPQUFsQixFQUEyQixhQUEzQixFQUEwQyxVQUFTLENBQVQsRUFBWTtBQUNuRDtBQUNDO0FBQ0E7QUFDQSxNQUFNLGVBQWUsRUFBRSxJQUFGLEVBQVEsT0FBUixDQUFnQixxQkFBaEIsRUFBdUMsQ0FBdkMsRUFBMEMsU0FBL0Q7O0FBRUEsTUFBTSxjQUFjO0FBQ25CO0FBQ0E7QUFDQTtBQUhtQixHQUFwQjtBQUtBLFVBQVEsR0FBUixDQUFZLFdBQVo7QUFDQTtBQUNBLE1BQUksU0FBSixDQUFjLElBQWQsQ0FBbUIsV0FBbkI7QUFDSCxFQWREO0FBZUE7QUFDQTtBQUNBLEtBQUksU0FBSixDQUFjLEVBQWQsQ0FBaUIsYUFBakIsRUFBK0IsVUFBUyxTQUFULEVBQW9CO0FBQ2xEO0FBQ0EsTUFBTSxPQUFPLFVBQVUsR0FBVixFQUFiO0FBQ0E7QUFDQTtBQUNBLE1BQU0sVUFBVSxLQUFLLFlBQXJCO0FBQ0EsTUFBTSxNQUFNLFVBQVUsR0FBdEI7QUFDQTtBQUNBLE1BQU0sdUJBQW9CLEdBQXBCLG1FQUNHLE9BREgseUNBRVksR0FGWixtR0FBTjtBQUlBLGlCQUFlLE1BQWYsQ0FBc0IsRUFBdEI7QUFDQSxpQkFBZSxDQUFmLEVBQWtCLFNBQWxCLEdBQThCLGVBQWUsQ0FBZixFQUFrQixZQUFoRDtBQUNBLFVBQVEsR0FBUixDQUFZLGVBQWUsQ0FBZixDQUFaO0FBQ0EsRUFmRDtBQWdCQTtBQUNBLGdCQUFlLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsU0FBM0IsRUFBc0MsWUFBVztBQUNoRCxNQUFNLEtBQUssRUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLElBQWIsQ0FBWDs7QUFFQSxNQUFJLFFBQUosQ0FBYSxHQUFiLGlCQUErQixFQUEvQixFQUFxQyxNQUFyQztBQUNBLEVBSkQ7O0FBTUE7QUFDQSxHQUFFLGFBQUYsRUFBaUIsRUFBakIsQ0FBb0IsT0FBcEIsRUFBNkIsWUFBVztBQUN2QyxNQUFJLFFBQUosQ0FBYSxHQUFiLGVBQStCLEdBQS9CLENBQW1DLElBQW5DO0FBQ0EsRUFGRDtBQUdBO0FBQ0EsS0FBSSxTQUFKLENBQWMsRUFBZCxDQUFpQixlQUFqQixFQUFrQyxVQUFVLFNBQVYsRUFBcUI7QUFDMUQ7QUFDQSxpQkFBZSxJQUFmLFdBQTRCLFVBQVUsR0FBdEMsRUFBNkMsTUFBN0M7QUFDQyxFQUhFO0FBSUg7QUFDQSxHQUFFLHNCQUFGLEVBQTBCLEtBQTFCLENBQWdDLFlBQVk7QUFDM0MsSUFBRSx5QkFBRixFQUE2QixTQUE3QixDQUF1QyxHQUF2QyxFQUE0QyxXQUE1QyxDQUF3RCxRQUF4RDtBQUNBLEVBRkQ7O0FBSUEsR0FBRSxzQkFBRixFQUEwQixLQUExQixDQUFnQyxZQUFZO0FBQzNDLElBQUUseUJBQUYsRUFBNkIsT0FBN0IsQ0FBcUMsR0FBckMsRUFBMEMsUUFBMUMsQ0FBbUQsUUFBbkQ7QUFDQSxFQUZEOztBQUlBO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQyxLQUFJLG9CQUFKOztBQUVBLEtBQU0sa0JBQWtCLFNBQWxCLGVBQWtCO0FBQUEsU0FBTSxLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsS0FBZ0IsR0FBM0IsQ0FBTjtBQUFBLEVBQXhCOztBQUVBLEtBQUksZUFBSixHQUFzQixZQUFNO0FBQzNCLE1BQU0sTUFBTSxpQkFBWjtBQUNBLE1BQU0sT0FBTyxpQkFBYjtBQUNBLE1BQU0sUUFBUSxpQkFBZDtBQUNBLE1BQU0sZUFBYSxHQUFiLFVBQXFCLEtBQXJCLFVBQStCLElBQS9CLE1BQU47QUFDQSxTQUFPLEdBQVA7QUFDQSxFQU5EOztBQVFBLEtBQU0sU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBZjs7QUFFQSxLQUFNLE1BQU0sT0FBTyxVQUFQLENBQWtCLElBQWxCLENBQVo7O0FBRUEsS0FBSSxPQUFPLGdCQUFNO0FBQ2hCLE1BQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBcUIsT0FBTyxLQUE1QixFQUFtQyxPQUFPLE1BQTFDO0FBQ0E7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFNBQUosR0FBZ0IsQ0FBaEI7QUFDQSxNQUFJLFdBQUosR0FBa0IsT0FBbEI7QUFDQSxNQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEsR0FBYixFQUFrQixFQUFsQixFQUFzQixDQUF0QixFQUF5QixJQUFJLEtBQUssRUFBbEM7QUFDQSxNQUFJLE1BQUo7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFNBQUosR0FBZ0IsQ0FBaEI7QUFDQSxNQUFJLFdBQUosR0FBa0IsU0FBbEI7QUFDQSxNQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEsR0FBYixFQUFrQixFQUFsQixFQUFzQixDQUF0QixFQUF5QixJQUFJLEtBQUssRUFBbEM7QUFDQSxNQUFJLE1BQUo7QUFDQSxNQUFJLFNBQUo7QUFDQTtBQUNBLE1BQUksU0FBSjtBQUNBLE1BQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxNQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEVBQWhCO0FBQ0EsTUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBO0FBQ0EsTUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLE1BQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsRUFBaEI7QUFDQSxNQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0E7QUFDQSxNQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsTUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLE1BQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxNQUFJLFNBQUosR0FBZ0IsU0FBaEI7QUFDQSxNQUFJLElBQUo7QUFDQSxFQTlCRDs7QUFnQ0E7O0FBRUEsS0FBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBTTtBQUFBLDZCQUNsQixDQURrQjtBQUUxQixjQUFXLFlBQVc7QUFDckIsV0FBTyxnQkFBTTtBQUNaLFNBQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBcUIsT0FBTyxLQUE1QixFQUFtQyxPQUFPLE1BQTFDO0FBQ0E7QUFDQSxTQUFJLFNBQUo7QUFDQSxTQUFJLFNBQUosR0FBZ0IsRUFBaEI7QUFDQSxTQUFJLFdBQUosR0FBa0IsSUFBSSxlQUFKLEVBQWxCO0FBQ0EsU0FBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUIsQ0FBdkIsRUFBMEIsSUFBSSxLQUFLLEVBQW5DO0FBQ0EsU0FBSSxNQUFKO0FBQ0EsU0FBSSxTQUFKO0FBQ0E7QUFDQSxTQUFJLFNBQUo7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLEtBQUssQ0FBNUI7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQTtBQUNBO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixNQUFNLENBQTdCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixNQUFNLENBQTdCO0FBQ0E7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLFNBQUosR0FBZ0IsSUFBSSxlQUFKLEVBQWhCO0FBQ0EsU0FBSSxJQUFKO0FBQ0EsS0F6QkQ7QUEwQkE7QUFDQSxJQTVCRCxFQTRCSSxDQTVCSjs7QUE4QkEsY0FBVyxZQUFXO0FBQ3JCLFdBQU8sZ0JBQU07QUFDWixTQUFJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQXFCLE9BQU8sS0FBNUIsRUFBbUMsT0FBTyxNQUExQztBQUNBO0FBQ0EsU0FBSSxTQUFKO0FBQ0EsU0FBSSxTQUFKLEdBQWdCLEVBQWhCO0FBQ0EsU0FBSSxXQUFKLEdBQWtCLElBQUksZUFBSixFQUFsQjtBQUNBLFNBQUksR0FBSixDQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWtCLEdBQWxCLEVBQXVCLENBQXZCLEVBQTBCLElBQUksS0FBSyxFQUFuQztBQUNBLFNBQUksTUFBSjtBQUNBLFNBQUksU0FBSjtBQUNBO0FBQ0EsU0FBSSxTQUFKO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0E7QUFDQTtBQUNBLFNBQUksTUFBSixDQUFZLE1BQU0sQ0FBbEIsRUFBdUIsTUFBTSxDQUE3QjtBQUNBLFNBQUksTUFBSixDQUFZLE1BQU0sQ0FBbEIsRUFBdUIsTUFBTSxDQUE3QjtBQUNBLFNBQUksTUFBSixDQUFZLE1BQU0sQ0FBbEIsRUFBdUIsTUFBTSxDQUE3QjtBQUNBO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixNQUFNLENBQTdCO0FBQ0EsU0FBSSxNQUFKLENBQVksS0FBSyxDQUFqQixFQUFzQixNQUFNLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksS0FBSyxDQUFqQixFQUFzQixNQUFNLENBQTVCO0FBQ0EsU0FBSSxTQUFKLEdBQWdCLElBQUksZUFBSixFQUFoQjtBQUNBLFNBQUksSUFBSjtBQUNBLEtBekJEOztBQTJCQTtBQUVBLElBOUJELEVBOEJJLEtBQUssQ0E5QlQ7QUFoQzBCOztBQUMzQixPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssRUFBckIsRUFBeUIsSUFBSSxJQUFJLENBQWpDLEVBQW9DO0FBQUEsU0FBM0IsQ0FBMkI7QUE4RG5DO0FBQ0QsRUFoRUQ7O0FBa0VBLFFBQU8sZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBcUMsWUFBVztBQUMvQyxnQkFBYyxZQUFZLGVBQVosRUFBNkIsR0FBN0IsQ0FBZDtBQUNBLEVBRkQ7O0FBSUEsUUFBTyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxZQUFXO0FBQzlDLE1BQUksR0FBSixDQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWtCLEVBQWxCLEVBQXNCLENBQXRCLEVBQXlCLElBQUksS0FBSyxFQUFsQztBQUNBLGdCQUFjLFdBQWQ7QUFDQSxhQUFXLFlBQVc7QUFDckI7QUFDQTtBQUNBLFVBQU8sZ0JBQU07QUFDYixRQUFJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQXFCLE9BQU8sS0FBNUIsRUFBbUMsT0FBTyxNQUExQztBQUNBO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLENBQWhCO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLE9BQWxCO0FBQ0EsUUFBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsRUFBbEIsRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxLQUFLLEVBQWxDO0FBQ0EsUUFBSSxNQUFKO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLENBQWhCO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLFNBQWxCO0FBQ0EsUUFBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsRUFBbEIsRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxLQUFLLEVBQWxDO0FBQ0EsUUFBSSxNQUFKO0FBQ0EsUUFBSSxTQUFKO0FBQ0E7QUFDQSxRQUFJLFNBQUo7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixFQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQTtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEVBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLFNBQWhCO0FBQ0EsUUFBSSxJQUFKO0FBQ0MsSUE5QkQ7QUErQkE7QUFDQSxHQW5DRCxFQW1DRyxHQW5DSDtBQXNDQSxFQXpDRDs7QUEyQ0Q7QUFDQTtBQUNBO0FBQ0MsR0FBRSxvQkFBRixFQUF3QixLQUF4QixDQUE4QixZQUFXO0FBQ3hDLElBQUUsb0JBQUYsRUFBd0IsUUFBeEIsQ0FBaUMsTUFBakM7QUFDQSxNQUFJLFFBQUosR0FBZSxFQUFFLElBQUYsRUFBUSxJQUFSLEVBQWY7QUFDQSxFQUhEOztBQUtBLEdBQUUsTUFBRixFQUFVLEtBQVYsQ0FBZ0IsWUFBVztBQUMxQixJQUFFLG9CQUFGLEVBQXdCLFFBQXhCLENBQWlDLE1BQWpDO0FBQ0EsTUFBSSxRQUFKLEdBQWUsSUFBZjtBQUNBLEVBSEQ7O0FBS0EsR0FBRSxnQkFBRixFQUFvQixLQUFwQixDQUEwQixZQUFXO0FBQ3BDLElBQUUsb0JBQUYsRUFBd0IsV0FBeEIsQ0FBb0MsTUFBcEM7QUFDQSxFQUZEO0FBSUEsQ0F2YUQ7QUF3YUE7QUFDQSxFQUFFLFlBQVc7QUFDWixLQUFJLE1BQUo7QUFDQSxLQUFJLElBQUo7QUFDQSxDQUhEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ3JlYXRlIHZhcmlhYmxlIGZvciBhcHAgb2JqZWN0XG5jb25zdCBhcHAgPSB7fTtcblxuYXBwLmNvbmZpZyA9ICgpID0+IHsgICBcbiAgICBjb25zdCBjb25maWcgPSB7XG5cdCAgICBhcGlLZXk6IFwiQUl6YVN5QWVfTHFZTFZtLW9Wc2s5R0RFa1o5X0YxcGhXaVNvc0xZXCIsXG5cdCAgICBhdXRoRG9tYWluOiBcImpzLXN1bW1lci1wcm9qZWN0My5maXJlYmFzZWFwcC5jb21cIixcblx0ICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vanMtc3VtbWVyLXByb2plY3QzLmZpcmViYXNlaW8uY29tXCIsXG5cdCAgICBwcm9qZWN0SWQ6IFwianMtc3VtbWVyLXByb2plY3QzXCIsXG5cdCAgICBzdG9yYWdlQnVja2V0OiBcIlwiLFxuXHQgICAgbWVzc2FnaW5nU2VuZGVySWQ6IFwiMTA0Nzc5MzAzNDE1NVwiXG5cdH07XG4gICAgLy9UaGlzIHdpbGwgaW5pdGlhbGl6ZSBmaXJlYmFzZSB3aXRoIG91ciBjb25maWcgb2JqZWN0XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xuICAgIC8vIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBuZXcgY29ubmVjdGlvbiB0byB0aGUgZGF0YWJhc2VcbiAgICBhcHAuZGF0YWJhc2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpO1xuICAgIC8vIFRoaXMgY3JlYXRlcyBhIHJlZmVyZW5jZSB0byBhIGxvY2F0aW9uIGluIHRoZSBkYXRhYmFzZS4gSSBvbmx5IG5lZWQgb25lIGZvciB0aGlzIHByb2plY3QgdG8gc3RvcmUgdGhlIG1lZGlhIGxpc3RcbiAgICBhcHAubWVkaWFMaXN0ID0gYXBwLmRhdGFiYXNlLnJlZignL21lZGlhTGlzdCcpO1xufTtcblxuYXBwLmluaXQgPSAoKSA9PiB7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFNpbWlsYXIgYW5kIE9NREIgQVBJczogR2V0IFJlc3VsdHMgYW5kIGRpc3BsYXlcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBTaW1pbGFyIEFQSSBLZXlcblx0YXBwLnNpbWlsYXJLZXkgPSAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJztcblxuXHQvLyBPTURCIEFQSSBLZXlcblx0YXBwLm9tZGJLZXkgPSAnMTY2MWZhOWQnO1xuXHQvLyBGaXJlYmFzZSB2YXJpYWJsZXNcblx0Y29uc3QgbWVkaWFUeXBlRWxlbWVudCA9ICQoJy5tZWRpYV9fdHlwZScpXG5cdGNvbnN0IG1lZGlhVGl0bGVFbGVtZW50ID0gJCgnLm1lZGlhX190aXRsZScpO1xuXG5cdGNvbnN0IG1lZGlhQ29udGFpbmVyID0gJCgnLlRhc3RlRGl2ZV9fQVBJLWNvbnRhaW5lcicpO1xuXHRjb25zdCBmYXZvdXJpdGVzTGlzdCA9ICQoJy5mYXZvdXJpdGVzLWxpc3RfX2xpc3QnKTtcblx0Ly8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgZGlzcGxheXMgYW4gaW5saW5lIGVycm9yIHVuZGVyIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBubyByZXN1bHRzIGFyZSByZXR1cm5lZCBmcm9tIEFQSSMxIChlbXB0eSBhcnJheSlcblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3IgZnVuY3Rpb24gd29ya3MnKVxuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHlvdXIgcmVzdWx0cy4gVGhleSBtaWdodCBub3QgYmUgYXZhaWxhYmxlIG9yIHlvdXIgc3BlbGxpbmcgaXMgaW5jb3JyZWN0LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuXHRcdGNvbnNvbGUubG9nKCRub1Jlc3VsdHNFcnJvcik7XG5cdFx0JCgnI2Vycm9yJykuYXBwZW5kKCRub1Jlc3VsdHNFcnJvcik7XG5cdH07XG5cdC8vIGNvbnNvbGUubG9nKGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IpO1xuXG5cdC8vIEV2ZW50IExpc3RlbmVyIHRvIGNpbmx1ZGUgZXZlcnl0aGluZyB0aGF0IGhhcHBlbnMgb24gZm9ybSBzdWJtaXNzaW9uXG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIFByZXZlbnQgZGVmYXVsdCBmb3Igc3VibWl0IGlucHV0c1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XG5cdFx0YXBwLnVzZXJUeXBlID0gJCgnaW5wdXRbbmFtZT10eXBlXTpjaGVja2VkJykudmFsKCk7XG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiB3aGF0IHRoZSB1c2VyIGVudGVyZWQgaW4gdGhlIHNlYXJjaCBmaWVsZFxuXHRcdGNvbnN0IHVzZXJJbnB1dCA9ICQoJyNtZWRpYV9fc2VhcmNoJykudmFsKCk7XG5cdFx0Ly8gUHJvbWlzZSBmb3IgQVBJIzFcblx0XHRhcHAuZ2V0TWVkaWEgPVxuXHRcdCAgJC5hamF4KHtcblx0XHQgICAgdXJsOiAnaHR0cHM6Ly90YXN0ZWRpdmUuY29tL2FwaS9zaW1pbGFyJyxcblx0XHQgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgZGF0YVR5cGU6ICdqc29ucCcsXG5cdFx0ICAgIGRhdGE6IHtcblx0XHQgICAgICBrOiAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJyxcblx0XHQgICAgICBxOiBgJHt1c2VySW5wdXR9YCxcblx0XHQgICAgICAvLyBxOiAnc3VwZXJtYW4nLFxuXHRcdCAgICAgIHR5cGU6IGAke2FwcC51c2VyVHlwZX1gLFxuXHRcdCAgICAgIGluZm86IDEsXG5cdFx0ICAgICAgbGltaXQ6IDEwXG5cdFx0ICAgIH1cblx0XHR9KTtcblxuXHRcdC8vIEEgZnVuY3Rpb24gdGhhdCB3aWxsIHBhc3MgbW92aWUgdGl0bGVzIGZyb20gUHJvbWlzZSMxIGludG8gUHJvbWlzZSAjMlxuXHRcdGFwcC5nZXRJbWRiUmF0aW5nID0gKG1vdmllVGl0bGUpID0+IHtcblx0XHRcdC8vIFJldHVybiBQcm9taXNlIzIgd2hpY2ggaW5jbHVkZXMgdGhlIG1vdmllIHRpdGxlIGZyb20gUHJvbWlzZSMxXG5cdFx0ICAgIHJldHVybiAkLmFqYXgoe1xuXHRcdCAgICAgICAgICAgICB1cmw6ICdodHRwOi8vd3d3Lm9tZGJhcGkuY29tJyxcblx0XHQgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcblx0XHQgICAgICAgICAgICAgZGF0YToge1xuXHRcdCAgICAgICAgICAgICAgIGFwaWtleTogJzE2NjFmYTlkJyxcblx0XHQgICAgICAgICAgICAgICB0OiBtb3ZpZVRpdGxlXG5cdFx0ICAgICAgICAgICAgIH1cblx0XHQgICAgfSk7XG5cdFx0fTtcblx0XHQvLyBHZXQgcmVzdWx0cyBmb3IgUHJvbWlzZSMxXG5cdCAgICAkLndoZW4oYXBwLmdldE1lZGlhKS50aGVuKChtZWRpYUluZm8pID0+IHtcblx0ICAgICAgY29uc3QgbWVkaWFJbmZvQXJyYXkgPSBtZWRpYUluZm8uU2ltaWxhci5SZXN1bHRzO1xuXHQgICAgICBjb25zb2xlLmxvZyhtZWRpYUluZm9BcnJheSk7XG5cblx0ICAgICAgYXBwLm5vUmVzdWx0cyA9ICQuaXNFbXB0eU9iamVjdChtZWRpYUluZm9BcnJheSk7XG5cdCAgICAgIGlmIChhcHAubm9SZXN1bHRzID09PSB0cnVlKSB7XG5cdCAgICAgIFx0JCgnI2Vycm9yJykuZW1wdHkoKTtcblx0ICAgICAgXHRhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKCk7XG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgIFx0Ly8gRGlzcGxheSBtZWRpYSByZXN1bHRzIGNvbnRhaW5lciB3aXRoIHRoZSByaWdodCBtYXJnaW5zXG5cdCAgICAgIFx0JCgnZm9vdGVyJykuY3NzKCdtYXJnaW4tdG9wJywgJzBweCcpO1xuXHQgICAgICBcdCQoJy5tZWRpYV9fcmVzdWx0cy1jb250YWluZXInKS5jc3MoJ21hcmdpbi1ib3R0b20nLCAnNTBweCcpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0ICAgICAgfTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1lZGlhIHR5cGUgaXMgbW92aWVzIG9yIHNob3dzLCBnZXQgcmVzdWx0cyBhcnJheSBmcm9tIFByb21pc2UgIzEgYW5kIG1hcCBlYWNoIG1vdmllIHRpdGxlIHJlc3VsdCB0byBhIHByb21pc2UgZm9yIFByb21pc2UgIzIuIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgcHJvbWlzZXMgZm9yIEFQSSMyLlxuXHQgICAgICBpZiAoYXBwLnVzZXJUeXBlID09PSAnbW92aWVzJyB8fCBhcHAudXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgICB9IGVsc2Uge1xuXHRcdCAgXHRcdGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICB9O1xuXHRcdCAgLy8gfSBlbHNlIGlmIChhcHAudXNlclR5cGUgPT09ICdtdXNpYycgfHwgYXBwLnVzZXJUeXBlID09PSAnYm9va3MnIHx8IGFwcC51c2VyVHlwZSA9PT0gJ2F1dGhvcnMnIHx8IGFwcC51c2VyVHlwZSA9PT0gJ2dhbWVzJyl7XG5cdFx0ICAvLyBcdGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgLy8gfTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKGVycikge1xuXHRcdCAgY29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblx0XHQvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gZGlzcGxheSB0aGUgQVBJIHByb21pc2UgcmVzdWx0cyBvbnRvIHRoZSBwYWdlXG5cdCAgICBhcHAuZGlzcGxheU1lZGlhID0gKGFsbE1lZGlhQXJyYXkpID0+IHtcblx0ICAgIFx0Ly8gVGhpcyBtZXRob2QgcmVtb3ZlcyBjaGlsZCBub2RlcyBmcm9tIHRoZSBtZWRpYSByZXN1bHRzIGVsZW1lbnQocHJldmlvdXMgc2VhcmNoIHJlc3VsdHMpLCBidXQgb25seSB3aGVuIHRoZSBzZWFyY2ggcXVlcnkgYnJpbmdzIG5ldyByZXN1bHRzLiBPdGhlcndpc2UgaXQgd2lsbCBrZWVwIHRoZSBjdXJyZW50IHJlc3VsdHMgYW5kIGRpc3BsYXkgYW4gZXJyb3IgbWVzc2FnZS5cblx0ICAgIFx0aWYgKGFwcC5ub1Jlc3VsdHMgPT09IGZhbHNlKSB7XG5cdCAgICBcdFx0JCgnI2Vycm9yJykuZW1wdHkoKTtcblx0ICAgIFx0XHQkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJykuZW1wdHkoKTtcblx0ICAgIFx0fTtcblxuXHQgICAgXHRhbGxNZWRpYUFycmF5LmZvckVhY2goKHNpbmdsZU1lZGlhKSA9PiB7XG5cdCAgICBcdFx0Ly8gRm9yIGVhY2ggcmVzdWx0IGluIHRoZSBhcnJheSByZXR1cm5lZCBmcm9tIEFQSSMxLCBjcmVhdGUgdmFyaWFibGVzIGZvciBhbGwgaHRtbCBlbGVtZW50cyBJJ2xsIGJlIGFwcGVuZGluZy5cblx0ICAgIFx0XHQvLyBLRUVQSU5HIFRZUEUgQU5EIFRJVExFIFNFUEFSQVRFXG5cdCAgICBcdFx0Ly8gY29uc3QgJG1lZGlhVHlwZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3R5cGUnKS50ZXh0KHNpbmdsZU1lZGlhLlR5cGUpO1xuXHQgICAgXHRcdC8vIGNvbnN0ICRtZWRpYVRpdGxlID0gJCgnPGgyPicpLmFkZENsYXNzKCdtZWRpYV9fdGl0bGUnKS50ZXh0KHNpbmdsZU1lZGlhLk5hbWUpO1xuXHQgICAgXHRcdC8vIENPTUJJTklORyBUWVBFIEFORCBUSVRMRVxuXHQgICAgXHRcdC8vIGNvbnN0ICRtZWRpYVR5cGVUaXRsZSA9ICQoYDxkaXYgY2xhc3M9XCJtZWRpYV9fdHlwZV9fdGl0bGUtY29udGFpbmVyXCI+PGgyIGNsYXNzPVwibWVkaWFfX3R5cGVcIj4ke3NpbmdsZU1lZGlhLlR5cGV9OjwvaDI+PGgyIGNsYXNzPVwibWVkaWFfX3RpdGxlXCI+JHtzaW5nbGVNZWRpYS5OYW1lfTwvaDI+PC9kaXY+YCk7XG5cdCAgICBcdFx0Ly8gQ09NQklOSU5HIFRZUEUgQU5EIFRJVExFIElOIE9ORSBIMlxuXHQgICAgXHRcdC8vIGFwcC5tZWRpYVR5cGUgPSBzaW5nbGVNZWRpYS5UeXBlO1xuXHQgICAgXHRcdC8vIGFwcC5tZWRpYVRpdGxlID0gc2luZ2xlTWVkaWEuTmFtZTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFUeXBlVGl0bGUgPSAkKGA8aDIgY2xhc3M9XCJtZWRpYV9fdHlwZV9fdGl0bGVcIj4ke3NpbmdsZU1lZGlhLlR5cGV9OiAke3NpbmdsZU1lZGlhLk5hbWV9PC9oMj5gKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciA9ICQoJzxoMz4nKS5hZGRDbGFzcygnbWVkaWFfX2Rlc2NyaXB0aW9uLWhlYWRlcicpLnRleHQoJ0Rlc2NyaXB0aW9uJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb24gPSAkKCc8cD4nKS5hZGRDbGFzcygnbWVkaWFfX2Rlc2NyaXB0aW9uJykudGV4dChzaW5nbGVNZWRpYS53VGVhc2VyKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFXaWtpID0gJCgnPGE+JykuYWRkQ2xhc3MoJ21lZGlhX193aWtpJykuYXR0cignaHJlZicsIHNpbmdsZU1lZGlhLndVcmwpLnRleHQoJ1dpa2lwZWRpYScpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVlvdVR1YmUgPSAkKCc8aWZyYW1lPicsIHtcblx0ICAgIFx0XHRcdGNsYXNzOiAnbWVkaWFfX3lvdXR1YmUnLFxuXHQgICAgXHRcdFx0c3JjOiBzaW5nbGVNZWRpYS55VXJsLFxuXHQgICAgXHRcdFx0aWQ6IHNpbmdsZU1lZGlhLnlJRCxcblx0ICAgIFx0XHRcdGZyYW1lYm9yZGVyOiAwLFxuXHQgICAgXHRcdFx0YWxsb3dmdWxsc2NyZWVuOiB0cnVlXG5cdCAgICBcdFx0XHQvLyBoZWlnaHQ6IDMxNVxuXHQgICAgXHRcdFx0Ly8gbWF4LXdpZHRoOiA1NjBcblx0ICAgIFx0XHR9KTtcdFxuXG5cdCAgICBcdFx0Y29uc3QgJGFkZEJ1dHRvbiA9ICQoJzxpbnB1dD4nKS5hdHRyKHtcblx0ICAgIFx0XHRcdHR5cGU6ICdidXR0b24nLFxuXHQgICAgXHRcdFx0dmFsdWU6ICdBZGQgdG8gRmF2b3VyaXRlcycsXG5cdCAgICBcdFx0XHRmb3JtOiAnYWRkLWJ1dHRvbi1mb3JtJyxcblx0ICAgIFx0XHRcdGNsYXNzOiAnYWRkLWJ1dHRvbidcblx0ICAgIFx0XHR9KTtcblxuXHQgICAgXHRcdC8vIGNvbnN0ICRhZGRCdXR0b24gPSAkKGA8Zm9ybT48aW5wdXQgdHlwZT1cImJ1dHRvblwiIHZhbHVlPVwiQWRkIHRvIEZhdm91cml0ZXNcIiBmb3JtPVwiYWRkLWJ1dHRvbi1mb3JtXCIgY2xhc3M9XCJhZGQtYnV0dG9uXCI+PC9pbnB1dD48L2Zvcm0+YCk7XG5cdCAgICBcdFx0Ly8gPz8/SVMgVEhFUkUgQSBXQVkgVE8gQVBQRU5EIEFOIElOUFVUIElOU0lERSBPRiBBIEZPUk0/Pz8gSUYgTk9UPCBKVVNUIERPIElOUFVUIEFORCBVU0UgJ29uQ0xpY2snIGV2ZW50IGxpc3RlbmVyIHRvIHN1Ym1pdCB0aGUgbWVkaWEgdHlwZWFuZCB0aXRsZSB0byBGaXJlYmFzZS5cblxuXHQgICAgXHRcdC8vIGNvbnN0ICRhZGRGb3JtID0gYDxmb3JtIGlkPVwiYWRkLWJ1dHRvbi1mb3JtXCI+JHskYWRkQnV0dG9ufTwvZm9ybT5gO1xuXHQgICAgXHRcdFxuXHQgICAgXHRcdC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblxuXHQgICAgXHRcdC8vIFRoaXMgbWF0Y2hlcyB0aGUgbW92aWUgb3Igc2hvdyB0aXRsZSBmcm9tIEFQSSMxIHdpdGggQVBJIzIuIEl0IHRoZW4gY3JlYXRlcyBhIHZhcmlhYmxlIGZvciB0aGUgSU1EQiBSYXRpbmcgcmV0dXJuZWQgZnJvbSBBUEkjMiBhbmQgYXBwZW5kcyBpdCB0byB0aGUgcGFnZS5cblx0ICAgIFx0XHRpZiAoYXBwLmltZGJSZXN1bHRzQXJyYXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdCAgICBcdFx0YXBwLmltZGJSZXN1bHRzQXJyYXkuZmluZCgoZWxlbWVudCkgPT4ge1xuXHRcdCAgICBcdFx0XHRpZiAoc2luZ2xlTWVkaWEuTmFtZSA9PT0gZWxlbWVudC5UaXRsZSkge1xuXHRcdCAgICBcdFx0XHRcdGNvbnN0ICRtZWRpYUltZGIgPSAkKCc8cD4nKS5hZGRDbGFzcygnaW1kYi1yYXRpbmcnKS50ZXh0KGAke2VsZW1lbnQuaW1kYlJhdGluZ30vMTBgKTtcblx0XHQgICAgXHRcdFx0XHQvLyBjb25zdCAkaW1kYkxvZ28gPSAkKCc8aW1nPicpLmFkZENsYXNzKCdpbWRiLWxvZ28nKS5hdHRyKCdzcmMnLCAnaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy82LzY5L0lNREJfTG9nb18yMDE2LnN2ZycpO1xuXHRcdCAgICBcdFx0XHRcdGNvbnN0ICRpbWRiTG9nb1JhdGluZyA9ICQoYDxkaXYgY2xhc3M9XCJpbWRiLWNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJpbWRiLWltYWdlLWNvbnRhaW5lclwiPjxpbWcgc3JjPVwiaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy82LzY5L0lNREJfTG9nb18yMDE2LnN2Z1wiIGFsdD1cIklNREIgTG9nb1wiPjwvZGl2PjxwIGNsYXNzPVwiaW1kYi1yYXRpbmdcIj4ke2VsZW1lbnQuaW1kYlJhdGluZ30vMTA8L3A+PC9kaXY+YCk7XG5cdFx0ICAgIFx0XHRcdFx0Ly8gVGhpcyBhY2NvdW50cyBmb3IgcmVzdWx0cyB0aGF0IGRvIG5vdCBoYXZlIFlvdVR1YmUgVVJMc1xuXHRcdCAgICBcdFx0XHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRpbWRiTG9nb1JhdGluZywgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHRcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRpbWRiTG9nb1JhdGluZywgJG1lZGlhWW91VHViZSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHRcdFx0fTtcblx0XHQgICAgXHRcdFx0fTtcblx0XHQgICAgXHRcdH0pO1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhcHBlbmRzIHRoZSByZXN1bHRzIGZyb20gQVBJIzEgZm9yIG5vbi1tb3ZpZS9zaG93IG1lZGlhIHR5cGVzLlxuXHRcdCAgICBcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRtZWRpYUNvbnRhaW5lci5hcHBlbmQoJG1lZGlhVHlwZVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbkhlYWRlciwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2ksICRhZGRCdXR0b24pO1xuXHRcdCAgICBcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHR9O1xuXHRcdCAgICBcdH07XG5cdCAgICBcdH0pO1xuXHQgICAgfTtcblx0ICAgIFxuXHR9KTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gRmlyZWJhc2U6IE1lZGlhIEZhdm91cml0ZXMgTGlzdFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIEV2ZW50IGxpc3RlbmVyIGZvciBhZGRpbmcgbWVkaWEgdHlwZSBhbmQgdGl0bGUgdG8gdGhlIGxpc3Qgc3VibWl0dGluZyB0aGUgZm9ybS9wcmludGluZyB0aGUgbGlzdFxuICAgIG1lZGlhQ29udGFpbmVyLm9uKCdjbGljaycsICcuYWRkLWJ1dHRvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAvLyBUaGlzIHZhcmlhYmxlIHN0b3JlcyB0aGUgZWxlbWVudChzKSBpbiB0aGUgZm9ybSBJIHdhbnQgdG8gZ2V0IHZhbHVlKHMpIGZyb20uIEluIHRoaXMgY2FzZSBpdCB0aGUgcCByZXByZXNlbnRpbmcgdGhlIG1lZGlhIHRpdGxlIGFuZCB0aGUgcCByZXByZXNlbnRpbmcgdGhlIG1lZGlhIHR5cGUuXG4gICAgICAgIC8vIGNvbnN0IHR5cGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdHlwZScpWzBdLmlubmVyVGV4dDtcbiAgICAgICAgLy8gY29uc3QgdGl0bGUgPSAkKHRoaXMpLnByZXZBbGwoJy5tZWRpYV9fdGl0bGUnKVswXS5pbm5lclRleHQ7XG4gICAgICAgIGNvbnN0IHR5cGVBbmRUaXRsZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190eXBlX190aXRsZScpWzBdLmlubmVyVGV4dFxuICAgICAgXG4gICAgICAgIGNvbnN0IG1lZGlhT2JqZWN0ID0ge1xuICAgICAgICBcdC8vIHR5cGUsXG4gICAgICAgIFx0Ly8gdGl0bGVcbiAgICAgICAgXHR0eXBlQW5kVGl0bGVcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhtZWRpYU9iamVjdCk7XG4gICAgICAgIC8vIEFkZCB0aGUgaW5mb3JtYXRpb24gdG8gRmlyZWJhc2VcbiAgICAgICAgYXBwLm1lZGlhTGlzdC5wdXNoKG1lZGlhT2JqZWN0KTtcbiAgICB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyhhcHAubWVkaWFMaXN0KTtcbiAgICAvLyBHZXQgdGhlIHR5cGUgYW5kIHRpdGxlIGluZm9ybWF0aW9uIGZyb20gRmlyZWJhc2VcbiAgICBhcHAubWVkaWFMaXN0Lm9uKCdjaGlsZF9hZGRlZCcsZnVuY3Rpb24obWVkaWFJbmZvKSB7XG4gICAgXHQvLyBjb25zb2xlLmxvZyhtZWRpYUluZm8pO1xuICAgIFx0Y29uc3QgZGF0YSA9IG1lZGlhSW5mby52YWwoKTtcbiAgICBcdC8vIGNvbnN0IG1lZGlhVHlwZUZCID0gZGF0YS50eXBlO1xuICAgIFx0Ly8gY29uc3QgbWVkaWFUaXRsZUZCID0gZGF0YS50aXRsZTtcbiAgICBcdGNvbnN0IG1lZGlhRkIgPSBkYXRhLnR5cGVBbmRUaXRsZTtcbiAgICBcdGNvbnN0IGtleSA9IG1lZGlhSW5mby5rZXk7XG4gICAgXHQvLyBDcmVhdGUgTGlzdCBJdGVtIHRhaHQgaW5jbHVkZXMgdGhlIHR5cGUgYW5kIHRpdGxlXG4gICAgXHRjb25zdCBsaSA9IGA8bGkgaWQ9XCJrZXktJHtrZXl9XCIgY2xhc3M9XCJmYXZvdXJpdGVzLWxpc3RfX2xpc3QtaXRlbVwiPlxuICAgIFx0XHRcdFx0XHQ8cD4ke21lZGlhRkJ9PC9wPlxuICAgIFx0XHRcdFx0XHQ8YnV0dG9uIGlkPVwiJHtrZXl9XCIgY2xhc3M9XCJkZWxldGUgbm8tcHJpbnRcIj48aSBjbGFzcz1cImZhcyBmYS10aW1lcy1jaXJjbGVcIj48L2k+PC9idXR0b24+XG4gICAgXHRcdFx0XHQ8L2xpPmBcbiAgICBcdGZhdm91cml0ZXNMaXN0LmFwcGVuZChsaSk7XG4gICAgXHRmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxUb3AgPSBmYXZvdXJpdGVzTGlzdFswXS5zY3JvbGxIZWlnaHQ7XG4gICAgXHRjb25zb2xlLmxvZyhmYXZvdXJpdGVzTGlzdFswXSk7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIGRlbGV0ZSBpY29uIGlzIGNsaWNrZWRcbiAgICBmYXZvdXJpdGVzTGlzdC5vbignY2xpY2snLCAnLmRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgIFx0Y29uc3QgaWQgPSAkKHRoaXMpLmF0dHIoJ2lkJyk7XG4gICAgXHRcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3QvJHtpZH1gKS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIC8vIFJlbW92ZSBhbGwgaXRlbXMgZnJvbSBGaXJlYmFzZSB3aGVuIHRoZSBDbGVhciBidXR0b24gaXMgY2xpY2tlZFxuICAgICQoJy5jbGVhci1saXN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgXHRhcHAuZGF0YWJhc2UucmVmKGAvbWVkaWFMaXN0YCkuc2V0KG51bGwpO1xuICAgIH0pO1xuICAgIC8vIFJlbW92ZSBsaXN0IGl0ZW0gZnJvbSB0aGUgZnJvbnQgZW5kIGFwcGVuZFxuICAgIGFwcC5tZWRpYUxpc3Qub24oJ2NoaWxkX3JlbW92ZWQnLCBmdW5jdGlvbiAobGlzdEl0ZW1zKSB7XG5cdC8vIGNvbnNvbGUubG9nKGZhdm91cml0ZXNMaXN0LmZpbmQobGlzdEl0ZW1zLmtleSkpO1xuXHRmYXZvdXJpdGVzTGlzdC5maW5kKGAja2V5LSR7bGlzdEl0ZW1zLmtleX1gKS5yZW1vdmUoKTtcblx0fSk7XHRcblx0Ly8gTWF4aW1pemUgYW5kIE1pbmltaXplIGJ1dHRvbnMgZm9yIHRoZSBGYXZvdXJpdGVzIExpc3Rcblx0JCgnLmZhdm91cml0ZXMtbWF4aW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZURvd24oMjAwKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG5cdH0pO1xuXG5cdCQoJy5mYXZvdXJpdGVzLW1pbmltaXplJykuY2xpY2soZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5mYXZvdXJpdGVzLWxpc3Qtd2luZG93Jykuc2xpZGVVcCgyMDApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG5cdFxuXHQvLyAkKGZ1bmN0aW9uKCl7XG4vLyAkKCcjdmlkZW8nKS5jc3MoeyB3aWR0aDogJCh3aW5kb3cpLmlubmVyV2lkdGgoKSArICdweCcsIGhlaWdodDogJCh3aW5kb3cpLmlubmVySGVpZ2h0KCkgKyAncHgnIH0pO1xuXG4vLyAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCl7XG4vLyAkKCcjdmlkZW8nKS5jc3MoeyB3aWR0aDogJCh3aW5kb3cpLmlubmVyV2lkdGgoKSArICdweCcsIGhlaWdodDogJCh3aW5kb3cpLmlubmVySGVpZ2h0KCkgKyAncHgnIH0pO1xuLy8gICB9KTtcbi8vIH0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMb2dvIEFuaW1hdGlvblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdGxldCBsb2dvQW5pbWF0ZTtcblxuXHRjb25zdCBnZXRSYW5kb21OdW1iZXIgPSAoKSA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpO1xuXG5cdGFwcC5nZXRSYW5kb21Db2xvdXIgPSAoKSA9PiB7XG5cdFx0Y29uc3QgcmVkID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgYmx1ZSA9IGdldFJhbmRvbU51bWJlcigpO1xuXHRcdGNvbnN0IGdyZWVuID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgcmdiID0gYHJnYigke3JlZH0sICR7Z3JlZW59LCAke2JsdWV9KWBcblx0XHRyZXR1cm4gcmdiO1xuXHR9O1xuXG5cdGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcblx0XG5cdGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5cdGxldCB0b3BTID0gKCkgPT4ge1xuXHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5saW5lV2lkdGggPSA3O1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubGluZVdpZHRoID0gNTtcblx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0Y3R4LmFyYygxMjUsIDExNywgNTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdC8vIFRPUCBQSUVDRVxuXHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRjdHgubW92ZVRvKDEwMCwgMTAwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgNzUpO1xuXHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdC8vIDJORCBQSUVDRVxuXHRcdGN0eC5tb3ZlVG8oMTEwLCAxMTApO1xuXHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0Y3R4LmxpbmVUbygxNTAsIDEzNSk7XG5cdFx0Ly8gM1JEIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0Y3R4LmxpbmVUbygxMDAsIDE2MCk7XG5cdFx0Y3R4LmxpbmVUbygxNDAsIDEyNSk7XG5cdFx0Y3R4LmZpbGxTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRjdHguZmlsbCgpO1xuXHR9O1xuXG5cdHRvcFMoKTtcblxuXHRsZXQgb25lTG9nb0ludGVydmFsID0gKCkgPT4ge1xuXHRcdGZvciAobGV0IGkgPSAxOyBpIDw9IDUwOyBpID0gaSArIDEpIHtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDEwMCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDc1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDExMCArIGkpLCAoMTEwIC0gaSkpO1xuXHRcdFx0XHRcdC8vIGN0eC5hcmMoKDIwMCArIGkpLCAoMjAwICsgaSksIDEwMCwgMSAqIE1hdGguUEksIDEuNyAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdC8vIDJORCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDExMCArIGkpLCAoMTEwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDEyMCArIGkpLCAoOTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTUwICsgaSksICgxMzUgKyBpKSk7XG5cdFx0XHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTUwIC0gaSksICgxMzUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTAwIC0gaSksICgxNjAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTQwIC0gaSksICgxMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR0b3BTKCk7XG5cdFx0XHR9LCAoaSkpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0b3BTID0gKCkgPT4ge1xuXHRcdFx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5saW5lV2lkdGggPSAxMDtcblx0XHRcdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmFyYygxMjUsIDExNywgMTEwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0XHRcdGN0eC5jbG9zZVBhdGgoKTtcblx0XHRcdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTUwIC0gaSksICg1MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDI1ICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE2MCAtIGkpLCAoNjAgKyBpKSk7XG5cdFx0XHRcdFx0Ly8gY3R4LmFyYygoMjkwIC0gaSksICgyOTAgLSBpKSwgMTAwLCAxICogTWF0aC5QSSwgMS43ICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Ly8gTUlERExFIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTYwIC0gaSksICgxNjAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTcwIC0gaSksICgxNDAgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMjAwIC0gaSksICgxODUgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gM1JEIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTAwICsgaSksICgxODUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoNTAgKyBpKSwgKDIxMCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg5MCArIGkpLCAoMTc1IC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5maWxsU3R5bGUgPSBhcHAuZ2V0UmFuZG9tQ29sb3VyKCk7XG5cdFx0XHRcdFx0Y3R4LmZpbGwoKTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHR0b3BTKCk7XG5cblx0XHRcdH0sICg1MCArIGkpKTtcblx0XHR9O1xuXHR9O1xuXHRcblx0Y2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuXHRcdGxvZ29BbmltYXRlID0gc2V0SW50ZXJ2YWwob25lTG9nb0ludGVydmFsLCAxMDApO1xuXHR9KTtcblxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA2MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGNsZWFySW50ZXJ2YWwobG9nb0FuaW1hdGUpO1xuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0Ly8gY3R4LmFyYygxMjUsIDExNywgNjAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0Ly8gT1VURVIgQ0lSQ0xFXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubGluZVdpZHRoID0gNztcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDU7XG5cdFx0XHRjdHguc3Ryb2tlU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubW92ZVRvKDEwMCwgMTAwKTtcblx0XHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0XHRjdHgubGluZVRvKDExMCwgMTEwKTtcblx0XHRcdC8vIDJORCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0XHRjdHgubGluZVRvKDEyMCwgOTApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNTAsIDEzNSk7XG5cdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdGN0eC5tb3ZlVG8oMTUwLCAxMzUpO1xuXHRcdFx0Y3R4LmxpbmVUbygxMDAsIDE2MCk7XG5cdFx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRcdGN0eC5maWxsU3R5bGUgPSAnI0ZGQzkwMCc7XG5cdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0fTtcblx0XHRcdHRvcFMoKTtcblx0XHR9LCAxMDApXG5cdFx0XG5cdFx0XG5cdH0pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFJlc3BvbnNpdmUgRGVzaWduXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0JCgnLm1lZGlhX190eXBlLWxhYmVsJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0JCgnLm1lZGlhX19mb3JtX190eXBlJykuYWRkQ2xhc3MoJ2hpZGUnKTtcblx0XHRhcHAudXNlclR5cGUgPSAkKHRoaXMpLnRleHQoKTtcblx0fSk7XG5cdFx0XG5cdCQoJyNhbGwnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHQkKCcubWVkaWFfX2Zvcm1fX3R5cGUnKS5hZGRDbGFzcygnaGlkZScpO1xuXHRcdGFwcC51c2VyVHlwZSA9IG51bGw7XG5cdH0pO1xuXG5cdCQoJy5idXJnZXItYnV0dG9uJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0JCgnLm1lZGlhX19mb3JtX190eXBlJykucmVtb3ZlQ2xhc3MoJ2hpZGUnKTtcblx0fSk7XG5cbn1cbi8vIFRoaXMgcnVucyB0aGUgYXBwXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuY29uZmlnKCk7XG5cdGFwcC5pbml0KCk7XG59KTsiXX0=
