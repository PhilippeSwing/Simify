// Create variable for app object
const app = {};

  // const blue = $.isEmptyObject(mediaObjects);
  // if (blue === true) {
  // 	alert(`Please check your spelling or enter a valid title for your media category`);
  // };

app.init = () => {
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';

	// Event Listener to cinlude everything that happens on form submission
	$('.media__form').on('submit', function(event) {
		// Prevent default for submit inputs
		event.preventDefault();
		// Get value of the media type the user checked
		const userType = $('input[name=type]:checked').val();
		// Get the value of what the user entered in the search field
		const userInput = $('#media__search').val();
		// Promise for API#1
		app.getMedia =
		  $.ajax({
		    url: 'https://tastedive.com/api/similar',
		    method: 'GET',
		    dataType: 'jsonp',
		    data: {
		      k: '311267-HackerYo-HR2IP9BD',
		      q: `${userInput}`,
		      type: `${userType}`,
		      info: 1,
		      limit: 10
		    }
		});

		// A function that will pass movie titles from Promise#1 into Promise #2
		app.getImdbRating = (movieTitle) => {
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
	    $.when(app.getMedia).then((mediaInfo) => {
	      const mediaInfoArray = mediaInfo.Similar.Results;
	      console.log(mediaInfoArray);
	  		// If the mdeia typeis movies or shows, get results array from Promise #1 and map each movie title result to a promise for Promise #2. This will return an array of promises for API#2.
	      if (userType === 'movies' || userType === 'shows') {
		      const imdbPromiseArray = mediaInfoArray.map((title) => {
		        return app.getImdbRating(title.Name);
		      });
		      console.log(imdbPromiseArray);
		      // Return a single array from the array of promises and display the results on the page.
		      Promise.all(imdbPromiseArray).then((imdbResults) => {
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

	    app.displayMedia = (allMediaArray) => {
	    	// This method removes child nodes from the selected element(s). In this case we remove the div that contains all previous search results.
	    	$('.media__container').empty();

	    	allMediaArray.forEach((singleMedia) => {
	    		// For each result in the array returned from API#1, create variables for all html elements I'll be appending.
	    		const $mediaTitle = $('<h2>').addClass('media__title').text(singleMedia.Name);
	    		const $mediaDescription = $('<p>').addClass('media__description').text(singleMedia.wTeaser);
	    		const $mediaWiki = $('<a>').addClass('media__wiki').attr('href', singleMedia.wUrl).text('Wiki Page');
	    		const $mediaYouTube = $('<iframe>', {
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
		    		app.imdbResultsArray.find((element) => {
		    			if (singleMedia.Name === element.Title) {
		    				const $mediaImdb = $('<p>').addClass('imdb-rating').text(element.imdbRating);
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
}
// This runs the app
$(function() {
	app.init();
});