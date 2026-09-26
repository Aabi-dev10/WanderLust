const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL ="mongodb://127.0.0.1:27017/wanderLust";
main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});
 async function main() {
  await mongoose.connect(MONGO_URL);
};
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"68e292d612cea41a84b5d2a2"}));
    await Listing.insertMany(initData.data);
console.log("data was initiallized");
};
initDB();



