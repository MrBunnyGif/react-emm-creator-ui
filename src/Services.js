import apiCall from './functions/apiCall';

class Services {
	async getClients() {
		return await apiCall.get(['clients'])
	}

	async getSubClients(client) {
		return await apiCall.get(['sub-clients', client])
	}

	async getCampaigns(client, subClinent) {
		return await apiCall.get(['campaigns', client, subClinent])
	}

	async generateEmm(file, isMultiPart = true) {
		return await apiCall.post([''], file, isMultiPart)
	}

	async submitInfoForm(info, isMultiPart) {
		return await apiCall.post(['newproject'], info, isMultiPart)
	}

	async getAsset(file, isMultiPart = true) {
		return await apiCall.post(['upload-asset'], file, isMultiPart)
	}

	async saveFinaleFile(file, isMultiPart) {
		return await apiCall.post(['save-file'], file, isMultiPart)
	}

	async downloadFile(path, isMultiPart) {
		return await apiCall.post(['download-file'], { path })
	}

	async uploadSingleFile(file, isMultiPart = true) {
		return await apiCall.post(['single-file-upload'], file, isMultiPart)
	}
}

export default new Services();