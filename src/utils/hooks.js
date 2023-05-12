import { debounce } from "./common";

export function useDebounce(fn, delay) {
	return debounce(fn, delay);
}
