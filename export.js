"use strict";

const readline = require('readline');
const fs = require('fs');
const stringify = require("csv-stringify");

console.log("Beginning export...");

const outputFile = "output.csv";

const columns = {
    job_title: "Job Title",
    company_name: "Company Name",
    company_location: "Company Location"
};

const transformedData = [];
const jobs = {};
let contents = fs.readFileSync("output.json").toString().split("\n")
.filter(line => line.toLowerCase().includes("merchand"))
.forEach(line => {
    if (!jobs[line]) {
        jobs[line] = true;
        const obj = line ? JSON.parse(line) : {};
        transformedData.push(obj);
    }
});

stringify(transformedData, { header: true, columns: columns }, (err, output) => {
    if (err) throw err;
    fs.writeFile(outputFile, output, (err) => {
        if (err) throw err;
        console.log(`Export of ${outputFile} complete`);
    });
});
