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
};
// This runs the app
$(function () {
	app.config();
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxNQUFKLEdBQWEsWUFBTTtBQUNmLEtBQU0sU0FBUztBQUNkLFVBQVEseUNBRE07QUFFZCxjQUFZLG9DQUZFO0FBR2QsZUFBYSwyQ0FIQztBQUlkLGFBQVcsb0JBSkc7QUFLZCxpQkFBZSxFQUxEO0FBTWQscUJBQW1CO0FBTkwsRUFBZjtBQVFBO0FBQ0EsVUFBUyxhQUFULENBQXVCLE1BQXZCO0FBQ0E7QUFDQSxLQUFJLFFBQUosR0FBZSxTQUFTLFFBQVQsRUFBZjtBQUNBO0FBQ0EsS0FBSSxTQUFKLEdBQWdCLElBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsWUFBakIsQ0FBaEI7QUFDSCxDQWZEOztBQWlCQSxJQUFJLElBQUosR0FBVyxZQUFNO0FBQ2pCO0FBQ0E7QUFDQTtBQUNDO0FBQ0EsS0FBSSxVQUFKLEdBQWlCLDBCQUFqQjs7QUFFQTtBQUNBLEtBQUksT0FBSixHQUFjLFVBQWQ7QUFDQTtBQUNBLEtBQU0sbUJBQW1CLEVBQUUsY0FBRixDQUF6QjtBQUNBLEtBQU0sb0JBQW9CLEVBQUUsZUFBRixDQUExQjs7QUFFQSxLQUFNLGlCQUFpQixFQUFFLDJCQUFGLENBQXZCO0FBQ0EsS0FBTSxpQkFBaUIsRUFBRSx3QkFBRixDQUF2QjtBQUNBO0FBQ0EsS0FBSSxxQkFBSixHQUE0QixZQUFNO0FBQ2pDO0FBQ0EsTUFBTSxrQkFBa0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixjQUFsQixFQUFrQyxJQUFsQyxDQUF1Qyx5SEFBdkMsQ0FBeEI7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaO0FBQ0EsSUFBRSxRQUFGLEVBQVksTUFBWixDQUFtQixlQUFuQjtBQUNBLEVBTEQ7QUFNQTs7QUFFQTtBQUNBLEdBQUUsY0FBRixFQUFrQixFQUFsQixDQUFxQixRQUFyQixFQUErQixVQUFTLEtBQVQsRUFBZ0I7QUFDOUM7QUFDQSxRQUFNLGNBQU47O0FBRUEsTUFBSSxRQUFKLEdBQWUsRUFBRSwwQkFBRixFQUE4QixHQUE5QixFQUFmO0FBQ0E7QUFDQSxNQUFNLFlBQVksRUFBRSxnQkFBRixFQUFvQixHQUFwQixFQUFsQjtBQUNBO0FBQ0EsTUFBSSxRQUFKLEdBQ0UsRUFBRSxJQUFGLENBQU87QUFDTCxRQUFLLG1DQURBO0FBRUwsV0FBUSxLQUZIO0FBR0wsYUFBVSxPQUhMO0FBSUwsU0FBTTtBQUNKLE9BQUcsMEJBREM7QUFFSixZQUFNLFNBRkY7QUFHSjtBQUNBLGVBQVMsSUFBSSxRQUpUO0FBS0osVUFBTSxDQUxGO0FBTUosV0FBTztBQU5IO0FBSkQsR0FBUCxDQURGOztBQWVBO0FBQ0EsTUFBSSxhQUFKLEdBQW9CLFVBQUMsVUFBRCxFQUFnQjtBQUNuQztBQUNHLFVBQU8sRUFBRSxJQUFGLENBQU87QUFDTCxTQUFLLHdCQURBO0FBRUwsWUFBUSxLQUZIO0FBR0wsVUFBTTtBQUNKLGFBQVEsVUFESjtBQUVKLFFBQUc7QUFGQztBQUhELElBQVAsQ0FBUDtBQVFILEdBVkQ7QUFXQTtBQUNHLElBQUUsSUFBRixDQUFPLElBQUksUUFBWCxFQUFxQixJQUFyQixDQUEwQixVQUFDLFNBQUQsRUFBZTtBQUN2QyxPQUFNLGlCQUFpQixVQUFVLE9BQVYsQ0FBa0IsT0FBekM7QUFDQSxXQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVBLE9BQUksU0FBSixHQUFnQixFQUFFLGFBQUYsQ0FBZ0IsY0FBaEIsQ0FBaEI7QUFDQSxPQUFJLElBQUksU0FBSixLQUFrQixJQUF0QixFQUE0QjtBQUMzQixNQUFFLFFBQUYsRUFBWSxLQUFaO0FBQ0EsUUFBSSxxQkFBSjtBQUNBLElBSEQsTUFHTztBQUNOO0FBQ0EsTUFBRSxRQUFGLEVBQVksR0FBWixDQUFnQixZQUFoQixFQUE4QixLQUE5QjtBQUNBLE1BQUUsMkJBQUYsRUFBK0IsR0FBL0IsQ0FBbUMsZUFBbkMsRUFBb0QsTUFBcEQsRUFBNEQsV0FBNUQsQ0FBd0UsUUFBeEU7QUFDQTtBQUNIO0FBQ0UsT0FBSSxJQUFJLFFBQUosS0FBaUIsUUFBakIsSUFBNkIsSUFBSSxRQUFKLEtBQWlCLE9BQWxELEVBQTJEO0FBQzFELFFBQU0sbUJBQW1CLGVBQWUsR0FBZixDQUFtQixVQUFDLEtBQUQsRUFBVztBQUNyRCxZQUFPLElBQUksYUFBSixDQUFrQixNQUFNLElBQXhCLENBQVA7QUFDRCxLQUZ3QixDQUF6QjtBQUdBLFlBQVEsR0FBUixDQUFZLGdCQUFaO0FBQ0E7QUFDQSxZQUFRLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixJQUE5QixDQUFtQyxVQUFDLFdBQUQsRUFBaUI7QUFDbEQsYUFBUSxHQUFSLENBQVksV0FBWjtBQUNBLFNBQUksZ0JBQUosR0FBdUIsV0FBdkI7QUFDQTtBQUNBLFNBQUksWUFBSixDQUFpQixjQUFqQjtBQUNELEtBTEQ7QUFNRjtBQUNDLElBYkEsTUFhTTtBQUNQLFFBQUksWUFBSixDQUFpQixjQUFqQjtBQUNDO0FBQ0g7QUFDQTtBQUNBO0FBQ0QsR0FqQ0UsRUFpQ0EsSUFqQ0EsQ0FpQ0ssVUFBUyxHQUFULEVBQWM7QUFDcEIsV0FBUSxHQUFSLENBQVksR0FBWjtBQUNELEdBbkNFO0FBb0NIO0FBQ0csTUFBSSxZQUFKLEdBQW1CLFVBQUMsYUFBRCxFQUFtQjtBQUNyQztBQUNBLE9BQUksSUFBSSxTQUFKLEtBQWtCLEtBQXRCLEVBQTZCO0FBQzVCLE1BQUUsUUFBRixFQUFZLEtBQVo7QUFDQSxNQUFFLDJCQUFGLEVBQStCLEtBQS9CO0FBQ0E7O0FBRUQsaUJBQWMsT0FBZCxDQUFzQixVQUFDLFdBQUQsRUFBaUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTSxrQkFBa0Isd0NBQW9DLFlBQVksSUFBaEQsVUFBeUQsWUFBWSxJQUFyRSxXQUF4QjtBQUNBLFFBQU0sMEJBQTBCLEVBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsMkJBQW5CLEVBQWdELElBQWhELENBQXFELGFBQXJELENBQWhDO0FBQ0EsUUFBTSxvQkFBb0IsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixvQkFBbEIsRUFBd0MsSUFBeEMsQ0FBNkMsWUFBWSxPQUF6RCxDQUExQjtBQUNBLFFBQU0sYUFBYSxFQUFFLEtBQUYsRUFBUyxRQUFULENBQWtCLGFBQWxCLEVBQWlDLElBQWpDLENBQXNDLE1BQXRDLEVBQThDLFlBQVksSUFBMUQsRUFBZ0UsSUFBaEUsQ0FBcUUsV0FBckUsQ0FBbkI7QUFDQSxRQUFNLGdCQUFnQixFQUFFLFVBQUYsRUFBYztBQUNuQyxZQUFPLGdCQUQ0QjtBQUVuQyxVQUFLLFlBQVksSUFGa0I7QUFHbkMsU0FBSSxZQUFZLEdBSG1CO0FBSW5DLGtCQUFhLENBSnNCO0FBS25DLHNCQUFpQjtBQUNqQjtBQUNBO0FBUG1DLEtBQWQsQ0FBdEI7O0FBVUEsUUFBTSxhQUFhLEVBQUUsU0FBRixFQUFhLElBQWIsQ0FBa0I7QUFDcEMsV0FBTSxRQUQ4QjtBQUVwQyxZQUFPLG1CQUY2QjtBQUdwQyxXQUFNLGlCQUg4QjtBQUlwQyxZQUFPO0FBSjZCLEtBQWxCLENBQW5COztBQU9BO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQSxRQUFJLElBQUksZ0JBQUosS0FBeUIsU0FBN0IsRUFBd0M7QUFDdkMsU0FBSSxnQkFBSixDQUFxQixJQUFyQixDQUEwQixVQUFDLE9BQUQsRUFBYTtBQUN0QyxVQUFJLFlBQVksSUFBWixLQUFxQixRQUFRLEtBQWpDLEVBQXdDO0FBQ3ZDLFdBQU0sYUFBYSxFQUFFLEtBQUYsRUFBUyxRQUFULENBQWtCLGFBQWxCLEVBQWlDLElBQWpDLENBQXlDLFFBQVEsVUFBakQsU0FBbkI7QUFDQTtBQUNBLFdBQU0sa0JBQWtCLDhNQUFrTSxRQUFRLFVBQTFNLG1CQUF4QjtBQUNBO0FBQ0EsV0FBSSxZQUFZLElBQVosS0FBcUIsSUFBekIsRUFBK0I7QUFDOUIsdUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLGVBQS9GLEVBQWdILFVBQWhIO0FBQ0EsUUFGRCxNQUVPO0FBQ1AsdUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLGVBQS9GLEVBQWdILGFBQWhILEVBQStILFVBQS9IO0FBQ0M7QUFDRDtBQUNELE1BWkQ7QUFhQTtBQUNBLEtBZkQsTUFlTztBQUNOO0FBQ0EsU0FBSSxZQUFZLElBQVosS0FBcUIsSUFBekIsRUFBK0I7QUFDOUIscUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLFVBQS9GO0FBQ0EsTUFGRCxNQUVPO0FBQ1AscUJBQWUsTUFBZixDQUFzQixlQUF0QixFQUF1Qyx1QkFBdkMsRUFBZ0UsaUJBQWhFLEVBQW1GLFVBQW5GLEVBQStGLGFBQS9GLEVBQThHLFVBQTlHO0FBQ0M7QUFDRDtBQUNELElBOUREO0FBK0RBLEdBdEVEO0FBd0VILEVBakpEO0FBa0pEO0FBQ0E7QUFDQTtBQUNDO0FBQ0csZ0JBQWUsRUFBZixDQUFrQixPQUFsQixFQUEyQixhQUEzQixFQUEwQyxVQUFTLENBQVQsRUFBWTtBQUNuRDtBQUNDO0FBQ0E7QUFDQSxNQUFNLGVBQWUsRUFBRSxJQUFGLEVBQVEsT0FBUixDQUFnQixxQkFBaEIsRUFBdUMsQ0FBdkMsRUFBMEMsU0FBL0Q7O0FBRUEsTUFBTSxjQUFjO0FBQ25CO0FBQ0E7QUFDQTtBQUhtQixHQUFwQjtBQUtBLFVBQVEsR0FBUixDQUFZLFdBQVo7QUFDQTtBQUNBLE1BQUksU0FBSixDQUFjLElBQWQsQ0FBbUIsV0FBbkI7QUFDSCxFQWREO0FBZUE7QUFDQTtBQUNBLEtBQUksU0FBSixDQUFjLEVBQWQsQ0FBaUIsYUFBakIsRUFBK0IsVUFBUyxTQUFULEVBQW9CO0FBQ2xEO0FBQ0EsTUFBTSxPQUFPLFVBQVUsR0FBVixFQUFiO0FBQ0E7QUFDQTtBQUNBLE1BQU0sVUFBVSxLQUFLLFlBQXJCO0FBQ0EsTUFBTSxNQUFNLFVBQVUsR0FBdEI7QUFDQTtBQUNBLE1BQU0sdUJBQW9CLEdBQXBCLG1FQUNHLE9BREgseUNBRVksR0FGWixtR0FBTjtBQUlBLGlCQUFlLE1BQWYsQ0FBc0IsRUFBdEI7QUFDQSxpQkFBZSxDQUFmLEVBQWtCLFNBQWxCLEdBQThCLGVBQWUsQ0FBZixFQUFrQixZQUFoRDtBQUNBLFVBQVEsR0FBUixDQUFZLGVBQWUsQ0FBZixDQUFaO0FBQ0EsRUFmRDtBQWdCQTtBQUNBLGdCQUFlLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsU0FBM0IsRUFBc0MsWUFBVztBQUNoRCxNQUFNLEtBQUssRUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLElBQWIsQ0FBWDs7QUFFQSxNQUFJLFFBQUosQ0FBYSxHQUFiLGlCQUErQixFQUEvQixFQUFxQyxNQUFyQztBQUNBLEVBSkQ7O0FBTUE7QUFDQSxHQUFFLGFBQUYsRUFBaUIsRUFBakIsQ0FBb0IsT0FBcEIsRUFBNkIsWUFBVztBQUN2QyxNQUFJLFFBQUosQ0FBYSxHQUFiLGVBQStCLEdBQS9CLENBQW1DLElBQW5DO0FBQ0EsRUFGRDtBQUdBO0FBQ0EsS0FBSSxTQUFKLENBQWMsRUFBZCxDQUFpQixlQUFqQixFQUFrQyxVQUFVLFNBQVYsRUFBcUI7QUFDMUQ7QUFDQSxpQkFBZSxJQUFmLFdBQTRCLFVBQVUsR0FBdEMsRUFBNkMsTUFBN0M7QUFDQyxFQUhFO0FBSUg7QUFDQSxHQUFFLHNCQUFGLEVBQTBCLEtBQTFCLENBQWdDLFlBQVk7QUFDM0MsSUFBRSx5QkFBRixFQUE2QixTQUE3QixDQUF1QyxHQUF2QyxFQUE0QyxXQUE1QyxDQUF3RCxRQUF4RDtBQUNBLEVBRkQ7O0FBSUEsR0FBRSxzQkFBRixFQUEwQixLQUExQixDQUFnQyxZQUFZO0FBQzNDLElBQUUseUJBQUYsRUFBNkIsT0FBN0IsQ0FBcUMsR0FBckMsRUFBMEMsUUFBMUMsQ0FBbUQsUUFBbkQ7QUFDQSxFQUZEOztBQUlBO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQyxLQUFJLG9CQUFKOztBQUVBLEtBQU0sa0JBQWtCLFNBQWxCLGVBQWtCO0FBQUEsU0FBTSxLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsS0FBZ0IsR0FBM0IsQ0FBTjtBQUFBLEVBQXhCOztBQUVBLEtBQUksZUFBSixHQUFzQixZQUFNO0FBQzNCLE1BQU0sTUFBTSxpQkFBWjtBQUNBLE1BQU0sT0FBTyxpQkFBYjtBQUNBLE1BQU0sUUFBUSxpQkFBZDtBQUNBLE1BQU0sZUFBYSxHQUFiLFVBQXFCLEtBQXJCLFVBQStCLElBQS9CLE1BQU47QUFDQSxTQUFPLEdBQVA7QUFDQSxFQU5EOztBQVFBLEtBQU0sU0FBUyxTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBZjs7QUFFQSxLQUFNLE1BQU0sT0FBTyxVQUFQLENBQWtCLElBQWxCLENBQVo7O0FBRUEsS0FBSSxPQUFPLGdCQUFNO0FBQ2hCLE1BQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBcUIsT0FBTyxLQUE1QixFQUFtQyxPQUFPLE1BQTFDO0FBQ0E7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFNBQUosR0FBZ0IsQ0FBaEI7QUFDQSxNQUFJLFdBQUosR0FBa0IsT0FBbEI7QUFDQSxNQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEsR0FBYixFQUFrQixFQUFsQixFQUFzQixDQUF0QixFQUF5QixJQUFJLEtBQUssRUFBbEM7QUFDQSxNQUFJLE1BQUo7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFNBQUo7QUFDQSxNQUFJLFNBQUosR0FBZ0IsQ0FBaEI7QUFDQSxNQUFJLFdBQUosR0FBa0IsU0FBbEI7QUFDQSxNQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEsR0FBYixFQUFrQixFQUFsQixFQUFzQixDQUF0QixFQUF5QixJQUFJLEtBQUssRUFBbEM7QUFDQSxNQUFJLE1BQUo7QUFDQSxNQUFJLFNBQUo7QUFDQTtBQUNBLE1BQUksU0FBSjtBQUNBLE1BQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxNQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEVBQWhCO0FBQ0EsTUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBO0FBQ0EsTUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLE1BQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsRUFBaEI7QUFDQSxNQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0E7QUFDQSxNQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsTUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLE1BQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxNQUFJLFNBQUosR0FBZ0IsU0FBaEI7QUFDQSxNQUFJLElBQUo7QUFDQSxFQTlCRDs7QUFnQ0E7O0FBRUEsS0FBSSxrQkFBa0IsU0FBbEIsZUFBa0IsR0FBTTtBQUFBLDZCQUNsQixDQURrQjtBQUUxQixjQUFXLFlBQVc7QUFDckIsV0FBTyxnQkFBTTtBQUNaLFNBQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBcUIsT0FBTyxLQUE1QixFQUFtQyxPQUFPLE1BQTFDO0FBQ0E7QUFDQSxTQUFJLFNBQUo7QUFDQSxTQUFJLFNBQUosR0FBZ0IsRUFBaEI7QUFDQSxTQUFJLFdBQUosR0FBa0IsSUFBSSxlQUFKLEVBQWxCO0FBQ0EsU0FBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUIsQ0FBdkIsRUFBMEIsSUFBSSxLQUFLLEVBQW5DO0FBQ0EsU0FBSSxNQUFKO0FBQ0EsU0FBSSxTQUFKO0FBQ0E7QUFDQSxTQUFJLFNBQUo7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLEtBQUssQ0FBNUI7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQTtBQUNBO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixNQUFNLENBQTdCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixNQUFNLENBQTdCO0FBQ0E7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLE1BQUosQ0FBWSxNQUFNLENBQWxCLEVBQXVCLE1BQU0sQ0FBN0I7QUFDQSxTQUFJLFNBQUosR0FBZ0IsSUFBSSxlQUFKLEVBQWhCO0FBQ0EsU0FBSSxJQUFKO0FBQ0EsS0F6QkQ7QUEwQkE7QUFDQSxJQTVCRCxFQTRCSSxDQTVCSjs7QUE4QkEsY0FBVyxZQUFXO0FBQ3JCLFdBQU8sZ0JBQU07QUFDWixTQUFJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQXFCLE9BQU8sS0FBNUIsRUFBbUMsT0FBTyxNQUExQztBQUNBO0FBQ0EsU0FBSSxTQUFKO0FBQ0EsU0FBSSxTQUFKLEdBQWdCLEVBQWhCO0FBQ0EsU0FBSSxXQUFKLEdBQWtCLElBQUksZUFBSixFQUFsQjtBQUNBLFNBQUksR0FBSixDQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWtCLEdBQWxCLEVBQXVCLENBQXZCLEVBQTBCLElBQUksS0FBSyxFQUFuQztBQUNBLFNBQUksTUFBSjtBQUNBLFNBQUksU0FBSjtBQUNBO0FBQ0EsU0FBSSxTQUFKO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixLQUFLLENBQTVCO0FBQ0E7QUFDQTtBQUNBLFNBQUksTUFBSixDQUFZLE1BQU0sQ0FBbEIsRUFBdUIsTUFBTSxDQUE3QjtBQUNBLFNBQUksTUFBSixDQUFZLE1BQU0sQ0FBbEIsRUFBdUIsTUFBTSxDQUE3QjtBQUNBLFNBQUksTUFBSixDQUFZLE1BQU0sQ0FBbEIsRUFBdUIsTUFBTSxDQUE3QjtBQUNBO0FBQ0EsU0FBSSxNQUFKLENBQVksTUFBTSxDQUFsQixFQUF1QixNQUFNLENBQTdCO0FBQ0EsU0FBSSxNQUFKLENBQVksS0FBSyxDQUFqQixFQUFzQixNQUFNLENBQTVCO0FBQ0EsU0FBSSxNQUFKLENBQVksS0FBSyxDQUFqQixFQUFzQixNQUFNLENBQTVCO0FBQ0EsU0FBSSxTQUFKLEdBQWdCLElBQUksZUFBSixFQUFoQjtBQUNBLFNBQUksSUFBSjtBQUNBLEtBekJEOztBQTJCQTtBQUVBLElBOUJELEVBOEJJLEtBQUssQ0E5QlQ7QUFoQzBCOztBQUMzQixPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLEtBQUssRUFBckIsRUFBeUIsSUFBSSxJQUFJLENBQWpDLEVBQW9DO0FBQUEsU0FBM0IsQ0FBMkI7QUE4RG5DO0FBQ0QsRUFoRUQ7O0FBa0VBLFFBQU8sZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBcUMsWUFBVztBQUMvQyxnQkFBYyxZQUFZLGVBQVosRUFBNkIsR0FBN0IsQ0FBZDtBQUNBLEVBRkQ7O0FBSUEsUUFBTyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxZQUFXO0FBQzlDLE1BQUksR0FBSixDQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWtCLEVBQWxCLEVBQXNCLENBQXRCLEVBQXlCLElBQUksS0FBSyxFQUFsQztBQUNBLGdCQUFjLFdBQWQ7QUFDQSxhQUFXLFlBQVc7QUFDckI7QUFDQTtBQUNBLFVBQU8sZ0JBQU07QUFDYixRQUFJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQXFCLE9BQU8sS0FBNUIsRUFBbUMsT0FBTyxNQUExQztBQUNBO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLENBQWhCO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLE9BQWxCO0FBQ0EsUUFBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsRUFBbEIsRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxLQUFLLEVBQWxDO0FBQ0EsUUFBSSxNQUFKO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxTQUFKO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLENBQWhCO0FBQ0EsUUFBSSxXQUFKLEdBQWtCLFNBQWxCO0FBQ0EsUUFBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsRUFBbEIsRUFBc0IsQ0FBdEIsRUFBeUIsSUFBSSxLQUFLLEVBQWxDO0FBQ0EsUUFBSSxNQUFKO0FBQ0EsUUFBSSxTQUFKO0FBQ0E7QUFDQSxRQUFJLFNBQUo7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixFQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQTtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEVBQWhCO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBO0FBQ0EsUUFBSSxNQUFKLENBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUNBLFFBQUksTUFBSixDQUFXLEdBQVgsRUFBZ0IsR0FBaEI7QUFDQSxRQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWdCLEdBQWhCO0FBQ0EsUUFBSSxTQUFKLEdBQWdCLFNBQWhCO0FBQ0EsUUFBSSxJQUFKO0FBQ0MsSUE5QkQ7QUErQkE7QUFDQSxHQW5DRCxFQW1DRyxHQW5DSDtBQXNDQSxFQXpDRDs7QUEyQ0Q7QUFDQTtBQUNBO0FBQ0EsR0FBRSxvQkFBRixFQUF3QixLQUF4QixDQUE4QixZQUFXO0FBQ3hDLElBQUUsb0JBQUYsRUFBd0IsUUFBeEIsQ0FBaUMsTUFBakM7QUFDQSxNQUFJLFFBQUosR0FBZSxFQUFFLElBQUYsRUFBUSxJQUFSLEVBQWY7QUFDQSxFQUhEOztBQUtBLEdBQUUsTUFBRixFQUFVLEtBQVYsQ0FBZ0IsWUFBVztBQUMxQixJQUFFLG9CQUFGLEVBQXdCLFFBQXhCLENBQWlDLE1BQWpDO0FBQ0EsTUFBSSxRQUFKLEdBQWUsSUFBZjtBQUNBLEVBSEQ7QUFLQyxDQW5hRDtBQW9hQTtBQUNBLEVBQUUsWUFBVztBQUNaLEtBQUksTUFBSjtBQUNBLEtBQUksSUFBSjtBQUNBLENBSEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBDcmVhdGUgdmFyaWFibGUgZm9yIGFwcCBvYmplY3RcbmNvbnN0IGFwcCA9IHt9O1xuXG5hcHAuY29uZmlnID0gKCkgPT4geyAgIFxuICAgIGNvbnN0IGNvbmZpZyA9IHtcblx0ICAgIGFwaUtleTogXCJBSXphU3lBZV9McVlMVm0tb1ZzazlHREVrWjlfRjFwaFdpU29zTFlcIixcblx0ICAgIGF1dGhEb21haW46IFwianMtc3VtbWVyLXByb2plY3QzLmZpcmViYXNlYXBwLmNvbVwiLFxuXHQgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9qcy1zdW1tZXItcHJvamVjdDMuZmlyZWJhc2Vpby5jb21cIixcblx0ICAgIHByb2plY3RJZDogXCJqcy1zdW1tZXItcHJvamVjdDNcIixcblx0ICAgIHN0b3JhZ2VCdWNrZXQ6IFwiXCIsXG5cdCAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCIxMDQ3NzkzMDM0MTU1XCJcblx0fTtcbiAgICAvL1RoaXMgd2lsbCBpbml0aWFsaXplIGZpcmViYXNlIHdpdGggb3VyIGNvbmZpZyBvYmplY3RcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG4gICAgLy8gVGhpcyBtZXRob2QgY3JlYXRlcyBhIG5ldyBjb25uZWN0aW9uIHRvIHRoZSBkYXRhYmFzZVxuICAgIGFwcC5kYXRhYmFzZSA9IGZpcmViYXNlLmRhdGFiYXNlKCk7XG4gICAgLy8gVGhpcyBjcmVhdGVzIGEgcmVmZXJlbmNlIHRvIGEgbG9jYXRpb24gaW4gdGhlIGRhdGFiYXNlLiBJIG9ubHkgbmVlZCBvbmUgZm9yIHRoaXMgcHJvamVjdCB0byBzdG9yZSB0aGUgbWVkaWEgbGlzdFxuICAgIGFwcC5tZWRpYUxpc3QgPSBhcHAuZGF0YWJhc2UucmVmKCcvbWVkaWFMaXN0Jyk7XG59O1xuXG5hcHAuaW5pdCA9ICgpID0+IHtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2ltaWxhciBhbmQgT01EQiBBUElzOiBHZXQgUmVzdWx0cyBhbmQgZGlzcGxheVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIFNpbWlsYXIgQVBJIEtleVxuXHRhcHAuc2ltaWxhcktleSA9ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnO1xuXG5cdC8vIE9NREIgQVBJIEtleVxuXHRhcHAub21kYktleSA9ICcxNjYxZmE5ZCc7XG5cdC8vIEZpcmViYXNlIHZhcmlhYmxlc1xuXHRjb25zdCBtZWRpYVR5cGVFbGVtZW50ID0gJCgnLm1lZGlhX190eXBlJylcblx0Y29uc3QgbWVkaWFUaXRsZUVsZW1lbnQgPSAkKCcubWVkaWFfX3RpdGxlJyk7XG5cblx0Y29uc3QgbWVkaWFDb250YWluZXIgPSAkKCcuVGFzdGVEaXZlX19BUEktY29udGFpbmVyJyk7XG5cdGNvbnN0IGZhdm91cml0ZXNMaXN0ID0gJCgnLmZhdm91cml0ZXMtbGlzdF9fbGlzdCcpO1xuXHQvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdGhhdCBkaXNwbGF5cyBhbiBpbmxpbmUgZXJyb3IgdW5kZXIgdGhlIHNlYXJjaCBmaWVsZCB3aGVuIG5vIHJlc3VsdHMgYXJlIHJldHVybmVkIGZyb20gQVBJIzEgKGVtcHR5IGFycmF5KVxuXHRhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yID0gKCkgPT4ge1xuXHRcdC8vIGNvbnNvbGUubG9nKCdlcnJvciBmdW5jdGlvbiB3b3JrcycpXG5cdFx0Y29uc3QgJG5vUmVzdWx0c0Vycm9yID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2lubGluZS1lcnJvcicpLnRleHQoJ1NvcnJ5LCB3ZSBhcmUgdW5hYmxlIHRvIGZpbmQgeW91ciByZXN1bHRzLiBUaGV5IG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgb3IgeW91ciBzcGVsbGluZyBpcyBpbmNvcnJlY3QuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0Y29uc29sZS5sb2coJG5vUmVzdWx0c0Vycm9yKTtcblx0XHQkKCcjZXJyb3InKS5hcHBlbmQoJG5vUmVzdWx0c0Vycm9yKTtcblx0fTtcblx0Ly8gY29uc29sZS5sb2coYXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvcik7XG5cblx0Ly8gRXZlbnQgTGlzdGVuZXIgdG8gY2lubHVkZSBldmVyeXRoaW5nIHRoYXQgaGFwcGVucyBvbiBmb3JtIHN1Ym1pc3Npb25cblx0JCgnLm1lZGlhX19mb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Ly8gUHJldmVudCBkZWZhdWx0IGZvciBzdWJtaXQgaW5wdXRzXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcblx0XHRhcHAudXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIC8vIHE6ICdzdXBlcm1hbicsXG5cdFx0ICAgICAgdHlwZTogYCR7YXBwLnVzZXJUeXBlfWAsXG5cdFx0ICAgICAgaW5mbzogMSxcblx0XHQgICAgICBsaW1pdDogMTBcblx0XHQgICAgfVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGFzcyBtb3ZpZSB0aXRsZXMgZnJvbSBQcm9taXNlIzEgaW50byBQcm9taXNlICMyXG5cdFx0YXBwLmdldEltZGJSYXRpbmcgPSAobW92aWVUaXRsZSkgPT4ge1xuXHRcdFx0Ly8gUmV0dXJuIFByb21pc2UjMiB3aGljaCBpbmNsdWRlcyB0aGUgbW92aWUgdGl0bGUgZnJvbSBQcm9taXNlIzFcblx0XHQgICAgcmV0dXJuICQuYWpheCh7XG5cdFx0ICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdCAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICAgICAgICAgICBkYXRhOiB7XG5cdFx0ICAgICAgICAgICAgICAgYXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdCAgICAgICAgICAgICAgIHQ6IG1vdmllVGl0bGVcblx0XHQgICAgICAgICAgICAgfVxuXHRcdCAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblxuXHQgICAgICBhcHAubm9SZXN1bHRzID0gJC5pc0VtcHR5T2JqZWN0KG1lZGlhSW5mb0FycmF5KTtcblx0ICAgICAgaWYgKGFwcC5ub1Jlc3VsdHMgPT09IHRydWUpIHtcblx0ICAgICAgXHQkKCcjZXJyb3InKS5lbXB0eSgpO1xuXHQgICAgICBcdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IoKTtcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgXHQvLyBEaXNwbGF5IG1lZGlhIHJlc3VsdHMgY29udGFpbmVyIHdpdGggdGhlIHJpZ2h0IG1hcmdpbnNcblx0ICAgICAgXHQkKCdmb290ZXInKS5jc3MoJ21hcmdpbi10b3AnLCAnMHB4Jyk7XG5cdCAgICAgIFx0JCgnLm1lZGlhX19yZXN1bHRzLWNvbnRhaW5lcicpLmNzcygnbWFyZ2luLWJvdHRvbScsICc1MHB4JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuXHQgICAgICB9O1xuXHQgIFx0XHQvLyBJZiB0aGUgbWVkaWEgdHlwZSBpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmIChhcHAudXNlclR5cGUgPT09ICdtb3ZpZXMnIHx8IGFwcC51c2VyVHlwZSA9PT0gJ3Nob3dzJykge1xuXHRcdCAgICAgIGNvbnN0IGltZGJQcm9taXNlQXJyYXkgPSBtZWRpYUluZm9BcnJheS5tYXAoKHRpdGxlKSA9PiB7XG5cdFx0ICAgICAgICByZXR1cm4gYXBwLmdldEltZGJSYXRpbmcodGl0bGUuTmFtZSk7XG5cdFx0ICAgICAgfSk7XG5cdFx0ICAgICAgY29uc29sZS5sb2coaW1kYlByb21pc2VBcnJheSk7XG5cdFx0ICAgICAgLy8gUmV0dXJuIGEgc2luZ2xlIGFycmF5IGZyb20gdGhlIGFycmF5IG9mIHByb21pc2VzIGFuZCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlLlxuXHRcdCAgICAgIFByb21pc2UuYWxsKGltZGJQcm9taXNlQXJyYXkpLnRoZW4oKGltZGJSZXN1bHRzKSA9PiB7XG5cdFx0ICAgICAgICBjb25zb2xlLmxvZyhpbWRiUmVzdWx0cyk7XG5cdFx0ICAgICAgICBhcHAuaW1kYlJlc3VsdHNBcnJheSA9IGltZGJSZXN1bHRzO1xuXHRcdCAgICAgICAgLy8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXHRcdCAgICAgICAgYXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAgICAgfSk7XG5cdFx0ICAgIC8vIEZvciBtZWRpYSB0eXBlcyB0aGF0IGFyZSBub3QgbW92aWVzIG9yIHNob3dzLCBkaXNwbGF5IHRoZSByZXN1bHRzIG9uIHRoZSBwYWdlXG5cdFx0ICAgIH0gZWxzZSB7XG5cdFx0ICBcdFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAgIH07XG5cdFx0ICAvLyB9IGVsc2UgaWYgKGFwcC51c2VyVHlwZSA9PT0gJ211c2ljJyB8fCBhcHAudXNlclR5cGUgPT09ICdib29rcycgfHwgYXBwLnVzZXJUeXBlID09PSAnYXV0aG9ycycgfHwgYXBwLnVzZXJUeXBlID09PSAnZ2FtZXMnKXtcblx0XHQgIC8vIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICAvLyB9O1xuXHRcdH0pLmZhaWwoZnVuY3Rpb24oZXJyKSB7XG5cdFx0ICBjb25zb2xlLmxvZyhlcnIpO1xuXHRcdH0pO1xuXHRcdC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBkaXNwbGF5IHRoZSBBUEkgcHJvbWlzZSByZXN1bHRzIG9udG8gdGhlIHBhZ2Vcblx0ICAgIGFwcC5kaXNwbGF5TWVkaWEgPSAoYWxsTWVkaWFBcnJheSkgPT4ge1xuXHQgICAgXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIG1lZGlhIHJlc3VsdHMgZWxlbWVudChwcmV2aW91cyBzZWFyY2ggcmVzdWx0cyksIGJ1dCBvbmx5IHdoZW4gdGhlIHNlYXJjaCBxdWVyeSBicmluZ3MgbmV3IHJlc3VsdHMuIE90aGVyd2lzZSBpdCB3aWxsIGtlZXAgdGhlIGN1cnJlbnQgcmVzdWx0cyBhbmQgZGlzcGxheSBhbiBlcnJvciBtZXNzYWdlLlxuXHQgICAgXHRpZiAoYXBwLm5vUmVzdWx0cyA9PT0gZmFsc2UpIHtcblx0ICAgIFx0XHQkKCcjZXJyb3InKS5lbXB0eSgpO1xuXHQgICAgXHRcdCQoJy5UYXN0ZURpdmVfX0FQSS1jb250YWluZXInKS5lbXB0eSgpO1xuXHQgICAgXHR9O1xuXG5cdCAgICBcdGFsbE1lZGlhQXJyYXkuZm9yRWFjaCgoc2luZ2xlTWVkaWEpID0+IHtcblx0ICAgIFx0XHQvLyBGb3IgZWFjaCByZXN1bHQgaW4gdGhlIGFycmF5IHJldHVybmVkIGZyb20gQVBJIzEsIGNyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nLlxuXHQgICAgXHRcdC8vIEtFRVBJTkcgVFlQRSBBTkQgVElUTEUgU0VQQVJBVEVcblx0ICAgIFx0XHQvLyBjb25zdCAkbWVkaWFUeXBlID0gJCgnPGgyPicpLmFkZENsYXNzKCdtZWRpYV9fdHlwZScpLnRleHQoc2luZ2xlTWVkaWEuVHlwZSk7XG5cdCAgICBcdFx0Ly8gY29uc3QgJG1lZGlhVGl0bGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190aXRsZScpLnRleHQoc2luZ2xlTWVkaWEuTmFtZSk7XG5cdCAgICBcdFx0Ly8gQ09NQklOSU5HIFRZUEUgQU5EIFRJVExFXG5cdCAgICBcdFx0Ly8gY29uc3QgJG1lZGlhVHlwZVRpdGxlID0gJChgPGRpdiBjbGFzcz1cIm1lZGlhX190eXBlX190aXRsZS1jb250YWluZXJcIj48aDIgY2xhc3M9XCJtZWRpYV9fdHlwZVwiPiR7c2luZ2xlTWVkaWEuVHlwZX06PC9oMj48aDIgY2xhc3M9XCJtZWRpYV9fdGl0bGVcIj4ke3NpbmdsZU1lZGlhLk5hbWV9PC9oMj48L2Rpdj5gKTtcblx0ICAgIFx0XHQvLyBDT01CSU5JTkcgVFlQRSBBTkQgVElUTEUgSU4gT05FIEgyXG5cdCAgICBcdFx0Ly8gYXBwLm1lZGlhVHlwZSA9IHNpbmdsZU1lZGlhLlR5cGU7XG5cdCAgICBcdFx0Ly8gYXBwLm1lZGlhVGl0bGUgPSBzaW5nbGVNZWRpYS5OYW1lO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVR5cGVUaXRsZSA9ICQoYDxoMiBjbGFzcz1cIm1lZGlhX190eXBlX190aXRsZVwiPiR7c2luZ2xlTWVkaWEuVHlwZX06ICR7c2luZ2xlTWVkaWEuTmFtZX08L2gyPmApO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyID0gJCgnPGgzPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24taGVhZGVyJykudGV4dCgnRGVzY3JpcHRpb24nKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbiA9ICQoJzxwPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24nKS50ZXh0KHNpbmdsZU1lZGlhLndUZWFzZXIpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVdpa2kgPSAkKCc8YT4nKS5hZGRDbGFzcygnbWVkaWFfX3dpa2knKS5hdHRyKCdocmVmJywgc2luZ2xlTWVkaWEud1VybCkudGV4dCgnV2lraXBlZGlhJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHQgICAgXHRcdFx0Y2xhc3M6ICdtZWRpYV9feW91dHViZScsXG5cdCAgICBcdFx0XHRzcmM6IHNpbmdsZU1lZGlhLnlVcmwsXG5cdCAgICBcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHQgICAgXHRcdFx0ZnJhbWVib3JkZXI6IDAsXG5cdCAgICBcdFx0XHRhbGxvd2Z1bGxzY3JlZW46IHRydWVcblx0ICAgIFx0XHRcdC8vIGhlaWdodDogMzE1XG5cdCAgICBcdFx0XHQvLyBtYXgtd2lkdGg6IDU2MFxuXHQgICAgXHRcdH0pO1x0XG5cblx0ICAgIFx0XHRjb25zdCAkYWRkQnV0dG9uID0gJCgnPGlucHV0PicpLmF0dHIoe1xuXHQgICAgXHRcdFx0dHlwZTogJ2J1dHRvbicsXG5cdCAgICBcdFx0XHR2YWx1ZTogJ0FkZCB0byBGYXZvdXJpdGVzJyxcblx0ICAgIFx0XHRcdGZvcm06ICdhZGQtYnV0dG9uLWZvcm0nLFxuXHQgICAgXHRcdFx0Y2xhc3M6ICdhZGQtYnV0dG9uJ1xuXHQgICAgXHRcdH0pO1xuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEJ1dHRvbiA9ICQoYDxmb3JtPjxpbnB1dCB0eXBlPVwiYnV0dG9uXCIgdmFsdWU9XCJBZGQgdG8gRmF2b3VyaXRlc1wiIGZvcm09XCJhZGQtYnV0dG9uLWZvcm1cIiBjbGFzcz1cImFkZC1idXR0b25cIj48L2lucHV0PjwvZm9ybT5gKTtcblx0ICAgIFx0XHQvLyA/Pz9JUyBUSEVSRSBBIFdBWSBUTyBBUFBFTkQgQU4gSU5QVVQgSU5TSURFIE9GIEEgRk9STT8/PyBJRiBOT1Q8IEpVU1QgRE8gSU5QVVQgQU5EIFVTRSAnb25DTGljaycgZXZlbnQgbGlzdGVuZXIgdG8gc3VibWl0IHRoZSBtZWRpYSB0eXBlYW5kIHRpdGxlIHRvIEZpcmViYXNlLlxuXG5cdCAgICBcdFx0Ly8gY29uc3QgJGFkZEZvcm0gPSBgPGZvcm0gaWQ9XCJhZGQtYnV0dG9uLWZvcm1cIj4keyRhZGRCdXR0b259PC9mb3JtPmA7XG5cdCAgICBcdFx0XG5cdCAgICBcdFx0Ly8gY29uc29sZS5sb2coYXBwLmltZGJSZXN1bHRzQXJyYXkpO1xuXG5cdCAgICBcdFx0Ly8gVGhpcyBtYXRjaGVzIHRoZSBtb3ZpZSBvciBzaG93IHRpdGxlIGZyb20gQVBJIzEgd2l0aCBBUEkjMi4gSXQgdGhlbiBjcmVhdGVzIGEgdmFyaWFibGUgZm9yIHRoZSBJTURCIFJhdGluZyByZXR1cm5lZCBmcm9tIEFQSSMyIGFuZCBhcHBlbmRzIGl0IHRvIHRoZSBwYWdlLlxuXHQgICAgXHRcdGlmIChhcHAuaW1kYlJlc3VsdHNBcnJheSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ICAgIFx0XHRhcHAuaW1kYlJlc3VsdHNBcnJheS5maW5kKChlbGVtZW50KSA9PiB7XG5cdFx0ICAgIFx0XHRcdGlmIChzaW5nbGVNZWRpYS5OYW1lID09PSBlbGVtZW50LlRpdGxlKSB7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJG1lZGlhSW1kYiA9ICQoJzxwPicpLmFkZENsYXNzKCdpbWRiLXJhdGluZycpLnRleHQoYCR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMGApO1xuXHRcdCAgICBcdFx0XHRcdC8vIGNvbnN0ICRpbWRiTG9nbyA9ICQoJzxpbWc+JykuYWRkQ2xhc3MoJ2ltZGItbG9nbycpLmF0dHIoJ3NyYycsICdodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzYvNjkvSU1EQl9Mb2dvXzIwMTYuc3ZnJyk7XG5cdFx0ICAgIFx0XHRcdFx0Y29uc3QgJGltZGJMb2dvUmF0aW5nID0gJChgPGRpdiBjbGFzcz1cImltZGItY29udGFpbmVyXCI+PGRpdiBjbGFzcz1cImltZGItaW1hZ2UtY29udGFpbmVyXCI+PGltZyBzcmM9XCJodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zLzYvNjkvSU1EQl9Mb2dvXzIwMTYuc3ZnXCIgYWx0PVwiSU1EQiBMb2dvXCI+PC9kaXY+PHAgY2xhc3M9XCJpbWRiLXJhdGluZ1wiPiR7ZWxlbWVudC5pbWRiUmF0aW5nfS8xMDwvcD48L2Rpdj5gKTtcblx0XHQgICAgXHRcdFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRcdFx0aWYgKHNpbmdsZU1lZGlhLnlVcmwgPT09IG51bGwpIHtcblx0XHQgICAgXHRcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGltZGJMb2dvUmF0aW5nLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdFx0XHR9O1xuXHRcdCAgICBcdFx0XHR9O1xuXHRcdCAgICBcdFx0fSk7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFwcGVuZHMgdGhlIHJlc3VsdHMgZnJvbSBBUEkjMSBmb3Igbm9uLW1vdmllL3Nob3cgbWVkaWEgdHlwZXMuXG5cdFx0ICAgIFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdGlmIChzaW5nbGVNZWRpYS55VXJsID09PSBudWxsKSB7XG5cdFx0ICAgIFx0XHRcdG1lZGlhQ29udGFpbmVyLmFwcGVuZCgkbWVkaWFUeXBlVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uSGVhZGVyLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJGFkZEJ1dHRvbik7XG5cdFx0ICAgIFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0bWVkaWFDb250YWluZXIuYXBwZW5kKCRtZWRpYVR5cGVUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb25IZWFkZXIsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlLCAkYWRkQnV0dG9uKTtcblx0XHQgICAgXHRcdH07XG5cdFx0ICAgIFx0fTtcblx0ICAgIFx0fSk7XG5cdCAgICB9O1xuXHQgICAgXG5cdH0pO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBGaXJlYmFzZTogTWVkaWEgRmF2b3VyaXRlcyBMaXN0XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gRXZlbnQgbGlzdGVuZXIgZm9yIGFkZGluZyBtZWRpYSB0eXBlIGFuZCB0aXRsZSB0byB0aGUgbGlzdCBzdWJtaXR0aW5nIHRoZSBmb3JtL3ByaW50aW5nIHRoZSBsaXN0XG4gICAgbWVkaWFDb250YWluZXIub24oJ2NsaWNrJywgJy5hZGQtYnV0dG9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgIC8vIFRoaXMgdmFyaWFibGUgc3RvcmVzIHRoZSBlbGVtZW50KHMpIGluIHRoZSBmb3JtIEkgd2FudCB0byBnZXQgdmFsdWUocykgZnJvbS4gSW4gdGhpcyBjYXNlIGl0IHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdGl0bGUgYW5kIHRoZSBwIHJlcHJlc2VudGluZyB0aGUgbWVkaWEgdHlwZS5cbiAgICAgICAgLy8gY29uc3QgdHlwZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190eXBlJylbMF0uaW5uZXJUZXh0O1xuICAgICAgICAvLyBjb25zdCB0aXRsZSA9ICQodGhpcykucHJldkFsbCgnLm1lZGlhX190aXRsZScpWzBdLmlubmVyVGV4dDtcbiAgICAgICAgY29uc3QgdHlwZUFuZFRpdGxlID0gJCh0aGlzKS5wcmV2QWxsKCcubWVkaWFfX3R5cGVfX3RpdGxlJylbMF0uaW5uZXJUZXh0XG4gICAgICBcbiAgICAgICAgY29uc3QgbWVkaWFPYmplY3QgPSB7XG4gICAgICAgIFx0Ly8gdHlwZSxcbiAgICAgICAgXHQvLyB0aXRsZVxuICAgICAgICBcdHR5cGVBbmRUaXRsZVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKG1lZGlhT2JqZWN0KTtcbiAgICAgICAgLy8gQWRkIHRoZSBpbmZvcm1hdGlvbiB0byBGaXJlYmFzZVxuICAgICAgICBhcHAubWVkaWFMaXN0LnB1c2gobWVkaWFPYmplY3QpO1xuICAgIH0pO1xuICAgIC8vIGNvbnNvbGUubG9nKGFwcC5tZWRpYUxpc3QpO1xuICAgIC8vIEdldCB0aGUgdHlwZSBhbmQgdGl0bGUgaW5mb3JtYXRpb24gZnJvbSBGaXJlYmFzZVxuICAgIGFwcC5tZWRpYUxpc3Qub24oJ2NoaWxkX2FkZGVkJyxmdW5jdGlvbihtZWRpYUluZm8pIHtcbiAgICBcdC8vIGNvbnNvbGUubG9nKG1lZGlhSW5mbyk7XG4gICAgXHRjb25zdCBkYXRhID0gbWVkaWFJbmZvLnZhbCgpO1xuICAgIFx0Ly8gY29uc3QgbWVkaWFUeXBlRkIgPSBkYXRhLnR5cGU7XG4gICAgXHQvLyBjb25zdCBtZWRpYVRpdGxlRkIgPSBkYXRhLnRpdGxlO1xuICAgIFx0Y29uc3QgbWVkaWFGQiA9IGRhdGEudHlwZUFuZFRpdGxlO1xuICAgIFx0Y29uc3Qga2V5ID0gbWVkaWFJbmZvLmtleTtcbiAgICBcdC8vIENyZWF0ZSBMaXN0IEl0ZW0gdGFodCBpbmNsdWRlcyB0aGUgdHlwZSBhbmQgdGl0bGVcbiAgICBcdGNvbnN0IGxpID0gYDxsaSBpZD1cImtleS0ke2tleX1cIiBjbGFzcz1cImZhdm91cml0ZXMtbGlzdF9fbGlzdC1pdGVtXCI+XG4gICAgXHRcdFx0XHRcdDxwPiR7bWVkaWFGQn08L3A+XG4gICAgXHRcdFx0XHRcdDxidXR0b24gaWQ9XCIke2tleX1cIiBjbGFzcz1cImRlbGV0ZSBuby1wcmludFwiPjxpIGNsYXNzPVwiZmFzIGZhLXRpbWVzLWNpcmNsZVwiPjwvaT48L2J1dHRvbj5cbiAgICBcdFx0XHRcdDwvbGk+YFxuICAgIFx0ZmF2b3VyaXRlc0xpc3QuYXBwZW5kKGxpKTtcbiAgICBcdGZhdm91cml0ZXNMaXN0WzBdLnNjcm9sbFRvcCA9IGZhdm91cml0ZXNMaXN0WzBdLnNjcm9sbEhlaWdodDtcbiAgICBcdGNvbnNvbGUubG9nKGZhdm91cml0ZXNMaXN0WzBdKTtcbiAgICB9KTtcbiAgICAvLyBSZW1vdmUgbGlzdCBpdGVtIGZyb20gRmlyZWJhc2Ugd2hlbiB0aGUgZGVsZXRlIGljb24gaXMgY2xpY2tlZFxuICAgIGZhdm91cml0ZXNMaXN0Lm9uKCdjbGljaycsICcuZGVsZXRlJywgZnVuY3Rpb24oKSB7XG4gICAgXHRjb25zdCBpZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICBcdFxuICAgIFx0YXBwLmRhdGFiYXNlLnJlZihgL21lZGlhTGlzdC8ke2lkfWApLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIEZpcmViYXNlIHdoZW4gdGhlIENsZWFyIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgJCgnLmNsZWFyLWxpc3QnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICBcdGFwcC5kYXRhYmFzZS5yZWYoYC9tZWRpYUxpc3RgKS5zZXQobnVsbCk7XG4gICAgfSk7XG4gICAgLy8gUmVtb3ZlIGxpc3QgaXRlbSBmcm9tIHRoZSBmcm9udCBlbmQgYXBwZW5kXG4gICAgYXBwLm1lZGlhTGlzdC5vbignY2hpbGRfcmVtb3ZlZCcsIGZ1bmN0aW9uIChsaXN0SXRlbXMpIHtcblx0Ly8gY29uc29sZS5sb2coZmF2b3VyaXRlc0xpc3QuZmluZChsaXN0SXRlbXMua2V5KSk7XG5cdGZhdm91cml0ZXNMaXN0LmZpbmQoYCNrZXktJHtsaXN0SXRlbXMua2V5fWApLnJlbW92ZSgpO1xuXHR9KTtcdFxuXHQvLyBNYXhpbWl6ZSBhbmQgTWluaW1pemUgYnV0dG9ucyBmb3IgdGhlIEZhdm91cml0ZXMgTGlzdFxuXHQkKCcuZmF2b3VyaXRlcy1tYXhpbWl6ZScpLmNsaWNrKGZ1bmN0aW9uICgpIHtcblx0XHQkKCcuZmF2b3VyaXRlcy1saXN0LXdpbmRvdycpLnNsaWRlRG93bigyMDApLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0fSk7XG5cblx0JCgnLmZhdm91cml0ZXMtbWluaW1pemUnKS5jbGljayhmdW5jdGlvbiAoKSB7XG5cdFx0JCgnLmZhdm91cml0ZXMtbGlzdC13aW5kb3cnKS5zbGlkZVVwKDIwMCkuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXHR9KTtcblx0XG5cdC8vICQoZnVuY3Rpb24oKXtcbi8vICQoJyN2aWRlbycpLmNzcyh7IHdpZHRoOiAkKHdpbmRvdykuaW5uZXJXaWR0aCgpICsgJ3B4JywgaGVpZ2h0OiAkKHdpbmRvdykuaW5uZXJIZWlnaHQoKSArICdweCcgfSk7XG5cbi8vICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKXtcbi8vICQoJyN2aWRlbycpLmNzcyh7IHdpZHRoOiAkKHdpbmRvdykuaW5uZXJXaWR0aCgpICsgJ3B4JywgaGVpZ2h0OiAkKHdpbmRvdykuaW5uZXJIZWlnaHQoKSArICdweCcgfSk7XG4vLyAgIH0pO1xuLy8gfSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIExvZ28gQW5pbWF0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0bGV0IGxvZ29BbmltYXRlO1xuXG5cdGNvbnN0IGdldFJhbmRvbU51bWJlciA9ICgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1Nik7XG5cblx0YXBwLmdldFJhbmRvbUNvbG91ciA9ICgpID0+IHtcblx0XHRjb25zdCByZWQgPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCBibHVlID0gZ2V0UmFuZG9tTnVtYmVyKCk7XG5cdFx0Y29uc3QgZ3JlZW4gPSBnZXRSYW5kb21OdW1iZXIoKTtcblx0XHRjb25zdCByZ2IgPSBgcmdiKCR7cmVkfSwgJHtncmVlbn0sICR7Ymx1ZX0pYFxuXHRcdHJldHVybiByZ2I7XG5cdH07XG5cblx0Y29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuXHRcblx0Y29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cblx0bGV0IHRvcFMgPSAoKSA9PiB7XG5cdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0Y3R4LmxpbmVXaWR0aCA9IDc7XG5cdFx0Y3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5saW5lV2lkdGggPSA1O1xuXHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRjdHguYXJjKDEyNSwgMTE3LCA1MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdGN0eC5zdHJva2UoKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Ly8gVE9QIFBJRUNFXG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdGN0eC5saW5lVG8oMTUwLCA3NSk7XG5cdFx0Y3R4LmxpbmVUbygxMTAsIDExMCk7XG5cdFx0Ly8gMk5EIFBJRUNFXG5cdFx0Y3R4Lm1vdmVUbygxMTAsIDExMCk7XG5cdFx0Y3R4LmxpbmVUbygxMjAsIDkwKTtcblx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHQvLyAzUkQgUElFQ0Vcblx0XHRjdHgubW92ZVRvKDE1MCwgMTM1KTtcblx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRjdHgubGluZVRvKDE0MCwgMTI1KTtcblx0XHRjdHguZmlsbFN0eWxlID0gJyNGRkM5MDAnO1xuXHRcdGN0eC5maWxsKCk7XG5cdH07XG5cblx0dG9wUygpO1xuXG5cdGxldCBvbmVMb2dvSW50ZXJ2YWwgPSAoKSA9PiB7XG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gNTA7IGkgPSBpICsgMSkge1xuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsICBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdFx0XHRcdC8vIE9VVEVSIENJUkNMRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubGluZVdpZHRoID0gMTA7XG5cdFx0XHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDExMCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHRcdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRcdFx0Ly8gVE9QIFBJRUNFXG5cdFx0XHRcdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdFx0XHRcdGN0eC5tb3ZlVG8oKDEwMCArIGkpLCAoMTAwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDE1MCArIGkpLCAoNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTEwICsgaSksICgxMTAgLSBpKSk7XG5cdFx0XHRcdFx0Ly8gY3R4LmFyYygoMjAwICsgaSksICgyMDAgKyBpKSwgMTAwLCAxICogTWF0aC5QSSwgMS43ICogTWF0aC5QSSk7XG5cdFx0XHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRcdFx0Y3R4Lm1vdmVUbygoMTEwICsgaSksICgxMTAgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTIwICsgaSksICg5MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNTAgKyBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDEzNSArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxMDAgLSBpKSwgKDE2MCArIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNDAgLSBpKSwgKDEyNSArIGkpKTtcblx0XHRcdFx0XHRjdHguZmlsbFN0eWxlID0gYXBwLmdldFJhbmRvbUNvbG91cigpO1xuXHRcdFx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRvcFMoKTtcblx0XHRcdH0sIChpKSk7XG5cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRvcFMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0Y3R4LmNsZWFyUmVjdCgwLCAwLCAgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblx0XHRcdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVXaWR0aCA9IDEwO1xuXHRcdFx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguYXJjKDEyNSwgMTE3LCAxMTAsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRcdFx0Y3R4LmNsb3NlUGF0aCgpO1xuXHRcdFx0XHRcdC8vIFRPUCBQSUVDRVxuXHRcdFx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNTAgLSBpKSwgKDUwICsgaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDIwMCAtIGkpLCAoMjUgKyBpKSk7XG5cdFx0XHRcdFx0Y3R4LmxpbmVUbygoMTYwIC0gaSksICg2MCArIGkpKTtcblx0XHRcdFx0XHQvLyBjdHguYXJjKCgyOTAgLSBpKSwgKDI5MCAtIGkpLCAxMDAsIDEgKiBNYXRoLlBJLCAxLjcgKiBNYXRoLlBJKTtcblx0XHRcdFx0XHQvLyBNSURETEUgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxNjAgLSBpKSwgKDE2MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgxNzAgLSBpKSwgKDE0MCAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCgyMDAgLSBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHQvLyAzUkQgUElFQ0Vcblx0XHRcdFx0XHRjdHgubW92ZVRvKCgxMDAgKyBpKSwgKDE4NSAtIGkpKTtcblx0XHRcdFx0XHRjdHgubGluZVRvKCg1MCArIGkpLCAoMjEwIC0gaSkpO1xuXHRcdFx0XHRcdGN0eC5saW5lVG8oKDkwICsgaSksICgxNzUgLSBpKSk7XG5cdFx0XHRcdFx0Y3R4LmZpbGxTdHlsZSA9IGFwcC5nZXRSYW5kb21Db2xvdXIoKTtcblx0XHRcdFx0XHRjdHguZmlsbCgpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHRvcFMoKTtcblxuXHRcdFx0fSwgKDUwICsgaSkpO1xuXHRcdH07XG5cdH07XG5cdFxuXHRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG5cdFx0bG9nb0FuaW1hdGUgPSBzZXRJbnRlcnZhbChvbmVMb2dvSW50ZXJ2YWwsIDEwMCk7XG5cdH0pO1xuXG5cdGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdGN0eC5hcmMoMTI1LCAxMTcsIDYwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0Y2xlYXJJbnRlcnZhbChsb2dvQW5pbWF0ZSk7XG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdC8vIGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBjdHguYXJjKDEyNSwgMTE3LCA2MCwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0dG9wUyA9ICgpID0+IHtcblx0XHRcdGN0eC5jbGVhclJlY3QoMCwgMCwgIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cdFx0XHQvLyBPVVRFUiBDSVJDTEVcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5saW5lV2lkdGggPSA3O1xuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcblx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRjdHgubGluZVdpZHRoID0gNTtcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRcdGN0eC5hcmMoMTI1LCAxMTcsIDUwLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHRjdHguc3Ryb2tlKCk7XG5cdFx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0XHQvLyBUT1AgUElFQ0Vcblx0XHRcdGN0eC5iZWdpblBhdGgoKTtcblx0XHRcdGN0eC5tb3ZlVG8oMTAwLCAxMDApO1xuXHRcdFx0Y3R4LmxpbmVUbygxNTAsIDc1KTtcblx0XHRcdGN0eC5saW5lVG8oMTEwLCAxMTApO1xuXHRcdFx0Ly8gMk5EIFBJRUNFXG5cdFx0XHRjdHgubW92ZVRvKDExMCwgMTEwKTtcblx0XHRcdGN0eC5saW5lVG8oMTIwLCA5MCk7XG5cdFx0XHRjdHgubGluZVRvKDE1MCwgMTM1KTtcblx0XHRcdC8vIDNSRCBQSUVDRVxuXHRcdFx0Y3R4Lm1vdmVUbygxNTAsIDEzNSk7XG5cdFx0XHRjdHgubGluZVRvKDEwMCwgMTYwKTtcblx0XHRcdGN0eC5saW5lVG8oMTQwLCAxMjUpO1xuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9ICcjRkZDOTAwJztcblx0XHRcdGN0eC5maWxsKCk7XG5cdFx0XHR9O1xuXHRcdFx0dG9wUygpO1xuXHRcdH0sIDEwMClcblx0XHRcblx0XHRcblx0fSk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gUmVzcG9uc2l2ZSBEZXNpZ25cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuJCgnLm1lZGlhX190eXBlLWxhYmVsJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdCQoJy5tZWRpYV9fZm9ybV9fdHlwZScpLmFkZENsYXNzKCdoaWRlJyk7XG5cdGFwcC51c2VyVHlwZSA9ICQodGhpcykudGV4dCgpO1xufSk7XG5cdFxuJCgnI2FsbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuXHQkKCcubWVkaWFfX2Zvcm1fX3R5cGUnKS5hZGRDbGFzcygnaGlkZScpO1xuXHRhcHAudXNlclR5cGUgPSBudWxsO1xufSk7XG5cbn1cbi8vIFRoaXMgcnVucyB0aGUgYXBwXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuY29uZmlnKCk7XG5cdGFwcC5pbml0KCk7XG59KTsiXX0=
