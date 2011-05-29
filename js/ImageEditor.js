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
        that.locate("resizeButton").click(function () {
        	//TODO: Bind resize event
            //that.start();
        });

        that.locate("cropButton").click(function () {
            setupCrop(that);
        });
    };

    var setupCrop = function (that) {
    	if (that.cropStarted) {
    		that.cropStarted = false;
    		enableElement(that, that.resizeButton);
    		clearInterval(that.cropperID);
    		clear (that);
    		drawImage (that);
    		Cropper.reset();
    	} else {
    		disableElement(that, that.resizeButton);
    		that.cropStarted = true;
			Cropper.init(that);	
    	}
    	
    }
    
    function clear(that) {
		that.imageCanvas.get()[0].getContext('2d').clearRect(0, 0, that.imageCanvas.width, that.imageCanvas.height);
	}
	
	function drawImage (that) {
		var imageCanvas = that.imageCanvas.get()[0];
		var imageCanvasContext = imageCanvas.getContext('2d');	// Obtain the context
		
		// Maintain aspect ratio while resizing larger image to smaller canvas.
		if (that.image.height > imageCanvas.height || that.image.width > imageCanvas.width) {
			var heightRatio = that.image.height/imageCanvas.height;
			var widthRatio = that.image.width/imageCanvas.width;
			
			that.resizeFactor = (heightRatio < widthRatio)?widthRatio:heightRatio;
			
			that.imageX = (imageCanvas.width - that.image.width/that.resizeFactor)/2;
			that.imageY = (imageCanvas.height - that.image.height/that.resizeFactor)/2;
			
			imageCanvasContext.drawImage(that.image, that.imageX, that.imageY, that.image.width/that.resizeFactor, that.image.height/that.resizeFactor);
			
		} else {
			that.resizeFactor = 1;
			imageCanvasContext.drawImage(img, 0, 0);
		}
	}
	
    var setupImageEditor = function (that) {
        
    	// Inject canvas element to the container
    	//that.container.append('<canvas class=\"flc-image-canvas\" id =\"fl-image-canvas\"></canvas>');
    	that.imageCanvas = that.locate("imageCanvas");
    	that.menuBar = that.locate("menuBar");
    	that.resizeButton = that.locate("resizeButton");
    	that.cropButton = that.locate("cropButton");
    	
    	that.cropStarted = false;
    	
    	that.imageCanvas.addClass (that.options.styles.border);
    	
    	disableElement(that, that.cropButton);
    	disableElement(that, that.resizeButton);
    	
    	bindDOMEvents(that);
    	
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

        setupImageEditor(that);
        
        that.setImage = function (imageURL) {
        	
        	that.image = new Image();		// Create a new img element
        	
        	that.image.onload = function() {

        		drawImage (that);
        		
        		enableElement(that, that.cropButton);
        		enableElement(that, that.resizeButton);
        	}
        	that.image.src = imageURL;			// Set the source path
        }
        
		//that.displayElement.hide();


        return that;
    };

    fluid.defaults("fluid.imageEditor", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            imageCanvas: ".flc-image-canvas", // required, the canvas element that shows the image
            menuBar: ".flc-menu-bar", //required, provides different functions
            resizeButton: ".flc-image-editor-button-resize", //required, Resize Button
            cropButton: ".flc-image-editor-button-crop" //required, Crop Button
        },
        
        styles: {
            disabled: "fl-image-editor-disabled",
            hidden: "fl-image-editor-hidden",
            dim: "fl-image-editor-dim",
            border: "fl-image-editor-border"
        },
        
        //TODO: Change as needed
        strings: {
            //Empty value for ariaBusyText will default to aria-valuenow.
            ariaBusyText: "Progress is %percentComplete percent complete",
            ariaDoneText: "Progress is complete."
        },
        
        // progress display and hide animations, use the jQuery animation primatives, set to false to use no animation
        // animations must be symetrical (if you hide with width, you'd better show with width) or you get odd effects
        // see jQuery docs about animations to customize
        showAnimation: {
            params: {
                opacity: "show"
            }, 
            duration: "slow",
            //callback has been deprecated and will be removed as of 1.5, instead use onProgressBegin event 
            callback: null 
        }, // equivalent of $().fadeIn("slow")
        
        hideAnimation: {
            params: {
                opacity: "hide"
            }, 
            duration: "slow", 
            //callback has been deprecated and will be removed as of 1.5, instead use afterProgressHidden event 
            callback: null
        }, // equivalent of $().fadeOut("slow")
        
        events: {            
            onProgressBegin: null,
            afterProgressHidden: null            
        },

        minWidth: 5, // 0 length indicators can look broken if there is a long pause between updates
        delay: 0, // the amount to delay the fade out of the progress
        speed: 200, // default speed for animations, pretty fast
        animate: "forward", // suppport "forward", "backward", and "both", any other value is no animation either way
        initiallyHidden: true, // supports progress indicators which may always be present
        updatePosition: false
    });
    //we'll put our default options here

})(jQuery, fluid_1_4);