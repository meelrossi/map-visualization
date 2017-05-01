d3.json("data.json", function(data) {
  console.log(data);
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
        popupTemplate: function(geography, data) { //this function should just return a string
          return '<div class="hover-info"><b>' + geography.properties.name + '</b><br>' + data.days + ' dias' + '</div>';
        },
        popupOnHover: true, //disable the popup while hovering
        highlightOnHover: true,
        highlightFillColor: '#48D1CC',
        highlightBorderColor: 'rgba(72,209,204, 0.1)',
        highlightBorderWidth: 2,
        highlightBorderOpacity: 1
      },
  });
  var baseColor = d3.rgb(255, 204, 153);
  mapData = {};
  _.forEach(Object.keys(data), (key) => {
    mapData[key] = {};
    mapData[key].days = _.reduce(data[key], (days, trip) => {
      return days + trip.days;
    }, 0);
  });
  var max = _.reduce(Object.keys(mapData), (max, key)=> {
    return max < mapData[key].days ? mapData[key].days : max;
  }, 0);
  _.forEach(Object.keys(data), (key) => {
    if (mapData[key].days == 0) {
      mapData[key].color = '#d3d3d3';
    } else {
      mapData[key].color = baseColor.darker(mapData[key].days / max).toString();
    }
  });
  basic.updateChoropleth(mapData);
});
