const { ceneoScrapingQueue } = require("./queues/");
const { getArgsArr, producer } = require("./services/main");

const args = getArgsArr(process.argv);

//Here can be implemented validation for arguments but since there is 
//nothing in task about it I assume that all PDP urls are valid 

//I'm not sure yet If I uderstand fully what producer should do except getting arguments from CLI 
//so I just implemented it as small function which I reqire from main.js
const jobs = producer(args);

//console.log(jobs);

jobs.map(job => {
  //Adding a jobs to the queue
  ceneoScrapingQueue.add(job.data, job.options);
});
