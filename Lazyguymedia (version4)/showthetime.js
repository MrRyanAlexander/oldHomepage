function getGreeting(date){
return date;
}

window.onload=function(){
var date = new Date();
document.getElementById('#greeting').innerHTML = getGreeting(date);
}; 