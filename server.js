const express = require("express"); // Require Express Server 
const app = express(); // use Express for application 
const server = require("http").Server(app); // Create Custom Server 
const next = require("next"); // Require NEXT.JS
const dev = process.env.NODE_ENV !== "production"; // vi kör NPM RUN DEV och den ska inte köras med npm Start production
const nextApp = next({ dev }); // vi lägger {dev} i Next.js
const handle = nextApp.getRequestHandler(); // Create Handler
require("dotenv").config({ path: "./config.env" }); // hämtar DotEnv som Config 
const connectDb = require("./utilsServer/connectDb"); // MongoDB Connection genom Mongoose
connectDb(); // Kallar Functionen
app.use(express.json());  
const PORT = process.env.PORT || 3000; // Om Vi har port i DotEnv då kör vi denna annars appen lysnar på porten 3000

nextApp.prepare().then(() => { // Prepare Hela appen i netxApp // Hämtades denna function från NextJs.org Custom server 
  app.use("/api/signup", require("./api/signup"));
  app.use("/api/auth", require("./api/auth"));
  app.use('/api/search',require("./api/search"))
  app.use("/api/posts",require('./api/posts'))

  app.all("*", (req, res) => handle(req, res)); // app.all {*}, använd sig av getRequestHandler via NextApp

  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`Express server running ${PORT}`);
  });
});
