import "antd/dist/antd.css";
import "./app.css";
import Map from './Map/';
import { Input, Space } from 'antd';
import HereMapFactory from './Map/HereMapFactory';
import Features from './components/FeaturesPanel';

const { Search } = Input;

function App() {
  const center = {
    lat: 54.73,
    lng: 55.97,
  };

  const factory = HereMapFactory('hn8nc_2Y3gsr7XMtPw4XwB3Gv4TbmmaQeD1xNOgCSGU');

  const onSearch = value => console.log(value);

  return (
    <>
      <Map factory={factory} center={center} />
      <Space direction="vertical" className="space_panel">
        <Search placeholder="Поиск" onSearch={onSearch} className="space_panel_search" />
        <Features factory={factory} />
      </Space>
    </>
  );
}

export default App;
