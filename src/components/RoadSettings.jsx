import React from 'react'
import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { switchEnums as enums } from '../enums'

const SwitchComponent = ({ children, color = '', onChange = () => { } }) => {
	return <div className="space_panel_area_switch">
		<Switch 
			checkedChildren={<CheckOutlined />} 
			unCheckedChildren={<CloseOutlined />} 
			className={`switch ${color}`} 
			onChange={onChange} 
		/>
		<div>{children}</div>
	</div>
}

const RoadSettings = () => {
	const switchChange = (color) => (status) => {
		console.log(status, color)
	}

	return <div className="space_panel_area">
		<SwitchComponent onChange={switchChange(enums.red)} color={enums.red}>Убитая дорога</SwitchComponent>
		<SwitchComponent onChange={switchChange(enums.orange)} color={enums.orange}>Ямочный ремонт</SwitchComponent>
		<SwitchComponent onChange={switchChange(enums.green)} color={enums.green}>Отремонтировано</SwitchComponent>
		<SwitchComponent onChange={switchChange(enums.lilac)} color={enums.lilac}>Локальный дефект</SwitchComponent>
		<SwitchComponent onChange={switchChange(enums.burgundy)} color={enums.burgundy}>Очаг аварийности</SwitchComponent>
		<SwitchComponent onChange={switchChange(enums.yellow)} color={enums.yellow}>В планах ремонта</SwitchComponent>
		<SwitchComponent onChange={switchChange(enums.pink)} color={enums.pink}>Дороги по БКАД</SwitchComponent>
	</div>
}

export default RoadSettings