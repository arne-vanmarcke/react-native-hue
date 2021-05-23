/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const username='QScScRGIUH581BZOxzAoTrW76rN38GfgXd9QIFyz'

const Lamp=(props)=>{
  const [state, setState] = useState(false);
  const [color, setColor] = useState('#afa2f5');
  const [inputcolor, setInputColor] = useState('');
  const [brightness, setBrightness] = useState(0);
  const [inputbrightness, setInputBrightness] = useState('');

  useEffect(() => {
    setInterval(()=>{
      fetch('http://'+props.ip+'/api/'+username+'/lights')
      .then( res => res.json())
      .then(res => {
        //console.log('part',res)
        let xy=res[props.name].state.xy
        let bri=res[props.name].state.bri
        setBrightness(bri)
        setColor(xyBriToRgb(xy[0],xy[1],bri))
        setState(res[parseInt(props.name)].state.on)
      })
      .catch(err=>{
        //console.log(err)
      })
    },2000)
  }, []);

  return(
    <View style={styles.sectionContainer} >
      <View style={[styles.box,{marginTop: 2}]} onTouchStart={()=>{
      if(brightness<=13){
        sendRequest(props.ip,props.name,true,null,128).then(res=>{})
        setState(true)
      }else{
        sendRequest(props.ip,props.name,!state,null,null).then(res=>{})
          setState(!state)
      }}}>
        <Text style={styles.highlight}>Lamp {props.name}</Text>
        {state? <View style={[styles.indicator,{backgroundColor: color}]}/>:<View style={[styles.indicator,{backgroundColor: '#000000'}]}/>}
        <Text style={styles.highlight}>{state? "on":"off"}</Text>
      </View>
      <View style={styles.box}> 
        <View>
          <Text style={styles.highlight}>setColor</Text>
          <Text style={styles.highlight}>current color: {color}</Text>
        </View>
        <TextInput style={styles.colorInput} value={inputcolor} placeholder='hex color...' onChangeText={(text)=>{setInputColor(text)}}></TextInput>
        <Button onPress={()=>{
          sendRequest(props.ip,props.name,null,rgbToXY('0x'+inputcolor),null)
          setInputColor('')
        }} title='set Color'></Button>
      </View>
      <View style={{marginLeft: 2}}>
        <View>
          <Text style={styles.highlight}>setBrightness</Text>
          <Text style={styles.highlight}>currnet brightness: {brightness}</Text>
        </View>
        <TextInput style={styles.colorInput} value={inputbrightness} placeholder='0-255' onChangeText={(text)=>{setInputBrightness(text)}}></TextInput>
        <Button onPress={()=>{
          setBrightness(parseInt(inputbrightness))
          sendRequest(props.ip,props.name,null,null,parseInt(inputbrightness))
          setInputBrightness('')
        }} title='set Brightness'></Button>
      </View>
    </View>
  );
}

export default App= () =>  {

  return (
    <ScrollView style={styles.list}>
      <Lamp name="1" ip="10.198.120.60"/>
      <Lamp name="2" ip="10.198.120.60"/>
      <Lamp name="3" ip="10.198.120.60"/>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  box:{
    marginLeft: 2,
    borderBottomColor: "white",
    borderBottomWidth: 2,
    borderStyle: 'solid'
  },
  colorInput:{
    backgroundColor: 'white',
    width:200,
    borderRadius: 10,
  },
  list:{
    backgroundColor: '#312c3a'
  },
  indicator:{
    width: 25,
    height: 25,
    borderColor: 'white',
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 5,
  },
  sectionContainer: {
    borderColor: 'white',
    borderWidth: 2,
    borderStyle: "solid",
    borderRadius: 10,
    margin: 10
  },
  highlight: {
    fontWeight: '700',
    color: 'white'
  },
});

function sendRequest(ip,num,toggle,color,bri){
  var body= new Object()
  if(toggle!=null){
    if(bri!= null)
      body={'on':toggle,'bri':128}
    else
      body={'on':toggle}
  }
  if(color!=null)
    body={'on':toggle,'xy':color}
  if(bri!=null)
  {
    if(bri<=13)
      body={'on':false,'bri':0}
    else
      body={'on':true,'bri':bri}
  }
  return new Promise((resolve,reject)=>{
    fetch('http://'+ip+'/api/'+username+'/lights/'+num+'/state',{
      method:'PUT',
      body:JSON.stringify(body),
      mode: "cors",
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res=>res.json())
    .then(res=>{ resolve(res)})
    .catch(err=>{reject(err)})
  })
}

function xyBriToRgb(x, y, bri){
  let z = 1.0 - x - y;
  let Y = bri / 255.0; // Brightness of lamp
  let X = (Y / y) * x;
  let Z = (Y / y) * z;
  let r = X * 1.612 - Y * 0.203 - Z * 0.302;
  let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  let b = X * 0.026 - Y * 0.072 + Z * 0.962;
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
  let maxValue = Math.max(r,g,b);
  r /= maxValue;
  g /= maxValue;
  b /= maxValue;
  r = r * 255;   if (r < 0) { r = 255 };
  g = g * 255;   if (g < 0) { g = 255 };
  b = b * 255;   if (b < 0) { b = 255 };
  r=Math.round(r)
  g=Math.round(g)
  b=Math.round(b)
  return '#'+r.toString(16)+g.toString(16)+b.toString(16)
}

function rgbToXY(color){
  let red = (color >> 16) / 255;
  let green = ((color >> 8) & 0xFF) / 255;
  let blue = (color & 0xFF) / 255;
  red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
  green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
  blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);
  let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  let Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  let Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);
  return [x,y]
}
