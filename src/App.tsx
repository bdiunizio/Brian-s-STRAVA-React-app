import React, {useEffect, useState} from 'react';
import { MapContainer, TileLayer, Popup, Polyline } from 'react-leaflet'
import './App.css';
import axios from 'axios'
import polyline from '@mapbox/polyline'


function App() {

  interface Activity {
    activityPositions: any;
    activityName: string;
    activityElevation: number;
  }

  const [activities, setActivities] = useState<Activity[]>([]);

  const clientID = "79817";
  const clientSecret = "8536f63bb16713add0691e64778c98b17adad8d6";
  const refreshToken = "93118876e66e08845e8223670385a396386dfce7"
  const auth_link = "https://www.strava.com/oauth/token"
  const activities_link = `https://www.strava.com/api/v3/athlete/activities`

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(`${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`)
      ]);
      
      const stravaActivityResponse = await axios.get(`${activities_link}?per_page=200&access_token=${stravaAuthResponse[0].data.access_token}`);
      //console.log(stravaActivityResponse.data);
      // console.log(stravaActivityResponse.data[0].name);
      // console.log(stravaActivityResponse.data[0]);
      // console.log(stravaActivityResponse.data[0].map.summary_polyline)
      // console.log(polyline.decode(stravaActivityResponse.data[0].map.summary_polyline));
      
      const polylines = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const activity_polyline = stravaActivityResponse.data[i].map.summary_polyline;
        const activity_name = stravaActivityResponse.data[i].name;
        const activity_elevation = stravaActivityResponse.data[i].total_elevation_gain;
        polylines.push({activityPositions: polyline.decode(activity_polyline), activityName: activity_name, activityElevation: activity_elevation});
      }
      //console.log(polylines)
      setActivities(polylines);
    }

    fetchData();
  }, []);

  return (
    <MapContainer center={[30.3322, -81.6557]} zoom={6} scrollWheelZoom={true}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    />

    {activities.map((activity, i) => (
      <Polyline key = {i} positions={activity.activityPositions}>
        <Popup>
          <div>
            <h2>{"Name: " + activity.activityName}</h2>
            <p>{"Total Elevation Gain: " + activity.activityElevation}</p>
            
          </div>
        </Popup>
      </Polyline>
    ))}
    </MapContainer>
   );
}

export default App;
