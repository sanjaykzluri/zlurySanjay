export function mapValueToKeyState(setState, value, state = null, key = null) {
    if (typeof state === 'object' && state !== null)
        setState({ ...state, [key]: value })
    else
        setState(value)
}