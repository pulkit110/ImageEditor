/*
Copyright 2011 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
	$(document).ready(function () {
		var imageEditorTests = new jqUnit.TestCase("Image Editor Tests");

		var imageURL = "../../temp/DemoImage.jpg";
		var container = "#image-space";
		var imageEditor;

		var imageEditorMenuInlineEdits = fluid.inlineEdits(".fl-image-editor-menu", {
			selectonEdit: true
		});

		// 1
		imageEditorTests.test("Initialization", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});

			jqUnit.isVisible("Crop Button is initially visible", ".flc-image-editor-button-crop");
			jqUnit.isVisible("Resize Button is initially visible", ".flc-image-editor-button-resize");
			jqUnit.isVisible("Tag Button is initially visible", ".flc-image-editor-button-tag");
			jqUnit.isVisible("Canvas is visible", ".flc-image-canvas");
			jqUnit.isVisible("Component is visible before making call to hide", container);
			imageEditor.hide();
			jqUnit.notVisible("Component is not visible after making call to hide", container);
			imageEditor.show();
			jqUnit.isVisible("Component is again visible after making call to show", container);
			
			var image = imageEditor.getImage();
			jqUnit.assertNotNull("Image is not null", image);
			jqUnit.assertNotUndefined("Image is not undefined", image);
			jqUnit.assertNotNull("Image canvas is not null", imageEditor.imageCanvas);
			jqUnit.assertNotUndefined("Image canvas is not undefined", imageEditor.imageCanvas);
			
			jqUnit.assertFalse("cropStarted is not set", imageEditor.cropStarted);
			jqUnit.assertFalse("tagStarted is not set", imageEditor.cropStarted);
			jqUnit.assertFalse("resizeStarted is not set", imageEditor.cropStarted);
			
			jqUnit.assertNotNull("Cropper sub-component is not null", imageEditor.cropper);
			jqUnit.assertNotUndefined("Cropper sub-component is not undefined", imageEditor.cropper);
			jqUnit.assertNotNull("Tagger sub-component is not null", imageEditor.tagger);
			jqUnit.assertNotUndefined("Tagger sub-component is not undefined", imageEditor.tagger);

		});
		
		// 2
		imageEditorTests.test("Basic Cropper Tests", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});

			jqUnit.assertFalse("cropStarted is not set", imageEditor.cropStarted);
			jqUnit.notVisible("Crop Menu is initially hidden", ".fl-image-editor-crop-options");
			imageEditor.locate("cropButton").click();
			jqUnit.isVisible("Crop Menu is displayed after clicking on Crop", ".fl-image-editor-crop-options");
			jqUnit.assertTrue("cropStarted is set", imageEditor.cropStarted);
			imageEditor.locate("cropButton").click();
			jqUnit.notVisible("Crop Menu is again hidden", ".fl-image-editor-crop-options");
			jqUnit.assertFalse("cropStarted is not set", imageEditor.cropStarted);
		});
		
		// 2
		imageEditorTests.test("Detailed Cropper Tests", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});
			imageEditor.locate("cropButton").click();	//start Cropping
			
			jqUnit.isVisible("Crop Menu is displayed after clicking on Crop", ".fl-image-editor-crop-options");
			jqUnit.assertTrue("cropStarted is set", imageEditor.cropStarted);
			
			jqUnit.assertNotNull("Canvas is not null", imageEditor.cropper.canvas);
			jqUnit.assertNotUndefined("Canvas is not undefined", imageEditor.cropper.canvas);
			jqUnit.assertNotNull("Context is not null", imageEditor.cropper.context);
			jqUnit.assertNotUndefined("Context is not undefined", imageEditor.cropper.context);
			jqUnit.assertNotNull("resizeFactor is not null", imageEditor.cropper.resizeFactor);
			jqUnit.assertNotUndefined("resizeFactor is not undefined", imageEditor.cropper.resizeFactor);
			jqUnit.assertNotNull("image is not null", imageEditor.cropper.image);
			jqUnit.assertNotUndefined("image is not undefined", imageEditor.cropper.image);
			jqUnit.assertNotNull("imageX is not null", imageEditor.cropper.imageX);
			jqUnit.assertNotUndefined("imageX is not undefined", imageEditor.cropper.imageX);
			jqUnit.assertNotNull("imageY is not null", imageEditor.cropper.imageY);
			jqUnit.assertNotUndefined("imageY is not undefined", imageEditor.cropper.imageY);
			jqUnit.assertNotNull("cropperID is not null", imageEditor.cropper.cropperID);
			jqUnit.assertNotUndefined("cropperID is not undefined", imageEditor.cropper.cropperID);
			
			imageEditor.cropper.setLocationX(0);
			imageEditor.cropper.setLocationY(0);
			imageEditor.cropper.setWidth(0);
			imageEditor.cropper.setHeight(0);
			jqUnit.assertEquals("Crop location is updated in the field", "0, 0", imageEditor.locate("cropLocation").get(0).textContent);
			jqUnit.assertEquals("Crop width is updated in the field", "0", imageEditor.locate("cropWidth").get(0).textContent);
			jqUnit.assertEquals("Crop height is updated in the field", "0", imageEditor.locate("cropHeight").get(0).textContent);
			
			imageEditor.cropper.setLocationX(100);
			imageEditor.cropper.setLocationY(100);
			jqUnit.assertEquals("Crop location is updated in the field", "100, 100", imageEditor.locate("cropLocation").get(0).textContent);
			
			imageEditor.cropper.setLocationX(-100);
			imageEditor.cropper.setLocationY(-100);
			jqUnit.assertEquals("Crop location becomes 0, 0 for -ve location", "0, 0", imageEditor.locate("cropLocation").get(0).textContent);
			
			imageEditor.cropper.setLocationX(imageEditor.getImageWidth());
			imageEditor.cropper.setLocationY(imageEditor.getImageHeight());
			jqUnit.assertEquals("Crop location is updated in the field", imageEditor.imageCanvas.width() + ", " + imageEditor.imageCanvas.height(), imageEditor.locate("cropLocation").get(0).textContent);
			
			imageEditor.cropper.setLocationX(0);
			imageEditor.cropper.setLocationY(0);
			imageEditor.cropper.setWidth(imageEditor.getImageWidth());
			imageEditor.cropper.setHeight(imageEditor.getImageHeight());
			jqUnit.assertEquals("Crop width is updated in the field", imageEditor.imageCanvas.width() + "", imageEditor.locate("cropWidth").get(0).textContent);
			jqUnit.assertEquals("Crop height is updated in the field", imageEditor.imageCanvas.height() + "", imageEditor.locate("cropHeight").get(0).textContent);
			
			
		});
			
		// 3
		imageEditorTests.test("Resizing", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});

			jqUnit.notVisible("Resize Menu is initially hidden", ".fl-image-editor-resize-options");
			imageEditor.locate("resizeButton").click();
			jqUnit.isVisible("Resize Menu is displayed after clicking on Resize", ".fl-image-editor-resize-options");
		});
		
		// 4
		imageEditorTests.test("Basic Tagger Tests", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});

			jqUnit.assertFalse("tagStarted is not set", imageEditor.tagStarted);
			jqUnit.notVisible("Tag Menu is initially hidden", ".fl-image-editor-tag-options");
			imageEditor.locate("tagButton").click();
			jqUnit.isVisible("Tag Menu is displayed after clicking on Tag", ".fl-image-editor-tag-options");
			jqUnit.assertTrue("tagStarted is set", imageEditor.tagStarted);
			imageEditor.locate("tagButton").click();
			jqUnit.notVisible("Tag Menu is again hidden", ".fl-image-editor-tag-options");
			jqUnit.assertFalse("tagStarted is not set", imageEditor.tagStarted);
		});
		
		//5
		imageEditorTests.test("Detailed Tagger Tests", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});
			
			imageEditor.locate("tagButton").click();
			imageEditor.startTagging(imageEditor);
			
			jqUnit.assertNotNull("Canvas is not null", imageEditor.tagger.canvas);
			jqUnit.assertNotUndefined("Canvas is not undefined", imageEditor.tagger.canvas);
			jqUnit.assertNotNull("Context is not null", imageEditor.tagger.context);
			jqUnit.assertNotUndefined("Context is not undefined", imageEditor.tagger.context);
			jqUnit.assertNotNull("resizeFactor is not null", imageEditor.tagger.resizeFactor);
			jqUnit.assertNotUndefined("resizeFactor is not undefined", imageEditor.tagger.resizeFactor);
			jqUnit.assertNotNull("image is not null", imageEditor.tagger.image);
			jqUnit.assertNotUndefined("image is not undefined", imageEditor.tagger.image);
			jqUnit.assertNotNull("imageX is not null", imageEditor.tagger.imageX);
			jqUnit.assertNotUndefined("imageX is not undefined", imageEditor.tagger.imageX);
			jqUnit.assertNotNull("imageY is not null", imageEditor.tagger.imageY);
			jqUnit.assertNotUndefined("imageY is not undefined", imageEditor.tagger.imageY);
			jqUnit.assertNotNull("cropper is not null", imageEditor.tagger.cropper);
			jqUnit.assertNotUndefined("cropper is not undefined", imageEditor.tagger.cropper);
			
			imageEditor.tagger.setLocationX(0);
			imageEditor.tagger.setLocationY(0);
			imageEditor.tagger.setWidth(0);
			imageEditor.tagger.setHeight(0);
			jqUnit.assertEquals("Tag location is updated in the field", "0, 0", imageEditor.locate("tagLocation").get(0).textContent);
			jqUnit.assertEquals("Tag  width is updated in the field", "0", imageEditor.locate("tagWidth").get(0).textContent);
			jqUnit.assertEquals("Tag  height is updated in the field", "0", imageEditor.locate("tagHeight").get(0).textContent);
			
			imageEditor.tagger.setLocationX(100);
			imageEditor.tagger.setLocationY(100);
			jqUnit.assertEquals("Tag location is updated in the field", "100, 100", imageEditor.locate("tagLocation").get(0).textContent);
			
			imageEditor.tagger.setLocationX(-100);
			imageEditor.tagger.setLocationY(-100);
			jqUnit.assertEquals("Tag location becomes 0, 0 for -ve location", "0, 0", imageEditor.locate("tagLocation").get(0).textContent);
			
			imageEditor.tagger.setLocationX(imageEditor.getImageWidth());
			imageEditor.tagger.setLocationY(imageEditor.getImageHeight());
			jqUnit.assertEquals("Tag location is updated in the field", imageEditor.imageCanvas.width() + ", " + imageEditor.imageCanvas.height(), imageEditor.locate("tagLocation").get(0).textContent);
			
			imageEditor.tagger.setLocationX(0);
			imageEditor.tagger.setLocationY(0);
			imageEditor.tagger.setWidth(imageEditor.getImageWidth());
			imageEditor.tagger.setHeight(imageEditor.getImageHeight());
			jqUnit.assertEquals("Tag width is updated in the field", imageEditor.imageCanvas.width() + "", imageEditor.locate("tagWidth").get(0).textContent);
			jqUnit.assertEquals("Tag height is updated in the field", imageEditor.imageCanvas.height() + "", imageEditor.locate("tagHeight").get(0).textContent);
			
			var tagText = "Test Tag";
			imageEditor.tagger.confirmTagAdd(tagText);
			jqUnit.assertEquals("Tag count is one", 1, imageEditor.tagger.getNbAnnotations());
			var tagList = imageEditor.tagger.getTagList();
			jqUnit.assertEquals("Tag count is one", 1, tagList.length);
			jqUnit.assertEquals("Tag text is correctly set", tagText, tagList[0]);
			
			imageEditor.locate("tagButton").click();
			
			imageEditor.tagger.highlightTag(0);
			jqUnit.isVisible("The tag remove button is visible", ".fl-tagger-annotation-action-remove");
			jqUnit.isVisible("The tag text div is visible", ".fl-tagger-annotation");
			jqUnit.assertEquals("The tag text is correctly set", tagText, $(".fl-tagger-annotation").get(0).textContent);
			
			$(".fl-tagger-annotation-action-remove").click();
			jqUnit.assertEquals("Tag count is zero", 0, imageEditor.tagger.getNbAnnotations());

		});
		
	});
})(jQuery);