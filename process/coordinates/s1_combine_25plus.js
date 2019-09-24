const fs = require('fs');
const d3 = require('d3');
const _ = require('lodash');

const OUT_PATH = './output/over-25/results-combined/'
const IN_PATH = './output/over-25/results/'
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
	//console.log(FLAT_COORDS.length)
	let pub = strippedName.stripped

	let filteredCoords = GROUPED_COORDS.filter(d => d.pub == pub)
	let flattenedCoords = filteredCoords.map(d => ({ coordinates: d.rawCoordinates }))
	flattenedCoords = _.flatMap(flattenedCoords, 'coordinates')

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

	let fileOut = `${OUT_PATH}result-coordinates-${pub}.txt`
	let output = JSON.stringify(parsedData)

	fs.writeFileSync(fileOut, output)
}

function combineMetrics(pub, rawCoordinates, rawDuration, rawDistance) {

	GROUPED_COORDS.push({pub, rawCoordinates})
	GROUPED_DUR.push({pub, rawDuration})
	GROUPED_DIST.push({pub, rawDistance})
}

function loadSingleFile(file) {
	let pub = file.split('-')[2]
	let filePath = `${IN_PATH}${file}`
	let raw = fs.readFileSync(`${filePath}`, 'utf-8')
	let parsedData = JSON.parse(raw)
	let rawCoordinates = parsedData.routes[0].geometry.coordinates
	let rawDuration = parsedData.routes[0].duration
	let rawDistance = parsedData.routes[0].distance

	if (!filePath.includes('-1')) {
		//Removes first(duped) overlapping coordinates in subsequent files
		rawCoordinates = rawCoordinates.slice(2, rawCoordinates.length)
	}

	combineMetrics(pub, rawCoordinates, rawDuration, rawDistance)
}

function loadGroupedFiles(fileGroup) {
	let nameFiles = fileGroup
	nameFiles = nameFiles.split()
	nameFiles.map(loadSingleFile)
}

function combineFiles(strippedName) {
	let pub = strippedName.stripped

	GROUPED_FILES = fs.readdirSync(IN_PATH).filter(d => d.includes(pub))
	GROUPED_FILES.map(loadGroupedFiles)

}

function init() {
	const files = fs.readdirSync(IN_PATH).filter(d => d.includes('.txt'))

	files.map(stripFilename);
	PUB_NAMES.map(combineFiles)

	PUB_NAMES.map(replaceData)

}

init();
