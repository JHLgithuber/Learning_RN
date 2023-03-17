import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Fontisto } from '@expo/vector-icons';
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "cdbade77d2ad649d8fff03722672edf7"

const icons = {
	"Clouds": "cloudy",
	"Clear": "day-sunny",
	"Snow": "snow",
	"Rain": "rains",
	"Drizzle": "rain",
	"Thunderstorm": "lightning",
	"Atmosphere":"cloudy-gusts",
}

export default function App() {
	const [city, setCity] = useState("Loading...");
	const [days, setDays] = useState([]);
	const [location, setLocation] = useState();
	const [ok, setOk] = useState(true);
	const getWeather = async () => {
		const { granted } = await Location.requestForegroundPermissionsAsync();
		console.log("granted: " + granted)
		if (!granted) {
			setOk(false);
		}
		const {
			coords: { latitude, longitude },
		} = await Location.getCurrentPositionAsync({ accuracy: 5 });
		console.log("Postion: " + latitude + " " + longitude)
		const location = await Location.reverseGeocodeAsync(
			{ latitude, longitude },
			{ useGoogleMaps: false },
		);
		console.log("location :" + JSON.stringify(location))
		setCity(location[0].street);
		fetch_code = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
		console.log("fetch: " + fetch_code)
		const response = await fetch(fetch_code)
		const json = await response.json();
		setDays(
			json.list.filter((weather) => {
				console.log(weather)
				if (weather.dt_txt.includes("00:00:00")) {
					return weather;
				}
			})
		);


	};
	useEffect(() => {
		getWeather();
	}, []);


	return (
		<View style={styles.container}>
			<View style={styles.city}>
				<Text style={styles.cityName}>{city}</Text>
			</View>
			<View style={styles.weather_v}>
				<ScrollView
					pagingEnabled
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.weather}
				>
					{days.length === 0 ? (
						<View style={styles.day}>
							<ActivityIndicator
								color="gray"
								size="large"
								style={{ marginTop: 10 }}
							/>
						</View>
					) : (
						days.map((day, index) => (
							<View key={index} style={styles.day}>
								<View style={{
									flexDirection: "row",
									alignItems: "center",
									width: "100%",
									justifyContent: "space-between"
								}}>
									<View>
										<Text style={styles.temp}>{parseFloat(day.main.temp).toFixed(1)}</Text>
									</View>
									<View>
										<Fontisto name={icons[day.weather[0].main]} size={60} color="black" />
									</View>
								</View>
								<Text style={styles.description}>{day.weather[0].main}</Text>
								<Text style={styles.tinyText}>{day.weather[0].description}</Text>
							</View>
						))

					)
					}
				</ScrollView>
			</View>

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "tomato",
	},
	city: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	cityName: {
		fontSize: 58,
		fontWeight: "500",
	},
	weather_v: {
		flex: 3,
	},
	weather: {},
	day: {
		width: SCREEN_WIDTH,
		alignItems: "center",
		flex: 1,
	},
	temp: {
		marginTop: 50,
		fontWeight: "600",
		fontSize: 110,
	},
	description: {
		marginTop: -30,
		fontSize: 60,
	},
	tinyText: {
		fontSize: 20,
	},
});