const fs = require('fs');
const D3Node = require('d3-node');
const d3 = require('d3');

// Sunburst chart generation using D3 and d3-node
export function createSunburstSVG(data, outputPath) {
    const width = 800;
    const radius = width / 2;
    const d3n = new D3Node();

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
    const svg = d3n.createSVG(width, width)
        .append('g')
        .attr('transform', `translate(${width / 2},${width / 2})`);

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
    fs.writeFileSync(outputPath, d3n.svgString());
}
