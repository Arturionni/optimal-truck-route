import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import HereMapFactory from './HereMapFactory';
import { isEqual, isEmpty } from './utils';


class Map extends Component {
  constructor(props) {
    super(props);

    this.factory = HereMapFactory(props.appCode);

    this.platform = this.factory.getPlatform();

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
    const mapTypes = this.platform.createDefaultLayers();
    const element = document.getElementById('here-map-container')
    const { zoom, center } = this.props;
    const pixelRatio = window.devicePixelRatio || 1;
    const map = this.factory.getHereMap(element, mapTypes.vector.normal.truck, {
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
        // Enabling zoom and drag events
        const behaviour = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));

        // This creates the UI controls
        window.H.ui.UI.createDefault(map, mapTypes);

        // Send to parent the created map object
        this.props.onMapLoaded(map, behaviour, this.factory);
      },
    );
  };

  /*
  * Update the center based on the props
  */

  updateCenter = center => {
    if (isEmpty(center)) return;
    this.state.map.setCenter(center);
  };

  /*
  * Update the view bounds based on the props
  */

  updateBounds = bounds => {
    if (isEmpty(bounds)) return;
    const rect = new window.H.geo.Rect(bounds.north, bounds.south, bounds.east, bounds.west);
    this.state.map.setViewBounds(rect);
  };

  render() {
    return <div id="here-map-container" />;
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