const fs = require('fs');
const d3 = require('d3');
const request = require('request');

const IN_PATH = './output/districts.csv'
const OUT_PATH = './output/districtHTML'
const BASE_URL = `https://www.pubsgalore.co.uk`
let districts = []

function loadData(filename) {
	let raw = fs.readFileSync(filename, 'utf-8')
	let csv = d3.csvParse(raw)
	districts = csv
}

function getDistrictHTML(data) {
	//console.log(data)
	data.map(d => {
		let districtLink = d.districtLink
		let district = districtLink.split('/')[2]
		console.log(district)

		return new Promise((resolve, reject) => {
			const DISTRICT_URL = `${BASE_URL}${districtLink}`
			console.log(DISTRICT_URL)
			request(DISTRICT_URL, (err, response, body) => {
				fs.writeFileSync(`${OUT_PATH}/${district}.html`, body);
			})
		})
	})
}

function init() {
	loadData(IN_PATH)
	getDistrictHTML(districts)
}

init();
