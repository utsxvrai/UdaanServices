const { StatusCodes } = require('http-status-codes');
const { FlightRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { Op } = require('sequelize'); //op is used to filter the data between the min and max price


const flightRepository = new FlightRepository();

async function createFlight(data) {
    try {
        const flight = await flightRepository.create(data);
        return flight;
    } catch(error) {
        if(error.name == 'SequelizeValidationError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new Flight object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAllFlights(query) {
    let customFilter = {};
    let sortFilter = [];
    const endingTripTime = " 23:59:00";
    //trips
    if(query.trips){
        [departureAirportId, arrivalAirportId] = query.trips.split("-");
        customFilter.departureAirportId = departureAirportId;
        customFilter.arrivalAirportId = arrivalAirportId;
        console.log('Query trips:', query.trips);
        console.log('Departure Airport:', departureAirportId);
        console.log('Arrival Airport:', arrivalAirportId);
    }
    if(query.price){
        [minPrice, maxPrice] = query.price.split("-");
        customFilter.price = {
            [Op.between]: [(minPrice || 0), (maxPrice || 100000)] //between is used to filter the price between the min and max price
        };
    }

    if(query.travellers){
        customFilter.totalSeats = {
            [Op.gte]: query.travellers
        };
    }

    if(query.tripDate){
        customFilter.departureTime = {
            [Op.between]: [query.tripDate, query.tripDate + endingTripTime]
        };
    }

    if(query.sort){
        const params = query.sort.split(",");
        const sortFilters = params.map((param) => {
            return param.split("_");
        });
        sortFilter = sortFilters;
    }
    

    try{
        console.log('Final customFilter:', customFilter);
        console.log('Final sortFilter:', sortFilter);
        const flights = await flightRepository.getAllFlights(customFilter, sortFilter);
        console.log('Flights found:', flights);
        return flights;
    } catch(error) {
        console.log('Error in getAllFlights:', error);
        throw new AppError('Cannot fetch data of all flights', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


module.exports = {
    createFlight,
    getAllFlights
}