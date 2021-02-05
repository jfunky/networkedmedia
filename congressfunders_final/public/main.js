// <script type="text/javascript">
$(document).ready(function(){

  // Setting up the map (code that we're used to)
  var map = L.map('map').setView([39.8, -96], 4) ;
  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 4,
    scrollWheelZoom: false,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  }).addTo(map);

  map.once('focus', function() { map.scrollWheelZoom.enable(); });


  //spacial feature styling
  function style(feature) {
    return {
      weight: .9,
      opacity: .70,
      color: 'white',
      fillOpacity: .70,
      fillColor: "#361CB2"
    };
  }

  //highlight function for hover
  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 3,
      color: "#4a1486",
      //dashArray: '3',
      fillOpacity: .95
    });
    // This is where data changes dependent on the state
    info.update(layer.feature.properties);
  }


function redirect(e){
  //console.log(e);
  var layer = e.target;
  // console.log("layer.feature")
  // console.log(layer.feature.properties.name);
  var state = {"name": layer.feature.properties.name};
  // console.log(state);


  $.ajax({
    async: true,
    url: '/newState',
    type: 'POST',
    data: state,
    error: function(resp){
      console.log("Uhoh");
      // console.log(resp);
    },
    success: function(resp){
      console.log("Woohoo");
      console.log(resp);

      // var html = new EJS({url: 'statemap.ejs'}).render({senate: resp.senate},
      //                                                 {house: resp.house});
      // $('right-side').html(html);

      senateList = resp.senate ;
      var senateStr = "";
      for (var i = 0; i < senateList.length; i++) {
        var name = senateList[i].name;
        var party = senateList[i].party;
        // var cid = senateList[i].member_id;
        var cid = senateList[i].crp_id;
        var web = senateList[i].website;
        // name.addEventListener('click', search);

        htmlfront = '<div class="people"><div class="cgname" id="';
        htmlend = "<div class='left'><div class='money'><p> $$$ </p></div></div><div class='right'><div class='text'><a href='" + web + "'>website</a></div></div><br></div><br>";
        senateStr += htmlfront + cid + '"><b>'  + name + "</b>, " + party + "</div>" + htmlend ;
      }

      houseList = resp.house ;
      var houseStr = "";
      for (var i = 0; i < houseList.length; i++) {
        var name = houseList[i].name;
        var party = houseList[i].party;
        // var cud = houseList[i].member_id;
        var cid = houseList[i].crp_id;
        var web = houseList[i].website;
        // name.addEventListener('click', search);

        htmlfront = '<div class="people"><div class="cgname" id="';
        htmlend = "<div class='left'><div class='money'>$$$</div></div><div class='right'><div class='text'><a href='" + web + "'>website</a></div></div><br></div><br>";
        houseStr += htmlfront + cid + '"><b>'  + name + "</b>, " + party + "</div>" + htmlend;
      }

      senateHTML = "<h3> Senators </h3>" + senateStr ;
      houseHTML = "<h3> Representatives </h3>" + houseStr ;

      document.getElementById('issue-areas').innerHTML = '';
      // console.log("console log senate");
      // console.log(senateStr);
      document.getElementById('senate').innerHTML = senateHTML;
      // console.log("console log house");
      // console.log(houseStr);
      document.getElementById('house').innerHTML = houseHTML ;

    }
  });
}

  // add info/legend
  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
      this._div.innerHTML = '<h3>Search by clicking a State</h3>' +  (props ?
          '<h2>' + props.full_name + '</h2></sup>'
          :'-');
  };

  info.addTo(map);


    // apply functions to user actions
    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature, //on mouseover, call this function
        mouseout: resetHighlight, // on mouseout, call this function
        click: redirect,
      });
    }

    var geojson = L.geoJson(stateData, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
    }

    //define regex expression for cid
    var fundid = /N\d{8}/;
    // N00034580

    function getEvents(t){
      $.ajax({
        url: '/party',
        type: 'POST',
        data: t,
        error: function(resp){
          console.log("no party");
          // console.log(resp);
        },
        success: function(resp){
          console.log("yay party");
          // console.log(resp.events);

          var Events = "<h3> Recent Events </h3>";
          for (var i = 0; i < resp.events.length; i++) {
            var name = resp.events[i].entertainment;
            var date = resp.events[i].date;
            var contributions = resp.events[i].contributions_info;
            var checks = resp.events[i].checks;

            Events += '<b>' + name + "</b><br>Date: " + date + "</br> Contributions: " + contributions + "</br> Checks payable to: " + checks + "<br><br>" ;
          }

          document.getElementById('main').style.opacity = "0.1";
          document.getElementById('main').style.color = "black";
          document.getElementById('main').style.width = "100%";
          document.getElementById('main').style.height = "100%";
          document.getElementById('main').style.zIndex = "100";
          document.getElementById('main').style.pointerEvents = "none";

          document.getElementById('party-info').innerHTML = Events;

        } //success paren
      }); //ajax paren
    }

    // <div class="topright">Top Right</div>

    function getFunds(t){
      $.ajax({
        url: '/opensecrets',
        type: 'POST',
        data: t,
        error: function(resp){
          console.log("no secrets");
          console.log(resp);
        },
        success: function(resp){
          console.log("open secrets");
          console.log(resp);

          var data = resp.sectors ;
          console.log("data: " + data);

          // set the dimensions of the canvas
          var margin = {top: 20, right: 20, bottom: 250, left: 450},
              width = 950 - margin.left - margin.right,
              height = 575 - margin.top - margin.bottom;

          // set the ranges
          var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
          var y = d3.scale.linear().range([(height+20), 0]);

          // define the axis
          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(14);

          // add the SVG element
          // var svg = d3.select("#graph").append("svg")
          // var svg = d3.select("div").append("svg")
          var svg = d3.select("body").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

          // svg repositioning
          $("svg").css({top: 150, left: 130, position:'absolute'});


            // scale the range of the data
            x.domain(data.map(function(d) { return d.sector_name; }));
            y.domain([0, d3.max(data, function(d) { return d.total; })]);

            // add axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
              .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)" );

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 5)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Contributions $");


            // Add bar chart
            svg.selectAll("bar")
                .data(data)
              .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.sector_name); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.total); })
                .attr("height", function(d) { return height - y(d.total); });

                function type(d) {
                  d.total = +d.total; // coerce to number
                  return d;
                }

          // });
        } //success paren
      }); //ajax paren
    }

    // check if what was clicked was a congressperson
    //if yes, then search & redirect
    document.body.addEventListener ("click", function (event) {
          var target = event.target.id;
          var targetObj = {"fundid": event.target.id};
          if (fundid.test(target)){
            getEvents(targetObj);
            getFunds(targetObj);
            $("body").append('<div id="topright">X</div>');
            document.getElementById("topright").addEventListener("click", function(){
              location.reload();
            });
          } // regex paren
      }); //click paren


//So here is a useful thing
      // document.body.addEventListener ("click", function (event) {
      //       var target = event.target.id;
      //       console.log(target);
      //   });

}); //document.ready close paren
