import '../../Styles/navbar.scss'
import {GiAirplaneDeparture} from "react-icons/gi";
function AdminNavbar (){
    return (
    <>
      <nav>
        <GiAirplaneDeparture className="icon" size="40" />  
        <label class="logo">Jet Away</label>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/admin/flights">Available Flights</a></li>
          <li><a href="/admin/create_flight">Create Flight</a></li>
          <li><a href="#">Contact us</a></li>
        </ul>
    </nav>
  </>
    )
}
export default AdminNavbar;