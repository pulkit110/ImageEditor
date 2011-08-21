/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global window, fluid_1_4:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_4 = fluid_1_4 || {};

/****************
 * Image Editor *
 ****************/

(function ($, fluid) {
	
	var enableElement = function (that, elm) {
		elm.prop("disabled", false);
		elm.removeClass(that.options.styles.dim);
	};
	var disableElement = function (that, elm) {
		elm.prop("disabled", true);
		elm.addClass(that.options.styles.dim);
	};
	var showElement = function (that, elm) {
		elm.removeClass(that.options.styles.hidden);
	};
	var hideElement = function (that, elm) {
		elm.addClass(that.options.styles.hidden);
	};
	
	var TYPE_RESIZE = 1;
	var TYPE_CROP = 2;

	var clearCanvas = function (that) {
		var imageCanvas = that.imageCanvas.get()[0];
		var imageCanvasContext = imageCanvas.getContext('2d');	// Obtain the context
		var h = imageCanvas.height;
		var w = imageCanvas.width;
		imageCanvasContext.clearRect(0, 0, w, h);
	};

	var drawImage = function (that) {
		var imageCanvas = that.imageCanvas.get()[0];
		var imageCanvasContext = imageCanvas.getContext('2d');	// Obtain the context
		
		if (!that.image) {
			return;
		}
		
		// Maintain aspect ratio while resizing larger image to smaller canvas.
		if (that.image.height > that.options.originalCanvasHeight || that.image.width > that.options.originalCanvasWidth) {
			var heightRatio = that.image.height / that.options.originalCanvasHeight;
			var widthRatio = that.image.width / that.options.originalCanvasHeight;
			that.resizeFactor = (heightRatio < widthRatio) ? widthRatio : heightRatio;
		} else {
			that.resizeFactor = 1;
		}

		imageCanvas.height = that.image.height / that.resizeFactor;
		imageCanvas.width = that.image.width / that.resizeFactor;

		that.imageX = 0;
		that.imageY = 0;

		imageCanvasContext.drawImage(that.image, that.imageX, that.imageY, that.image.width / that.resizeFactor, that.image.height / that.resizeFactor); // Draw image on canvas

	};
	
	/**
	 * Resize the image to new width and height
	 */
	var resize = function (that, resizeW, resizeH) {

		//Create canvas to get cropped image pixels
		var imageManipulationCanvas = document.createElement('canvas');
		imageManipulationCanvas.width = resizeW;
		imageManipulationCanvas.height = resizeH;

		var imageManipulationCtx = imageManipulationCanvas.getContext('2d');
		imageManipulationCtx.drawImage(that.image, 0, 0, resizeW, resizeH); // Draw resized image on temporary canvas
		var resizedImageDataURL = imageManipulationCanvas.toDataURL();	//get DataURL for cropped image
		return resizedImageDataURL;
	};
	
	/**
	 * Reset all tag strings
	 */
	var resetTagStrings = function (that) {
		that.locate("newTag").get(0).innerHTML = that.options.strings.addNewTag;
		that.locate("tagLocation").get(0).innerHTML = that.options.strings.location;
		that.locate("tagWidth").get(0).innerHTML = "0";
		that.locate("tagHeight").get(0).innerHTML = "0";
	};

	/**
	 * Hides all menu options and resets the already running actions.
	 */
	var hideAllOptions = function (that) {
		hideElement(that, that.locate("cropOptions"));
		hideElement(that, that.locate("resizeOptions"));
		hideElement(that, that.locate("tagOptions"));
		if (that.cropStarted) {
			that.cropper.reset(true);	//reset crop without actually cropping the image.
		}
		if (that.tagStarted) {
			resetTagStrings(that);
			that.tagger.doneTagging();
		}
		that.cropStarted = false;
		that.resizeStarted = false;
		that.tagStarted = false;
		
		clearCanvas(that);
		drawImage(that);
	};
	
	/**
	 * Setup the cropper
	 */
	var setupCrop = function (that) {
		if (!that.cropStarted) {
			hideAllOptions(that);
			showElement(that, that.locate("cropOptions"));
			that.cropStarted = true;
			that.cropper.init(that.imageCanvas.get()[0], that.resizeFactor, that.image, that.imageX, that.imageY);
		} else {
			hideAllOptions(that);
			that.cropStarted = false;
		}
	};
	
	/**
	 * Confirm crop action
	 */
	var confirmCrop = function (that) {
		hideElement(that, that.locate("cropOptions"));
		that.cropStarted = false;
		var croppingReturnValues = that.cropper.reset();
		var croppedImageDataURL = croppingReturnValues[0];
		that.croppingDimensions = croppingReturnValues[1];
		that.setImage(croppedImageDataURL, TYPE_CROP);
	};

	/**
	 * Setup the resizer
	 */
	var setupResize = function (that) {
		if (!that.resizeStarted) {
			hideAllOptions(that);
			showElement(that, that.locate("resizeOptions"));
			that.locate("resizeWidth").get(0).textContent = that.getImageWidth();
			that.locate("resizeHeight").get(0).textContent = that.getImageHeight();
			that.locate("resizeScale").get(0).textContent = '100%';
			that.resizeStarted = true;
		} else {
			hideAllOptions(that);
			that.resizeStarted = false;
		}
	};
	
	/**
	 * Confirm resize action 
	 */
	var confirmResize = function (that) {
		that.resizeStarted = false;
		hideElement(that, that.locate("resizeOptions"));
		var resizedImageDataURL, newH, newW;
		newW = parseFloat(that.locate("resizeWidth").get(0).textContent);
		newH = parseFloat(that.locate("resizeHeight").get(0).textContent);
		resizedImageDataURL = resize(that, newW, newH);
		that.setImage(resizedImageDataURL, TYPE_RESIZE);
	};

	/**
	 * Show existing annotations
	 */
	var showAnnotations = function (that) {
		if (that.tagger.getNbAnnotations() > 0) {
			that.tagger.showAnnotations();
			that.annotationsShown = true;
		}
	};

	/**
	 * Setup the tagger
	 */
	var setupTag = function (that) {
		if (!that.tagStarted) {
			hideAllOptions(that);
			showElement(that, that.locate("tagOptions"));
			hideElement(that, that.locate("newTagOptions"));
			//TODO hideElement(that, that.locate("showAnnotation"));
			showAnnotations(that);
			that.tagStarted = true;
		} else {
			resetTagStrings(that);
			hideAllOptions(that);
			that.tagStarted = false;
		}
	};

	/**
	 * Confirm the addition of new tag
	 */
	var confirmTag = function (that) {
		hideElement(that, that.locate("tagOptions"));
		that.tagStarted = false;
		clearCanvas(that);
		drawImage(that);
		that.tagger.confirmTagAdd(that.locate("newTag").get(0).innerHTML);
		resetTagStrings(that);
	};
	
	/**
	 * Add new tag to list
	 */
	var addTagToList = function (that, newTag) {
		var tag = document.createElement('li');
		tag.className += ' ' + that.options.styles.tagLi;
		tag.className += ' ' + that.options.styles.selectable;
		
		var tagSpan = document.createElement('span');
		tagSpan.className += ' ' + that.options.styles.inlineEditableText;
		tagSpan.innerHTML = newTag;
		
		var tagRemoveSpan = document.createElement('span');
		tagRemoveSpan.className += ' ' + that.options.styles.tagRemove;
		tagRemoveSpan.innerHTML = 'x';
		
		
		tag.appendChild(tagSpan);
		tag.appendChild(tagRemoveSpan);
		
		that.locate("newTagLi").before(tag);
		
		$(tag).mouseover(function () {
			that.tagger.highlightTag($(this).parent().children().index(this));
		});
		$(tag).mouseleave(function () {
			that.tagger.removeHighlights();
		});
		
		$(tagRemoveSpan).click(function () {
			that.tagger.deleteTag($(this).parent().parent().children().index($(this).parent()));
		});
		
		// Refresh the selectable tags list
		if (that.tagListSelectables) {
			that.tagListSelectables.refresh();
		}
	};
	
	/**
	 * Remove a deleted tag from list. 
	 */
	var removeTagFromList = function (that, tagIndex) {
		that.locate("tagLi").eq(tagIndex).remove();
	};
	
	/**
	 * Bind DOM Events
	 */
	var bindDOMEvents = function (that) {

		that.locate("cropButton").click(function () {
			setupCrop(that);
		});
		that.locate("tagButton").click(function () {
			setupTag(that);
		});
		that.locate("resizeButton").click(function () {
			setupResize(that);
		});
		that.locate("cropConfirm").click(function () {
			confirmCrop(that);
		});
		that.locate("resizeConfirm").click(function () {
			confirmResize(that);
		});
		that.locate("tagConfirm").click(function () {
			confirmTag(that);
		});
	};
	
	var updateResizeWidth = function (that, newWidth, oldWidth, isFixedRatio) {
		var oldResizeHeight = parseFloat(that.locate("resizeHeight").get(0).textContent); 
		if (isFixedRatio) {
			that.locate("resizeHeight").get(0).textContent = Math.round(newWidth / oldWidth * oldResizeHeight);
			that.locate("resizeScale").get(0).textContent = Math.round(newWidth / that.getImageWidth() * 100) + "%";
		}
	};
	
	var updateResizeHeight = function (that, newHeight, oldHeight, isFixedRatio) {
		var oldResizeWidth = parseFloat(that.locate("resizeWidth").get(0).textContent); 
		if (isFixedRatio) {
			that.locate("resizeWidth").get(0).textContent = Math.round(newHeight / oldHeight * oldResizeWidth);
			that.locate("resizeScale").get(0).textContent = Math.round(newHeight / that.getImageHeight() * 100) + "%";
		}
	};
	
	var cancelInlineEdits = function (that) {
		for (var i = 0; i < that.options.menuInlineEdits.length; ++i) {
			that.options.menuInlineEdits[i].cancel();
		}
	};

	/**
	 * Manage all inline edits. 
	 * We need to call other components on the change of dimensions through an inline edit.
	 */
	var manageInlineEdits = function (that, newValue, oldValue, editNode, viewNode) {
		// Cancel the edit if new value not defined
		if (newValue === "") {
			cancelInlineEdits(that);
			return;
		} 

		var newLocation;
		
		if (that.locate("cropLocation").get(0) === viewNode) {
			newLocation = newValue.split(',', 2);
			if (newLocation.length === 2) {
				that.cropper.setLocationX(parseFloat(newLocation[0]));
				that.cropper.setLocationY(parseFloat(newLocation[1]));
			}
		} else if (that.locate("cropWidth").get(0) === viewNode) {
			that.cropper.setWidth(parseFloat(newValue), that.locate("cropFixedRatioOn").get(0).checked);
		} else if (that.locate("cropHeight").get(0) === viewNode) {
			that.cropper.setHeight(parseFloat(newValue), that.locate("cropFixedRatioOn").get(0).checked);
		} else if (that.locate("resizeWidth").get(0) === viewNode) {
			updateResizeWidth(that, parseFloat(newValue), parseFloat(viewNode.textContent), true);
		} else if (that.locate("resizeHeight").get(0) === viewNode) {
			updateResizeHeight(that, parseFloat(newValue), parseFloat(viewNode.textContent), true);
		} else if (that.locate("resizeScale").get(0) === viewNode) {
			newValue = newValue.substring(0, (newValue.indexOf("%") === -1) ? newValue.length : newValue.indexOf("%"));
			that.locate("resizeWidth").get(0).textContent = newValue / 100 * that.getImageWidth();
			that.locate("resizeHeight").get(0).textContent = newValue / 100 * that.getImageHeight();
		} else if (that.locate("newTag").get(0) === viewNode) {
			that.startTagging(that);
		} else if (that.locate("tagLocation").get(0) === viewNode) {
			newLocation = newValue.split(',', 2);
			if (newLocation.length === 2) {
				that.tagger.setLocationX(parseFloat(newLocation[0]));
				that.tagger.setLocationY(parseFloat(newLocation[1]));
			}
		} else if (that.locate("tagWidth").get(0) === viewNode) {
			that.tagger.setWidth(parseFloat(newValue), false);
		} else if (that.locate("tagHeight").get(0) === viewNode) {
			that.tagger.setHeight(parseFloat(newValue), false);
		} 
	};
	
	var updateCropHeight = function (that, newHeight) {
		that.locate("cropHeight").get(0).textContent = Math.round(newHeight);
	};
	
	var updateCropWidth = function (that, newWidth) {
		that.locate("cropWidth").get(0).textContent = Math.round(newWidth);
	};
	
	var cropLocationX = 0;
	var cropLocationY = 0;
	
	var updateCropLocationX = function (that, newLocationX) {
		cropLocationX = newLocationX;
		that.locate("cropLocation").get(0).textContent = Math.round(cropLocationX) + ", " + Math.round(cropLocationY);
	};
	
	var updateCropLocationY = function (that, newLocationY) {
		cropLocationY = newLocationY;
		that.locate("cropLocation").get(0).textContent = Math.round(cropLocationX) + ", " + Math.round(cropLocationY);
	};
	
	var updateTagHeight = function (that, newHeight) {
		that.locate("tagHeight").get(0).textContent = Math.round(newHeight);
	};
	
	var updateTagWidth = function (that, newWidth) {
		that.locate("tagWidth").get(0).textContent = Math.round(newWidth);
	};
	
	var tagLocationX = 0;
	var tagLocationY = 0;
	
	var updateTagLocationX = function (that, newLocationX) {
		tagLocationX = newLocationX;
		that.locate("tagLocation").get(0).textContent = Math.round(tagLocationX) + ", " + Math.round(tagLocationY);
	};
	
	var updateTagLocationY = function (that, newLocationY) {
		tagLocationY = newLocationY;
		that.locate("tagLocation").get(0).textContent = Math.round(tagLocationX) + ", " + Math.round(tagLocationY);
	};

	/**
	 * Listen to events on tagger and cropper. 
	 */
	var bindComponentEvents = function (that) {
		var manageAllInlineEdits = function (newValue, oldValue, editNode, viewNode) {
			manageInlineEdits(that, newValue, oldValue, editNode, viewNode);
		};
		
		for (var i = 0; i < that.options.menuInlineEdits.length; ++i) {
			var menuInlineEdit = that.options.menuInlineEdits[i];
			menuInlineEdit.events.onFinishEdit.addListener(manageAllInlineEdits);
		}
		
		that.cropper.events.onChangeHeight.addListener(function (newHeight) {
			updateCropHeight(that, newHeight);
		});
		
		that.cropper.events.onChangeWidth.addListener(function (newWidth) {
			updateCropWidth(that, newWidth);
		});
		
		that.cropper.events.onChangeLocationX.addListener(function (newLocationX) {
			updateCropLocationX(that, newLocationX);
		});
		
		that.cropper.events.onChangeLocationY.addListener(function (newLocationY) {
			updateCropLocationY(that, newLocationY);
		});
		
		that.tagger.events.onChangeHeight.addListener(function (newHeight) {
			updateTagHeight(that, newHeight);
		});
		
		that.tagger.events.onChangeWidth.addListener(function (newWidth) {
			updateTagWidth(that, newWidth);
		});
		
		that.tagger.events.onChangeLocationX.addListener(function (newLocationX) {
			updateTagLocationX(that, newLocationX);
		});
		
		that.tagger.events.onChangeLocationY.addListener(function (newLocationY) {
			updateTagLocationY(that, newLocationY);
		});
		
		that.tagger.events.onAnnotationAdd.addListener(function (newTag) {
			addTagToList(that, newTag);
		});
		
		that.tagger.events.onAnnotationRemove.addListener(function (tagIndex) {
			removeTagFromList(that, tagIndex);
		});

		if (that.options.demo && that.options.demoImageURL) {
			that.setImage(that.options.demoImageURL);
		}
	};
	
	
	
	/**
	 * Instantiates a new Image Editor component.
	 * @param {Object} - container the DOM element in which the Image Editor lives
	 * @param {Object} - an object containing any of the available options:
	 * 						originalCanvasHeight - indicates the maximum height of canvas
	 * 						originalCanvasWidth - indicates the maximum width of canvas
	 */
	fluid.imageEditor = function (container, options) {
		var that = fluid.initView("fluid.imageEditor", container, options);

		var canvasKeyboardHandler = function () {
			if (that.cropStarted) {
				that.cropper.activateKeyboardAccessibility();
			} else if (that.tagStarted) {
				that.tagger.activateKeyboardAccessibility();
			}
		};
	
		/**
		 * Sets up an image editor instance. 
		 */
		var setupImageEditor = function () {

			// Make the container tabbable and activable
            that.locate("imageCanvas").fluid("tabbable");
            that.locate("imageCanvas").fluid("activatable", canvasKeyboardHandler);
            
            // Make the Tag List selectable through keyboard
            that.locate("tagList").fluid("tabbable");
            that.tagListSelectables = fluid.selectable(that.locate("tagList"), {
				onSelect: function (tagEl) {
					that.tagger.highlightTag($(tagEl).parent().children().index(tagEl));
					$(document).keydown(function (evt) {
						switch (evt.which) {
						case 46: 
							// DELETE Key
							that.tagger.deleteTag($(tagEl).parent().children().index(tagEl));
							
							$(document).unbind('keydown');
							// Refresh the selectable tags list
							if (that.tagListSelectables) {
								that.tagListSelectables.refresh();
							}
							break;							
						}
					});
				},
				onUnselect: function (tagEl) {
					that.tagger.removeHighlights();
					$(document).unbind('keydown');	//Unbind the keyboard handler 
				}
			});
            
			that.imageCanvas = that.locate("imageCanvas");
			
			that.cropStarted = false;
			that.tagStarted = false;
			that.resizeStarted = false;
			that.cropper = fluid.cropperUI(that.container);
			that.tagger = fluid.taggerUI(that.container);
			
			hideAllOptions(that);
			bindDOMEvents(that);
			bindComponentEvents(that);
		};
	
		/**
		 * @param imageURL - A URL where the image is present.
		 */
		that.setImage = function (imageURL, isResizedORCropped) {
			if (!isResizedORCropped) {
				that.tagger.reset();
			}
			clearCanvas(that);
			that.image = new Image();		// Create a new img element
			
			that.image.onload = function () {
				drawImage(that);
				if (isResizedORCropped === TYPE_RESIZE) {
					that.tagger.adjustTagsForResize(that.imageCanvas.width(), that.imageCanvas.height(), that.resizeFactor, that.image, that.imageX, that.imageY);
				} else if (isResizedORCropped === TYPE_CROP) {
					that.tagger.adjustTagsForCrop(that.imageCanvas.width(), that.imageCanvas.height(), that.resizeFactor, that.image, that.imageX, that.imageY, that.croppingDimensions);
				}
			};
			
			that.image.src = imageURL;			// Set the source path
		};
		
		/**
		 * Start a new tag
		 */
		that.startTagging = function (that) {
			that.tagger.init(that.imageCanvas, that.resizeFactor, that.image, that.imageX, that.imageY);
			showElement(that, that.locate("newTagOptions"));
		};
	
		/**
		 * Returns the width of current image. 
		 */
		that.getImageWidth = function () {
			return that.image.width;
		};
		
		/**
		 * Returns the height of current image. 
		 */
		that.getImageHeight = function () {
			return that.image.height;
		};
		
		that.hide = function () {
			hideElement(that, that.container);
		};
		
		that.show = function () {
			showElement(that, that.container);
		};
		
		that.getImage = function () {
			return that.image;
		};
		
		setupImageEditor();

		return that;
	};
	
	fluid.defaults("fluid.imageEditor", {
		gradeNames: "fluid.viewComponent",
		selectors: {
			imageCanvas: ".flc-image-canvas", // required, the canvas element that shows the image
			//menuBar: ".flc-menu-bar", //required, provides different functions
			resizeButton: ".flc-image-editor-button-resize", //required, Resize Button
			cropButton: ".flc-image-editor-button-crop", //required, Crop Button
			tagButton: ".flc-image-editor-button-tag", //required, Tag Button
			cropOptions: ".fl-image-editor-crop-options", //required, Crop Options
			resizeOptions: ".fl-image-editor-resize-options", //required, Resize Options
			tagOptions: ".fl-image-editor-tag-options", //required, Tag Options
			newTagOptions: ".fl-image-editor-new-tag-options", //required, New Tag Options
			cropConfirm: ".fl-image-editor-button-crop-confirm", //required, Crop Confirm Button
			resizeConfirm: ".fl-image-editor-button-resize-confirm", //required, Resize Confirm Button
			tagConfirm: ".fl-image-editor-button-tag-confirm", //required, Tag Confirm Button
			cropLocation: ".fl-image-editor-crop-location", //Crop Location
			cropWidth: ".fl-image-editor-crop-width", //Crop Width
			cropHeight: ".fl-image-editor-crop-height", //Crop Height
			tagLocation: ".fl-image-editor-tag-location", //Tag Location
			tagWidth: ".fl-image-editor-tag-width", //Tag Width
			tagHeight: ".fl-image-editor-tag-height", //Tag Height
			cropFixedRatioOn: ".fl-image-editor-crop-radio-fixed-ratio-on",
			//cropFixedRatioOff: ".fl-image-editor-crop-radio-fixed-ratio-off",
			resizeScale: ".fl-image-editor-resize-scale", //Resize Scale
			resizeWidth: ".fl-image-editor-resize-width", //Resize Width
			resizeHeight: ".fl-image-editor-resize-height", //Resize Height
			//showAnnotation: ".fl-image-editor-show-annotation",
			//showAnnotationsLink: ".flc-image-editor-show-annotations-link",
			newTag: ".fl-image-editor-tag-new",
			newTagLi: ".fl-image-editor-tag-new-li",
			existingTag: ".fl-image-editor-tag-existing",
			tagList: ".fl-image-editor-tag-list",
			tagLi: ".flc-image-editor-tag",
			tagRemove: ".flc-image-editor-tag-remove"
		},

		styles: {
			disabled: "fl-image-editor-disabled",
			hidden: "fl-image-editor-hidden",
			dim: "fl-image-editor-dim",
			border: "fl-image-editor-border",
			newTag: "fl-image-editor-tag-new",
			inlineEditableText: "flc-inlineEdit-text",
			tagLi: "flc-image-editor-tag",
			tagRemove: "flc-image-editor-tag-remove",
			selectable: "selectable"
		},

		buttons: {
			doneTagging: "Done Tagging",
			tag: "Tag"
		},

		strings: {
			//showAnnotation: "The image has 1 annotation",
			//showAnnotations: "The image has %s annotations",
			//showAnnotationsLink: "flc-image-editor-show-annotations-link",
			addNewTag: "create new tag",
			location: "use arrow keys or input location"
		},

		demo: false,
		originalCanvasHeight: 750,
		originalCanvasWidth: 750
	});

})(jQuery, fluid_1_4);