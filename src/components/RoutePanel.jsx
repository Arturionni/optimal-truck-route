import React, { useState, useEffect } from 'react'
import { Button } from 'antd';
import { AutoComplete, Input } from 'antd';
import { Field, reduxForm } from "redux-form";
import { AInputNumber } from '../combineAnt';
import { useSelector } from 'react-redux'

const { Option } = AutoComplete;

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

const RoutePanel = ({ handleSubmit, factory, change }) => {
	const [suggestions, setSuggestions] = useState([]);
	const [suggestions2, setSuggestions2] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchTerm2, setSearchTerm2] = useState('');
	const count = useSelector(state => state.main.polylineLayer)
	const roadSettings = useSelector(state => state.form.roadSettings)
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const debouncedSearchTerm2 = useDebounce(searchTerm2, 500);

	const submit = (data) => {
		factory.startRouting({...data, roadSettings: roadSettings.values })
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
	
	const clearAll = (e) => {
		e.preventDefault()
		factory.clear()
	}

	useEffect(() => {
		if (debouncedSearchTerm.length > 1) {
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
		}
	}, [debouncedSearchTerm])

	useEffect(() => {
		if (debouncedSearchTerm2.length > 1) {
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
		}
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
		<Input placeholder='Гос. номер' />
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
				<Field name="limitedWeight" component={AInputNumber} min={1} />
			</div>
			<div className="route_panel_settings_item">
				<div className="route_panel_settings_item_text">Максимальная нагрузка на ось, т</div>
				<Field name="weightPerAxle" component={AInputNumber} min={1} />
			</div>
		</div>
		{
			count > 0 ?
			<Button type="primary" htmlType="reset" shape="round" onClick={clearAll}>Очистить маршрут</Button> :
			<Button type="primary" htmlType="submit" shape="round">Построить маршрут</Button>
		}
	</form>
}

export default reduxForm({ form: 'routePanel' })(RoutePanel)