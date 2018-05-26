/* eslint-disable react/no-multi-comp */

import React from 'react';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List';
import ListItem from 'material-ui/List/ListItem';
import ListItemAvatar from 'material-ui/List/ListItemAvatar';
import ListItemText from 'material-ui/List/ListItemText';
import DialogTitle from 'material-ui/Dialog/DialogTitle';
import Dialog from 'material-ui/Dialog';
import Videocam from '@material-ui/icons/Videocam';
import Mic from '@material-ui/icons/Mic';

class SimpleDialog extends React.Component {

    state= {
        camdevices: this.props.devices,
        micdevices: this.props.devices
    }
    handleClose = () => {
        this.props.onClose(this.props.selectedValue);
    };

    handleListItemClick = value => {
        this.props.onClose(value.label+"/"+value.kind);
    };

  componentWillReceiveProps(nextProps) {
      var camdevicesAux = [];
      var micdevicesAux = [];
      var i;
      for (i = 0; i < nextProps.devices.length; i++) { 
        if(nextProps.devices[i].kind === "videoinput") {
            camdevicesAux.push(nextProps.devices[i]);
        } else {
            micdevicesAux.push(nextProps.devices[i]);
        }
      }
      this.setState({
        camdevices: camdevicesAux,
        micdevices: micdevicesAux
      });
  }

  render() {
    const { devices, classes, onClose, selectedValue, ...other } = this.props;
    console.log(this.props);
    return (
        
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
        <DialogTitle id="simple-dialog-title">Set your cam device</DialogTitle>
        <div>
            { this.state.camdevices !== null ?
          <List>
            {this.state.camdevices.map(camdevice => (
              <ListItem button onClick={() => this.handleListItemClick(camdevice)} key={camdevice.deviceId}>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    <Videocam />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={camdevice.label} />
              </ListItem>
            ))}
          </List>

          : null }
          <DialogTitle id="simple-dialog-title">Set your mic device</DialogTitle>
          { this.state.micdevices !== null ?
          <List>
            {this.state.micdevices.map(micdevice => (
              <ListItem button onClick={() => this.handleListItemClick(micdevice)} key={micdevice.deviceId}>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    <Mic />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={micdevice.label} />
              </ListItem>
            ))}
          </List>
          
          : null }
        </div>
      </Dialog>
    );
  }
}
export default SimpleDialog;