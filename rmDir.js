const rmdir = require("rimraf");
// rmdir("./build", function(error) {});
rmdir("./public/css", function(error) {
  console.log(error);
});
rmdir("./public/js", function(error) {
  console.log(error);
});
rmdir("./public/img", function(error) {
  console.log(error);
});
