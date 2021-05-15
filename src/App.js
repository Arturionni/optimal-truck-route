import React, { useState } from 'react';
import "antd/dist/antd.css";
import "./app.css";
import Map from './Map/';
import { Space, AutoComplete } from 'antd';
import HereMapFactory from './Map/HereMapFactory';
import Features from './components/FeaturesPanel';
import axios from 'axios'

const { Option } = AutoComplete;
const apikey = 'TGhya0hGiNEtmGB-diwKpuyzVgEOU6D0Ein9o9BjcK0';


function App() {
  const center = {
    lat: 54.73,
    lng: 55.97,
  };

  const [suggestions, setSuggestions] = useState([]);
  const factory = HereMapFactory('TGhya0hGiNEtmGB-diwKpuyzVgEOU6D0Ein9o9BjcK0');
  
  const handleSearch = (value) => {
    if (value.trim() !== '') {
      onSearch(value)
    }
  };

  const onSearch = async (value) => {
    let baseUrl = "https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json"
    let geoUrl = baseUrl + `?query=${value}` + `&apikey=${apikey}` + "&maxresults=8"
    try {
      const res = await axios.get(geoUrl)
      let suggestionsRequest = res.data.suggestions;
      setSuggestions(suggestionsRequest)
    }
    catch {
      alert('ошибка')
    }
  }

  const onSelect = async (value, option) => {
    let location = option.key;
    let baseUrl = "https://geocoder.ls.hereapi.com/6.2/geocode.json"
    let geocoderUrl = baseUrl + `?locationid=${location}&apikey=${apikey}`

    const res = await axios.get(geocoderUrl)
    let lat = res.data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
    let lng = res.data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
    window.map.setCenter({ lat: lat, lng: lng }, true);
    setSuggestions([]);
  }

  return (
    <>
      <Map factory={factory} center={center} />
      <Space direction="vertical" className="space_panel">
        <AutoComplete
          placeholder="Поиск по местоположению"
          dropdownMatchSelectWidth={272}
          style={{
            width: 320,
          }}
          allowClear
          onSelect={onSelect}
          onSearch={handleSearch}
        >

          {suggestions && suggestions.map((item) => <Option key={item.locationId} value={item.label}>{item.label}</Option>)}
        </AutoComplete>
        <Features factory={factory} />
      </Space>
    </>
  );
}

export default App;
