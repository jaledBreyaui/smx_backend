require('dotenv').config();
const PORT = process.env.PORT || 3001
const app = require('./app.js')



app.listen(PORT, "0.0.0.0", (err) => {
    if (err) console.log(err);
    console.log(`listening in port : 3001`);
})
