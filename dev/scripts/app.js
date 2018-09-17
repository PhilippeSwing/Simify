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
		const $noResultsError = $('<p>').addClass('inline-error').text('Sorry, we are unable to find your results. They might not be available or your spelling is incorrect. Please try again.');

		$('#error').append($noResultsError);
	};

	// Event Listener to inlude everything that happens on form submission
	$('.header-container').on('submit', function (event) {
		// Prevent default for submit inputs
		event.preventDefault();

		$(".search__form-section").append("<svg class=\"lds-spinner loader\" width=\"100px\"  height=\"100px\"  xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid\" style=\"background: none;\"><g transform=\"rotate(0 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.9166666666666666s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(30 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.8333333333333334s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(60 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.75s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(90 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.6666666666666666s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(120 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.5833333333333334s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(150 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.5s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(180 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.4166666666666667s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(210 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.3333333333333333s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(240 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.25s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(270 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.16666666666666666s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(300 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"-0.08333333333333333s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g><g transform=\"rotate(330 50 50)\">\n  <rect x=\"47\" y=\"24\" rx=\"9.4\" ry=\"4.8\" width=\"6\" height=\"12\" fill=\"#FFC900\">\n    <animate attributeName=\"opacity\" values=\"1;0\" keyTimes=\"0;1\" dur=\"1s\" begin=\"0s\" repeatCount=\"indefinite\"></animate>\n  </rect>\n</g></svg>");


		app.userType = $('input[name=type]:checked').val();
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
					type: `${app.userType}`,
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

				$('.loader').remove();
			} else {
				// Display media results container with the right margins
				$('footer').css('margin-top', '0px');
				$('.media__results-container').removeClass('hidden');
				$("html")
					.stop()
					.animate({ scrollTop: $(".media__results-container").offset().top }, 1500, "swing");
				$('.loader').remove();
			};
			// If the media type is movies or shows, get results array from Promise #1 and map each movie title result to a promise for Promise #2. This will return an array of promises for API#2.
			if (app.userType === 'movies' || app.userType === 'shows') {
				const imdbPromiseArray = mediaInfoArray.map((title) => {
					return app.getImdbRating(title.Name);
				});
				console.log(imdbPromiseArray);
				// Return a single array from the array of promises and display the results on the page.
				Promise.all(imdbPromiseArray).then((imdbResults) => {
					console.log(imdbResults);
					app.imdbResultsArray = imdbResults;
					app.displayMedia(mediaInfoArray);
				}).catch((error) => {
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
		app.displayMedia = (allMediaArray) => {
			// This method removes child nodes from the media results element(previous search results), but only when the search query brings new results. Otherwise it will keep the current results and display an error message.
			if (app.noResults === false) {
				$('#error').empty();
				$('.TasteDive__API-container').empty();
			}

			allMediaArray.forEach((singleMedia) => {
				const $mediaTypeTitle = $(`<h2 class="media__type__title">${singleMedia.Type}: ${singleMedia.Name}</h2>`);
				const $mediaDescriptionHeader = $('<h3>').addClass('media__description-header').text('Description');
				const $mediaDescription = $('<p>').addClass('media__description').text(singleMedia.wTeaser);
				const $mediaWiki = $('<a>').addClass('media__wiki').attr('href', singleMedia.wUrl).text('Wikipedia');
				const $mediaYouTube = $('<iframe>', {
					class: 'media__youtube',
					src: singleMedia.yUrl,
					id: singleMedia.yID,
					frameborder: 0,
					allowfullscreen: true
				});
				const $addButton = $('<input>').attr({
					type: 'button',
					value: 'Add to Favourites',
					form: 'add-button-form',
					class: 'add-button'
				});

				if (app.imdbResultsArray !== undefined) {
					app.imdbResultsArray.find((element) => {
						if (singleMedia.Name === element.Title) {
							const $mediaImdb = $('<p>').addClass('imdb-rating').text(`${element.imdbRating}/10`);
							const $imdbLogoRating = $(`<div class="imdb-container"><div class="imdb-image-container"><img src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" alt="IMDB Logo"></div><p class="imdb-rating">${element.imdbRating}/10</p></div>`);
							// This accounts for results that do not have YouTube URLs
							if (singleMedia.yUrl === null) {
								const oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $imdbLogoRating, $addButton).addClass('result-container');
								mediaContainer.append(oneResultContainer);
							} else {
								const oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $imdbLogoRating, $mediaYouTube, $addButton).addClass('result-container');
								mediaContainer.append(oneResultContainer);
							};
						};
					});
					// This appends the results from API#1 for non-movie/show media types.
				} else {
					// This accounts for results that do not have YouTube URLs
					if (singleMedia.yUrl === null) {
						const oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $addButton).addClass('result-container');
						mediaContainer.append(oneResultContainer);
					} else {
						const oneResultContainer = $('<div>').append($mediaTypeTitle, $mediaDescriptionHeader, $mediaDescription, $mediaWiki, $mediaYouTube, $addButton).addClass('result-container');
						mediaContainer.append(oneResultContainer);
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
		const typeAndTitle = $(this).prevAll('.media__type__title')[0].innerText

		const mediaObject = {
			// Remember: This is the same as typeAndTitle: typeAndTitle
			typeAndTitle
		}
		// Add the information to Firebase
		app.mediaList.push(mediaObject);
	});
	// Get the type and title information from Firebase
	app.mediaList.on('child_added', function (mediaInfo) {
		const data = mediaInfo.val();

		const mediaFB = data.typeAndTitle;
		const key = mediaInfo.key;
		// Create List Item that includes the type and title
		const li = `<li id="key-${key}" class="favourites-list__list-item">
    					<p>${mediaFB}</p>
    					<button id="${key}" class="delete no-print"><i class="fas fa-times-circle"></i></button>
    				</li>`
		favouritesList.append(li);
		favouritesList[0].scrollTop = favouritesList[0].scrollHeight;
	});
	// Remove list item from Firebase when the delete icon is clicked
	favouritesList.on('click', '.delete', function () {
		const id = $(this).attr('id');

		app.database.ref(`/mediaList/${id}`).remove();
	});

	// Remove all items from Firebase when the Clear button is clicked
	$('.clear-list').on('click', function () {
		app.database.ref(`/mediaList`).set(null);
	});
	// Remove list item from the front end append
	app.mediaList.on('child_removed', function (listItems) {

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

	let oneLogoInterval = () => {
		for (let i = 1; i <= 50; i = i + 1) {
			setTimeout(function () {
				topS = () => {
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
					ctx.moveTo((100 + i), (100 - i));
					ctx.lineTo((150 + i), (75 - i));
					ctx.lineTo((110 + i), (110 - i));
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

			setTimeout(function () {
				topS = () => {
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
					ctx.moveTo((150 - i), (50 + i));
					ctx.lineTo((200 - i), (25 + i));
					ctx.lineTo((160 - i), (60 + i));
					// 2ND PIECE
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

	canvas.addEventListener('mouseover', function () {
		logoAnimate = setInterval(oneLogoInterval, 100);
	});

	canvas.addEventListener('mouseout', function () {
		ctx.arc(125, 117, 60, 0, 2 * Math.PI);
		clearInterval(logoAnimate);
		setTimeout(function () {
			topS = () => {
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
		}, 100)


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

}
// This runs the app
$(function () {
	app.config();
	app.init();
});