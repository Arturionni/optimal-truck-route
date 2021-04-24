import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual, isEmpty } from './utils';
import points from '../data/ufa'

class Map extends Component {
  constructor(props) {
    super(props);

    this.platform = this.props.factory.getPlatform();

    this.state = {
      map: null,
    };
  }

  shouldComponentUpdate(nextProps) {
    if (this.state.map) {
      if (!isEqual(this.props.center, nextProps.center)) this.updateCenter(nextProps.center);

      if (!isEqual(this.props.bounds, nextProps.bounds)) this.updateBounds(nextProps.bounds);
    }

    return !!this.state.map;
  }

  componentDidMount() {
    const mapTypes = this.platform.createDefaultLayers({ 
      locale: 'ru-RU',
      lg: 'RUS',
      priew: 'RUS',
      pois: 'true',
    });
    const element = document.getElementById('here-map-container')
    const { zoom, center } = this.props;
    const pixelRatio = window.devicePixelRatio || 1;
    console.log(mapTypes)
    const map = this.props.factory.getHereMap(element, mapTypes.vector.normal.map, {
      zoom,
      center,
      pixelRatio,
    });

    this.setMap(map, mapTypes);
  }

  setMap = (map, mapTypes) => {
    this.setState(
      {
        map,
      },
      () => {
        new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
        window.H.ui.UI.createDefault(map, mapTypes, 'ru-RU');
        this.props.factory.addContextMenus(map);

        points.forEach((el, index) => {
          // if (index < 2)
          this.props.factory.addPolylineToMap(map, el.coords, el.color);
        });
      },
    );
  };

  updateCenter = center => {
    if (isEmpty(center)) return;
    this.state.map.setCenter(center);
  };

  updateBounds = bounds => {
    if (isEmpty(bounds)) return;
    const rect = new window.H.geo.Rect(bounds.north, bounds.south, bounds.east, bounds.west);
    this.state.map.setViewBounds(rect);
  };

  render() {
    return <div id="here-map-container">{this.props.children}</div>;
  }
}

Map.defaultProps = {
  onMapLoaded: () => {},
  appCode: '',
  center: { lng: 13.4, lat: 52.51 },
  bounds: {},
  zoom: 12,
};

Map.propTypes = {
  onMapLoaded: PropTypes.func,
  appCode: PropTypes.string,
  center: PropTypes.object,
  bounds: PropTypes.object,
  zoom: PropTypes.number,
};

export default Map;