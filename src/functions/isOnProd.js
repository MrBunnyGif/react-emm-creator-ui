export default () => {
	const isLocalHost = window.location.href.includes('localhost')
	const isHomolog = window.location.href.includes('homolog')
	const isIP = window.location.href.includes('192.')

	return !isLocalHost && !isHomolog && !isIP
}