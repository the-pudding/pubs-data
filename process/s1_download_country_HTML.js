const fs = require('fs');
const d3 = require('d3');
const request = require('request');

const OUT_PATH = './output/'
const BASE_URL = `https://www.pubsgalore.co.uk/countries/`
const COUNTRY_EXTS = ['england', 'northern-ireland', 'scotland', 'wales']

async function getCountryHTML(country) {
	return new Promise((resolve, reject) => {
		const COUNTRY_URL = `${BASE_URL}${country}/`
		request(COUNTRY_URL, (err, response, body) => {
			fs.writeFileSync(`${OUT_PATH}/${country}.html`, body);
		})
	})
}

function init() {
	COUNTRY_EXTS.map(getCountryHTML)
}

init();
