const fs = require('fs');
const d3 = require('d3');
const request = require('request');
const cheerio = require('cheerio');

const OUT_PATH = './output/pubAddresses'
const IN_PATH = './output/pubHTML/'

function getPubAddresses(d) {
	let pubAddressData = [];
	let pubID = d.replace('.html', '');
	pubID = pubID.replace('pub', '');

	return new Promise((resolve, reject) => {
		const file = fs.readFileSync(`${IN_PATH}${d}`, 'utf-8');
		const $ = cheerio.load(file);

		const fileOut = `${OUT_PATH}/pubAdd_${pubID}.csv`
		const exists = fs.existsSync(fileOut)

		if (exists) resolve();
		else {
			$('#pubcard')
				.each((i, el) => {
					const pubName = $(el).find('.pubname').text()
					const pubAddress = $(el).find('.pubaddress')
					const pubStreet = pubAddress.find('.address').text()
					const pubTown = pubAddress.find('.town').text()
					const pubPostCode = pubAddress.find('.postcode').text()

					if (pubName) pubAddressData.push({pubName, pubID, pubStreet, pubTown, pubPostCode})
				})

				const allAddresses = [].concat(...pubAddressData).map(d => ({
					...d
				}));

				const csv = d3.csvFormat(allAddresses);
				fs.writeFileSync(`${OUT_PATH}/pubAdd_${pubID}.csv`, csv)

				resolve();
		}
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
