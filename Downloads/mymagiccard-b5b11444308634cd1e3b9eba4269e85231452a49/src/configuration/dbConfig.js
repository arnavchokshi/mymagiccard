const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://chokshiarnav:CnR7UHD6hGFxlSw9@majiccluster.edhrvjd.mongodb.net/majic_db?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB Atlas");
});

mongoose.connection.on("error", (err) => {
    console.log(`MongoDB Atlas connection error: ${err}`);
});
