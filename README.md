# Openvidu Hangouts React

**OpenviduReact** is a room videoconference component library for [React](https://reactjs.org/).

It's written in [JavaScript](https://www.javascript.com/).

To be able to work in the browser, OpenviduReact uses [openvidu-browser][openvidu-browser] to communicate with the [OpenVidu Server][openvidu-server].

To use AngularOpenVidu, [WebRTC](https://en.wikipedia.org/wiki/WebRTC) support is required (Chrome, Firefox, Opera).

### Table of contents

- [App Demo](#app-demo)
- [Features](#features)
- [Installation](#installation)

### App Demo

<p align="center">
   <img src="images/login.png" alt="screencast">
</p>

<p align="center">
   <img src="images/app-demo.png" alt="screencast">
</p>

In this demo you will see a use case of `openvidu-insecure-react-library`, where you can test ALL the features included in this component.

Link to the repository: https://github.com/srivasd/demo-openvidu-react

### Features

- Join a group call
- Close group call
- Disable camera
- Mute microphone
- Toggle fullscreen video

### Installation

1. Install `openvidu-insecure-react-library` node module through npm:

`npm i openvidu-insecure-react-library --save` or `yarn add openvidu-insecure-react-library `

2. Import `OpenviduReact` to your App.js and use it in this way:

````
import React from 'react';
import OpenviduReact from 'openvidu-insecure-react-library';
import 'openvidu-insecure-react-library/build/css/index.css';

const App = () => (
  <OpenviduReact wsUrl={"localhost"} sessionId={"A"} participantId={1} token={"ljadskblvlifuvbklieu14857362sff45"} distribution={"default"} />
);

export default App;
````

| Name | Type | Optional | Description |
|---|---|---|---|
| `wsUrl`			| `String` | required | Websocket URL pointing to your [OpenVidu Server][openvidu-server] |
| `sessionId`		| `String` | required | An id for the session you want to join to |
| `participantId`	| `String` | required | An id for the current participant joining the session |
| `token`	| `String` | optional | Token used to identify secure sessions |
| `distribution`	| `String` | required | Id used to select your favourite distibution |


3. Deploy OpenVidu Server

Follow the instructions in [this page](http://openvidu.io/docs/reference-docs/openvidu-artifacts/) to deploy it with docker.






