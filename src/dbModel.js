
const mongoose = require('mongoose');
const config = process.env;
const CrawlSchema = mongoose.Schema({
  url: {type: String, required: true, index: true, unique: true},
  title: {type: String, required: true},
  description: {type: String, required: true},
  newsDate: {type: String, required: true},
  contents: {type: [String], required: true},
  createdAt: {type: Date, default: Date.now()},
})

const CrawlModel = mongoose.model(config.COLLECTION_NAME, CrawlSchema);

module.exports = {CrawlModel, CrawlSchema}


