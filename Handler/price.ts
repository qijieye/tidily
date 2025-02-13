import * as isoly from "isoly"
import { Converter } from "../Converter"
import { Formatter } from "../Formatter"
import { Settings } from "../Settings"
import { State } from "../State"
import { StateEditor } from "../StateEditor"
import { add } from "./base"

class Handler implements Converter<number>, Formatter {
	constructor(readonly currency: isoly.Currency | undefined) {}
	toString(data: number | any): string {
		return typeof data == "number" ? (isNaN(data) ? "" : data.toString()) : ""
	}
	fromString(value: string): number | undefined {
		const result = typeof value == "string" ? Number.parseFloat(value) : undefined
		return result != undefined && !isNaN(result) ? result : undefined
	}
	format(unformated: StateEditor): Readonly<State> & Settings {
		let separator = unformated.value && unformated.value.includes(".") ? unformated.value.indexOf(".") : undefined
		let result =
			unformated.value == "NaN" ? unformated.replace(0, unformated.value.length, "") : StateEditor.copy(unformated)
		if (separator == 0) {
			result = result.prepend("0")
			separator++
		}
		if (separator != undefined) {
			const adjust =
				separator +
				1 +
				(!this.currency || isoly.Currency.decimalDigits(this.currency) == undefined
					? 2
					: isoly.Currency.decimalDigits(this.currency) ?? 2) -
				result.value.length
			result = adjust < 0 ? result.truncate(result.value.length + adjust) : result.suffix("0".repeat(adjust))
		} else
			separator = result.value.length
		const spaces = separator <= 0 ? 0 : Math.ceil(separator / 3) - 1
		for (let i = 0; i < spaces; i++) {
			const position = separator - (spaces - i) * 3
			result = result.insert(position, " ")
			separator++
		}
		if (result.match(/^[0\s]{2,}$/))
			result = result.replace(0, result.value.length, "0")
		else if (result.match(/^[0\s]{2,}(\s\w{3}){1}$/))
			result = result.replace(0, result.value.length - 4, "0")
		result =
			this.currency && (result.value.length > 1 || (result.value.length == 1 && result.value.charAt(0) != "."))
				? result.suffix(" " + this.currency)
				: result
		return {
			...result,
			type: "text",
			length: [3, undefined],
			pattern: new RegExp("^(\\d{0,3})( \\d{3})*(\\.\\d+)?" + (this.currency ? " " + this.currency : "") + "$"),
		}
	}
	unformat(formated: StateEditor): Readonly<State> {
		return this.currency ? formated.delete(" ").delete("" + this.currency) : formated.delete(" ")
	}
	allowed(symbol: string, state: Readonly<State>): boolean {
		return (symbol >= "0" && symbol <= "9") || (symbol == "." && !state.value.includes("."))
	}
}
add("price", (argument?: any[]) => new Handler(argument && argument.length > 0 ? argument[0] : undefined))
