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
			arr.push({ x: parentName, y: node.name, r: 10 });
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
			pointBorderColor: pointBorderColor(),
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
			pointHitRadius: 10,
			data: bubbleDataPoints
		}]
	};


	const width = 800;
	const height = 800;

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
			plugins: {
				legend: {
					display: false
				},
			},
			scales: {
				y: {
					// will this create y-axis with days of week?
					type: 'category',
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
					]
				}
			}
		}
	};

	const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
	fs.writeFileSync(outputPath, buffer);
	console.log(`Bubble chart PNG saved to ${outputPath}`);
}
