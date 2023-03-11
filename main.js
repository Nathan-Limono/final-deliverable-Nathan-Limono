// **** Your JavaScript code goes here ****
var parseDate = d3.timeParse('%B %d, %Y');
d3.csv(
    // "baseball_hr_leaders_2017.csv"
    "KSEA.csv"
    ).then(function(dataset) {
    console.log(dataset);
    console.log(dataset[0].date)
    test_date = new Date(dataset[0].date)
    console.log(test_date)
    var svg = d3.select('svg');
    /*Create G element under*/
    // dataset.forEach(function(d) {
    //     d.date = parseDate(d.date)
    // })
    console.log(dataset)

    dateDomain = [new Date(dataset[0].date), new Date(dataset[dataset.length - 1].date)]
    console.log(dateDomain)

    // **** Functions to call for scaled values ****
    function scaleYear(year) {
        return yearScale(year);
    }

    function scaleHomeruns(homeruns) {
        return hrScale(homeruns);
    }

    // **** Code for creating scales, axes and labels ****

    var yearScale = d3.scaleTime().domain(dateDomain).range([60, 700])

    var hrScale = d3.scaleLinear()
        .domain([0,75]).range([340,20]);

    var svg = d3.select('svg');

    svg.append('g').attr('class', 'x axis')
        .attr('transform', 'translate(0,345)')
        .call(d3.axisBottom(yearScale).tickFormat(function(d){return d;}));

    svg.append('text')
        .attr('class', 'label')
        .attr('transform','translate(360,390)')
        .text('MLB Season');

    svg.append('g').attr('class', 'y axis')
        .attr('transform', 'translate(55,0)')
        .call(d3.axisLeft(hrScale));

    svg.append('text')
        .attr('class', 'label')
        .attr('transform','translate(15,200) rotate(90)')
        .text('Home Runs (HR)');

    svg.append('text')
        .attr('class', 'title')
        .attr('transform','translate(360,30)')
        .text('Top 10 HR Leaders per MLB Season');

    var playerG = svg.selectAll('.player')
    .data(dataset)
    .enter()
    .append('circle')
    // .attr('class', 'player')
    .attr('class', function(d) {
        if(d.rank === '3' | d.rank === '2' | d.rank === '1' ) {
            return 'top_player'
        } else {
            return 'player'
        }
    })
    .attr('r', 2.5)
    .attr('transform', function(d) {
        return 'translate(' + scaleYear(d.year) + "," + scaleHomeruns(d.homeruns) + ")"
    })
    // .attr('opacity', '0.4')
    // .attr('fill', 'blue')

    /*top 3 players get a different class name, give a different color*/
    /*Make sure you have 1,679 g elements*/

    // var circles = svg.selectAll('circle')
    // .data(dataset)
    // .enter()
    // .append('circle')
    // .attr('r', 2.5)
    // .attr('transform', function(d) {
    //     return 'translate(' + scaleYear(d.year) + "," + scaleHomeruns(d.homeruns) + ")"
    // })

});