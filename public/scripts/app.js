(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var app = {};

app.getMedia = function (query, type) {
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
	}).then(function (res) {
		// console.log(res);
		var mediaObjects = res.Similar.Results;
		// console.log(typeof mediaObjects);
		// console.log(res.length);
		// if (mediaObjects.Name === undefined) {
		// 	alert(`Please check your spelling or enter a valid movie title`);
		// };
		var blue = $.isEmptyObject(mediaObjects);
		if (blue === true) {
			alert('Please check your spelling or enter a valid movie title');
		};
		// console.log(mediaObjects);
		app.displayMedia(mediaObjects);
	});
};

app.init = function () {
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

	$('.media__form').on('submit', function (event) {
		event.preventDefault();
		// Get the value of the box(es) that is checked. Get an array for multiple values and concat them to enter as a type parameter for app.getMedia
		var checkArray = [];
		$(':checkbox:checked').each(function (i) {
			checkArray[i] = $(this).val();
		});
		console.log(checkArray);

		var userInput = $('#media__search').val();
		app.getMedia(userInput);
	});
};

app.displayMedia = function (allMedia) {
	// This method removes child nodes from the selected element(s). In this case we remove the div that contains all previous serach results.
	$('.media__container').empty();

	var youtubeMedia = allMedia.filter(function (oneMedia) {
		return oneMedia.yURL !== null;
	});
	console.log(youtubeMedia);
	youtubeMedia.forEach(function (singleMedia) {
		// Create variables for all html elements I'll be appending
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
		$('.media__container').append($mediaTitle, $mediaDescription, $mediaWiki, $mediaYouTube);
	});
};

$(function () {
	app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sTUFBTSxFQUFaOztBQUVBLElBQUksUUFBSixHQUFlLFVBQUMsS0FBRCxFQUFRLElBQVIsRUFBaUI7QUFDL0IsR0FBRSxJQUFGLENBQU87QUFDTixPQUFLLG1DQURDO0FBRU4sVUFBUSxLQUZGO0FBR04sWUFBVSxPQUhKO0FBSU4sUUFBTTtBQUNMLE1BQUcsSUFBSSxDQURGO0FBRUwsTUFBRyxLQUZFO0FBR0wsU0FBTSxRQUhEO0FBSUwsU0FBTSxDQUpEO0FBS0wsVUFBTztBQUxGO0FBSkEsRUFBUCxFQVdHLElBWEgsQ0FXUSxVQUFDLEdBQUQsRUFBUztBQUNoQjtBQUNBLE1BQU0sZUFBZSxJQUFJLE9BQUosQ0FBWSxPQUFqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLE9BQU8sRUFBRSxhQUFGLENBQWdCLFlBQWhCLENBQWI7QUFDQSxNQUFJLFNBQVMsSUFBYixFQUFtQjtBQUNsQjtBQUNBO0FBQ0Q7QUFDQSxNQUFJLFlBQUosQ0FBaUIsWUFBakI7QUFDQSxFQXpCRDtBQTBCQSxDQTNCRDs7QUE2QkEsSUFBSSxJQUFKLEdBQVcsWUFBTTtBQUNoQixLQUFJLENBQUosR0FBUSwwQkFBUjtBQUNBLFNBQVEsR0FBUixDQUFZLE9BQVo7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLEdBQUUsY0FBRixFQUFrQixFQUFsQixDQUFxQixRQUFyQixFQUErQixVQUFTLEtBQVQsRUFBZ0I7QUFDOUMsUUFBTSxjQUFOO0FBQ0E7QUFDQSxNQUFNLGFBQWEsRUFBbkI7QUFDQSxJQUFFLG1CQUFGLEVBQXVCLElBQXZCLENBQTRCLFVBQVMsQ0FBVCxFQUFXO0FBQ3JDLGNBQVcsQ0FBWCxJQUFnQixFQUFFLElBQUYsRUFBUSxHQUFSLEVBQWhCO0FBQ0QsR0FGRDtBQUdBLFVBQVEsR0FBUixDQUFZLFVBQVo7O0FBRUEsTUFBTSxZQUFZLEVBQUUsZ0JBQUYsRUFBb0IsR0FBcEIsRUFBbEI7QUFDQSxNQUFJLFFBQUosQ0FBYSxTQUFiO0FBQ0EsRUFYRDtBQVlBLENBNUJEOztBQThCQSxJQUFJLFlBQUosR0FBbUIsVUFBQyxRQUFELEVBQWM7QUFDaEM7QUFDQSxHQUFFLG1CQUFGLEVBQXVCLEtBQXZCOztBQUVBLEtBQU0sZUFBZSxTQUFTLE1BQVQsQ0FBZ0IsVUFBQyxRQUFELEVBQWM7QUFDbEQsU0FBTyxTQUFTLElBQVQsS0FBa0IsSUFBekI7QUFDQSxFQUZvQixDQUFyQjtBQUdBLFNBQVEsR0FBUixDQUFZLFlBQVo7QUFDQSxjQUFhLE9BQWIsQ0FBcUIsVUFBQyxXQUFELEVBQWlCO0FBQ3JDO0FBQ0EsTUFBTSxjQUFjLEVBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsY0FBbkIsRUFBbUMsSUFBbkMsQ0FBd0MsWUFBWSxJQUFwRCxDQUFwQjtBQUNBLE1BQU0sb0JBQW9CLEVBQUUsS0FBRixFQUFTLFFBQVQsQ0FBa0Isb0JBQWxCLEVBQXdDLElBQXhDLENBQTZDLFlBQVksT0FBekQsQ0FBMUI7QUFDQSxNQUFNLGFBQWEsRUFBRSxLQUFGLEVBQVMsUUFBVCxDQUFrQixhQUFsQixFQUFpQyxJQUFqQyxDQUFzQyxNQUF0QyxFQUE4QyxZQUFZLElBQTFELEVBQWdFLElBQWhFLENBQXFFLFdBQXJFLENBQW5CO0FBQ0EsTUFBTSxnQkFBZ0IsRUFBRSxVQUFGLEVBQWM7QUFDbkMsVUFBTyxnQkFENEI7QUFFbkMsUUFBSyxZQUFZLElBRmtCO0FBR25DLE9BQUksWUFBWSxHQUhtQjtBQUluQyxnQkFBYSxDQUpzQjtBQUtuQyxvQkFBaUIsSUFMa0I7QUFNbkMsV0FBUSxHQU4yQjtBQU9uQyxVQUFPO0FBUDRCLEdBQWQsQ0FBdEI7QUFTQSxJQUFFLG1CQUFGLEVBQXVCLE1BQXZCLENBQThCLFdBQTlCLEVBQTJDLGlCQUEzQyxFQUE4RCxVQUE5RCxFQUEwRSxhQUExRTtBQUNBLEVBZkQ7QUFnQkEsQ0F4QkQ7O0FBMEJBLEVBQUUsWUFBVztBQUNaLEtBQUksSUFBSjtBQUNBLENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBhcHAgPSB7fTtcblxuYXBwLmdldE1lZGlhID0gKHF1ZXJ5LCB0eXBlKSA9PiB7XG5cdCQuYWpheCh7XG5cdFx0dXJsOiAnaHR0cHM6Ly90YXN0ZWRpdmUuY29tL2FwaS9zaW1pbGFyJyxcblx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdGRhdGFUeXBlOiAnanNvbnAnLFxuXHRcdGRhdGE6IHtcblx0XHRcdGs6IGFwcC5rLFxuXHRcdFx0cTogcXVlcnksXG5cdFx0XHR0eXBlOiAnbW92aWVzJyxcblx0XHRcdGluZm86IDEsXG5cdFx0XHRsaW1pdDogMTBcblx0XHR9XG5cdH0pLnRoZW4oKHJlcykgPT4ge1xuXHRcdC8vIGNvbnNvbGUubG9nKHJlcyk7XG5cdFx0Y29uc3QgbWVkaWFPYmplY3RzID0gcmVzLlNpbWlsYXIuUmVzdWx0cztcblx0XHQvLyBjb25zb2xlLmxvZyh0eXBlb2YgbWVkaWFPYmplY3RzKTtcblx0XHQvLyBjb25zb2xlLmxvZyhyZXMubGVuZ3RoKTtcblx0XHQvLyBpZiAobWVkaWFPYmplY3RzLk5hbWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIFx0YWxlcnQoYFBsZWFzZSBjaGVjayB5b3VyIHNwZWxsaW5nIG9yIGVudGVyIGEgdmFsaWQgbW92aWUgdGl0bGVgKTtcblx0XHQvLyB9O1xuXHRcdGNvbnN0IGJsdWUgPSAkLmlzRW1wdHlPYmplY3QobWVkaWFPYmplY3RzKTtcblx0XHRpZiAoYmx1ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0YWxlcnQoYFBsZWFzZSBjaGVjayB5b3VyIHNwZWxsaW5nIG9yIGVudGVyIGEgdmFsaWQgbW92aWUgdGl0bGVgKTtcblx0XHR9O1xuXHRcdC8vIGNvbnNvbGUubG9nKG1lZGlhT2JqZWN0cyk7XG5cdFx0YXBwLmRpc3BsYXlNZWRpYShtZWRpYU9iamVjdHMpO1xuXHR9KTtcbn07XG5cbmFwcC5pbml0ID0gKCkgPT4ge1xuXHRhcHAuayA9ICczMTEyNjctSGFja2VyWW8tSFIySVA5QkQnO1xuXHRjb25zb2xlLmxvZygnaGV5byEnKTtcblx0Ly8gUnVuIHRoZSBnZXRNZWRpYSgpIG1ldGhvZCBidXQgZG9uJ3QgcGFzcyBhbnl0aGluZyB0byBnZXQgYSBkZWZhdWx0IG9mIHplcm8gcmVzdWx0c1xuXHQvLyBhcHAuZ2V0TWVkaWEoKTtcblx0Ly8gRXZlbnQgbGlzdGVuZXIgdG8gZ2V0IHRoZSB2YWx1ZSBvZiB3aGljaCBib3goZXMpIGlzIGNoZWNrZWQgYW5kIHJ1biB0aGUgYXBwLmdldE1lZGlhIGZ1bmN0aW9uIHdpdGggdGhlIHR5cGUgcGFyYW1ldGVyXG5cblx0Ly8gY29uc3QgdHlwZVNlbGVjdGVkID0gKCkgPT4ge1xuXHQvLyBcdGlmICgkKCdpbnB1dFt2YWx1ZT10eXBlXScpLmlzKCc6Y2hlY2tlZCcpKSB7XG5cdC8vIFx0XHRyZXR1cm4gJCgnaW5wdXRbdmFsdWU9dHlwZV0nKS52YWwoKTtcblx0Ly8gXHR9XG5cdC8vIH07XG5cdC8vIGNvbnNvbGUubG9nKHR5cGVTZWxlY3RlZCgpKTtcblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIHdoYXQgdGhlIHVzZXIgZW50ZXJzIGludG8gdGhlIHRleHQgZmllbGQgYW5kIHBhc3MgaXQgaW50byB0aGUgZ2V0TWVkaWEoKSBtZXRob2Rcblx0XG5cdCQoJy5tZWRpYV9fZm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiB0aGUgYm94KGVzKSB0aGF0IGlzIGNoZWNrZWQuIEdldCBhbiBhcnJheSBmb3IgbXVsdGlwbGUgdmFsdWVzIGFuZCBjb25jYXQgdGhlbSB0byBlbnRlciBhcyBhIHR5cGUgcGFyYW1ldGVyIGZvciBhcHAuZ2V0TWVkaWFcblx0XHRjb25zdCBjaGVja0FycmF5ID0gW107XG5cdFx0JCgnOmNoZWNrYm94OmNoZWNrZWQnKS5lYWNoKGZ1bmN0aW9uKGkpe1xuXHRcdCAgY2hlY2tBcnJheVtpXSA9ICQodGhpcykudmFsKCk7XG5cdFx0fSk7XG5cdFx0Y29uc29sZS5sb2coY2hlY2tBcnJheSk7XG5cblx0XHRjb25zdCB1c2VySW5wdXQgPSAkKCcjbWVkaWFfX3NlYXJjaCcpLnZhbCgpO1xuXHRcdGFwcC5nZXRNZWRpYSh1c2VySW5wdXQpO1xuXHR9KTtcbn1cblxuYXBwLmRpc3BsYXlNZWRpYSA9IChhbGxNZWRpYSkgPT4ge1xuXHQvLyBUaGlzIG1ldGhvZCByZW1vdmVzIGNoaWxkIG5vZGVzIGZyb20gdGhlIHNlbGVjdGVkIGVsZW1lbnQocykuIEluIHRoaXMgY2FzZSB3ZSByZW1vdmUgdGhlIGRpdiB0aGF0IGNvbnRhaW5zIGFsbCBwcmV2aW91cyBzZXJhY2ggcmVzdWx0cy5cblx0JCgnLm1lZGlhX19jb250YWluZXInKS5lbXB0eSgpO1xuXG5cdGNvbnN0IHlvdXR1YmVNZWRpYSA9IGFsbE1lZGlhLmZpbHRlcigob25lTWVkaWEpID0+IHtcblx0XHRyZXR1cm4gb25lTWVkaWEueVVSTCAhPT0gbnVsbDtcblx0fSk7XG5cdGNvbnNvbGUubG9nKHlvdXR1YmVNZWRpYSk7XG5cdHlvdXR1YmVNZWRpYS5mb3JFYWNoKChzaW5nbGVNZWRpYSkgPT4ge1xuXHRcdC8vIENyZWF0ZSB2YXJpYWJsZXMgZm9yIGFsbCBodG1sIGVsZW1lbnRzIEknbGwgYmUgYXBwZW5kaW5nXG5cdFx0Y29uc3QgJG1lZGlhVGl0bGUgPSAkKCc8aDI+JykuYWRkQ2xhc3MoJ21lZGlhX190aXRsZScpLnRleHQoc2luZ2xlTWVkaWEuTmFtZSk7XG5cdFx0Y29uc3QgJG1lZGlhRGVzY3JpcHRpb24gPSAkKCc8cD4nKS5hZGRDbGFzcygnbWVkaWFfX2Rlc2NyaXB0aW9uJykudGV4dChzaW5nbGVNZWRpYS53VGVhc2VyKTtcblx0XHRjb25zdCAkbWVkaWFXaWtpID0gJCgnPGE+JykuYWRkQ2xhc3MoJ21lZGlhX193aWtpJykuYXR0cignaHJlZicsIHNpbmdsZU1lZGlhLndVcmwpLnRleHQoJ1dpa2kgUGFnZScpO1xuXHRcdGNvbnN0ICRtZWRpYVlvdVR1YmUgPSAkKCc8aWZyYW1lPicsIHtcblx0XHRcdGNsYXNzOiAnbWVkaWFfX3lvdXR1YmUnLFxuXHRcdFx0c3JjOiBzaW5nbGVNZWRpYS55VXJsLFxuXHRcdFx0aWQ6IHNpbmdsZU1lZGlhLnlJRCxcblx0XHRcdGZyYW1lYm9yZGVyOiAwLFxuXHRcdFx0YWxsb3dmdWxsc2NyZWVuOiB0cnVlLFxuXHRcdFx0aGVpZ2h0OiAzMTUsXG5cdFx0XHR3aWR0aDogNTYwXG5cdFx0fSk7XG5cdFx0JCgnLm1lZGlhX19jb250YWluZXInKS5hcHBlbmQoJG1lZGlhVGl0bGUsICRtZWRpYURlc2NyaXB0aW9uLCAkbWVkaWFXaWtpLCAkbWVkaWFZb3VUdWJlKTtcblx0fSk7XG59O1xuXG4kKGZ1bmN0aW9uKCkge1xuXHRhcHAuaW5pdCgpO1xufSk7Il19
