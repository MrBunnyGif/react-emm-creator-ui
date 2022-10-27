import apiUrl from "../constants/apiUrls"

export default array => {
	let newArray = [apiUrl, ...array]
	return newArray.join('/')
}