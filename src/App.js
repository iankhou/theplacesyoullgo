import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
// eslint-disable-next-line
import mapboxgl from "!mapbox-gl";
import axios from "axios";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { deepPurple } from "@mui/material/colors";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import "./App.css";

mapboxgl.accessToken = "pk.eyJ1IjoiaWFua2hvdSIsImEiOiJja3U1enMzNHE0enN4Mm9waXNwcDlyeGVpIn0.gz1TKA2H5JfDkMiHkdVxRQ";

export default function App() {
	// update users from Google Sheet
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [users, setUsers] = useState(null);
	const [lng, setLng] = useState(-98.0822);
	const [lat, setLat] = useState(39.6719);
	const [zoom, setZoom] = useState(3);
	const [search, setSearch] = useState(false);
	const theme = createTheme({
		palette: {
			mode: "dark",
			primary: {
			  main: deepPurple[400],
			},
		  },
	  });

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

	const formPopup = (users) => {
		return <div>
			{users.map((user) => {
				console.log(user);
				return <div className="user-container" key={`USER_INFO_BOX_FOR_${user["email"]}`}>
					<h1>{`${user["name"]} '${user["year"]}`}</h1>
					{user["roommate"] ? <h3><b>Looking for a house/roommate</b></h3> : null}
					<p>Major(s): {user["major"]}</p>
					<p>What I&apos;m doing here: {user["activity"]}</p>
					{user["contact"] ? <p>Contact: {user["contact"]}</p> : null}
					<p>Last updated: {new Date(user["timestamp"]).toLocaleDateString()}</p>
				</div>;
			}
			) }
		</div>;
	};

	useEffect(() => {
		if (users) return;
		const axiosStart = performance.now();
		axios.get("https://script.google.com/macros/s/AKfycbw4H4dqvK6b4iIW_RkF80__SzI3bpCi0k6-OxQdv2-utpXJbcTY8d_KsdIOS-BSfEENxg/exec")

			.then((resp) => {
				const axiosEnd = performance.now();
				console.log(`Axios call took ${axiosEnd - axiosStart} milliseconds`);
        
				const features = {};

				const uniqueStart = performance.now();
				console.log(resp.data[resp.data.length - 1]);
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
									activity: d["What will you be doing there (ex. Working at McDonalds as a Software Engineer)?"],
									roommate: d["Are you looking for a house/roommate?"] == "Yes" ? true : false,
									contact: d["Contact information"],
									email: d["Email Address"]
								},
							],
							attention: d["Are you looking for a house/roommate?"] == "Yes" ? 1 : 0,
						},
						geometry: {
							type: "Point",
							coordinates: [
								d["Longitude"], d["Latitude"]
							]
						}
					};
				});
				setUsers(features);

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
							const oldAttention = groupedFeatures[c[2]]["properties"]["attention"];
							
							groupedFeatures[c[2]] = {
								type: "Feature",
								properties: {
									weight: oldWeight + 1,
									users: [...oldUserList, e["properties"]["users"][0]],
									attention: + [oldAttention, e["properties"]["attention"]].some((a) => a === 1)
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
									"rgb(0,255,150)",
									0.4,
									"rgb(50,204,0)",
									0.6,
									"rgb(50,153,0)",
									0.8,
									"rgb(50,102,0)"
								],
								// increase radius as zoom increases
								"heatmap-radius": {stops: [[11, 15],[15, 20]]},
								// decrease opacity to transition into the circle layer
								"heatmap-opacity": {
									default: 1,
									stops: [
										[11, 1],
										[12, 0]
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
							minzoom: 5,
							paint: {
								// increase the radius of the circle as the zoom level and weight increases
								"circle-radius": 8,
								"circle-color": {
									property: "attention",
									type: "exponential",
									stops: [
										[0, "rgb(0,225,0)"],
										[1, "rgb(255,200,0)"]
									]
								},
								"circle-stroke-color": "rgba(0,100,0, 0.3)",
								"circle-stroke-width": 1,
								"circle-opacity": {
									stops: [
										[11, 0],
										[12, 1]
									]
								}
							}
						},
						"waterway-label"
					);

					map.current.on("click", "users-point", ({ features }) => {
						const { users } = features[0].properties;
						const myComp = formPopup(JSON.parse(users));
						addPopup(myComp, features[0].geometry.coordinates);
					});
				});

				const mapEnd = performance.now();
				
				console.log(`Mapping records took ${mapEnd - mapStart} milliseconds`);



			});
	});
	let options;

	if (users) {
		options = Object.keys(users).map((email) => {
			return {
				email,
				name: users[email].properties.users[0].name,
				year: users[email].properties.users[0].year,
				location: users[email].geometry.coordinates,
				userData: users[email].properties.users
			};
		});
	} else {
		options = [];
	}
	return (

		<div>
			<div className="sidebar">
				<p style={{marginBottom: 5}}>Long: {lng} | Lat: {lat} | Zoom: {zoom}<br />Yellow dots need roommates (zoom in)<br />Add yourself to the map!</p>
				<ThemeProvider theme={theme}>
					<Button style={{marginRight:10}} className="action_button" size="small" variant="outlined" onClick={()=>setSearch(true)}>
    search
					</Button>
					<Button className="action_button" size="small" variant="outlined" href="https://docs.google.com/forms/d/e/1FAIpQLSeL_-gto_kwPpzbZCJaGejjlfbrLwmW1TqobfToT4AHlxPIGA/viewform?usp=sf_link">
    students
					</Button>
					<Button style={{ margin: 10 }} className="action_button" size="small" variant="outlined" href="https://docs.google.com/forms/d/e/1FAIpQLSfN9_kXsE0C4RcdjWCGpTgGH4cwAgVoAeKLCxVW9voIYm4BLQ/viewform?usp=sf_link">
    alums
					</Button>
				</ThemeProvider>
				
				<Modal center 
					classNames={{
						overlay: "customOverlay",
						modal: "customModal",
					}}
					open={search} onClose={() => setSearch(false)}>
					<ThemeProvider theme={theme}>
						<Autocomplete 
							options={options}
							isOptionEqualToValue={(option, value) => option.email === value.email}
							getOptionLabel={(option) => option.name}
							autoComplete
							renderInput={(params) => <TextField {...params} label="Search" />}
							renderOption={(props, option) => <li {...props} key={option.email}>{option.name} (&lsquo;{option.year})</li>}

							sx={{color: "black"}}
							onChange={(e, val) => {
								setSearch(false);
								map.current.flyTo(
									{
										center: val.location,
										zoom: 13
									}
								);
								const myPopup = formPopup(val.userData);
								addPopup(myPopup, val.location);
							}}
						
						/>
					</ThemeProvider>

				</Modal>
				

			</div>
      
			<div ref={mapContainer} className="map-container" />
      
		</div>

	);
}