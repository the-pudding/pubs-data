const fs = require('fs');
const d3 = require('d3');
const request = require('request');
const cheerio = require('cheerio');
let pubNameData = [];

const OUT_PATH = './output/'
const IN_PATH = './output/districtHTML/'

function getPubLinks(filename) {
	const district = filename.replace('.html', '');
	console.log(district)
	const file = fs.readFileSync(`${IN_PATH}${filename}`, 'utf-8');
	const $ = cheerio.load(file);

	$('#pagelist')
		.each((i, el) => {
			const pubOpenConatiner = $(el).find('.pubopen')

			pubOpenConatiner
				.each((i, el) => {
					const pubDetails = $(el).find('.publist')

					const name = pubDetails.find('a').text()
					const link = pubDetails.find('a').attr('href')

					if (pubDetails) pubNameData.push({name, link, district})
				})
		})

}

function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.html'));

	files.map(getPubLinks)

	const allPubs = [].concat(...pubNameData).map(d => ({
		...d
	}));

	const csv = d3.csvFormat(allPubs);
	fs.writeFileSync(`${OUT_PATH}/pubs.csv`, csv)
}

init();
