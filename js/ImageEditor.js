/*
Copyright 2008-2009 University of Toronto
Copyright 2008-2009 University of California, Berkeley
Copyright 2010-2011 OCAD University

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

    //we'll add some private methods here

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
        
        that.resizeRadioCustom.change(function () {
        	that.resizeRadioCustomFlag = true;
        	that.resizeRadioPercFlag = false;
            enableElement(that, that.widthSpinner);
    		enableElement(that, that.heightSpinner);
    		disableElement(that, that.percSpinner);
    		that.widthSpinner.get()[0].value = that.image.width;
    		that.heightSpinner.get()[0].value = that.image.height;
        });
        
        that.resizeRadioPerc.change(function () {
        	that.resizeRadioCustomFlag = false;
        	that.resizeRadioPercFlag = true;
            enableElement(that, that.percSpinner);
            disableElement(that, that.widthSpinner);
    		disableElement(that, that.heightSpinner);
			that.percSpinner.get()[0].value = 100;
        });
    };

    var setupCrop = function (that) {
    	if (that.cropStarted) {
    		that.cropStarted = false;
    		enableElement(that, that.resizeButton);
    		enableElement(that, that.tagButton);
    		var croppedImageDataURL = that.cropper.reset();
    		that.setImage(croppedImageDataURL);
    		
    	} else {
    		disableElement(that, that.resizeButton);
    		disableElement(that, that.tagButton);
    		that.cropStarted = true;
			that.cropper.init(that.imageCanvas.get()[0], that.resizeFactor, that.image, that.imageX, that.imageY);	
    	}
    	
    }
    
    var setupTag = function (that) {
    	if (that.tagStarted) {
    		//Done tagging
    		that.tagButton.text(that.options.buttons.tag);
    		that.tagStarted = false;
    		enableElement(that, that.cropButton);
    		enableElement(that, that.resizeButton);    		
    		that.tagger.doneTagging();
    		clearCanvas (that);
    		drawImage (that);
    		
    		that.annotationNbUpdater(that.tagger.getNbAnnotations());
    	} else {
    		//Initialize and start tagging
			hideElement(that, that.locate("showAnnotation"));
    		that.tagButton.text(that.options.buttons.doneTagging);
    		disableElement(that, that.resizeButton);
    		disableElement(that, that.cropButton);
    		that.tagStarted = true; 
			that.tagger.init(that.imageCanvas, that.resizeFactor, that.image, that.imageX, that.imageY);	
    	}
    }
    
    var setupResize = function (that) {

    	if (that.resizeStarted) {
    		that.resizeStarted = false;
    		
    		if (that.resizeRadioPercFlag) {
    			var resizedImageDataURL = resizeWithPerc (that, that.percSpinner.get()[0].value);
    			that.setImage(resizedImageDataURL);
    		} else if (that.resizeRadioCustomFlag) {
    			var resizedImageDataURL = resizeWithCustomWH (that, that.widthSpinner.get()[0].value, that.heightSpinner.get()[0].value);
    			that.setImage(resizedImageDataURL);
    		}
    		
    		enableElement(that, that.cropButton);
    		enableElement(that, that.tagButton);
    		hideElement (that, that.resizeOptions);    		
    	} else {
    		//uncheck radio buttons if already checked
    		that.resizeRadioCustom.get()[0].checked = false;
    		that.resizeRadioPerc.get()[0].checked = false;
    		
    		disableElement(that, that.cropButton);
    		that.resizeStarted = true;
    		showElement (that, that.resizeOptions);
    		disableElement(that, that.widthSpinner);
    		disableElement(that, that.heightSpinner);
    		disableElement(that, that.percSpinner);
    		disableElement(that, that.tagButton);	
    	}
    }
    
    var showAnnotations = function(that) {
    	that.tagger.showAnnotations();
    	that.annotationsShown = true;
    	that.locate("showAnnotationsLink").text("(hide)");
    }
    
    var hideAnnotations = function(that) {
    	that.tagger.hideAnnotations();
    	that.annotationsShown = false;
    	that.locate("showAnnotationsLink").text("(show)");
    }
    
    function clearCanvas(that) {
		var imageCanvas = that.imageCanvas.get()[0];
		var imageCanvasContext = imageCanvas.getContext('2d');	// Obtain the context
		var h = imageCanvas.height;
		var w = imageCanvas.width;
		imageCanvasContext.clearRect(0, 0, w, h);
	}
	
	function drawImage (that) {
		var imageCanvas = that.imageCanvas.get()[0];
		var imageCanvasContext = imageCanvas.getContext('2d');	// Obtain the context
		
		// Maintain aspect ratio while resizing larger image to smaller canvas.
		if (that.image.height > imageCanvas.height || that.image.width > imageCanvas.width) {
			var heightRatio = that.image.height/imageCanvas.height;
			var widthRatio = that.image.width/imageCanvas.width;
			that.resizeFactor = (heightRatio < widthRatio)?widthRatio:heightRatio;
		} else {
			that.resizeFactor = 1;
		}
		
		that.imageX = (imageCanvas.width - that.image.width/that.resizeFactor)/2;
		that.imageY = (imageCanvas.height - that.image.height/that.resizeFactor)/2;
		
		imageCanvasContext.drawImage(that.image, that.imageX, that.imageY, that.image.width/that.resizeFactor, that.image.height/that.resizeFactor); // Draw image on canvas

	}
	
	var resizeWithPerc = function (that, resizePerc) {
		
		var newW = that.image.width*resizePerc/100;
		var newH = that.image.height*resizePerc/100;
		//Create canvas to get cropped image pixels
		var imageManipulationCanvas = document.createElement('canvas');
		imageManipulationCanvas.width = newW;
		imageManipulationCanvas.height = newH;
		
		var imageManipulationCtx = imageManipulationCanvas.getContext('2d');
		imageManipulationCtx.drawImage(that.image, 0, 0, newW, newH); // Draw resized image on temporary canvas
		var resizedImageDataURL = imageManipulationCanvas.toDataURL();	//get DataURL for cropped image
		return resizedImageDataURL;
	}
	
	var resizeWithCustomWH = function (that, resizeW, resizeH) {
		
		//Create canvas to get cropped image pixels
		var imageManipulationCanvas = document.createElement('canvas');
		imageManipulationCanvas.width = resizeW;
		imageManipulationCanvas.height = resizeH;
		
		var imageManipulationCtx = imageManipulationCanvas.getContext('2d');
		imageManipulationCtx.drawImage(that.image, 0, 0, resizeW, resizeH); // Draw resized image on temporary canvas
		var resizedImageDataURL = imageManipulationCanvas.toDataURL();	//get DataURL for cropped image
		return resizedImageDataURL;
	}
	
	
    var setupImageEditor = function (that) {
        
    	// Inject canvas element to the container
    	//that.container.append('<canvas class=\"flc-image-canvas\" id =\"fl-image-canvas\"></canvas>');
    	that.imageCanvas = that.locate("imageCanvas");
    	that.menuBar = that.locate("menuBar");
    	that.resizeButton = that.locate("resizeButton");
    	that.cropButton = that.locate("cropButton");
    	that.tagButton = that.locate("tagButton");
    	that.widthSpinner = that.locate("widthSpinner");
    	that.heightSpinner = that.locate("heightSpinner");
    	that.percSpinner = that.locate("percSpinner");
    	that.resizeRadioCustom = that.locate("resizeRadioCustom");
    	that.resizeRadioPerc = that.locate("resizeRadioPerc");
    	that.resizeOptions = that.locate("resizeOptions");
    	
    	that.cropStarted = false;
    	that.tagStarted = false;
    	that.resizeStarted = false;
    	that.cropper = fluid.cropperUI(that.container);
    	that.tagger = fluid.taggerUI(that.container, {annotationNbUpdater: that.annotationNbUpdater});
    	
    	that.imageCanvas.addClass (that.options.styles.border);
    	
    	disableElement(that, that.cropButton);
    	disableElement(that, that.resizeButton);
    	
    	hideElement(that, that.resizeOptions);
    	
    	bindDOMEvents(that);
    	
    	if (that.options.demo && that.options.demoImageURL) {
    		that.setImage(that.options.demoImageURL);
    	}
        // Uploader uses application-style keyboard conventions, so give it a suitable role.
        //that.container.attr("role", "application");
    };
    
    /**
     * Instantiates a new Image Editor component.
     * 
     * @param {Object} container the DOM element in which the Image Editor lives
     * @param {Object} options configuration options for the component.
     */
    fluid.imageEditor = function (container, options) {
        var that = fluid.initView("fluid.imageEditor", container, options);

		that.setImage = function (imageURL) {
        	
        	that.tagger.reset();
        	clearCanvas(that);
        	that.image = new Image();		// Create a new img element
        	
        	that.image.onload = function() {

        		drawImage (that);
        		
        		enableElement(that, that.cropButton);
        		enableElement(that, that.resizeButton);
        	}
        	that.image.src = imageURL;			// Set the source path
       }
        
        that.annotationNbUpdater = function (nbAnnotations) {

	    	if (!that.tagStarted && nbAnnotations != 0) {
				showElement(that, that.locate("showAnnotation"));
				var showAnnotationLink = ' <a href="" class="' + that.options.strings.showAnnotationsLink + '">(' + ((that.annotationsShown)?'hide':'show') + ')</a>';
				if (nbAnnotations == 1) {
					that.locate("showAnnotation").html(that.options.strings.showAnnotation + showAnnotationLink);
				} else {
					that.locate("showAnnotation").html(that.options.strings.showAnnotations.replace("%s", nbAnnotations) + showAnnotationLink);
				}
				that.locate("showAnnotationsLink").bind("click", function() {
					if (that.annotationsShown) {
						hideAnnotations(that);
					} else {
						showAnnotations(that);
					}
					return false;
				});
			} else {
				that.annotationsShown = false;
				hideElement(that, that.locate("showAnnotation"));
			}
	    }
	    
        setupImageEditor(that);
        
		//that.displayElement.hide();

        return that;
    };

    fluid.defaults("fluid.imageEditor", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            imageCanvas: ".flc-image-canvas", // required, the canvas element that shows the image
            menuBar: ".flc-menu-bar", //required, provides different functions
            resizeButton: ".flc-image-editor-button-resize", //required, Resize Button
            resizeButton: ".flc-image-editor-button-resize", //required, Resize Button
            cropButton: ".flc-image-editor-button-crop", //required, Crop Button
            tagButton: ".flc-image-editor-button-tag", //required, Crop Button
            widthSpinner: ".flc-image-editor-resize-spinner-width", //required, Resize width spinner
            heightSpinner: ".flc-image-editor-resize-spinner-height", //required, Resize height spinner
            percSpinner: ".flc-image-editor-resize-spinner-percentage", //required, Resize height spinner
            resizeRadioCustom: ".flc-image-editor-resize-radio-custom", //required, Resize Custom radio button
            resizeRadioPerc: ".flc-image-editor-resize-radio-percentage", //required, Resize Percentage radio button
            resizeOptions: ".fl-image-editor-resize-options", //resize options div
            showAnnotation: ".fl-image-editor-show-annotation",
            showAnnotationsLink: ".flc-image-editor-show-annotations-link"
        },
        
        styles: {
            disabled: "fl-image-editor-disabled",
            hidden: "fl-image-editor-hidden",
            dim: "fl-image-editor-dim",
            border: "fl-image-editor-border"
        },
        
        buttons: {
        	doneTagging: "Done Tagging",
        	tag: "Tag"
        },
        
        //TODO: Change as needed
        strings: {
        	showAnnotation: "The image has 1 annotation",
        	showAnnotations: "The image has %s annotations",
        	showAnnotationsLink: "flc-image-editor-show-annotations-link",
            //Empty value for ariaBusyText will default to aria-valuenow.
            ariaBusyText: "Progress is %percentComplete percent complete",
            ariaDoneText: "Progress is complete."
        },
        
        demo: false
    });
    //we'll put our default options here

})(jQuery, fluid_1_4);