import React, { Component } from 'react';
import './OpenviduHangoutsReact.css';
import { OpenVidu } from 'openvidu-browser';
import StreamComponent from './StreamComponent.js';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";
import IconButton from 'material-ui/IconButton';
import Settings from '@material-ui/icons/Settings';
import CropFree from '@material-ui/icons/CropFree';
import CallEnd from '@material-ui/icons/CallEnd';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff'
import Videocam from '@material-ui/icons/Videocam';
import axios from 'axios';


class OpenviduHangoutsReact extends Component {
  
  constructor(props){
    super(props);
    this.state = {valueSessionId: 'Session ' + this.props.sessionId,
                  valueUserName: 'Participant ' + this.props.participantId,
                  stateWsUrl: this.props.wsUrl,
                  stateToken: this.props.token,
                  stateDistributon: this.props.distribution,
                  session: undefined,
                  publisher: undefined,
                  mainVideoStream: undefined,
                  localStream: undefined,
                  muted: false,
                  remoteStreams: [],
                 };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick  = this.handleClick.bind(this);
    this.muteMic = this.muteMic.bind(this);
    this.muteCam = this.muteCam.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
    this.onbeforeunload = this.onbeforeunload.bind(this);
  }

  handleSubmit(event){
    event.preventDefault();
    this.joinSession();
  }

  handleClick(){
    this.leaveSession();
  }

  handleChangeSessionId(e){
    this.setState({
      valueSessionId : e.target.value,
    });
  }

  handleChangeUserName(e){
    this.setState({
      valueUserName : e.target.value,
    });
  }

  joinSession() {

      this.OV = new OpenVidu();

      this.setState({
        session: this.OV.initSession(),
      }, () => {

        var mySession = this.state.session;
        
        var that1 = this;

        
        mySession.on('streamCreated', (event) => {
          
          var myRemoteStreams = that1.state.remoteStreams; 

          myRemoteStreams.push(event.stream); 
          
          that1.setState({
            remoteStreams: myRemoteStreams
          });

          mySession.subscribe(event.stream, undefined);

        });


        mySession.on('streamDestroyed', (event) => {
          event.preventDefault();
        
          that1.deleteRemoteStream(event.stream);
        });
        
        var that = this;

        //var token = this.getCurrentToken();
        
        this.getToken(this.state.valueSessionId).then(token => {

          mySession.connect(token, {clientData: this.state.valueUserName}).then(() => {
              
            var publisher = that.OV.initPublisher(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: '640x480',
              frameRate: 30,
              insertMode: 'APPEND',
              mirror: false
            });

            var streamInterval = setInterval(function(){
              that.setState({
                localStream: publisher.stream,
                mainVideoStream: that.state.localStream
              }, () => {
                if(that.state.localStream!==undefined&&that.state.mainVideoStream!==undefined){
                  clearInterval(streamInterval);
              }})}, 200);

              mySession.publish(publisher);
                  
          }).catch (error => {
            console.log('There was an error connecting to the session:', error.code, error.message);
          });

        });
        return false;
      });    
    }

    //var OPENVIDU_SERVER_URL = "https://" + location.hostname + ":4443";

    getToken(mySessionId) {
	    return this.createSession(mySessionId).then(sessionId => this.createToken(sessionId));
    };

    createSession(sessionId) {
      var OPENVIDU_SERVER_URL = "https://" + window.location.hostname + ":4443";
      console.log(sessionId);
      return new Promise((resolve, reject) => {
        axios({
          method: 'post',
          url: OPENVIDU_SERVER_URL + "/api/sessions",
          data: JSON.stringify({ customSessionId: sessionId }),
          headers: {
            "Authorization": "Basic " + btoa("OPENVIDUAPP:MY_SECRET"),
            "Content-Type": "application/json"
          }
        }).then(response => {
          console.log(response);
          var result = JSON.parse(response.request.response);
          console.log(result["id"]);
          resolve(result["id"]);
          return result["id"];
        })
        .catch((error) => {
          if (error.response.status === 409) {
            resolve(sessionId);
            return sessionId;
          } else {
            console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + OPENVIDU_SERVER_URL);
            if (window.confirm('No connection to OpenVidu Server. This may be a certificate error at "' + OPENVIDU_SERVER_URL +
              '"\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server' +
              'is up and running at "' + OPENVIDU_SERVER_URL + '"')) {
              window.location.assign(OPENVIDU_SERVER_URL + '/accept-certificate');
            }
          }
        });
      });
    };

    createToken(sessionId) {
      var OPENVIDU_SERVER_URL = "https://" + window.location.hostname + ":4443";
      console.log(sessionId);
      return new Promise((resolve, reject) => {
        axios({
          method: 'post',
          url: OPENVIDU_SERVER_URL + "/api/tokens",
          data: JSON.stringify({ session: sessionId }),
          headers: {
            "Authorization": "Basic " + btoa("OPENVIDUAPP:MY_SECRET"),
            "Content-Type": "application/json"
          }
        }).then((response) => {
          console.log(response);
          resolve(response.data.token);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
      });
    };
    
    leaveSession() {
      var mySession = this.state.session;
      
      if(this.OV) {mySession.disconnect();}

      this.OV = null;

      this.setState({
        session: undefined,
        remoteStreams: [],
        valueSessionId: 'Session ' + this.props.sessionId,
        valueUserName: 'Participant ' + this.props.participantId,
        localStream: undefined,
      });

    }

    deleteRemoteStream(stream) {
      var myRemoteStreams = this.state.remoteStreams;
      let index = myRemoteStreams.indexOf(stream, 0);
      if (index > -1) {
        myRemoteStreams.splice(index, 1);
        this.setState({
          remoteStreams: myRemoteStreams
        });
      }
    }

    getMainVideoStream(stream) {
      this.setState({
        mainVideoStream: stream,
      });
    }
    
    onbeforeunload(event) {
      this.leaveSession();
    };

    componentDidMount(){
      window.addEventListener("beforeunload", this.onbeforeunload);
    }

    componentWillUnmount(){
      window.removeEventListener("beforeunload", this.onbeforeunload)
    }

    handleMainVideoStream(stream) {
      this.getMainVideoStream(stream);
    }

    getCurrentToken() {
      return (this.state.stateToken)
        ? this.state.stateToken
        : 'dummytoken' + this.participantId;
    }

    muteMic(){
      this.setState({
        muted: !this.state.muted,
      });
    }

    muteCam(){
      console.log("Cam muted");
    }

    fullscreen(){
      console.log("Fullscreen");
      var element = document.getElementById("root");
      if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
        if (element.requestFullScreen) {
          element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    }

  render() {
    var valueSessionId = this.state.valueSessionId;
    var valueUserName = this.state.valueUserName;
    var valueDistribution = this.state.stateDistributon;
    var valueMuted = this.state.muted;
    console.log(valueMuted);
      return (
        <div id= "main-container" className="container">
        { this.state.session === undefined ? 
        <div id="join">
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography variant="title" color="inherit">
                React Openvidu Hangouts 
              </Typography>
            </Toolbar>
          </AppBar>
          <div id="join-dialog" className="jumbotron vertical-center">
          <Card className="card">
              <Typography variant="display1" color="secondary" align="center">
                  Join a video session
              </Typography>
              <form className="form-group" onSubmit={this.handleSubmit}>
              <CardContent className="card-login">
                  <TextField className="form-control" type="text" label="Participant" id="userName" value={valueUserName} onChange={this.handleChangeUserName.bind(this)}required/>
                  <br />
                  <br />
                  <TextField className="form-control" type="text" label="Session" id="sessionId" inputRef={(input) => { this.sessionId = input; }} value={valueSessionId} onChange={this.handleChangeSessionId.bind(this)}required/>
              </CardContent>
              <CardActions className="button-login">
                <Button variant="raised" color="primary" id="join-button" name="commit" type="submit" >
                  JOIN
                </Button>
              </CardActions>
          </form>    
          </Card>
          </div>
        </div> : null }
  
        { this.state.session !== undefined ? <div id="session">
        <AppBar position="static" id="session-header">
          <Toolbar>
            <Typography variant="title" color="inherit" value={valueSessionId}> {valueSessionId} </Typography>
            <IconButton id="settingsbutton" color="inherit" aria-label="settings">
              <Settings />
            </IconButton>
            <IconButton id="cropfreebutton" color="inherit" aria-label="cropfree" onClick={this.fullscreen}>
              <CropFree />
            </IconButton>
          </Toolbar>
      </AppBar>
          <div id="buttons">
              { valueMuted === false ? <Button id="micbuttonenabled" variant="fab" color="default" aria-label="mic" onClick={this.muteMic}>
                                        <Mic style={{color: 'white'}} />
                                       </Button> 
            : <Button id="micbuttondisabled" variant="fab" color="default" aria-label="mic" onClick={this.muteMic}>
                <MicOff />
              </Button> }
            <Button id="callendbutton" variant="fab" color="secondary" aria-label="callend" type="button" onClick={this.handleClick} value="LeaveSession">
              <CallEnd />
            </Button>
            <Button id="cambutton" variant="fab" color="default" aria-label="videocam" onClick={this.muteCam}>
              <Videocam style={{color: 'white'}}/>
            </Button>
          </div>
          { this.state.mainVideoStream !== undefined ? <div id={valueDistribution + "main-video"} >
            <StreamComponent stream={this.state.mainVideoStream} isMuted={valueMuted}></StreamComponent>
          </div> : null }
          <div id= {valueDistribution + "video-container"} >
          { /*this.state.localStream !== undefined ? <div className= {valueDistribution + "stream-container"} >
              <StreamComponent stream={this.state.localStream} isMuted={valueMuted} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
        </div> : null */}
          { this.state.remoteStreams.map((s, i) => <div key={i} className= {valueDistribution + "stream-container"} >
              <StreamComponent stream={s} isMuted={false} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
            </div>) }
          </div>
        </div> : null }
      </div>
      ); 
  }
}

export default OpenviduHangoutsReact;
