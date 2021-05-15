/* eslint-disable no-unreachable */
/* eslint-disable import/no-anonymous-default-export */
export default (appCode) => {
	let map, mapBehavior;
	const markerLayer = new window.H.map.Group();
	const polylineLayer = new window.H.map.Group();
	const platform = new window.H.service.Platform({
		apikey: appCode,
	});
	const geocoder = platform.getGeocodingService();

	return {
		appCode,
		platform,
		geocoder,
		map,
		getHereMap: (container, mapType, options) => {
			map = new window.H.Map(container, mapType, options)
			mapBehavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
			map.addObject(markerLayer);
			map.addObject(polylineLayer);

			return map;
		},
		addContextMenus: (map, items = []) => {
			map.addEventListener('contextmenu', function (e) {

				if (e.target !== map) {
					return;
				}

				var coord = map.screenToGeo(e.viewportX, e.viewportY);

				e.items.push(
					new window.H.util.ContextItem({
						label: 'Установить начальную точку',
						callback: function () {
							map.setCenter(coord, true);
						}
					}),

					new window.H.util.ContextItem({
						label: 'Установить конечную точку',
						callback: function () {
							map.setCenter(coord, true);
						}
					}),

					...items
				);
			});
		},
		addPolylineToMap(map, points, strokeColor) {
			if (points.length > 1 && strokeColor) {
				var lineString = new window.H.geo.LineString();

				points.forEach(p => lineString.pushPoint({ lat: p[0], lng: p[1] }))

				map.addObject(new window.H.map.Polyline(
					lineString, { style: { lineWidth: 4, strokeColor } }
				));
			}

			if (points.length === 1 && strokeColor) {
				const marker = new window.H.map.Marker({ lat: points[0][0], lng: points[0][1] });
				map.addObject(marker);
			}
		},
		calcRoute(map) {
			const platform = this.getPlatform()
			const router = platform.getRoutingService(null, 8);

			const routingParameters = {
				'routingMode': 'fast',
				'transportMode': 'truck',
				'origin': '50.1120423728813,8.68340740740811',
				'destination': '52.5309916298853,13.3846220493377',
				'return': 'polyline'
			};

			router.calculateRoute(routingParameters, (result) => {
				if (result.routes.length) {
					result.routes[0].sections.forEach((section) => {
						let linestring = window.H.geo.LineString.fromFlexiblePolyline(section.polyline);

						let routeLine = new window.H.map.Polyline(linestring, {
							style: { strokeColor: 'blue', lineWidth: 3 }
						});

						map.addObjects([routeLine]);

						map.getViewModel().setLookAtData({ bounds: routeLine.getBoundingBox() });
					});
				}
			})
		},
		startRouting(form) {
			const { from, to } = form;
			let gFrom, gTo;
			markerLayer.removeAll();
			polylineLayer.removeAll();

			if (from && to) {
				gFrom = null;
				gTo = null;

				geocoder.search({ searchText: from }, (result) => {
					if (result.Response.View.length > 0 && result.Response.View[0].Result[0].Location != null) {
						gFrom = result.Response.View[0].Result[0].Location.DisplayPosition;
					}
					else {
						gFrom = result.Response.View[0].Result[0].Place.Locations[0].DisplayPosition;
					}
					gFrom.lat = gFrom.Latitude;
					gFrom.lng = gFrom.Longitude;

					this.calculateRoute([gFrom, gTo], form);
				});

				geocoder.search({ searchText: to }, (result) => {
					if (result.Response.View.length > 0 && result.Response.View[0].Result[0].Location != null) {
						gTo = result.Response.View[0].Result[0].Location.DisplayPosition;
					}
					else {
						gTo = result.Response.View[0].Result[0].Place.Locations[0].DisplayPosition;
					}
					gTo.lat = gTo.Latitude;
					gTo.lng = gTo.Longitude;

					this.calculateRoute([gFrom, gTo], form);
				});
			}
		},
		calculateRoute(wPoints, form) {
			const router = platform.getRoutingService();

			if (wPoints.length === 2 && (!wPoints[0] || !wPoints[1])) return;

			let tunnelCategory = '';

			let hazard = []

			if (form.special) {
				if (form.special.combustible) {
					hazard.push('combustible');
					tunnelCategory = 'D';
				}
				if (form.special.organic) {
					hazard.push('organic');
					tunnelCategory = 'D';
				}
				if (form.special.poison) {
					hazard.push('poison');
					tunnelCategory = 'D';
				}
				if (form.special.radioActive) {
					hazard.push('radioActive');
					tunnelCategory = 'D';
				}
				if (form.special.corrosive) {
					hazard.push('corrosive');
					tunnelCategory = 'D';
				}
				if (form.special.poisonousInhalation) {
					hazard.push('poisonousInhalation');
					tunnelCategory = 'D';
				}
				if (form.special.harmfulToWater) {
					hazard.push('harmfulToWater');
					tunnelCategory = 'D';
				}
				if (form.special.other) {
					hazard.push('other');
					tunnelCategory = 'D';
				}
	
				if (form.special.gas) {
					hazard.push('gas');
					if (tunnelCategory != 'D')
						tunnelCategory = 'E';
				}
	
				if (form.special.flammable) {
					hazard.push('flammable');
					tunnelCategory = 'C';
				}
	
				if (form.special.explosive) {
					hazard.push('explosive');
					tunnelCategory = 'B';
				}
			}

			var lWeight
			var aWeight = parseFloat(form.weightPerAxel);
			var h = parseFloat(form.height);
			var w = parseFloat(form.width);
			var l = parseFloat(form.length);

			if (isNaN(lWeight)) lWeight = 0;
			if (isNaN(aWeight)) aWeight = 0;
			if (isNaN(h)) h = 0;
			if (isNaN(w)) w = 0;
			if (isNaN(l)) l = 0;


			const calculateRouteParams = {
				units: 'metric',
				lang: 'ru-RU',
				mode: 'fastest;truck',
				routeattributes: 'waypoints,summary,shape,legs',
				// 'representation' : 'overview',
				// 'routeattributes' : 'wp,sc,sm,sh,bb,lg,no,shape',
				// 'legattributes' : 'wp,mn,li,le,tt',
				// 'maneuverattributes' : 'po,sh,tt,le,ti,li,pt,pl,rn,nr,di',
				// 'linkattributes' : 'sh,le,sl,ds,tr',
				// 'instructionformat' : 'html',
				shippedhazardousgoods : hazard.join(','),
				// tunnelCategory,
				// trailersCount,
			};

			for (let iW = 0, lW = wPoints.length; iW < lW; iW++) {
				calculateRouteParams['waypoint' + iW] = wPoints[iW].lat + "," + wPoints[iW].lng;
			}

			if (lWeight > 0)
				calculateRouteParams.limitedWeight = lWeight;
			if (aWeight > 0)
				calculateRouteParams.weightPerAxle = aWeight;
			if (h > 0)
				calculateRouteParams.height = h;
			if (w > 0)
				calculateRouteParams.width = w;
			if (l > 0)
				calculateRouteParams.length = l;

			router.calculateRoute(calculateRouteParams, ({ response: { route } }) => {
				const lineString = new window.H.geo.LineString();
				const waypoints = route[0].waypoint
				const shape = route[0].shape

				for (let i = 0; i < shape.length; i++) {
					var parts = shape[i].split(',');
					lineString.pushPoint({ lat: parts[0], lng: parts[1] });
					for (var iW = 0, lW = waypoints.length; iW < lW; iW++) {
						var wPos = waypoints[iW].mappedPosition;
						if (wPos.latitude == parts[0] && wPos.longitude == parts[1]) waypoints[iW].idxInStrip = i;
					}
				}
				console.log(lineString)
				let waypointMarkers = [];
				for (var iW = 0, lW = waypoints.length; iW < lW; iW++) {
					var wPos = new window.H.geo.Point(waypoints[iW].mappedPosition.latitude, waypoints[iW].mappedPosition.longitude);
					if (!window.calcRouteTimeOutId) {
						waypointMarkers.push(this.createWaypointMarker(wPos, wPos.lat.toFixed(5) + ", " + wPos.lng.toFixed(5), "" + (iW + 1)));
					}

				}

				polylineLayer.addObject(new window.H.map.Polyline(lineString, { style: { lineWidth: 4 }}))

				window.map.getViewModel().setLookAtData({
					bounds: polylineLayer.getBoundingBox()
				});
			});
		},
		createWaypointMarker(geocoord, info1, info2) {
			info1 = info1 ? info1 : "";
			info2 = info2 ? info2 : "";

			var marker = new window.H.map.Marker({ lat: geocoord.lat, lng: geocoord.lng }, {
				volatility: true
			});
			// marker.draggable = true;
			// marker.addEventListener("dragstart", 
			// 	function(evt){
			// 		mapBehavior.disable();
			// 	}, false);

			// marker.addEventListener("drag", function(evt){

			// 	var curMarker = evt.currentTarget,
			// 	coord = map.screenToGeo((evt.pointers[0].viewportX), (evt.pointers[0].viewportY));

			// 	curMarker.setGeometry(coord);
			// 	var	routeInfo = curMarker.getData(),
			// 		waypointMarkers = routeInfo.waypointMarkers,
			// 		waipoints = [];

			// 	for(var iW=0,lW=waypointMarkers.length; iW<lW; iW++){
			// 		waipoints.push(waypointMarkers[iW].getGeometry());
			// 	}
			// 	calculateSampleRoute(waipoints, routeInfo.idxW);
			// }, false);

			// marker.addEventListener("dragend", function(evt){
			// 	mapBehavior.enable();

			// 	var curMarker = evt.currentTarget;
			// 	var coord = map.screenToGeo((evt.pointers[0].viewportX ), (evt.pointers[0].viewportY ));

			// 	curMarker.setGeometry(coord);

			// 	var routeInfo = curMarker.getData();
			// 	var waypointMarkers = routeInfo.waypointMarkers;
			// 	var wPoints = [];

			// 	for(var iW=0,lW=waypointMarkers.length; iW<lW; iW++){
			// 		var wPos = waypointMarkers[iW].getGeometry();
			// 		wPoints.push(waypointMarkers[iW].getGeometry());
			// 	}
			// 	calculateRoute(wPoints);
			// 	removeAllRouteObjects(routeInfo);

			// }, false);

			// Add marker to the markerLayer, to make it visible on the map
			markerLayer.addObject(marker);
			
			return marker;
		}
	};
};