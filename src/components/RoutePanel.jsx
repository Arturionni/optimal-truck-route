import React, { useState, useEffect } from 'react'
import { Input, Button } from 'antd';
import { TreeSelect, AutoComplete } from 'antd';
import { Field, reduxForm } from "redux-form";
import { AInput, AInputNumber, ATreeSelect } from '../combineAnt';

const { Option } = AutoComplete;

const { TreeNode } = TreeSelect;

const useDebounce = (value, delay) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(
		() => {
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);

			return () => {
				clearTimeout(handler);
			};
		},
		[value]
	);

	return debouncedValue;
}

const options = [
	{ label: 'Взрывной', value: 'explosive' },
	{ label: 'Органический', value: 'organic' },
	{ label: 'Ядовитый', value: 'poisonousInh' },
	{ label: 'Газ', value: 'gas' },
	{ label: 'Яд', value: 'poison' },
	{ label: 'Вред от воды', value: 'waterHarm' },
	{ label: 'Легковоспламеняющийся', value: 'flammable' },
	{ label: 'Радиоактивный', value: 'radioActive' },
	{ label: 'Горючий', value: 'combustible' },
	{ label: 'Разъедающий', value: 'corrosive' },
	{ label: 'Другие', value: 'other' },
];

const RoutePanel = ({ handleSubmit, factory, change }) => {
	const [suggestions, setSuggestions] = useState([]);
	const [suggestions2, setSuggestions2] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchTerm2, setSearchTerm2] = useState('');
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const debouncedSearchTerm2 = useDebounce(searchTerm2, 500);

	const submit = (data) => {
		factory.startRouting(data)
	}

	const onFromSelect = (data) => {
		change('from', data)
	}

	const handleSearchFrom = (searchText) => {
		setSearchTerm(searchText)
	}

	const onToSelect = (data) => {
		change('to', data)
	}

	const handleSearchTo = (searchText) => {
		setSearchTerm2(searchText)
	}

	useEffect(() => {
		setSuggestions([])
		factory.geocoder.search({ searchText: debouncedSearchTerm }, (result) => {
			if (result.Response.View.length > 0 && result.Response.View[0].Result[0].Location != null) {
				setSuggestions(result.Response.View[0].Result.map((el, i) => ({
					i,
					label: el.Location.Address.Label,
					coords: el.Location.DisplayPosition,
				})))
				return;
			}
			setSuggestions([])
		})
	}, [debouncedSearchTerm])

	useEffect(() => {
		setSuggestions2([])
		factory.geocoder.search({ searchText: debouncedSearchTerm2 }, (result) => {
			if (result.Response.View.length > 0 && result.Response.View[0].Result[0].Location != null) {
				setSuggestions2(result.Response.View[0].Result.map((el, i) => ({
					i,
					label: el.Location.Address.Label,
					coords: el.Location.DisplayPosition,
				})))
				return;
			}
			setSuggestions2([])
		})
	}, [debouncedSearchTerm2])

	return <form onSubmit={handleSubmit(submit)} className="space_panel_area">
		<AutoComplete
			placeholder="Откуда"
			dropdownMatchSelectWidth={272}
			allowClear
			onSelect={onFromSelect}
			onSearch={handleSearchFrom}
		>
			{suggestions && suggestions.map((item) => <Option key={item.i} value={item.label}>{item.label}</Option>)}
		</AutoComplete>
		<AutoComplete
			placeholder="Куда"
			dropdownMatchSelectWidth={272}
			allowClear
			onSelect={onToSelect}
			onSearch={handleSearchTo}
		>
			{suggestions2 && suggestions2.map((item) => <Option key={item.i} value={item.label}>{item.label}</Option>)}
		</AutoComplete>
		<div className="route_panel_settings_special">
			<div className="route_panel_settings_special_text">Особый груз:</div>
			<Field
				name="special"
				className="tree_select"
				component={ATreeSelect}
				dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
				placeholder="Выберите тип груза"
				allowClear
				multiple
				treeDefaultExpandAll
			>
				{options && options.map(item => <TreeNode value={item.value} title={item.label} />)}
			</Field>
		</div>
		<div className="route_panel_settings">
			<div className="route_panel_settings_item">
				<div className="route_panel_settings_item_text">Длина, м</div>
				<Field name="length" component={AInputNumber} min={1} />
			</div>
			<div className="route_panel_settings_item">
				<div className="route_panel_settings_item_text">Высота, м</div>
				<Field name="height" component={AInputNumber} min={1} />
			</div>
			<div className="route_panel_settings_item">
				<div className="route_panel_settings_item_text">Ширина, м</div>
				<Field name="width" component={AInputNumber} min={1} />
			</div>
			<div className="route_panel_settings_item">
				<div className="route_panel_settings_item_text">Фактическая масса, т</div>
				<Field name="weight" component={AInputNumber} min={1} />
			</div>
			<div className="route_panel_settings_item">
				<div className="route_panel_settings_item_text">Максимальная нагрузка на ось, т</div>
				<Field name="weightPerAxel" component={AInputNumber} min={1} />
			</div>
		</div>
		<Button type="primary" htmlType="submit" shape="round">Построить маршрут</Button>
	</form>
}

export default reduxForm({ form: 'routePanel' })(RoutePanel)