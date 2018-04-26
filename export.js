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

// iterate through each output json, remove .amenities array and replace with additional
// snake-cased properties with a YES/NO desigination for whether or not it exists for that property
const transformedData = [];
let contents = fs.readFileSync("output.json").toString().split("\n")
.forEach(line => {
    // for each amenity, add the snake_case property to obj with YES/NO value
    // total_meeting_space sometimes has a newline (\n\) character in it - remove it
    const obj = line ? JSON.parse(line) : {};
    transformedData.push(obj);
});

stringify(transformedData, { header: true, columns: columns }, (err, output) => {
    if (err) throw err;
    fs.writeFile(outputFile, output, (err) => {
        if (err) throw err;
        console.log(`Export of ${outputFile} complete`);
    });
});
