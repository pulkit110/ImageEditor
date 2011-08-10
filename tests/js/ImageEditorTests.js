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

		});
		
		// 2
		imageEditorTests.test("Cropping", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});

			jqUnit.notVisible("Crop Menu is initially hidden", ".fl-image-editor-crop-options");
			imageEditor.locate("cropButton").click();
			jqUnit.isVisible("Crop Menu is displayed after clicking on Crop", ".fl-image-editor-crop-options");
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
		imageEditorTests.test("Tagging", function () {

			//create a new image editor 
			imageEditor = fluid.imageEditor(container, {
				demo: true,
				demoImageURL: imageURL,
				menuInlineEdits: imageEditorMenuInlineEdits
			});

			jqUnit.notVisible("Tag Menu is initially hidden", ".fl-image-editor-tag-options");
			imageEditor.locate("tagButton").click();
			jqUnit.isVisible("Ta Menu is displayed after clicking on Tag", ".fl-image-editor-tag-options");
		});
		
	});
})(jQuery);