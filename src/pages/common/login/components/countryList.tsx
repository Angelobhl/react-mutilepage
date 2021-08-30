// @ts-nocheck
import React from 'react';
import { getCountryList } from '../../api/login'
import { ListView, List, NavBar, Icon } from 'antd-mobile';

import '../../static/css/countryList.css';

const { Item } = List;

function genData(ds, provinceData) {
  const dataBlob = {};
  const sectionIDs = [];
  const rowIDs = [];
  Object.keys(provinceData).forEach((item, index) => {
    sectionIDs.push(item);
    dataBlob[item] = item;
    rowIDs[index] = [];

    provinceData[item].forEach((jj) => {
      rowIDs[index].push(jj.value);
      dataBlob[jj.value] = jj.label;
    });
  });
  return ds.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
}

interface CountryListProps {
  countrySelect: (code: string) => void
}

class CountryList extends React.Component<CountryListProps, {}> {
  constructor(props: CountryListProps) {
    super(props)

    const getSectionData = (dataBlob, sectionID) => dataBlob[sectionID];
    const getRowData = (dataBlob, sectionID, rowID) => dataBlob[rowID];

    const dataSource = new ListView.DataSource({
      getRowData,
      getSectionHeaderData: getSectionData,
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    this.state = {
      inputValue: '',
      dataSource,
      show: false
    };

    this.triggerPanel = this.triggerPanel.bind(this)
    this.handleCountryClick = this.handleCountryClick.bind(this)
  }

  async componentWillMount () {
    if (!this.state.show) {
      return false
    }
    const {data: {data: {list}, code}} = await getCountryList()
    if (code === 0) {
      // this.setState({
      //   countryList: list
      // })
      let oCountry = {}
      let item
      for (item of list) {
        let key = item.locale[0]
        if (!oCountry[key]) {
          oCountry[key] = []
        }
        oCountry[key].push({value: '+' + item.code, label: item.zh, spell: item.en})
      }
      this.setState({
        dataSource: genData(this.state.dataSource, oCountry)
      });
    }
  }

  triggerPanel (show?: boolean) {
    this.setState({show: show || !this.state.show})
  }

  handleCountryClick (code) {
    this.props.countrySelect(code)
    this.triggerPanel()
  }

  render () {
    return (
      <div className="country-select-panel" style={{ display: this.state.show ? '' : 'none' }}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => {this.triggerPanel()}}
        >国家地区</NavBar>
        <div className="country-select-list">
          <ListView.IndexedList
            dataSource={this.state.dataSource}
            className="am-list sticky-list"
            renderSectionHeader={sectionData => (
              <div>{sectionData}</div>
            )}
            renderRow={(rowData, sectionID, rowID) => {
              return (<Item onClick={() => {this.handleCountryClick(rowID)}}>{rowData}({rowID})</Item>)
            }}
            quickSearchBarStyle={{
              top: 85,
            }}
            delayTime={10}
          />
        </div>
      </div>
    )
  }
}

export default CountryList;