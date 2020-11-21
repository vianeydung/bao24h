// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');

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
        maxRequestsPerCrawl: 100, // Limitation for only 10 requests (do not use if you want to crawl all links)
    });
    // Run the crawler
    await crawler.run();
});
