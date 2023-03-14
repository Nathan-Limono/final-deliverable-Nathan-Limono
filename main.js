// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    var selectCity = d3.select('#categorySelect2').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    var categoryCity = selectCity.options[selectCity.selectedIndex].value;
    console.log('city category: ', categoryCity)
    console.log(category)
    // Update chart with the selected category of

    var rangeLeft = d3.select('#eventhandler > g > #labelleft').node().textContent;
    var rangeRight = d3.select('#eventhandler > g > #labelRight').node().textContent;

    rangeLeft = parseFloat(rangeLeft)
    rangeRight = parseFloat(rangeRight)

    updateChart(category, categoryCity, rangeLeft, rangeRight);
}


// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        date: row.date,
        actual_precipitation: +row.actual_precipitation
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 26
var barBand = chartHeight / 12;
var barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var seasonsMap = {
    'all-seasons': 'Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec'.split(', '),
    'winter': 'Jan, Feb, Dec'.split(', '),
    'spring': 'Mar, Apr, May'.split(', '),
    'summer': 'Jun, Jul, Aug'.split(', '),
    'fall': 'Sep, Oct, Nov'.split(', ')
};

var citiesMap = {
    'all' : 'CLT, CQT, IND, JAX, KHOU, KNYC, KSEA'.split(', '),
    'CLT' : 'CLT',
    'CQT' : 'CQT',
    'IND' : 'IND',
    'JAX' : 'JAX',
    'KHOU' : 'KHOU',
    'KNYC' : 'KNYC',
    'KSEA' : 'KSEA'
}

average = function(rain, temp) {
    totalRain = 0
    totalTemp = 0
    size = rain.length
    for (i = 0; i < size; i++) {
        totalRain += parseFloat(rain[i])
        totalTemp += parseFloat(temp[i])
    }
    return [(totalRain / size),(totalTemp / size)]
}

d3.csv('cities_data.csv').then(function(dataset) {
    // Create global variables here and intialize the chart
    console.log('run')
    days = dataset
    console.log(dataset)
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let cityNames = ['CLT', 'CQT', 'IND', 'JAX', 'KHOU', 'KNYC', 'KSEA']
    days.forEach(function(d) {
        month = new Date(d.date).getMonth()
        d.date = monthNames[month]
    })
    months_data = []
    for (x of monthNames) {
        for (y of cityNames) {
            obj = {'month' : x, 'avg_percipitation' : [], 'avg_temp' : [], 'city_name' : y}
            months_data.push(obj)
        }
    }
    console.log(months_data)


    days.forEach(function(d) {
        month = d.date
        city = d.city
        // months_data[month].push(d.actual_precipitation)
        for (x of months_data) {
            if(x.month == month && x.city_name == city) {
                x.avg_percipitation.push(d.actual_precipitation)
                x.avg_temp.push(d.actual_mean_temp)
            }
        }
    })

    console.log(months_data)

    for (x of months_data) {
        console.log(x)
        var averages = average(x.avg_percipitation, x.avg_temp)

        x.avg_percipitation = averages[0]
        x.avg_temp = averages[1]
    }

    console.log(months_data)


    svg.append('text')
    .text('Average Percipetation per Month (inches)')
    .attr('transform', 'translate(' + svgWidth / 2 + ', ' + padding.b + ')')
    .attr('text-anchor', 'middle')

    let formatPercent = function(d) {
        return d*100 + "%"
    };

    console.log(months_data)

    let precipitations = months_data.map(s => s.avg_percipitation)

    console.log(precipitations)

    var max_precipitation = d3.max(precipitations);

    xScale = d3.scaleLinear().domain([0, max_precipitation]).range([0, chartWidth])



    // **** Your JavaScript code goes here ****
    chartG
    .append('g')
    .attr('class', 'x axis')
    .call(d3.axisTop(xScale).ticks(6));

    chartG
    .append('g')
    .attr('class', 'x axis')
    .call(d3.axisBottom(xScale).ticks(6))
    .attr('transform', 'translate(0, ' + chartHeight + ')');

    d3.select('#main').append('div')
    .text('Slider for Average Rain (inches):')

    slider = function(min, max, starting_min=min, starting_max=max) {
        var range = [min, max]
        var starting_range = [starting_min, starting_max]

        var w = svgWidth
        var h = 100

        var width = w - 80;
        var height = h - 70;


        var slidesvg = d3.select('#main')
        .append('svg')
        .attr('height', h)
        .attr('width', w)
        .attr('id', 'eventhandler')
        .attr('onchange', 'onCategoryChanged()')


        const g = slidesvg.append('g')
        .attr('transform', 'translate(' +[40, 20] + ')')


        var labelL = g.append('text')
        .attr('id', 'labelleft')
        .attr('x', 0)
        .attr('y', 60)
        .attr('text-anchor', 'end')

        var labelR = g.append('text')
        .attr('id', 'labelRight')
        .attr('x', 0)
        .attr('y', 60)


        var x = d3.scaleLinear()
        .domain(range)  // data space
        .range([0, width]);  // display space

        var brush = d3.brushX()
        .extent([[0,0], [width, height]])
        .on('brush', function() {
            var s = d3.event.selection;
            // update and move labels
            labelL.attr('x', s[0])
                .text((x.invert(s[0]).toFixed(2)))
            labelR.attr('x', s[1])
                .text((x.invert(s[1]).toFixed(2)))
            // move brush handles
            handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - height / 4] + ")"; });
            // update view
            // if the view should only be updated after brushing is over,
            // move these two lines into the on('end') part below
            slidesvg.node().value = s.map(function(d) {var temp = x.invert(d); return +temp.toFixed(2)});
            // slidesvg.node().dispatchEvent(new CustomEvent("input"));
            let event = new Event('change');
            slidesvg.node().dispatchEvent(event);
        })
        var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush)

        var brushResizePath = function(d) {
            var e = +(d.type == "e"),
                x = e ? 1 : -1,
                y = height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
              "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
              "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }

        var handle = gBrush.selectAll(".handle--custom")
        .data([{type: "w"}, {type: "e"}])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("fill", '#eee')
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

        gBrush.selectAll(".overlay")
        .attr('style', 'stroke:black')
        .each(function(d) { d.type = "selection"; })
        .on("mousedown touchstart", brushcentered)

        function brushcentered() {
            var dx = x(max / 10) - x(min / 10), // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
            d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }
        gBrush.call(brush.move, starting_range.map(x))

        var getRange = function() {
            var range = d3.brushSelection(gBrush.node()).map(d =>
                Math.round(x.invert(d))); return range }
        return {getRange: getRange}

        // return svg.node()

    }
    var slide = slider(0, max_precipitation)

    // Update the chart for all letters to initialize
    updateChart('all-seasons', 'CLT', 0, max_precipitation);
});

function scaleX(freq) {
    return xScale(freq)
}



function updateChart(filterKey, categoryCity, lowRange, highRange) {
    // Create a filtered array of letters based on the filterKey
    var filteredMonths = months_data.filter(function(d){
        return (seasonsMap[filterKey].indexOf(d.month) >= 0) &&
        (citiesMap[categoryCity].indexOf(d.city_name) >= 0) && (d.avg_percipitation >= lowRange) && (d.avg_percipitation <= highRange);
    });

    let prec = filteredMonths.map(s => s.avg_percipitation)
    let precSort = prec.sort()
    console.log(prec)
    let quantiles = [d3.quantile(precSort, 0), d3.quantile(precSort, 0.25), d3.quantile(precSort, 0.5), d3.quantile(precSort, 0.75), d3.quantile(precSort, 1)]

    console.log('quantiles ', quantiles)

    console.log(filteredMonths)
    console.log('updated')

    var letter = chartG.selectAll('.bar')
    .data(filteredMonths, function(d) {
        return d.avg_percipitation;
    });

    var barG = letter.enter()
        .append('g')
        .attr('class', 'bar');

    barG.merge(letter)
        .attr('transform', function(d,i) {
            return 'translate(' + [0, i * barBand + 8] + ')';
        });
    console.log('quantile functions')

    barG.append('rect')
        .attr('width', function(d) {
            return scaleX(d.avg_percipitation);
        })
        .attr('height', barHeight)
        .attr('class', 'bars'
            // if((d.avg_percipitation >= quantiles[0]) && (d.avg_percipitation < quantiles[1])) {
            //     console.log(quantiles[0] + '<=' + d.avg_percipitation + '<' + quantiles[1])
            //     return 'bars first-quarter';
            // } if ((d.avg_percipitation < quantiles[2]) && (d.avg_percipitation >= quantiles[1])) {
            //     console.log(quantiles[1] + '<=' + d.avg_percipitation + '<' + quantiles[2])
            //     return 'bars second-quarter';
            // } if ((d.avg_percipitation < quantiles[3]) && (d.avg_percipitation >= quantiles[2])) {
            //     console.log(quantiles[2] + '<=' + d.avg_percipitation + '<' + quantiles[3])
            //     return 'bars third-quarter';
            // } if ((d.avg_percipitation >= quantiles[3]) && (d.avg_percipitation <= quantiles[4])) {
            //     console.log(quantiles[3] + '<=' + d.avg_percipitation + '<' + quantiles[4])
            //     return 'bars fourth-quarter';
            // }
        );

    var toolTip = barG.append('g').attr('class', 'tool-tip-g')

    toolTip.append('rect').attr('class', 'arrow')

    toolTip.append('rect').attr('class', 'tool-tip').attr('rx', '10px')

    toolTip.append('text').attr('class', 'tool-tip-text-rain')
    .text(function (d) {
        var num = Math.round((d.avg_percipitation * 100)) / 100
        if(num == 0) {
            return 'Average Rain: ~' + num + " inches";
        } else {
            return 'Average Rain: ' + Math.round((d.avg_percipitation * 100)) / 100 + " inches";
        }

    })

    toolTip.append('text').attr('class', 'tool-tip-text-temp')
    .text(function (d) {return 'Average Temperature: ' + Math.round((d.avg_temp * 100)) / 100 + " (F)";})


    barG.append('text')
        .attr('text-anchor', 'middle')
        .style('position', 'relative')
        .attr('x', -17)
        .attr('y', 18)
        .text(function(d) {
            return (d.month);
        });
    d3.selectAll('.bar > rect')
        .attr('class', function(d, i) {
            if((d.avg_percipitation >= quantiles[0]) && (d.avg_percipitation < quantiles[1])) {
                console.log(quantiles[0] + '<=' + d.avg_percipitation + '<' + quantiles[1])
                return 'bars first-quarter';
            } if ((d.avg_percipitation < quantiles[2]) && (d.avg_percipitation >= quantiles[1])) {
                console.log(quantiles[1] + '<=' + d.avg_percipitation + '<' + quantiles[2])
                return 'bars second-quarter';
            } if ((d.avg_percipitation < quantiles[3]) && (d.avg_percipitation >= quantiles[2])) {
                console.log(quantiles[2] + '<=' + d.avg_percipitation + '<' + quantiles[3])
                return 'bars third-quarter';
            } if ((d.avg_percipitation >= quantiles[3]) && (d.avg_percipitation <= quantiles[4])) {
                console.log(quantiles[3] + '<=' + d.avg_percipitation + '<' + quantiles[4])
                return 'bars fourth-quarter';
            }
        });
    letter.exit().remove();

}

// Remember code outside of the data callback function will run before the data loads