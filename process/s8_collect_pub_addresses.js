const fs = require('fs');
const d3 = require('d3');
const request = require('request');
const cheerio = require('cheerio');
let pubAddressData = [];

const OUT_PATH = './output/'
const IN_PATH = './output/pubHTML/'

function getPubAddresses(d) {
	let pubID = d.replace('.html', '');
	pubID = pubID.replace('pub', '');

	return new Promise((resolve, reject) => {
		const file = fs.readFileSync(`${IN_PATH}${d}`, 'utf-8');
		const $ = cheerio.load(file);

		$('#pubcard')
			.each((i, el) => {
				const pubName = $(el).find('.pubname').text()
				const pubAddress = $(el).find('.pubaddress')
				const pubStreet = pubAddress.find('.address')
				const pubTown = pubAddress.find('.town')
				const pubPostCode = pubAddress.find('.postcode')

				if (pubName) pubAddressData.push({pubName, pubID, pubStreet, pubTown, pubPostCode})
			})

		resolve();	
	})
}

async function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.html'));

	//files.map(getPubAddresses)

	let i = 0

	for (const d of files) {
		console.log(i)
		try {
			await getPubAddresses(d);
		} catch (error) {
			console.log(error);
		}
		i += 1;
	}

	console.log(pubAddressData)

	// const allAddresses = [].concat(...pubAddressData).map(d => ({
	// 	...d
	// }));
	//
	// const csv = d3.csvFormat(allAddresses);
	// fs.writeFileSync(`${OUT_PATH}/pubAddresses.csv`, csv)
}

// async function init() {
// 	loadData(IN_PATH)
// 	const splitData = pubs.slice(0,3)
// 	//getDistrictHTML(splitData)
//
// 	let i = 0;
//
// 	for (const d of pubs) {
//       console.log(i);
//       try {
//           await getDistrictHTML(d);
//       } catch (error) {
//           console.log(error);
//       }
//       i += 1;
//   }
// }

init();
