import React, { useState } from "react";
import Select from 'react-select';

function formatTag(options) {
    return options.map(option => ({
        value: option.tag,
        label: option.tag
    }))
}

export function TagsInput(props) {
    const [selectedOption, setSelectedOption] = useState(props.selectedOption || []);
    const options = formatTag(props.options || []);

    function handleChange(selectedOption) {
        const { field: { name }, form: { setFieldValue } } = props;
        setSelectedOption(selectedOption || []);
        setFieldValue(name, selectedOption || [])
    };

    return (
        <Select
            isMulti
            name={props.name}
            value={selectedOption}
            onChange={handleChange}
            options={options}
        />
    )
}

