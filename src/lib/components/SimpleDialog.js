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

class SimpleDialog extends React.Component {

    state= {
        devices: this.props.devices
    }
    handleClose = () => {
        this.props.onClose(this.props.selectedValue);
    };

    handleListItemClick = value => {
        this.props.onClose(value.label);
    };

  componentWillReceiveProps(nextProps) {
      var devicesAux = [];
      var i;
      for (i = 0; i < nextProps.devices.length; i++) { 
        if(nextProps.devices[i].kind === "videoinput") {
            devicesAux.push(nextProps.devices[i]);
        }
      }
      this.setState({
        devices: devicesAux
      });
  }

  render() {
    const { devices, classes, onClose, selectedValue, ...other } = this.props;
    console.log(this.props);
    return (
        
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" {...other}>
        <DialogTitle id="simple-dialog-title">Set your cam device</DialogTitle>
        <div>
            { this.state.devices !== null ?
          <List>
            {this.state.devices.map(device => (
              <ListItem button onClick={() => this.handleListItemClick(device)} key={device.deviceId}>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    <Videocam />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={device.label} />
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