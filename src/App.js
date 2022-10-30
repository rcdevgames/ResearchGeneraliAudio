import React from 'react';
import './App.css';
import MicRecorder from 'mic-recorder-to-mp3';
import axios  from 'axios';

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isRecording: false,
      blobURL: '',
      isBlocked: false,
      base64: '',
      agentCode: '68001291',
      productCode: 'TLC3',
      
      second: 0,
      leadNumber: '68001291-1',
      illustrationNumber: '00XX-0000XX-XXX',
      spajNumber: '9000001',
      blobData: null

    };
    this.count = null;
  }



  start = () => {
    if (this.state.isBlocked) {
      console.log('Permission Denied');
    } else {
      Mp3Recorder
        .start()
        .then(() => {
          this.setState({ isRecording: true });
          this.count = setInterval(() => {
            let second = this.state.second + 1;
            this.setState({second});
          },1000);
        }).catch((e) => console.error(e));
    }
  };

  stop = () => {
    Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        // this.sendFile(blob);
        clearInterval(this.count);
        this.setState({ isRecording: false, blobData: blob });
      }).catch((e) => console.log(e));
  };


  sendFile = async () => {
    let token = await this.getToken();
    var url = "https://via.generali.co.id/uat-omniEapp/eapp/customer/InsRecordCustomer";
    const formData = new FormData();
    formData.append('agentCode', this.state.agentCode);
    formData.append('leadNumber', this.state.leadNumber);
    formData.append('illustrationNumber', this.state.illustrationNumber);
    formData.append('spajNumber', this.state.spajNumber);
    formData.append('deviceId', 'POSTMAN');
    formData.append('productCode', this.state.productCode);
    formData.append('duration', this.state.second);
    formData.append('audioFile', this.state.blobData, 'audio.mp3')

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
    axios.post(url, formData, config)
    .then(resp => {
      this.setState({
        isRecording: false,
        blobURL: '',
        isBlocked: false,
        base64: '',
        agentCode: '68001291',
        productCode: 'TLC3',
        
        second: 0,
        leadNumber: '68001291-1',
        illustrationNumber: '00XX-0000XX-XXX',
        spajNumber: '9000001',
        blobData: null
      })
    })
    .catch(err => {
      console.error(err);
      alert(err.response.data.errMsg)
    });
  }

  componentDidMount() {
    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        this.setState({ isBlocked: false });
      },
      () => {
        console.log('Permission Denied');
        this.setState({ isBlocked: true })
      },
    );
    // this.getData();
  }

  addZero(number) {
    number = parseInt(number).toFixed(0)
    if (parseInt(number) < 10) {
      return "0" + number.toString();
    }else {
      return number.toString();
    }
  }

  async getToken() {
    var url = "https://via.generali.co.id/uat-omniHelper/helper/generateJWTByApp?app=omni";
    var response = await axios.get(url).catch(err => console.log(err));
    return response.data.Token;
  }

  async getData() {
    let token = await this.getToken();
    let { agentCode, productCode } = this.state;
    if (agentCode !== "" && productCode !== "") {
      var url = "https://via.generali.co.id/uat-omniEapp/eapp/customer/getRecordAgent";
      axios.post(url, { agentCode, productCode }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })
      .then(({data}) => {
        this.setState({
          base64: `data:audio/mp3;base64,${data.data.base64File}`
        })
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.errMsg)
      });
    }
  }

  render(){
    return (
      <div className="App">
        <div className="App-header">
          {this.state.base64 === "" &&
            <>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
                  <label style={{marginRight: 5}}>Kode Agen</label>
                  <label style={{marginRight: 5}}>Kode Produk</label>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <input style={{marginBottom: 5}} placeholder="Kode Agen" onChange={e => this.setState({agentCode: e.target.value})} value={this.state.agentCode}/>
                  <input placeholder="Kode Produk" onChange={e => this.setState({productCode: e.target.value})} value={this.state.productCode}/>
                </div>
              </div>
              <br/>
              <button onClick={() => this.getData()}>Get Data</button>
            </>
          }
          {this.state.base64 !== "" &&
            <>
              <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
                  <label style={{marginRight: 5}}>Lead Number</label>
                  <label style={{marginRight: 5}}>Illustration Number</label>
                  <label style={{marginRight: 5}}>Spaj Number</label>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
                  <input style={{marginBottom: 5}} placeholder="Lead Number" onChange={e => this.setState({leadNumber: e.target.value})} value={this.state.leadNumber}/>
                  <input style={{marginBottom: 5}} placeholder="Illustration Number" onChange={e => this.setState({illustrationNumber: e.target.value})} value={this.state.illustrationNumber}/>
                  <input placeholder="Spaj Number" onChange={e => this.setState({spajNumber: e.target.value})} value={this.state.spajNumber}/>
                </div>
              </div>
              <br/>
              <audio src={this.state.base64} controls="controls" /> 
              <br/>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <label>{this.addZero(this.state.second / 60)}:{this.addZero(this.state.second % 60)}</label>
                <div style={{width: 10}}/>
                <button onClick={this.start} disabled={this.state.isRecording}>Record</button>
                <div style={{width: 10}}/>
                <button onClick={this.stop} disabled={!this.state.isRecording}>Stop</button>
              </div>
              <br/>
              <button onClick={this.sendFile} disabled={this.state.isRecording}>Kirim File</button>
            </>
          }
        </div>
      </div>
    );
  }
}

export default App;
