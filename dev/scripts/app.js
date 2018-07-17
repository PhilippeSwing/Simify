// Create variable for app object
const app = {};

app.config = () => {   
    const config = {
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

app.init = () => {
// ================================================
// Similar and OMDB APIs: Get Results and display
// ================================================
	// Similar API Key
	app.similarKey = '311267-HackerYo-HR2IP9BD';

	// OMDB API Key
	app.omdbKey = '1661fa9d';
	// Firebase variables
	const mediaTypeElement = $('.media__type')
	const mediaTitleElement = $('.media__title');

	const mediaContainer = $('.TasteDive__API-container');
	const favouritesList = $('.favourites-list__list');
	// This is a function that displays an inline error under the search field when no results are returned from API#1 (empty array)
	app.displayNoResultsError = () => {
		// console.log('error function works')
		const $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find your results. They might not be available or your spelling is incorrect. Please try again.');
		console.log($noResultsError);
		$('#error').append($noResultsError);
	};
	// console.log(app.displayNoResultsError);

	// Event Listener to cinlude everything that happens on form submission
	$('.media__form').on('submit', function(event) {
		// Prevent default for submit inputs
		event.preventDefault();
		
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
		      // q: 'superman',
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
		  // } else if (userType === 'music' || userType === 'books' || userType === 'authors' || userType === 'games'){
		  // 	app.displayMedia(mediaInfoArray);
		  // };
		}).fail(function(err) {
		  console.log(err);
		});
		// This is a function to display the API promise results onto the page
	    app.displayMedia = (allMediaArray) => {
	    	// This method removes child nodes from the media results element(previous search results), but only when the search query brings new results. Otherwise it will keep the current results and display an error message.
	    	if (app.noResults === false) {
	    		$('#error').empty();
	    		$('.TasteDive__API-container').empty();
	    	};

	    	allMediaArray.forEach((singleMedia) => {
	    		// For each result in the array returned from API#1, create variables for all html elements I'll be appending.
	    		// KEEPING TYPE AND TITLE SEPARATE
	    		// const $mediaType = $('<h2>').addClass('media__type').text(singleMedia.Type);
	    		// const $mediaTitle = $('<h2>').addClass('media__title').text(singleMedia.Name);
	    		// COMBINING TYPE AND TITLE
	    		// const $mediaTypeTitle = $(`<div class="media__type__title-container"><h2 class="media__type">${singleMedia.Type}:</h2><h2 class="media__title">${singleMedia.Name}</h2></div>`);
	    		// COMBINING TYPE AND TITLE IN ONE H2
	    		// app.mediaType = singleMedia.Type;
	    		// app.mediaTitle = singleMedia.Name;
	    		const $mediaTypeTitle = $(`<h2 class="media__type__title">${singleMedia.Type}: ${singleMedia.Name}</h2>`);
	    		const $mediaDescriptionHeader = $('<h3>').addClass('media__description-header').text('Description');
	    		const $mediaDescription = $('<p>').addClass('media__description').text(singleMedia.wTeaser);
	    		const $mediaWiki = $('<a>').addClass('media__wiki').attr('href', singleMedia.wUrl).text('Wikipedia');
	    		const $mediaYouTube = $('<iframe>', {
	    			class: 'media__youtube',
	    			src: singleMedia.yUrl,
	    			id: singleMedia.yID,
	    			frameborder: 0,
	    			allowfullscreen: true,
	    			height: 315,
	    			width: 560
	    		});	

	    		const $addButton = $('<input>').attr({
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
		    		app.imdbResultsArray.find((element) => {
		    			if (singleMedia.Name === element.Title) {
		    				const $mediaImdb = $('<p>').addClass('imdb-rating').text(`${element.imdbRating}/10`);
		    				// const $imdbLogo = $('<img>').addClass('imdb-logo').attr('src', 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg');
		    				const $imdbLogoRating = $(`<div class="imdb-container"><div class="imdb-image-container"><img src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" alt="IMDB Logo"></div><p class="imdb-rating">${element.imdbRating}/10</p></div>`);
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
    mediaContainer.on('click', '.add-button', function(e) {
       // This variable stores the element(s) in the form I want to get value(s) from. In this case it the p representing the media title and the p representing the media type.
        // const type = $(this).prevAll('.media__type')[0].innerText;
        // const title = $(this).prevAll('.media__title')[0].innerText;
        const typeAndTitle = $(this).prevAll('.media__type__title')[0].innerText
      
        const mediaObject = {
        	// type,
        	// title
        	typeAndTitle
        }
        // Add the information to Firebase
        app.mediaList.push(mediaObject);
    });
    // console.log(app.mediaList);
    // Get the type and title information from Firebase
    app.mediaList.limitToLast(5).on('child_added',function(mediaInfo) {
    	// console.log(mediaInfo);
    	const data = mediaInfo.val();
    	// const mediaTypeFB = data.type;
    	// const mediaTitleFB = data.title;
    	const mediaFB = data.typeAndTitle;
    	const key = mediaInfo.key;
    	// Create List Item taht includes the type and title
    	const li = `<li id="key-${key}" class="favourites-list__list-item">
    					<p>${mediaFB}</p>
    					<button id="${key}" class="delete no-print"><i class="fas fa-times-circle"></i></button>
    				</li>`
    	favouritesList.append(li);
    	favouritesList[0].scrollTop = favouritesList[0].scrollHeight;
    });
    // Remove list item from Firebase when the delete icon is clicked
    favouritesList.on('click', '.delete', function() {
    	const id = $(this).attr('id');
    	
    	app.database.ref(`/mediaList/${id}`).remove();
    });

    // Remove all items from Firebase when the Clear button is clicked
    $('.clear-list').on('click', function() {
    	app.database.ref(`/mediaList`).set(null);
    });
    // Remove list item from the front end append
    app.mediaList.limitToLast(5).on('child_removed', function (listItems) {
	// console.log(favouritesList.find(listItems.key));
	favouritesList.find(`#key-${listItems.key}`).remove();
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
	let logoAnimate;

	const getRandomNumber = () => Math.floor(Math.random() * 256);

	app.getRandomColour = () => {
		const red = getRandomNumber();
		const blue = getRandomNumber();
		const green = getRandomNumber();
		const rgb = `rgb(${red}, ${green}, ${blue})`
		return rgb;
	};

	const canvas = document.getElementById('canvas');
	
	const ctx = canvas.getContext('2d');

	let topS = () => {
		ctx.clearRect(0, 0,  canvas.width, canvas.height);
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

	let oneLogoInterval = () => {
		for (let i = 1; i <= 50; i = i + 1) {
			setTimeout(function() {
				topS = () => {
					ctx.clearRect(0, 0,  canvas.width, canvas.height);
					// OUTER CIRCLE
					ctx.beginPath();
					ctx.lineWidth = 10;
					ctx.strokeStyle = app.getRandomColour();
					ctx.arc(125, 117, 110, 0, 2 * Math.PI);
					ctx.stroke();
					ctx.closePath();
					// TOP PIECE
					ctx.beginPath();
					ctx.moveTo((100 + i), (100 - i));
					ctx.lineTo((150 + i), (75 - i));
					ctx.lineTo((110 + i), (110 - i));
					// ctx.arc((200 + i), (200 + i), 100, 1 * Math.PI, 1.7 * Math.PI);
					// 2ND PIECE
					ctx.moveTo((110 + i), (110 + i));
					ctx.lineTo((120 + i), (90 + i));
					ctx.lineTo((150 + i), (135 + i));
					// 3RD PIECE
					ctx.moveTo((150 - i), (135 + i));
					ctx.lineTo((100 - i), (160 + i));
					ctx.lineTo((140 - i), (125 + i));
					ctx.fillStyle = app.getRandomColour();
					ctx.fill();
				};
				topS();
			}, (i));

			setTimeout(function() {
				topS = () => {
					ctx.clearRect(0, 0,  canvas.width, canvas.height);
					// OUTER CIRCLE
					ctx.beginPath();
					ctx.lineWidth = 10;
					ctx.strokeStyle = app.getRandomColour();
					ctx.arc(125, 117, 110, 0, 2 * Math.PI);
					ctx.stroke();
					ctx.closePath();
					// TOP PIECE
					ctx.beginPath();
					ctx.moveTo((150 - i), (50 + i));
					ctx.lineTo((200 - i), (25 + i));
					ctx.lineTo((160 - i), (60 + i));
					// ctx.arc((290 - i), (290 - i), 100, 1 * Math.PI, 1.7 * Math.PI);
					// MIDDLE PIECE
					ctx.moveTo((160 - i), (160 - i));
					ctx.lineTo((170 - i), (140 - i));
					ctx.lineTo((200 - i), (185 - i));
					// 3RD PIECE
					ctx.moveTo((100 + i), (185 - i));
					ctx.lineTo((50 + i), (210 - i));
					ctx.lineTo((90 + i), (175 - i));
					ctx.fillStyle = app.getRandomColour();
					ctx.fill();
				};

				topS();

			}, (50 + i));
		};
	};
	
	canvas.addEventListener('mouseover', function() {
		logoAnimate = setInterval(oneLogoInterval, 100);
	});

	canvas.addEventListener('mouseout', function() {
		ctx.arc(125, 117, 60, 0, 2 * Math.PI);
		clearInterval(logoAnimate);
		setTimeout(function() {
			// ctx.clearRect(0, 0,  canvas.width, canvas.height);
			// ctx.arc(125, 117, 60, 0, 2 * Math.PI);
			topS = () => {
			ctx.clearRect(0, 0,  canvas.width, canvas.height);
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
		}, 100)
		
		
	});
	
}
// This runs the app
$(function() {
	app.config();
	app.init();
});