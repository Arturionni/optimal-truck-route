// import Map from './DisplayMapClassContainer';
import Map from './Map/';

function App() {
  const center = {
    lat: 54.73,
    lng: 55.97,
  };
  
  return (
    <Map appCode="hn8nc_2Y3gsr7XMtPw4XwB3Gv4TbmmaQeD1xNOgCSGU" useHTTPS={false} center={center}/>
  );
}

export default App;
