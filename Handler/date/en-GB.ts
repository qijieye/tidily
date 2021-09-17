import * as isoly from "isoly"
import { Converter } from "../../Converter"
import { Formatter } from "../../Formatter"
import { Settings } from "../../Settings"
import { State } from "../../State"
import { StateEditor } from "../../StateEditor"

export class Handler implements Converter<string>, Formatter {
	toString(data: isoly.Date | any): string {
		return typeof data == "string" ? (isoly.Date.is(data) ? isoly.Date.localize(data) : data) : ""
	}
	fromString(value: string): isoly.Date | undefined {
		return undefined
	}
	format(unformated: StateEditor): Readonly<State> & Settings {
		return {
			...formatDate(unformated),
			type: "text",
			length: [0, 10],
			pattern: /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/,
		}
	}
	unformat(formated: StateEditor): Readonly<State> {
		return formated
	}
	allowed(symbol: string, state: Readonly<State>): boolean {
		return state.value.length < 10 && ((symbol >= "0" && symbol <= "9") || symbol == "-")
	}
}

export function formatDate(unformated: StateEditor): StateEditor {
	let result = unformated
	if (result.match(/^\d{5}$/))
		result = result.insert(4, "-")
	if (result.match(/^\d{4}-[2-9]$/))
		result = result.insert(5, "0")
	if (result.match(/^\d{4}-1[3-9]$/))
		result = result.replace(6, 7, "2")
	if (result.match(/^\d{4}-(0[1-9]|1[012])\d$/))
		result = result.insert(7, "-")
	if (result.match(/^\d{4}-(0[1-9]|1[012])-[4-9]$/))
		result = result.insert(8, "0")
	if (result.match(/^\d{4}-(0[1-9]|1[012])-(2[89]|[3-9][0-9])$/) && !validDate(result.value))
		result = result.replace(
			0,
			10,
			validDate(result.value.substring(0, 8) + "31")
				? result.value.substring(0, 8) + "31"
				: validDate(result.value.substring(0, 8) + "30")
				? result.value.substring(0, 8) + "30"
				: validDate(result.value.substring(0, 8) + "29")
				? result.value.substring(0, 8) + "29"
				: validDate(result.value.substring(0, 8) + "28")
				? result.value.substring(0, 8) + "28"
				: result.value
		)
	return result
}

function validDate(date: string): boolean {
	const year =
		date.length >= 10 && date.substring(0, 4).match(/^\d{4}$/) ? Number.parseInt(date.substring(0, 4)) : undefined
	const month =
		date.length >= 10 && date.substring(5, 7).match(/^(0[1-9]|1[012])$/)
			? Number.parseInt(date.substring(5, 7))
			: undefined
	const day =
		date.length >= 10 && date.substring(8, 10).match(/^(0[1-9]|[12][0-9]|3[01])$/)
			? Number.parseInt(date.substring(8, 10))
			: undefined
	return year && month && day ? day > 0 && daysPerMonth(year, month) >= day : false
}

function daysPerMonth(year: number, month: number): 28 | 29 | 30 | 31 {
	let result: 28 | 29 | 30 | 31
	switch (month) {
		case 1:
		case 3:
		case 5:
		case 7:
		case 8:
		case 10:
		case 12:
		default:
			result = 31
			break
		case 4:
		case 6:
		case 9:
		case 11:
			result = 30
			break
		case 2:
			result = year % 4 == 0 ? 29 : 28
			break
	}
	return result
}
