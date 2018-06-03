import React, { Component } from 'react';
import './OpenviduHangoutsReact.css';
import { OpenVidu } from 'openvidu-browser';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import StreamComponent from './StreamComponent.js';
import SimpleDialog from './SimpleDialog.js';
import Button from '@material-ui/core/Button';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from '@material-ui/core/IconButton';
import Settings from '@material-ui/icons/Settings';
import CropFree from '@material-ui/icons/CropFree';
import CallEnd from '@material-ui/icons/CallEnd';
import Mic from '@material-ui/icons/Mic';
import MicOff from '@material-ui/icons/MicOff'
import Videocam from '@material-ui/icons/Videocam';
import blue from '@material-ui/core/colors/blue';
import VideocamOff from '@material-ui/icons/VideocamOff';
import axios from 'axios';
import Chat from '@material-ui/icons/Chat';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Send from '@material-ui/icons/Send';
import ArrowBack from '@material-ui/icons/ArrowBack';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const styles = {
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
};

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: '#00BFA5',
      main: '#00BFA5',
      dark: '#00BFA5',
      contrastText: '#FAFAFA',
    },
    secondary: {
      light: '#00BFA5',
      main: '#00BFA5',
      dark: '#00BFA5',
      contrastText: '#FAFAFA',
    },
  },
});

SimpleDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  selectedValue: PropTypes.string,
  devices: PropTypes.array
};

const SimpleDialogWrapped = withStyles(styles)(SimpleDialog);  


class OpenviduHangoutsReact extends Component {
  
  constructor(props){
    super(props);
    this.state = {valueSessionId: this.props.sessionId,
                  valueUserName: this.props.participantId,
                  stateWsUrl: this.props.wsUrl,
                  session: undefined,
                  publisher: undefined,
                  mainVideoStream: undefined,
                  localStream: undefined,
                  remoteStreams: [],
                  open: false,
                  selectedValue: undefined,
                  devices: null,
                  fullscreen: false,
                  valueMessage: undefined,
                  initialStyle: true,
                  initialPercent: undefined,
                 };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick  = this.handleClick.bind(this);
    this.muteMic = this.muteMic.bind(this);
    this.muteCam = this.muteCam.bind(this);
    this.fullscreen = this.fullscreen.bind(this);
    this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
    this.openNav = this.openNav.bind(this);
    this.closeNav = this.closeNav.bind(this);
    this.onbeforeunload = this.onbeforeunload.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  scrollToBottom() {
    if(this.messagesEnd !== null && this.messagesEnd !== undefined){
      this.messagesEnd.scrollIntoView({behaviour: "smooth"});
    }
  }

  componentDidUpdate(){
    this.scrollToBottom();
  }

  sendMessage() {
    this.scrollToBottom();
    document.getElementById("message").value = "";
    var sessionAux = this.state.session;
    sessionAux.signal({
      data: this.state.valueMessage,  // Any string (optional)
      to: [],                     // Array of Connection objects (optional. Broadcast to everyone if empty)
      type: 'my-chat'             // The type of message (optional)
    })
    .then(() => {
        console.log('Message successfully sent');
        this.setState({
          valueMessage: ""
        });
    })
    .catch(error => {
        console.error(error);
    });
  }

  handleSendMessage(e){
    this.setState({
      valueMessage : e.target.value,
    });
  }


  handleSubmit(event){
    event.preventDefault();
    this.joinSession();
  }

  handleClick(e){
    this.leaveSession(e);
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

  componentWillReceiveProps(nextProps){
    this.setState({
      valueSessionId: nextProps.sessionId,
      valueUserName: nextProps.participantId
    });
  }

  joinSession() {

      this.OV = new OpenVidu();

      if(this.OV !==undefined && this.OV!==null){
        var promise1 = Promise.resolve(this.OV.getDevices());
        var that3 = this;
        promise1.then(function(value) {
          that3.setState({
            devices: value
          });

        });
      }

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

        mySession.on('signal:my-chat', (event) => {
          var ul = document.getElementById('messageslist');
          var str = event.from.data;
          var res = str.split(":")[1];
          var username = res.split("\"")[1];

          var date = new Date();
          var hours = date.getHours();
          var minutes = date.getMinutes();
          if(minutes < 10){
            minutes = "0"+minutes;
          }
          ul.innerHTML += '<li class="messageelement"><div class="usernameinformation"><span class="username">' + username + ":</span> <span class=\"messagecontent\">" + event.data + "</span></div><span class=\"hour\">" + hours + ":" + minutes + '</span></li>';
        });


        mySession.on('streamDestroyed', (event) => {
          event.preventDefault();
        
          that1.deleteRemoteStream(event.stream);
        });
        
        var that = this;
        
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
                publisher: publisher,
                localStream: publisher.stream,
                mainVideoStream: that.state.localStream
              }, () => {
                if(that.state.localStream!==undefined&&that.state.mainVideoStream!==undefined&&that.state.publisher!==undefined){
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

    getToken(mySessionId) {
	    return this.createSession(mySessionId).then(sessionId => this.createToken(sessionId));
    };

    createSession(sessionId) {
      var OPENVIDU_SERVER_URL = "https://" + this.state.stateWsUrl + ":4443";
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
          var result = JSON.parse(response.request.response);
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
      var OPENVIDU_SERVER_URL = "https://" + this.state.stateWsUrl + ":4443";
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
          resolve(response.data.token);
        })
        .catch((error) => {
          reject(error);
        });
      });
    };
    
    leaveSession(e) {
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

      this.props.updateLogin(e);

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
      this.scrollToBottom();
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
      if(this.state.publisher!==undefined){
        var actualPublisher = this.state.publisher;
        actualPublisher.properties.publishAudio = !actualPublisher.properties.publishAudio;
        actualPublisher.publishAudio(actualPublisher.properties.publishAudio);
        this.setState({
          publisher: actualPublisher
        });
      }
    }

    muteCam(){
      if(this.state.publisher!==undefined){
        var actualPublisher = this.state.publisher;
        actualPublisher.properties.publishVideo = !actualPublisher.properties.publishVideo;
        actualPublisher.publishVideo(actualPublisher.properties.publishVideo);
        this.setState({
          publisher: actualPublisher
        });
      }
    }

    fullscreen(){
      if(this.state.initialStyle === true) {
        this.setState({
          initialStyle: document.getElementById("main-video").offsetHeight + "px",
        });
      }
      
      var element = document.getElementById("videoCallId");

      var videoCall = document.getElementById("videoCallContainer");

      if(this.state.fullscreen === false){
        var previousWidth = videoCall.clientWidth;
        var previousPercent = previousWidth / document.documentElement.clientWidth;
        previousPercent = previousPercent * 100;
        this.setState({
          initialPercent: previousPercent
        });
      }

      if(this.state.fullscreen === false) {
        this.setState({
          fullscreen: true
        });
      } else {
        this.setState({
          fullscreen: false
        });
      }
      

      if ((document.fullScreenElement && document.fullScreenElement !== null) ||
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {     
        if (element.requestFullScreen) {
          element.requestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }

        this.setState({
          initialStyle: document.getElementById("main-video").clientHeight + "px"
        })
        this.closeNav();
        document.getElementById("mySidenav").style.height = (window.screen.height - 57) + "px";
        document.getElementById("main-video").style.height = (window.screen.height - 57) + "px";
        document.getElementById("sendmessage").style.paddingLeft = "5%";
        document.getElementById("sendmessage").style.paddingRight = "5%";
        document.getElementById("video-container").style.fontSize = "12px";
        document.getElementById("video-container").style.bottom = "15%";
        document.getElementById("settingsbutton").style.display = "none";
        document.getElementById("sendmessage").style.maxWidth = "400px";
        document.getElementById("sendmessage").style.margin = "0 auto";
        
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
        this.closeNav();
        document.getElementById("main-video").style.height = "unset";
        document.getElementById("mySidenav").style.height = this.state.initialStyle;
        videoCall.style.width = this.state.initialPercent + '%';
        document.getElementById("sendmessage").style.paddingLeft = "0%";
        document.getElementById("sendmessage").style.paddingRight = "0%";
        document.getElementById("video-container").style.fontSize = "10px";
        document.getElementById("video-container").style.bottom = "5%";
        document.getElementById("settingsbutton").style.display = "initial";
        document.getElementById("session").style.overflow = "initial";
        document.getElementById("sendmessage").style.maxWidth = "unset";
        document.getElementById("sendmessage").style.margin = "unset";
      }
    }

  handleClickOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleClose = value => {
    this.setState({ selectedValue: value, open: false }, () => {
      var deviceName = undefined;
      var deviceType = undefined;
      if(value!==undefined){
        deviceName = value.split("/")[0];
        deviceType = value.split("/")[1];
      }
      var publisherAux = this.state.publisher;
      if(deviceType === "videoinput"){
        publisherAux.properties.videoSource = deviceName;
      } else {
        publisherAux.properties.audioSource = deviceName;
      }
      this.setState({
        publisher: publisherAux
      })
      
    });
    
  };

  openNav() {
    document.getElementById("session").style.overflow = "hidden";
    document.getElementById("mySidenav").style.height = document.getElementById("main-video").clientHeight + "px";
    document.getElementById("mySidenav").style.width = "35%";
    document.getElementById("main-video").style.width = "65%";
    if(this.state.fullscreen === true) {
      document.getElementById("mySidenav").style.width = "20%";
      document.getElementById("main-video").style.width = "80%";
    }
    document.getElementById("main-video").style.height = document.getElementById("mySidenav").style.height;
    document.getElementById("main-video").style.cssFloat = "right";
    document.getElementById("main-video").style.backgroundColor = "black";
    document.getElementById("chatbuttondiv").style.transition = "0.1s";
    document.getElementById("chatbuttondiv").style.visibility = "hidden";
    document.getElementById("buttons").style.top = "60%";
    document.getElementsByClassName("streamcomponent")[0].style.marginTop = "17%";
    if(this.state.fullscreen === true) {
      document.getElementsByClassName("streamcomponent")[0].style.marginTop = "0%";
    }

  }

  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main-video").style.width = "100%";
    document.getElementById("chatbuttondiv").style.transition = "0.1s";
    document.getElementById("chatbuttondiv").style.visibility = "visible";
    document.getElementById("main-video").style.backgroundColor = "white";
    document.getElementsByClassName("streamcomponent")[0].style.marginTop = "0%";
    document.getElementById("buttons").style.top = "70%";
    document.getElementById("mySidenav").style.height = document.getElementById("main-video").clientHeight + "px";
    if(this.state.fullscreen === false) {
      document.getElementById("main-video").style.height = "unset";
    }
  }

  

  render() {
    var valueSessionId = this.state.valueSessionId;
    var valueAudio = true;
    var valueVideo = true;
    var actualDevices = this.state.devices;
    if(this.state.publisher!==undefined){
      valueAudio = this.state.publisher.properties.publishAudio;
      valueVideo = this.state.publisher.properties.publishVideo;
    }
    var lengthValueMessage = 0;

    if(this.state.valueMessage !== undefined){
      lengthValueMessage = this.state.valueMessage.length;
    }

      return (
        <div id = {"videoCallId"} className = {"videoCall"}>
        { this.state.session !== undefined ? <div id="session">
          <AppBar position="static" id="session-header">
              <Toolbar>
                <Typography variant="title" color="inherit" value={valueSessionId}> {valueSessionId} </Typography>
                <IconButton id="settingsbutton" color="inherit" aria-label="settings" onClick={this.handleClickOpen}>
                  <Settings />
                </IconButton>
                <IconButton id="cropfreebutton" color="inherit" aria-label="cropfree" onClick={this.fullscreen}>
                  <CropFree />
                </IconButton>
              </Toolbar>
          </AppBar>
          <SimpleDialogWrapped
              selectedValue={this.state.selectedValue}
              open={this.state.open}
              onClose={this.handleClose}
              devices={actualDevices}
            />   
          <div id={"mySidenav"} className={"sidenav"}>
            <ul id={"messageslist"}>
            </ul>
            <MuiThemeProvider theme = {theme}>
            <div id = "sendmessage" ref={(el) => { this.messagesEnd = el; }}>
              <Divider/>
              <Button className={"closebtn"} size="small" onClick={this.closeNav}><ArrowBack style={{color: 'white', fontSize: "26px"}}/></Button>
              <TextField className="form-control" type="text" id="message" placeholder={"Send a message"} InputProps={{color: 'white'}} onChange={this.handleSendMessage.bind(this)} required />
              { lengthValueMessage > 0 ? <IconButton id="sendbutton" color="inherit" aria-label="send" onClick= {this.sendMessage}>
                  <Send style={{color: '#00BFA5'}}/>
              </IconButton> :
              <IconButton id="sendbutton" color="inherit" aria-label="send" onClick= {this.sendMessage} disabled>
                  <Send style={{color: 'grey'}}/>
              </IconButton> }
              </div>
            </MuiThemeProvider>
          </div>
          { this.state.mainVideoStream !== undefined ? <div id={"main-video"} >
          <div id="chatbuttondiv">
          <Button id="chatbutton" variant="raised" size="small" onClick={this.openNav}>
            <Chat style={{color: 'white'}}/>
          </Button>
          </div>
          <div id="buttons">
              { valueAudio === true ? <Button id="micbuttonenabled" variant="fab" color="default" aria-label="mic" onClick={this.muteMic}>
                                        <Mic style={{color: 'white'}} />
                                       </Button> 
            : <Button id="micbuttondisabled" variant="fab" color="default" aria-label="mic" onClick={this.muteMic}>
                <MicOff />
              </Button> }
            <Button id="callendbutton" variant="fab" color="secondary" aria-label="callend" type="button" onClick={this.handleClick} value="LeaveSession">
              <CallEnd />
            </Button>
              { valueVideo === true ? <Button id="cambuttonenabled" variant="fab" color="default" aria-label="videocam" onClick={this.muteCam}>
                                        <Videocam style={{color: 'white'}}/>
                                      </Button>
            : <Button id="cambuttondisabled" variant="fab" color="default" aria-label="videocam" onClick={this.muteCam}>
                <VideocamOff/>
              </Button> }
          </div>
            <StreamComponent stream={this.state.mainVideoStream}></StreamComponent>
            <div id= {"video-container"} >
              { this.state.localStream !== undefined ? <div className= {"stream-container"} >
                <StreamComponent stream={this.state.localStream} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
                </div> : null }
              { this.state.remoteStreams.map((s, i) => <div key={i} className= {"stream-container"} >
                <StreamComponent stream={s} mainVideoStream={this.handleMainVideoStream}></StreamComponent>
              </div>) }
            </div>
          </div> : null }
        </div> : null }
        </div>
      ); 
  }
}

export default OpenviduHangoutsReact;
