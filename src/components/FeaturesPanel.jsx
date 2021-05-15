import React from 'react'
import { Tabs } from 'antd';
import RoutePanel from './RoutePanel'
import RoadSettings from './RoadSettings'

const { TabPane } = Tabs;

const Features = ({factory}) => {
	return <div className="">
		<Tabs type="card">
			<TabPane tab="Слои" key="1">
				<RoadSettings factory={factory} />
			</TabPane>
			<TabPane tab="Построение пути" key="2">
				<RoutePanel factory={factory} />
			</TabPane>
		</Tabs>
	</div>
}

export default Features