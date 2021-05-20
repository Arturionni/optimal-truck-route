import React, { useEffect } from 'react'
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { switchEnums as enums } from '../enums'
import { ASwitch } from '../combineAnt';
import { Field, reduxForm, getFormValues } from 'redux-form';
import { useSelector } from 'react-redux';

const SwitchComponent = ({ children, color }) => {
	return <div className="space_panel_area_switch">
		<Field 
			component={ASwitch}
			name={color.code}
			checkedChildren={<CheckOutlined />} 
			unCheckedChildren={<CloseOutlined />} 
			className={`switch ${color.name}`} 
		/>
		<div>{children}</div>
	</div>
}

const RoadSettings = ({ factory }) => {
	const formValues = useSelector((state) => getFormValues('roadSettings')(state))

	useEffect(() => {
		if (formValues) {
			Object.entries(formValues).forEach(a => {
				factory.setRoadVisibility(a[0], eval(a[1]));
			})
		}
	}, [formValues])

	return <div className="space_panel_area">
		<SwitchComponent color={enums.red}>Убитая дорога</SwitchComponent>
		<SwitchComponent color={enums.orange}>Ямочный ремонт</SwitchComponent>
		<SwitchComponent color={enums.green}>Отремонтировано</SwitchComponent>
		<SwitchComponent color={enums.lilac}>Локальный дефект</SwitchComponent>
		<SwitchComponent color={enums.burgundy}>Очаг аварийности</SwitchComponent>
		<SwitchComponent color={enums.yellow}>В планах ремонта</SwitchComponent>
		<SwitchComponent color={enums.pink}>Дороги по БКАД</SwitchComponent>
	</div>
}

export default reduxForm({ 
	form: 'roadSettings',
	initialValues: {
		[enums.red.code]: 'false',
		[enums.orange.code]: 'false',
		[enums.green.code]: 'false',
		[enums.lilac.code]: 'false',
		[enums.burgundy.code]: 'false',
		[enums.yellow.code]: 'false',
		[enums.pink.code]: 'false',
	}
 })(RoadSettings)
