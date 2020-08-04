import React, { useState } from 'react'
import styled from 'styled-components'
import superagent from 'superagent'
import {APIKeys} from './apiKeyInfo'
// import superagent-no-cache from 'superagent-no-cache'

const Container = styled.div`
	display: flex;
	width: 80vw;
	margin: 0 auto;
`
const Button = styled.button`
	border:solid 1px black;
	font: orange;
`
const Wheather = styled.p`
	border: solid 1px black;
	flex: 1;
	height: 80px;
`
const Box = styled.span`
	line-height:80px;
`


export const WheatherWeek = () => {
	const [sunday, setSunday] = useState('0')
	const getWheatherInfo = async () => {
		console.log('getWheatherInfo');
		const result = await superagent
			.get('https://weatherbit-v1-mashape.p.rapidapi.com/forecast/daily')
			.query({ "lang": "en", "lat": "35.681236", "lon": "139.767125"})
			// .use(nocache)  // Prevents caching of *only* this request. Need require('superagent-no-cache');
			.set('x-rapidapi-host', 'weatherbit-v1-mashape.p.rapidapi.com')
			.set('x-rapidapi-key', APIKeys.Wheather)
			.set('useQueryString', "true")
			.end((err, res) => {
				if (res.error) console.log('res.error: ', res.error)
				console.log(res.body)
				const firstday = res.body.data[0]
				setSunday(firstday['weather'].code)
			})
	}
	
	return (
		<div>
			<Button onClick={getWheatherInfo}>天気情報</Button>
			<Container>
			<Wheather className="monday"><Box>{sunday}</Box></Wheather>
				<Wheather className="tuesday"><Box><Box>雨</Box></Box></Wheather>
				<Wheather className="wednesday"><Box>曇り</Box></Wheather>
				<Wheather className="thursday"><Box>晴れ</Box></Wheather>
				<Wheather className="friday"><Box>雨</Box></Wheather>
				<Wheather className="sataday"><Box><Box>曇り</Box></Box></Wheather>
				<Wheather className="sunday"><Box><Box>晴れ</Box></Box></Wheather>
			</Container>
		</div>
	)
}