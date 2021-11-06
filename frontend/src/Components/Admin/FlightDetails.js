import { Component } from "react";
import "antd/dist/antd.css";
import { Popconfirm, message } from "antd";
import axios from "axios";
import "../../Styles/flightcard.scss";

class FlightDetails extends Component {
  refreshPage() {
    window.location.reload(false);
    // message.success("deleted");
  }
  handleClick(key) {
    try {
      console.log("ana al id");
      console.log(key);
      let res = async () => {
        await axios.delete(
          `http://localhost:8000/admin/delete_flight/${key}`,
          key
        );
      };
      res();
      this.refreshPage();
    } catch (err) {
      console.log(err);
    }
  }
  cancel(e) {
    console.log(e);
    message.error("Click on No");
  }
  render() {
    const { myFlight, idkey } = this.props;
    return (
      <div id="cards">
        <figure class="card card--normal">
          {/* <div class="card__image-container">
            <img
              src="https://cdn.bulbagarden.net/upload/thumb/e/e2/133Eevee.png/1200px-133Eevee.png"
              alt="Eevee"
              class="card__image"
            />
          </div> */}
          <figcaption class="card__caption">
            {/* <h1 class="card__name"></h1> */}
            {/* <h3 class="card__type">Business</h3> */}

            <table class="card__stats">
              <tbody>
                <tr>
                  <th>Flight Number</th>
                  <td>{myFlight.FlightNumber}</td>
                </tr>
                <tr>
                  <th>Departure Time</th>
                  <td>{myFlight.DepartureDate}</td>
                </tr>

                <tr>
                  <th>Arrival Time</th>
                  <td>{myFlight.ArrivalDate}</td>
                </tr>
              </tbody>
            </table>

            <div class="card__abilities">
              <button>Update</button>
              <Popconfirm
                title="Are you sure to delete this flight?"
                onConfirm={() => {
                  this.handleClick(idkey);
                }}
                onCancel={this.cancel}
                cancelText="No"
                okText="Yes"
              >
                <a href="#">Delete</a>
              </Popconfirm>
            </div>
          </figcaption>
        </figure>
      </div>
    );
  }
}

export default FlightDetails;