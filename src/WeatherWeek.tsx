import React, { useEffect } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'
import {APIKeys} from './apiKeyInfo'
import {WeatherDay} from './WeatherDay'
import {forecastType, showPreviousType} from './initialState'
import {setForecasts, setForecastsType, setShowPrevious, setShowPreviousType} from './actions'

type Props = {
	forecasts:forecastType,
	visibleWeek:boolean,
	showPrevious:showPreviousType,
	previousForcast:forecastType,
	dispatch:React.Dispatch<setForecastsType | setShowPreviousType>
}

/**
 * DateをYYYYMMDD形式で取得
 * @param dist  ...本日から何日前か
 */
const getJustDate = (dist:number = 0):string => {
	const date = new Date() //now
	date.setDate(date.getDate() - dist) //calc target date
	const year = date.getFullYear().toString()
	const month = ("00" + (date.getMonth() + 1)).slice(-2)   // +1, Because January is 0
	const day = ("00" + (date.getDate())).slice(-2)
	return year + month + day
}

export const WeatherWeek:React.FC<Props> = (props) => {

	const getWeatherInfo = async () => {
		console.log('getWeatherInfo');

		// localStorage.setItem('forecastDate', getJustDate(0))   // actual code.
		localStorage.setItem('forecastDate', '20200931')    // set the past date to show previous forecast on testing.

		await superagent
			.get('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/daily')
			.query({ "lang": "en", "lat": "35.681236", "lon": "139.767125"})  // Tokyo Station
			.set('x-rapidapi-host', 'weatherbit-v1-mashape.p.rapidapi.com')
			.set('x-rapidapi-key', APIKeys.Weather)
			.set('useQueryString', "true")
			.end((err, res) => {
				if(err) return
				if (res.error) console.log('res.error: ', res.error)
				console.log('res.body: ', res.body)
				const forecastWeek = []
				for (let i=0; i<7; i++){
					const forecastDay = res.body.data[i]
					const day = new Date(forecastDay['datetime'])
					const splits = forecastDay['datetime'].split('-')
					const datetime = splits[1] + '/' + splits[2]
					const highTemp = forecastDay['high_temp'] % 1 !== 0 ? forecastDay['high_temp'] : forecastDay['high_temp'] + ".0" 
					const lowTemp = forecastDay['low_temp'] % 1 !== 0 ? forecastDay['low_temp'] : forecastDay['low_temp'] + ".0" 

					const forecast = {
						day:day.getDay(), 
						datetime:datetime, 
						weather:forecastDay['weather'].code,
						highTemp:highTemp,
						lowTemp:lowTemp,
						icon:forecastDay['weather'].icon,
					}
					forecastWeek.push(forecast)
					localStorage.setItem('forecastWeek'+[i], JSON.stringify(forecast))
				}

				// console.log('forecastWeek: ', forecastWeek);
				props.dispatch(setForecasts(forecastWeek, true))
			})
	}

	// useEffect() will run after maded DOM.
	// To check existing previous forecast result and get.
	useEffect(
		() => {
			console.log('useEffect()');
			const previousDate:string | null = localStorage.getItem('forecastDate')
			// console.log('previousDate: ', previousDate);
			if(previousDate){
				const previousForcastTemp:forecastType = []
				const previousForcastLS:string[] | null[] = []
				for (let i=0; i<7; i++){
					previousForcastLS[i] = localStorage.getItem('forecastWeek' + [i])
					if(previousForcastLS[i] && previousForcastLS[i] != null){
						previousForcastTemp.push(JSON.parse(previousForcastLS[i] || "{}"))
					}
				}
				props.dispatch(
					setShowPrevious(
						Number(previousDate) <= Number(getJustDate(1)) ? true : false,
						previousForcastTemp
				))
			}else {
				props.dispatch(setShowPrevious(false, []))
			}
		// eslint-disable-next-line
		}, []
	)

	// console.log('visibleWeek: ', props.visibleWeek);
	console.log('previousForcast: ', props.previousForcast);

	return (
		<Area>
			<Button onClick={getWeatherInfo}>Show Today</Button>
			<Forecast>
				{props.visibleWeek ? <Label>Weekly Weather Forecast </Label> : ""}
				<Container data-testid='weatherDays' visibleWeek={props.visibleWeek}>
					{props.forecasts.map((forecast, index) => (
						<WeatherDay 
							key={index} 
							day={forecast.day} 
							datetime={forecast.datetime}
							weather={forecast.weather} 
							highTemp={forecast.highTemp}
							lowTemp={forecast.lowTemp}
							icon={forecast.icon}
						/>
					))}
				</Container>
				<Label>Previous Result</Label>
				<div>(more than a day ago)</div>
				<Container visibleWeek={props.showPrevious}>
					{props.previousForcast.length > 1
						? props.previousForcast.map((forecast, index) => (
							<WeatherDay 
								key={index} 
								day={forecast.day} 
								datetime={forecast.datetime} 
								weather={forecast.weather} 
								highTemp={forecast.highTemp}
								lowTemp={forecast.lowTemp}
								icon={forecast.icon}
							/>
						))
						: <div></div>
					}
				</Container>
			</Forecast>
		</Area>
	)
}

const Area = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

const Forecast = styled.div`
	width: 80%;
	background: linear-gradient(skyblue, pink);
	border-radius: 3px;
	/* & h3:nth-child(odd){
		background-color: #C5E6F7;
	}
	& h3:nth-child(even){
		background-color: #ffc0cb;
	} */
`

const Label = styled.h3`
	min-width:10%;
	background-color: #C5E6F7;
`

// const LabelToday = styled.h3`
// 	min-width:10%;
// 	background-color: #C5E6F7;
// `

// const LabelPrevious = styled.h3`
// 	min-width:10%;
// 	background-color: #ffc0cb;
// `

const Container = styled.div<{ visibleWeek: boolean}>`
	display: ${props => ( props.visibleWeek ? 'flex' : 'none!important' )};
	justify-content:center;
	width: 80vw;
	margin: 1em auto 0;
`
const Button = styled.button`
	margin: 0px auto 10px;
	border:solid 1px black;
	font: orange;
	padding: 5px;
	border-radius: 5%;
`

