const fs = require('fs');
const d3 = require('d3');
const request = require('request');

const IN_PATH = './output/counties.csv'
const OUT_PATH = './output/countyHTML'
const BASE_URL = `https://www.pubsgalore.co.uk`
let counties = []

function loadData(filename) {
	let raw = fs.readFileSync(filename, 'utf-8')
	let csv = d3.csvParse(raw)
	counties = csv
	//console.log(counties)
}

function getCountyHTML(data) {
	//console.log(data)
	data.map(d => {
		let countyLink = d.countyLink
		let county = countyLink.split('/')[2]
		console.log(county)

		return new Promise((resolve, reject) => {
			const COUNTY_URL = `${BASE_URL}${countyLink}`
			console.log(COUNTY_URL)
			request(COUNTY_URL, (err, response, body) => {
				fs.writeFileSync(`${OUT_PATH}/${county}.html`, body);
			})
		})
	})
}

function init() {
	loadData(IN_PATH)
	getCountyHTML(counties)
}

init();
