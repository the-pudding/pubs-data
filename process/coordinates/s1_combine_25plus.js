const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');

const OUT_PATH = './output/over-25/combined-test/'
const IN_PATH = './output/over-25/results-test/'
let PUB_NAMES = [];
let GROUPED_FILES = [];
let GROUPED_COORDS = [];
let GROUPED_DUR = [];
let GROUPED_DIST = [];

function stripFilename(filename) {
	let stripped = filename.split('-')[2]
	PUB_NAMES.push({stripped})
	PUB_NAMES = _.uniqBy(PUB_NAMES, 'stripped')
}

function replaceData(strippedName) {
	let pub = strippedName.stripped

	let filteredCoords = GROUPED_COORDS.filter(d => d.pub == pub)
	//console.log(filteredCoords.length)

	let flattenedCoords = filteredCoords.map(d => ({ coordinates: d.rawCoordinates }))
	//console.log(flattenedCoords.length)
	flattenedCoords = _.flatMap(flattenedCoords, 'coordinates')
	//console.log(flattenedCoords.length)

	let filteredDist = GROUPED_DIST.filter(d => d.pub == pub)
	let flattenedDist = filteredDist.map(d => ({ distance: d.rawDistance }))
	flattenedDist = _.flatMap(flattenedDist, 'distance')
	let summedDist = flattenedDist.reduce((a,b) => a + b, 0)

	let filteredDur = GROUPED_DUR.filter(d => d.pub == pub)
	let flattenedDur = filteredDur.map(d => ({ duration: d.rawDuration }))
	flattenedDur = _.flatMap(flattenedDur, 'duration')
	let summedDur = flattenedDur.reduce((a,b) => a + b, 0)

	let filePath = `${IN_PATH}result-coordinates-${pub}-1.txt`
	let raw = fs.readFileSync(`${filePath}`, 'utf-8')
	let parsedData = JSON.parse(raw)
	parsedData.routes[0].geometry.coordinates = flattenedCoords
	parsedData.routes[0].duration = summedDur
	parsedData.routes[0].distance = summedDist

	//console.log(parsedData.routes[0].geometry.coordinates.length)

	let fileOut = `${OUT_PATH}result-coordinates-${pub}.txt`
	let output = JSON.stringify(parsedData)

	fs.writeFileSync(fileOut, output)
}

function combineMetrics(pub, rawCoordinates, rawDuration, rawDistance) {

	GROUPED_COORDS.push({pub, rawCoordinates})
	//console.log(rawCoordinates.length)

	GROUPED_DUR.push({pub, rawDuration})
	GROUPED_DIST.push({pub, rawDistance})
}

function loadFile(file) {
	let pub = file.split('-')[2]
	let filePath = `${IN_PATH}${file}`
	let raw = fs.readFileSync(`${filePath}`, 'utf-8')
	let parsedData = JSON.parse(raw)
	let rawCoordinates = parsedData.routes[0].geometry.coordinates
	let rawDuration = parsedData.routes[0].duration
	let rawDistance = parsedData.routes[0].distance

	// if (!file.includes('-1')) {
	// 	//Removes first(duped) overlapping coordinates in subsequent files
	// 	rawCoordinates = rawCoordinates.slice(1, rawCoordinates.length)
	// } else {
	// 	rawCoordinates = rawCoordinates
	// }

	combineMetrics(pub, rawCoordinates, rawDuration, rawDistance)
}

function combineFiles(strippedName) {
	let pub = strippedName.stripped

	//console.log(pub)
	GROUPED_FILES = fs.readdirSync(IN_PATH).filter(function(d) {
		let cutName = d.split('-')[2]
		return cutName === pub
	})
	console.log(GROUPED_FILES)
	GROUPED_FILES.forEach(loadFile)

}

function loadCheck() {
	let filePath = `${OUT_PATH}result-coordinates-redlionhotel.txt`
	let raw = fs.readFileSync(`${filePath}`, 'utf-8')
	let parsedData = JSON.parse(raw)

	console.log('check', parsedData.routes[0].geometry.coordinates.length)
}

function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.txt'))

	files.forEach(stripFilename);

	//console.log(PUB_NAMES)

	PUB_NAMES.forEach(combineFiles)
	//
	PUB_NAMES.map(replaceData)

	//loadCheck()

}

init();
