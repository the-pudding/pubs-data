const fs = require('fs');
const d3 = require('d3');
const request = require('request');
const cheerio = require('cheerio');
let districtNameData = [];

const OUT_PATH = './output/'
const IN_PATH = './output/countyHTML/'

function getDistrictLinks(filename) {
	const county = filename.replace('.html', '');
	const file = fs.readFileSync(`${IN_PATH}${filename}`, 'utf-8');
	const $ = cheerio.load(file);

	$('#townlist')
		.each((i, el) => {
			const districtContainer = $(el).find('li')

			districtContainer
				.each((i, el) => {
					const districtSpan = $(el).find('.postaltown')
					const districtLink = districtSpan.find('.townlink').attr('href')
					if (districtLink) districtNameData.push({county, districtLink})
				})
		});
}

function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.html'));

	files.map(getDistrictLinks)

	const allDistricts = [].concat(...districtNameData).map(d => ({
		...d
	}));

	const csv = d3.csvFormat(allDistricts);
	fs.writeFileSync(`${OUT_PATH}/districts.csv`, csv)
}

init();
