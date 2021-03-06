const Flight = require("../models/Flight");
const User = require("../models/User");
const Booking = require("../models/Booking");
const Summary = require("../models/Summary");
const { sendEmail } = require('../utils/email');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_KEY)


exports.EditUser = async (req, res) => {
  const { id } = req
  try {
    const updated = await User.findByIdAndUpdate(id, req.body);
    res.send(updated)
  } catch {
    res.json({ message: 'duplicate email' });
  }
}

exports.EditPayement = async (req, res) =>{
  const {amount} = req.body
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name:  'Total Fee',
          },
          unit_amount: amount *100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/edit_success',
    cancel_url: 'http://localhost:3000/my_reservations',
  });

  res.send({url: session.url});
}

exports.payement = async (req, res) =>{
  const {amount} = req.body
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name:  'Total Fee',
          },
          unit_amount: amount *100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/available_flights',
  });

  res.send({url: session.url});
}

exports.cancelReservation = async (req, res) => {
  const reservation_number = req.params.reservation_number;

  //Find Booking
  const booking = await Booking.find({ ReservationNumber: reservation_number });

  //Find flight & Update Seats

  const flight = await Flight.findById(booking[0].Flight);

  const seats = booking[0].Seats
  const Children = booking[0].Children
  let first_seats = 0;
  let economy_seats = 0;
  let business_seats = 0;
  for (let seat of seats)
    if (seat.charAt(0) === 'A') {
      const index = parseInt(seat.slice(1)) - 1;
      flight.FirstClassSeats[index].reserved = false;
      first_seats++;
    }
    else if (seat.charAt(0) === 'B') {
      const index = parseInt(seat.slice(1)) - 1;
      flight.BusinessSeats[index].reserved = false;
      business_seats++;
    }
    else {
      const index = parseInt(seat.slice(1)) - 1;
      flight.EconomySeats[index].reserved = false;
      economy_seats++;
    }


  let update = {
    $inc:
    {
      'EconomyAvailableSeats': economy_seats,
      'BusinessAvailableSeats': business_seats,
      'FirstClassAvailableSeats': first_seats,
      'NumberOfPassengers.Children': -Children,
      'NumberOfPassengers.Adults': -(seats.length - Children),
    },
    FirstClassSeats: flight.FirstClassSeats, EconomySeats: flight.EconomySeats, BusinessSeats: flight.BusinessSeats
  };
  await Flight.findByIdAndUpdate(flight.id, update);

  // Delete Booking
  Booking.deleteOne({ ReservationNumber: reservation_number }, function (error, result) {
    if (error) {
      res.send(error);
    } else {
      res.send(booking);
    }
  });
}

exports.notifyCancellation = async (req, res) => {
  const { ReservationNumber, email, TotalPrice, FlightNumber, FirstName, LastName, ReturnPrice } = req.body
  const subject = "Jet Away"
  const body = `  
                    <h3> Hello ${FirstName} ${LastName} </h3>
                        
                        <h4> Please note that your reservation <b> ${ReservationNumber} </b>  on flight  <b>${FlightNumber} </b>  has been succesfully cancelled. </h4>
                        <h4> A total of ${TotalPrice + ReturnPrice}$ will be refunded to your account.</h4>
                        
                    <h3> Jet Away </h3>
                      `
  sendEmail(email, subject, body);

  res.status(200).send({ message: 'Email sent successfully!' })
}

exports.ViewCurrentFlights = async (req, res) => {
  const { id } = req
  let today = new Date();
  const condition = { User: id }
  const output = [];
  const bookings = await Booking.find(condition);
  for (let i = 0; i < bookings.length; i++) {
    const flight = await Flight.findById(bookings[i].Flight);
    if (flight.DepartureDate > today) {
      output.push({ Booking: bookings[i], Flight: flight });
    }
  }
  res.send(output)
}

exports.reserveFlight = async (req, res) => {
  const flightID = req.params.flightID
  const { id, Admin } = req
  const { FlightNumber, TotalPrice, Seats, Children } = req.body
  if (Admin) return res.status(403).json('Unauthorized')
  let ReservationNumber
  while (true) {
    ReservationNumber = Math.floor(10000000 + Math.random() * 90000000) + '' // Random number of length 8
    const found = await Booking.findOne({ ReservationNumber })
    if (!found)
      break
  }
  let SeatsNames = []
  for (let seat of Seats)
    SeatsNames.push(seat.number)
  await Booking.create({ User: id, Flight: flightID, ReservationNumber, FlightNumber, TotalPrice, Seats: SeatsNames, Children })

  let EconomyReservedSeats = 0, FirstReservedSeats = 0, BusinessReservedSeats = 0

  const { FirstClassSeats, BusinessSeats, EconomySeats } = await Flight.findById(flightID)

  for (let seat of Seats) {
    if (seat.number.charAt(0) === 'A') {
      FirstReservedSeats++
      FirstClassSeats[parseInt(seat.number.slice(1)) - 1].reserved = true
    }
    else if (seat.number.charAt(0) == 'B') {
      BusinessReservedSeats++
      BusinessSeats[parseInt(seat.number.slice(1)) - 1].reserved = true
    }
    else {
      EconomyReservedSeats++
      EconomySeats[parseInt(seat.number.slice(1)) - 1].reserved = true
    }
  }

  const update = {
    $inc: {
      EconomyAvailableSeats: -EconomyReservedSeats,
      FirstClassAvailableSeats: -FirstReservedSeats,
      BusinessAvailableSeats: -BusinessReservedSeats,
      'NumberOfPassengers.Adults': Seats.length - Children,
      'NumberOfPassengers.Children': Children
    },
    FirstClassSeats,
    BusinessSeats,
    EconomySeats,
  }
  try {
    await Flight.findByIdAndUpdate(flightID, update)
    res.status(200).json({ message: "Reservation done successfully" })
  } catch (err) {
    res.status(400).json({ message: "Error" })
  }
}


exports.AvailableFlights = async (req, res) => {
  const id = req.id
  const userBookings = await Booking.find({ User: id })
  const userFlights = []
  const currentDate = new Date(Date.now())
  for (let booking of userBookings) {
    userFlights.push(booking.Flight)
  }
  const flights = await Flight.find({ _id: { $nin: userFlights }, DepartureDate: { $gte: currentDate } }).lean()
  const ReservedFlights = await Flight.find({ _id: { $in: userFlights }, DepartureDate: { $gte: currentDate } }).lean()

  for (var flight of ReservedFlights)
    flight.reserved = true

  res.send(flights.concat(ReservedFlights))
}

exports.ReturnFlights = async (req, res) => {
  const id = req.id
  const { Departure, Arrival, DepartureDate } = req.body
  const userBookings = await Booking.find({ User: id })
  const userFlights = []
  for (let booking of userBookings) {
    userFlights.push(booking.Flight)
  }
  const flights = await Flight.find({ _id: { $nin: userFlights }, DepartureAirport: Departure, ArrivalAirport: Arrival, DepartureDate: { $gte: DepartureDate } })
  res.send(flights)
}

exports.getFlights = async (req, res) => {
  const currentDate = new Date(Date.now())
  const allFlights = await Flight.find({ DepartureDate: { $gt: currentDate } });
  res.send(allFlights);
};
exports.getSummaries = async (req, res) => {
  const id = req.id
  const summaries = await Summary.find({ User: id })
  res.send(summaries)
}

exports.createSummaries = async (req, res) => {
  const id = req.id
  const { DepartureFlight, ReturnFlight, DepartureBooking, ReturnBooking } = req.body
  ReturnBooking.Token = undefined
  DepartureBooking.Token = undefined
  try {
    await Summary.create({ User: id, DepartureFlight, ReturnFlight, DepartureBooking, ReturnBooking })
    res.send({ message: 'Summary added successfully!' })
  } catch (e) {
    console.log(e)
    res.status(400).send('error')
  }
}

exports.editRefund = async(req, res) => {
  const { Email, FirstName, LastName, price } = req.body
  const subject = "Jet Away"
  const body = `  
                  <h3> Our Dear Customer ${FirstName} ${LastName} </h3>

                      <b> Thank you for riding with JET AWAY! </b>

                      <hr>
                      <h3>Your reservation has been successfully edited. A total of ${price}$ will be refunded to your bank account. </h3>
                      <hr>
                  <h4> Sincerely, </h4> 
                  <h4> Jet Away </h4>
                    ` 
  sendEmail(Email, subject, body);

  res.status(200).send({ message: 'Email sent successfully!' })
}

exports.notifyReservation = async (req, res) => {
  const { FirstBooking, SecondBooking, Email, FirstName, LastName} = req.body
  const subject = "Jet Away"
  const body = `  
                  <h3> Our Dear Customer ${FirstName} ${LastName} </h3>

                      <b> Thank you for riding with JET AWAY! </b>

                      <hr>
                      <b> <h3> Your Departure Trip Details: </h3> </b>
                      <h4> Flight Number: ${FirstBooking.FlightNumber} </h4> 
                      <h4> Price: ${FirstBooking.TotalPrice} </h4> 
                      <h4> Number of Children: ${FirstBooking.Children} </h4> 
                      <hr>
                      <b> <h3> Your Return Trip Details: </h3> </b>
                      <h4> FlightNumber: ${SecondBooking.FlightNumber} </h4> 
                      <h4> Price: ${SecondBooking.TotalPrice} </h4> 
                      <h4> Number of Children: ${SecondBooking.Children} </h4> 
                      <hr>
                
                  <h4> Sincerely, </h4> 
                  <h4> Jet Away </h4>
                    ` 
  sendEmail(Email, subject, body);

  res.status(200).send({ message: 'Email sent successfully!' })
}


exports.editReservation = async (req, res) => {
  const {booking, changedSeats, newSeats, oldChildren} = req.body
  const bookingID = booking._id
  const flightID = booking.Flight
  const newChildren = booking.Children
  const oldAdults = changedSeats.length - oldChildren
  const newAdults = newSeats.length - newChildren
  await Booking.findByIdAndUpdate(bookingID, booking)
  const flight = await Flight.findById(flightID).lean()
  const oldFlight = {...flight}
  for(let seat of changedSeats){
    const seatNumber = parseInt(seat.slice(1))
    if(seat.charAt(0) === 'A'){
      flight.FirstClassAvailableSeats++;
      flight.FirstClassSeats[seatNumber - 1].reserved = false
    }
    else if(seat.charAt(0) === 'B'){
      flight.BusinessAvailableSeats++
      flight.BusinessSeats[seatNumber - 1].reserved = false
    }
    else {
      flight.EconomyAvailableSeats++
      flight.EconomySeats[seatNumber - 1].reserved = false
    }
  }

  for(let seat of newSeats){
    const seatNumber = parseInt(seat.slice(1))
    if(seat.charAt(0) === 'A'){
      flight.FirstClassAvailableSeats--
      flight.FirstClassSeats[seatNumber - 1].reserved = true
    }
    else if(seat.charAt(0) === 'B'){
      flight.BusinessAvailableSeats--
      flight.BusinessSeats[seatNumber - 1].reserved = true
    }
    else {
      flight.EconomyAvailableSeats--
      flight.EconomySeats[seatNumber - 1].reserved = true
    }
  }
  const adultsDifference = newAdults - oldAdults
  const childrenDifference = newChildren - oldChildren
  flight.NumberOfPassengers.Adults += adultsDifference
  flight.NumberOfPassengers.Children += childrenDifference

  await Flight.findByIdAndUpdate(flightID, flight)
  res.send({message: 'success'})
}

