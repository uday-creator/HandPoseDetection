// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load handpose DONE
// 6. Detect function DONE
// 7. Drawing utilities DONE
// 8. Draw functions DONE

import React, { useRef, useState } from "react";
// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

//import new stuff

import * as fp from "fingerpose";  //work with our gestures
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png"
import { getElementError } from "@testing-library/dom";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // now setting our app state 
  const [emoji,setEmoji] = useState(null); // to set our emoji state
  const images = {thumbs_up:thumbs_up, victory:victory}; // defining the images


  const runHandpose = async () => {
    const net = await handpose.load();
    //console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  // Detect function 
  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      //console.log(hand);

      if(hand.length >0){
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture, // loading our victory from our pretrained model
          fp.Gestures.ThumbsUpGesture, //loading our thumbs data from our pretrained model
        ]);

        // now estimating
        const gesture = await GE.estimate(hand[0].landmarks, 8); // passing put the hand pose detection and minimum confidence level in our gesture estimator object
        //console.log(gesture);

        // starting detecting state of app
        if(gesture.gestures !== undefined && gesture.gestures.length > 0){   // Checking that we've actually got a gesture 
          const confidence = gesture.gestures.map( // checking confidence of each one of those detected gestures in this case there are more than 1 gestures so we are mapping through the and taking the gesture with highest output
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(  // Grabbing the maximum confidence from the  confidence array of detected gestures
            Math.max.apply(null, confidence)
            );
            setEmoji(gesture.gestures[maxConfidence].name); // grabbing the name of emoji with max confidence
            console.log(emoji);
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        {emoji !==null ? <img 
        src = {images[emoji]}
         style = {{
          position : "absolute",
          marginLeft : "auto",
          marginRight : "auto",
          left:400,
          bottom: 500,
          right:0,
          textAlign:"center",
          height:100,
        }} />:""}
      </header>
    </div>
  );
}

export default App;
