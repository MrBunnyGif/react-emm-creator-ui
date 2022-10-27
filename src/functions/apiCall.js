import axios from "axios";
import joinUrlPath from "./joinUrlPath";
import errorNotification from "./errorNotification";

class apiCall {
	async handleCall(call) {
		return await call
			.then(res => res)
			.catch(err => {
				const errorData = {
					error: true,
					errorTitle: err?.response?.data?.error,
					message: err?.response?.data?.message
				}

				if (!err.response) {
					errorNotification('Servidor indisponível', 'Não foi possível finalizar o processo de comunicação com o servidor. Por favor tente novamente mais tarde')
					return errorData
				}
				else {
					if (errorData.errorTitle)
						errorNotification(errorData.errorTitle, errorData.message)
					else
						errorNotification('Erro no servidor', 'Ocorreu um erro internamente no servidor, por favor entre em contato com o suporte')
					return errorData
				}
			})
	}

	async post(url, data, isMultiPart) {
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		}

		return await this.handleCall(axios.post(joinUrlPath(url), data), isMultiPart && config)
	}

	async get(url) {
		return await this.handleCall(axios.get(joinUrlPath(url)))
	}
}

export default new apiCall()