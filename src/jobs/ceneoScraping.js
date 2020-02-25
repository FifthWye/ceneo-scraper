const $ = require("cheerio");
const puppeteer = require("puppeteer");
const {
  getMaxObjAttributeInArr,
  getMinObjAttributeInArr
} = require("../services/main");
const { getElText } = require("../services/scrape");

module.exports = function scrapeCeneoData(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: "networkidle2" });

      //Click on buttom show more offers and wait page loading
      await ceneoPrepareForScraping(page);

      //All data we scrape on this link will be here
      let jsonObject = {};

      //Getting product name
      jsonObject.productName = await getElText(
        "h1.product-name.js_product-h1-link",
        page
      );

      //Getting price
      jsonObject.price = await ceneoGetPrice(page);

      //Getting total offers, all offers array
      const allOffers = await ceneoGetAllOffers(page);

      //Getting speciific stores prices
      const specificStoresPrices = ceneoGetSpecifcStoresPrices(allOffers);
      jsonObject = { ...jsonObject, ...specificStoresPrices };

      //Calculate total offers amount according on allOffers array length
      jsonObject.totalOffers = allOffers.length;

      //Getting max price
      jsonObject.maxPrice = getMaxObjAttributeInArr("price", allOffers);

      //Getting min price
      jsonObject.minPrice = getMinObjAttributeInArr("price", allOffers);

      //Assign all offers array to final object
      jsonObject.allOffers = allOffers;

      await browser.close();

      resolve(jsonObject);
    } catch (error) {
      reject(error);
    }
  });
};

async function ceneoPrepareForScraping(page) {
  await page.click("a.remaining-offers-trigger.js_remainingTrigger");

  await page.waitForSelector("tr.js_remaining");
}

async function ceneoGetPrice(page) {
  let productPriceEl = await page.$eval(
    "span.offer-summary > span.price-format > span.price",
    element => {
      return element.innerHTML;
    }
  );

  const price =
    $("span.value", productPriceEl).text() +
    $("span.penny", productPriceEl).text();

  return parseFloat(price);
}

function ceneoGetSpecifcStoresPrices(arr) {
  let obj = {};

  arr.map(store => {
    switch (store.retailer) {
      case "mediaexpert.pl":
        obj.mediaexpertPrice = store.price;
        break;
      case "euro.com.pl":
        obj.euroPrice = store.price;
        break;
      case "mediamarkt.pl":
        obj.mediamarktPrice = store.price;
        break;
    }
  });

  return obj;
}

async function ceneoGetAllOffers(page) {
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
  });

  return allOffers;
}
