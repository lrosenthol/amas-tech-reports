import fs from 'fs';
import * as d3 from 'd3';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import xmlserializer from 'xmlserializer';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';


// Sunburst chart generation using D3 and d3-node
export function createSunburstSVG(data, outputPath) {
    const width = 800;
    const radius = width / 2;
    const height = width;

    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    const body = d3.select(dom.window.document.querySelector('body'));

    // Custom colors for categories
    const categoryColors = {
        "Content Provenance": "#FFD966",
        "Trust and Authenticity": "#B4A7D6",
        "Asset Identifiers": "#EA9999",
        "Rights Declarations": "#93C47D",
        "Watermarking": "#EAD1DC",
        "Other": "#CCCCCC",
        "Specification": "#F3F3F3"
    };

    // Partition layout
    const partition = d3.partition().size([2 * Math.PI, radius]);
    const root = d3.hierarchy(data)
        .sum(d => d.value || 1)
        .sort((a, b) => b.value - a.value);
    partition(root);

    // Arc generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

    // SVG root
    // const svg = d3n.createSVG(width, width)
    //     .append('g')
    //     .attr('transform', `translate(${width / 2},${width / 2})`);
    const svg = body.append("svg")
                  .attr("width", width)
                  .attr("height", height);
    svg.append('g');
        // .attr('transform', `translate(${width / 2},${width / 2})`);

    // Draw arcs
    svg.selectAll('path')
        .data(root.descendants().filter(d => d.depth))
        .enter().append('path')
        .attr('d', arc)
        .attr('fill', d => {
            if (d.depth === 1) return categoryColors[d.data.name] || '#eee';
            if (d.depth === 2) return categoryColors[d.parent.data.name] || '#eee';
            return '#fff';
        })
        .attr('stroke', '#fff');

    // Category labels (outer ring)
    svg.selectAll('text.category')
        .data(root.children)
        .enter().append('text')
        .attr('class', 'category')
        .attr('transform', function(d) {
            const angle = ((d.x0 + d.x1) / 2) * 180 / Math.PI - 90;
            const r = (d.y0 + d.y1) / 2;
            return `rotate(${angle}) translate(${r},0) rotate(${angle > 90 ? 180 : 0})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(d => d.data.name);

    // Standard labels (inner ring)
    svg.selectAll('text.standard')
        .data(root.leaves())
        .enter().append('text')
        .attr('class', 'standard')
        .attr('transform', function(d) {
            const angle = ((d.x0 + d.x1) / 2) * 180 / Math.PI - 90;
            const r = (d.y0 + d.y1) / 2;
            return `rotate(${angle}) translate(${r},0) rotate(${angle > 90 ? 180 : 0})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => d.data.name);

    // Central label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 10)
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text('AI & Multimedia\nAuthenticity\nStandardization Map');

    // Write SVG to file
    const svgString = xmlserializer.serializeToString(svg.node());
    fs.writeFileSync(outputPath, svgString /*d3n.svgString()*/);

    console.log(`Sunburst chart saved to ${outputPath}`);
}

// Helper to flatten hierarchical data for Chart.js
function flattenSunburstData(data, parent = null, depth = 0, arr = []) {
    arr.push({
        name: data.name,
        value: data.value || 1,
        parent,
        depth
    });
    if (data.children) {
        data.children.forEach(child =>
            flattenSunburstData(child, data.name, depth + 1, arr)
        );
    }
    return arr;
}

// Generate a sunburst-like doughnut chart using Chart.js and output PNG
export async function createSunburstPNG(data, outputPath) {
    const width = 800;
    const height = 800;

    // Flatten data for Chart.js
    const flatData = flattenSunburstData(data);
    const categories = flatData.filter(d => d.depth === 1);
    const standards = flatData.filter(d => d.depth === 2);

    // Category colors
    const categoryColors = {
        "Content Provenance": "#FFD966",
        "Trust and Authenticity": "#B4A7D6",
        "Asset Identifiers": "#EA9999",
        "Rights Declarations": "#93C47D",
        "Watermarking": "#EAD1DC",
        "Other": "#CCCCCC",
        "Specification": "#F3F3F3"
    };

    // Prepare datasets for concentric rings
    const datasets = [
        {
            label: 'Categories',
            data: categories.map(d => d.value),
            backgroundColor: categories.map(d => categoryColors[d.name] || '#eee'),
            borderWidth: 2,
            borderColor: '#fff',
            circumference: 360,
            rotation: -90,
            cutout: '60%',
            radius: '100%'
        },
        {
            label: 'Standards',
            data: standards.map(d => d.value),
            backgroundColor: standards.map(d => categoryColors[categories.find(c => c.name === d.parent)?.name] || '#fff'),
            borderWidth: 1,
            borderColor: '#fff',
            circumference: 360,
            rotation: -90,
            cutout: '80%',
            radius: '60%'
        }
    ];

    // Labels for outer ring
    const labels = categories.map(d => d.name);

    // ChartJSNodeCanvas instance
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

    // Chart.js config
    const configuration = {
        type: 'doughnut',
        data: {
            labels,
            datasets
        },
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'AI & Multimedia\nAuthenticity\nStandardization Map',
                    font: { size: 24, weight: 'bold' },
                    padding: { top: 20, bottom: 20 }
                },
                datalabels: {
                    display: true,
                    color: '#333',
                    font: { weight: 'bold' }
                }
            },
            cutout: '40%',
            responsive: false,
            animation: false
        },
        plugins: []
    };

    // Render and save PNG
    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Sunburst-like chart PNG saved to ${outputPath}`);
}

// Bubble chart generation using D3 and jsdom
export function createBubbleChartSVG(data, outputPath) {
    const width = 800;
    const height = 800;
    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    const body = d3.select(dom.window.document.querySelector('body'));

    // Flatten data to get all standards (leaves)
    function getLeaves(node, arr = []) {
        if (node.children && node.children.length) {
            node.children.forEach(child => getLeaves(child, arr));
        } else {
            arr.push(node);
        }
        return arr;
    }
    const leaves = getLeaves(data);

    // Create a hierarchy for D3 pack layout
    const root = d3.hierarchy(data)
        .sum(d => d.value || 1)
        .sort((a, b) => b.value - a.value);

    // Pack layout
    const pack = d3.pack()
        .size([width, height])
        .padding(8);
    pack(root);

    // Custom colors for categories
    const categoryColors = {
        "Content Provenance": "#FFD966",
        "Trust and Authenticity": "#B4A7D6",
        "Asset Identifiers": "#EA9999",
        "Rights Declarations": "#93C47D",
        "Watermarking": "#EAD1DC",
        "Other": "#CCCCCC",
        "Specification": "#F3F3F3"
    };

    // SVG root
    const svg = body.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Draw bubbles (only leaves)
    svg.selectAll("circle")
        .data(root.leaves())
        .enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("fill", d => categoryColors[d.parent.data.name] || '#eee')
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    // Add labels (standard names)
    svg.selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-size", d => Math.max(10, d.r / 3) + "px")
        .style("pointer-events", "none")
        .text(d => d.data.name);

    // Central label (optional)
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text('AI & Multimedia Authenticity Standardization Map');

    // Write SVG to file
    const svgString = xmlserializer.serializeToString(svg.node());
    fs.writeFileSync(outputPath, svgString);
    console.log(`Bubble chart saved to ${outputPath}`);
}

// Bubble chart generation using Chart.js and chartjs-node-canvas
export async function createBubbleChartPNG(data, outputPath) {
    const width = 800;
    const height = 800;

    // Flatten data to get all standards (leaves)
    function getLeaves(node, arr = [], parent = null) {
        if (node.children && node.children.length) {
            node.children.forEach(child => getLeaves(child, arr, node.name));
        } else {
            arr.push({ ...node, parent });
        }
        return arr;
    }
    const leaves = getLeaves(data);

    // Assign each bubble a random position (for demo; for real use, use a layout algorithm)
    const bubbleData = leaves.map((leaf, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: 20 + (leaf.value || 1) * 10,
        label: leaf.name,
        backgroundColor: {
            "Content Provenance": "#FFD966",
            "Trust and Authenticity": "#B4A7D6",
            "Asset Identifiers": "#EA9999",
            "Rights Declarations": "#93C47D",
            "Watermarking": "#EAD1DC",
            "Other": "#CCCCCC",
            "Specification": "#F3F3F3"
        }[leaf.parent] || "#eee"
    }));

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

    const configuration = {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Standards',
                data: bubbleData,
                backgroundColor: bubbleData.map(b => b.backgroundColor),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'AI & Multimedia Authenticity Standardization Map',
                    font: { size: 24, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.raw.label
                    }
                }
            },
            scales: {
                x: { display: false, min: 0, max: 100 },
                y: { display: false, min: 0, max: 100 }
            },
            animation: false,
            responsive: false
        }
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Bubble chart PNG saved to ${outputPath}`);
}

export async function createBubbleChart2(data, outputPath) {
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
    var pointBackgroundColor = function() {
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
    console.log(`Bubble chart 2 PNG saved to ${outputPath}`);
}
