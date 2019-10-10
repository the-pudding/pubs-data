const fs = require('fs');
const d3 = require('d3');
const request = require('request');

const IN_PATH = './output/districts.csv'
const OUT_PATH = './output/districtHTML'
const BASE_URL = `https://www.pubsgalore.co.uk`
let districts = []
let missingDistricts = [];

function loadData(filename) {
	let raw = fs.readFileSync(filename, 'utf-8')
	let csv = d3.csvParse(raw)
	districts = csv
}

function returnHMTL(districtLink) {
	return new Promise((resolve, reject) => {
		const DISTRICT_URL = `${BASE_URL}${districtLink}`

		request(DISTRICT_URL, (err, response, body) => {
			if (!err) {
				if (response.statusCode !== 200) {
					let code = response.statusCode
					//console.log(code, districtLink)
					missingDistricts.push({code, districtLink})
					//console.log(missingDistricts)
					resolve()
				} else { resolve(body) }
			} else {
				console.log(error)
				missingDistricts.push({code: 'err', districtLink})
				resolve()
			}
		})
	})
}

async function getDistrictHTML(data) {
	let i = 0;
	for (d of data) {
		console.log(i)
		const districtLink = d.districtLink
		const district = districtLink.split('/')[2]
		const county = districtLink.split('/')[3]
		const html = await returnHMTL(districtLink)
		if (html) fs.writeFileSync(`${OUT_PATH}/${district}-${county}.html`, html);
		i += 1
	}
	// console.log(missingDistricts)
	//
	// const allMissing = [].concat(...missingDistricts).map(d => ({
	// 	...d
	// }));
	//
	// const csv = d3.csvFormat(missingDistricts);
	// fs.writeFileSync(`${OUT_PATH}/missing-districts.csv`, csv)
}

function init() {
	loadData(IN_PATH)
	getDistrictHTML(districts)
	// const files = fs.readdirSync(OUT_PATH).filter(d => d.includes('.html'))
	// //console.log(files)
	// const links = districts.map(d => d.districtLink.split('/')[2])
	// const uniq = [...new Set(links)]
	// console.log(files.length, districts.length, uniq.length)
	// // const missing = districts.filter(d => {
	// // 	const districtLink = d.districtLink
	// // 	const filename = districtLink.split('/')[2]
	// // 	const filenameHTML = `${filename}.html`
	// // 	if (filenameHTML === 'banff.html') console.log(filenameHTML)
	// // 	// return !files.includes(`${filename}.html`)
	// // 	return files.includes(filenameHTML)
	// // 	//return true
	// // })
	// // console.log(missing.length)
}

init();
