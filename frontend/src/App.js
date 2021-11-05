import {BrowserRouter as Router, Switch,} from 'react-router-dom'
import './App.css';
import UpdateFlight from './Components/Admin/UpdateFlight'
import CreateFlight from './Components/Admin/CreateFlight'
import EditUser from './Components/Admin/EditUser'
import ViewCurrentFlights from './Components/Admin/ViewCurrentFlights'

function App() {
  return (
    <Router>
          {/* <PrivateRouteAdmin path='/admin/update_flight/:FlightID' component={UpdateFlight}/>   */}
          {/* <UpdateFlight /> */}
          {/* <CreateFlight /> */}
          {/* <EditUser/> */}
          <ViewCurrentFlights />
    </Router>
    
  );
}

export default App;