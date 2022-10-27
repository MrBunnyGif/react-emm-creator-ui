import { notification } from 'antd';


export default (title = '', message = '') => {
	notification.error({
		message: title,
		description:
			message
	});
};