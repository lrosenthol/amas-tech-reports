import fs from 'fs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';


export async function createBubbleChartPNG(data, outputPath) {
	var bubbleBackgroundColor = function() {
				return 'rgba(255, 206, 86, 0.2)'
	};
	var bubbleBorderColor = function() {
				return 'rgba(255, 206, 86, 1)'
	};

	const pointColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
	function pointColor(xValue) {
		switch (xValue) {
			case "Content Provenance":
				return pointColors[0];
			case "Trust and Authenticity":
				return pointColors[1];
			case "Asset Identifiers":
				return pointColors[2];
			case "Rights Declarations":
				return pointColors[3];
			case "Watermarking":
				return pointColors[4];
			case "Other":
				return pointColors[5];
			default:
				// Default color if no match
				return 'rgba(75,192,192,1)';
		}
	}

	var pointBorderColor = function() {
				return 'rgba(75,192,192,1)'
	};


	// Extract unique categories (x) and standards (y) from the data hierarchy
	function extractCategoriesAndStandards(node, categories = new Set(), standards = new Set()) {
		if (node.children && node.children.length) {
			if (node.depth === 1 || (!node.depth && node.name)) categories.add(node.name);
			node.children.forEach(child => extractCategoriesAndStandards(child, categories, standards));
		} else {
			standards.add(node.name);
			if (node.parent) categories.add(node.parent.name);
		}
		return { categories: Array.from(categories), standards: Array.from(standards) };
	}

	// Flatten data to get all leaf nodes (standards) with their parent (category)
	function getLeavesWithParent(node, parentName = null, arr = []) {
		if (node.children && node.children.length) {
			node.children.forEach(child => getLeavesWithParent(child, node.name, arr));
		} else {
			// r is the radius for the bubble, defaulting to 7
			arr.push({ x: parentName, y: node.name, r: 7 });
		}
		return arr;
	}

	// Build bubble chart data from hierarchy
	const { categories, standards } = extractCategoriesAndStandards(data);
	const bubbleDataPoints = getLeavesWithParent(data);

	var bubbleChartData = {
		animation: { duration: 10 },
		datasets: [{
			fill: false,
			lineTension: 0.1,
			backgroundColor: bubbleBackgroundColor(),
			borderColor: bubbleBorderColor(),
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor:  (context) => {
				const index = context.dataIndex; // Get data point index
				const xValue = context.dataset.data[index].x; // Get X-value
				return pointColor(xValue); // Return color based on X-value
			},
			pointBackgroundColor: (context) => {
				const index = context.dataIndex; // Get data point index
				const xValue = context.dataset.data[index].x; // Get X-value
				return pointColor(xValue); // Return color based on X-value
			},
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: "rgba(153, 102, 155, 0.2)",
			pointHoverBorderColor: "rgba(153, 102, 155, 1)",
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 5,
			data: bubbleDataPoints
		}]
	};


	// 11x14 inches in pixels at 72 DPI
	const width = 1008; // Width of the chart
	const height = 1008; // Height of the chart

	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
	const configuration = {
		type: 'bubble',
		data: bubbleChartData,
		options: {
			responsive: true,
			title: {
				display: false
			},
			legend: {
				display: false
			},
			font: {
				family: 'OpenSans, sans-serif'
			},
			plugins: {
				legend: {
					display: false
				},
			},
			elements: {
				point: {
					radius: (context) => {
						// Set bubble size based on data.r (default is 5 in getLeavesWithParent)
						const index = context.dataIndex;
						const value = context.dataset.data[index];
						return value && value.r ? value.r : 5;
					}
				}
			},
			scales: {
				y: {
					// will this create y-axis with days of week?
					type: 'category',
					ticks: {
						padding: 20 // Add padding to the right of y-axis labels
					}
				},
				x: {
					type: 'category',
					labels: [
						"Content Provenance",
						"Trust and Authenticity",
						"Asset Identifiers",
						"Rights Declarations",
						"Watermarking",
						"Other"
					],
					grid: {
						display: false // Turn off vertical grid lines
					}
				}
			}
		}
	};

	const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
	fs.writeFileSync(outputPath, buffer);
	console.log(`Bubble chart PNG saved to ${outputPath}`);
}


export async function createBubbleChartPNGByMediaType(data, outputPath) {
	var bubbleBackgroundColor = function() {
		return 'rgba(54, 162, 235, 0.2)';
	};
	var bubbleBorderColor = function() {
		return 'rgba(54, 162, 235, 1)';
	};

	// Helper to extract unique media types (x) and standards (y)
	function extractMediaTypesAndStandards(node, mediaTypes = new Set(), standards = new Set()) {
		if (node.children && node.children.length) {
			if (node.mediaType) mediaTypes.add(node.mediaType);
			node.children.forEach(child => extractMediaTypesAndStandards(child, mediaTypes, standards));
		} else {
			standards.add(node.name);
			if (node.mediaType) mediaTypes.add(node.mediaType);
		}
		return { mediaTypes: Array.from(mediaTypes), standards: Array.from(standards) };
	}

	// Flatten data to get all leaf nodes (standards) with their mediaType
	function getLeavesWithMediaType(node, arr = []) {
		if (node.children && node.children.length) {
			node.children.forEach(child => getLeavesWithMediaType(child, arr));
		} else {
			arr.push({ x: node.mediaType || "Unknown", y: node.name, r: 7 });
		}
		return arr;
	}

	const { mediaTypes, standards } = extractMediaTypesAndStandards(data);
	const bubbleDataPoints = getLeavesWithMediaType(data);

	const bubbleChartData = {
		animation: { duration: 10 },
		datasets: [{
			fill: false,
			lineTension: 0.1,
			backgroundColor: bubbleBackgroundColor(),
			borderColor: bubbleBorderColor(),
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor: (context) => {
				const index = context.dataIndex;
				const xValue = context.dataset.data[index].x;
				// Assign color based on media type index
				const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6'];
				const idx = mediaTypes.indexOf(xValue);
				return colors[idx % colors.length];
			},
			pointBackgroundColor: (context) => {
				const index = context.dataIndex;
				const xValue = context.dataset.data[index].x;
				const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6'];
				const idx = mediaTypes.indexOf(xValue);
				return colors[idx % colors.length];
			},
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: "rgba(153, 102, 155, 0.2)",
			pointHoverBorderColor: "rgba(153, 102, 155, 1)",
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 5,
			data: bubbleDataPoints
		}]
	};

	const width = 1008;
	const height = 1008;

	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
	const configuration = {
		type: 'bubble',
		data: bubbleChartData,
		options: {
			responsive: true,
			title: {
				display: false
			},
			legend: {
				display: false
			},
			font: {
				family: 'OpenSans, sans-serif'
			},
			plugins: {
				legend: {
					display: false
				},
			},
			elements: {
				point: {
					radius: (context) => {
						const index = context.dataIndex;
						const value = context.dataset.data[index];
						return value && value.r ? value.r : 5;
					}
				}
			},
			scales: {
				y: {
					type: 'category',
					ticks: {
						padding: 20
					}
				},
				x: {
					type: 'category',
					labels: mediaTypes,
					grid: {
						display: false
					}
				}
			}
		}
	};

	const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
	fs.writeFileSync(outputPath, buffer);
	console.log(`Bubble chart PNG (by media type) saved to ${outputPath}`);
}