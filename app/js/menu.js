"use strict";

const M = require("materialize-css");
const stitch = require("mongodb-stitch");
const L = require("leaflet");
// import stitch from "mongodb-stitch";

const client = new stitch.StitchClient("propertymanagementstitch-ohgyx");
const db = client.service("mongodb", "mongodb-atlas").db("Xique");
const loadImage = require("blueimp-load-image");

window.storedDB;

window.enableBox = function() {
  setTimeout(() => {
    const elem = document.querySelector(".materialboxed");
    window.elem = elem;
    window.instance = new M.Materialbox(elem);
  }, 300);
  // instance.open();
};

const updateDB = function(database = "", dataset = {}) {
  let datasetContent = dataset;
  const storageVariable = `${database}OfflineData`;
  if (dataset !== {}) {
    datasetContent["owner_id"] = client.authedId();
    datasetContent["Date"] = new Date();

    client
      .login()
      .then(() => db.collection(database).insertOne(datasetContent))
      .then(result => {
        console.log("[MongoDB Stitch] Updated:", result, dataset);
        M.toast({
          html: "Reports Uploaded: 1",
          displayLength: 1000,
          classes: "green darken-2"
        });
      })
      .catch(error => {
        console.error("[MongoDB Stitch] Error: ", error);
        // Save offline if offline
        let offlineData = [dataset];
        let combinedData = [];
        // let datasetContent = dataset;
        if (!window.localStorage[storageVariable] === false) {
          let parsedOfflineStorage = JSON.parse(
            window.localStorage.getItem(storageVariable)
          );
          console.log("[OfflineDB]", offlineData, parsedOfflineStorage);
          combinedData = offlineData.concat(parsedOfflineStorage);
          console.log("[OfflineDB]", combinedData);
          window.localStorage.setItem(
            storageVariable,
            JSON.stringify(combinedData)
          );
        } else {
          window.localStorage.setItem(
            storageVariable,
            JSON.stringify(offlineData)
          );
        }
        M.toast({
          html: "Reports Saved: " + offlineData.length,
          displayLength: 4000,
          classes: "yellow darken-2"
        });
        offlineUp(database);
      });
  }
};

/**
 *  Function to Collect Data, send to Database and Congratulate User
 *
 * @param {any} Database Collection
 * @param {string} A Congratulatory Message
 */
const collectInputs = function(
  databaseCollection = {},
  congratulatoryMessage = ""
) {
  const form = parent.document.getElementsByTagName("form")[0];
  window.data = {
    Location: {
      type: "Point",
      coordinates: []
    }
  };
  if (!window.dataURL === false) {
    window.data.Photo = window.dataURL;
  }

  // Processing Form data then Saving to Database
  const elements = form.elements;

  for (let e = 0; e < elements.length; e++) {
    if (
      elements[e].id === "Photos" ||
      elements[e].id === "photoFilePath" ||
      elements[e].id.length < 1
    ) {
      // console.log("[Form1] Excluded: ", elements[e]);
    } else if (elements[e].value.id === "Date") {
      // window.data[elements[e].id] = {
      window.data[elements[e].id] = {
        $date: new Date().toISOString()
        // $date: new Date(elements[e].value)
      };
    } else if (elements[e].id === "Longitude") {
      window.data.Location.coordinates[0] = parseFloat(
        elements[e].value,
        10
      );
    } else if (elements[e].id === "Latitude") {
      window.data.Location.coordinates[1] = parseFloat(
        elements[e].value,
        10
      );
    } else if (elements[e].id === "Altitude") {
      window.data.Location.coordinates[2] = parseFloat(
        elements[e].value,
        10
      );
    } else if (elements[e].type == "checkbox") {
      window.data[elements[e].id] = elements[e].checked;
    } else if (
      elements[e].type == "number" ||
      elements[e].id == "Quantity" ||
      elements[e].id == "ObservationArea"
    ) {
      window.data[elements[e].id] = parseInt(elements[e].value, 10);
    } else if (elements[e].value.length > 0) {
      window.data[elements[e].id] = elements[e].value;
    }
    //  else {
    //   console.log("[Form2] Excluded:", elements[e]);
    // }
  }

  window.showMissions(3000);
  updateDB(databaseCollection, window.data);
  // Congratulatory Message
  M.toast({
    html: congratulatoryMessage,
    displayLength: 4000,
    classes: "blue darken-2"
  });
};
window.collectInputs = collectInputs;

const offlineUp = function(databaseCollection) {
  let storageVariable = `${databaseCollection}OfflineData`;
  // try to upload offline data to DB when online
  if (window.localStorage[storageVariable] && navigator.onLine) {
    let offlineData = JSON.parse(
      window.localStorage.getItem(storageVariable)
    );
    client
      .login()
      .then(() =>
        db.collection(databaseCollection).insertMany(offlineData)
      )
      .then(result => {
        window.localStorage.removeItem(storageVariable);
        console.log(
          "[MongoDB Stitch] Offline Updated:",
          result,
          offlineData
        );
        M.toast({
          html: "Reports Uploaded: " + offlineData.length,
          displayLength: 3000,
          classes: "green darken-2"
        });
      })
      .catch(error => {
        console.error("[MongoDB Stitch] Error: ", error);
        M.toast({
          html: "Will Retry in 30 Seconds",
          displayLength: 4000,
          classes: "yellow darken-2"
        });
        window.offlineUploadAttempt = setTimeout(() => {
          updateDB(databaseCollection);
        }, 30000);
      });
  }
};
window.offlineUp = offlineUp;
// Empty variable to gather and hold html for mission cards in memory
let missionCardsHTML = ``;

// Empty variable to gather and hold geographical references
window.geoReference = {};

// The DOM element that holds the mission cards
const missionsElement = document.getElementById("missions");
module.exports = missionsElement;

// Collecting all Missions in a Set
// let Properties = new Set();

class Propiedad {
  constructor({
    shortName = "shortName",
    title = "Title",
    description = "Description",
    // Each Mission should specify its collection in the MongoDB database
    databaseCollection = "mongoDbCollection",
    congratulatoryMessage = "Congratulations!",
    // Data for form submission
    // monitor = ``,
    // Data retrieval and display
    // analyze = ``,
    // Each mission should have a representative image
    image = require("../img/trail.jpg"),
    monitorSuccess,
    analyzeSuccess
    // queryDB
  }) {
    const missions = document.getElementById("missions");
    const navigationBreadcrumbs = document.getElementById(
      "navigationBreadcrumbs"
    );
    this.shortName = shortName;
    this.title = title;
    this.description = description;
    this.image = image;
    this.databaseCollection = databaseCollection;
    this.congratulatoryMessage = congratulatoryMessage;
    this.monitorSuccess = monitorSuccess;
    this.analyzeSuccess = analyzeSuccess;
    this.queryDB = function(database = this.databaseCollection, query) {
      M.toast({
        html: "Connecting...",
        displayLength: 1000,
        classes: "green darken-2"
      });
      missions.innerHTML = `
      <div class="fullscreen" id="map2"></div>
      `;

      navigationBreadcrumbs.innerHTML = `
      <a onclick="showMissions(600)" class="pointer breadcrumb">${
        this.title
      }</a>
        <a class="pointer breadcrumb">Consultar Datos</a>
        `;

      window.scrollTo(0, 0);

      const map = L.map("map2", {
        tapTolerance: 64,
        zoomControl: false
      });
      window.map = map;
      // .fitWorld()
      // .setZoom(2);

      // Get information from Database
      client
        .login()
        .then(
          () => db.collection(database).find(query)
          // .limit(100)
          // .execute()
        )
        .then(docs => {
          let queryDBResult = docs;
          console.log("[MongoDB Stitch] Found: ", queryDBResult);
          M.toast({
            html: "Reports Found: " + queryDBResult.length,
            displayLength: 1000,
            classes: "green darken-2"
          });
          this.analyze(queryDBResult);
          localStorage.setItem(database, JSON.stringify(queryDBResult));
          console.log("[LocalDB Updated]", queryDBResult);
          // Track time of last local DB update
          let lastUpdateLocalDB = new Date().getTime();
          window.lastUpdateLocalDB = lastUpdateLocalDB;
          window.localStorage.setItem(
            "lastUpdateLocalDB",
            lastUpdateLocalDB
          );
          window.lastUpdateLocalDB = window.localStorage.getItem(
            "lastUpdateLocalDB"
          );
        })
        .catch(err => {
          console.log("[Error]", err);
          if (window.localStorage[database]) {
            console.log("[LocalDB Exists]", database);
            this.analyze(JSON.parse(localStorage.getItem(database)));
            M.toast({
              html: "Using offline data",
              displayLength: 4000,
              classes: "yellow darken-2"
            });
          } else {
            console.error(err);
            M.toast({
              html: "Unable to Connect",
              displayLength: 4000,
              classes: "red darken-2"
            });
          }
        });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // const geoJSONTrails = require("./trails.json");

      // window.mappedTrails = L.geoJSON(geoJSONTrails, {
      //   style: function(feature) {
      //     return {
      //       color: feature.properties.stroke,
      //       opacity: 0.6,
      //       dashArray: [7, 5]
      //     };
      //   }
      // });
      // map.fitBounds(window.mappedTrails.getBounds(), { padding: [82, 82] });
      // mappedTrails.addTo(map);
    };
    this.monitor = function() {
      navigator.geolocation.getCurrentPosition(
        position => {
          window.geoReference = {
            lat: position.coords.latitude || 0,
            long: position.coords.longitude || 0,
            alt: position.coords.altitude || 0,
            accuracy: position.coords.accuracy || 0
          };
          this.monitorSuccess();

          navigationBreadcrumbs.innerHTML = `
          <a onclick="showMissions(600)" class="pointer breadcrumb">${
            this.title
          }</a>
          <a class="pointer breadcrumb">Registrar propiedad</a>
          `;
          M.updateTextFields();
          let multiSelect = document.querySelectorAll("select");
          for (const element in multiSelect) {
            if (multiSelect.hasOwnProperty(element)) {
              new M.Select(multiSelect[element]);
            }
          }
          // let datePicker = document.querySelectorAll(".datepicker");
          // for (const element in datePicker) {
          //   if (datePicker.hasOwnProperty(element)) {
          //     const datePickerInstance = new M.Datepicker(datePicker[element], {
          //       // container: ".datepicker",
          //       setDefaultDate: true,
          //       // format: "mmm-dd-yyyy",
          //       defaultDate: new Date(),
          //       yearRange: 2
          //     });
          //   }
          // }
          window.scrollTo(0, 0);
          // Resize, Load and Orient Photo
          document.getElementById("Photos").onchange = function(e) {
            console.log("[Image Loaded]", e.target.files[0]);
            loadImage(
              e.target.files[0],
              function(img) {
                // let canvas = document.createElement("canvas");
                let canvas = document.getElementById("photoPreview");
                var ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                window.dataURL = canvas.toDataURL("image/jpeg", 0.5);
                console.log("[Image Resizer]", canvas);
              },
              {
                maxWidth: 256,
                orientation: true
              }
            );
          };
        },
        error => {
          M.toast({
            html: error.message,
            displayLength: 4000,
            classes: "red darken-2"
          });
          window.geoReference = {
            lat: "Latitude",
            long: "Longitude",
            alt: "Altitude"
          };
          showMissions(600);
          console.log("[GPS Denied]", error);
        },
        {
          enableHighAccuracy: true,
          // timeout: 5000,
          maximumAge: 30000
        }
      );
    };
    this.analyze = function(queryDBResultOriginal) {
      console.log("[Analyze Init:]", queryDBResultOriginal);
      let queryDBResult = [];
      let storageVariable = `${this.databaseCollection}OfflineData`;
      // Save offline if offline
      // let datasetContent = dataset;
      if (!window.localStorage[storageVariable] === false) {
        let parsedOfflineStorage = JSON.parse(
          window.localStorage.getItem(storageVariable)
        );
        console.log(
          "[OfflineDB Init]",
          queryDBResultOriginal,
          parsedOfflineStorage
        );
        queryDBResult = queryDBResultOriginal.concat(
          parsedOfflineStorage
        );
        console.log("[OfflineDB Eval] Combined:", queryDBResult);
      } else {
        queryDBResult = queryDBResultOriginal;
        console.log("[OfflineDB Eval] Combined:", queryDBResult);
      }
      if (queryDBResult.length === 0) {
        M.toast({
          html: "Database Empty",
          displayLength: 1000,
          classes: "yellow darken-2"
        });
        return false;
      }

      offlineUp(this.databaseCollection);
      const geoJSONPoints = [];

      for (let i = queryDBResult.length - 1; i > -1; i--) {
        let dbResponse = `<span>${new Date(
          queryDBResult[i].Date
        )}</span><br>`;

        for (const key in queryDBResult[i]) {
          // For simplicity, do not show these database results:
          if (
            key === "_id" ||
            key === "owner_id" ||
            key === "Date" ||
            key === "Location" ||
            key === "Photo" ||
            key === "photoFilePath" ||
            key === "Photos" ||
            key === "Status" ||
            key === "timestamp" ||
            queryDBResult[i][key] === false ||
            queryDBResult[i][key] === "Low"
          ) {
          } else {
            // Format for displaying information in map popups
            dbResponse += `<span class="strong">${key}: </span><span>${
              queryDBResult[i][key]
            }</span><br>`;
          }
        }

        queryDBResult[i]["Location"]["properties"] = {
          description: dbResponse
        };

        if (
          !queryDBResult[i].Photo === false &&
          queryDBResult[i].Photo.length > 20
        ) {
          queryDBResult[
            i
          ].Location.properties.photo = `<img class="responsive-img materialboxed" data-caption="${
            queryDBResult[i].Date
          }"
             onload="enableBox()" onclick="enableBox()"
            
           src="${queryDBResult[i].Photo}">`;
        }
        if (!queryDBResult[i].ObservationArea) {
          // Size of map marker for missions other than Tumalre
          queryDBResult[i].Location.properties.radius = 14;
        } else {
          queryDBResult[i].Location.properties.quantity =
            queryDBResult[i].Quantity;
          queryDBResult[i].Location.properties.radius =
            queryDBResult[i].ObservationArea;
        }
        geoJSONPoints.push(queryDBResult[i].Location);
      }

      let options = {
        pointToLayer: function(feature, latlng) {
          let popInfo = `${feature.properties.description}<br>`;
          if (!feature.properties.photo === false) {
            popInfo += `${feature.properties.photo}`;
          }
          return new L.circleMarker(latlng, {
            radius: 14,
            fillColor: "#0d48a1",
            color: "#f5f5f5",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.7
          }).bindPopup(`${popInfo}`);
        }
      };

      // Passing all points to cluster marker with the above mission display options
      let reports = L.geoJSON(geoJSONPoints, options);
      console.log("[Leaflet] Mapped:", geoJSONPoints);
      var markers = L.markerClusterGroup({
        spiderLegPolylineOptions: {
          weight: 2.4,
          color: "#f5f5f5",
          opacity: 1
        },
        // singleMarkerMode: true,
        spiderfyDistanceMultiplier: 1.3,
        maxClusterRadius: 92,
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
          var childCount = cluster.getChildCount();
          // different styles for the cluster depending on the area covered
          var c = " marker-cluster-";
          c += "small";
          // if (childCount < 10) {
          //   c += "small";
          // } else if (childCount < 20) {
          //   c += "medium";
          // } else {
          //   c += "large";
          // }

          return new L.DivIcon({
            html: "<div><span>" + childCount + "</span></div>",
            className: "marker-cluster" + c + " fadeIn",
            iconSize: new L.Point(36, 36)
          });
        }
      });
      // https://github.com/Leaflet/Leaflet.markercluster

      markers.addLayer(reports);

      window.map.addLayer(markers);
      markers.on("spiderfied", function(a) {
        a.cluster._icon.classList.remove("fadeIn");
        a.cluster._icon.classList.add("fadeOut");
      });
      markers.on("unspiderfied", function(a) {
        a.cluster._icon.classList.remove("fadeOut");
        a.cluster._icon.classList.add("fadeIn");
      });
    };

    // Displays on Front Page
    this.card = `<div class="cardContainer" id="${this.title}">
  <div class="col s12 m12 l6">
    <div class="card">
      <div class="card-image">
        <img src="${this.image}">
        <span class="card-title">
          <b>${this.title}</b>
        </span>
      </div>
      <div class="card-content">
        <div>${this.description}</div>
      </div>
      <div class="card-action">
        <a class="pointer" onclick="${
          this.shortName
        }.monitor()">Registrar propiedad</a>
        <a class="pointer" onclick="${
          this.shortName
        }.queryDB()">Consultar Datos</a>
      </div>
    </div>
  </div>
</div>
`;

    // Missions.add(this);
    // Add Mission Cards to DOM
    missionCardsHTML += this.card;
  }
}

// Show missinos in the front page
const showMissions = function(seconds = 290) {
  const loading = document.getElementById("loading");
  const missions = document.getElementById("missions");
  const navigationBreadcrumbs = document.getElementById(
    "navigationBreadcrumbs"
  );

  loading.classList.remove("fadeOut");
  loading.classList.add("fadeIn");
  missions.innerHTML = "";
  setTimeout(() => {
    window.scrollTo(0, 0);
    missions.innerHTML = missionCardsHTML;
    navigationBreadcrumbs.innerHTML = `
    <a class="pointer breadcrumb">Inicio</a>
    `;
    setTimeout(() => {
      loading.classList.remove("fadeIn");
      loading.classList.add("fadeOut");
    }, 290);
  }, seconds);
};
window.showMissions = showMissions;

window.addEventListener("DOMContentLoaded", function() {
  const loading = document.getElementById("loading");
  const missions = document.getElementById("missions");
  const navigationBreadcrumbs = document.getElementById(
    "navigationBreadcrumbs"
  );
  // Add HTML Mission Cards to the DOM
  missions.innerHTML = missionCardsHTML;
  navigationBreadcrumbs.innerHTML = `
  <a class="pointer breadcrumb">Inicio</a>
  `;
  window.scrollTo(0, 0);
  setTimeout(() => {
    loading.classList.add("fadeOut");
  }, 290);
});

module.exports = Propiedad;
