const express = require('express');
const Blogs = require('./router/Blogs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use("/api", Blogs);

app.listen(PORT, () => console.log("Server is running on 8080"));