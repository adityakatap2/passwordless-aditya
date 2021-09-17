import React from 'react';

// import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import "../../../Components/global.css"
import { Tabs } from 'antd';
import { AppleOutlined, AndroidOutlined , MobileOutlined } from '@ant-design/icons'
import Charts from '../UserCharts/Charts'
import { makeStyles, useTheme } from '@material-ui/core/styles';

export default function ApplicationTabs () {
  const useStyles = makeStyles((theme) => ({
    tabpane: {
      height: "auto",
      width: "100%",
      padding: "50px",
      background: "#eeeeee",
      marginBottom:"400px",
    },
  }));
  function callback(key) {
    console.log(key);
  }
    const { TabPane } = Tabs;
    return (
        <div>
           <Tabs  onChange={callback} type="card">
    <TabPane className="tabpane"  tab="Application 1" key="1">
      <Charts/>
    </TabPane>
    <TabPane className="tabpane" tab="Application 2" key="2">
    <Charts/>
    </TabPane>
    <TabPane className="tabpane" tab="Application 3" key="3">
    <Charts/>
    </TabPane>
  </Tabs>
            {/* <Tabs defaultActiveKey="1">
    <TabPane
      tab={
        <span>
          <AppleOutlined />
          Tab 1
        </span>
      }
      key="1"
    >
      Tab 1
    </TabPane>
    <TabPane
      tab={
        <span>
          <AndroidOutlined />
          Tab 2
        </span>
      }
      key="2"
    >
      Tab 2
    </TabPane>
    <TabPane
      tab={
          <div>
              <span>
          <MobileOutlined />
         Tab 3
        </span>
  
          </div>
        
      }
      key="3"
    >
      Tab 3
    </TabPane>
  </Tabs> */}
        </div>
    )
}



