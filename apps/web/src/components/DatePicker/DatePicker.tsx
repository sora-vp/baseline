import React, { type HTMLAttributes } from "react";
import { useColorMode } from "@chakra-ui/react";
import ReactDatePicker, { type ReactDatePickerProps } from "react-datepicker";

type Props = {
  selectedDate: Date | null;
  customStyles?: React.CSSProperties;
};

export const DatePicker = ({
  selectedDate,
  onChange,
  customStyles,
  ...props
}: Props & ReactDatePickerProps & HTMLAttributes<HTMLElement>) => {
  const isLight = useColorMode().colorMode === "light";

  return (
    <div
      className={isLight ? "light-theme" : "dark-theme"}
      style={customStyles}
    >
      <ReactDatePicker
        selected={selectedDate}
        onChange={onChange}
        className="react-datapicker__input-text"
        showTimeSelect
        dateFormat="MM/dd/yyyy h:mm aa"
        {...props}
      />
    </div>
  );
};
