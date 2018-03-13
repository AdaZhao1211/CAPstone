console.log("linked");
function stepButtonClicked(){
  var b = document.getElementById("square");

  console.log(b.children);
  b.children.style.fill = "red";
}
