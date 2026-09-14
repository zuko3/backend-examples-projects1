const http = require("http");
const app = require("./app");
const port = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(port, function () {
  console.log("server stared for intellegent tourist apis....");
});
