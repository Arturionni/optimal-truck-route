import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Map from './Map';
import './HereMaps.css';

class HereMaps extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      map: {},
      behavior: {},
      factory: null,
    };
  }

  onMapLoaded = (map, behavior, factory) => {
    this.setState({
      map,
      behavior,
      factory,
    });

    this.props.onMapLoaded(map);
  };

  render() {
    const { map, behavior, factory } = this.state;
    const { children } = this.props;
    return (
      <>
        <Map {...this.props} onMapLoaded={this.onMapLoaded} />
        {React.Children.map(children, child => {
          if (!child) return null;
          return React.cloneElement(child, { map, behavior, factory });
        })}
      </>
    );
  }
}

HereMaps.defaultProps = {
  appId: '',
  appCode: '',
  useHTTPS: true,
  onMapLoaded: () => {},
  center: { lng: 13.4, lat: 52.51 },
  bounds: {},
  zoom: 10,
};

HereMaps.propTypes = {
  appCode: PropTypes.string,
  onMapLoaded: PropTypes.func,
  center: PropTypes.object,
  bounds: PropTypes.object,
  zoom: PropTypes.number,
};

export default HereMaps;