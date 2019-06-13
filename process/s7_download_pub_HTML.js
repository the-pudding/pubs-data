const fs = require('fs');
const d3 = require('d3');
const request = require('request');

const IN_PATH = './output/pubs.csv'
const OUT_PATH = './output/pubHTML'
const BASE_URL = `https://www.pubsgalore.co.uk`
let pubs = []

function loadData(filename) {
	let raw = fs.readFileSync(filename, 'utf-8')
	let csv = d3.csvParse(raw)
	pubs = csv
}

function getDistrictHTML(d) {
		let pubLink = d.link
		let pubID = pubLink.split('/')[2]

		return new Promise((resolve, reject) => {
			const filepath = `${OUT_PATH}/pub${pubID}.html`
			const exists = fs.existsSync(filepath)

			if (exists) resolve();
			else {
				const PUB_URL = `${BASE_URL}${pubLink}`
				request(PUB_URL, (err, response, body) => {
					if (err) reject(err)
					else {
						fs.writeFileSync(filepath, body);
						resolve();
					}
				})
			}
	})
}

async function init() {
	loadData(IN_PATH)
	const splitData = pubs.slice(0,3)
	//getDistrictHTML(splitData)

	let i = 0;

	for (const d of pubs) {
      console.log(i);
      try {
          await getDistrictHTML(d);
      } catch (error) {
          console.log(error);
      }
      i += 1;
  }
}

init();
