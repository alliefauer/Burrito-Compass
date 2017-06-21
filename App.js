// imp

import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, ScrollView, Image, InteractionManager } from 'react-native';
import { Constants, Location, Permissions } from 'expo';
import axios from 'axios';
const timer = require('react-native-timer');


export default class App extends Component {
  constructor(props) {
    super(props)
 this.state = {
    location: null,
    burritoName : null,
    burritoLat : null,
    burritoLon : null,
    distance : null,
    bearing : null,
    relativeBearing : null,
    errorMessage: null
  };

  this._getLocationAsync = this._getLocationAsync.bind(this)
  this.distance = this.distance.bind(this)
  this._getBurritoData = this._getBurritoData.bind(this)
  this.bearing = this.bearing.bind(this)
  }


  componentWillMount() {
    InteractionManager.runAfterInteractions(() => {
      timer.setInterval("burritos", () => {
        this._getBurritoData()
      }, 10000)
  })
}


distance = () => {
  Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}
  var R = 6371e3; // metres
  var lat1 = this.state.location.coords.latitude;
  var lat2 = this.state.burritoLat;
  var lon1 = this.state.location.coords.longitude;
  var lon2 = this.state.burritoLon;
  var φ1 = lat1.toRad();
  var φ2 = lat2.toRad();
  var Δφ = (lat2-lat1).toRad();
  var Δλ = (lon2-lon1).toRad();

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = (R * c * 3.2808).toFixed(); 

  if (d <= 500) {
    return `${d} feet away`
  } else {
    return `${(d * 0.00018939).toFixed(2)} miles away`
  }
}

bearing = () => {
  Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}
  var lat1 = this.state.location.coords.latitude;
  var lat2 = this.state.burritoLat;
  var lon1 = this.state.location.coords.longitude;
  var lon2 = this.state.burritoLon;
  var a = Math.sin(lon2.toRad() - lon1.toRad()) * Math.cos(lat2.toRad());
  var b = Math.cos(lat1.toRad()) * Math.sin(lat2.toRad()) -
        Math.sin(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.cos(lon2.toRad() - lon1.toRad());

  var bearing = Math.atan2(a, b) * 180 / Math.PI;

  this.setState({ bearing })

}

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    this.setState({ location })

    if (this.state.burritoName) {
      this.bearing()
      if (this.state.bearing) {
        let relativeBearing = (this.state.bearing - this.state.location.coords.heading).toFixed(2) 
        if (relativeBearing < -360) {
          relativeBearing += 720
        } else if (relativeBearing < 0) {
          relativeBearing += 360
        }
        this.setState({ relativeBearing: (this.state.bearing - this.state.location.coords.heading).toFixed(2) })
      }
    }

  };

  _getBurritoData = () => {
    // console.log('got burritos!')
    let auth = {headers: {"Authorization" : "Bearer lRTxPSZMP7BajWSVKwIp0XJsU-65z_AEJRzK4TKfd74imz1vCnzbF-de67q5VL-f61kLDYRHrVlhzjPtfOtvwFY_QPvKf37bK-Hr7OjEQJCTVJjCQgENjemyaHpBWXYx"}}
    axios.get(`https://api.yelp.com/v3/businesses/search?term=burritos&latitude=${this.state.location.coords.latitude}&longitude=${this.state.location.coords.longitude}&sort_by=distance`, auth)
    .then(burritos => {
      if (burritos.data.businesses[0].name !== this.state.burritoName) {
    this.setState({ burritoName : burritos.data.businesses[0].name,
                                      burritoLat : burritos.data.businesses[0].coordinates.latitude,
                                      burritoLon : burritos.data.businesses[0].coordinates.longitude,
  
                                       })}})
                                       .then(data => this.setState({ distance: this.distance()}))
                                       
    .catch(console.error)
  }





  render() {
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = `
      burritos: ${JSON.stringify(this.state.burritoName)},
      distance: ${JSON.stringify(this.state.distance)}`;
    }

      timer.requestAnimationFrame("location", this._getLocationAsync)


     

if (!this.state.burritoName) {


  return (
    <View style={styles.container}>
    <Image source={require('./images/background_red.jpg')} style={styles.backgroundImage}>
    <Image source={require('./images/logo_red.png')} style={styles.redLogo}/>
    <Text style={styles.rollingBurritos}>Rolling Burritos...</Text>
    <Image style={styles.smallBurrito} source={require('./images/small-burrito.png')}/>
    </Image>
    </View>
  )
} else {
    return (
  
      <View style={styles.container}>
        <Image source={require('./images/background_blue.jpg')} style={styles.backgroundImage}>
        <Image source={require('./images/logo_blue.png')} style={styles.blueLogo}/>
        <Image source={require('./images/blue_circle.png')} style={{transform: [{rotate: `${this.state.bearing}deg`}], width: 350, height: 350, top: -15}}>
        <Image source={require('./images/large_burrito.png')} style={{ transform: [{rotate: `${this.state.relativeBearing}deg`}], width: 100,
    height: 275, left: 125, top: 40 }}/>
    </Image>
        <Text style={{backgroundColor: 'rgba(0,0,0,0)', fontSize: 20, fontWeight: 'bold', top: 20}}>{this.state.burritoName}</Text>
        <Text style={{backgroundColor: 'rgba(0,0,0,0)', fontSize: 20, top: 20}}>{this.state.distance}</Text>
        </Image>
      </View>
    );
  }
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent:'center',
  },
  smallBurrito: {
    width: 90,
    height: 73,
    top: 100
  },
  redLogo: {
    width: 250,
    height: 120,
    top: -100
  },
  blueLogo: {
    width: 200,
    height: 100,
    top: -50
  },
  rollingBurritos: {
    color: "white",
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
    fontSize: 20,
    top: 80
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  }
});
      // longitude: ${JSON.stringify(this.state.location.coords.longitude)} ,
      // latitude: ${JSON.stringify(this.state.location.coords.latitude)} ,
      // heading: ${JSON.stringify(this.state.location.coords.heading)},
      // speed: ${JSON.stringify(this.state.location.coords.speed)},
//bearing: ${JSON.stringify(this.state.bearing)},
// relativeBearing: ${JSON.stringify(this.state.relativeBearing)}