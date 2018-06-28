const app = {};

app.getMedia = (query, type) => {
	$.ajax({
		url: 'https://tastedive.com/api/similar',
		method: 'GET',
		dataType: 'jsonp',
		data: {
			k: app.k,
			q: query,
			type: 'movies',
			info: 1,
			limit: 10
		}
	}).then((res) => {
		// console.log(res);
		const mediaObjects = res.Similar.Results;
		// console.log(typeof mediaObjects);
		// console.log(res.length);
		// if (mediaObjects.Name === undefined) {
		// 	alert(`Please check your spelling or enter a valid movie title`);
		// };
		const blue = $.isEmptyObject(mediaObjects);
		if (blue === true) {
			alert(`Please check your spelling or enter a valid movie title`);
		};
		// console.log(mediaObjects);
		app.displayMedia(mediaObjects);
	});
};

app.init = () => {
	app.k = '311267-HackerYo-HR2IP9BD';
	console.log('heyo!');
	// Run the getMedia() method but don't pass anything to get a default of zero results
	// app.getMedia();
	// Event listener to get the value of which box(es) is checked and run the app.getMedia function with the type parameter

	// const typeSelected = () => {
	// 	if ($('input[value=type]').is(':checked')) {
	// 		return $('input[value=type]').val();
	// 	}
	// };
	// console.log(typeSelected());

	// Get the value of what the user enters into the text field and pass it into the getMedia() method
	
	$('.media__form').on('submit', function(event) {
		event.preventDefault();
		// Get the value of the box(es) that is checked. Get an array for multiple values and concat them to enter as a type parameter for app.getMedia
		const checkArray = [];
		$(':checkbox:checked').each(function(i){
		  checkArray[i] = $(this).val();
		});
		console.log(checkArray);

		const userInput = $('#media__search').val();
		app.getMedia(userInput);
	});
}

app.displayMedia = (allMedia) => {
	// This method removes child nodes from the selected element(s). In this case we remove the div that contains all previous serach results.
	$('.media__container').empty();

	const youtubeMedia = allMedia.filter((oneMedia) => {
		return oneMedia.yURL !== null;
	});
	console.log(youtubeMedia);
	youtubeMedia.forEach((singleMedia) => {
		// Create variables for all html elements I'll be appending
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
		$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube);
	});
};

$(function() {
	app.init();
});