const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');

const OUT_PATH = './output/'
const IN_PATH = './output/pubAddresses/'
let combinedPubs = []

function processCSV(filename) {
	console.log(filename)
	let raw = fs.readFileSync(`${IN_PATH}${filename}`, 'utf-8')
	let csv = d3.csvParse(raw)
	let newdb = _.unionBy(combinedPubs, csv, 'pubName')
	combinedPubs = newdb
}

function stripSpaces(string) {
	newString = string.replace(/\s+/g,' ').trim()
	return(newString)
}

function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.csv'));

	_.each(files, filename => processCSV(filename))
	const clean = combinedPubs.map(d => ({
		...d,
		pubStreet: stripSpaces(d.pubStreet)
	}))
	const all = d3.csvFormat(combinedPubs)
	fs.writeFileSync(`${OUT_PATH}/combinedPubs.csv`, all)
}

init();
