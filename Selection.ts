import { Direction } from "./Direction"
export interface Selection {
	start: number
	end: number
	direction?: Direction
}
