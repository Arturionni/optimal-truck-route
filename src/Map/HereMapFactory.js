export default (appCode) => {
	return {
		appCode,
		getPlatform: () => {
			return new window.H.service.Platform({
				apikey: appCode,
			});
		},
		getHereMap: (container, mapType, options) => {
			return new window.H.Map(container, mapType, options);
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
			  
				points.forEach(p => lineString.pushPoint({lat: p[0], lng: p[1]}))
			  
				map.addObject(new window.H.map.Polyline(
				  lineString, { style: { lineWidth: 4, strokeColor }}
				));
			}

			if (points.length === 1 && strokeColor) {
				const marker = new window.H.map.Marker({lat: points[0][0], lng: points[0][1]});
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
				
						map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
					});
				  }
			})
		}
	};
};