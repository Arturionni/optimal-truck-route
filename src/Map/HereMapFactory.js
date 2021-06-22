import { actions } from '../slice'
import { store } from '../index';
import { toast } from 'react-toastify';

/* eslint-disab le no-unreachable */
/* eslint-disable import/no-anonymous-default-export */
import $ from "jquery";

let markerSVG1 = '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px">' +
	'<path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19' +
	' 29.3 19 31 Z" fill="#000" fill-opacity=".2"/>' +
	'<path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2' +
	' 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/>' +
	'<path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C' +
	' 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#1188DD"/>' +
	'<text font-size="14" font-weight="bold" fill="#fff" font-family="Nimbus Sans L,sans-serif" text-anchor="middle" x="45%" y="50%">__NO__</text>' +
	'</svg>';

let markerSVG2 = '<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="36px">' +
	'<path d="M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19' +
	' 29.3 19 31 Z" fill="#000" fill-opacity=".2"/>' +
	'<path d="M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2' +
	' 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z" fill="#fff"/>' +
	'<path d="M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C' +
	' 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z" fill="#FF7D33"/>' +
	'<text font-size="14" font-weight="bold" fill="#fff" font-family="Nimbus Sans L,sans-serif" text-anchor="middle" x="45%" y="50%">__NO__</text>' +
	'</svg>';

export default (appCode, slice) => {
	let map, mapBehavior;
	const markerLayer = new window.H.map.Group();
	const routeLayer = new window.H.map.Group();
	const roadsLayer = new window.H.map.Group();
	const platform = new window.H.service.Platform({
		apikey: appCode,
	});
	const geocoder = platform.getGeocodingService();
	let coords = []

	return {
		appCode,
		platform,
		geocoder,
		map,
		roadsLayer,
		getHereMap: (container, mapType, options) => {
			map = new window.H.Map(container, mapType, options)
			mapBehavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
			map.addObject(markerLayer);
			map.addObject(routeLayer);
			map.addObject(roadsLayer);

			return map;
		},
		addContextMenus(map, items = []) {
			
			map.addEventListener('contextmenu', (e) => {
				if (e.target !== map) {
					return;
				}

				let coord = map.screenToGeo(e.viewportX, e.viewportY);

				if (markerLayer.getObjects().length > 1) {
					e.items.push(
						new window.H.util.ContextItem({
							label: 'Очистить все',
							callback: this.clear
							
						}),
						new window.H.util.ContextItem({
							label: 'Перестроить последний маршрут',
							callback: () => {
								const routePanel = store.getState().form.routePanel ? store.getState().form.routePanel.values : {} 
								routeLayer.removeAll();
								coords = []
								markerLayer.forEach(element => {
									coords.push(element.toGeoJSON().geometry.coordinates)
								});
								coords = coords.filter(a => !!a).map(e => ({ lng: e[0], lat: e[1] }))
								this.calculateRoute(coords, { 
									roadSettings: store.getState().form.roadSettings.values,
									...routePanel
								})
							}
						}),
					);

				} else if (markerLayer.getObjects().length > 0) {
					e.items.push(
						new window.H.util.ContextItem({
							label: 'Построить маршрут до этого места',
							callback: () => {
								coords = []

								this.createWaypointMarker(coord, new window.H.map.Icon(markerSVG1.replace(/__NO__/g, 2).replace(/__NO2__/g, "")))

								markerLayer.forEach(element => {
									coords.push(element.toGeoJSON().geometry.coordinates)
								});
								coords = coords.filter(a => !!a).map(e => ({ lng: e[0], lat: e[1] }))

								const routePanel = store.getState().form.routePanel ? store.getState().form.routePanel.values : {} 

								this.calculateRoute(coords, { 
									roadSettings: store.getState().form.roadSettings.values,
									...routePanel
								 })
							}
						}),
						new window.H.util.ContextItem({
							label: 'Очистить начальную точку',
							callback: function () {
								markerLayer.removeAll();
							}
						}),
					)
				} else {
					e.items.push(
						new window.H.util.ContextItem({
							label: 'Установить начальную точку',
							callback: () => {
								this.createWaypointMarker(coord, new window.H.map.Icon(markerSVG1.replace(/__NO__/g, 1).replace(/__NO2__/g, "")))
							}
						}),
					);
				}

			});
		},
		addRoads(roads) {
			const filtered = roads.reduce((acc, i) => {
				if (acc[i.color]) {
					acc[i.color].push(i)
				} else {
					acc[i.color] = [i]
				}

				return acc
			}, {})

			for (let i of Object.keys(filtered)) {
				const layer = new window.H.map.Group()
				filtered[i].forEach(a => this.addPolylineToMap(layer, a.coords, i))
				let cl = [];
				if (i === '#ed4543' && false) {
					// cl = filtered[i].map(a => ({ "op": "override", "shape": a.coords.map(c => c.map(v => v.toFixed(5))), "layer": "LINK_ATTRIBUTE_FC4", "data": { "VEHICLE_TYPES": "truck,custom2,custom3,custom4,bicycle", "TRAVEL_DIRECTION": "BOTH" } }))
					cl = filtered[i].map(a => ({ "op": "override", "shape": a.coords, "layer": "LINK_ATTRIBUTE_FC4", "data": { "VEHICLE_TYPES": "custom2,custom3,custom4,bicycle,carHOV", "TRAVEL_DIRECTION": "BOTH" } }))
					cl = cl.filter((item, index) => ![65, 467, 616].includes(index))
					let data;
					data = new FormData();
					data.append('overlay_spec', JSON.stringify(cl));
					$.ajax({
						url: 'https://fleet.ls.hereapi.com/2/overlays/upload.json?apikey=TGhya0hGiNEtmGB-diwKpuyzVgEOU6D0Ein9o9BjcK0&map_name=OVERLAYBASICDEMO1',
						data,
						processData: false,
						contentType: false,
						type: 'POST',
						success: () => {
						},
						error: function (xhr, status, e) {

						}
					});
				}

				layer.setRemoteId(i)
				layer.setVisibility()
				roadsLayer.addObject(layer)
			}
		},
		setRoadVisibility(color, visible) {
			roadsLayer.getObjects().forEach(a => {
				if (a.getRemoteId() === color && a.getVisibility() != visible) {
					a.setVisibility(!a.getVisibility())
				}
			})
		},
		addPolylineToMap(layer, points, strokeColor) {
			if (points.length > 1 && strokeColor) {
				let lineString = new window.H.geo.LineString();

				points.forEach(p => lineString.pushPoint({ lat: p[0], lng: p[1] }))

				layer.addObject(new window.H.map.Polyline(
					lineString, { style: { lineWidth: 4, strokeColor } }
				));
			}

			if (points.length === 1 && strokeColor) {
				
				const marker = new window.H.map.Marker({ lat: points[0][0], lng: points[0][1] }, {
					icon: new window.H.map.Icon(markerSVG2.replace(/__NO__/g, "").replace(/__NO2__/g, "").replace('#FF7D33', strokeColor))
				});
				layer.addObject(marker);
			}
		},
		clear() {
			markerLayer.removeAll();
			routeLayer.removeAll();
			store.dispatch(actions.clearRouteInfo())
		},
		startRouting(form) {
			const { from, to } = form;
			let gFrom, gTo;
			markerLayer.removeAll();
			routeLayer.removeAll();

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
					
					this.createWaypointMarker(gFrom, new window.H.map.Icon(markerSVG1.replace(/__NO__/g, 1).replace(/__NO2__/g, "")))

					this.calculateRoute([gFrom, gTo], form, true);

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

					this.createWaypointMarker(gTo, new window.H.map.Icon(markerSVG1.replace(/__NO__/g, 2).replace(/__NO2__/g, "")))

					this.calculateRoute([gFrom, gTo], form, true);
				});
			}
		},
		calculateRoute(wPoints, form, fromPanel) {
			if (wPoints.length === 2 && (!wPoints[0] || !wPoints[1])) return;

			let lWeight = parseFloat(form.limitedWeight);
			let aWeight = parseFloat(form.weightPerAxle);
			let h = parseFloat(form.height);
			let w = parseFloat(form.width);
			let l = parseFloat(form.length);

			if (isNaN(lWeight)) lWeight = 0;
			if (isNaN(aWeight)) aWeight = 0;
			if (isNaN(h)) h = 0;
			if (isNaN(w)) w = 0;
			if (isNaN(l)) l = 0;

			const calculateRouteParams = {
				apikey: appCode,
				units: 'metric',
				mode: 'truck',
				routeAttributes: 'sh',
				overlays: 'OVERLAYBASICDEMO1'
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

			let acceptModes = []

			for (const i of Object.entries(form.roadSettings)) {
				if (i[1] === 'true') {
					switch (i[0]) {
						case '#ed4543':
							acceptModes.push('custom1')
							break;
						case '#feb039':
							acceptModes.push('custom2')
							break;
						case '#786d9c':
							acceptModes.push('custom3')
							break;
						case '#9f2b29':
							acceptModes.push('custom4')
							break;
						default: break
					}
				}
			}

			if (acceptModes.length > 0) {
				calculateRouteParams.mode = calculateRouteParams.mode + ',' + acceptModes.join(',')
			} else {
				calculateRouteParams.mode += ',carHOV'
			}

			toast.dark('Ожидайте...', {
				closeOnClick: false,
				progress: undefined,
			});

			$.ajax({
				url: 'https://fleet.ls.hereapi.com/2/calculateroute.json',
				dataType: "json",
				data: calculateRouteParams,
				async: true,
				type: 'get',
				success: ({ response: { route } }) => {
					toast.dismiss()

					const lineString = new window.H.geo.LineString();
					const waypoints = route[0].waypoint
					const shape = route[0].shape
					const routeInfo = route[0].summary

					store.dispatch(actions.setRouteInfo(routeInfo || {}))

					for (let i = 0; i < shape.length; i = i + 2) {
						lineString.pushPoint({ lat: shape[i], lng: shape[i + 1] });
						for (let iW = 0, lW = waypoints.length; iW < lW; iW++) {
							let wPos = waypoints[iW].mappedPosition;
							if (wPos.latitude == shape[i] && wPos.longitude == shape[i + 1]) waypoints[iW].idxInStrip = i;
						}
					}

					routeLayer.addObject(new window.H.map.Polyline(lineString, { style: { lineWidth: 5 } }))

					if (fromPanel) {
						window.map.getViewModel().setLookAtData({
							bounds: routeLayer.getBoundingBox()
						});
					}
					
					toast.success("Маршрут построен успешно!");
				},
				error: (xhr, status, e) => {
					toast.dismiss()

					toast.error("Невозможно построить маршрут");
					routeLayer.removeAll()
				}
			});
		},
		createWaypointMarker(geocoord, icon) {
			if (geocoord.lat && geocoord.lng) {
				let marker = new window.H.map.Marker({ lat: geocoord.lat, lng: geocoord.lng }, {
					icon,
					volatility: true
				});

				marker.draggable = true;

				marker.addEventListener("dragstart", 
					function(evt){
						mapBehavior.disable();
					}, false);
		
				marker.addEventListener("drag", function(evt){
		
					var curMarker = evt.currentTarget,
					coord = map.screenToGeo((evt.pointers[0].viewportX), (evt.pointers[0].viewportY));
		
					curMarker.setGeometry(coord);
				}, false);
		
				marker.addEventListener("dragend", (evt) => {
					mapBehavior.enable();
		
					var curMarker = evt.currentTarget;
					var coord = map.screenToGeo((evt.pointers[0].viewportX ), (evt.pointers[0].viewportY ));
		
					curMarker.setGeometry(coord);
		
					const routePanel = store.getState().form.routePanel ? store.getState().form.routePanel.values : {} 
					routeLayer.removeAll();
					coords = []
					markerLayer.forEach(element => {
						coords.push(element.toGeoJSON().geometry.coordinates)
					});
					coords = coords.filter(a => !!a).map(e => ({ lng: e[0], lat: e[1] }))
					this.calculateRoute(coords, { 
						roadSettings: store.getState().form.roadSettings.values,
						...routePanel
					})

				}, false);

				markerLayer.addObject(marker);
			}
		}
	};
};