const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./Routes/auth");
const userRoute = require('./Routes/users')
const listRoute = require('./Routes/lists')
const movieRoute = require('./Routes/movies')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger-config')

const app = express();
// .env configuration
dotenv.config();
app.use(cors())
// mongodb connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Db connection successfull"))
  .catch((e) => console.log(e));

// it will accept json body when making request
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routing
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/lists", listRoute)
app.use("/api/movies", movieRoute)


// creating application
app.listen(8800, () => {
  console.log("backend server is running !");
});
