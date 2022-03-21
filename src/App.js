import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
// eslint-disable-next-line
import mapboxgl from "!mapbox-gl";
import axios from "axios";
import Button from "@mui/material/Button";
import "./App.css";

mapboxgl.accessToken = "pk.eyJ1IjoiaWFua2hvdSIsImEiOiJja3U1enMzNHE0enN4Mm9waXNwcDlyeGVpIn0.gz1TKA2H5JfDkMiHkdVxRQ";

export default function App() {
	// update users from Google Sheet
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [users, setUsers] = useState(null);
	const [lng, setLng] = useState(-98.08226562598172);
	const [lat, setLat] = useState(39.67197697791948);
	const [zoom, setZoom] = useState(3);

	useEffect(() => {
		if (!map.current) return; // wait for map to initialize
		map.current.on("move", () => {
			setLng(map.current.getCenter().lng.toFixed(4));
			setLat(map.current.getCenter().lat.toFixed(4));
			setZoom(map.current.getZoom().toFixed(2));
		});
	});

	function addPopup(el, coords) {
		const placeholder = document.createElement("div");
		ReactDOM.render(el, placeholder);
  
		new mapboxgl.Popup()
			.setDOMContent(placeholder)
			.setLngLat(coords)
			.addTo(map.current);
	}

	useEffect(() => {
		if (users) return;
		const axiosStart = performance.now();
		// axios.get("https://damp-waters-93180.herokuapp.com/https://script.google.com/macros/s/AKfycbw4H4dqvK6b4iIW_RkF80__SzI3bpCi0k6-OxQdv2-utpXJbcTY8d_KsdIOS-BSfEENxg/exec", { headers: { "Access-Control-Allow-Origin": "*" } })
		axios.get("https://script.google.com/macros/s/AKfycbw4H4dqvK6b4iIW_RkF80__SzI3bpCi0k6-OxQdv2-utpXJbcTY8d_KsdIOS-BSfEENxg/exec")

			.then((resp) => {
				const axiosEnd = performance.now();
				console.log(`Axios call took ${axiosEnd - axiosStart} milliseconds`);

				setUsers(resp.data);
        
				const features = {};

				const uniqueStart = performance.now();

				resp.data.forEach((d) => {          
					features[d["Email Address"]] =  {
						type: "Feature",
						properties: {
							weight: 1,
							users: [
								{
									timestamp: d["Timestamp"],
									name: d["Name (First Last)"],
									year: d["Year"],
									major: d["Major(s)"],
									activity: d["What will you be doing there (work, school, etc.)?"],
									roommate: d["Are you looking for a house/roommate?"] == "Yes" ? true : false,
									contact: d["Contact information"],
									email: d["Email Address"]
								},
							]
						},
						geometry: {
							type: "Point",
							coordinates: [
								d["Longitude"], d["Latitude"]
							]
						}
					};
				});

				const uniqueEnd = performance.now();

				console.log(`Eliminating duplicate records took ${uniqueEnd - uniqueStart} milliseconds`);
        
				const groupStart = performance.now();

				// set contains coordinates [long, lat]
				const locCache = new Set();

				const groupedFeatures = [];
				let groupI = 0;

				// map through each user
				Object.values(features).forEach((e) => {
					const long = e["geometry"]["coordinates"][0];
					const lat = e["geometry"]["coordinates"][1];
					let found = false;

					// forEach through the cache and check for similar loc
					locCache.forEach(c => {
						// if sim loc, group into the first occurrence
						if ((long - c[0]) ** 2 + (lat - c[1]) ** 2 < 0.001 ** 2) {
							// append to prev user list, inc weight, keep geometry
              
							const oldUserList = groupedFeatures[c[2]]["properties"]["users"];
							const oldGeometry = groupedFeatures[c[2]]["geometry"];
							const oldWeight = groupedFeatures[c[2]]["properties"]["weight"];

							groupedFeatures[c[2]] = {
								type: "Feature",
								properties: {
									weight: oldWeight + 1,
									users: [...oldUserList, e["properties"]["users"][0]]
								},
								geometry: oldGeometry
							};

							found = true;
						}
					});
					if (!found) {
						// if you've made it this far, there is not a match
					  // push the uniquely-located user to the group
						groupedFeatures.push(e);
						// cache their location and group index, increment group index
						locCache.add([long, lat, groupI]);
						groupI ++;
					}
					
				});
				
				const groupEnd = performance.now();

				console.log(`Grouping records took ${groupEnd - groupStart} milliseconds`);


				const userCollection = {
					type: "FeatureCollection",
					features: groupedFeatures
				};

				if (map.current) return; // initialize map only once
    
				const mapStart = performance.now();

				map.current = new mapboxgl.Map({
					container: mapContainer.current,
					style: "mapbox://styles/mapbox/dark-v10",
					center: [lng, lat],
					zoom: zoom
				});
    
				map.current.on("load", () => {
					map.current.addSource("users", {
						type: "geojson",
						data: userCollection
					});

					map.current.addLayer(
						{
							id: "users-heat",
							type: "heatmap",
							source: "users",
							maxzoom: 14,
							paint: {
								// increase weight as diameter breast height increases
								"heatmap-weight": {
									type: "exponential",
									stops: [
										[1, 0],
										[500, 30],
									]
								},
								// increase intensity as zoom level increases
								"heatmap-intensity": {
									stops: [
										[11, 1],
										[15, 3]
									]
								},
								// assign color values to points depending on their density
								"heatmap-color": [
									"interpolate",
									["linear"],
									["heatmap-density"],
									0,
									"rgba(255,153,153,0)",
									0.2,
									"rgb(255,0,0)",
									0.4,
									"rgb(204,0,0)",
									0.6,
									"rgb(153,0,0)",
									0.8,
									"rgb(102,0,0)"
								],
								// increase radius as zoom increases
								"heatmap-radius": {stops: [[11, 15],[15, 20]]},
								// decrease opacity to transition into the circle layer
								"heatmap-opacity": {
									default: 1,
									stops: [
										[14, 1],
										[15, 0]
									]
								}
							}
						},
						"waterway-label"
					);

					map.current.addLayer(
						{
							id: "users-point",
							type: "circle",
							source: "users",
							minzoom: 12,
							paint: {
								// increase the radius of the circle as the zoom level and weight increases
								"circle-radius": {property: "weight",type: "exponential",stops: [[{ zoom: 15, value: 1 }, 20],[{ zoom: 15, value: 62 }, 40],[{ zoom: 22, value: 1 }, 80],[{ zoom: 22, value: 62 }, 200]]},
								"circle-color": {
									property: "weight",
									type: "exponential",
									stops: [
										[0, "rgb(100,0,0)"],
										[10, "rgb(125,0,0)"],
										[20, "rgb(150,0,0)"],
										[30, "rgb(175,0,0)"],
										[40, "rgb(200,0,0)"],
										[50, "rgb(225,0,0)"],
										[60, "rgb(250,0,0)"],
									]
								},
								"circle-stroke-color": "white",
								"circle-stroke-width": 2,
								"circle-opacity": {
									stops: [
										[14, 0],
										[15, 1]
									]
								}
							}
						},
						"waterway-label"
					);

					map.current.on("click", "users-point", ({ features }) => {
						const { users } = features[0].properties;
						console.log(typeof JSON.parse(users)[0]["timestamp"], JSON.parse(users)[0]["timestamp"]);
						const myComp = (
							<div>
								{JSON.parse(users).map((user) =>
									<div className="user-container" key={`USER_INFO_BOX_FOR_${user["email"]}`}>
										<h1>{`${user["name"]} '${user["year"]}`}</h1>
										<p>Major(s): {user["major"]}</p>
										<p>What I&apos;m doing here: {user["activity"]}</p>
										{user["roommate"] ? <p>Looking for a house/roommate</p> : null}
										{user["contact"] ? <p>Contact: {user["contact"]}</p> : null}
										<p>Last updated: {new Date(user["timestamp"]).toString()}</p>
									</div>) }
							</div>
						);
        
						addPopup(myComp, features[0].geometry.coordinates);
					});
				});

				const mapEnd = performance.now();
				
				console.log(`Mapping records took ${mapEnd - mapStart} milliseconds`);



			});
	});

	return (
		<div>
			<div className="sidebar">
				<p>Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}</p>
				<Button className="action_button" size="small" variant="outlined" href="https://docs.google.com/forms/d/e/1FAIpQLSeL_-gto_kwPpzbZCJaGejjlfbrLwmW1TqobfToT4AHlxPIGA/viewform?usp=sf_link">
    add yourself (dartmouth email)
				</Button>
				<Button style={{ marginLeft: 10 }} className="action_button" size="small" variant="outlined" href="mailto:iankwanhou@gmail.com">
    alums
				</Button>
			</div>
      
			<div ref={mapContainer} className="map-container" />
      
		</div>
	);
}