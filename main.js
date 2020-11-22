// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".
const mongoose = require('mongoose');
const config = process.env;
mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(console.log('Connected MongoDb'))
  .catch(console.log)

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');
const {CrawlModel} = require('./dbModel');

Apify.main(async () => {
    // Get input of the actor.
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://apify.com/docs/actor/input-schema
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    // Create a RequestQueue
    const requestQueue = await Apify.openRequestQueue();
    // Define the starting URL
    await requestQueue.addRequest({ url: input.url });
    // Function called for each URL
    const handlePageFunction = async ({ request, $ }) => {
        console.log(request.url);
        const model = {};
        model.url = request.url;
        model.title = $('#article_title').text();
        model.newsDate = $('#article_body > div.updTm.updTmD.mrT5').text();
        model.description = $('#article_sapo').text();
        const tagsContent = $('#article_body > p');
        const contents = []
        tagsContent.each(async (i,elem) => {
            const lineText = $(elem).text();
            if(!lineText){
              $(elem).children().each(async (i, ele) => {
                if($(ele).is('img')){
                  contents.push(`{img:${$(ele).attr('src')}}`);
                }
              })
            } else if($(elem).find('strong').text()){
              console.log('content : strong', lineText);
              contents.push(`{strong:${lineText}}`);
            } else {
              contents.push(`${lineText}`);
            }
        });
        model.contents = contents;
        try {
          console.log('save db success');
          CrawlModel.create(model);
        } catch (error) {
          console.log(error);
        }
        // Add all links from page to RequestQueue
        await Apify.utils.enqueueLinks({
            $,
            requestQueue,
            baseUrl: request.loadedUrl,
        });
    };
    // Create a CheerioCrawler
    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        handlePageFunction,
        maxRequestsPerCrawl: 5, // Limitation for only 10 requests (do not use if you want to crawl all links)
    });
    // Run the crawler
    await crawler.run();
});
