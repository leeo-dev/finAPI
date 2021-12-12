const express = require("express");
const app = express();
const PORT = 3000;

//prettier-ignore
app.listen(PORT || 5000, () => console.log(`Server is running on port ${PORT}`));
