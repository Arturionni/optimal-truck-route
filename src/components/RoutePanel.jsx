import React from 'react'
import { FontColorsOutlined, BoldOutlined, } from '@ant-design/icons';
import { Input, Button } from 'antd';

const RoutePanel = () => {
	const calcRoute = () => {

	}
	
	return <div className="space_panel_area">
		<Input size="large" placeholder="Точка А" prefix={<FontColorsOutlined />} />
		<Input size="large" placeholder="Точка B" prefix={<BoldOutlined />} />
		<Button type="primary" shape="round" onClick={calcRoute}>Построить маршрут</Button>
	</div>
}

export default RoutePanel