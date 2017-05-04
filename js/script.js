d3.json("data.json", function(data) {
  var mapData = {};

  // World map http://datamaps.github.io/
  var basic = new Datamap({
    element: document.getElementById("map"),
    projection: 'equirectangular',
    fills: {
        defaultFill: '#d3d3d3'
    },
    geographyConfig: {
        hideAntarctica: true,
        borderWidth: 1,
        borderOpacity: 1,
        borderColor: '#FDFDFD',
        popupTemplate: function(geography, data) {
          return '<div class="hover-info"><b>' + geography.properties.name + '</b><br>' + data.days + ' days' + '</div>';
        },
        popupOnHover: true,
        highlightOnHover: true,
        highlightFillColor: '#FFB266',
        highlightBorderColor: 'rgba(72,209,204, 0.1)',
        highlightBorderWidth: 2,
        highlightBorderOpacity: 1
      },
      done: function(datamap) {
          datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
              updateCities(mapData[geography.id].cities);

          });
      }
  });

  var baseColor = d3.rgb(255, 204, 153);

  // d3-brush based on
  var margin = { top: 10, right: 40, bottom: 100, left: 40 };

  var width = document.getElementById("container").clientWidth - margin.left - margin.right;
  var height = 150 - margin.top - margin.bottom;

  var minDate = null;
  var maxDate = null;

  Object.keys(data).forEach((key) => {
    data[key].forEach((trip) => {
      const [day, month, year] = trip.date.split("/");
      var tripDate = new Date(year, month - 1, day);
      if (minDate == null || tripDate < minDate) minDate = tripDate;

      var tripEndDate = new Date();
      tripEndDate.setDate(tripDate.getDate() + trip.days);
      if (maxDate == null || tripEndDate > maxDate) maxDate = tripEndDate;
    })
  });

  var x = d3.time.scale().domain([minDate, maxDate]).range([0, width], 1);

  var svg = d3.select("#brush")
      .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("rect")
        .attr("class", "grid-background")
        .attr("width", width)
        .attr("height", height);

  svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis().scale(x).ticks(d3.time.month, 1).tickSize(-height))
      .selectAll(".tick")
        .data(x.ticks(10), function(d) { return d; })
      .exit()
        .classed("minor", true);

  svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis().scale(x).ticks(d3.time.year).tickPadding(0));

  var datesBrush = d3.svg.brush().x(x).on("brushend", brushend);

  svg.append("g")
        .attr("class", "brush")
        .call(datesBrush)
      .selectAll("rect")
        .attr("height", height);

  function brushend() {
    var range = datesBrush.extent();
    processData(range[0], range[1]);
  };

  // Process trip data
  function processData(startDate, endDate) {
    mapData = {};

    Object.keys(data).forEach((key) => {
      mapData[key] = { days: 0, cities: [] };
      data[key].forEach((trip) => {
        const [day, month, year] = trip.date.split("/");
        var tripDate = new Date(year, month - 1, day);

        if (tripDate > startDate && tripDate < endDate) {
          mapData[key].days += trip.days;
          mapData[key].cities.push(trip.city);
        }
      });
    });
    updateMap(mapData);
  };

  function updateMap(mapData) {
    var max = _.reduce(Object.keys(mapData), (max, key)=> { return max < mapData[key].days ? mapData[key].days : max; }, 0);
    _.forEach(Object.keys(data), (key) => {
      mapData[key].color = mapData[key].days == 0 ? '#d3d3d3' : baseColor.darker(mapData[key].days / max).toString();
    });
    basic.updateChoropleth(mapData);
    var cities = _.reduce(Object.keys(mapData), (cities, key) => cities.concat(mapData[key].cities), []);
    updateCities(cities);
  }

  function updateCities(cities) {
    var cities = cities.filter(function(elem, index, self) {
      return index == self.indexOf(elem);
    });
    document.getElementsByClassName("number-cities")[0].innerHTML = cities.length;
    d3.selectAll(".city-span").remove();
    d3.select("#cities-list").selectAll(".city-span")
      .data(cities)
      .enter()
      .append("span")
      .attr("class", "city-span")
      .html(function(d) {return d + "<br>";});
  }
});
