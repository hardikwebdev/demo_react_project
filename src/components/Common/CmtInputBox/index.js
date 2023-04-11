import React from "react";
import { TextField } from "@material-ui/core";
import clsx from "clsx";
import PropTypes from "prop-types";

function CmtInputBox(props) {
  const {
    label,
    inputLabel,
    name,
    SelectProps,
    isRequired,
    helperText,
    select,
    children,
    error,
    placeholder,
    values,
    handleChange,
    handleBlur,
    className,
    multiline,
    minRows,
    inputProps,
    style,
    type,
    disabled,
  } = props;

  return (
    <>
      <TextField
        autoComplete="password"
        label={label ? label : inputLabel}
        multiline={multiline}
        select={select}
        minRows={minRows}
        InputProps={inputProps}
        SelectProps={SelectProps}
        name={name}
        required={isRequired}
        helperText={helperText}
        error={error}
        placeholder={placeholder}
        fullWidth
        size="small"
        type={type ? type : "text"}
        value={values}
        onChange={handleChange}
        onBlur={handleBlur}
        InputLabelProps={{
          className: "text-sm font-medium flex text-gray-500",
        }}
        className={clsx("mt-2 cus-auth-input", className)}
        margin="normal"
        variant="outlined"
        disabled={disabled}
      >
        {children}
      </TextField>
    </>
  );
}

CmtInputBox.defaultProps = {
  multiline: false,
  select: false,
  isRequired: false,
};
CmtInputBox.prototype = {
  label: PropTypes.string,
  inputLabel: PropTypes.string,
  handleChange: PropTypes.func,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.object,
};

export default CmtInputBox;
