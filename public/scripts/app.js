(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

// Create variable for app object
var app = {};

// const blue = $.isEmptyObject(mediaObjects);
// if (blue === true) {
// 	alert(`Please check your spelling or enter a valid title for your media category`);
// };

app.init = function () {
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';

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
		});

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
	});
};
// This runs the app
$(function () {
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBO0FBQ0EsSUFBTSxNQUFNLEVBQVo7O0FBRUU7QUFDQTtBQUNBO0FBQ0E7O0FBRUYsSUFBSSxJQUFKLEdBQVcsWUFBTTtBQUNoQjtBQUNBLEtBQUksVUFBSixHQUFpQiwwQkFBakI7O0FBRUE7QUFDQSxLQUFJLE9BQUosR0FBYyxVQUFkOztBQUVBO0FBQ0EsR0FBRSxjQUFGLEVBQWtCLEVBQWxCLENBQXFCLFFBQXJCLEVBQStCLFVBQVMsS0FBVCxFQUFnQjtBQUM5QztBQUNBLFFBQU0sY0FBTjtBQUNBO0FBQ0EsTUFBTSxXQUFXLEVBQUUsMEJBQUYsRUFBOEIsR0FBOUIsRUFBakI7QUFDQTtBQUNBLE1BQU0sWUFBWSxFQUFFLGdCQUFGLEVBQW9CLEdBQXBCLEVBQWxCO0FBQ0E7QUFDQSxNQUFJLFFBQUosR0FDRSxFQUFFLElBQUYsQ0FBTztBQUNMLFFBQUssbUNBREE7QUFFTCxXQUFRLEtBRkg7QUFHTCxhQUFVLE9BSEw7QUFJTCxTQUFNO0FBQ0osT0FBRywwQkFEQztBQUVKLFlBQU0sU0FGRjtBQUdKLGVBQVMsUUFITDtBQUlKLFVBQU0sQ0FKRjtBQUtKLFdBQU87QUFMSDtBQUpELEdBQVAsQ0FERjs7QUFjQTtBQUNBLE1BQUksYUFBSixHQUFvQixVQUFDLFVBQUQsRUFBZ0I7QUFDbkM7QUFDRyxVQUFPLEVBQUUsSUFBRixDQUFPO0FBQ0wsU0FBSyx3QkFEQTtBQUVMLFlBQVEsS0FGSDtBQUdMLFVBQU07QUFDSixhQUFRLFVBREo7QUFFSixRQUFHO0FBRkM7QUFIRCxJQUFQLENBQVA7QUFRSCxHQVZEO0FBV0E7QUFDRyxJQUFFLElBQUYsQ0FBTyxJQUFJLFFBQVgsRUFBcUIsSUFBckIsQ0FBMEIsVUFBQyxTQUFELEVBQWU7QUFDdkMsT0FBTSxpQkFBaUIsVUFBVSxPQUFWLENBQWtCLE9B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O0FBQ0EsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIENyZWF0ZSB2YXJpYWJsZSBmb3IgYXBwIG9iamVjdFxuY29uc3QgYXBwID0ge307XG5cbiAgLy8gY29uc3QgYmx1ZSA9ICQuaXNFbXB0eU9iamVjdChtZWRpYU9iamVjdHMpO1xuICAvLyBpZiAoYmx1ZSA9PT0gdHJ1ZSkge1xuICAvLyBcdGFsZXJ0KGBQbGVhc2UgY2hlY2sgeW91ciBzcGVsbGluZyBvciBlbnRlciBhIHZhbGlkIHRpdGxlIGZvciB5b3VyIG1lZGlhIGNhdGVnb3J5YCk7XG4gIC8vIH07XG5cbmFwcC5pbml0ID0gKCkgPT4ge1xuXHQvLyBTaW1pbGFyIEFQSSBLZXlcblx0YXBwLnNpbWlsYXJLZXkgPSAnMzExMjY3LUhhY2tlcllvLUhSMklQOUJEJztcblxuXHQvLyBPTURCIEFQSSBLZXlcblx0YXBwLm9tZGJLZXkgPSAnMTY2MWZhOWQnO1xuXG5cdC8vIEV2ZW50IExpc3RlbmVyIHRvIGNpbmx1ZGUgZXZlcnl0aGluZyB0aGF0IGhhcHBlbnMgb24gZm9ybSBzdWJtaXNzaW9uXG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdC8vIFByZXZlbnQgZGVmYXVsdCBmb3Igc3VibWl0IGlucHV0c1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Ly8gR2V0IHZhbHVlIG9mIHRoZSBtZWRpYSB0eXBlIHRoZSB1c2VyIGNoZWNrZWRcblx0XHRjb25zdCB1c2VyVHlwZSA9ICQoJ2lucHV0W25hbWU9dHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuXHRcdC8vIEdldCB0aGUgdmFsdWUgb2Ygd2hhdCB0aGUgdXNlciBlbnRlcmVkIGluIHRoZSBzZWFyY2ggZmllbGRcblx0XHRjb25zdCB1c2VySW5wdXQgPSAkKCcjbWVkaWFfX3NlYXJjaCcpLnZhbCgpO1xuXHRcdC8vIFByb21pc2UgZm9yIEFQSSMxXG5cdFx0YXBwLmdldE1lZGlhID1cblx0XHQgICQuYWpheCh7XG5cdFx0ICAgIHVybDogJ2h0dHBzOi8vdGFzdGVkaXZlLmNvbS9hcGkvc2ltaWxhcicsXG5cdFx0ICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuXHRcdCAgICBkYXRhOiB7XG5cdFx0ICAgICAgazogJzMxMTI2Ny1IYWNrZXJZby1IUjJJUDlCRCcsXG5cdFx0ICAgICAgcTogYCR7dXNlcklucHV0fWAsXG5cdFx0ICAgICAgdHlwZTogYCR7dXNlclR5cGV9YCxcblx0XHQgICAgICBpbmZvOiAxLFxuXHRcdCAgICAgIGxpbWl0OiAxMFxuXHRcdCAgICB9XG5cdFx0fSk7XG5cblx0XHQvLyBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBwYXNzIG1vdmllIHRpdGxlcyBmcm9tIFByb21pc2UjMSBpbnRvIFByb21pc2UgIzJcblx0XHRhcHAuZ2V0SW1kYlJhdGluZyA9IChtb3ZpZVRpdGxlKSA9PiB7XG5cdFx0XHQvLyBSZXR1cm4gUHJvbWlzZSMyIHdoaWNoIGluY2x1ZGVzIHRoZSBtb3ZpZSB0aXRsZSBmcm9tIFByb21pc2UjMVxuXHRcdCAgICByZXR1cm4gJC5hamF4KHtcblx0XHQgICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5vbWRiYXBpLmNvbScsXG5cdFx0ICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG5cdFx0ICAgICAgICAgICAgIGRhdGE6IHtcblx0XHQgICAgICAgICAgICAgICBhcGlrZXk6ICcxNjYxZmE5ZCcsXG5cdFx0ICAgICAgICAgICAgICAgdDogbW92aWVUaXRsZVxuXHRcdCAgICAgICAgICAgICB9XG5cdFx0ICAgICAgICAgICB9KTtcblx0XHR9O1xuXHRcdC8vIEdldCByZXN1bHRzIGZvciBQcm9taXNlIzFcblx0ICAgICQud2hlbihhcHAuZ2V0TWVkaWEpLnRoZW4oKG1lZGlhSW5mbykgPT4ge1xuXHQgICAgICBjb25zdCBtZWRpYUluZm9BcnJheSA9IG1lZGlhSW5mby5TaW1pbGFyLlJlc3VsdHM7XG5cdCAgICAgIGNvbnNvbGUubG9nKG1lZGlhSW5mb0FycmF5KTtcblx0ICBcdFx0Ly8gSWYgdGhlIG1kZWlhIHR5cGVpcyBtb3ZpZXMgb3Igc2hvd3MsIGdldCByZXN1bHRzIGFycmF5IGZyb20gUHJvbWlzZSAjMSBhbmQgbWFwIGVhY2ggbW92aWUgdGl0bGUgcmVzdWx0IHRvIGEgcHJvbWlzZSBmb3IgUHJvbWlzZSAjMi4gVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiBwcm9taXNlcyBmb3IgQVBJIzIuXG5cdCAgICAgIGlmICh1c2VyVHlwZSA9PT0gJ21vdmllcycgfHwgdXNlclR5cGUgPT09ICdzaG93cycpIHtcblx0XHQgICAgICBjb25zdCBpbWRiUHJvbWlzZUFycmF5ID0gbWVkaWFJbmZvQXJyYXkubWFwKCh0aXRsZSkgPT4ge1xuXHRcdCAgICAgICAgcmV0dXJuIGFwcC5nZXRJbWRiUmF0aW5nKHRpdGxlLk5hbWUpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAgIGNvbnNvbGUubG9nKGltZGJQcm9taXNlQXJyYXkpO1xuXHRcdCAgICAgIC8vIFJldHVybiBhIHNpbmdsZSBhcnJheSBmcm9tIHRoZSBhcnJheSBvZiBwcm9taXNlcyBhbmQgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZS5cblx0XHQgICAgICBQcm9taXNlLmFsbChpbWRiUHJvbWlzZUFycmF5KS50aGVuKChpbWRiUmVzdWx0cykgPT4ge1xuXHRcdCAgICAgICAgY29uc29sZS5sb2coaW1kYlJlc3VsdHMpO1xuXHRcdCAgICAgICAgYXBwLmltZGJSZXN1bHRzQXJyYXkgPSBpbWRiUmVzdWx0cztcblx0XHQgICAgICAgIC8vIGNvbnNvbGUubG9nKGFwcC5pbWRiUmVzdWx0c0FycmF5KTtcblx0XHQgICAgICAgIGFwcC5kaXNwbGF5TWVkaWEobWVkaWFJbmZvQXJyYXkpO1xuXHRcdCAgICAgIH0pO1xuXHRcdCAgICAvLyBGb3IgbWVkaWEgdHlwZXMgdGhhdCBhcmUgbm90IG1vdmllcyBvciBzaG93cywgZGlzcGxheSB0aGUgcmVzdWx0cyBvbiB0aGUgcGFnZVxuXHRcdCAgfSBlbHNlIHtcblx0XHQgIFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYUluZm9BcnJheSk7XG5cdFx0ICB9O1xuXHRcdH0pO1xuXG5cdCAgICBhcHAuZGlzcGxheU1lZGlhID0gKGFsbE1lZGlhQXJyYXkpID0+IHtcblx0ICAgIFx0Ly8gVGhpcyBtZXRob2QgcmVtb3ZlcyBjaGlsZCBub2RlcyBmcm9tIHRoZSBzZWxlY3RlZCBlbGVtZW50KHMpLiBJbiB0aGlzIGNhc2Ugd2UgcmVtb3ZlIHRoZSBkaXYgdGhhdCBjb250YWlucyBhbGwgcHJldmlvdXMgc2VhcmNoIHJlc3VsdHMuXG5cdCAgICBcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuZW1wdHkoKTtcblxuXHQgICAgXHRhbGxNZWRpYUFycmF5LmZvckVhY2goKHNpbmdsZU1lZGlhKSA9PiB7XG5cdCAgICBcdFx0Ly8gRm9yIGVhY2ggcmVzdWx0IGluIHRoZSBhcnJheSByZXR1cm5lZCBmcm9tIEFQSSMxLCBjcmVhdGUgdmFyaWFibGVzIGZvciBhbGwgaHRtbCBlbGVtZW50cyBJJ2xsIGJlIGFwcGVuZGluZy5cblx0ICAgIFx0XHRjb25zdCAkbWVkaWFUaXRsZSA9ICQoJzxoMj4nKS5hZGRDbGFzcygnbWVkaWFfX3RpdGxlJykudGV4dChzaW5nbGVNZWRpYS5OYW1lKTtcblx0ICAgIFx0XHRjb25zdCAkbWVkaWFEZXNjcmlwdGlvbiA9ICQoJzxwPicpLmFkZENsYXNzKCdtZWRpYV9fZGVzY3JpcHRpb24nKS50ZXh0KHNpbmdsZU1lZGlhLndUZWFzZXIpO1xuXHQgICAgXHRcdGNvbnN0ICRtZWRpYVdpa2kgPSAkKCc8YT4nKS5hZGRDbGFzcygnbWVkaWFfX3dpa2knKS5hdHRyKCdocmVmJywgc2luZ2xlTWVkaWEud1VybCkudGV4dCgnV2lraSBQYWdlJyk7XG5cdCAgICBcdFx0Y29uc3QgJG1lZGlhWW91VHViZSA9ICQoJzxpZnJhbWU+Jywge1xuXHQgICAgXHRcdFx0Y2xhc3M6ICdtZWRpYV9feW91dHViZScsXG5cdCAgICBcdFx0XHRzcmM6IHNpbmdsZU1lZGlhLnlVcmwsXG5cdCAgICBcdFx0XHRpZDogc2luZ2xlTWVkaWEueUlELFxuXHQgICAgXHRcdFx0ZnJhbWVib3JkZXI6IDAsXG5cdCAgICBcdFx0XHRhbGxvd2Z1bGxzY3JlZW46IHRydWUsXG5cdCAgICBcdFx0XHRoZWlnaHQ6IDMxNSxcblx0ICAgIFx0XHRcdHdpZHRoOiA1NjBcblx0ICAgIFx0XHR9KTtcblx0ICAgIFx0XHQvLyBjb25zb2xlLmxvZyhhcHAuaW1kYlJlc3VsdHNBcnJheSk7XG5cblx0ICAgIFx0XHQvLyBUaGlzIG1hdGNoZXMgdGhlIG1vdmllIG9yIHNob3cgdGl0bGUgZnJvbSBBUEkjMSB3aXRoIEFQSSMyLiBJdCB0aGVuIGNyZWF0ZXMgYSB2YXJpYWJsZSBmb3IgdGhlIElNREIgUmF0aW5nIHJldHVybmVkIGZyb20gQVBJIzIgYW5kIGFwcGVuZHMgaXQgdG8gdGhlIHBhZ2UuXG5cdCAgICBcdFx0aWYgKGFwcC5pbWRiUmVzdWx0c0FycmF5ICE9PSB1bmRlZmluZWQpIHtcblx0XHQgICAgXHRcdGFwcC5pbWRiUmVzdWx0c0FycmF5LmZpbmQoKGVsZW1lbnQpID0+IHtcblx0XHQgICAgXHRcdFx0aWYgKHNpbmdsZU1lZGlhLk5hbWUgPT09IGVsZW1lbnQuVGl0bGUpIHtcblx0XHQgICAgXHRcdFx0XHRjb25zdCAkbWVkaWFJbWRiID0gJCgnPHA+JykuYWRkQ2xhc3MoJ2ltZGItcmF0aW5nJykudGV4dChlbGVtZW50LmltZGJSYXRpbmcpO1xuXHRcdCAgICBcdFx0XHRcdC8vIFRoaXMgYWNjb3VudHMgZm9yIHJlc3VsdHMgdGhhdCBkbyBub3QgaGF2ZSBZb3VUdWJlIFVSTHNcblx0XHQgICAgXHRcdFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHRcdFx0JCgnLm1lZGlhX19jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFJbWRiKTtcblx0XHQgICAgXHRcdFx0XHR9IGVsc2Uge1xuXHRcdCAgICBcdFx0XHRcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSwgJG1lZGlhSW1kYik7XG5cdFx0ICAgIFx0XHRcdFx0fTtcblx0XHQgICAgXHRcdFx0fTtcblx0XHQgICAgXHRcdH0pO1xuXHRcdCAgICBcdFx0Ly8gVGhpcyBhcHBlbmRzIHRoZSByZXN1bHRzIGZyb20gQVBJIzEgZm9yIG5vbi1tb3ZpZS9zaG93IG1lZGlhIHR5cGVzLlxuXHRcdCAgICBcdH0gZWxzZSB7XG5cdFx0ICAgIFx0XHQvLyBUaGlzIGFjY291bnRzIGZvciByZXN1bHRzIHRoYXQgZG8gbm90IGhhdmUgWW91VHViZSBVUkxzXG5cdFx0ICAgIFx0XHRpZiAoc2luZ2xlTWVkaWEueVVybCA9PT0gbnVsbCkge1xuXHRcdCAgICBcdFx0XHQkKCcubWVkaWFfX2NvbnRhaW5lcicpLmFwcGVuZCgkbWVkaWFUaXRsZSwgJG1lZGlhRGVzY3JpcHRpb24sICRtZWRpYVdpa2kpO1xuXHRcdCAgICBcdFx0fSBlbHNlIHtcblx0XHQgICAgXHRcdCQoJy5tZWRpYV9fY29udGFpbmVyJykuYXBwZW5kKCRtZWRpYVRpdGxlLCAkbWVkaWFEZXNjcmlwdGlvbiwgJG1lZGlhV2lraSwgJG1lZGlhWW91VHViZSk7XG5cdFx0ICAgIFx0XHR9O1xuXHRcdCAgICBcdH07XG5cdCAgICBcdH0pO1xuXHQgICAgfTtcblxuXHR9KTtcbn1cbi8vIFRoaXMgcnVucyB0aGUgYXBwXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
