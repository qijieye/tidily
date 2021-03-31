import { Formatter } from "./Formatter"
import { Settings } from "./Settings"
import { State } from "./State"
import { StateEditor } from "./StateEditor"

export interface Action {
	key: string
	repeat?: boolean
	ctrlKey?: boolean
	shiftKey?: boolean
	altKey?: boolean
	metaKey?: boolean
}
export namespace Action {
	export function apply(
		formatter: Formatter,
		state: Readonly<State>,
		action?: Action
	): Readonly<State> & Readonly<Settings> {
		const result = State.copy(formatter.unformat(StateEditor.copy(state)))

		const hasSelection = result.selection.start != result.selection.end
		const cursor: "start" | "end" = !hasSelection ? "start" : result.selection.direction == "backward" ? "start" : "end"
		const other: "start" | "end" = cursor == "start" ? "end" : "start"
		let cursorPos: number = result.selection[cursor]
		let otherPos: number = result.selection[other]

		if (action) {
			if (action.key == "ArrowLeft") {
				if (hasSelection) {
					cursorPos = !action.shiftKey ? result.selection.start : cursorPos > 0 ? cursorPos - 1 : 0
					otherPos = !action.shiftKey ? cursorPos : otherPos
				} else {
					cursorPos -= cursorPos > 0 ? 1 : 0
					otherPos = !action.shiftKey ? cursorPos : otherPos
				}
				result.selection.direction = otherPos < cursorPos ? "forward" : otherPos > cursorPos ? "backward" : "none"
				result.selection.start = Math.min(otherPos, cursorPos)
				result.selection.end = Math.max(otherPos, cursorPos)
			} else if (action.key == "ArrowRight") {
				if (hasSelection) {
					cursorPos = !action.shiftKey
						? result.selection.end
						: cursorPos < result.value.length
						? cursorPos + 1
						: result.value.length
					otherPos = action.shiftKey ? otherPos : cursorPos
				} else {
					cursorPos += cursorPos < result.value.length ? 1 : 0
					otherPos = action.shiftKey ? otherPos : cursorPos
				}
				result.selection.direction = otherPos < cursorPos ? "forward" : otherPos > cursorPos ? "backward" : "none"
				result.selection.start = Math.min(otherPos, cursorPos)
				result.selection.end = Math.max(otherPos, cursorPos)
			} else if (action.key == "Home") {
				cursorPos = 0
				otherPos = !action.shiftKey ? cursorPos : otherPos
				result.selection.direction = "backward"
				result.selection.start = Math.min(otherPos, cursorPos)
				result.selection.end = Math.max(otherPos, cursorPos)
			} else if (action.key == "End") {
				cursorPos = result.value.length
				otherPos = !action.shiftKey ? cursorPos : otherPos
				result.selection.direction = "forward"
				result.selection.start = Math.min(otherPos, cursorPos)
				result.selection.end = Math.max(otherPos, cursorPos)
			} else if (action.ctrlKey) {
				switch (action.key) {
					case "a":
						result.selection.start = 0
						result.selection.end = result.value.length
						result.selection.direction = "forward"
				}
			} else {
				if (result.selection.start != result.selection.end) {
					// selection exists
					switch (action.key) {
						case "Delete":
						case "Backspace":
							action = undefined
							break
						default:
							break
					}
					result.value =
						result.value.substring(0, result.selection.start) + result.value.substring(result.selection.end)
					result.selection.end = result.selection.start
				}
				if (action)
					switch (action.key) {
						case "Unidentified":
							break
						case "Backspace":
							if (result.selection.start > 0) {
								result.value =
									result.value.substring(0, result.selection.start - 1) + result.value.substring(result.selection.start)
								result.selection.start = --result.selection.end
							}
							break
						case "Delete":
							if (result.selection.start < result.value.length)
								result.value =
									result.value.substring(0, result.selection.start) + result.value.substring(result.selection.start + 1)
							break
						default:
							if (formatter.allowed(action.key, result)) {
								result.value =
									result.value.substring(0, result.selection.start) +
									action.key +
									result.value.substring(result.selection.start)
								result.selection.start = result.selection.end += action.key.length
							}
					}
			}
		}
		return formatter.format(StateEditor.copy(result))
	}
}
