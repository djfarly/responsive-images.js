
/*
// @name: responsive-img.js
// @version: 1.1
// 
// 2015 - Jan Willem Henckel http://farly.de
// forked from: https://github.com/kvendrik/responsive-images.js
// (Copyright 2013-2014 Koen Vendrik, http://kvendrik.com)
// Licensed under the MIT license
*/


(function (factory) {
	if (typeof define === 'function' && define.amd) {
	    define(factory);
	} else {
	    factory();
	}
}(function () {

	function loadImageSrc(src, element, callback) {
		var	image = new Image();

		image.onload = function() {
			this.onload  = null;
			callback(image, element);
		};

		image.src = src;
	}

	var loadList = [];

	function updateLoadListFor(element, src) {
		var found = false;
		var noChange = false;
		loadList = loadList.map(function(loadListItem) {
			if (loadListItem.element === element && loadListItem.src !== src) {
				loadListItem.src = src;
				found = true;
			} else if (loadListItem.element === element && loadListItem.src === src) {
				noChange = true;
				found = true;
			}
			return loadListItem;
		});
		if (!found) loadList.push({'element': element, 'src': src});

		console.log('updated: loadlist - no change? ', noChange);

		return !noChange;
	}

	function sourceShouldStillChangeFor(element, src) {
		console.log('checking:', element, ' - should src still change to: ', src);
		console.log(loadList);
		return loadList.some(function(loadListItem) {
			if (loadListItem.element !== element) return false;
			if (loadListItem.src !== src) return false;
			if (element.src === loadListItem.src || element.style.backgroundImage === "url(" + loadListItem.src + ")") return false;
			return true;
		});
	}



	function makeImagesAndBackgroundImagesResponsive(){

		var viewport = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

		////////GET ALL RESPONSIVE ELEMENTS ////////

		var responsiveElements = document.querySelectorAll('[data-responsive]');

		if( responsiveElements.length === 0 ){
			return;
		}

		

		////////HASATTR FUNCTION////////

		var hasAttr;
		if(!responsiveElements[0].hasAttribute){ //IE <=7 fix

			hasAttr = function(el, attrName){ //IE does not support Object.Prototype
				return el.getAttribute(attrName) !== null;
			};

		} else {

			hasAttr = function(el, attrName){
				return el.hasAttribute(attrName);
			};

		}

		////////CHECK IF DISPLAY IS RETINA////////

		var retina = window.devicePixelRatio ? window.devicePixelRatio >= 1.2 ? 1 : 0 : 0;

		////////LOOP ALL RESPONSIVE ELEMENTS ////////

		for (var i = 0; i < responsiveElements.length; i++) {

				var responsiveElement = responsiveElements[i];


				//set attr names

				var srcAttr = ( retina && hasAttr(responsiveElement, 'data-src2x') ) ? 'data-src2x' : 'data-src';
				var baseAttr = ( retina && hasAttr(responsiveElement, 'data-src-base2x') ) ? 'data-src-base2x' : 'data-src-base';

				//check responsiveElement attributes

				if( !hasAttr(responsiveElement, srcAttr) ){
					continue;
				}

				var basePath = hasAttr(responsiveElement, baseAttr) ? responsiveElement.getAttribute(baseAttr) : '';


				//get attributes

				var queries = responsiveElement.getAttribute(srcAttr);



				//split defined query list

				var queries_array = queries.split(',');

				//loop queries

				for(var j = 0; j < queries_array.length; j++){

					//split each individual query
					var query = queries_array[j].replace(':','||').split('||');

					//get condition and response
					var condition = query[0];
					var response = query[1];


					//set empty variables
					var conditionpx;
					var bool;


					//check if condition is below
					if(condition.indexOf('<') !== -1){

						conditionpx = condition.split('<');

						if(queries_array[(j -1)]){

							var prev_query = queries_array[(j - 1)].split(/:(.+)/);
							var prev_cond = prev_query[0].split('<');

							bool =  (viewport <= conditionpx[1] && viewport > prev_cond[1]);

						} else {

							bool =  (viewport <= conditionpx[1]);

						}

					} else {

						conditionpx = condition.split('>');

						if(queries_array[(j +1)]){

							var next_query = queries_array[(j +1)].split(/:(.+)/);
							var next_cond = next_query[0].split('>');
							
							bool = (viewport >= conditionpx[1] && viewport < next_cond[1]);

						} else {

							bool = (viewport >= conditionpx[1]);

						}

					}


					//check if document.width meets condition
					if(bool){

						var isCrossDomain = response.indexOf('//') !== -1 ? 1 : 0;

						var newSource;
						if(isCrossDomain === 1){
							newSource = response;
						} else {
							newSource = basePath + response;
						}


						if (updateLoadListFor(responsiveElement, newSource)) {
							loadImageSrc(newSource, responsiveElement, function(image, element) {
								if(sourceShouldStillChangeFor(element, image.src)){
									if (element.nodeName === 'IMG' || element.nodeName === 'img') {
										element.setAttribute('src', image.src);
									} else {
										element.style.backgroundImage = "url(" + image.src + ")";
									}
									element.classList.add('image-loaded');
								}
							});
						}



						//break loop
						break;
					}

				}


		}

	}

	if(window.addEventListener){
		window.addEventListener('load', makeImagesAndBackgroundImagesResponsive, false);
		window.addEventListener('resize', makeImagesAndBackgroundImagesResponsive, false);
	} else { //ie <=8 fix
		window.attachEvent('onload', makeImagesAndBackgroundImagesResponsive);
		window.attachEvent('onresize', makeImagesAndBackgroundImagesResponsive);
	}

	makeImagesAndBackgroundImagesResponsive();
}));
