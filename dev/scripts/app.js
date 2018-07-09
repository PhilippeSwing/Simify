// Create variable for app object
const app = {};

app.init = () => {
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';

	app.displayNoResultsError = () => {
		// console.log('error function works')
		const $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find results for your search. We might not have results for your search or your spelling is slightly off.');
		console.log($noResultsError);
		$('#error').append($noResultsError);
	};
	console.log(app.displayNoResultsError);

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

	      const noResults = $.isEmptyObject(mediaInfoArray);
	      if (noResults === true) {
	      	app.displayNoResultsError();
	      	// alert(`Please check your spelling or enter a valid title for your media category`);

	      };
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
		      }).fail(function(err) {
		      	console.log(err);
		      });
		    // For media types that are not movies or shows, display the results on the page
		  } else {
		  	app.displayMedia(mediaInfoArray);
		  };
		}).fail(function(err) {
		  console.log(err);
		});
		// This is a function to display the API promise results onto the page
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
	    // This is a function that displays an inline error under the search field when no results are returned from API#1 (empty array)
	    
	});
// APP LOGO ANIMATION	
	app.logo = () => {
		app.logoAnimate;

		app.getRandomNumber = () => Math.floor(Math.random() * 256);

		app.getRandomColour = () => {
			app.red.getRandomNumber();
			app.blue.getRandomNumber();
			app.green.getRandomNumber();
			app.rgb = `rgb(${red}, ${green}, ${blue})`
			return app.rgb;
		};

		app.canvas = document.getElementById('canvas');
		
		app.ctx = app.canvas.getContext('2d');

		let app.topS = () => {
			app.ctx.clearRect(0, 0,  canvas.width, canvas.height);
			app.ctx.beginPath();
			app.ctx.fillStyle = '#000000';
			// TOP PIECE
			app.ctx.moveTo(100, 100);
			app.ctx.lineTo(150, 75);
			app.ctx.lineTo(110, 110);
			// 2ND PIECE
			app.ctx.moveTo(110, 110);
			app.ctx.lineTo(120, 90);
			app.ctx.lineTo(150, 135);
			// 3RD PIECE
			app.ctx.moveTo(150, 135);
			app.ctx.lineTo(100, 160);
			app.ctx.lineTo(140, 125);
			app.ctx.fill();
		};

		app.topS();

		app.oneLogoInterval = () => {
			for (let i = 5; i <= 75; i = i + 5) {
				setTimeout(function() {
					app.topS = () => {
						app.ctx.clearRect(0, 0,  canvas.width, canvas.height);
						app.ctx.beginPath();
						// TOP PIECE
						app.ctx.moveTo((100 + i), (100 - i));
						app.ctx.lineTo((150 + i), (75 - i));
						app.ctx.lineTo((110 + i), (110 - i));
						// app.ctx.arc((200 + i), (200 + i), 100, 1 * Math.PI, 1.7 * Math.PI);
						// 2ND PIECE
						app.ctx.moveTo((110 + i), (110 + i));
						app.ctx.lineTo((120 + i), (90 + i));
						app.ctx.lineTo((150 + i), (135 + i));
						// 3RD PIECE
						app.ctx.moveTo((150 - i), (135 + i));
						app.ctx.lineTo((100 - i), (160 + i));
						app.ctx.lineTo((140 - i), (125 + i));
						app.ctx.fillStyle = app.getRandomColour();
						app.ctx.fill();
					};
					app.topS();
				}, (10 + i));

				setTimeout(function() {
					app.topS = () => {
						app.ctx.clearRect(0, 0,  canvas.width, canvas.height);
						app.ctx.beginPath();
						app.ctx.moveTo((175 - i), (25 + i));
						app.ctx.lineTo((225 - i), (0 + i));
						app.ctx.lineTo((185 - i), (35 + i));
						// app.ctx.arc((290 - i), (290 - i), 100, 1 * Math.PI, 1.7 * Math.PI);
						// MIDDLE PIECE
						app.ctx.moveTo((185 - i), (185 - i));
						app.ctx.lineTo((195 - i), (165 - i));
						app.ctx.lineTo((225 - i), (210 - i));
						// 3RD PIECE
						app.ctx.moveTo((75 + i), (210 - i));
						app.ctx.lineTo((25 + i), (235 - i));
						app.ctx.lineTo((65 + i), (200 - i));
						app.ctx.fillStyle = app.getRandomColour();
						app.ctx.fill();
					};

					app.topS();

				}, (85 + i));
			};
		};
		
		app.canvas.addEventListener('mouseover', function() {
			app.logoAnimate = setInterval(app.oneLogoInterval, 160);
		});

		app.canvas.addEventListener('mouseout', function() {
			clearInterval(app.logoAnimate);
			// app.ctx.fillStyle = '#000000';
			app.topS();
		});
	};

	app.logo();
}
// This runs the app
$(function() {
	app.init();
});