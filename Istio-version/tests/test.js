var start = Date.now();
for(var i = 0; i < 100000; i ++);
var end = Date.now();
var span = end - start;

console.log(span);