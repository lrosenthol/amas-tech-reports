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