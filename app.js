const puppeteer = require("puppeteer");
const Queue = require("bull");
const $ = require("cheerio");
const fs = require("fs");
const uuidv4 = require("uuid/v4");

//Initiating the queue
var ceneoScrapingQueue = new Queue("ceneoScrapingQueue", {
  redis: { port: 6379, host: "127.0.0.1" }
});

const data = {
  urls: ["https://www.ceneo.pl/76367847"]
};

const options = {};

//Adding a job to the queue
ceneoScrapingQueue.add(data, options);

ceneoScrapingQueue.process(async job => {
  await scrapeCeneoData(job.data.urls);
});

function scrapeCeneoData(urlsArr) {
  return new Promise(async (resolve, reject) => {
    const urls = urlsArr;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    //An array with data of evry passed page
    let result = [];

    for (let i = 0; i < urls.length; i++) {
      await page.goto(urls[i], { waitUntil: "networkidle2" });

      //Click on buttom show more offers and wait page loading
      await page.click("a.remaining-offers-trigger.js_remainingTrigger");

      await page.waitForSelector("tr.js_remaining");

      //All data we scrape on this link will be here
      let jsonObject = {};

      //Getting product name. Dont see any reason to use cheerio here so I just use textContext
      let productNameEl = await page.$("h1.product-name.js_product-h1-link");
      const name = await page.evaluate(el => el.textContent, productNameEl);
      jsonObject.productName = name.trim();

      //Getting price
      let productPriceEl = await page.$eval(
        "span.offer-summary > span.price-format > span.price",
        element => {
          return element.innerHTML;
        }
      );

      const price =
        $("span.value", productPriceEl).text() +
        $("span.penny", productPriceEl).text();

      jsonObject.price = parseFloat(price);

      //Getting total offers, all offers array, min, max
      //Thanks to genius who have chosen to place offers in two different tables I need to load whole page wrapper
      let productTotalOffersEl = await page.$eval(
        "div.page-tab-content.click",
        element => {
          return element.innerHTML;
        }
      );

      const trElSelector =
        "tr.product-offer.clickable-offer.js_offer-container-click.js_product-offer";

      let allOffers = [];

      $(trElSelector, productTotalOffersEl).each(function(elem) {
        let offerObj = {};
        const retailer = $(this).data("shopurl");
        offerObj.retailer = retailer;
        const strPrice =
          $(this)
            .find("span.price > span.value")
            .text() +
          $(this)
            .find("span.price > span.penny")
            .text();
        const price = parseFloat(strPrice);
        offerObj.price = price;
        allOffers.push(offerObj);
        switch (retailer) {
          case "mediaexpert.pl":
            jsonObject.mediaexpertPrice = price;
            break;
          case "euro.com.pl":
            jsonObject.euroPrice = price;
            break;
          case "mediamarkt.pl":
            jsonObject.mediamarktPrice = price;
            break;
        }
      });

      jsonObject.totalOffers = allOffers.length;

      const maxPrice = Math.max.apply(
        Math,
        allOffers.map(function(o) {
          return o.price;
        })
      );

      const minPrice = Math.min.apply(
        Math,
        allOffers.map(function(o) {
          return o.price;
        })
      );

      jsonObject.maxPrice = maxPrice;
      jsonObject.minPrice = minPrice;

      jsonObject.allOffers = allOffers;

      //Pushing all data we scraped by link to arr
      result.push(jsonObject);
    }

    const filename = uuidv4();
    const dir = "data/";
    fs.readdir(dir, (err, files) => {
      const newFileNumber = files.length + 1;
      if (err) reject(err);

      fs.writeFile(
        dir + "n" + newFileNumber + "-" + filename + ".json",
        JSON.stringify(result, null, 4),
        "utf8",
        function(err) {
          if (err) reject(err);
        }
      );
    });

    await browser.close();

    resolve();
  });
}
