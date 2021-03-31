import { Action } from "../Action"
import { Formatter } from "../Formatter"
import { get } from "./index"

describe("text", () => {
	const handler = get("text") as Formatter
	it("Enter character", () => {
		const result = Action.apply(handler, { value: "", selection: { start: 0, end: 0 } }, { key: "a" })
		expect(result).toMatchObject({ value: "a", selection: { start: 1, end: 1 } })
	})
	it("Move left", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10 } },
			{ key: "ArrowLeft" }
		)
		expect(result).toMatchObject({ value: "This is a sentence", selection: { start: 9, end: 9 } })
	})
	it("Shift Move Left", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10, direction: "backward" } },
			{ key: "ArrowLeft", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 9, end: 10, direction: "backward" },
		})
	})
	it("Shift Move Left with Selection", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 11, direction: "backward" } },
			{ key: "ArrowLeft", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 9, end: 11, direction: "backward" },
		})
	})
	it("Move Right", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10 } },
			{ key: "ArrowRight" }
		)
		expect(result).toMatchObject({ value: "This is a sentence", selection: { start: 11, end: 11 } })
	})
	it("Shift Move Right", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10 } },
			{ key: "ArrowRight", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 10, end: 11, direction: "forward" },
		})
	})
	it("Shift Move Right with Selection", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 11, direction: "forward" } },
			{ key: "ArrowRight", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 10, end: 12, direction: "forward" },
		})
	})
	it("Home", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10, direction: "forward" } },
			{ key: "Home" }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 0, end: 0 },
		})
	})
	it("Shift Home", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10, direction: "forward" } },
			{ key: "Home", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 0, end: 10, direction: "backward" },
		})
	})
	it("Shift Home with selection", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 15, direction: "forward" } },
			{ key: "Home", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 0, end: 10, direction: "backward" },
		})
	})
	it("End", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10, direction: "forward" } },
			{ key: "End" }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 18, end: 18 },
		})
	})
	it("Shift End", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 10, direction: "forward" } },
			{ key: "End", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 10, end: 18, direction: "forward" },
		})
	})
	it("Shift End with selection", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 10, end: 15, direction: "backward" } },
			{ key: "End", shiftKey: true }
		)
		expect(result).toMatchObject({
			value: "This is a sentence",
			selection: { start: 15, end: 18, direction: "forward" },
		})
	})
	it("Backspace", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 4, end: 4 } },
			{ key: "Backspace" }
		)
		expect(result).toMatchObject({
			value: "Thi is a sentence",
			selection: { start: 3, end: 3 },
		})
	})
	it("Backspace with selection", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 4, end: 9, direction: "backward" } },
			{ key: "Backspace" }
		)
		expect(result).toMatchObject({
			value: "This sentence",
			selection: { start: 4, end: 4 },
		})
	})
	it("Delete", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 4, end: 4, direction: "backward" } },
			{ key: "Delete" }
		)
		expect(result).toMatchObject({
			value: "Thisis a sentence",
			selection: { start: 4, end: 4 },
		})
	})
	it("Delete with selection", () => {
		const result = Action.apply(
			handler,
			{ value: "This is a sentence", selection: { start: 4, end: 9, direction: "backward" } },
			{ key: "Delete" }
		)
		expect(result).toMatchObject({
			value: "This sentence",
			selection: { start: 4, end: 4 },
		})
	})
})
