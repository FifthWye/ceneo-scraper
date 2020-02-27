const Queue = require("bull");
const { ceneoScrapingJob } = require("../jobs");
const fs = require("fs");

//Initiating the queue
const ceneoScrapingQueue = new Queue("ceneoScrapingQueue", {
  redis: { port: 6379, host: "127.0.0.1" }
});

ceneoScrapingQueue.process(async job => {
  return await ceneoScrapingJob(job.data.url);
});

ceneoScrapingQueue.on("completed", (job, result) => {
  const dir = "src/data/ceneoScraperData/";
  fs.readdir(dir, err => {
    const newFileName = job.data.url.match(/[^\/]+$/)[0];
    if (err) console.log(err);

    fs.writeFile(
      dir + newFileName + ".json",
      JSON.stringify(result, null, 4),
      "utf8",
      function (err) {
        if (err) reject(err);
      }
    );
  });
});

module.exports = ceneoScrapingQueue;
