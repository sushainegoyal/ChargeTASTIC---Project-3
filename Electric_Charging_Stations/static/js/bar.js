var url = ("/api/allocations");
d3.json(url).then(function(response) {
    var types = {};
    response.forEach(function(location){
        var lis = location.Connections
        for (i=0; i<lis.length; i++) {
            var type = lis[i].ConnectionType.Title
            console.log(type)
            if (type in types){
                types[type] = types[type]+1;
            }
            else {
                types[type] = 1;
            }
        }
    })
    console.log(types)
    
    var CT = Object.keys(types)
    var CTN = Object.values(types)
    console.log(CT)
    console.log(CTN)
    var trace1 = {
        x: CT,
        y: CTN,
        type: 'bar',
      };
      
      var data = [trace1];
      
      var layout = {
        title: 'Connector Types',
        font:{
          family: 'Raleway, sans-serif'
        },
        showlegend: false,
        xaxis: {            
          tickangle: -45
        },
        yaxis: {
          zeroline: false,
          gridwidth: 1
        },
        bargap :0.05
      };
      
      Plotly.newPlot('bar', data, layout);
})