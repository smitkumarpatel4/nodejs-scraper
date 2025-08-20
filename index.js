const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeJobsFromIndexPages() {
  const allJobs = [];
  for (let i = 1; i <= 14; i++) {
    const jobIndexPage = await axios.get(
      `https://braigslist.vercel.app/jobs/${i}/`
    );

    const $ = cheerio.load(jobIndexPage.data);
    const jobs = $(".title-blob > a")
      .map((index, element) => {
        const title = $(element).text();
        const url = $(element).attr("href");
        return { title, url };
      })
      .get();
    allJobs.push(...jobs);
  }
  console.log(allJobs.length);
  return allJobs;
}

// Scrapes job descriptions from individual job pages - processes one at a time to avoid server blocking
async function scrapeJobDescription(allJobs) {
  // Parallel processing - faster but may trigger rate limiting
  // const allJobsWithDescriptionPromises = allJobs.map(async (job) => {
  //     const jobDescriptionPage = await axios.get(
  //         "https://braigslist.vercel.app/" + job.url
  //     );
  //     console.log("Processing job: " + job.url);
  //     const $ = cheerio.load(jobDescriptionPage.data);
  //     const jobDescription = $("div").text()
  //     //console.log(jobDescription);
  //     return { ...job, description: jobDescription };
  // });

  // Sequential processing - slower but safer for server limits
  let allJobsWithDescription = [];
  for (const job of allJobs) {
    const jobDescriptionPage = await axios.get(
      "https://braigslist.vercel.app/" + job.url
    );
    console.log("Processing job: " + job.url);
    const $ = cheerio.load(jobDescriptionPage.data);
    const jobDescription = $("div").text();
    allJobsWithDescription.push({ ...job, description: jobDescription });
  }

  console.log("Total jobs with descriptions: " + allJobsWithDescription.length);
  //const allJobsWithDescription = await Promise.all(allJobsWithDescriptionPromises);
  //console.log(allJobsWithDescription);
  return allJobsWithDescription;
}

async function Main() {
  const allJobs = await scrapeJobsFromIndexPages();
  await scrapeJobDescription(allJobs);
}

Main();
