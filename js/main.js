/*
*    main.js
*    Project - Gapminder Clone
*/

var margin = { left:80, right:20, top:50, bottom:100 };
var height = 500 - margin.top - margin.bottom, 
	width = 800 - margin.left - margin.right;
	
var g = d3.select("#chart-area")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

var time = 0

// tooltip
var tip = d3.tip().attr('class', 'd3-tip')
	.html(d => { 
		var text = "<strong>Country:</strong> <span style='color:red'>" + d.country + "</span><br>"
		text += "<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>" + d.continent + "</span><br>"
		text += "<strong>Life Expectancy:</strong> <span style='color:red'>" + d3.format(".2f")(d.life_exp) + "</span><br>"
		text += "<strong>GDP Per Capital:</strong> <span style='color:red'>" + d3.format("$,.0f")(d.income) + "</span><br>"
		text += "<strong>Country:</strong> <span style='color:red'>" + d3.format(",.0f")(d.population) + "</span><br>"
		return text
	})
g.call(tip)

// scales
var x = d3.scaleLog()
	.base(10)
	.range([0, width])
	.domain([300, 150000])
var y = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0])
var area = d3.scaleLinear()
	.domain([2000, 1400000000])
	.range([25*Math.PI, 1500*Math.PI])
var continentColor = d3.scaleOrdinal(d3.schemePastel1)

// Labels
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -170)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")
var timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "30px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
	.text("1800");
	
// X Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
g.append("g")
	.attr("class", "x axis")
	// tranform x axis from top to bottom
    .attr("transform", "translate(0," + height +")")
	.call(xAxisCall);

var continents = ["europe", "asia", "americas", "africa"]
var legend = g.append("g")
// sit at bottom right
	.attr("transform", "translate(" + (width - 10)+ 
		"," + (height - 125) + ")")

continents.forEach((continent, i) => {
	var legendRow = legend.append("g")
		// avoid overlap
		.attr("transform", "translate(0, " + (i * 20) + ")")

	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", continentColor(continent))
	
	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.attr("text-transform", "capitalize")
		.text(continent)
})


// Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);




d3.json("data/data.json").then(function(data){
	// console.log(data);

	// clean data
	const formattedData = data.map(year => {
		return year["countries"].filter(country => {
			var dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = +country.income
			country.life_exp = +country.life_exp
			return country
		})
	})

	 // Run the code every 0.1 second
	 d3.interval(() => {
		 // loop back at the end of the data
		 time = (time < 214) ? time+1 : 0
		 update(formattedData[time])
	 }, 300)

	// First run of the visualization
	update(formattedData[0])
})

function update(data) {
	var t = d3.transition()
		.duration(100)

	// join new data with old elements
	var circles = g.selectAll("circle")
		.data(data, d => { return d.country })


	// exit old elements not present in new data
	circles.exit()
		.attr("class", "exit")
		.remove()

	// enter new elements in new data
	circles.enter()
		.append("circle")
		.attr("class", "enter")
		.attr("fill", d => { return continentColor(d.continent) })
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)
			.attr("cy", d => { return y(d.life_exp) })
			.attr('cx', d => { return x(d.income) })
			.attr("r", d => { return Math.sqrt(area(d.population) / Math.PI) })

	// update time label
	timeLabel.text(+(time + 1800))
}