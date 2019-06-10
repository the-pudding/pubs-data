const fs = require('fs');
const d3 = require('d3');
const request = require('request');
const cheerio = require('cheerio');
let countyNameData = [];

const OUT_PATH = './output/'
const IN_PATH = './output/'
const COUNTRY_EXTS = ['england', 'northern-ireland', 'scotland', 'wales']

function getCountyNames(country) {
	const file = fs.readFileSync(`${IN_PATH}${country}.html`, 'utf-8');
	const $ = cheerio.load(file)

	$('#content')
		.each((i, el) => {
			const infoContainer = $(el).find('.gminformation')
			const children = infoContainer.find('a')
			children.each((i, el) => {
				const countyLink = $(el).attr('href')
				if (countyLink) countyNameData.push({country, countyLink})
			})
		});
	console.log(countyNameData)
	return countyNameData;
}

function init() {
	COUNTRY_EXTS.map(getCountyNames)

	const allCounties = [].concat(...countyNameData).map(d => ({
		...d
	}));

	const csv = d3.csvFormat(allCounties);
	fs.writeFileSync(`${OUT_PATH}/counties.csv`, csv)
}

init();
