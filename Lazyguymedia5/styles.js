metadate

reference links

(css)
style 1
style 2
style 3 
style 4

header

body

//I start with the buttons and float them to the left
left_button1/style 1
left_button2/style 2
left_button3/style 3
left_button4/style 4
//changing the page styles, one button at a time
$('#styleButton1').click(function() {

$('.changeMe').removeClass();
$('.changeMe').addClass('style1');

});

$('#styleButton2').click(function() {

$('.changeMe').removeClass();
$('.changeMe').addClass('style2');

});

$('#styleButton3').click(function() {

$('.changeMe').removeClass();
$('.changeMe').addClass('style3');

});

$('#styleButton4').click(function() {

$('.changeMe').removeClass();
$('.changeMe').addClass('style4');

});

//the I add the right buttons and float them to the right

right_button1/current projects
right_button2/past projects

//now I add the main content and make sure it clears the floats
<div id="mainContent"><img src="400X250PX right float">content the the left of the image</div>

//now I create a footer for simple contact information and copyright info
<footer></footer>



