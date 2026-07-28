import { parsePhoneNumberFromString } from "libphonenumber-js";
import { CountryCode as PickerCountryCode } from "react-native-country-picker-modal";
import { CountryCode as PhoneCountryCode } from "libphonenumber-js";

export const normalizePhoneNumber = (
  phone: string,
  countryCode: PickerCountryCode
) => {
  const parsed = parsePhoneNumberFromString(
    phone.trim(),
    countryCode as PhoneCountryCode
  );

  if (!parsed || !parsed.isValid()) {
    return null;
  }

  return parsed.number;
};
