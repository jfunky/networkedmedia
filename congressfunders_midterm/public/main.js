// <script type="text/javascript">
$(document).ready(function(){

  // Setting up the map (code that we're used to)
  var map = L.map('map').setView([39.8, -96], 4);
  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 4,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  }).addTo(map);

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
      color: "#00133D",
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
    url: '/saveState',
    type: 'POST',
    data: state,
    error: function(resp){
      console.log("Uhoh");
      // console.log(resp);
    },
    success: function(resp){
      console.log("Woohoo");
      // console.log(resp);

      // for resp.senate[0].name
      senateList = resp.senate ;
      var senateStr = "";
      for (var i = 0; i < senateList.length; i++) {
        var name = senateList[i].name;
        var party = senateList[i].party;
        var first_elected = senateList[i].first_elected;
        var comments = senateList[i].comments;
        var cid = senateList[i].cid;
        var web = senateList[i].web;
        // name.addEventListener('click', search);

        senateStr += '<b class="cgname" id="' + cid + '">' + name + "</b>, " + party + ", " + "<a href='" + web + "'>website</a><br>" + comments + "<br><br>" ;
      }

      houseList = resp.house ;
      var houseStr = "";
      for (var i = 0; i < houseList.length; i++) {
        var name = houseList[i].name;
        var party = houseList[i].party;
        var first_elected = houseList[i].first_elected;
        var comments = houseList[i].comments;
        var cid = houseList[i].cid;
        var web = houseList[i].web;
        // name.addEventListener('click', search);

        houseStr += '<b class="cgname" id="' + cid + '">' + name + "</b>, " + party + ", " + "<a href='" + web + "'>website</a><br>" + comments + "<br><br>" ;
      }

      // console.log("console log senate");
      // console.log(senateStr);
      document.getElementById('senate').innerHTML = senateStr;
      // console.log("console log house");
      // console.log(houseStr);
      document.getElementById('house').innerHTML = houseStr ;

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

    // check if what was clicked was a congressperson
    //if yes, then search & redirect
    document.body.addEventListener ("click", function (event) {
          var target = event.target.id;
          var targetObj = {"fundid": event.target.id};
          if (fundid.test(target)){
            $.ajax({
              url: '/party',
              type: 'POST',
              data: targetObj,
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

                  Events += '<b>' + name + "<br>Date:</b> " + date + "</br><b>Contributions:</b> " + contributions + "</br><b>Checks payable to:</b> " + checks + "<br><br>" ;
                }

                document.getElementById('party-info').innerHTML = Events;

              } //success paren
            }); //ajax paren
          } // regex paren
      }); //click paren


//So here is a useful thing
      // document.body.addEventListener ("click", function (event) {
      //       var target = event.target.id;
      //       console.log(target);
      //   });

}); //document.ready close paren
