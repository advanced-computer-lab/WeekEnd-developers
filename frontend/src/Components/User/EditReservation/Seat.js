const Seat = ({seat, setNumberOfSeats, numberOfSeats, setSelectedSeats, selectedSeats, previouslySelectedSeats}) => {

    const markAsChosen = (e) =>{
       
        if(e.target.classList.length === 1){
            let chosenSeats = selectedSeats
            chosenSeats.push(seat)
            setSelectedSeats(chosenSeats)
            setNumberOfSeats(numberOfSeats+1)

        }
        else{
            setNumberOfSeats(numberOfSeats-1)
            let chosenSeats = selectedSeats
        
            const index = chosenSeats.indexOf(seat)
            chosenSeats.splice(index, 1)
            setSelectedSeats(chosenSeats)
        }
        e.target.classList.toggle("selected")
    } 
    return ((seat.reserved && !previouslySelectedSeats.includes(seat.number))? <div key={seat.number} className="seat occupied"></div> 
    : 
     <div key={seat.number} className="seat" onClick={markAsChosen}></div>
    )
}
export default Seat

