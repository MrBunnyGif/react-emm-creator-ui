import isOnProd from "../functions/isOnProd";
const endpoint = isOnProd() ?
	'https://api.mail-generator.promosatelie.com.br'
	:
	'http://localhost:5000';

export default endpoint