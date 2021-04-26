import { Alpha2 } from "isoly/dist/CountryCode"
import { Converter } from "../Converter"
import { Formatter } from "../Formatter"
import { Settings } from "../Settings"
import { State } from "../State"
import { StateEditor } from "../StateEditor"
import { add } from "./base"
import { phonePrefix } from "./phonePrefix"

class Handler implements Converter<string>, Formatter {
	constructor(readonly country: Alpha2 | undefined) {}
	toString(data: string | any): string {
		return typeof data == "string" ? data : ""
	}
	fromString(value: string): string | undefined {
		return typeof value == "string" ? value : undefined
	}
	format(unformated: StateEditor): Readonly<State> & Settings {
		this.country ? console.log(this.country) : console.log("Phone converter has no country")
		let result = unformated
		if (result.value.startsWith("+")) {
			for (const country of phonePrefix)
				if (result.value.startsWith(country.countryCode))
					for (let prefix of country.areaCodes) {
						prefix = prefix.substring(1)
						if (result.value.startsWith(country.countryCode + prefix) && !result.value.includes("-"))
							result = result
								.insert(country.countryCode.length, "-")
								.insert(country.countryCode.length + 1 + prefix.length, "-")
					}
		} else {
			const first = phonePrefix[0] // TODO: Decide how default country should be chosen.
			for (const prefix of first.areaCodes)
				if (result.value.startsWith(prefix) && !result.value.includes("-")) {
					result = result.insert(prefix.length, "-")
					result = result.delete(0)
					result = result.insert(0, "-").insert(0, first.countryCode)
				}
		}
		if (result.value.includes("-")) {
			const digitIndex = result.value.indexOf("-", result.value.indexOf("-") + 1) + 1
			const digitCount = result.value.substring(digitIndex, result.value.length + 1).length
			switch (digitCount) {
				case 4:
					result = result.insert(digitIndex + 2, " ")
					break
				case 5:
					result = result.insert(digitIndex + 3, " ")
					break
				case 6:
					result = result.insert(digitIndex + 2, " ")
					result = result.insert(digitIndex + 5, " ")
					break
				case 7:
					result = result.insert(digitIndex + 3, " ")
					result = result.insert(digitIndex + 6, " ")
					break
				case 8:
				case 9:
					result = result.insert(digitIndex + 3, " ")
					result = result.insert(digitIndex + 7, " ")
					break
				default:
					break
			}
			if (digitCount > 9) {
				const spaces = Math.ceil(digitCount / 3) - 1
				if (spaces > 0) {
					for (let i = 0; i < spaces; i++) {
						const position = i * 3 + 3 + i
						result = result.insert(position + digitIndex, " ")
					}
				}
			}
		}
		return { ...result, type: "text", autocomplete: "tel" }
	}
	unformat(formated: StateEditor): Readonly<State> {
		return formated.delete(" ").delete("-")
	}
	allowed(symbol: string, state: Readonly<State>): boolean {
		return (
			(symbol >= "0" && symbol <= "9") || (state.selection.start == 0 && symbol == "+" && !state.value.includes("+"))
		)
	}
}
add("phone", (argument?: any[]) => new Handler(argument && argument.length > 0 ? argument[0] : undefined))
