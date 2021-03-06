import React, { Component } from "react";
import "../../../Styles/createFlight.scss";
import "antd/dist/antd.css";
import State from "./State";
import firstOne from "../../../Styles/firstOne.png";
import { Form, Input, DatePicker, TimePicker, message, InputNumber } from "antd";
import { GrLinkNext } from "react-icons/gr";
import { useHistory } from "react-router-dom";
import moment from "moment";
const { RangePicker } = DatePicker;

export function disabledDate(current) {
  // Can not select days before today and today
  return current && current < moment().endOf("day");
}

export function disabledRangeTime(_, type) {
  if (type === "start") {
    return {
      disabledHours: () => range(0, 60).splice(24, 20),
      disabledMinutes: () => range(30, 60).splice(60, 60),
      disabledSeconds: () => [55, 56],
    };
  }
}

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

const getTripDuration = (from, to) => {
  const fromTime = from.split(":");
  const toTime = to.split(":");

  let fromHours = parseInt(fromTime[0]);
  let fromMinutes = parseInt(fromTime[1]);

  let toHours = parseInt(toTime[0]);
  let toMinutes = parseInt(toTime[1]);

  let diffHours =
    toHours - fromHours < 0 ? toHours - fromHours + 24 : toHours - fromHours;
  let diffMinutes = toMinutes - fromMinutes;
  if (diffMinutes > 60) {
    diffHours++;
    diffMinutes -= 60;
  } else if (diffMinutes < 0) {
    diffHours--;
    diffMinutes += 60;
  }
  if (`${diffHours}`.length == 1) diffHours = "0" + diffHours;
  if (`${diffMinutes}`.length == 1) diffMinutes = "0" + diffMinutes;

  return `${diffHours}:${diffMinutes}`;
};

export default function CreateFlightOne() {
  let whichone = {
    first: false,
    second: false,
    third: false,
    fourth: false,
    nowFI: true,
    nowS: false,
    nowT: false,
    nowFO: false,
  };

  const [form] = Form.useForm();
  let history = useHistory();
  const Create = async () => {
    let correctInputs = true;
    const values = await form.validateFields();
    values.ArrivalDate = new Date(Date.parse(values.DepartureDate[1]._d));
    values.DepartureDate = new Date(Date.parse(values.DepartureDate[0]._d));
    let info = {};
    
    info["AllowedBaggage"] = parseInt(values.AllowedBaggage);
    info["DepartureDate"] = values.DepartureDate;
    info["ArrivalDate"] = values.ArrivalDate;

    const departureTimeHours =
      (values.TripDuration[0]._d.getHours() + "").length == 1
        ? "0" + values.TripDuration[0]._d.getHours()
        : values.TripDuration[0]._d.getHours();

    const departureTimeMin =
      (values.TripDuration[0]._d.getMinutes() + "").length == 1
        ? "0" + values.TripDuration[0]._d.getMinutes()
        : values.TripDuration[0]._d.getMinutes();

    const arrivalTimeHours =
      (values.TripDuration[1]._d.getHours() + "").length == 1
        ? "0" + values.TripDuration[1]._d.getHours()
        : values.TripDuration[1]._d.getHours();
    const arrivalTimeMin =
      (values.TripDuration[1]._d.getMinutes() + "").length == 1
        ? "0" + values.TripDuration[1]._d.getMinutes()
        : values.TripDuration[1]._d.getMinutes();

    values.DepartureTime = `${departureTimeHours}:${departureTimeMin}`;

    values.ArrivalTime = `${arrivalTimeHours}:${arrivalTimeMin}`;

    values.TripDuration = getTripDuration(
      values.DepartureTime,
      values.ArrivalTime
    );
    info["TripDuration"] = values.TripDuration;
    info["DepartureTime"] = values.DepartureTime
    info["ArrivalTime"] = values.ArrivalTime
    if (correctInputs == true) {
      sessionStorage.setItem("Information", JSON.stringify(info));
      history.push("/admin/createFlightTwo");
    }
  };
  return (
    <div>
      <State decide={whichone} />
      
        <div id="createContainer" style={{ width: "40%" }}>
          <Form
            style={{ padding: '50px'}}
            form={form}
            onSubmit={Create}
          >
            <Form.Item
              name="AllowedBaggage"
              label={
                <span style={{ fontSize: "20px" }}>
                  Allowed Baggage
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please specify the allowed baggage",
                },
              ]}
            >
              <InputNumber
                placeholder="No. of Bags"
                style={{ "border-radius": "5px", width:'100%' }}
              />
            </Form.Item>
            <Form.Item
              name="DepartureDate"
              label={
                <span style={{ fontSize: "20px" }}>
                  Departure and Arrival Dates
                </span>
              }
              
              rules={[{ required: true, message: "Please enter the date" }]}
            >
              <RangePicker
              
                disabledDate={disabledDate}
                disabledTime={disabledRangeTime}
                ranges={{
                  Today: [moment(), moment()],
                }}
                format="YYYY-MM-DD"
              
              />
            </Form.Item>
            <Form.Item
              name="TripDuration"
              label={<span style={{fontSize: '20px'}}>Trip Duration</span>}
              rules={[
                { required: true, message: "Please enter the trip duration" },
              ]}
            >
              <TimePicker.RangePicker order={false} format="HH:mm" size="small" />
            </Form.Item>
            <div>
              <GrLinkNext
                style={{ float: "right", cursor: 'pointer' }}
                size="40"
                onClick={Create}
              />
            </div>
          </Form>
        </div>
        <div>
          <img className="imageStyle" src={firstOne} alt="firstOne"  />
        </div>
      
    </div>
  );
}
