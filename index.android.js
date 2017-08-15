import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  ListView,
  TouchableNativeFeedback,
  Clipboard,
  Keyboard,
  ToastAndroid
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


// seleksi tidak bisa ditaruh di state, mungkin karena setState berpengaruh pada mount component
var textTerSelect = { start: 0, end: 0 };
isUpdate = false;

export default class LetterCaseModifier extends Component {
  ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

  constructor() {
    super();

    this.state = {
      dataSource: this.ds.cloneWithRows([1]),
      textData: {},
      selectedSimpan: 1,
      textTerSelect: textTerSelect,
      text: "",
      isUpdate: false,
      textUpdate: "",
      isKeyboardShow: true,
      iconKeyboard: "keyboard-off"
    };
  }

  componentWillMount() {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  }
  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
    this.keyboardDidShowListener.remove();
  }

  componentDidMount() {
    //this.setState({datasource : this.ds.cloneWithRows(['1'])});
  }

  componentDidUpdate() {
    //console.log(isUpdate);
  }

  gantiText = (textnya, isKetik = false) => {
    obj = {};
    obj[this.state.selectedSimpan] = textnya||"";
    this.setState({ isUpdate: false, textData: Object.assign(this.state.textData, obj), text: textnya });
  }

  getText = () => {
    return this.state.textData[this.state.selectedSimpan]||"";
  }

  getSelectedText = () => {
    start = textTerSelect.start;
    end = textTerSelect.end;
    return this.getText().substr(start, end - start);
  }

  ubahSelectedText = (textUbah) => {
    start = textTerSelect.start;
    end = textTerSelect.end;
    var hasil = this.getText().substr(0, start) + textUbah + this.getText().substr(end, this.getText().length);
    return hasil;
  }

  ubahSeleksi = (event) => {
    textTerSelect = event.nativeEvent.selection;
    //this.setState({textTerSelect : textTerSelect});
  }

  selekAll = () =>{
    this.refs["textinput"].blur();
    this.refs["textinput"].focus();
  }

  getCursor = () => {
    //console.log(this.state.textTerSelect);
    if (this.state.textTerSelect.start == this.state.textTerSelect.end)
      return this.state.textTerSelect.start;
    else
      return "[" + this.state.textTerSelect.start + "," + this.state.textTerSelect.end + "]";
  }

  /* SET LETTER CASE */
  setUpperCase = () => {
    var { start, end } = textTerSelect;
    var ubah = this.getText().substr(start, end - start).toUpperCase();
    var hasil = this.ubahSelectedText(ubah);
    this.gantiText(hasil);
    //console.log(hasil);
  }

  setLowerCase = () => {
    var { start, end } = textTerSelect;
    var ubah = this.getText().substr(start, end - start).toLowerCase();
    var hasil = this.ubahSelectedText(ubah);
    this.gantiText(hasil);
  }

  setFirstCase = () => {
    var { start, end } = textTerSelect;
    var ubah = this.getText().substr(start, (end-start) > 0 ? 1 : 0).toUpperCase() + this.getText().substr(start + 1, end - start - 1).toLowerCase();
    var hasil = this.ubahSelectedText(ubah);
    this.gantiText(hasil);
  }

  setInitCap = () => {
    var { start, end } = textTerSelect;

    var ubah = this.getText().substr(start, end - start).toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
      return m.toUpperCase();
    });

    var hasil = this.ubahSelectedText(ubah);
    this.gantiText(hasil);
  }

  /* CLIPBOARD */
  setClipboard = async () => {
    Clipboard.setString(this.getSelectedText());
  }

  getClipboard = async () => {
    return await Clipboard.getString();
  }

  pasteClipboard = () => {
    this.getClipboard().then((value) => {
      var hasil = this.ubahSelectedText(value);
      this.gantiText(hasil);
    });
  }

  /* KEYBOARD */
  hideKeyBoard = () => {
    if (this.state.isKeyboardShow) {
      Keyboard.dismiss();
      this.setState({ isKeyboardShow: !this.state.isKeyboardShow, iconKeyboard: 'keyboard' });
    }
    else {
      this.refs["textinput"].focus();
      this.setState({ isKeyboardShow: !this.state.isKeyboardShow, iconKeyboard: 'keyboard-off' });
    }
  }

  _keyboardWillShow = (event) => {
    //console.warn("gundul ");
    // if(!this.state.isKeyboardShow)
    //   return !this.state.isKeyboardShow;
  }

  _keyboardDidShow = () => {
    this.setState({ isKeyboardShow: true, iconKeyboard: 'keyboard-off' });
  }

  _keyboardDidHide = () => {
    this.setState({ isKeyboardShow: false, iconKeyboard: 'keyboard' });
  }

  tambahPenyimpanan = () => {
    var arr = this.state.dataSource._dataBlob.s1;
    if(arr.length >= 10) {
      ToastAndroid.show('Wow, no need to much log, You\'ll get pain..', ToastAndroid.SHORT);
      return;
    }
    var baru = arr[arr.length-1] + 1;
    arr.push(baru);

    obj = {}; obj[baru] = this.state.textData[this.state.selectedSimpan];
    this.setState({ dataSource: this.ds.cloneWithRows(arr), textData: Object.assign(this.state.textData, obj) });
  }

  hapusPenyimpanan = (no) => {
    var arr = this.state.dataSource._dataBlob.s1;
    if(arr.length > 1){
      var indek = arr.indexOf(no)==arr.length-1 ? arr.indexOf(no)-1 : arr.indexOf(no);
      arr = arr.filter(item => item != no);    
      var i = arr[indek];
      var obj = this.state.textData;
      //console.log(obj);
      delete obj[this.state.selectedSimpan];
      //console.log(obj);
      this.setState({selectedSimpan : i,  dataSource: this.ds.cloneWithRows(arr), textData: obj});
      
    }else {
      ToastAndroid.show('I\'m the only ONE, don\'t throw me out. Please..', ToastAndroid.SHORT);
    }
  }

  hapusSemuaPenyimpanan = () => {
    const arr = this.state.dataSource._dataBlob.s1;
    var baru = [];
    var obj = this.state.textData;
    arr.forEach((val)=>{
      if(val == this.state.selectedSimpan) {
        baru.push(val);
      }
      else {
        delete obj[val];
      }
    });

    this.setState({dataSource : this.ds.cloneWithRows(baru), textData : obj})
    //console.log(arr);
  }

  pilihPenyimpanan = (no) => {
    this.setState({selectedSimpan : no});
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.atas}>
          <View removeClippedSubviews={false} style={styles.tempatText}>
            <TextInput
              style={styles.inputText}
              placeholder="Your Text in Here, Please"
              placeholderTextColor='#ADADAD'
              multiline={true}
              selectionColor='#87BDD9'
              onChangeText={this.gantiText}
              selectTextOnFocus={true}
              //selection={this.state.textTerSelect}
              //onEndEditing={(text) => this.gantiText(text)}
              underlineColorAndroid='#1E1E1E'
              onSelectionChange={(event) => this.ubahSeleksi(event)}
              value={this.getText()}
              disableFullscreenUI={true}
              ref="textinput"
            />
            <Text style={styles.informasiInputText}>{this.getText().length || 0}</Text>
          </View>
          <View style={styles.kanan}>
            <View style={[styles.tempatControlKanan]}>
              <TombolControlKanan materialIconName="delete-sweep" onPress={()=> this.hapusPenyimpanan(this.state.selectedSimpan)}
                onLongPress={()=> this.hapusSemuaPenyimpanan()} />
              <TombolControlKanan materialIconName="note-plus" onPress={() => this.tambahPenyimpanan()} />
            </View>
            <ListView dataSource={this.state.dataSource}
              style={styles.tempatSimpan}
              renderRow={(rowData) => 
                <TombolPenyimpanan text={rowData} terpilih={this.state.selectedSimpan} 
                  onPress={()=> this.pilihPenyimpanan(rowData)} />}
            />
          </View>
        </View>
        <View style={styles.bawah}>
          <TombolControl bigText="A" subText="UPPERCASE" onPress={() => this.setUpperCase()} />
          <TombolControl bigText="a" subText="lowercase" onPress={() => this.setLowerCase()} />
          <TombolControl bigText="Aa" subText="Firstcase" onPress={() => this.setFirstCase()} onLongPress={() => this.setInitCap()} />
          <TombolControlIcon materialIconName="content-copy" onPress={() => this.setClipboard()} />
          <TombolControlIcon materialIconName="content-paste" onPress={() => this.pasteClipboard()} />
          <TombolControlIcon materialIconName="select-all" onPress={() => this.selekAll()} />
          {/* <TombolControlIcon materialIconName={this.state.iconKeyboard} showUnderline={true} onPress={()=>this.hideKeyBoard()} /> */}
        </View>
      </View>
    );
  }
}

export class TombolControl extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#ADADAD')}
        onPress={this.props.onPress} onLongPress={this.props.onLongPress}>
        <View style={styles.tombolControl}>
          <Text style={styles.controlText}>{this.props.bigText}</Text>
          <Text style={styles.subText}>{this.props.subText}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }
}

export class TombolControlIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    //var styleControl = this.props.showUnderline ? styles.tombolControlUnderline : '';
    return (
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#ADADAD')}
        onPress={this.props.onPress}
        onLongPress={this.props.onLongPress}>
        <View style={[styles.control, styles.tombolControlIcon]}>
          <Text style={[styles.controlText, styles.controlText2]}>
            {' '}<Icon name={this.props.materialIconName || "clear"} size={this.props.size || 24} align="center" /> </Text>
        </View>
      </TouchableNativeFeedback>
    )
  }
}

export class TombolControlKanan extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#ADADAD')}
        onPress={this.props.onPress} onLongPress={this.props.onLongPress}>
        <View style={styles.controlKanan}>
          <Text style={[styles.controlText, styles.controlText2]}>
            <Icon name={this.props.materialIconName || "clear"} size={this.props.size || 24} align="center" /></Text>
        </View>
      </TouchableNativeFeedback>
    )
  }
}

export class TombolPenyimpanan extends Component{
  constructor(props) {
    super(props);
  }

  render() {
    var stilTerpilih = (this.props.terpilih == this.props.text) ? styles.terpilih : {};
    var stilTextTerpilih = (this.props.terpilih == this.props.text) ? styles.textTerpilih : {};
    return (
      <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#FFF')} onPress={this.props.onPress}>
        <View style={[styles.controlKanan, stilTerpilih]}>
          <Text style={[styles.simpan, stilTextTerpilih]}>{this.props.text}</Text>
        </View>
      </TouchableNativeFeedback>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#1E1E1E',
    flexDirection: 'column'
  },
  atas: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row'
  },
  tempatText: {
    flex: 1,
    padding: 2,
  },
  inputText: {
    flex: 1,
    margin: 3,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    //backgroundColor : '#FFFFFF1A',
    borderRadius: 2,
    elevation: -3
  },
  informasiInputText: {
    fontSize: 11,
    color: '#DDD',
    textAlign: 'right',
    paddingRight: 5,
    paddingBottom: 5
  },
  kanan: {
    width: 48
  },
  tempatSimpan: {
    //width : 48,
    flex: 1,
    backgroundColor: '#252526',
    elevation: 5,
    flexDirection: 'column',
    //alignItems : 'right'
    //justifyContent : 'flex-start'
  },
  tempatControlKanan: {
    height: 92,
    backgroundColor: '#252526',
    elevation: 5,
    flexDirection: 'column',
    marginTop: 2
  },
  simpan: {
    //backgroundColor: '#333',
    //backgroundColor : '#FFFFFF',
    //elevation: 2,
    textAlignVertical: 'center',
    textAlign: 'center',
    color: '#ADADAD',
    height: 42,
    //margin: 2,
    //width : 42
  },
  terpilih: {
    backgroundColor: '#ADADAD',
  },
  textTerpilih: {
    color: '#333'
  },
  controlKanan: {
    backgroundColor: '#333',
    elevation: 2,
    height: 42,
    margin: 2,
    //color : '#ADADAD',
    alignItems: 'center'
  },
  bawah: {
    height: 54,
    backgroundColor: '#333',
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
    //borderTopColor : '#FFC107',
  },
  control: {
    //backgroundColor : '#007ACC',
    backgroundColor: '#333',
    flex: 1,
    alignItems: 'center',
    margin: 2,
    height: 48,
    flexDirection: 'row',
    elevation: 2,
  },
  controlText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#ADADAD',
    fontSize: 20
  },
  controlText2: {
    flex: 1,
    fontSize: 15
  },
  controlTextUnderline: {
    textDecorationLine: 'underline'
  },
  tombolControl: {
    backgroundColor: '#333',
    flex: 1,
    alignItems: 'center',
    margin: 2,
    height: 48,
    flexDirection: 'column',
    elevation: 2,
  },
  tombolControlIcon: {
    flex: 0.8
  },
  tombolControlUnderline: {
    backgroundColor: 'lightslategray'
  },
  subText: {
    flex: 0.5,
    fontSize: 8,
    color: '#ADADAD'
  }
});

AppRegistry.registerComponent('LetterCaseModifier', () => LetterCaseModifier);
