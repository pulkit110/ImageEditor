What Is Image Editor?
=====================
Image Editor is a fluid infusion component that allows basic image editing functions like
cropping, resize and tagging on images. It is currently in the very early stages of development
and is being carried out as a Google Summer of Code Project for the fluid project. There is a 
known list of bugs which I will be looking into shortly.


How Do I Get Image Editor?
==========================

You can download a source code release from Github:

    https://github.com/pulkit110/ImageEditor

	
Can I see Image Editor in Action?
=================================

You can see the current Image Editor in action by deploying it using a local server. Just
get the fluid infusion source from https://github.com/fluid-project/infusion and add 
ImageEditor as a component to the infusion/src/webapp/components/ directory. Additionally, 
Image Editor also depends on TaggerUI and CropperUI. You will have to get the components from
https://github.com/pulkit110/TaggerUI and https://github.com/pulkit110/CropperUI and put them 
in the components directory. 

After deploying fluid on local server, you can access the demo by opening ImageEditor/html/
ImageEditorDemo.html in the browser (preferably, Chrome and Firefox).


Where Can I See Other Infusion Components?
==========================================

We have a convenient, one-stop-shop for seeing all our components in action:

    http://fluidproject.org/products/infusion/infusion-demos/