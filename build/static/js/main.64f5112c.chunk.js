(this.webpackJsonpotpyg=this.webpackJsonpotpyg||[]).push([[0],{108:function(e,t,o){},128:function(e,t,o){},134:function(e,t,o){"use strict";o.r(t);var r=o(0),n=o.n(r),a=o(22),c=o.n(a),s=(o(108),o(52)),i=o(15),l=o(10),u=o(53),p=o.n(u),m=o(83),d=o.n(m),j=o(190),b=o(189),f=o(185),h=o(186),O=o(89),g=o(188),y=o(178),x=o(88),v=o.n(x),w=o(87),k=o.n(w),F=o(86),L=o.n(F),M=(o(127),o(84)),C=(o(128),o(2));function S(){var e=Object(r.useRef)(null),t=Object(r.useRef)(null),o=Object(r.useState)(null),n=Object(l.a)(o,2),a=n[0],u=n[1],m=Object(r.useState)(-98.0822),x=Object(l.a)(m,2),w=x[0],F=x[1],S=Object(r.useState)(39.6719),E=Object(l.a)(S,2),N=E[0],I=E[1],A=Object(r.useState)(3),z=Object(l.a)(A,2),D=z[0],T=z[1],J=Object(r.useState)(!1),_=Object(l.a)(J,2),R=_[0],B=_[1],H=Object(r.useState)(!1),Q=Object(l.a)(H,2),V=Q[0],X=Q[1],P=Object(O.a)({palette:{mode:"dark",primary:{main:y.a[400]}}});function Y(e,o){var r=document.createElement("div");c.a.render(e,r),(new p.a.Popup).setDOMContent(r).setLngLat(o).addTo(t.current)}Object(r.useEffect)((function(){t.current&&t.current.on("move",(function(){F(t.current.getCenter().lng.toFixed(4)),I(t.current.getCenter().lat.toFixed(4)),T(t.current.getZoom().toFixed(2))}))}));var K=function(e){return Object(C.jsx)("div",{children:e.map((function(e){return Object(C.jsxs)("div",{className:"user-container",children:[Object(C.jsx)("h1",{children:"".concat(e.name," '").concat(e.year)}),e.roommate?Object(C.jsx)("h3",{children:Object(C.jsx)("b",{children:"Looking for a house/roommate"})}):null,Object(C.jsxs)("p",{children:["Major(s): ",e.major]}),Object(C.jsxs)("p",{children:["What I'm doing here: ",e.activity]}),e.contact?Object(C.jsxs)("p",{children:["Contact: ",e.contact]}):null,Object(C.jsxs)("p",{children:["Last updated: ",new Date(e.timestamp).toLocaleDateString()]})]},"USER_INFO_BOX_FOR_".concat(e.email))}))})};Object(r.useEffect)((function(){if(!a){var o=performance.now();d.a.get("https://script.google.com/macros/s/AKfycbzqn-y8SAgoDB4QMh-XFzVwP1jrc2FDnh7GXFUy2Mkz6iKv9m5b0uhAKdT7Y9jrIQ7wcQ/exec").then((function(r){var n=performance.now();console.log("Axios call took ".concat(n-o," milliseconds"));var a={},c=performance.now();r.data.forEach((function(e){a[e["Email Address"]]={type:"Feature",properties:{weight:1,users:[{timestamp:e.Timestamp,name:e["Name (First Last)"],year:e.Year,major:e["Major(s)"],activity:e["What have/will you be(en) doing there (ex. Working at McDonalds as a Software Engineer)?"],roommate:"Yes"==e["Are you looking for a house/roommate?"],contact:e["Contact information"],email:e["Email Address"]}],attention:"Yes"==e["Are you looking for a house/roommate?"]?1:0},geometry:{type:"Point",coordinates:[e.Longitude,e.Latitude]}}})),u(a);var s=performance.now();console.log("Eliminating duplicate records took ".concat(s-c," milliseconds"));var l=performance.now(),m=new Set,d=[],j=0;Object.values(a).forEach((function(e){var t=e.geometry.coordinates[0],o=e.geometry.coordinates[1],r=!1;m.forEach((function(n){if(Math.pow(t-n[0],2)+Math.pow(o-n[1],2)<Math.pow(.001,2)){var a=d[n[2]].properties.users,c=d[n[2]].geometry,s=d[n[2]].properties.weight,l=d[n[2]].properties.attention;d[n[2]]={type:"Feature",properties:{weight:s+1,users:[].concat(Object(i.a)(a),[e.properties.users[0]]),attention:+[l,e.properties.attention].some((function(e){return 1===e}))},geometry:c},r=!0}})),r||(d.push(e),m.add([t,o,j]),j++)}));var b=performance.now();console.log("Grouping records took ".concat(b-l," milliseconds"));var f={type:"FeatureCollection",features:d};if(!t.current){var h=performance.now();t.current=new p.a.Map({container:e.current,style:"mapbox://styles/mapbox/dark-v10",center:[w,N],zoom:D}),t.current.on("load",(function(){t.current.addSource("users",{type:"geojson",data:f}),t.current.addLayer({id:"users-heat",type:"heatmap",source:"users",maxzoom:14,paint:{"heatmap-weight":{type:"exponential",stops:[[1,0],[500,30]]},"heatmap-intensity":{stops:[[11,1],[15,3]]},"heatmap-color":["interpolate",["linear"],["heatmap-density"],0,"rgba(255,153,153,0)",.2,"rgb(0,255,150)",.4,"rgb(50,204,0)",.6,"rgb(50,153,0)",.8,"rgb(50,102,0)"],"heatmap-radius":{stops:[[11,15],[15,20]]},"heatmap-opacity":{default:1,stops:[[11,1],[12,0]]}}},"waterway-label"),t.current.addLayer({id:"users-point",type:"circle",source:"users",minzoom:5,paint:{"circle-radius":8,"circle-color":{property:"attention",type:"exponential",stops:[[0,"rgb(0,225,0)"],[1,"rgb(255,200,0)"]]},"circle-stroke-color":"rgba(0,100,0, 0.3)","circle-stroke-width":1,"circle-opacity":{stops:[[11,0],[12,1]]}}},"waterway-label"),t.current.on("click","users-point",(function(e){var t=e.features,o=t[0].properties.users;Y(K(JSON.parse(o)),t[0].geometry.coordinates)}))}));var O=performance.now();console.log("Mapping records took ".concat(O-h," milliseconds")),console.log("If you would like to help develop this site, please contact me (Ian Hou) via iankwanhou@gmail.com.")}}))}}));var U;return U=a?Object.keys(a).map((function(e){return{email:e,name:a[e].properties.users[0].name,year:a[e].properties.users[0].year,location:a[e].geometry.coordinates,userData:a[e].properties.users}})):[],Object(C.jsxs)("div",{children:[Object(C.jsxs)(g.a,{theme:P,children:[Object(C.jsxs)("div",{className:"top_left",children:[Object(C.jsxs)("p",{style:{marginBottom:5},children:["Long: ",w," | Lat: ",N,Object(C.jsx)("br",{}),"Add yourself to the map!"]}),Object(C.jsx)(b.a,{style:{marginRight:10},color:"primary",onClick:function(){return B(!0)},children:Object(C.jsx)(L.a,{})}),Object(C.jsx)(j.a,{className:"action_button",size:"small",variant:"contained",href:"https://docs.google.com/forms/d/e/1FAIpQLSdV4LNX-1XjJCtvneYMH1V4d6UdABtJRtr1LOJOM272fc4HOQ/viewform?usp=sf_link",children:"add yourself"})]}),Object(C.jsxs)("div",{className:"top_right",children:[Object(C.jsx)("p",{children:"Roommate seekers"}),Object(C.jsx)("div",{className:"inner_content",children:V&&a?Object.entries(a).filter((function(e){return!0===e[1].properties.users[0].roommate})).map((function(e){var o=Object(l.a)(e,2),r=o[0],n=o[1];return Object(C.jsx)("div",{className:"user-container",onClick:function(){t.current.flyTo({center:n.geometry.coordinates,zoom:13})},children:Object(C.jsx)("div",{children:n.properties.users[0].name})},r)})):null}),a?Object(C.jsx)("div",{style:{justifyContent:"center",display:"flex"},children:Object(C.jsx)(b.a,{"aria-label":"expand",color:"primary",onClick:function(){return X(!V)},children:V?Object(C.jsx)(k.a,{}):Object(C.jsx)(v.a,{})})}):null]})]}),Object(C.jsx)("div",{ref:e,className:"map-container"}),Object(C.jsx)(M.a,{center:!0,classNames:{overlay:"customOverlay",modal:"customModal"},open:R,onClose:function(){return B(!1)},children:Object(C.jsx)(g.a,{theme:P,children:Object(C.jsx)(f.a,{options:U,isOptionEqualToValue:function(e,t){return e.email===t.email},getOptionLabel:function(e){return e.name},autoComplete:!0,renderInput:function(e){return Object(C.jsx)(h.a,Object(s.a)({},e))},renderOption:function(e,t){return Object(r.createElement)("li",Object(s.a)(Object(s.a)({},e),{},{key:t.email}),t.name," (\u2018",t.year,")")},sx:{color:"black"},onChange:function(e,o){B(!1),t.current.flyTo({center:o.location,zoom:13}),Y(K(o.userData),o.location)}})})})]})}p.a.accessToken="pk.eyJ1IjoiaWFua2hvdSIsImEiOiJja3U1enMzNHE0enN4Mm9waXNwcDlyeGVpIn0.gz1TKA2H5JfDkMiHkdVxRQ";var E=function(e){e&&e instanceof Function&&o.e(3).then(o.bind(null,192)).then((function(t){var o=t.getCLS,r=t.getFID,n=t.getFCP,a=t.getLCP,c=t.getTTFB;o(e),r(e),n(e),a(e),c(e)}))};c.a.render(Object(C.jsx)(n.a.StrictMode,{children:Object(C.jsx)(S,{})}),document.getElementById("root")),E()}},[[134,1,2]]]);
//# sourceMappingURL=main.64f5112c.chunk.js.map