(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

// Create variable for app object
var app = {};

app.init = function () {
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';

	app.displayNoResultsError = function () {
		// console.log('error function works')
		var $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find results for your search. We might not have results for your search or your spelling is slightly off.');
		console.log($noResultsError);
		$('#error').append($noResultsError);
	};
	console.log(app.displayNoResultsError);

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
				q: '' + userInput,
				type: '' + userType,
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
				}).fail(function (err) {
					console.log(err);
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
			$('.media__container').empty();

			allMediaArray.forEach(function (singleMedia) {
				// For each result in the array returned from API#1, create variables for all html elements I'll be appending.
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
				// console.log(app.imdbResultsArray);

				// This matches the movie or show title from API#1 with API#2. It then creates a variable for the IMDB Rating returned from API#2 and appends it to the page.
				if (app.imdbResultsArray !== undefined) {
					app.imdbResultsArray.find(function (element) {
						if (singleMedia.Name === element.Title) {
							var $mediaImdb = $('<p>').addClass('imdb-rating').text(element.imdbRating);
							// This accounts for results that do not have YouTube URLs
							if (singleMedia.yUrl === null) {
								$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaImdb);
							} else {
								$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube, $mediaImdb);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki);
					} else {
						$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube);
					};
				};
			});
		};
		// This is a function that displays an inline error under the search field when no results are returned from API#1 (empty array)
	});
};
// This runs the app
$(function () {
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUEsSUFBSSxJQUFKLEdBQVcsWUFBTTtBQUNoQjtBQUNBLEtBQUksVUFBSixHQUFpQiwwQkFBakI7O0FBRUE7QUFDQSxLQUFJLE9BQUosR0FBYyxVQUFkOztBQUVBLEtBQUkscUJBQUosR0FBNEIsWUFBTTtBQUNqQztBQUNBLE1BQU0sa0JBQWtCLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0IsY0FBbEIsRUFBa0MsSUFBbEMsQ0FBdUMsbUlBQXZDLENBQXhCO0FBQ0EsVUFBUSxHQUFSLENBQVksZUFBWjtBQUNBLElBQUUsUUFBRixFQUFZLE1BQVosQ0FBbUIsZUFBbkI7QUFDQSxFQUxEO0FBTUEsU0FBUSxHQUFSLENBQVksSUFBSSxxQkFBaEI7O0FBRUE7QUFDQSxHQUFFLGNBQUYsRUFBa0IsRUFBbEIsQ0FBcUIsUUFBckIsRUFBK0IsVUFBUyxLQUFULEVBQWdCO0FBQzlDO0FBQ0EsUUFBTSxjQUFOO0FBQ0E7QUFDQSxNQUFNLFdBQVcsRUFBRSwwQkFBRixFQUE4QixHQUE5QixFQUFqQjtBQUNBO0FBQ0EsTUFBTSxZQUFZLEVBQUUsZ0JBQUYsRUFBb0IsR0FBcEIsRUFBbEI7QUFDQTtBQUNBLE1BQUksUUFBSixHQUNFLEVBQUUsSUFBRixDQUFPO0FBQ0wsUUFBSyxtQ0FEQTtBQUVMLFdBQVEsS0FGSDtBQUdMLGFBQVUsT0FITDtBQUlMLFNBQU07QUFDSixPQUFHLDBCQURDO0FBRUosWUFBTSxTQUZGO0FBR0osZUFBUyxRQUhMO0FBSUosVUFBTSxDQUpGO0FBS0osV0FBTztBQUxIO0FBSkQsR0FBUCxDQURGOztBQWNBO0FBQ0EsTUFBSSxhQUFKLEdBQW9CLFVBQUMsVUFBRCxFQUFnQjtBQUNuQztBQUNHLFVBQU8sRUFBRSxJQUFGLENBQU87QUFD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Q0EsUUFGRCxNQUVPO0FBQ1AsVUFBRSxtQkFBRixFQUF1QixNQUF2QixDQUE4QixXQUE5QixFQUEyQyxpQkFBM0MsRUFBOEQsVUFBOUQsRUFBMEUsYUFBMUUsRUFBeUYsVUFBekY7QUFDQztBQUNEO0FBQ0QsTUFWRDtBQVdBO0FBQ0EsS0FiRCxNQWFPO0FBQ047QUFDQSxTQUFJLFlBQVksSUFBWixLQUFxQixJQUF6QixFQUErQjtBQUM5QixRQUFFLG1CQUFGLEVBQXVCLE1BQXZCLENBQThCLFdBQTlCLEVBQTJDLGlCQUEzQyxFQUE4RCxVQUE5RDtBQUNBLE1BRkQsTUFFTztBQUNQLFFBQUUsbUJBQUYsRUFBdUIsTUFBdkIsQ0FBOEIsV0FBOUIsRUFBMkMsaUJBQTNDLEVBQThELFVBQTlELEVBQTBFLGFBQTFFO0FBQ0M7QUFDRDtBQUNELElBdENEO0FBdUNBLEdBM0NEO0FBNENBO0FBRUgsRUFsSEQ7QUFtSEEsQ0FuSUQ7QUFvSUE7QUFDQSxFQUFFLFlBQVc7QUFDWixLQUFJLElBQUo7QUFDQSxDQUZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQ3JlYXRlIHZhcmlhYmxlIGZvciBhcHAgb2JqZWN0XG5jb25zdCBhcHAgPSB7fTtcblxuYXBwLmluaXQgPSAoKSA9PiB7XG5cdC8vIFNpbWlsYXIgQVBJIEtleVxuXHRhcHAuc2ltaWxhcktleSA9ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnO1xuXG5cdC8vIE9NREIgQVBJIEtleVxuXHRhcHAub21kYktleSA9ICcxNjYxZmE5ZCc7XG5cblx0YXBwLmRpc3BsYXlOb1Jlc3VsdHNFcnJvciA9ICgpID0+IHtcblx0XHQvLyBjb25zb2xlLmxvZygnZXJyb3IgZnVuY3Rpb24gd29ya3MnKVxuXHRcdGNvbnN0ICRub1Jlc3VsdHNFcnJvciA9ICQoJzxwPicpLmFkZENsYXNzKCdpbmxpbmUtZXJyb3InKS50ZXh0KCdTb3JyeSwgd2UgYXJlIHVuYWJsZSB0byBmaW5kIHJlc3VsdHMgZm9yIHlvdXIgc2VhcmNoLiBXZSBtaWdodCBub3QgaGF2ZSByZXN1bHRzIGZvciB5b3VyIHNlYXJjaCBvciB5b3VyIHNwZWxsaW5nIGlzIHNsaWdodGx5IG9mZi4nKTtcblx0XHRjb25zb2xlLmxvZygkbm9SZXN1bHRzRXJyb3IpO1xuXHRcdCQoJyNlcnJvcicpLmFwcGVuZCgkbm9SZXN1bHRzRXJyb3IpO1xuXHR9O1xuXHRjb25zb2xlLmxvZyhhcHAuZGlzcGxheU5vUmVzdWx0c0Vycm9yKTtcblxuXHQvLyBFdmVudCBMaXN0ZW5lciB0byBjaW5sdWRlIGV2ZXJ5dGhpbmcgdGhhdCBoYXBwZW5zIG9uIGZvcm0gc3VibWlzc2lvblxuXHQkKCcubWVkaWFfX2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHQvLyBQcmV2ZW50IGRlZmF1bHQgZm9yIHN1Ym1pdCBpbnB1dHNcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdC8vIEdldCB2YWx1ZSBvZiB0aGUgbWVkaWEgdHlwZSB0aGUgdXNlciBjaGVja2VkXG5cdFx0Y29uc3QgdXNlclR5cGUgPSAkKCdpbnB1dFtuYW1lPXR5cGVdOmNoZWNrZWQnKS52YWwoKTtcblx0XHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJlZCBpbiB0aGUgc2VhcmNoIGZpZWxkXG5cdFx0Y29uc3QgdXNlcklucHV0ID0gJCgnI21lZGlhX19zZWFyY2gnKS52YWwoKTtcblx0XHQvLyBQcm9taXNlIGZvciBBUEkjMVxuXHRcdGFwcC5nZXRNZWRpYSA9XG5cdFx0ICAkLmFqYXgoe1xuXHRcdCAgICB1cmw6ICdodHRwczovL3Rhc3RlZGl2ZS5jb20vYXBpL3NpbWlsYXInLFxuXHRcdCAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICBkYXRhVHlwZTogJ2pzb25wJyxcblx0XHQgICAgZGF0YToge1xuXHRcdCAgICAgIGs6ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnLFxuXHRcdCAgICAgIHE6IGAke3VzZXJJbnB1dH1gLFxuXHRcdCAgICAgIHR5cGU6IGAke3VzZXJUeXBlfWAsXG5cdFx0ICAgICAgaW5mbzogMSxcblx0XHQgICAgICBsaW1pdDogMTBcblx0XHQgICAgfVxuXHRcdH0pO1xuXG5cdFx0Ly8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgcGFzcyBtb3ZpZSB0aXRsZXMgZnJvbSBQcm9taXNlIzEgaW50byBQcm9taXNlICMyXG5cdFx0YXBwLmdldEltZGJSYXRpbmcgPSAobW92aWVUaXRsZSkgPT4ge1xuXHRcdFx0Ly8gUmV0dXJuIFByb21pc2UjMiB3aGljaCBpbmNsdWRlcyB0aGUgbW92aWUgdGl0bGUgZnJvbSBQcm9taXNlIzFcblx0XHQgICAgcmV0dXJuICQuYWpheCh7XG5cdFx0ICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cub21kYmFwaS5jb20nLFxuXHRcdCAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuXHRcdCAgICAgICAgICAgICBkYXRhOiB7XG5cdFx0ICAgICAgICAgICAgICAgYXBpa2V5OiAnMTY2MWZhOWQnLFxuXHRcdCAgICAgICAgICAgICAgIHQ6IG1vdmllVGl0bGVcblx0XHQgICAgICAgICAgICAgfVxuXHRcdCAgICAgICAgICAgfSk7XG5cdFx0fTtcblx0XHQvLyBHZXQgcmVzdWx0cyBmb3IgUHJvbWlzZSMxXG5cdCAgICAkLndoZW4oYXBwLmdldE1lZGlhKS50aGVuKChtZWRpYUluZm8pID0+IHtcblx0ICAgICAgY29uc3QgbWVkaWFJbmZvQXJyYXkgPSBtZWRpYUluZm8uU2ltaWxhci5SZXN1bHRzO1xuXHQgICAgICBjb25zb2xlLmxvZyhtZWRpYUluZm9BcnJheSk7XG5cblx0ICAgICAgY29uc3Qgbm9SZXN1bHRzID0gJC5pc0VtcHR5T2JqZWN0KG1lZGlhSW5mb0FycmF5KTtcblx0ICAgICAgaWYgKG5vUmVzdWx0cyA9PT0gdHJ1ZSkge1xuXHQgICAgICBcdGFwcC5kaXNwbGF5Tm9SZXN1bHRzRXJyb3IoKTtcblx0ICAgICAgXHQvLyBhbGVydChgUGxlYXNlIGNoZWNrIHlvdXIgc3BlbGxpbmcgb3IgZW50ZXIgYSB2YWxpZCB0aXRsZSBmb3IgeW91ciBtZWRpYSBjYXRlZ29yeWApO1xuXG5cdCAgICAgIH07XG5cdCAgXHRcdC8vIElmIHRoZSBtZGVpYSB0eXBlaXMgbW92aWVzIG9yIHNob3dzLCBnZXQgcmVzdWx0cyBhcnJheSBmcm9tIFByb21pc2UgIzEgYW5kIG1hcCBlYWNoIG1vdmllIHRpdGxlIHJlc3VsdCB0byBhIHByb21pc2UgZm9yIFByb21pc2UgIzIuIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgcHJvbWlzZXMgZm9yIEFQSSMyLlxuXHQgICAgICBpZiAodXNlclR5cGUgPT09ICdtb3ZpZXMnIHx8IHVzZXJUeXBlID09PSAnc2hvd3MnKSB7XG5cdFx0ICAgICAgY29uc3QgaW1kYlByb21pc2VBcnJheSA9IG1lZGlhSW5mb0FycmF5Lm1hcCgodGl0bGUpID0+IHtcblx0XHQgICAgICAgIHJldHVybiBhcHAuZ2V0SW1kYlJhdGluZyh0aXRsZS5OYW1lKTtcblx0XHQgICAgICB9KTtcblx0XHQgICAgICBjb25zb2xlLmxvZyhpbWRiUHJvbWlzZUFycmF5KTtcblx0XHQgICAgICAvLyBSZXR1cm4gYSBzaW5nbGUgYXJyYXkgZnJvbSB0aGUgYXJyYXkgb2YgcHJvbWlzZXMgYW5kIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2UuXG5cdFx0ICAgICAgUHJvbWlzZS5hbGwoaW1kYlByb21pc2VBcnJheSkudGhlbigoaW1kYlJlc3VsdHMpID0+IHtcblx0XHQgICAgICAgIGNvbnNvbGUubG9nKGltZGJSZXN1bHRzKTtcblx0XHQgICAgICAgIGFwcC5pbWRiUmVzdWx0c0FycmF5ID0gaW1kYlJlc3VsdHM7XG5cdFx0ICAgICAgICAvLyBjb25zb2xlLmxvZyhhcHAuaW1kYlJlc3VsdHNBcnJheSk7XG5cdFx0ICAgICAgICBhcHAuZGlzcGxheU1lZGlhKG1lZGlhSW5mb0FycmF5KTtcblx0XHQgICAgICB9KS5mYWlsKGZ1bmN0aW9uKGVycikge1xuXHRcdCAgICAgIFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHQgICAgICB9KTtcblx0XHQgICAgLy8gRm9yIG1lZGlhIHR5cGVzIHRoYXQgYXJlIG5vdCBtb3ZpZXMgb3Igc2hvd3MsIGRpc3BsYXkgdGhlIHJlc3VsdHMgb24gdGhlIHBhZ2Vcblx0XHQgIH0gZWxzZSB7XG5cdFx0ICBcdGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgfTtcblx0XHR9KS5mYWlsKGZ1bmN0aW9uKGVycikge1xuXHRcdCAgY29uc29sZS5sb2coZXJyKTtcblx0XHR9KTtcblx0XHQvLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gZGlzcGxheSB0aGUgQVBJIHByb21pc2UgcmVzdWx0cyBvbnRvIHRoZSBwYWdlXG5cdCAgICBhcHAuZGlzcGxheU1lZGlhID0gKGFsbE1lZGlhQXJyYXkpID0+IHtcblx0ICAgIFx0Ly8gVGhpcyBtZXRob2QgcmVtb3ZlcyBjaGlsZCBub2RlcyBmcm9tIHRoZSBzZWxlY3RlZCBlbGVtZW50KHMpLiBJbiB0aGlzIGNhc2Ugd2UgcmVtb3ZlIHRoZSBkaXYgdGhhdCBjb250YWlucyBhbGwgcHJldmlvdXMgc2VhcmNoIHJlc3VsdHMuXG5cdCAgICBcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuZW1wdHkoKTtcblxuXHQgICAgXHRhbGxNZWRpYUFycmF5LmZvckVhY2goKHNpbmdsZU1lZGlhKSA9PiB7XG5cdCAgICBcdFx0Ly8gRm9yIGVhY2ggcmVzdWx0IGluIHRoZSBhcnJheSByZXR1cm5lZCBmcm9tIEFQSSMxLCBjcmVhdGUgdmFyaWFibGVzIGZvciBhbGwgaHRtbCBlbGVtZW50cyBJJ2xsIGJlIGFwcGVuZGluZy5cblx0ICAgIFx0XHRjb25zdCAkbWVkaWFUaXRsZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3RpdGxlJykudGV4dChzaW5nbGVNZWRpYS5OYW1lKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbiA9ICQoJzxwPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24nKS50ZXh0KHNpbmdsZU1lZGlhLndUZWFzZXIpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVdpa2kgPSAkKCc8YT4nKS5hZGRDbGFzcygnbWVkaWFfX3dpa2knKS5hdHRyKCdocmVmJywgc2luZ2xlTWVkaWEud1VybCkudGV4dCgnV2lraSBQYWdlJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHQgICAgXHRcdFx0Y2xhc3M6ICdtZWRpYV9feW91dHViZScsXG5cdCAgICBcdFx0XHRzcmM6IHNpbmdsZU1lZGlhLnlVcmwsXG5cdCAgICBcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHQgICAgXHRcdFx0ZnJhbWVib3JkZXI6IDAsXG5cdCAgICBcdFx0XHRhbGxvd2Z1bGxzY3JlZW46IHRydWUsXG5cdCAgICBcdFx0XHRoZWlnaHQ6IDMxNSxcblx0ICAgIFx0XHRcdHdpZHRoOiA1NjBcblx0ICAgIFx0XHR9KTtcblx0ICAgIFx0XHQvLyBjb25zb2xlLmxvZyhhcHAuaW1kYlJlc3VsdHNBcnJheSk7XG5cblx0ICAgIFx0XHQvLyBUaGlzIG1hdGNoZXMgdGhlIG1vdmllIG9yIHNob3cgdGl0bGUgZnJvbSBBUEkjMSB3aXRoIEFQSSMyLiBJdCB0aGVuIGNyZWF0ZXMgYSB2YXJpYWJsZSBmb3IgdGhlIElNREIgUmF0aW5nIHJldHVybmVkIGZyb20gQVBJIzIgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIHBhZ2UuXG5cdCAgICBcdFx0aWYgKGFwcC5pbWRiUmVzdWx0c0FycmF5ICE9PSB1bmRlZmluZWQpIHtcblx0XHQgICAgXHRcdGFwcC5pbWRiUmVzdWx0c0FycmF5LmZpbmQoKGVsZW1lbnQpID0+IHtcblx0XHQgICAgXHRcdFx0aWYgKHNpbmdsZU1lZGlhLk5hbWUgPT09IGVsZW1lbnQuVGl0bGUpIHtcblx0XHQgICAgXHRcdFx0XHRjb25zdCAkbWVkaWFJbWRiID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2ltZGItcmF0aW5nJykudGV4dChlbGVtZW50LmltZGJSYXRpbmcpO1xuXHRcdCAgICBcdFx0XHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRcdFx0JCgnLm1lZGlhX19jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFJbWRiKTtcblx0XHQgICAgXHRcdFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0XHRcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJG1lZGlhSW1kYik7XG5cdFx0ICAgIFx0XHRcdFx0fTtcblx0XHQgICAgXHRcdFx0fTtcblx0XHQgICAgXHRcdH0pO1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhcHBlbmRzIHRoZSByZXN1bHRzIGZyb20gQVBJIzEgZm9yIG5vbi1tb3ZpZS9zaG93IG1lZGlhIHR5cGVzLlxuXHRcdCAgICBcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHQkKCcubWVkaWFfX2NvbnRhaW5lcicpLmFwcGVuZCgkbWVkaWFUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2kpO1xuXHRcdCAgICBcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSk7XG5cdFx0ICAgIFx0XHR9O1xuXHRcdCAgICBcdH07XG5cdCAgICBcdH0pO1xuXHQgICAgfTtcblx0ICAgIC8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGRpc3BsYXlzIGFuIGlubGluZSBlcnJvciB1bmRlciB0aGUgc2VhcmNoIGZpZWxkIHdoZW4gbm8gcmVzdWx0cyBhcmUgcmV0dXJuZWQgZnJvbSBBUEkjMSAoZW1wdHkgYXJyYXkpXG5cdCAgICBcblx0fSk7XG59XG4vLyBUaGlzIHJ1bnMgdGhlIGFwcFxuJChmdW5jdGlvbigpIHtcblx0YXBwLmluaXQoKTtcbn0pOyJdfQ==
