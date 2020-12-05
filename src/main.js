// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".
// const mongoose = require('mongoose');
// const config = process.env;
// mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
//   .then(console.log('Connected MongoDb'))
//   .catch(console.log)

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');
// const {CrawlModel} = require('./dbModel');
const {extractSelector} = require('./utils');

Apify.main(async () => {
    // Get input of the actor.
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://apify.com/docs/actor/input-schema
    // const input = await Apify.getInput();
    // const input = {
    //   url: 'https://www.24h.com.vn/tin-tuc-trong-ngay/truc-xuat-nhom-nguoi-trung-quoc-suyt-vuot-qua-bien-gioi-viet-nam-campuchia-c46a1205566.html',
    //   selTitle: '#article_title',
    //   selNewsDate: '#article_body > div.updTm.updTmD.mrT5',
    //   selDescription: '#article_sapo',
    //   selContentGroup: '#article_body > p',
    //   selImg: '#article_body > p > img',//#article_body > p:nth-child(8) > img
    //   selImgDesc: '#article_body > p.img_chu_thich_0407',
    // };
    const input = {
      url: 'https://vnexpress.net/biden-chinh-thuc-gianh-da-so-phieu-dai-cu-tri-4201950.html',
      selectors: {
        selTitle: 'section.section.page-detail.top-detail > div > div.sidebar-1 > h1',
        selNewsDate: 'section.section.page-detail.top-detail > div > div.sidebar-1 > div.header-content.width_common > span',
        selDescription: 'section.section.page-detail.top-detail > div > div.sidebar-1 > p',
        selContentParent: 'section.section.page-detail.top-detail > div > div.sidebar-1 > article',
        selContent:       'section.section.page-detail.top-detail > div > div.sidebar-1 > article > p',
        selImg:           'section.section.page-detail.top-detail > div > div.sidebar-1 > article > figure > div.fig-picture > picture > img',//#article_body > p:nth-child(8) > img
        selImgDesc:       'section.section.page-detail.top-detail > div > div.sidebar-1 > article > figure > figcaption > p',
      }
    };
    console.log(extractSelector(input.selectors));

    const requestList = await Apify.openRequestList('my-list', [
      { url: input.url },
    ]);
    // Create a RequestQueue
    // const requestQueue = await Apify.openRequestQueue();
    // Define the starting URL
    // await requestQueue.addRequest({ url: input.url });
    // Function called for each URL
    const handlePageFunction = async ({ request, $ }) => {
        console.log(request.url);
        const model = {};
        model.url = request.url;
        model.title = $(selTitle).text();
        console.log($(selTitle).text());
        model.newsDate = $(selNewsDate).text();
        model.description = $(selDescription).text();
        const contents = []
        const tagsContentParent = $(selContentParent);
        
        tagsContentParent.children().each(async (i,elem) => {
          const tagImg = $(elem).find('div.fig-picture > picture > img');
          const tagImgDesc = $(elem).find('figcaption > p');
          const tagContent = $(elem);
          if(tagImg.length > 0){
            contents.push(`{img:${$(tagImg).attr('src')}}`);
          }
          if(tagImgDesc.length > 0){
            contents.push(`{imgDesc:${$(tagImgDesc).text()}}`);
          }
          if(tagContent.is('p'))
          {
            contents.push(`${tagContent.text()}`);
          }
        });
        // const tagsContent = $(selContentGroup);
        // tagsContent.each(async (i,elem) => {
        //     const tagImg = $(elem).find('img');
        //     const tagImgDesc = $(elem).find('img');
        //     const lineText = $(elem).text();
        //     const isImgDesc = $(elem).attr('class') === 'img_chu_thich_0407';
        //     if(isImgDesc){
        //       contents.push(`{imgDesc:${lineText}}`);
        //     } else
        //     if($(tagImg).is('img')){
        //       contents.push(`{img:${$(tagImg).attr('src')}}`);
        //     } else if($(elem).find('strong').text()){
        //       console.log('content : strong', lineText);
        //       contents.push(`{strong:${lineText}}`);
        //     } else {
        //       contents.push(`${lineText}`);
        //     }
        // });
        model.contents = contents;
        try {
          console.log('save db success');
          console.log(model);
          // CrawlModel.create(model);
        } catch (error) {
          console.log(error);
        }
        // Add all links from page to RequestQueue
        // await Apify.utils.enqueueLinks({
        //     $,
        //     requestQueue,
        //     baseUrl: request.loadedUrl,
        // });
    };
    // Create a CheerioCrawler
    const crawler = new Apify.CheerioCrawler({
      requestList,
        handlePageFunction,
        maxRequestsPerCrawl: 10, // Limitation for only 10 requests (do not use if you want to crawl all links)
    });
    // Run the crawler
    await crawler.run();
});
