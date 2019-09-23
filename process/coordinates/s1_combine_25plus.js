const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');

const OUT_PATH = './output/over-25/results-combined/'
const IN_PATH = './output/over-25/results/'
let PUB_NAMES = [];
let GROUPED_FILES = [];
let GROUPED_COORDS = [];
let FLAT_COORDS = [];
let GROUPED_DIST = [];
let GROUPED_DUR = [];
let SUMMED_DIST = [];
let SUMMED_DUR = [];

// const PUB_NAMES = [
// 	'anchorinn',
// 	'angelinn',
// 	'barleymow',
// 	'bayhorse',
// 	'bellinn',
// 	'blackbull',
// 	'blackhorse',
// 	'blackhorseinn',
// 	'blacklion',
// 	'blacksmithsarms',
// 	'blackswan',
// 	'bluebell',
// 	'bluebellinn'
// ]

function stripFilename(filename) {
	let stripped = filename.split('-')[2]
	PUB_NAMES.push({stripped})
	PUB_NAMES = _.uniqBy(PUB_NAMES, 'stripped')
}

function loadGroupedFiles(file) {
	let filePath = `${IN_PATH}${file}`
	let raw = fs.readFileSync(`${filePath}`, 'utf-8')
	let parsedData = JSON.parse(raw)
	let rawCoordinates = parsedData.routes[0].geometry.coordinates
	let rawDuration = parsedData.routes[0].duration
	let rawDistance = parsedData.routes[0].distance

	GROUPED_COORDS.push(rawCoordinates)
	GROUPED_DUR.push(rawDuration)
	GROUPED_DIST.push(rawDistance)
}

function combineFiles(strippedName) {
	let pub = strippedName.stripped

	GROUPED_FILES = fs.readdirSync(IN_PATH).filter(d => d.includes(pub))
	GROUPED_FILES.map(loadGroupedFiles)
}

function combineMetrics() {
	FLAT_COORDS = [].concat.apply([], GROUPED_COORDS)
	SUMMED_DUR = GROUPED_DUR.reduce((a,b) => a + b, 0)
	SUMMED_DIST = GROUPED_DIST.reduce((a,b) => a + b, 0)
}

function replaceData(strippedName) {
	let pub = strippedName.stripped
	let filePath = `${IN_PATH}result-coordinates-${pub}-1.txt`
	let raw = fs.readFileSync(`${filePath}`, 'utf-8')
	let parsedData = JSON.parse(raw)
	parsedData.routes[0].geometry.coordinates = FLAT_COORDS
	parsedData.routes[0].duration = SUMMED_DUR
	parsedData.routes[0].distance = SUMMED_DIST

	let fileOut = `${OUT_PATH}result-coordinates-${pub}.txt`
	let output = JSON.stringify(parsedData)

	fs.writeFileSync(fileOut, output)
}

function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.txt'))

	files.map(stripFilename);
	PUB_NAMES.map(combineFiles)
	//console.log(PUB_NAMES[72])
	combineMetrics()

	PUB_NAMES.map(replaceData)
}

init();
