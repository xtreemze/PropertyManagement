const rmdir = require("rimraf");
rmdir("./node_modules", function(error) {
  console.log(error);
});
