import { Country } from "react-native-country-picker-modal";

export const getCountryName = (country: Country) => {
  if (typeof country.name === "string") {
    return country.name;
  }

  return country.name.common;
};
