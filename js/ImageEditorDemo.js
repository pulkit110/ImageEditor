jQuery(document).ready(function () {
	
	
	var imageEditorMenuInlineEdits = fluid.inlineEdits(".fl-image-editor-menu", {
		selectonEdit: true
	});
    	    
    	var myImageEditor = fluid.imageEditor("#image-space", {
    		demo: true,
    		demoImageURL: "../temp/DemoImage.jpg",
    		menuInlineEdits: imageEditorMenuInlineEdits
    	});
    	
    	/*
    // Load the Uploader's template via AJAX and inject it into this page.
    var templateURLSelector = "../../uploader/html/Uploader.html .fl-uploader";
    $("#uploader-contents").load(templateURLSelector, null, function () {
    
    	var imageEditorMenuInlineEdits = fluid.inlineEdits(".fl-image-editor-menu");
    	    
    	var myImageEditor = fluid.imageEditor("#image-space", {
    		demo: true,
    		demoImageURL: "../temp/DemoImage.jpg",
    		menuInlineEdits: imageEditorMenuInlineEdits
    	});
    	
    	
        // Initialize the Uploader
        var myUpload = fluid.uploader(".flc-uploader", {
            components: {
                strategy: {
                    options: {
                        flashMovieSettings: {
                            flashURL: "../../../lib/swfupload/flash/swfupload.swf",
                            flashButtonImageURL: "../../uploader/images/browse.png"
                        }
                    }
                }
            },
            queueSettings: {
                // Set the uploadURL to the URL for posting files to your server.
                uploadURL: "../uploader.php?session=tempSession"
            },
            listeners: {
                onFileSuccess: function (file, responseText, xhr) {
                	alert(responseText);

                	myImageEditor.setImage(responseText);
                },
                onFileError: function (file, error, status, xhr) {
                	alert(error);
                	  // example assumes that the server code passes the reason of the failure in the xhr
                    $('#server-error').append(file.name + " - " + xhr.responseText + "<br />");
                },
                afterUploadComplete: function () {
                	//alert("Uploder next step");
                }
            }
        });
    });*/
});