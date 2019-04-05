// inspired by:  http://toddhayton.com/2015/03/20/scraping-with-casperjs/
// github:  https://github.com/thayton/casperjs-taleo-job-scraper/blob/master/scraper.js

const job = "merchandiser";
const jobLocation = "San Jose";
const searchUrl = "https://www.indeed.com/jobs?q=" + job + "&l=" + jobLocation;
var data = [];
var currentPage = 1;
var fs = require("fs");
var utils = require("utils");
var fileOutput = fs.open("output.json", 'w');

var casper = require("casper").create({
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        verbose: false,
        // userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/64.0.3282.186 Mobile/13B143 Safari/601.1.46",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36"
    }
}); // DONE

var getSelectedPage = function() {
    var elem = document.querySelector("div.pagination > b");
    return parseInt(elem.textContent);
}

var getCompanyData = function() {
    var jobCards = document.querySelectorAll("div.clickcard");
    var data = [];
    console.log("Found " + jobCards.length + " entries on page");
    for (var i=0; i<jobCards.length; i++) {
        var row = jobCards[i];
        var info = {};

        var jobTitle = row.querySelector("div.clickcard a[data-tn-element='jobTitle']");
        info["job_title"] = jobTitle.textContent.replace(/^\s*/, "");

        var companyNameA = row.querySelector("div.clickcard .company");
        var companyNameB = row.querySelector("div.clickcard .company a");
        var companyName = companyNameA || companyNameB;
        info["company_name"] = companyName.textContent.replace(/^\s*/, "");

        var companyLocation = row.querySelector("div.clickcard .location");
        info["company_location"] = companyLocation.textContent;
        data.push(info);
    }
    console.log(data);
    return data;
}

var processPage = function() {
    global.console.log("Started!");
    // step 1:  click Quick View to expand contents of all properties
    // casper.capture("screenshots/page" + currentPage);
    var results = this.evaluate(getCompanyData) || [];
    for (var c=0; c<results.length; c++) {
        fileOutput.writeLine(JSON.stringify(results[c]));
    }
    utils.dump(results);

    // step 2:  exit if we're finished
    // if (!this.exists("li[class^='VenueList__listItem']")) {
    //     return terminate.call(casper);
    // }

    // step 3:  click the next link to load more results
    currentPage++
    this.waitForSelector("a:last-child > span.pn > span.np", function() {
        this.thenClick("a:last-child > span.pn > span.np").then(function() {
            global.console.log("Clicking into next page...");
            this.waitFor(function() {
                return currentPage === this.evaluate(getSelectedPage);
            }, processPage, terminate);
        });
    }, terminate);
}

var terminate = function() {
    this.echo("Finishing scraping...").exit();
    fileOutput.close();
}

global.console.log("Starting scraping... " + searchUrl);
casper
    .on("error", function(msg){ this.echo("error: " + msg, "ERROR") })
    .on("page.error", function(msg, trace){ this.echo("Page Error: " + msg, "ERROR") })
    //.on("remote.message", function(msg){ this.echo("Info: " + msg, "INFO") })
    .start(searchUrl);
casper.waitForSelector(".pagination", processPage, terminate);
casper.run();
