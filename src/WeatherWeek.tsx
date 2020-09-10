import React from 'react'
import styled from 'styled-components'
import superagent from 'superagent'
import {APIKeys} from './apiKeyInfo'
import {WeatherDay} from './WeatherDay'
import {forecastType} from './initialState'
import {setForecasts, setForecastsType} from './actions'

type Props = {
	forecasts:forecastType,
	visibleWeek:boolean,
	dispatch:React.Dispatch<setForecastsType>
}

export const WeatherWeek:React.FC<Props> = (props) => {

	const getWeatherInfo = async () => {
		console.log('getWeatherInfo');
		const result = await superagent
			.get('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/daily')
			.query({ "lang": "en", "lat": "35.681236", "lon": "139.767125"})
			.set('x-rapidapi-host', 'weatherbit-v1-mashape.p.rapidapi.com')
			.set('x-rapidapi-key', APIKeys.Weather)
			.set('useQueryString', "true")
			.end((err, res) => {
				if (res.error) console.log('res.error: ', res.error)
				// console.log('res.body: ', res.body)
				const forecastWeek = []
				for (let i=0; i<7; i++){
					const forecastDay = res.body.data[i]
					const day = new Date(forecastDay['datetime'])
					const splits = forecastDay['datetime'].split('-')
					const datetime = splits[1] + '/' + splits[2]
					const forecast = {
						day:day.getDay(), 
						datetime:datetime, 
						weather:forecastDay['weather'].code,
						icon:forecastDay['weather'].icon,
					}
					forecastWeek.push(forecast)
				}
				props.dispatch(setForecasts(forecastWeek, true))
			})
	}

	console.log('visibleWeek: ', props.visibleWeek);
	
	return (
		<div>
			<Button onClick={getWeatherInfo}>天気情報</Button>
			<Container data-testid='weatherDays' visibleWeek={props.visibleWeek}>
				{props.forecasts.map((forecast, index) => (
					<WeatherDay 
						key={index} 
						day={forecast.day} 
						datetime={forecast.datetime} 
						weather={forecast.weather} 
						icon={forecast.icon}
						  />
				))}
			</Container>
		</div>
	)
}

const Container = styled.div<{ visibleWeek: boolean}>`
	display: ${props => ( props.visibleWeek ? 'flex' : 'none!important' )};
	width: 80vw;
	margin: 0 auto;
`
const Button = styled.button`
	border:solid 1px black;
	font: orange;
	margin-bottom: 20px;
`

