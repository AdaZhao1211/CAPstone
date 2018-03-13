console.log("linked");
function stepButtonClicked(){
  var b = document.getElementById("square");

  console.log(b.children);
  b.children.style.fill = "red";
}


/*
$(document).ready(function(){
  console.log("readys");
  var url = "https://godbolt.org/api/compiler/mips5/compile";
  var postData = '{"source":"// Type your code here, or load an example.\nint y = 6;\n\nint main(){\n    int x = 5;\n    x += 6;\n    return 1;\n    }\n","compiler":"mips5","options":{"userArguments":"","compilerOptions":{"produceGccDump":{},"produceCfg":false},"filters":{"binary":false,"execute":false,"labels":true,"directives":true,"commentOnly":true,"trim":true,"intel":true,"demangle":false}},"lang":"c++"}';
  $.ajax({
    type: "POST",
    url: url,
    data: postData,
    success: function(result){
      console.log(result);
    },
    dataType: "json"
  })
})
*/
